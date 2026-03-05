"""Wine cellar data storage manager."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CONF_BARCODE_CACHE,
    CONF_CABINETS,
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

    async def async_load(self) -> None:
        """Load data from storage."""
        data = await self._store.async_load()
        if data is None:
            self._data = {
                CONF_WINES: [],
                CONF_CABINETS: [dict(c) for c in DEFAULT_CABINETS],
                CONF_BARCODE_CACHE: {},
            }
            await self.async_save()
        else:
            self._data = data
            # Migrate: ensure all cabinets have storage_rows field
            for cab in self._data.get(CONF_CABINETS, []):
                if "storage_rows" not in cab:
                    cab["storage_rows"] = []
            # Ensure all wines have retail_price field
            for wine in self._data.get(CONF_WINES, []):
                if "retail_price" not in wine:
                    wine["retail_price"] = None

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

    def remove_wine(self, wine_id: str) -> bool:
        """Remove a wine bottle by ID."""
        wines = self._data[CONF_WINES]
        for i, wine in enumerate(wines):
            if wine["id"] == wine_id:
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
        self, wine_id: str, cabinet_id: str, row: int | None = None, col: int | None = None, zone: str = ""
    ) -> dict[str, Any] | None:
        """Move a wine to a new location."""
        return self.update_wine(
            wine_id, {"cabinet_id": cabinet_id, "row": row, "col": col, "zone": zone}
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
                total_capacity += max(0, grid_rows) * c.get("cols", 0)
        by_type: dict[str, int] = {}
        by_cabinet: dict[str, int] = {}
        total_value = 0.0
        for wine in self.wines:
            wine_type = wine.get("type", "unknown")
            by_type[wine_type] = by_type.get(wine_type, 0) + 1
            cab_id = wine.get("cabinet_id", "unassigned")
            by_cabinet[cab_id] = by_cabinet.get(cab_id, 0) + 1
            # Use retail price (current value) if available, else purchase price
            price = wine.get("retail_price") or wine.get("price")
            if price and isinstance(price, (int, float)):
                total_value += price

        return {
            "total_bottles": total_bottles,
            "total_capacity": total_capacity,
            "available_slots": total_capacity - total_bottles,
            "total_value": round(total_value, 2),
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
