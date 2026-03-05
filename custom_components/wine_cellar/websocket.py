"""WebSocket API for Wine Cellar frontend communication."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    websocket_api.async_register_command(hass, ws_get_wines)
    websocket_api.async_register_command(hass, ws_get_cabinets)
    websocket_api.async_register_command(hass, ws_add_wine)
    websocket_api.async_register_command(hass, ws_remove_wine)
    websocket_api.async_register_command(hass, ws_update_wine)
    websocket_api.async_register_command(hass, ws_move_wine)
    websocket_api.async_register_command(hass, ws_lookup_barcode)
    websocket_api.async_register_command(hass, ws_search_wine)
    websocket_api.async_register_command(hass, ws_get_stats)
    websocket_api.async_register_command(hass, ws_update_cabinet)
    websocket_api.async_register_command(hass, ws_add_cabinet)
    websocket_api.async_register_command(hass, ws_remove_cabinet)
    websocket_api.async_register_command(hass, ws_recognize_label)
    websocket_api.async_register_command(hass, ws_get_capabilities)
    websocket_api.async_register_command(hass, ws_analyze_wines)
    websocket_api.async_register_command(hass, ws_refresh_wine)
    websocket_api.async_register_command(hass, ws_analyze_single_wine)


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_wines"})
@callback
def ws_get_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all wines."""
    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], {"wines": storage.wines})


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_cabinets"})
@callback
def ws_get_cabinets(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all cabinets."""
    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], {"cabinets": storage.cabinets})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/add_wine",
        vol.Required("wine"): dict,
    }
)
@websocket_api.async_response
async def ws_add_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a new wine."""
    storage = hass.data[DOMAIN]["storage"]
    wine = storage.add_wine(msg["wine"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/remove_wine",
        vol.Required("wine_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a wine by ID."""
    storage = hass.data[DOMAIN]["storage"]
    success = storage.remove_wine(msg["wine_id"])
    if success:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/update_wine",
        vol.Required("wine_id"): str,
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def ws_update_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a wine's details."""
    storage = hass.data[DOMAIN]["storage"]
    wine = storage.update_wine(msg["wine_id"], msg["updates"])
    if wine:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/move_wine",
        vol.Required("wine_id"): str,
        vol.Required("cabinet_id"): str,
        vol.Optional("row"): int,
        vol.Optional("col"): int,
        vol.Optional("zone", default=""): str,
    }
)
@websocket_api.async_response
async def ws_move_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Move a wine to a new location."""
    storage = hass.data[DOMAIN]["storage"]
    wine = storage.move_wine(
        msg["wine_id"],
        msg["cabinet_id"],
        msg.get("row"),
        msg.get("col"),
        msg.get("zone", ""),
    )
    if wine:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/lookup_barcode",
        vol.Required("barcode"): str,
    }
)
@websocket_api.async_response
async def ws_lookup_barcode(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Look up wine info by barcode."""
    storage = hass.data[DOMAIN]["storage"]
    vivino = hass.data[DOMAIN]["vivino"]
    barcode = msg["barcode"]

    cached = storage.get_cached_barcode(barcode)
    if cached:
        connection.send_result(msg["id"], {"result": cached, "cached": True})
        return

    result = await vivino.lookup_barcode(barcode)
    if result:
        storage.cache_barcode(barcode, result)
        await storage.async_save()
    connection.send_result(msg["id"], {"result": result, "cached": False})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/search_wine",
        vol.Required("query"): str,
    }
)
@websocket_api.async_response
async def ws_search_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Search for wines on Vivino."""
    vivino = hass.data[DOMAIN]["vivino"]
    results = await vivino.search_wine(msg["query"])
    connection.send_result(msg["id"], {"results": results})


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_stats"})
@callback
def ws_get_stats(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return cellar statistics."""
    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], storage.get_stats())


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/update_cabinet",
        vol.Required("cabinet_id"): str,
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def ws_update_cabinet(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a cabinet."""
    storage = hass.data[DOMAIN]["storage"]
    cabinet = storage.update_cabinet(msg["cabinet_id"], msg["updates"])
    if cabinet:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"cabinet": cabinet})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/add_cabinet",
        vol.Required("cabinet"): dict,
    }
)
@websocket_api.async_response
async def ws_add_cabinet(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a new cabinet."""
    storage = hass.data[DOMAIN]["storage"]
    cabinet = storage.add_cabinet(msg["cabinet"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"cabinet": cabinet})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/remove_cabinet",
        vol.Required("cabinet_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_cabinet(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a cabinet."""
    storage = hass.data[DOMAIN]["storage"]
    success = storage.remove_cabinet(msg["cabinet_id"])
    if success:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/recognize_label",
        vol.Required("image"): str,
    }
)
@websocket_api.async_response
async def ws_recognize_label(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Recognize wine from label photo using Gemini Vision."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(
            msg["id"],
            {
                "result": None,
                "error": "Gemini API key not configured. Go to Settings > Integrations > Wine Cellar > Configure.",
            },
        )
        return

    _LOGGER.debug("Recognizing label image (%d chars)", len(msg["image"]))
    result = await gemini.recognize_label(msg["image"])

    # The gemini client now returns {"error": "..."} on failure
    if "error" in result:
        _LOGGER.warning("Label recognition failed: %s", result["error"])
        connection.send_result(
            msg["id"], {"result": None, "error": result["error"]}
        )
    else:
        connection.send_result(msg["id"], {"result": result, "error": None})


@websocket_api.websocket_command(
    {vol.Required("type"): "wine_cellar/get_capabilities"}
)
@callback
def ws_get_capabilities(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return integration capabilities."""
    connection.send_result(
        msg["id"],
        {"has_gemini": "gemini" in hass.data.get(DOMAIN, {})},
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "wine_cellar/analyze_wines"}
)
@websocket_api.async_response
async def ws_analyze_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Analyze wines with Gemini to get drink/hold dispositions."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(
            msg["id"],
            {"error": "Gemini API key not configured."},
        )
        return

    storage = hass.data[DOMAIN]["storage"]
    wines = storage.wines
    if not wines:
        connection.send_result(msg["id"], {"error": "No wines to analyze."})
        return

    result = await gemini.analyze_collection(wines)
    if "error" in result:
        connection.send_result(msg["id"], {"error": result["error"]})
        return

    # Apply dispositions to wines
    dispositions = result.get("dispositions", {})
    updated = 0
    for wine_id, disposition in dispositions.items():
        wine = storage.update_wine(wine_id, {"disposition": disposition})
        if wine:
            updated += 1

    if updated:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    connection.send_result(
        msg["id"], {"updated": updated, "total": len(wines)}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/refresh_wine",
        vol.Required("wine_id"): str,
    }
)
@websocket_api.async_response
async def ws_refresh_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Re-lookup wine data from Vivino and update stored fields."""
    storage = hass.data[DOMAIN]["storage"]
    vivino = hass.data[DOMAIN]["vivino"]
    wine = storage.get_wine(msg["wine_id"])
    if not wine:
        connection.send_result(msg["id"], {"error": "Wine not found."})
        return

    # Build search query from wine name + winery + vintage
    parts = []
    if wine.get("winery"):
        parts.append(wine["winery"])
    if wine.get("name"):
        parts.append(wine["name"])
    if wine.get("vintage"):
        parts.append(str(wine["vintage"]))
    query = " ".join(parts) if parts else ""

    if not query:
        connection.send_result(msg["id"], {"error": "No name/winery to search."})
        return

    result = await vivino.search_wine(query)
    if not result:
        connection.send_result(msg["id"], {"error": f"No Vivino results for '{query}'."})
        return

    lookup = result[0]
    # Merge: only overwrite fields that are empty/missing or enrichment fields
    updates: dict[str, Any] = {}
    # Always update enrichment fields from Vivino
    for key in ("rating", "ratings_count", "image_url", "description",
                "food_pairings", "alcohol", "grape_variety"):
        val = lookup.get(key)
        if val:
            updates[key] = val
    # Store Vivino price as retail_price (separate from user's purchase price)
    if lookup.get("price"):
        updates["retail_price"] = lookup["price"]

    # Clear bad descriptions (Vivino error page text)
    cur_desc = wine.get("description", "")
    bad_keywords = ("forbidden", "underage", "try searching", "page is blocked")
    if cur_desc and any(kw in cur_desc.lower() for kw in bad_keywords):
        if "description" not in updates:
            updates["description"] = ""
    # Only fill in fields that are currently empty
    for key in ("region", "country", "type"):
        val = lookup.get(key)
        if val and not wine.get(key):
            updates[key] = val

    if updates:
        updated_wine = storage.update_wine(msg["wine_id"], updates)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
        connection.send_result(msg["id"], {"wine": updated_wine, "updated_fields": list(updates.keys())})
    else:
        connection.send_result(msg["id"], {"wine": wine, "updated_fields": []})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/analyze_single_wine",
        vol.Required("wine_id"): str,
    }
)
@websocket_api.async_response
async def ws_analyze_single_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Analyze a single wine with AI for disposition, drink dates, and ratings."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(
            msg["id"],
            {"error": "Gemini API key not configured."},
        )
        return

    storage = hass.data[DOMAIN]["storage"]
    wine = storage.get_wine(msg["wine_id"])
    if not wine:
        connection.send_result(msg["id"], {"error": "Wine not found."})
        return

    result = await gemini.analyze_single_wine(wine)
    if "error" in result:
        connection.send_result(msg["id"], {"error": result["error"]})
        return

    # Apply results to wine
    updates: dict[str, Any] = {}
    if result.get("disposition"):
        updates["disposition"] = result["disposition"]
    if result.get("drink_by"):
        updates["drink_by"] = result["drink_by"]
    # Set AI description if wine has no description or has error text
    cur_desc = wine.get("description", "")
    bad_kw = ("forbidden", "underage", "try searching", "page is blocked")
    has_bad_desc = cur_desc and any(kw in cur_desc.lower() for kw in bad_kw)
    if result.get("description") and (not cur_desc or has_bad_desc):
        updates["description"] = result["description"]

    # Store AI ratings as a dict in notes or a new field
    ai_ratings: dict[str, int] = {}
    for key in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
        val = result.get(key)
        if val and isinstance(val, (int, float)) and 50 <= val <= 100:
            ai_ratings[key] = int(val)

    if ai_ratings:
        updates["ai_ratings"] = ai_ratings

    if result.get("drink_window"):
        updates["drink_window"] = result["drink_window"]

    if updates:
        updated_wine = storage.update_wine(msg["wine_id"], updates)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
        connection.send_result(msg["id"], {"wine": updated_wine, "analysis": result})
    else:
        connection.send_result(msg["id"], {"wine": wine, "analysis": result})
