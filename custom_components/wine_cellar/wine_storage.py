"""Wine cellar data storage manager."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CONF_BARCODE_CACHE,
    CONF_BUY_LIST,
    CONF_CABINETS,
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

    async def async_load(self) -> None:
        """Load data from storage."""
        data = await self._store.async_load()
        if data is None:
            self._data = {
                CONF_WINES: [],
                CONF_CABINETS: [dict(c) for c in DEFAULT_CABINETS],
                CONF_BARCODE_CACHE: {},
                CONF_BUY_LIST: [],
                CONF_WINE_HISTORY: [],
            }
            await self.async_save()
        else:
            self._data = data
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
            # Migrate: ensure buy_list exists
            if CONF_BUY_LIST not in self._data:
                self._data[CONF_BUY_LIST] = []
            # Migrate: ensure wine_history exists
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
            "price": wine_data.get("price"),
            "retail_price": wine_data.get("retail_price"),
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
            "added_at": datetime.now(timezone.utc).isoformat(),
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
                }
                self._data[CONF_WINE_HISTORY].append(history_entry)
                wines.pop(i)
                return True
        return False

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

    def get_stats(self) -> dict[str, Any]:
        """Get cellar statistics."""
        total_bottles = len(self.wines)
        total_capacity = 0
        for c in self.cabinets:
            if c.get("type") == "grid":
                storage_row_count = len(c.get("storage_rows", []))
                grid_rows = c.get("rows", 0) - storage_row_count
                total_capacity += max(0, grid_rows) * c.get("cols", 0) * c.get("depth", 1)
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
        """Cache barcode lookup results."""
        self._data[CONF_BARCODE_CACHE][barcode] = {
            **data,
            "cached_at": datetime.now(timezone.utc).isoformat(),
        }

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
            "notes": wine_data.get("notes", ""),
            "description": wine_data.get("description", ""),
            "food_pairings": wine_data.get("food_pairings", ""),
            "alcohol": wine_data.get("alcohol", ""),
            "ratings_count": wine_data.get("ratings_count"),
            "ai_ratings": wine_data.get("ai_ratings"),
            "disposition": wine_data.get("disposition", ""),
            "drink_window": wine_data.get("drink_window", ""),
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

    # ── Backup / Restore ─────────────────────────────────────────────

    def get_backup_data(self) -> dict[str, Any]:
        """Return a complete backup of all cellar data."""
        return {
            CONF_WINES: list(self.wines),
            CONF_CABINETS: list(self.cabinets),
            CONF_BUY_LIST: list(self.buy_list),
            CONF_WINE_HISTORY: list(self.wine_history),
        }

    def restore_data(
        self,
        wines: list[dict[str, Any]],
        cabinets: list[dict[str, Any]],
        buy_list: list[dict[str, Any]],
        wine_history: list[dict[str, Any]] | None = None,
    ) -> dict[str, int]:
        """Replace all cellar data with backup data. Returns counts."""
        self._data[CONF_WINES] = wines
        self._data[CONF_CABINETS] = cabinets
        self._data[CONF_BUY_LIST] = buy_list
        self._data[CONF_WINE_HISTORY] = wine_history or []
        return {
            "wines": len(wines),
            "cabinets": len(cabinets),
            "buy_list": len(buy_list),
            "wine_history": len(self._data[CONF_WINE_HISTORY]),
        }

    def import_wines(self, wines_data: list[dict[str, Any]]) -> int:
        """Batch-add wines (each gets a new UUID). Returns count added."""
        count = 0
        for wd in wines_data:
            self.add_wine(wd)
            count += 1
        return count
