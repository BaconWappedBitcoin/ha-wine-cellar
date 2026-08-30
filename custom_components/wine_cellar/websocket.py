"""WebSocket API for Wine Cellar frontend communication."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import (
    CONF_AI_FALLBACK_ALWAYS,
    CONF_DISMISSED_ARRANGEMENTS,
    CONF_METADATA_CURRENCY,
    CONF_METADATA_LANGUAGE,
    CONF_SERVER_BACKUP_KEEP,
    CONF_VIVINO_MODE,
    CONF_WINE_HISTORY,
    CONF_WINES,
    DEFAULT_METADATA_CURRENCY,
    DEFAULT_METADATA_LANGUAGE,
    DEFAULT_SERVER_BACKUP_KEEP,
    DEFAULT_VIVINO_MODE,
    DOMAIN,
    VIVINO_MODE_SYNC,
    SERVER_BACKUP_KEEP_CHOICES,
    SUPPORTED_METADATA_CURRENCIES,
    SUPPORTED_METADATA_LANGUAGES,
)
from . import photos

_LOGGER = logging.getLogger(__name__)


# Generic wine-domain words carry no identifying signal on their own (two
# completely unrelated wines can both be a "Chateau ... Rouge"), so they're
# excluded before comparing name/winery word overlap.
_GENERIC_WINE_WORDS = {
    "chateau", "château", "domaine", "clos", "cave", "caves", "cellar", "cellars",
    "winery", "wine", "wines", "vineyard", "vineyards", "estate", "vignoble",
    "rouge", "blanc", "rose", "rosé", "red", "white", "sparkling", "nv",
    "de", "du", "des", "la", "le", "les", "et", "the", "of", "and",
    "grand", "cru", "premier",
}


def _significant_words(text: str) -> set[str]:
    return {w for w in text.lower().split() if w not in _GENERIC_WINE_WORDS and len(w) > 2}


def _get_metadata_language(hass: HomeAssistant) -> str:
    """Return the user's chosen language for Vivino/AI metadata."""
    storage = hass.data[DOMAIN]["storage"]
    return storage.settings.get(CONF_METADATA_LANGUAGE, DEFAULT_METADATA_LANGUAGE)


def _get_metadata_currency(hass: HomeAssistant) -> str:
    """Return the user's chosen currency for Vivino/AI price data."""
    storage = hass.data[DOMAIN]["storage"]
    return storage.settings.get(CONF_METADATA_CURRENCY, DEFAULT_METADATA_CURRENCY)


def _get_vivino_mode(hass: HomeAssistant) -> str:
    """Return the configured Vivino mode (import/sync) from the config entry."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if entries:
        return entries[0].options.get(CONF_VIVINO_MODE, DEFAULT_VIVINO_MODE)
    return DEFAULT_VIVINO_MODE


def _select_wines(storage: Any, wine_ids: list[str] | None) -> list[dict[str, Any]]:
    """All wines, or just the requested ids, keeping the stored order.

    Unknown ids are ignored rather than treated as an error: the frontend's
    list can be a moment stale, and refreshing the wines that do exist beats
    refusing the whole batch.
    """
    if not wine_ids:
        return list(storage.wines)
    wanted = set(wine_ids)
    return [w for w in storage.wines if w.get("id") in wanted]


def _build_ai_updates(wine: dict[str, Any], result: dict[str, Any], currency: str = "USD") -> dict[str, Any]:
    """Build a wine `updates` dict from a Gemini analyze_single_wine result."""
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

    ai_ratings: dict[str, int] = {}
    for key in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
        val = result.get(key)
        if val and isinstance(val, (int, float)) and 50 <= val <= 100:
            ai_ratings[key] = int(val)
    if ai_ratings:
        updates["ai_ratings"] = ai_ratings

    if result.get("drink_window"):
        updates["drink_window"] = result["drink_window"]

    est_price = result.get("estimated_price")
    if est_price and isinstance(est_price, (int, float)) and est_price > 0:
        # A price already captured in a different currency is stale, not
        # "already have one" — an unconverted number in the wrong currency
        # is worse than no number at all.
        if not wine.get("retail_price") or wine.get("retail_price_currency") != currency:
            updates["retail_price"] = round(float(est_price), 2)
            updates["retail_price_currency"] = currency

    # Fill in fields the AI could read off the label photo (or knows from
    # the producer) — only when the wine doesn't already have them, same
    # "fill empty fields only" rule Vivino's own enrichment follows.
    for key in ("region", "country", "grape_variety", "alcohol"):
        val = result.get(key)
        if val and not wine.get(key):
            updates[key] = val

    return updates


def _vivino_match_is_trustworthy(subject: dict[str, Any], lookup: dict[str, Any]) -> bool:
    """Guard against Vivino's fuzzy search returning an unrelated wine.

    Vivino's text search can rank an unrelated (often pricier) bottle first
    for uncommon/regional wines, and the caller has no other way to tell —
    so compare winery+name against what was actually searched for and
    refuse the match if it shares no distinctive words, rather than
    silently writing another wine's price/rating/description onto this one.
    """
    subject_words = _significant_words(f"{subject.get('winery', '')} {subject.get('name', '')}")
    lookup_words = _significant_words(f"{lookup.get('winery', '')} {lookup.get('name', '')}")
    if not subject_words or not lookup_words:
        return True
    overlap = len(subject_words & lookup_words) / len(subject_words | lookup_words)
    return overlap >= 0.15


# Racks are described by plain numbers that the storage layer writes wherever
# it is told. A negative or absurd row count is not a shape any cellar has, and
# once written it makes every position calculation nonsense, so it is refused
# at the edge rather than repaired later.
_CABINET_LIMITS = {"rows": (1, 50), "cols": (1, 50), "depth": (1, 20)}


def _cabinet_shape_error(fields: dict[str, Any]) -> str | None:
    """Say what is wrong with a cabinet's dimensions, or None if nothing is."""
    for key, (low, high) in _CABINET_LIMITS.items():
        if key not in fields or fields[key] is None:
            continue
        value = fields[key]
        if isinstance(value, bool) or not isinstance(value, int):
            return f"{key} must be a whole number"
        if not low <= value <= high:
            return f"{key} must be between {low} and {high}"

    rows = fields.get("storage_rows")
    if rows is not None:
        if not isinstance(rows, list):
            return "storage_rows must be a list"
        for entry in rows:
            if not isinstance(entry, dict):
                return "each storage row must be an object"
            row = entry.get("row")
            if isinstance(row, bool) or not isinstance(row, int) or row < 0:
                return "each storage row needs a row index of 0 or more"
            capacity = entry.get("capacity")
            if capacity is not None and (
                isinstance(capacity, bool) or not isinstance(capacity, int) or capacity < 0
            ):
                return "a storage row's capacity cannot be negative"
            boxes = entry.get("boxes")
            if boxes is not None:
                if not isinstance(boxes, list) or any(
                    isinstance(b, bool) or not isinstance(b, int) or b < 0 for b in boxes
                ):
                    return "box sizes must be whole numbers of 0 or more"
    return None


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

        currency = _get_metadata_currency(hass)
        result = await vivino.search_wine(
            query, _get_metadata_language(hass), currency, wine.get("vintage")
        )
        if not result:
            return

        lookup = result[0]
        if not _vivino_match_is_trustworthy(wine, lookup):
            _LOGGER.debug(
                "Auto-enrich: Vivino match for '%s' looks unrelated (%s %s), skipping",
                query, lookup.get("winery"), lookup.get("name"),
            )
            return

        storage = hass.data[DOMAIN]["storage"]
        updates: dict[str, Any] = {}

        # Enrichment fields from Vivino
        for key in ("rating", "ratings_count", "image_url", "description",
                    "food_pairings", "alcohol", "grape_variety"):
            val = lookup.get(key)
            if val and not wine.get(key):
                updates[key] = val

        # Vivino price as retail_price, but only into an empty field. Every
        # other field here fills gaps rather than overwriting; this one used to
        # replace whatever was there, including an AI estimate the user had
        # already seen on screen.
        if lookup.get("price") and not wine.get("retail_price"):
            updates["retail_price"] = lookup["price"]
            updates["retail_price_currency"] = currency

        # Fill empty fields
        for key in ("region", "country", "type"):
            val = lookup.get(key)
            if val and not wine.get(key):
                updates[key] = val

        if updates:
            updates["vivino_updated_at"] = datetime.now(timezone.utc).isoformat()
            if lookup.get("vivino_id"):
                updates["vivino_id"] = lookup["vivino_id"]
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

        currency = _get_metadata_currency(hass)
        result = await vivino.search_wine(
            query, _get_metadata_language(hass), currency, item.get("vintage")
        )
        if not result:
            return

        lookup = result[0]
        if not _vivino_match_is_trustworthy(item, lookup):
            _LOGGER.debug(
                "Auto-enrich: Vivino match for '%s' looks unrelated (%s %s), skipping",
                query, lookup.get("winery"), lookup.get("name"),
            )
            return

        storage = hass.data[DOMAIN]["storage"]
        updates: dict[str, Any] = {}

        for key in ("rating", "ratings_count", "image_url", "description",
                    "food_pairings", "alcohol", "grape_variety"):
            val = lookup.get(key)
            if val and not item.get(key):
                updates[key] = val

        if lookup.get("price"):
            updates["retail_price"] = lookup["price"]
            updates["retail_price_currency"] = currency

        for key in ("region", "country", "type"):
            val = lookup.get(key)
            if val and not item.get(key):
                updates[key] = val

        if updates:
            updates["vivino_updated_at"] = datetime.now(timezone.utc).isoformat()
            if lookup.get("vivino_id"):
                updates["vivino_id"] = lookup["vivino_id"]
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
    websocket_api.async_register_command(hass, ws_get_pending_removals)
    websocket_api.async_register_command(hass, ws_resolve_vivino_removal)
    websocket_api.async_register_command(hass, ws_resolve_vivino_conflict)
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
    websocket_api.async_register_command(hass, ws_update_settings)
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
    websocket_api.async_register_command(hass, ws_get_wine_history)
    websocket_api.async_register_command(hass, ws_clear_wine_history)
    websocket_api.async_register_command(hass, ws_restore_wine)
    websocket_api.async_register_command(hass, ws_get_backup)
    websocket_api.async_register_command(hass, ws_restore_backup)
    websocket_api.async_register_command(hass, ws_import_wines)
    websocket_api.async_register_command(hass, ws_reorder_zone)
    websocket_api.async_register_command(hass, ws_server_backup_delete)
    websocket_api.async_register_command(hass, ws_get_storage_info)
    websocket_api.async_register_command(hass, ws_server_backup_save)
    websocket_api.async_register_command(hass, ws_server_backup_list)
    websocket_api.async_register_command(hass, ws_server_backup_restore)
    websocket_api.async_register_command(hass, ws_sync_vivino)
    websocket_api.async_register_command(hass, ws_vivino_status)


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
        vol.Required("type"): "wine_cellar/reorder_zone",
        vol.Required("cabinet_id"): str,
        vol.Required("zone"): str,
        vol.Required("wine_ids"): [str],
    }
)
@websocket_api.async_response
async def ws_reorder_zone(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Renumber a bin's slots in one pass, instead of a move per bottle."""
    storage = hass.data[DOMAIN]["storage"]
    count = storage.reorder_zone(msg["cabinet_id"], msg["zone"], msg["wine_ids"])
    if count:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"reordered": count})


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
    # A photo arrives inline from the camera; it goes to disk immediately so it
    # never becomes part of what every later page load has to carry.
    await photos.store_wine_photos(hass, wine)
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})

    # Auto-enrich: run Vivino lookup in background after adding
    hass.async_create_task(_auto_enrich_wine(hass, wine))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/remove_wine",
        vol.Required("wine_id"): str,
        vol.Optional("reason", default="other"): str,
    }
)
@websocket_api.async_response
async def ws_remove_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a wine by ID, archiving to history."""
    storage = hass.data[DOMAIN]["storage"]
    success = storage.remove_wine(msg["wine_id"], reason=msg.get("reason", "other"))
    if success:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {vol.Required("type"): "wine_cellar/get_pending_removals"}
)
@callback
def ws_get_pending_removals(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return Vivino-side removals awaiting the user's bottle choice.

    Also carries the sync conflicts (both sides changed a wine differently),
    so the card can offer manual resolution instead of burying them in the
    sync sensor's attributes.
    """
    storage = hass.data[DOMAIN]["storage"]
    status = storage.get_vivino_sync_status() or {}
    connection.send_result(
        msg["id"],
        {
            "pending_removals": storage.get_vivino_pending_removals(),
            "conflicts": status.get("conflicts_detail") or [],
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/resolve_vivino_removal",
        vol.Required("wine_id"): str,
    }
)
@websocket_api.async_response
async def ws_resolve_vivino_removal(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove the bottle the user picked for a pending Vivino removal."""
    storage = hass.data[DOMAIN]["storage"]
    wine = next(
        (w for w in storage.wines if w.get("id") == msg["wine_id"]), None
    )
    if not wine:
        connection.send_result(msg["id"], {"error": "Wine not found."})
        return
    vid = str(wine.get("vivino_id") or "")
    pending = storage.get_vivino_pending_removals()
    entry = pending.get(vid)
    if not entry:
        connection.send_result(
            msg["id"], {"error": "No pending Vivino removal for this wine."}
        )
        return
    success = storage.remove_wine(msg["wine_id"], reason="removed_on_vivino")
    if success:
        entry["count"] = int(entry.get("count", 1)) - 1
        if entry["count"] <= 0:
            pending.pop(vid, None)
        storage.set_vivino_pending_removals(pending)
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(
        msg["id"], {"success": success, "pending_removals": pending}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/resolve_vivino_conflict",
        vol.Required("vivino_id"): str,
    }
)
@websocket_api.async_response
async def ws_resolve_vivino_conflict(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Resolve a sync conflict by declaring Cork Dork's count the truth.

    The user has reviewed (and possibly corrected) their local bottles, so
    Vivino is adjusted to match Cork Dork's current count and the baseline
    is advanced, closing the conflict.
    """
    from .vivino_reconcile import build_corkdork_state

    domain_data = hass.data[DOMAIN]
    storage = domain_data["storage"]
    client = domain_data.get("vivino_account")
    if not client:
        connection.send_result(msg["id"], {"error": "No Vivino account configured."})
        return
    if _get_vivino_mode(hass) != VIVINO_MODE_SYNC:
        connection.send_result(
            msg["id"],
            {"error": "Import mode never writes to Vivino — switch the Vivino "
                      "mode to Synchronize to push this count."},
        )
        return

    vid = str(msg["vivino_id"])
    cd_count = build_corkdork_state(storage.wines).get(vid, 0)
    try:
        vivino_count = await client._count_for_vintage(int(vid))
        delta = cd_count - vivino_count
        ok = delta == 0
        if not ok:
            res = await client.async_change_bottles(
                int(vid), delta, comment="Cork Dork conflict resolution"
            )
            ok = bool(res.get("ok"))
            if not ok:
                # Vivino often serves a stale count right after accepting its
                # own write, which makes an applied change look failed. Give
                # it a moment and verify against a fresh read before ruling.
                await asyncio.sleep(3)
                ok = await client._count_for_vintage(int(vid)) == cd_count
        if not ok:
            connection.send_result(
                msg["id"],
                {"error": f"Vivino did not accept the change ({vivino_count} -> {cd_count})."},
            )
            return
    except Exception as err:  # noqa: BLE001 - surfaced to the card
        connection.send_result(msg["id"], {"error": f"Vivino update failed: {err}"})
        return

    # Advance the baseline so the next sync sees an agreed state
    baseline = storage.get_vivino_baseline()
    entry = dict(baseline.get(vid) or {})
    local = next(
        (w for w in storage.wines if str(w.get("vivino_id") or "") == vid), {}
    )
    entry.update({
        "count": cd_count,
        "name": entry.get("name") or local.get("name", ""),
        "winery": entry.get("winery") or local.get("winery", ""),
        "vintage": entry.get("vintage", local.get("vintage")),
    })
    if cd_count > 0:
        baseline[vid] = entry
    else:
        baseline.pop(vid, None)
    storage.set_vivino_baseline(baseline)

    # Clear the conflict from the stored sync snapshot so the card updates
    status = storage.get_vivino_sync_status() or {}
    details = [
        c for c in (status.get("conflicts_detail") or [])
        if str(c.get("vintage_id")) != vid
    ]
    status["conflicts_detail"] = details
    status["cellar_conflicts"] = len(details)
    storage.set_vivino_sync_status(status)
    hass.data[DOMAIN]["vivino_sync_status"] = status

    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(
        msg["id"],
        {"success": True, "vivino_count": cd_count, "delta": delta,
         "conflicts": details},
    )


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
        await photos.store_wine_photos(hass, wine)
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

    result = await vivino.lookup_barcode(barcode, _get_metadata_language(hass))
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
    results = await vivino.search_wine(msg["query"], _get_metadata_language(hass), _get_metadata_currency(hass))
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
    problem = _cabinet_shape_error(msg["updates"])
    if problem:
        connection.send_result(msg["id"], {"error": problem})
        return
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
    problem = _cabinet_shape_error(msg["cabinet"])
    if problem:
        connection.send_result(msg["id"], {"error": problem})
        return
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
        vol.Optional("back_image"): str,
    }
)
@websocket_api.async_response
async def ws_recognize_label(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Recognize wine from label photo (optionally + back label) using AI Vision."""
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
    result = await gemini.recognize_label(
        msg["image"], _get_metadata_language(hass), back_image_base64=msg.get("back_image")
    )

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
    domain_data = hass.data.get(DOMAIN, {})
    connection.send_result(
        msg["id"],
        {
            "has_gemini": "gemini" in domain_data,
            "has_vivino_account": "vivino_account" in domain_data,
            "vivino_mode": _get_vivino_mode(hass),
            "metadata_language": _get_metadata_language(hass),
            "supported_languages": SUPPORTED_METADATA_LANGUAGES,
            "metadata_currency": _get_metadata_currency(hass),
            "supported_currencies": SUPPORTED_METADATA_CURRENCIES,
            "ai_fallback_always": bool(
                hass.data[DOMAIN]["storage"].settings.get(CONF_AI_FALLBACK_ALWAYS, False)
            ),
            "server_backup_keep": _get_backup_keep(hass),
            "server_backup_keep_choices": SERVER_BACKUP_KEEP_CHOICES,
            "dismissed_arrangements": list(
                hass.data[DOMAIN]["storage"].settings.get(
                    CONF_DISMISSED_ARRANGEMENTS, []
                )
            ),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/update_settings",
        vol.Required("updates"): dict,
    }
)
@websocket_api.async_response
async def ws_update_settings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update app-wide settings (e.g. metadata language)."""
    storage = hass.data[DOMAIN]["storage"]
    updates = dict(msg["updates"])
    lang = updates.get(CONF_METADATA_LANGUAGE)
    if lang is not None and lang not in SUPPORTED_METADATA_LANGUAGES:
        connection.send_result(msg["id"], {"error": f"Unsupported language: {lang}"})
        return
    currency = updates.get(CONF_METADATA_CURRENCY)
    if currency is not None and currency not in SUPPORTED_METADATA_CURRENCIES:
        connection.send_result(msg["id"], {"error": f"Unsupported currency: {currency}"})
        return
    keep = updates.get(CONF_SERVER_BACKUP_KEEP)
    if keep is not None:
        try:
            updates[CONF_SERVER_BACKUP_KEEP] = max(0, int(keep))
        except (TypeError, ValueError):
            connection.send_result(
                msg["id"], {"error": f"Invalid backup retention: {keep}"}
            )
            return
    dismissed = updates.get(CONF_DISMISSED_ARRANGEMENTS)
    if dismissed is not None:
        if not isinstance(dismissed, list) or not all(
            isinstance(item, str) for item in dismissed
        ):
            connection.send_result(
                msg["id"], {"error": "Dismissed arrangements must be a list of ids"}
            )
            return
        # Deduplicate and cap: this list only ever grows, and a finding id the
        # cellar can no longer produce would otherwise sit there forever.
        updates[CONF_DISMISSED_ARRANGEMENTS] = list(dict.fromkeys(dismissed))[-500:]
    settings = storage.update_settings(updates)
    await storage.async_save()
    connection.send_result(msg["id"], {"settings": settings})


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
    language = _get_metadata_language(hass)
    currency = _get_metadata_currency(hass)
    ai_fallback_always = bool(storage.settings.get(CONF_AI_FALLBACK_ALWAYS, False))
    wine = storage.get_wine(msg["wine_id"])
    if not wine:
        connection.send_result(msg["id"], {"error": "Wine not found."})
        return

    # Build search query from wine name + winery + vintage (used for the
    # text-search fallback below and for error messages)
    parts = []
    if wine.get("winery"):
        parts.append(wine["winery"])
    if wine.get("name"):
        parts.append(wine["name"])
    if wine.get("vintage"):
        parts.append(str(wine["vintage"]))
    query = " ".join(parts) if parts else ""

    # If this wine's Vivino id is already known from a prior match, look it
    # up directly — no query ambiguity, and its full vintage list lets us
    # pick the exact matching vintage rather than guess from search ranking.
    lookup = None
    if wine.get("vivino_id"):
        lookup = await vivino.get_wine_by_id(wine["vivino_id"], wine.get("vintage"))

    if not lookup:
        if not query:
            connection.send_result(msg["id"], {"error": "No name/winery to search."})
            return

        result = await vivino.search_wine(query, language, currency, wine.get("vintage"))
        lookup = result[0] if result else None
        if lookup and not _vivino_match_is_trustworthy(wine, lookup):
            _LOGGER.debug(
                "Vivino match for '%s' looks unrelated (%s %s), falling back to AI",
                query, lookup.get("winery"), lookup.get("name"),
            )
            lookup = None

    if not lookup:
        # No usable Vivino match (no results, or the best match looks
        # unrelated). Don't silently fall back to AI — flag it so the
        # frontend can ask the user first (unless they've opted into
        # always-use-AI). The attempt is still recorded — as a *check*, not
        # an update — so the wine stops being reported as never looked up
        # while still showing that Vivino had nothing for it.
        storage.update_wine(
            msg["wine_id"], {"vivino_checked_at": datetime.now(timezone.utc).isoformat()}
        )
        await storage.async_save()
        connection.send_result(msg["id"], {
            "error": f"No confident Vivino match for '{query}'.",
            "no_vivino_match": True,
            "ai_available": hass.data[DOMAIN].get("gemini") is not None,
        })
        return

    # Merge: only overwrite fields that are empty/missing or enrichment fields
    updates: dict[str, Any] = {}
    ai_price_used = False
    # Always update enrichment fields from Vivino
    for key in ("rating", "ratings_count", "description",
                "food_pairings", "alcohol", "grape_variety"):
        val = lookup.get(key)
        if val:
            updates[key] = val

    # Photo: never silently overwrite a photo the user already has. If the
    # wine has no photo yet, apply Vivino's automatically. Otherwise surface
    # the candidate separately so the frontend can ask the user first.
    vivino_image_url = None
    candidate_image = lookup.get("image_url")
    _LOGGER.debug(
        "Vivino photo check for '%s': candidate=%r current=%r",
        query, candidate_image, wine.get("image_url"),
    )
    if candidate_image and candidate_image != wine.get("image_url"):
        if not wine.get("image_url"):
            updates["image_url"] = candidate_image
        else:
            vivino_image_url = candidate_image

    # Store Vivino price as retail_price (always update — Vivino is real market data)
    _LOGGER.debug("Vivino lookup price: %s", lookup.get("price"))
    price_needs_ai = False
    if lookup.get("price"):
        updates["retail_price"] = lookup["price"]
        updates["retail_price_currency"] = currency
    elif not wine.get("retail_price") or wine.get("retail_price_currency") != currency:
        # No usable Vivino price — also true when the stored price was
        # captured in a different currency, since an unconverted number in
        # the wrong currency is worse than no number at all.
        gemini = hass.data[DOMAIN].get("gemini")
        if ai_fallback_always and gemini:
            try:
                ai_result = await gemini.analyze_single_wine(wine, language, currency)
                ai_price = ai_result.get("estimated_price")
                if ai_price:
                    _LOGGER.debug("Using Gemini estimated price: %s", ai_price)
                    updates["retail_price"] = ai_price
                    updates["retail_price_currency"] = currency
                    ai_price_used = True
            except Exception as err:
                _LOGGER.debug("Gemini price fallback failed: %s", err)
        elif gemini:
            # AI could estimate it, but the user hasn't opted into
            # always-use — flag it so the frontend can ask first, same as
            # the no-confident-match flow. A plain "Vivino" click must
            # never call AI silently.
            price_needs_ai = True

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

    # The field list reported to the frontend is the real changes only; the
    # bookkeeping keys added below would otherwise show up as "1 field
    # updated" on a lookup that changed nothing.
    changed_fields = list(updates.keys())
    now = datetime.now(timezone.utc).isoformat()

    # checked_at records every completed lookup; updated_at only moves when
    # the wine actually gained something. Comparing the two is what tells a
    # fruitless retry apart from a fruitful one.
    updates["vivino_checked_at"] = now
    if changed_fields:
        updates["vivino_updated_at"] = now
    if lookup.get("vivino_id"):
        updates["vivino_id"] = lookup["vivino_id"]
    if ai_price_used:
        updates["ai_updated_at"] = now
        updates["ai_checked_at"] = now

    updated_wine = storage.update_wine(msg["wine_id"], updates)
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {
        "wine": updated_wine,
        "updated_fields": changed_fields,
        "vivino_image_url": vivino_image_url,
        "price_needs_ai": price_needs_ai,
    })


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

    currency = _get_metadata_currency(hass)
    result = await gemini.analyze_single_wine(wine, _get_metadata_language(hass), currency)
    if "error" in result:
        connection.send_result(msg["id"], {"error": result["error"]})
        return

    # Apply results to wine
    updates = _build_ai_updates(wine, result, currency)

    _LOGGER.debug("Final updates for wine %s: %s", msg["wine_id"], list(updates.keys()))
    # Same split as the Vivino path: the check is always recorded, the update
    # only when the AI actually added something.
    now = datetime.now(timezone.utc).isoformat()
    if updates:
        updates["ai_updated_at"] = now
    updates["ai_checked_at"] = now
    updated_wine = storage.update_wine(msg["wine_id"], updates)
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": updated_wine, "analysis": result})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/batch_analyze_wines",
        vol.Optional("wine_ids"): [str],
    }
)
@websocket_api.async_response
async def ws_batch_analyze_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch AI analysis: run analyze_single_wine on every wine, or a subset."""
    gemini = hass.data[DOMAIN].get("gemini")
    if not gemini:
        connection.send_result(
            msg["id"],
            {"error": "Gemini API key not configured."},
        )
        return

    storage = hass.data[DOMAIN]["storage"]
    wines = _select_wines(storage, msg.get("wine_ids"))
    if not wines:
        connection.send_result(msg["id"], {"error": "No wines to analyze."})
        return

    language = _get_metadata_language(hass)
    currency = _get_metadata_currency(hass)
    updated = 0
    unchanged = 0
    errors = 0
    total = len(wines)

    for wine in wines:
        try:
            result = await gemini.analyze_single_wine(wine, language, currency)
            if "error" in result:
                _LOGGER.warning(
                    "Batch AI: error for wine %s: %s",
                    wine.get("id"), result["error"],
                )
                errors += 1
                continue

            updates = _build_ai_updates(wine, result, currency)
            had_changes = bool(updates)

            # The check is always recorded; the update timestamp only moves
            # when the AI actually added something. A checked_at newer than
            # updated_at is exactly "this retry found nothing new".
            now = datetime.now(timezone.utc).isoformat()
            if had_changes:
                updates["ai_updated_at"] = now
            updates["ai_checked_at"] = now
            storage.update_wine(wine["id"], updates)
            if had_changes:
                updated += 1
            else:
                unchanged += 1

            # Small delay between API calls to avoid rate limits
            await asyncio.sleep(0.5)

        except Exception as err:
            _LOGGER.warning(
                "Batch AI: exception for wine %s: %s", wine.get("id"), err
            )
            errors += 1

    if updated or unchanged:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    connection.send_result(
        msg["id"],
        {"updated": updated, "unchanged": unchanged, "total": total, "errors": errors},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/batch_refresh_vivino",
        vol.Optional("photo_mode", default="keep"): vol.In(["keep", "replace"]),
        vol.Optional("ai_fallback", default="skip"): vol.In(["skip", "use"]),
        vol.Optional("wine_ids"): [str],
    }
)
@websocket_api.async_response
async def ws_batch_refresh_vivino(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch Vivino refresh: look up every wine on Vivino, or a subset."""
    vivino = hass.data[DOMAIN].get("vivino")
    if not vivino:
        connection.send_result(
            msg["id"],
            {"error": "Vivino client not available."},
        )
        return

    storage = hass.data[DOMAIN]["storage"]
    wines = _select_wines(storage, msg.get("wine_ids"))
    if not wines:
        connection.send_result(msg["id"], {"error": "No wines to refresh."})
        return

    photo_mode = msg.get("photo_mode", "keep")
    ai_fallback_mode = msg.get("ai_fallback", "skip")  # "skip" | "use" — chosen upfront by the user
    language = _get_metadata_language(hass)
    currency = _get_metadata_currency(hass)
    updated = 0
    unchanged = 0
    errors = 0
    photos_updated = 0
    photos_kept = 0
    mismatched = 0
    ai_fallback_used = 0
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

            # If this wine's Vivino id is already known, look it up
            # directly — no query ambiguity, exact vintage from its own
            # vintage list. Falls back to text search if that fails.
            lookup = None
            if wine.get("vivino_id"):
                lookup = await vivino.get_wine_by_id(wine["vivino_id"], wine.get("vintage"))

            if not lookup:
                if not query:
                    continue

                # fetch_extras=False: skip the extra description/food_pairings
                # HTML request here — it would ~double request volume across a
                # whole cellar's worth of wines. Individual refresh still does it.
                result = await vivino.search_wine(query, language, currency, wine.get("vintage"), fetch_extras=False)
                lookup = result[0] if result else None
                if lookup and not _vivino_match_is_trustworthy(wine, lookup):
                    _LOGGER.debug(
                        "Batch Vivino: match for '%s' looks unrelated (%s %s), falling back to AI",
                        query, lookup.get("winery"), lookup.get("name"),
                    )
                    lookup = None

            if not lookup:
                # No usable Vivino match. Only fall back to AI if the user
                # opted into it upfront for this batch run — never silently.
                mismatched += 1
                gained_data = False
                gemini = hass.data[DOMAIN].get("gemini") if ai_fallback_mode == "use" else None
                if gemini:
                    try:
                        ai_result = await gemini.analyze_single_wine(wine, language, currency)
                        if "error" not in ai_result:
                            ai_updates = _build_ai_updates(wine, ai_result, currency)
                            had_ai_changes = bool(ai_updates)
                            ai_now = datetime.now(timezone.utc).isoformat()
                            if had_ai_changes:
                                ai_updates["ai_updated_at"] = ai_now
                            ai_updates["ai_checked_at"] = ai_now
                            storage.update_wine(wine["id"], ai_updates)
                            if had_ai_changes:
                                updated += 1
                                ai_fallback_used += 1
                                gained_data = True
                    except Exception as err:
                        _LOGGER.debug(
                            "Batch: AI fallback failed for wine %s: %s", wine.get("id"), err
                        )
                # Record the Vivino check even though it found nothing, or the
                # wine is reported as never looked up forever. It stays a
                # check, not an update — nothing was learned. Counted as
                # unchanged only when the AI fallback didn't rescue it either,
                # so no wine lands in both totals.
                storage.update_wine(
                    wine["id"],
                    {"vivino_checked_at": datetime.now(timezone.utc).isoformat()},
                )
                if not gained_data:
                    unchanged += 1
                await asyncio.sleep(1.0)
                continue

            updates: dict[str, Any] = {}
            ai_price_used = False

            # Always update enrichment fields from Vivino
            for key in ("rating", "ratings_count", "description",
                        "food_pairings", "alcohol", "grape_variety"):
                val = lookup.get(key)
                if val:
                    updates[key] = val

            # Photo: only overwrite an existing photo when the user opted in
            # via photo_mode="replace"; otherwise leave the user's photo alone.
            candidate_image = lookup.get("image_url")
            if candidate_image and candidate_image != wine.get("image_url"):
                if not wine.get("image_url") or photo_mode == "replace":
                    updates["image_url"] = candidate_image
                    photos_updated += 1
                else:
                    photos_kept += 1

            # Vivino price as retail_price
            if lookup.get("price"):
                updates["retail_price"] = lookup["price"]
                updates["retail_price_currency"] = currency
            elif ai_fallback_mode == "use" and (
                not wine.get("retail_price") or wine.get("retail_price_currency") != currency
            ):
                # Fallback: use Gemini AI to estimate retail price — also
                # fires when the stored price is in a different currency.
                # Only when the user opted into AI for this batch run.
                gemini = hass.data[DOMAIN].get("gemini")
                if gemini:
                    try:
                        ai_result = await gemini.analyze_single_wine(wine, language, currency)
                        ai_price = ai_result.get("estimated_price")
                        if ai_price:
                            _LOGGER.debug(
                                "Batch: Gemini estimated price for %s: %s",
                                wine.get("id"), ai_price,
                            )
                            updates["retail_price"] = ai_price
                            updates["retail_price_currency"] = currency
                            ai_price_used = True
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

            had_changes = bool(updates)
            now = datetime.now(timezone.utc).isoformat()
            updates["vivino_checked_at"] = now
            if had_changes:
                updates["vivino_updated_at"] = now
            if lookup.get("vivino_id"):
                updates["vivino_id"] = lookup["vivino_id"]
            if ai_price_used:
                updates["ai_updated_at"] = now
                updates["ai_checked_at"] = now
            storage.update_wine(wine["id"], updates)
            if had_changes:
                updated += 1
            else:
                unchanged += 1

            # Small delay to avoid rate limits
            await asyncio.sleep(1.0)

        except Exception as err:
            _LOGGER.warning(
                "Batch Vivino: exception for wine %s: %s", wine.get("id"), err
            )
            errors += 1

    if updated or unchanged:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")

    connection.send_result(
        msg["id"],
        {
            "updated": updated,
            "unchanged": unchanged,
            "total": total,
            "errors": errors,
            "photos_updated": photos_updated,
            "photos_kept": photos_kept,
            "mismatched": mismatched,
            "ai_fallback_used": ai_fallback_used,
        },
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

    result = await gemini.extract_wine_list(msg["image"], _get_metadata_language(hass))

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
        result = await vivino.search_wine(
            query, _get_metadata_language(hass), _get_metadata_currency(hass), wine.get("vintage")
        )
        if not result:
            connection.send_result(msg["id"], {"result": None})
            return
        lookup = result[0]
        if not _vivino_match_is_trustworthy(wine, lookup):
            connection.send_result(msg["id"], {"result": None})
            return
        connection.send_result(msg["id"], {"result": lookup})
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
        result = await gemini.analyze_single_wine(msg["wine"], _get_metadata_language(hass), _get_metadata_currency(hass))
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


# ── Wine History ─────────────────────────────────────────────────────


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_wine_history"})
@callback
def ws_get_wine_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return wine removal history."""
    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], {"history": storage.wine_history})


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/clear_wine_history"})
@websocket_api.async_response
async def ws_clear_wine_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Clear all wine removal history."""
    storage = hass.data[DOMAIN]["storage"]
    storage._data["wine_history"] = []
    await storage.async_save()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/restore_wine",
        vol.Required("history_id"): str,
    }
)
@websocket_api.async_response
async def ws_restore_wine(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Restore a wine from history back into the cellar as unassigned."""
    storage = hass.data[DOMAIN]["storage"]
    wine = storage.restore_wine(msg["history_id"])
    if wine:
        await storage.async_save()
        hass.bus.async_fire(f"{DOMAIN}_updated")
    connection.send_result(msg["id"], {"wine": wine})


# ── Backup / Restore / Import ────────────────────────────────────────


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_backup"})
@websocket_api.async_response
async def ws_get_backup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a full backup of all cellar data."""
    storage = hass.data[DOMAIN]["storage"]
    backup = storage.get_backup_data()
    # Photos live on disk now, but a backup has to stand on its own: read them
    # back inline so restoring onto a fresh install does not depend on files
    # this backup never carried. Paid once per backup, not once per page load.
    backup[CONF_WINES] = await photos.inline_for_backup(hass, backup[CONF_WINES])
    backup[CONF_WINE_HISTORY] = await photos.inline_for_backup(
        hass, backup[CONF_WINE_HISTORY]
    )
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
    wine_history = backup.get("wine_history", [])
    settings = backup.get("settings")

    if not isinstance(wines, list) or not isinstance(cabinets, list):
        connection.send_result(
            msg["id"],
            {"error": "Invalid backup format: wines and cabinets must be arrays."},
        )
        return

    counts = storage.restore_data(wines, cabinets, buy_list, wine_history, settings)
    # A backup carries its photos inline; put them back on disk, and drop any
    # file the restored cellar no longer refers to.
    await photos.externalise_all(hass, storage.wines)
    await photos.externalise_all(hass, storage.wine_history)
    await photos.prune(hass, storage.wines, storage.wine_history)
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
        vol.Optional("mode", default="add"): vol.In(["add", "update"]),
    }
)
@websocket_api.async_response
async def ws_import_wines(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Batch import wines: add as new, or update existing ones by id."""
    storage = hass.data[DOMAIN]["storage"]
    counts = storage.import_wines(msg["wines"], msg.get("mode", "add"))
    await storage.async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated")

    _LOGGER.info(
        "CSV import (%s): %d added, %d updated, %d locations skipped",
        msg.get("mode", "add"), counts["added"], counts["updated"],
        counts["location_skipped"],
    )
    connection.send_result(
        msg["id"],
        {
            "imported": counts["added"],
            "updated": counts["updated"],
            "location_skipped": counts["location_skipped"],
        },
    )


# ── Vivino Account Sync ──────────────────────────────────────────────


@websocket_api.websocket_command(
    {
        vol.Required("type"): "wine_cellar/sync_vivino",
        vol.Optional("target", default="all"): vol.In(
            ["all", "cellar", "wishlist", "my_wines"]
        ),
    }
)
@websocket_api.async_response
async def ws_sync_vivino(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Sync the user's Vivino cellar/wishlist into local storage."""
    client = hass.data[DOMAIN].get("vivino_account")
    if not client:
        connection.send_result(
            msg["id"],
            {
                "error": "No Vivino account configured. Add your Vivino email "
                "and password via Settings > Integrations > Cork Dork > Configure.",
            },
        )
        return

    from .vivino_account import VivinoAuthError, async_sync_from_vivino

    storage = hass.data[DOMAIN]["storage"]
    target = msg.get("target", "all")
    try:
        result = await async_sync_from_vivino(
            hass,
            storage,
            client,
            sync_cellar=target in ("all", "cellar"),
            sync_wishlist=target in ("all", "wishlist"),
            sync_my_wines=target in ("all", "my_wines"),
        )
    except VivinoAuthError as err:
        connection.send_result(msg["id"], {"error": f"Vivino login failed: {err}"})
        return
    except Exception as err:
        _LOGGER.warning("Vivino sync failed: %s", err)
        connection.send_result(msg["id"], {"error": str(err)})
        return

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/vivino_status"})
@callback
def ws_vivino_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return Vivino account connection status and last sync result."""
    domain_data = hass.data.get(DOMAIN, {})
    client = domain_data.get("vivino_account")
    storage = domain_data.get("storage")
    last_sync = None
    if storage:
        last_sync = storage.get_vivino_sync_status()
    if not last_sync:
        last_sync = domain_data.get("vivino_sync_status")
    connection.send_result(
        msg["id"],
        {
            "configured": client is not None,
            "user_id": client.user_id if client else None,
            "alias": client.alias if client else "",
            "last_sync": last_sync,
        },
    )


# ── Cloud Sync (save/load backup file) ─────────────────────────────


import json
from pathlib import Path


def _get_backup_keep(hass: HomeAssistant) -> int:
    """How many server backups to retain (0 = keep everything)."""
    raw = hass.data[DOMAIN]["storage"].settings.get(
        CONF_SERVER_BACKUP_KEEP, DEFAULT_SERVER_BACKUP_KEEP
    )
    try:
        return max(0, int(raw))
    except (TypeError, ValueError):
        return DEFAULT_SERVER_BACKUP_KEEP


def _get_server_backup_dir(hass: HomeAssistant) -> Path:
    """Return the server backup directory path (no filesystem access).

    Creating it is left to the executor jobs below: mkdir() blocks, and every
    caller here runs on the event loop.
    """
    return Path(hass.config.config_dir) / "wine_cellar_backups"


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

    keep = _get_backup_keep(hass)

    def _write() -> int:
        backup_dir.mkdir(exist_ok=True)
        backup_path.write_text(json.dumps(backup, indent=2), "utf-8")
        if keep <= 0:
            return 0
        # Newest first, so everything past the retention count is the tail.
        existing = sorted(backup_dir.glob("wine_cellar_*.json"), reverse=True)
        pruned = 0
        for old_file in existing[keep:]:
            try:
                old_file.unlink()
                pruned += 1
            except OSError as err:
                _LOGGER.warning("Could not prune old backup %s: %s", old_file, err)
        return pruned

    try:
        pruned = await hass.async_add_executor_job(_write)
        _LOGGER.info("Server backup saved to %s (pruned %d old)", backup_path, pruned)
        connection.send_result(msg["id"], {
            "success": True,
            "filename": filename,
            "wines": len(backup.get("wines", [])),
            "cabinets": len(backup.get("cabinets", [])),
            "buy_list": len(backup.get("buy_list", [])),
            "timestamp": backup["timestamp"],
            "pruned": pruned,
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
        if not backup_dir.is_dir():
            return []
        files = sorted(backup_dir.glob("wine_cellar_*.json"), reverse=True)
        result = []
        for f in files:
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
        connection.send_result(msg["id"], {
            "backups": backups,
            "keep": _get_backup_keep(hass),
            "keep_choices": SERVER_BACKUP_KEEP_CHOICES,
        })
    except Exception as err:
        _LOGGER.error("Failed to list server backups: %s", err)
        connection.send_result(msg["id"], {"error": str(err)})


@websocket_api.websocket_command({
    vol.Required("type"): "wine_cellar/server_backup_delete",
    vol.Required("filename"): str,
})
@websocket_api.async_response
async def ws_server_backup_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a single server backup file."""
    backup_dir = _get_server_backup_dir(hass)
    backup_path = backup_dir / msg["filename"]

    # Same guard as restore: never let a crafted name escape the directory.
    if backup_path.resolve().parent != backup_dir.resolve():
        connection.send_result(msg["id"], {"error": "Invalid filename."})
        return
    if not backup_path.name.startswith("wine_cellar_") or backup_path.suffix != ".json":
        connection.send_result(msg["id"], {"error": "Not a cellar backup file."})
        return

    def _delete() -> bool:
        if not backup_path.exists():
            return False
        backup_path.unlink()
        return True

    try:
        deleted = await hass.async_add_executor_job(_delete)
        if not deleted:
            connection.send_result(msg["id"], {"error": f"Backup not found: {msg['filename']}"})
            return
        _LOGGER.info("Server backup deleted: %s", backup_path)
        connection.send_result(msg["id"], {"success": True, "filename": msg["filename"]})
    except Exception as err:
        _LOGGER.error("Failed to delete server backup: %s", err)
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
        wine_history = data.get("wine_history", [])
        settings = data.get("settings")

        if not isinstance(wines, list) or not isinstance(cabinets, list):
            connection.send_result(msg["id"], {"error": "Invalid backup file format."})
            return

        storage = hass.data[DOMAIN]["storage"]
        counts = storage.restore_data(wines, cabinets, buy_list, wine_history, settings)
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


@websocket_api.websocket_command({vol.Required("type"): "wine_cellar/get_storage_info"})
@callback
def ws_get_storage_info(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Report the serialized size of each stored section.

    Home Assistant keeps this store in memory and rewrites the whole file on
    every save, so an unbounded history makes *every* wine edit slower, not
    just the history view. Surfacing the numbers lets the user decide when a
    purge is worth it instead of imposing an arbitrary cap.
    """
    storage = hass.data[DOMAIN]["storage"]

    def _size(value: Any) -> int:
        return len(json.dumps(value, ensure_ascii=False).encode("utf-8"))

    history = storage.wine_history
    wines = storage.wines
    cache = storage.barcode_cache

    connection.send_result(msg["id"], {
        "total_bytes": _size(storage.raw_data),
        "wines_bytes": _size(wines),
        "wines_count": len(wines),
        "history_bytes": _size(history),
        "history_count": len(history),
        "barcode_cache_bytes": _size(cache),
        "barcode_cache_count": len(cache),
    })
