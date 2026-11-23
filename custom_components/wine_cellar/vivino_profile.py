"""Vivino "profile" of a bottle: drinking window, taste, flavours, style,
awards and critic reviews — what the Vivino app shows on a wine's page.

The data comes from public api.vivino.com endpoints (see
``VivinoClient.get_vivino_profile``) and is applied in one place,
``async_apply_vivino_profile``, so every path agrees on the rules:

- Taste, flavours, style, awards and critics are Vivino's own data, stored
  in ``vivino_*`` fields and simply replaced on each refresh.
- The drinking window (``drink_window``, ``drink_by`` and the derived
  ``disposition``) is shared with the AI and with the user, so it carries
  ``drink_window_source``: Vivino fills it when it is empty, replaces an AI
  estimate (Vivino's is per-vintage and community-based), and never touches
  a window or disposition the user set by hand ("user").
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PROFILE_FIELDS = ("vivino_taste", "vivino_flavors", "vivino_style", "vivino_awards", "vivino_critics")
# Wines refreshed per background pass after a sync (sequential, gentle).
BACKFILL_LIMIT = 80
BACKFILL_PAUSE = 0.3


def _disposition_for(drink_from: int | None, drink_by: str | None) -> str:
    """Cork Dork's D (drink now) / H (hold) / P (past peak) from a window."""
    try:
        end = int(drink_by or 0)
    except ValueError:
        return ""
    if not end:
        return ""
    year = datetime.now().year
    if drink_from and year < drink_from:
        return "H"
    if year > end:
        return "P"
    return "D"


def window_is_replaceable(wine: dict[str, Any]) -> bool:
    """May Vivino's drinking window replace the one this wine has?"""
    source = wine.get("drink_window_source")
    if source == "user":
        return False
    if source in ("ai", "vivino"):
        return True
    # Older bottles carry no source. An empty window is free; a filled one
    # is taken as the AI's when the AI has run on this bottle, otherwise it
    # may have been typed in, so it is kept.
    if not wine.get("drink_window") and not wine.get("drink_by"):
        return True
    return bool(wine.get("ai_updated_at"))


def build_profile_updates(wine: dict[str, Any], profile: dict[str, Any]) -> dict[str, Any]:
    """The wine updates a fetched profile implies (pure, for testing)."""
    updates: dict[str, Any] = {key: profile.get(key) or ([] if key in ("vivino_flavors", "vivino_awards", "vivino_critics") else None)
                               for key in PROFILE_FIELDS}
    updates = {k: v for k, v in updates.items() if v is not None}
    if profile.get("drink_window") and window_is_replaceable(wine):
        updates["drink_window"] = profile["drink_window"]
        updates["drink_by"] = profile["drink_by"]
        updates["drink_window_source"] = "vivino"
        disposition = _disposition_for(profile.get("drink_from"), profile.get("drink_by"))
        if disposition:
            updates["disposition"] = disposition
    updates["vivino_profile_at"] = datetime.now(timezone.utc).isoformat()
    return updates


async def _resolve_profile(vivino: Any, wine: dict[str, Any], language: str) -> dict[str, Any] | None:
    """Fetch the profile for this bottle's Vivino id, whichever kind it is.

    ``vivino_id`` is a vintage id for account-synced or label-scanned
    bottles and a wine id for search-matched ones (the id spaces overlap),
    so the id is tried as a vintage first and kept only if it is this wine;
    otherwise it is read as a wine id and the vintage of this bottle's year
    is looked up.
    """
    from .websocket import _vivino_match_is_trustworthy

    vid = wine.get("vivino_id")
    if not vid:
        return None
    profile = await vivino.get_vivino_profile(vid, language)
    if profile and _vivino_match_is_trustworthy(wine, profile):
        return profile
    vintage_id = await vivino.find_vintage_id(vid, wine.get("vintage"))
    if vintage_id and str(vintage_id) != str(vid):
        profile = await vivino.get_vivino_profile(vintage_id, language)
        if profile and _vivino_match_is_trustworthy(wine, profile):
            return profile
    return None


async def async_apply_vivino_profile(hass: HomeAssistant, wine_id: str, *, save: bool = True) -> bool:
    """Fetch and apply the Vivino profile of one bottle. True if it changed."""
    from .websocket import _get_metadata_language

    domain_data = hass.data.get(DOMAIN) or {}
    storage = domain_data.get("storage")
    vivino = domain_data.get("vivino")
    wine = storage.get_wine(wine_id) if storage else None
    if not wine or not vivino or not wine.get("vivino_id"):
        return False
    try:
        profile = await _resolve_profile(vivino, wine, _get_metadata_language(hass))
    except Exception as err:  # noqa: BLE001 - never break the caller's flow
        _LOGGER.debug("Vivino profile for %s failed: %s", wine_id, err)
        return False
    if not profile:
        # Remember we looked, so the backfill does not retry it every sync.
        storage.update_wine(wine_id, {"vivino_profile_at": datetime.now(timezone.utc).isoformat()})
        if save:
            await storage.async_save()
        return False
    storage.update_wine(wine_id, build_profile_updates(wine, profile))
    if save:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    return True


async def async_backfill_vivino_profiles(hass: HomeAssistant, force: bool = False) -> int:
    """Fill the profile of bottles that never got one (e.g. after a sync).

    One lookup per Vivino id (bottles of the same wine share it), sequential
    with a short pause so a large cellar does not hammer Vivino.
    """
    domain_data = hass.data.get(DOMAIN) or {}
    storage = domain_data.get("storage")
    if not storage or not domain_data.get("vivino"):
        return 0
    todo: dict[str, list[str]] = {}
    for w in storage.wines:
        if w.get("vivino_id") and (force or not w.get("vivino_profile_at")):
            todo.setdefault(str(w["vivino_id"]), []).append(w["id"])
    changed = 0
    for i, (_vid, wine_ids) in enumerate(list(todo.items())[:BACKFILL_LIMIT]):
        first, *rest = wine_ids
        if await async_apply_vivino_profile(hass, first, save=False):
            changed += 1
            src = storage.get_wine(first) or {}
            shared = {k: src.get(k) for k in (*PROFILE_FIELDS, "vivino_profile_at")}
            for other in rest:
                wine = storage.get_wine(other) or {}
                upd = dict(shared)
                if src.get("drink_window_source") == "vivino" and window_is_replaceable(wine):
                    upd.update({k: src.get(k) for k in ("drink_window", "drink_by", "drink_window_source", "disposition")})
                storage.update_wine(other, upd)
        else:
            for other in rest:
                storage.update_wine(other, {"vivino_profile_at": datetime.now(timezone.utc).isoformat()})
        if i:
            await asyncio.sleep(BACKFILL_PAUSE)
    if todo:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    _LOGGER.debug("Vivino profile backfill: %d of %d wines updated", changed, len(todo))
    return changed
