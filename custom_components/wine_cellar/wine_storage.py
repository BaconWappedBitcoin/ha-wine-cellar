"""Wine cellar data storage manager."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    BARCODE_CACHE_MAX,
    CONF_BARCODE_CACHE,
    CONF_BUY_LIST,
    CONF_CABINETS,
    CONF_SETTINGS,
    CONF_WINE_HISTORY,
    CONF_WINES,
    DEFAULT_CABINETS,
    STORAGE_KEY,
    STORAGE_VERSION,
)


class WineCellarStorage:
    """Manage wine cellar data persistence."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize storage."""
        self.loaded_from_disk = False
        self._hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {}

    @property
    def wines(self) -> list[dict[str, Any]]:
        """Return all wines."""
        return self._data.get(CONF_WINES, [])

    @property
    def cabinets(self) -> list[dict[str, Any]]:
        """Return all cabinets."""
        return self._data.get(CONF_CABINETS, [])

    @property
    def raw_data(self) -> dict[str, Any]:
        """The whole persisted blob — used to report its serialized size."""
        return self._data

    @property
    def barcode_cache(self) -> dict[str, Any]:
        """Return barcode lookup cache."""
        return self._data.get(CONF_BARCODE_CACHE, {})

    @property
    def buy_list(self) -> list[dict[str, Any]]:
        """Return all buy list items."""
        return self._data.get(CONF_BUY_LIST, [])

    @property
    def wine_history(self) -> list[dict[str, Any]]:
        """Return wine removal history."""
        return self._data.get(CONF_WINE_HISTORY, [])

    @property
    def settings(self) -> dict[str, Any]:
        """Return app-wide settings (e.g. metadata language)."""
        return self._data.get(CONF_SETTINGS, {})

    def update_settings(self, updates: dict[str, Any]) -> dict[str, Any]:
        """Update app-wide settings."""
        settings = self._data.setdefault(CONF_SETTINGS, {})
        settings.update(updates)
        return settings

    async def async_load(self) -> None:
        """Load data from storage.

        `loaded_from_disk` distinguishes "there was nothing to load" from
        "there was something and we read it". Callers that delete things the
        stored data is the only record of — photo files, say — must not treat
        a store that failed to parse as a cellar that is genuinely empty.
        """
        data = await self._store.async_load()
        self.loaded_from_disk = data is not None
        if data is None:
            self._data = {
                CONF_WINES: [],
                CONF_CABINETS: [dict(c) for c in DEFAULT_CABINETS],
                CONF_BARCODE_CACHE: {},
                CONF_BUY_LIST: [],
                CONF_WINE_HISTORY: [],
                CONF_SETTINGS: {},
            }
            await self.async_save()
        else:
            self._data = data
            self._migrate()

    def _migrate(self) -> None:
        """Bring loaded or restored data up to the current schema.

        Called on load *and* on restore: a backup file carries whatever shape
        the version that wrote it used, so restoring an old one without this
        would leave cabinets and wines missing fields until the next HA
        restart happened to re-run the load path.
        """
        # Migrate: ensure all cabinets have storage_rows and depth fields
        for cab in self._data.get(CONF_CABINETS, []):
            if "storage_rows" not in cab:
                cab["storage_rows"] = []
            if "depth" not in cab:
                cab["depth"] = 1
            # Migrate: remove orientation, swap dims for horizontal
            if cab.get("orientation") == "horizontal":
                cab["rows"], cab["cols"] = cab["cols"], cab["rows"]
            cab.pop("orientation", None)
            # Migrate: clear legacy bottom zone flag
            if cab.get("has_bottom_zone"):
                cab["has_bottom_zone"] = False
                cab["bottom_zone_name"] = ""
            # Migrate storage rows to include type and capacity
            for sr in cab.get("storage_rows", []):
                if "type" not in sr:
                    sr["type"] = "bulk"
                if "capacity" not in sr:
                    sr["capacity"] = 20
                # Migrate horizontal → bulk
                if sr.get("type") == "horizontal":
                    sr["type"] = "bulk"
                # Migrate box rows: add boxes array
                if sr.get("type") == "box" and "boxes" not in sr:
                    sr["boxes"] = [sr.get("capacity", 12)]
        # Ensure all wines have retail_price and depth fields
        for wine in self._data.get(CONF_WINES, []):
            if "retail_price" not in wine:
                wine["retail_price"] = None
            if "depth" not in wine:
                wine["depth"] = 0
            # Backfill the check timestamps: a wine that was updated from a
            # source was certainly consulted, so seed checked_at from
            # updated_at rather than reporting it as never looked up. Both
            # keys are materialized so every wine has the same shape.
            for source in ("vivino", "ai"):
                updated_key = f"{source}_updated_at"
                checked_key = f"{source}_checked_at"
                if updated_key not in wine:
                    wine[updated_key] = None
                if checked_key not in wine:
                    wine[checked_key] = wine[updated_key]
        # Ensure every top-level collection exists
        if CONF_BARCODE_CACHE not in self._data:
            self._data[CONF_BARCODE_CACHE] = {}
        if CONF_BUY_LIST not in self._data:
            self._data[CONF_BUY_LIST] = []
        if CONF_WINE_HISTORY not in self._data:
            self._data[CONF_WINE_HISTORY] = []

    async def async_save(self) -> None:
        """Save data to storage."""
        await self._store.async_save(self._data)

    def add_wine(self, wine_data: dict[str, Any]) -> dict[str, Any]:
        """Add a wine bottle to the cellar."""
        wine = {
            "id": str(uuid.uuid4()),
            "barcode": wine_data.get("barcode", ""),
            "name": wine_data.get("name", "Unknown Wine"),
            "winery": wine_data.get("winery", ""),
            "region": wine_data.get("region", ""),
            "country": wine_data.get("country", ""),
            "vintage": wine_data.get("vintage"),
            "type": wine_data.get("type", "red"),
            "grape_variety": wine_data.get("grape_variety", ""),
            "rating": wine_data.get("rating"),
            "image_url": wine_data.get("image_url", ""),
            "back_image_url": wine_data.get("back_image_url", ""),
            "price": wine_data.get("price"),
            "retail_price": wine_data.get("retail_price"),
            "retail_price_currency": wine_data.get("retail_price_currency"),
            "purchase_date": wine_data.get("purchase_date", ""),
            "drink_by": wine_data.get("drink_by", ""),
            "notes": wine_data.get("notes", ""),
            "description": wine_data.get("description", ""),
            "food_pairings": wine_data.get("food_pairings", ""),
            "alcohol": wine_data.get("alcohol", ""),
            "ratings_count": wine_data.get("ratings_count"),
            "cabinet_id": wine_data.get("cabinet_id", ""),
            "row": wine_data.get("row"),
            "col": wine_data.get("col"),
            "depth": wine_data.get("depth", 0),
            "zone": wine_data.get("zone", ""),
            "user_rating": wine_data.get("user_rating"),
            "tasting_notes": wine_data.get("tasting_notes"),
            "disposition": wine_data.get("disposition", ""),
            "drink_window": wine_data.get("drink_window", ""),
            "ai_ratings": wine_data.get("ai_ratings"),
            "vivino_id": wine_data.get("vivino_id", ""),
            "source": wine_data.get("source", ""),
            "added_at": datetime.now(timezone.utc).isoformat(),
            "vivino_updated_at": wine_data.get("vivino_updated_at"),
            "vivino_checked_at": wine_data.get("vivino_checked_at"),
            "ai_updated_at": wine_data.get("ai_updated_at"),
            "ai_checked_at": wine_data.get("ai_checked_at"),
        }
        self._data[CONF_WINES].append(wine)
        return wine

    def remove_wine(self, wine_id: str, reason: str = "other") -> bool:
        """Remove a wine bottle by ID and archive it to history."""
        wines = self._data[CONF_WINES]
        for i, wine in enumerate(wines):
            if wine["id"] == wine_id:
                # Archive to history before removing
                history_entry = {
                    "id": str(uuid.uuid4()),
                    "original_id": wine["id"],
                    "name": wine.get("name", ""),
                    "winery": wine.get("winery", ""),
                    "vintage": wine.get("vintage"),
                    "type": wine.get("type", ""),
                    "region": wine.get("region", ""),
                    "country": wine.get("country", ""),
                    "grape_variety": wine.get("grape_variety", ""),
                    "rating": wine.get("rating"),
                    "price": wine.get("price"),
                    "image_url": wine.get("image_url", ""),
                    "added_at": wine.get("added_at", ""),
                    "removed_at": datetime.now(timezone.utc).isoformat(),
                    "reason": reason,
                    "full_wine": dict(wine),
                }
                self._data[CONF_WINE_HISTORY].append(history_entry)
                wines.pop(i)
                return True
        return False

    def restore_wine(self, history_id: str) -> dict[str, Any] | None:
        """Restore a wine from history back into the cellar as unassigned."""
        history = self._data[CONF_WINE_HISTORY]
        for i, entry in enumerate(history):
            if entry["id"] == history_id:
                wine_data = dict(entry.get("full_wine") or entry)
                wine_data["cabinet_id"] = ""
                wine_data["row"] = None
                wine_data["col"] = None
                wine_data["zone"] = ""
                wine_data["depth"] = 0
                wine = self.add_wine(wine_data)
                # Preserve when the bottle originally entered the cellar
                # rather than dating it from the un-removal.
                if wine_data.get("added_at"):
                    wine["added_at"] = wine_data["added_at"]
                history.pop(i)
                return wine
        return None

    def update_wine(self, wine_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        """Update a wine bottle's data."""
        for wine in self._data[CONF_WINES]:
            if wine["id"] == wine_id:
                for key, value in updates.items():
                    if key != "id":
                        wine[key] = value
                return wine
        return None

    def move_wine(
        self, wine_id: str, cabinet_id: str, row: int | None = None, col: int | None = None,
        zone: str = "", depth: int = 0
    ) -> dict[str, Any] | None:
        """Move a wine to a new location."""
        return self.update_wine(
            wine_id, {"cabinet_id": cabinet_id, "row": row, "col": col, "zone": zone, "depth": depth}
        )

    def get_wine(self, wine_id: str) -> dict[str, Any] | None:
        """Get a single wine by ID."""
        for wine in self._data[CONF_WINES]:
            if wine["id"] == wine_id:
                return wine
        return None

    def get_wines_in_cabinet(self, cabinet_id: str) -> list[dict[str, Any]]:
        """Get all wines in a specific cabinet."""
        return [w for w in self.wines if w.get("cabinet_id") == cabinet_id]

    def get_wine_at_position(self, cabinet_id: str, row: int, col: int) -> dict[str, Any] | None:
        """Get wine at a specific grid position."""
        for wine in self.wines:
            if wine.get("cabinet_id") == cabinet_id and wine.get("row") == row and wine.get("col") == col:
                return wine
        return None

    def add_cabinet(self, cabinet_data: dict[str, Any]) -> dict[str, Any]:
        """Add a new cabinet."""
        cabinet = {
            "id": cabinet_data.get("id", f"cabinet-{uuid.uuid4().hex[:8]}"),
            "name": cabinet_data.get("name", "New Cabinet"),
            "type": cabinet_data.get("type", "grid"),
            "rows": cabinet_data.get("rows", 8),
            "cols": cabinet_data.get("cols", 8),
            "depth": cabinet_data.get("depth", 1),
            "has_bottom_zone": cabinet_data.get("has_bottom_zone", False),
            "bottom_zone_name": cabinet_data.get("bottom_zone_name", "Storage"),
            "storage_rows": cabinet_data.get("storage_rows", []),
            "order": cabinet_data.get("order", len(self.cabinets)),
        }
        self._data[CONF_CABINETS].append(cabinet)
        return cabinet

    def update_cabinet(self, cabinet_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        """Update a cabinet's configuration."""
        for cabinet in self._data[CONF_CABINETS]:
            if cabinet["id"] == cabinet_id:
                for key, value in updates.items():
                    if key != "id":
                        cabinet[key] = value
                return cabinet
        return None

    def remove_cabinet(self, cabinet_id: str) -> bool:
        """Remove a cabinet and unassign its wines."""
        cabinets = self._data[CONF_CABINETS]
        for i, cabinet in enumerate(cabinets):
            if cabinet["id"] == cabinet_id:
                cabinets.pop(i)
                for wine in self._data[CONF_WINES]:
                    if wine.get("cabinet_id") == cabinet_id:
                        wine["cabinet_id"] = ""
                        wine["row"] = None
                        wine["col"] = None
                        wine["zone"] = ""
                return True
        return False

    @staticmethod
    def cabinet_capacity(cabinet: dict[str, Any]) -> int:
        """Return a single cabinet's total bottle capacity.

        Plain row/col grid slots, plus each bulk/box storage row's own
        capacity (those rows replace a grid row, so they're not part of
        the row*col count and must be added separately).
        """
        if cabinet.get("type") != "grid":
            return 0
        storage_rows = cabinet.get("storage_rows", [])
        grid_rows = max(0, cabinet.get("rows", 0) - len(storage_rows))
        capacity = grid_rows * cabinet.get("cols", 0) * cabinet.get("depth", 1)
        for sr in storage_rows:
            if sr.get("type") == "box":
                capacity += sum(sr.get("boxes", []))
            else:
                capacity += sr.get("capacity", 0)
        return capacity

    @staticmethod
    def _storage_row_capacity(storage_row: dict[str, Any]) -> int:
        if storage_row.get("type") == "box":
            return sum(storage_row.get("boxes", []))
        return storage_row.get("capacity", 0)

    def _placement_is_lost(self, wine: dict[str, Any]) -> str | None:
        """Say why a bottle's recorded position no longer exists, or None.

        A bottle can be left pointing at a slot its rack no longer has —
        shrinking a rack past it, or deleting the bin it sat in, never
        deleted the bottle (nothing here ever does) but also never moved it.
        It then counts towards the cellar total while being undrawable on
        the rack, which is the one kind of wrong an inventory must not be.
        """
        cabinet_id = wine.get("cabinet_id")
        if not cabinet_id:
            return None
        cabinet = next((c for c in self.cabinets if c["id"] == cabinet_id), None)
        if cabinet is None:
            return "its rack no longer exists"

        zone = wine.get("zone") or ""
        depth = wine.get("depth") or 0
        if zone:
            storage_rows = cabinet.get("storage_rows", []) or []
            sr = next((s for s in storage_rows if f"storage-{s.get('row')}" == zone), None)
            if sr is None:
                return "the bin it was in no longer exists"
            if depth >= self._storage_row_capacity(sr):
                return f"{sr.get('name') or 'that bin'} was shrunk past its slot"
            return None

        row, col = wine.get("row"), wine.get("col")
        if row is None or col is None:
            return None
        if row >= cabinet.get("rows", 0) or col >= cabinet.get("cols", 0):
            return "the rack was shrunk past its slot"
        if depth >= (cabinet.get("depth", 1) or 1):
            return "the rack was made shallower than its slot"
        if any(s.get("row") == row for s in cabinet.get("storage_rows", []) or []):
            return "its row became a bin"
        return None

    def reconcile_placements(self) -> list[dict[str, str]]:
        """Unassign bottles whose recorded slot no longer exists.

        Returns what was moved, so the caller can tell the user rather than
        quietly rearranging their cellar. Unassigning only — the bottle keeps
        every other field and reappears under Unassigned, where it can be put
        back somewhere real.
        """
        fixed: list[dict[str, str]] = []
        for wine in self._data[CONF_WINES]:
            reason = self._placement_is_lost(wine)
            if reason is None:
                continue
            fixed.append({"name": wine.get("name") or "Unnamed wine", "reason": reason})
            wine["cabinet_id"] = ""
            wine["row"] = None
            wine["col"] = None
            wine["zone"] = ""
            wine["depth"] = 0
        return fixed

    def get_stats(self) -> dict[str, Any]:
        """Get cellar statistics."""
        total_bottles = len(self.wines)
        total_capacity = sum(self.cabinet_capacity(c) for c in self.cabinets)
        by_type: dict[str, int] = {}
        by_cabinet: dict[str, int] = {}
        total_value = 0.0
        total_cost = 0.0
        for wine in self.wines:
            wine_type = wine.get("type", "unknown")
            by_type[wine_type] = by_type.get(wine_type, 0) + 1
            cab_id = wine.get("cabinet_id", "unassigned")
            by_cabinet[cab_id] = by_cabinet.get(cab_id, 0) + 1
            # Use retail price (current value) if available, else purchase price
            price = wine.get("retail_price") or wine.get("price")
            if price and isinstance(price, (int, float)):
                total_value += price
            # Track purchase cost separately
            cost = wine.get("price")
            if cost and isinstance(cost, (int, float)):
                total_cost += cost

        return {
            "total_bottles": total_bottles,
            "total_capacity": total_capacity,
            "available_slots": total_capacity - total_bottles,
            "total_value": round(total_value, 2),
            "total_cost": round(total_cost, 2),
            "by_type": by_type,
            "by_cabinet": by_cabinet,
        }

    def cache_barcode(self, barcode: str, data: dict[str, Any]) -> None:
        """Cache barcode lookup results.

        Capped, because this lives in the same file as the cellar itself and
        that file is read and rewritten on every change — an unbounded cache
        of every barcode ever scanned would slowly tax every save. The oldest
        entries go first; a re-scan costs one lookup.
        """
        cache = self._data.setdefault(CONF_BARCODE_CACHE, {})
        cache[barcode] = {
            **data,
            "cached_at": datetime.now(timezone.utc).isoformat(),
        }
        if len(cache) > BARCODE_CACHE_MAX:
            for old_key in sorted(
                cache, key=lambda k: cache[k].get("cached_at") or ""
            )[: len(cache) - BARCODE_CACHE_MAX]:
                cache.pop(old_key, None)

    def get_cached_barcode(self, barcode: str) -> dict[str, Any] | None:
        """Get cached barcode data."""
        return self._data.get(CONF_BARCODE_CACHE, {}).get(barcode)

    # ── Buy List ──────────────────────────────────────────────────────

    def add_buy_list_item(self, wine_data: dict[str, Any]) -> dict[str, Any]:
        """Add a wine to the buy list."""
        item = {
            "id": str(uuid.uuid4()),
            "barcode": wine_data.get("barcode", ""),
            "name": wine_data.get("name", "Unknown Wine"),
            "winery": wine_data.get("winery", ""),
            "region": wine_data.get("region", ""),
            "country": wine_data.get("country", ""),
            "vintage": wine_data.get("vintage"),
            "type": wine_data.get("type", "red"),
            "grape_variety": wine_data.get("grape_variety", ""),
            "rating": wine_data.get("rating"),
            "image_url": wine_data.get("image_url", ""),
            "price": wine_data.get("price"),
            "retail_price": wine_data.get("retail_price"),
            "retail_price_currency": wine_data.get("retail_price_currency"),
            "notes": wine_data.get("notes", ""),
            "description": wine_data.get("description", ""),
            "food_pairings": wine_data.get("food_pairings", ""),
            "alcohol": wine_data.get("alcohol", ""),
            "ratings_count": wine_data.get("ratings_count"),
            "ai_ratings": wine_data.get("ai_ratings"),
            "disposition": wine_data.get("disposition", ""),
            "drink_window": wine_data.get("drink_window", ""),
            "vivino_id": wine_data.get("vivino_id", ""),
            "source": wine_data.get("source", ""),
            "added_at": datetime.now(timezone.utc).isoformat(),
        }
        self._data.setdefault(CONF_BUY_LIST, []).append(item)
        return item

    def remove_buy_list_item(self, item_id: str) -> bool:
        """Remove a wine from the buy list by ID."""
        items = self._data.get(CONF_BUY_LIST, [])
        for i, item in enumerate(items):
            if item["id"] == item_id:
                items.pop(i)
                return True
        return False

    def get_buy_list_item(self, item_id: str) -> dict[str, Any] | None:
        """Get a single buy list item by ID."""
        for item in self._data.get(CONF_BUY_LIST, []):
            if item["id"] == item_id:
                return item
        return None

    def update_buy_list_item(
        self, item_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update a buy list item's data."""
        for item in self._data.get(CONF_BUY_LIST, []):
            if item["id"] == item_id:
                for key, value in updates.items():
                    if key != "id":
                        item[key] = value
                return item
        return None

    # ── Vivino Sync Status ───────────────────────────────────────────

    def get_vivino_sync_status(self) -> dict[str, Any] | None:
        """Return the last Vivino sync result, if any."""
        return self._data.get("vivino_sync_status")

    def set_vivino_sync_status(self, status: dict[str, Any]) -> None:
        """Store the last Vivino sync result (persisted across restarts)."""
        self._data["vivino_sync_status"] = status

    def remove_vivino_bottles(
        self, vivino_id: str, count: int, reason: str = "removed_on_vivino"
    ) -> int:
        """Remove up to ``count`` Vivino-sourced bottles for a vivino_id.

        Prefers unassigned bottles (not placed in a rack) so a Vivino-side
        removal disturbs the user's physical layout as little as possible.
        Each removed bottle is archived to history. Returns the count removed.
        """
        if count <= 0:
            return 0
        matching = [
            w for w in self._data.get(CONF_WINES, [])
            if w.get("vivino_id") == vivino_id
            and str(w.get("source", "")).startswith("vivino")
        ]
        # Unassigned (no cabinet) first, then oldest added first
        matching.sort(
            key=lambda w: (
                0 if not w.get("cabinet_id") else 1,
                w.get("added_at", ""),
            ),
            reverse=False,
        )
        removed = 0
        for wine in matching[:count]:
            if self.remove_wine(wine["id"], reason=reason):
                removed += 1
        return removed

    def resolve_vivino_removal(self, vivino_id: str, count: int) -> tuple[int, int]:
        """Apply a Vivino-side removal, but only where the choice is obvious.

        Removes automatically when no real choice exists: every bottle of the
        wine is gone, unassigned bottles cover the removal, or the remainder
        equals all placed bottles. When a placed bottle must go and there are
        more candidates than removals, nothing further is removed — the
        remainder is returned so the caller can queue it for the user to pick
        the actual bottle in the card. Returns (removed, needing_choice).
        """
        if count <= 0:
            return (0, 0)
        matching = [
            w for w in self._data.get(CONF_WINES, [])
            if w.get("vivino_id") == vivino_id
            and str(w.get("source", "")).startswith("vivino")
        ]
        if count >= len(matching):
            return (self.remove_vivino_bottles(vivino_id, count), 0)

        matching.sort(key=lambda w: w.get("added_at", ""))
        unassigned = [w for w in matching if not w.get("cabinet_id")]
        placed = [w for w in matching if w.get("cabinet_id")]

        removed = 0
        for wine in unassigned[:count]:
            if self.remove_wine(wine["id"], reason="removed_on_vivino"):
                removed += 1
        remaining = count - removed
        if remaining <= 0:
            return (removed, 0)
        if remaining >= len(placed):
            for wine in placed:
                if self.remove_wine(wine["id"], reason="removed_on_vivino"):
                    removed += 1
            return (removed, 0)
        return (removed, remaining)

    def get_vivino_baseline(self) -> dict[str, Any]:
        """Return the last-synced Vivino cellar baseline (vivino_id -> entry)."""
        base = self._data.get("vivino_baseline")
        return base if isinstance(base, dict) else {}

    def set_vivino_baseline(self, baseline: dict[str, Any]) -> None:
        """Store the Vivino cellar baseline used for three-way reconciliation."""
        self._data["vivino_baseline"] = baseline

    def get_vivino_pending_push(self) -> list[dict[str, Any]]:
        """Return queued Cork Dork -> Vivino changes awaiting write-back."""
        pending = self._data.get("vivino_pending_push")
        return pending if isinstance(pending, list) else []

    def set_vivino_pending_push(self, pending: list[dict[str, Any]]) -> None:
        """Store queued Cork Dork -> Vivino changes (Phase 2 write-back)."""
        self._data["vivino_pending_push"] = pending

    def get_vivino_pending_removals(self) -> dict[str, Any]:
        """Return Vivino-side removals awaiting the user's bottle choice.

        Keyed by vivino_id; each entry carries the outstanding count plus
        display fields for the card's pick-a-bottle flow.
        """
        pending = self._data.get("vivino_pending_removals")
        return pending if isinstance(pending, dict) else {}

    def set_vivino_pending_removals(self, pending: dict[str, Any]) -> None:
        """Store Vivino-side removals awaiting the user's bottle choice."""
        self._data["vivino_pending_removals"] = pending

    # ── Backup / Restore ─────────────────────────────────────────────

    def get_backup_data(self) -> dict[str, Any]:
        """Return a complete backup of all cellar data."""
        return {
            CONF_WINES: list(self.wines),
            CONF_CABINETS: list(self.cabinets),
            CONF_BUY_LIST: list(self.buy_list),
            CONF_WINE_HISTORY: list(self.wine_history),
            CONF_SETTINGS: dict(self.settings),
        }

    def restore_data(
        self,
        wines: list[dict[str, Any]],
        cabinets: list[dict[str, Any]],
        buy_list: list[dict[str, Any]],
        wine_history: list[dict[str, Any]] | None = None,
        settings: dict[str, Any] | None = None,
    ) -> dict[str, int]:
        """Replace all cellar data with backup data. Returns counts."""
        self._data[CONF_WINES] = wines
        self._data[CONF_CABINETS] = cabinets
        self._data[CONF_BUY_LIST] = buy_list
        self._data[CONF_WINE_HISTORY] = wine_history or []
        # Older backups predate app-wide settings — only overwrite when the
        # backup actually carries them, so restoring one doesn't wipe the
        # user's current metadata-language / AI-fallback configuration.
        if settings is not None:
            self._data[CONF_SETTINGS] = settings
        self._migrate()
        return {
            "wines": len(wines),
            "cabinets": len(cabinets),
            "buy_list": len(buy_list),
            "wine_history": len(self._data[CONF_WINE_HISTORY]),
        }

    def reorder_zone(
        self, cabinet_id: str, zone: str, wine_ids: list[str]
    ) -> int:
        """Assign slots 0..n-1 to a bin's bottles, in the order given.

        One pass over the data instead of a move per bottle: the caller used
        to issue N websocket commands, each rewriting the whole store, which
        made shifting a full bin unusably slow. Bottles in the bin that the
        caller did not list keep their relative order and follow the listed
        ones, so a stale frontend list can never drop a bottle out of its bin.
        """
        in_zone = [
            w for w in self._data[CONF_WINES]
            if w.get("cabinet_id") == cabinet_id and (w.get("zone") or "") == zone
        ]
        by_id = {w["id"]: w for w in in_zone}

        ordered = [by_id[wid] for wid in wine_ids if wid in by_id]
        listed = {w["id"] for w in ordered}
        remainder = sorted(
            (w for w in in_zone if w["id"] not in listed),
            key=lambda w: w.get("depth") or 0,
        )

        for index, wine in enumerate([*ordered, *remainder]):
            wine["depth"] = index
        return len(ordered) + len(remainder)

    # ── CSV location resolution ──────────────────────────────────────

    def _find_cabinet_by_name(self, name: str) -> dict[str, Any] | None:
        """Match a cabinet by display name, case- and space-insensitively."""
        wanted = " ".join(str(name).split()).casefold()
        if not wanted:
            return None
        for cab in self.cabinets:
            if " ".join(str(cab.get("name", "")).split()).casefold() == wanted:
                return cab
        return None

    def _slot_is_free(
        self,
        cabinet_id: str,
        row: int | None,
        col: int | None,
        zone: str,
        depth: int,
        ignore_wine_id: str,
    ) -> bool:
        """True when no *other* bottle already occupies that exact slot."""
        for wine in self.wines:
            if wine.get("id") == ignore_wine_id:
                continue
            if (
                wine.get("cabinet_id") == cabinet_id
                and wine.get("row") == row
                and wine.get("col") == col
                and (wine.get("zone") or "") == zone
                and (wine.get("depth") or 0) == depth
            ):
                return False
        return True

    def resolve_import_location(
        self, row_data: dict[str, Any], ignore_wine_id: str = ""
    ) -> dict[str, Any] | None:
        """Turn a CSV row's Cabinet/Row/Col/Zone columns into a location.

        Returns the location fields to apply, or None when the row names no
        location at all *or* names one that cannot be honoured (unknown rack,
        out-of-range slot, slot already taken). Refusing beats guessing: a
        bulk edit must never silently evict another bottle.

        Row/Col are 1-based in the CSV — that is what the UI shows — and
        0-based in storage.
        """
        cabinet_name = str(row_data.get("cabinet") or "").strip()
        raw_row = row_data.get("row")
        raw_col = row_data.get("col")
        zone = str(row_data.get("zone") or "").strip()
        depth = row_data.get("depth")

        if not cabinet_name:
            # A slot without a rack is meaningless; don't half-apply it.
            return None

        cabinet = self._find_cabinet_by_name(cabinet_name)
        if cabinet is None:
            return None

        cabinet_id = cabinet["id"]
        try:
            depth_idx = max(0, int(depth)) if depth not in (None, "") else 0
        except (TypeError, ValueError):
            depth_idx = 0

        storage_rows = cabinet.get("storage_rows", [])
        storage_row_indices = {sr.get("row") for sr in storage_rows}

        # Bulk bin / wine box, addressed by zone rather than a grid slot.
        if zone:
            if zone == "bottom":
                if not cabinet.get("has_bottom_zone"):
                    return None
            elif zone.startswith("storage-"):
                try:
                    zone_row = int(zone.split("-", 1)[1])
                except (IndexError, ValueError):
                    return None
                storage_row = next(
                    (sr for sr in storage_rows if sr.get("row") == zone_row), None
                )
                if storage_row is None:
                    return None
                if storage_row.get("type") == "box":
                    capacity = sum(storage_row.get("boxes", []))
                else:
                    capacity = storage_row.get("capacity", 0)
                if depth_idx >= capacity:
                    return None
            else:
                return None

            if not self._slot_is_free(cabinet_id, None, None, zone, depth_idx, ignore_wine_id):
                return None
            return {"cabinet_id": cabinet_id, "row": None, "col": None,
                    "zone": zone, "depth": depth_idx}

        # Plain grid slot.
        if raw_row not in (None, "") and raw_col not in (None, ""):
            try:
                row_idx = int(raw_row) - 1
                col_idx = int(raw_col) - 1
            except (TypeError, ValueError):
                return None
            if not (0 <= row_idx < cabinet.get("rows", 0)):
                return None
            if not (0 <= col_idx < cabinet.get("cols", 0)):
                return None
            if row_idx in storage_row_indices:
                # That row was converted to a bin/box; it has no grid slots.
                return None
            if depth_idx >= cabinet.get("depth", 1):
                return None
            if not self._slot_is_free(
                cabinet_id, row_idx, col_idx, "", depth_idx, ignore_wine_id
            ):
                return None
            return {"cabinet_id": cabinet_id, "row": row_idx, "col": col_idx,
                    "zone": "", "depth": depth_idx}

        # Cabinet named but no slot: assign to the rack without a position.
        return {"cabinet_id": cabinet_id, "row": None, "col": None, "zone": "", "depth": 0}

    def import_wines(
        self, wines_data: list[dict[str, Any]], mode: str = "add"
    ) -> dict[str, int]:
        """Batch import wines. Returns {"added": n, "updated": n}.

        mode="add" always creates new bottles (each gets a fresh UUID).
        mode="update" matches a row to an existing bottle by its `id` column
        and edits it in place, so a CSV can be exported, bulk-edited in a
        spreadsheet and re-imported without duplicating the whole cellar.
        Rows whose id is absent or unknown are still added as new.

        Cabinet/Row/Col/Zone are honoured only when they resolve to a real,
        free slot; `location_skipped` counts the rows whose placement was
        refused so the caller can tell the user rather than silently dropping
        bottles somewhere unexpected.
        """
        added = 0
        updated = 0
        location_skipped = 0
        location_keys = ("cabinet", "row", "col", "zone", "depth")
        existing_ids = (
            {w["id"] for w in self._data[CONF_WINES] if w.get("id")}
            if mode == "update"
            else set()
        )

        for wd in wines_data:
            wine_id = str(wd.get("id") or "")
            is_update = bool(wine_id and wine_id in existing_ids)
            names_location = any(
                str(wd.get(k) or "").strip() for k in ("cabinet", "row", "col", "zone")
            )

            location = self.resolve_import_location(wd, wine_id if is_update else "")
            if names_location and location is None:
                location_skipped += 1

            # The raw column values never reach the wine record: only the
            # resolved location does, so a bogus rack name can't be stored.
            fields = {k: v for k, v in wd.items() if k not in location_keys and k != "id"}

            if is_update:
                # Only the columns actually present in the row are applied —
                # a blank cell leaves the stored value alone rather than
                # wiping it, which is what a partial spreadsheet edit means.
                if location:
                    fields.update(location)
                self.update_wine(wine_id, fields)
                updated += 1
                continue

            if location:
                fields.update(location)
            wine = self.add_wine(fields)
            # add_wine stamps added_at with "now"; keep the original date when
            # the imported row carries one, or a CSV round-trip quietly resets
            # every bottle's age to the import date.
            original_added = wd.get("added_at")
            if original_added:
                wine["added_at"] = original_added
            added += 1

        return {
            "added": added,
            "updated": updated,
            "location_skipped": location_skipped,
        }
