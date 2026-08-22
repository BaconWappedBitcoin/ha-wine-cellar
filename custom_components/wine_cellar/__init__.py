"""Cork Dork integration for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.components import persistent_notification
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_AI_API_KEY,
    CONF_AI_BASE_URL,
    CONF_AI_MODEL,
    CONF_AI_PROVIDER,
    CONF_GEMINI_API_KEY,
    CONF_GEMINI_MODEL,
    DEFAULT_AI_PROVIDER,
    DEFAULT_GEMINI_MODEL,
    DOMAIN,
    FRONTEND_VERSION,
)
from .vivino import VivinoClient
from .websocket import async_register_websocket_commands
from .wine_storage import WineCellarStorage

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]


def _build_ai_client(hass: HomeAssistant, entry: ConfigEntry) -> Any | None:
    """Build the configured AI client (Gemini direct, or OpenAI-compatible), if any."""
    options = entry.options
    provider = options.get(CONF_AI_PROVIDER, DEFAULT_AI_PROVIDER)

    if provider == "openai_compatible":
        base_url = options.get(CONF_AI_BASE_URL, "")
        api_key = options.get(CONF_AI_API_KEY, "")
        model = options.get(CONF_AI_MODEL, "")
        if base_url and api_key and model:
            from .gemini import OpenAICompatibleClient
            return OpenAICompatibleClient(hass, base_url, api_key, model)
        return None

    gemini_api_key = options.get(CONF_GEMINI_API_KEY, "")
    if gemini_api_key:
        from .gemini import GeminiVisionClient
        model = options.get(CONF_GEMINI_MODEL, DEFAULT_GEMINI_MODEL)
        return GeminiVisionClient(hass, gemini_api_key, model)
    return None

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


def _lovelace_resources(hass: HomeAssistant) -> Any | None:
    """The Lovelace resource collection, wherever this HA version keeps it.

    This used to read hass.data["lovelace_resources"], a key Home Assistant
    has never defined. The lookup therefore always came back empty and
    auto-registration silently did nothing, which is what leaves people with
    "Custom element not found: wine-cellar-card" until they add the resource
    by hand.

    Two shapes exist in the wild: newer HA stores a LovelaceData dataclass
    under the LOVELACE_DATA key with a .resources attribute, older HA stored
    a plain dict under "lovelace" with a "resources" entry.
    """
    data = None
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        data = hass.data.get(LOVELACE_DATA)
    except ImportError:
        pass
    if data is None:
        data = hass.data.get("lovelace")
    if data is None:
        return None
    if isinstance(data, dict):
        return data.get("resources")
    return getattr(data, "resources", None)


def _register_frontend_resource(hass: HomeAssistant) -> None:
    """Register the card JS as a Lovelace resource with cache-busted URL.

    Waits for HA to fully start so the resource collection exists.
    """
    url = f"/wine_cellar/wine-cellar-card-{FRONTEND_VERSION}.js"

    def _tell_user(reason: str, how: str) -> None:
        """Surface a failure the user would otherwise only meet as a broken card."""
        _LOGGER.warning("Cork Dork could not register its card automatically: %s", reason)
        persistent_notification.async_create(
            hass,
            f"{reason}\n\n{how}",
            title="Cork Dork: add the card resource manually",
            notification_id=f"{DOMAIN}_frontend_resource",
        )

    async def _async_add_resource(*_args) -> None:
        """Add or update Lovelace resource."""
        try:
            resources = _lovelace_resources(hass)
            if resources is None:
                _tell_user(
                    "Home Assistant did not expose its Lovelace resource list.",
                    f"Add it under Settings > Dashboards > ⋮ > Resources, as a "
                    f"JavaScript module with the URL: {url}",
                )
                return

            # YAML-mode Lovelace keeps its resources in configuration.yaml and
            # offers no way to add one at runtime — the collection has no
            # create method at all. Say so rather than throwing.
            if not hasattr(resources, "async_create_item"):
                _tell_user(
                    "Your dashboards are in YAML mode, so resources cannot be "
                    "added automatically.",
                    "Add this to your Lovelace configuration:\n\n"
                    f"resources:\n  - url: {url}\n    type: module",
                )
                return

            # async_items() does not load the store by itself; without this the
            # collection looks empty and we would add a duplicate resource on
            # every restart.
            ensure_loaded = getattr(resources, "_async_ensure_loaded", None)
            if ensure_loaded is not None:
                await ensure_loaded()
            elif not getattr(resources, "loaded", True):
                await resources.async_load()

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
                _LOGGER.info("Registered wine cellar frontend resource: %s", url)

            persistent_notification.async_dismiss(
                hass, f"{DOMAIN}_frontend_resource"
            )
        except Exception as err:  # noqa: BLE001 - never break setup over the card
            _tell_user(
                f"Registering the card resource failed ({err}).",
                f"Add it under Settings > Dashboards > ⋮ > Resources, as a "
                f"JavaScript module with the URL: {url}",
            )

    # If HA is already running (e.g. integration reload), register immediately.
    # Otherwise wait for full startup so lovelace_resources is available.
    if hass.is_running:
        hass.async_create_task(_async_add_resource())
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _async_add_resource)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Cork Dork from a config entry."""
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

    # Initialize the configured AI client, if any
    ai_client = _build_ai_client(hass, entry)
    if ai_client:
        domain_data["gemini"] = ai_client
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
    ai_client = _build_ai_client(hass, entry)
    if ai_client:
        domain_data["gemini"] = ai_client
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
        reason = call.data.get("reason", "other")
        if storage.remove_wine(wine_id, reason=reason):
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
        schema=vol.Schema({
            vol.Required("wine_id"): cv.string,
            vol.Optional("reason", default="other"): cv.string,
        }),
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
