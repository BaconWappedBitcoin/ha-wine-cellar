"""Sensors for Cork Dork."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up wine cellar sensors."""
    storage = hass.data[DOMAIN]["storage"]

    entities: list[SensorEntity] = [
        WineCellarTotalSensor(storage, entry),
        WineCellarCapacitySensor(storage, entry),
        WineCellarVivinoSyncSensor(hass, entry),
    ]

    for cabinet in storage.cabinets:
        entities.append(WineCellarCabinetSensor(storage, entry, cabinet))

    async_add_entities(entities)

    @callback
    def _async_on_update(event: Any) -> None:
        """Handle cellar data updates."""
        for entity in entities:
            entity.async_schedule_update_ha_state(True)

    hass.bus.async_listen(f"{DOMAIN}_updated", _async_on_update)


class WineCellarTotalSensor(SensorEntity):
    """Sensor for total wine bottle count."""

    _attr_icon = "mdi:bottle-wine"
    _attr_native_unit_of_measurement = "bottles"

    def __init__(self, storage, entry: ConfigEntry) -> None:
        """Initialize sensor."""
        self._storage = storage
        self._attr_unique_id = f"{entry.entry_id}_total_bottles"
        self._attr_name = "Cork Dork Total Bottles"

    @property
    def native_value(self) -> int:
        """Return total bottle count."""
        return len(self._storage.wines)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        stats = self._storage.get_stats()
        return {
            "by_type": stats["by_type"],
            "by_cabinet": stats["by_cabinet"],
        }


class WineCellarCapacitySensor(SensorEntity):
    """Sensor for cellar capacity percentage."""

    _attr_icon = "mdi:gauge"
    _attr_native_unit_of_measurement = "%"

    def __init__(self, storage, entry: ConfigEntry) -> None:
        """Initialize sensor."""
        self._storage = storage
        self._attr_unique_id = f"{entry.entry_id}_capacity"
        self._attr_name = "Cork Dork Capacity"

    @property
    def native_value(self) -> float:
        """Return capacity percentage."""
        stats = self._storage.get_stats()
        capacity = stats["total_capacity"]
        if capacity == 0:
            return 0
        return round((stats["total_bottles"] / capacity) * 100, 1)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return capacity details."""
        stats = self._storage.get_stats()
        return {
            "total_bottles": stats["total_bottles"],
            "total_capacity": stats["total_capacity"],
            "available_slots": stats["available_slots"],
        }


class WineCellarVivinoSyncSensor(SensorEntity):
    """Sensor reporting the last Vivino account sync."""

    _attr_icon = "mdi:cloud-sync"
    _attr_native_unit_of_measurement = "bottles"

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize sensor."""
        self._hass = hass
        self._attr_unique_id = f"{entry.entry_id}_vivino_sync"
        self._attr_name = "Cork Dork Vivino Cellar"

    def _status(self) -> dict[str, Any] | None:
        domain_data = self._hass.data.get(DOMAIN, {})
        storage = domain_data.get("storage")
        if storage:
            status = storage.get_vivino_sync_status()
            if status:
                return status
        return domain_data.get("vivino_sync_status")

    @property
    def available(self) -> bool:
        """Only meaningful once a Vivino account is configured."""
        return "vivino_account" in self._hass.data.get(DOMAIN, {})

    @property
    def native_value(self) -> int | None:
        """Return the bottles seen on Vivino (cellar + My Wines) at last sync."""
        status = self._status()
        if not status:
            return None
        return (status.get("cellar_total") or 0) + (
            status.get("my_wines_total") or 0
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return details of the last sync."""
        status = self._status()
        if not status:
            return {"synced": False}
        return {
            "synced": True,
            "last_sync": status.get("last_sync"),
            "alias": status.get("alias"),
            "cellar_total": status.get("cellar_total"),
            "cellar_added": status.get("cellar_added"),
            "cellar_removed": status.get("cellar_removed"),
            "cellar_pushed": status.get("cellar_pushed"),
            "cellar_push_failed": status.get("cellar_push_failed"),
            "cellar_pending_push": status.get("cellar_pending_push"),
            "cellar_conflicts": status.get("cellar_conflicts"),
            "wishlist_total": status.get("wishlist_total"),
            "wishlist_imported": status.get("wishlist_imported"),
            "errors": status.get("errors", []),
        }


class WineCellarCabinetSensor(SensorEntity):
    """Sensor for per-cabinet wine count."""

    _attr_icon = "mdi:cupboard"
    _attr_native_unit_of_measurement = "bottles"

    def __init__(self, storage, entry: ConfigEntry, cabinet: dict[str, Any]) -> None:
        """Initialize sensor."""
        self._storage = storage
        self._cabinet_id = cabinet["id"]
        self._attr_unique_id = f"{entry.entry_id}_{cabinet['id']}_count"
        self._attr_name = f"Cork Dork {cabinet['name']}"

    @property
    def native_value(self) -> int:
        """Return bottle count for this cabinet."""
        return len(self._storage.get_wines_in_cabinet(self._cabinet_id))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return cabinet details."""
        cabinet = None
        for c in self._storage.cabinets:
            if c["id"] == self._cabinet_id:
                cabinet = c
                break
        if not cabinet:
            return {}
        capacity = self._storage.cabinet_capacity(cabinet)
        count = self.native_value
        return {
            "cabinet_id": self._cabinet_id,
            "capacity": capacity,
            "available": capacity - count,
        }
