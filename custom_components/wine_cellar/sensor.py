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
