"""Cork Dork integration for Home Assistant."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval

from .const import (
    CONF_AI_API_KEY,
    CONF_AI_BASE_URL,
    CONF_AI_MODEL,
    CONF_AI_PROVIDER,
    CONF_GEMINI_API_KEY,
    CONF_GEMINI_MODEL,
    CONF_VIVINO_AUTO_SYNC,
    CONF_VIVINO_CELLAR_URL,
    CONF_VIVINO_SESSION_COOKIE,
    DEFAULT_AI_PROVIDER,
    DEFAULT_GEMINI_MODEL,
    DOMAIN,
    FRONTEND_VERSION,
    VIVINO_AUTO_SYNC_INTERVAL_HOURS,
)
from .vivino import VivinoClient
from .vivino_account import VivinoAccountClient, async_sync_from_vivino
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


def _register_frontend_resource(hass: HomeAssistant) -> None:
    """Register the card JS as a Lovelace resource with cache-busted URL.

    Waits for HA to fully start so that lovelace_resources is available.
    """
    url = f"/wine_cellar/wine-cellar-card-{FRONTEND_VERSION}.js"

    # Use the lovelace resources collection if available
    try:
        from homeassistant.components.lovelace.resources import (
            ResourceStorageCollection,
        )
    except ImportError:
        _LOGGER.debug("Lovelace resources API not available, skipping auto-register")
        return

    async def _async_add_resource(*_args) -> None:
        """Add or update Lovelace resource."""
        try:
            resources = hass.data.get("lovelace_resources")
            if resources is None:
                _LOGGER.debug(
                    "lovelace_resources not in hass.data, "
                    "card must be added manually via Settings > Dashboards > Resources: %s",
                    url,
                )
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
            _LOGGER.warning(
                "Could not auto-register frontend resource (%s). "
                "Add it manually via Settings > Dashboards > Resources: %s",
                err,
                url,
            )

    # If HA is already running (e.g. integration reload), register immediately.
    # Otherwise wait for full startup so lovelace_resources is available.
    if hass.is_running:
        hass.async_create_task(_async_add_resource())
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _async_add_resource)


def _setup_vivino_account(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Create/remove the Vivino account client and auto-sync timer from options."""
    domain_data = hass.data.setdefault(DOMAIN, {})

    # Cancel any previous auto-sync timer
    cancel = domain_data.pop("vivino_auto_sync_unsub", None)
    if cancel:
        cancel()

    cookie = entry.options.get(CONF_VIVINO_SESSION_COOKIE, "").strip()
    cellar_url = entry.options.get(CONF_VIVINO_CELLAR_URL, "").strip()
    if not cookie or not cellar_url:
        domain_data.pop("vivino_account", None)
        return

    domain_data["vivino_account"] = VivinoAccountClient(hass, cookie, cellar_url)

    if entry.options.get(CONF_VIVINO_AUTO_SYNC, False):
        async def _auto_sync(_now: Any) -> None:
            client = domain_data.get("vivino_account")
            storage = domain_data.get("storage")
            if not client or not storage:
                return
            try:
                await async_sync_from_vivino(hass, storage, client)
            except Exception as err:
                _LOGGER.warning("Scheduled Vivino sync failed: %s", err)

        domain_data["vivino_auto_sync_unsub"] = async_track_time_interval(
            hass, _auto_sync, timedelta(hours=VIVINO_AUTO_SYNC_INTERVAL_HOURS)
        )


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

    # Initialize Vivino account connection if credentials are configured
    _setup_vivino_account(hass, entry)

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

    _setup_vivino_account(hass, entry)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        domain_data = hass.data.get(DOMAIN, {})
        # Remove entry-specific data but keep registration flags
        cancel = domain_data.pop("vivino_auto_sync_unsub", None)
        if cancel:
            cancel()
        domain_data.pop("vivino_account", None)
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

    async def handle_sync_vivino(call: ServiceCall) -> ServiceResponse:
        """Handle Vivino account sync service call."""
        client = hass.data[DOMAIN].get("vivino_account")
        if not client:
            # Raise so the service call fails visibly instead of silently no-oping
            raise HomeAssistantError(
                "No Vivino account is configured. Add your Vivino email and "
                "password via Settings > Devices & Services > Cork Dork > Configure."
            )

        target = call.data.get("target", "all")
        result = await async_sync_from_vivino(
            hass,
            storage,
            client,
            sync_cellar=target in ("all", "cellar"),
            sync_wishlist=target in ("all", "wishlist"),
            sync_my_wines=target in ("all", "my_wines"),
        )
        hass.bus.async_fire(f"{DOMAIN}_vivino_sync_result", result)

        # If every section failed and nothing came back, surface the failure
        # in the service call itself instead of burying it in attributes.
        nothing_synced = not (
            result["cellar_total"] or result["wishlist_total"]
            or result["my_wines_total"]
            or result["cellar_imported"] or result["wishlist_imported"]
            or result["my_wines_imported"]
        )
        if result["errors"] and nothing_synced:
            raise HomeAssistantError(
                "Vivino sync failed: " + "; ".join(result["errors"])
            )

        if call.return_response:
            return result
        return None

    hass.services.async_register(
        DOMAIN,
        "scan_barcode",
        handle_scan_barcode,
        schema=vol.Schema({vol.Required("barcode"): cv.string}),
    )

    hass.services.async_register(
        DOMAIN,
        "sync_vivino",
        handle_sync_vivino,
        schema=vol.Schema({
            vol.Optional("target", default="all"): vol.In(
                ["all", "cellar", "wishlist", "my_wines"]
            ),
        }),
        supports_response=SupportsResponse.OPTIONAL,
    )
