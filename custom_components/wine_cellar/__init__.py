"""Wine Cellar Tracker integration for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, FRONTEND_VERSION
from .vivino import VivinoClient
from .websocket import async_register_websocket_commands
from .wine_storage import WineCellarStorage

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


def _register_static_path(hass: HomeAssistant) -> None:
    """Register frontend static path, handling both old and new HA APIs."""
    frontend_dir = Path(__file__).parent / "frontend"
    frontend_path = str(frontend_dir / "wine-cellar-card.js")
    versioned_url = f"/wine_cellar/wine-cellar-card-{FRONTEND_VERSION}.js"
    legacy_url = "/wine_cellar/wine-cellar-card.js"

    try:
        # Modern HA (2024.7+)
        from homeassistant.components.http import StaticPathConfig
        hass.async_create_task(
            hass.http.async_register_static_paths(
                [
                    StaticPathConfig(versioned_url, frontend_path, False),
                    StaticPathConfig(legacy_url, frontend_path, False),
                ]
            )
        )
    except (ImportError, AttributeError, TypeError):
        try:
            # Legacy HA
            hass.http.register_static_path(versioned_url, frontend_path, cache_headers=False)
            hass.http.register_static_path(legacy_url, frontend_path, cache_headers=False)
        except Exception:
            _LOGGER.warning("Could not register frontend static path")


def _register_frontend_resource(hass: HomeAssistant) -> None:
    """Register the card JS as a Lovelace resource with cache-busted URL."""
    url = f"/wine_cellar/wine-cellar-card-{FRONTEND_VERSION}.js"

    # Use the lovelace resources collection if available
    try:
        from homeassistant.components.lovelace.resources import (
            ResourceStorageCollection,
        )
    except ImportError:
        _LOGGER.debug("Lovelace resources API not available, skipping auto-register")
        return

    async def _async_add_resource() -> None:
        """Add or update Lovelace resource."""
        try:
            resources = hass.data.get("lovelace_resources")
            if resources is None:
                return

            # Check existing resources
            existing = None
            for item in resources.async_items():
                if "/wine_cellar/" in item.get("url", ""):
                    existing = item
                    break

            if existing:
                # Update URL with new version
                if existing.get("url") != url:
                    await resources.async_update_item(
                        existing["id"], {"url": url}
                    )
                    _LOGGER.debug("Updated wine cellar frontend resource to %s", url)
            else:
                await resources.async_create_item({"res_type": "module", "url": url})
                _LOGGER.debug("Registered wine cellar frontend resource: %s", url)
        except Exception as err:
            _LOGGER.debug("Could not auto-register frontend resource: %s", err)

    hass.async_create_task(_async_add_resource())


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Wine Cellar from a config entry."""
    domain_data = hass.data.setdefault(DOMAIN, {})

    # Register frontend static path (only once, persists across reloads)
    if not domain_data.get("frontend_registered"):
        _register_static_path(hass)
        # Auto-register as Lovelace resource so the card loads without manual config
        _register_frontend_resource(hass)
        domain_data["frontend_registered"] = True

    # Register WebSocket commands (only once, they persist globally in HA)
    if not domain_data.get("websocket_registered"):
        async_register_websocket_commands(hass)
        domain_data["websocket_registered"] = True

    # Initialize storage
    storage = WineCellarStorage(hass)
    await storage.async_load()

    # Initialize Vivino client
    vivino = VivinoClient(hass)

    # Initialize Gemini client if API key is configured
    gemini_api_key = entry.options.get("gemini_api_key", "")
    if gemini_api_key:
        from .gemini import GeminiVisionClient
        domain_data["gemini"] = GeminiVisionClient(hass, gemini_api_key)
    else:
        domain_data.pop("gemini", None)

    # Store entry-specific data
    domain_data["storage"] = storage
    domain_data["vivino"] = vivino
    domain_data["entry"] = entry

    # Register services
    await _async_register_services(hass, storage, vivino)

    # Listen for options changes
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    # Forward to sensor platform
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    domain_data = hass.data.get(DOMAIN, {})
    gemini_api_key = entry.options.get("gemini_api_key", "")
    if gemini_api_key:
        from .gemini import GeminiVisionClient
        domain_data["gemini"] = GeminiVisionClient(hass, gemini_api_key)
    else:
        domain_data.pop("gemini", None)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        domain_data = hass.data.get(DOMAIN, {})
        # Remove entry-specific data but keep registration flags
        domain_data.pop("storage", None)
        domain_data.pop("vivino", None)
        domain_data.pop("entry", None)
    return unload_ok


async def _async_register_services(
    hass: HomeAssistant, storage: WineCellarStorage, vivino: VivinoClient
) -> None:
    """Register wine cellar services."""

    async def handle_add_wine(call: ServiceCall) -> None:
        """Handle add wine service call."""
        wine_data = {
            "name": call.data.get("name", "Unknown"),
            "winery": call.data.get("winery", ""),
            "type": call.data.get("type", "red"),
            "vintage": call.data.get("vintage"),
            "cabinet_id": call.data.get("cabinet_id", ""),
            "row": call.data.get("row"),
            "col": call.data.get("col"),
            "barcode": call.data.get("barcode", ""),
        }
        storage.add_wine(wine_data)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    async def handle_remove_wine(call: ServiceCall) -> None:
        """Handle remove wine service call."""
        wine_id = call.data["wine_id"]
        if storage.remove_wine(wine_id):
            await storage.async_save()
            hass.bus.async_fire(f"{DOMAIN}_updated")

    async def handle_move_wine(call: ServiceCall) -> None:
        """Handle move wine service call."""
        storage.move_wine(
            call.data["wine_id"],
            call.data["cabinet_id"],
            call.data.get("row"),
            call.data.get("col"),
        )
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    async def handle_scan_barcode(call: ServiceCall) -> None:
        """Handle barcode scan service call."""
        barcode = call.data["barcode"]

        cached = storage.get_cached_barcode(barcode)
        if cached:
            hass.bus.async_fire(f"{DOMAIN}_barcode_result", {
                "barcode": barcode,
                "result": cached,
                "cached": True,
            })
            return

        result = await vivino.lookup_barcode(barcode)
        if result:
            storage.cache_barcode(barcode, result)
            await storage.async_save()

        hass.bus.async_fire(f"{DOMAIN}_barcode_result", {
            "barcode": barcode,
            "result": result,
            "cached": False,
        })

    hass.services.async_register(
        DOMAIN,
        "add_wine",
        handle_add_wine,
        schema=vol.Schema({
            vol.Required("name"): cv.string,
            vol.Optional("winery", default=""): cv.string,
            vol.Optional("type", default="red"): cv.string,
            vol.Optional("vintage"): vol.Coerce(int),
            vol.Optional("cabinet_id", default=""): cv.string,
            vol.Optional("row"): vol.Coerce(int),
            vol.Optional("col"): vol.Coerce(int),
            vol.Optional("barcode", default=""): cv.string,
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "remove_wine",
        handle_remove_wine,
        schema=vol.Schema({vol.Required("wine_id"): cv.string}),
    )

    hass.services.async_register(
        DOMAIN,
        "move_wine",
        handle_move_wine,
        schema=vol.Schema({
            vol.Required("wine_id"): cv.string,
            vol.Required("cabinet_id"): cv.string,
            vol.Optional("row"): vol.Coerce(int),
            vol.Optional("col"): vol.Coerce(int),
        }),
    )

    hass.services.async_register(
        DOMAIN,
        "scan_barcode",
        handle_scan_barcode,
        schema=vol.Schema({vol.Required("barcode"): cv.string}),
    )
