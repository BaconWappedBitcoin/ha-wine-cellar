"""Three-way reconciliation between the Vivino cellar and Cork Dork.

The sync keeps a *baseline* snapshot of the cellar as it was at the last
successful sync. Comparing that baseline against the current Vivino state and
the current Cork Dork state lets us tell which side changed a wine, so
reconciliation is deterministic instead of guesswork:

    b = baseline count      v = Vivino-now count      c = Cork-Dork-now count

    only Vivino changed   (v != b, c == b) -> make Cork Dork match Vivino
    only Cork Dork changed (c != b, v == b) -> queue a push-back to Vivino
    both changed the same  (v == c)          -> no-op, just advance baseline
    both changed, differ                     -> conflict: change nothing, flag it

Everything here is pure data (no Home Assistant imports) so it is easy to test.
Counts are per Vivino wine identity (the vintage id).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ReconcilePlan:
    """The resolved set of actions from a three-way merge."""

    # Bottles to add to Cork Dork: (vivino_id, wine_data, n)
    add: list[tuple[str, dict[str, Any], int]] = field(default_factory=list)
    # Bottles to remove from Cork Dork: (vivino_id, n)
    remove: list[tuple[str, int]] = field(default_factory=list)
    # Cork Dork -> Vivino changes to push later: (vivino_id, from_count, to_count)
    push: list[tuple[str, int, int]] = field(default_factory=list)
    # Both sides changed differently: (vivino_id, base, vivino, cork)
    conflicts: list[tuple[str, int, int, int]] = field(default_factory=list)
    # Baseline entries with no Vivino identity to act on (skipped, informational)
    unmatched: list[str] = field(default_factory=list)

    @property
    def add_count(self) -> int:
        return sum(n for _, _, n in self.add)

    @property
    def remove_count(self) -> int:
        return sum(n for _, n in self.remove)

    def summary(self) -> dict[str, int]:
        return {
            "add_bottles": self.add_count,
            "remove_bottles": self.remove_count,
            "push_wines": len(self.push),
            "conflicts": len(self.conflicts),
        }


def build_vivino_state(wines: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Index parsed Vivino wines by vivino_id -> {count, wine_data}.

    ``wines`` are the dicts returned by ``VivinoAccountClient.async_get_cellar``;
    each carries a ``vivino_id`` and an ``owned_count``. Wines without a stable
    id are dropped (they can't be reconciled by identity).
    """
    state: dict[str, dict[str, Any]] = {}
    for w in wines:
        vid = w.get("vivino_id")
        if not vid:
            continue
        count = w.get("owned_count")
        if not isinstance(count, int) or count < 0:
            count = 0
        if vid in state:
            state[vid]["count"] += count
        else:
            data = {k: v for k, v in w.items() if k not in ("owned_count", "bottle_count")}
            state[vid] = {"count": count, "wine": data}
    return state


def build_corkdork_state(stored_wines: list[dict[str, Any]]) -> dict[str, int]:
    """Count Cork Dork's Vivino-sourced bottles per vivino_id.

    Only wines that originated from a Vivino sync (``source`` starts with
    ``vivino``) are counted — manually added wines are never touched by
    reconciliation, even if they happen to carry a vivino_id.
    """
    counts: dict[str, int] = {}
    for w in stored_wines:
        vid = w.get("vivino_id")
        if not vid:
            continue
        if not str(w.get("source", "")).startswith("vivino"):
            continue
        counts[vid] = counts.get(vid, 0) + 1
    return counts


def build_baseline(vivino_state: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Make a compact, persistable baseline from a Vivino state."""
    out: dict[str, dict[str, Any]] = {}
    for vid, entry in vivino_state.items():
        w = entry.get("wine", {})
        out[vid] = {
            "count": entry.get("count", 0),
            "name": w.get("name", ""),
            "winery": w.get("winery", ""),
            "vintage": w.get("vintage"),
        }
    return out


def reconcile(
    baseline: dict[str, dict[str, Any]],
    vivino_state: dict[str, dict[str, Any]],
    corkdork_counts: dict[str, int],
) -> ReconcilePlan:
    """Three-way merge → a ReconcilePlan of concrete actions.

    - ``baseline``: {vivino_id: {count, ...}} from the last sync (may be empty
      on first run — then only additive changes are produced).
    - ``vivino_state``: {vivino_id: {count, wine}} fetched now.
    - ``corkdork_counts``: {vivino_id: count} of Vivino-sourced bottles now.
    """
    plan = ReconcilePlan()
    base_counts = {vid: e.get("count", 0) for vid, e in baseline.items()}
    all_ids = set(base_counts) | set(vivino_state) | set(corkdork_counts)

    first_sync = not baseline

    for vid in all_ids:
        b = base_counts.get(vid, 0)
        v = vivino_state.get(vid, {}).get("count", 0)
        c = corkdork_counts.get(vid, 0)

        # First sync (no baseline): this is initialization, not a set of edits.
        # Mirror Vivino into Cork Dork; never push or flag conflicts.
        if first_sync:
            if c != v:
                _emit_delta(plan, vid, vivino_state, c, v)
            continue

        v_changed = v != b
        c_changed = c != b

        if not v_changed and not c_changed:
            # In sync already; make sure Cork Dork actually holds b bottles
            # (covers a baseline that matches but local storage drifted).
            if c != v:
                _emit_delta(plan, vid, vivino_state, c, v)
            continue

        if v_changed and not c_changed:
            # Vivino is the only mover → Cork Dork should match Vivino
            _emit_delta(plan, vid, vivino_state, c, v)
            continue

        if c_changed and not v_changed:
            # Cork Dork is the only mover → push the change to Vivino
            plan.push.append((vid, v, c))
            continue

        # Both changed
        if v == c:
            # Converged to the same value independently → nothing to do
            continue
        plan.conflicts.append((vid, b, v, c))

    return plan


def _emit_delta(
    plan: ReconcilePlan,
    vid: str,
    vivino_state: dict[str, dict[str, Any]],
    have: int,
    want: int,
) -> None:
    """Queue add/remove to move Cork Dork's count from ``have`` to ``want``."""
    if want > have:
        wine = vivino_state.get(vid, {}).get("wine", {})
        plan.add.append((vid, wine, want - have))
    elif want < have:
        plan.remove.append((vid, have - want))


def is_delete_wave_suspicious(
    plan: ReconcilePlan,
    vivino_total: int,
    corkdork_total: int,
    *,
    min_absolute: int = 5,
    max_fraction: float = 0.5,
) -> bool:
    """Guard against a bad fetch wiping the cellar.

    Returns True if the plan would remove a large share of the cellar — e.g.
    Vivino came back empty/short due to an expired cookie or a partial load.
    A caller should refuse to apply removals (but may still apply adds) and
    surface the anomaly instead.
    """
    if plan.remove_count == 0:
        return False
    if vivino_total == 0 and corkdork_total > 0:
        return True
    if plan.remove_count < min_absolute:
        return False
    denom = max(corkdork_total, 1)
    return (plan.remove_count / denom) > max_fraction
