"""WebSocket API for Wine Cellar frontend communication."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def _auto_enrich_wine(hass: HomeAssistant, wine: dict[str, Any]) -> None:
    """Background task: enrich a newly added wine with Vivino data."""
    try:
        vivino = hass.data[DOMAIN].get("vivino")
        if not vivino:
            return
        parts = []
        if wine.get("winery"):
            parts.append(wine["winery"])
        if wine.get("name"):
            parts.append(wine["name"])
        if wine.get("vintage"):
            parts.append(str(wine["vintage"]))
        query = " ".join(parts) if parts else ""
        if not query:
            return

        result = await vivino.search_wine(query)
        if not result:
            return

        lookup = result[0]
        storage = hass.data[DOMAIN]["storage"]
        updates: dict[str, Any] = {}

        # Enrichment fields from Vivino
        for key in ("rating", "ratings_count", "image_url", "description",
                    "food_pairings", "alcohol", "grape_variety"):
            val = lookup.get(key)
            if val and not wine.get(key):
                updates[key] = val

        # Vivino price as retail_price
        if lookup.get("price"):
            updates["retail_price"] = lookup["price"]

        # Fill empty fields
        for key in ("region", "country", "type"):
            val = lookup.get(key)
            if val and not wine.get(key):
                updates[key] = val

        if updates:
            _LOGGER.debug("Auto-enrich wine %s: %s", wine.get("id"), list(updates.keys()))
            storage.update_wine(wine["id"], updates)
            await storage.async_save()
            hass.bus.async_fire(f"{DOMAIN}_updated")
    except Exception as err:
        _LOGGER.warning("Auto-enrich failed for wine %s: %s", wine.get("id"), err)


async def _auto_enrich_buy_list_item(hass: HomeAssistant, item: dict[str, Any]) -> None:
    """Background task: enrich a buy list item with Vivino data."""
    try:
        vivino = hass.data[DOMAIN].get("vivino")
        if not vivino:
            return
        parts = []
        if item.get("winery"):
            parts.append(item["winery"])
        if item.get("name"):
            parts.append(item["name"])
        if item.get("vintage"):
            parts.append(str(item["vintage"]))
        query = " ".join(parts) if parts else ""
        if not query:
            return

        result = await vivino.search_wine(query)
        if not result:
            return

        lookup = result[0]
        storage = hass.data[DOMAIN]["storage"]
        updates: dict[str, Any] = {}

        for key in ("rating", "ratings_count", "image_url", "description",
                    "food_pairings", "alcohol", "grape_variety"):
            val = lookup.get(key)
            if val and not item.get(key):
                updates[key] = val

        if lookup.get("price"):
            updates["retail_price"] = lookup["price"]

        for key in ("region", "country", "type"):
            val = lookup.get(key)
            if val and not item.get(key):
                updates[key] = val

        if updates:
            storage.update_buy_list_item(item["id"], updates)
            await storage.async_save()
            hass.bus.async_fire(f"{DOMAIN}_updated")
    except Exception as err:
        _LOGGER.warning("Auto-enrich failed for buy list item %s: %s", item.get("id"), err)


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
    websocket_api.async_register_command(hass, ws_batch_analyze_wines)
    websocket_api.async_register_command(hass, ws_batch_refresh_vivino)
    websocket_api.async_register_command(hass, ws_extract_wine_list)
    websocket_api.async_register_command(hass, ws_enrich_wine_vivino)
    websocket_api.async_register_command(hass, ws_analyze_wine_transient)
    websocket_api.async_register_command(hass, ws_get_buy_list)
    websocket_api.async_register_command(hass, ws_add_to_buy_list)
    websocket_api.async_register_command(hass, ws_update_buy_list_item)
    websocket_api.async_register_command(hass, ws_remove_from_buy_list)
    websocket_api.async_register_command(hass, ws_move_to_cellar)
    websocket_api.async_register_command(hass, ws_get_backup)
    websocket_api.async_register_command(hass, ws_restore_backup)
    websocket_api.async_register_command(hass, ws_import_wines)
    websocket_api.async_register_command(hass, ws_server_backup_save)
    websocket_api.async_register_command(hass, ws_server_backup_list)
    websocket_api.async_register_command(hass, ws_server_backup_restore)


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
    """Add a new wine, then auto-enrich with Vivino data."""
    storage = hass.data[DOMAIN]["storage"]
    wine = storage.add_wine(msg["wine"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})

    # Auto-enrich: run Vivino lookup in background after adding
    hass.async_create_task(_auto_enrich_wine(hass, wine))


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
    updates = msg["updates"]
    wine = storage.update_wine(msg["wine_id"], updates)
    if wine:
        # Propagate user_rating/tasting_notes to duplicates (same name+winery+vintage)
        rating_fields = {"user_rating", "tasting_notes"} & set(updates.keys())
        if rating_fields:
            dup_updates = {k: updates[k] for k in rating_fields}
            name = wine.get("name", "")
            winery = wine.get("winery", "")
            vintage = wine.get("vintage")
            for other in storage.wines:
                if (
                    other["id"] != wine["id"]
                    and other.get("name") == name
                    and other.get("winery") == winery
                    and other.get("vintage") == vintage
                ):
                    storage.update_wine(other["id"], dup_updates)
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
        vol.Optional("depth", default=0): int,
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
        msg.get("depth", 0),
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
    # Store Vivino price as retail_price (always update — Vivino is real market data)
    _LOGGER.debug("Vivino lookup price: %s", lookup.get("price"))
    if lookup.get("price"):
        updates["retail_price"] = lookup["price"]
    elif not wine.get("retail_price"):
        # Fallback: use Gemini AI to estimate retail price when Vivino has none
        gemini = hass.data[DOMAIN].get("gemini")
        if gemini:
            try:
                ai_result = await gemini.analyze_single_wine(wine)
                ai_price = ai_result.get("estimated_price")
                if ai_price:
                    _LOGGER.debug("Using Gemini estimated price: %s", ai_price)
                    updates["retail_price"] = ai_price
            except Exception as err:
                _LOGGER.debug("Gemini price fallback failed: %s", err)

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

    # Store AI estimated price as retail_price if not already set
    est_price = result.get("estimated_price")
    _LOGGER.debug("AI estimated_price: %s, wine retail_price: %s", est_price, wine.get("retail_price"))
    if est_price and isinstance(est_price, (int, float)) and est_price > 0:
        if not wine.get("retail_price"):
            updates["retail_price"] = round(float(est_price), 2)

    _LOGGER.debug("Final updates for wine %s: %s", msg["wine_id"], list(updates.keys()))
    if updates:
        updated_wine = storage.update_wine(msg["wine_id"], updates)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
        connection.send_result(msg["id"], {"wine": updated_wine, "analysis": result})
    else:
        connection.send_result(msg["id"], {"wine": wine, "analysis": result})


@websocket_api.websocket_command(
    {vol.Required("type"): "wine_cellar/batch_analyze_wines"}
)
@websocket_api.async_response
async def ws_batch_analyze_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch AI analysis: run full analyze_single_wine on every wine."""
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

    updated = 0
    errors = 0
    total = len(wines)

    for wine in wines:
        try:
            result = await gemini.analyze_single_wine(wine)
            if "error" in result:
                _LOGGER.warning(
                    "Batch AI: error for wine %s: %s",
                    wine.get("id"), result["error"],
                )
                errors += 1
                continue

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

            # AI ratings
            ai_ratings: dict[str, int] = {}
            for key in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
                val = result.get(key)
                if val and isinstance(val, (int, float)) and 50 <= val <= 100:
                    ai_ratings[key] = int(val)
            if ai_ratings:
                updates["ai_ratings"] = ai_ratings

            if result.get("drink_window"):
                updates["drink_window"] = result["drink_window"]

            # Estimated price as retail_price if not already set
            est_price = result.get("estimated_price")
            if est_price and isinstance(est_price, (int, float)) and est_price > 0:
                if not wine.get("retail_price"):
                    updates["retail_price"] = round(float(est_price), 2)

            if updates:
                storage.update_wine(wine["id"], updates)
                updated += 1

            # Small delay between API calls to avoid rate limits
            await asyncio.sleep(0.5)

        except Exception as err:
            _LOGGER.warning(
                "Batch AI: exception for wine %s: %s", wine.get("id"), err
            )
            errors += 1

    if updated:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    connection.send_result(
        msg["id"],
        {"updated": updated, "total": total, "errors": errors},
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "wine_cellar/batch_refresh_vivino"}
)
@websocket_api.async_response
async def ws_batch_refresh_vivino(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch Vivino refresh: look up every wine on Vivino and update data."""
    vivino = hass.data[DOMAIN].get("vivino")
    if not vivino:
        connection.send_result(
            msg["id"],
            {"error": "Vivino client not available."},
        )
        return

    storage = hass.data[DOMAIN]["storage"]
    wines = storage.wines
    if not wines:
        connection.send_result(msg["id"], {"error": "No wines to refresh."})
        return

    updated = 0
    errors = 0
    total = len(wines)

    for wine in wines:
        try:
            # Build search query
            parts = []
            if wine.get("winery"):
                parts.append(wine["winery"])
            if wine.get("name"):
                parts.append(wine["name"])
            if wine.get("vintage"):
                parts.append(str(wine["vintage"]))
            query = " ".join(parts) if parts else ""

            if not query:
                continue

            result = await vivino.search_wine(query)
            if not result:
                continue

            lookup = result[0]
            updates: dict[str, Any] = {}

            # Always update enrichment fields from Vivino
            for key in ("rating", "ratings_count", "image_url", "description",
                        "food_pairings", "alcohol", "grape_variety"):
                val = lookup.get(key)
                if val:
                    updates[key] = val

            # Vivino price as retail_price
            if lookup.get("price"):
                updates["retail_price"] = lookup["price"]
            elif not wine.get("retail_price"):
                # Fallback: use Gemini AI to estimate retail price
                gemini = hass.data[DOMAIN].get("gemini")
                if gemini:
                    try:
                        ai_result = await gemini.analyze_single_wine(wine)
                        ai_price = ai_result.get("estimated_price")
                        if ai_price:
                            _LOGGER.debug(
                                "Batch: Gemini estimated price for %s: %s",
                                wine.get("id"), ai_price,
                            )
                            updates["retail_price"] = ai_price
                    except Exception as err:
                        _LOGGER.debug("Batch: Gemini price fallback failed: %s", err)

            # Clear bad descriptions
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
                storage.update_wine(wine["id"], updates)
                updated += 1

            # Small delay to avoid rate limits
            await asyncio.sleep(1.0)

        except Exception as err:
            _LOGGER.warning(
                "Batch Vivino: exception for wine %s: %s", wine.get("id"), err
            )
            errors += 1

    if updated:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    connection.send_result(
        msg["id"],
        {"updated": updated, "total": total, "errors": errors},
    )


# --- Wine List Scanner ---


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/extract_wine_list",
        vol.Required("image"): str,
    }
)
@websocket_api.async_response
async def ws_extract_wine_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Extract wines from a restaurant wine list photo using Gemini Vision."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(
            msg["id"],
            {"error": "Gemini API key not configured."},
        )
        return

    result = await gemini.extract_wine_list(msg["image"])

    # Send result directly — on success it contains {wines, restaurant_name, currency}
    # On error it contains {error: "message"}
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/enrich_wine_vivino",
        vol.Required("wine"): dict,
    }
)
@websocket_api.async_response
async def ws_enrich_wine_vivino(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Look up a transient wine on Vivino (not stored in cellar)."""
    vivino = hass.data[DOMAIN].get("vivino")
    if not vivino:
        connection.send_result(msg["id"], {"result": None, "error": "Vivino not available."})
        return

    wine = msg["wine"]
    parts = []
    if wine.get("winery"):
        parts.append(wine["winery"])
    if wine.get("name"):
        parts.append(wine["name"])
    if wine.get("vintage"):
        parts.append(str(wine["vintage"]))
    query = " ".join(parts)

    if not query:
        connection.send_result(msg["id"], {"result": None, "error": "No search query."})
        return

    try:
        result = await vivino.search_wine(query)
        if not result:
            connection.send_result(msg["id"], {"result": None})
            return
        connection.send_result(msg["id"], {"result": result[0]})
    except Exception as err:
        _LOGGER.warning("Vivino enrich error: %s", err)
        connection.send_result(msg["id"], {"result": None, "error": str(err)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/analyze_wine_transient",
        vol.Required("wine"): dict,
    }
)
@websocket_api.async_response
async def ws_analyze_wine_transient(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """AI analysis for a transient wine (not stored in cellar)."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(msg["id"], {"result": None, "error": "Gemini not configured."})
        return

    try:
        result = await gemini.analyze_single_wine(msg["wine"])
        if "error" in result:
            connection.send_result(msg["id"], {"result": None, "error": result["error"]})
        else:
            connection.send_result(msg["id"], {"result": result})
    except Exception as err:
        _LOGGER.warning("Transient AI analysis error: %s", err)
        connection.send_result(msg["id"], {"result": None, "error": str(err)})


# ── Buy List ──────────────────────────────────────────────────────────


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_buy_list"})
@callback
def ws_get_buy_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all buy list items."""
    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], {"buy_list": storage.buy_list})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/add_to_buy_list",
        vol.Required("wine"): dict,
    }
)
@websocket_api.async_response
async def ws_add_to_buy_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a wine to the buy list, then auto-enrich with Vivino."""
    storage = hass.data[DOMAIN]["storage"]
    item = storage.add_buy_list_item(msg["wine"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"item": item})

    # Auto-enrich in background
    hass.async_create_task(_auto_enrich_buy_list_item(hass, item))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/update_buy_list_item",
        vol.Required("item_id"): str,
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def ws_update_buy_list_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a buy list item's fields."""
    storage = hass.data[DOMAIN]["storage"]
    item = storage.update_buy_list_item(msg["item_id"], msg["updates"])
    if item:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
        connection.send_result(msg["id"], {"item": item})
    else:
        connection.send_result(msg["id"], {"error": "Item not found."})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/remove_from_buy_list",
        vol.Required("item_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_from_buy_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a wine from the buy list."""
    storage = hass.data[DOMAIN]["storage"]
    success = storage.remove_buy_list_item(msg["item_id"])
    if success:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/move_to_cellar",
        vol.Required("item_id"): str,
        vol.Required("cabinet_id"): str,
        vol.Optional("row"): int,
        vol.Optional("col"): int,
        vol.Optional("zone", default=""): str,
        vol.Optional("depth", default=0): int,
    }
)
@websocket_api.async_response
async def ws_move_to_cellar(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Move a wine from buy list to cellar."""
    storage = hass.data[DOMAIN]["storage"]
    item = storage.get_buy_list_item(msg["item_id"])
    if not item:
        connection.send_result(msg["id"], {"error": "Item not found in buy list."})
        return

    # Build wine data from buy list item + location
    wine_data = {**item}
    wine_data.pop("id", None)
    wine_data["cabinet_id"] = msg["cabinet_id"]
    wine_data["row"] = msg.get("row")
    wine_data["col"] = msg.get("col")
    wine_data["zone"] = msg.get("zone", "")
    wine_data["depth"] = msg.get("depth", 0)

    wine = storage.add_wine(wine_data)
    storage.remove_buy_list_item(msg["item_id"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})


# ── Backup / Restore / Import ────────────────────────────────────────


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_backup"})
@callback
def ws_get_backup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a full backup of all cellar data."""
    storage = hass.data[DOMAIN]["storage"]
    backup = storage.get_backup_data()
    backup["version"] = "1.0"
    backup["timestamp"] = datetime.now(timezone.utc).isoformat()
    connection.send_result(msg["id"], backup)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/restore_backup",
        vol.Required("backup"): dict,
    }
)
@websocket_api.async_response
async def ws_restore_backup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Restore cellar data from a backup JSON."""
    storage = hass.data[DOMAIN]["storage"]
    backup = msg["backup"]

    wines = backup.get("wines", [])
    cabinets = backup.get("cabinets", [])
    buy_list = backup.get("buy_list", [])

    if not isinstance(wines, list) or not isinstance(cabinets, list):
        connection.send_result(
            msg["id"],
            {"error": "Invalid backup format: wines and cabinets must be arrays."},
        )
        return

    counts = storage.restore_data(wines, cabinets, buy_list)
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")

    _LOGGER.info(
        "Backup restored: %d wines, %d cabinets, %d buy list items",
        counts["wines"], counts["cabinets"], counts["buy_list"],
    )
    connection.send_result(msg["id"], {"success": True, **counts})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/import_wines",
        vol.Required("wines"): list,
    }
)
@websocket_api.async_response
async def ws_import_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch import wines (each gets a new UUID)."""
    storage = hass.data[DOMAIN]["storage"]
    count = storage.import_wines(msg["wines"])
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")

    _LOGGER.info("Imported %d wines", count)
    connection.send_result(msg["id"], {"imported": count})


# ── Cloud Sync (save/load backup file) ─────────────────────────────


import json
from pathlib import Path


def _get_server_backup_dir(hass: HomeAssistant) -> Path:
    """Return the server backup directory in HA config directory."""
    d = Path(hass.config.config_dir) / "wine_cellar_backups"
    d.mkdir(exist_ok=True)
    return d


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/server_backup_save"})
@websocket_api.async_response
async def ws_server_backup_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Save a timestamped cellar backup to the HA server."""
    storage = hass.data[DOMAIN]["storage"]
    backup = storage.get_backup_data()
    backup["version"] = "1.0"
    now = datetime.now(timezone.utc)
    backup["timestamp"] = now.isoformat()

    filename = f"wine_cellar_{now.strftime('%Y%m%d_%H%M%S')}.json"
    backup_dir = _get_server_backup_dir(hass)
    backup_path = backup_dir / filename

    try:
        await hass.async_add_executor_job(
            backup_path.write_text, json.dumps(backup, indent=2), "utf-8"
        )
        _LOGGER.info("Server backup saved to %s", backup_path)
        connection.send_result(msg["id"], {
            "success": True,
            "filename": filename,
            "wines": len(backup.get("wines", [])),
            "cabinets": len(backup.get("cabinets", [])),
            "buy_list": len(backup.get("buy_list", [])),
            "timestamp": backup["timestamp"],
        })
    except Exception as err:
        _LOGGER.error("Failed to save server backup: %s", err)
        connection.send_result(msg["id"], {"error": str(err)})


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/server_backup_list"})
@websocket_api.async_response
async def ws_server_backup_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List available server backups."""
    backup_dir = _get_server_backup_dir(hass)

    def _list_backups() -> list[dict]:
        files = sorted(backup_dir.glob("wine_cellar_*.json"), reverse=True)
        result = []
        for f in files[:20]:  # limit to 20 most recent
            try:
                data = json.loads(f.read_text("utf-8"))
                result.append({
                    "filename": f.name,
                    "timestamp": data.get("timestamp", ""),
                    "wines": len(data.get("wines", [])),
                    "cabinets": len(data.get("cabinets", [])),
                    "buy_list": len(data.get("buy_list", [])),
                    "size": f.stat().st_size,
                })
            except Exception:
                result.append({"filename": f.name, "error": "unreadable"})
        return result

    try:
        backups = await hass.async_add_executor_job(_list_backups)
        connection.send_result(msg["id"], {"backups": backups})
    except Exception as err:
        _LOGGER.error("Failed to list server backups: %s", err)
        connection.send_result(msg["id"], {"error": str(err)})


@websocket_api.websocket_command({
    vol.Required("type"): "wine_cellar/server_backup_restore",
    vol.Required("filename"): str,
})
@websocket_api.async_response
async def ws_server_backup_restore(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Restore cellar from a server backup file."""
    backup_dir = _get_server_backup_dir(hass)
    backup_path = backup_dir / msg["filename"]

    # Prevent path traversal
    if not backup_path.resolve().parent == backup_dir.resolve():
        connection.send_result(msg["id"], {"error": "Invalid filename."})
        return

    if not backup_path.exists():
        connection.send_result(msg["id"], {"error": f"Backup not found: {msg['filename']}"})
        return

    try:
        text = await hass.async_add_executor_job(backup_path.read_text, "utf-8")
        data = json.loads(text)

        wines = data.get("wines", [])
        cabinets = data.get("cabinets", [])
        buy_list = data.get("buy_list", [])

        if not isinstance(wines, list) or not isinstance(cabinets, list):
            connection.send_result(msg["id"], {"error": "Invalid backup file format."})
            return

        storage = hass.data[DOMAIN]["storage"]
        counts = storage.restore_data(wines, cabinets, buy_list)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

        _LOGGER.info(
            "Server restore from %s: %d wines, %d cabinets, %d buy list items",
            backup_path, counts["wines"], counts["cabinets"], counts["buy_list"],
        )
        connection.send_result(msg["id"], {
            "success": True,
            "filename": msg["filename"],
            "timestamp": data.get("timestamp", ""),
            **counts,
        })
    except Exception as err:
        _LOGGER.error("Failed to restore server backup: %s", err)
        connection.send_result(msg["id"], {"error": str(err)})
