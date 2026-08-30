"""Bottle photos on disk, served over HTTP instead of inlined in the payload.

Photos used to live in the wine records as base64 `data:` URLs. A wine's
metadata is around 640 bytes; a 640px label photo is tens of kilobytes, so a
cellar entered by photo shipped several megabytes through the websocket on
every load — and again after every add, move or edit, since the card reloads
the list each time.

Here the bytes live in a directory and the wine keeps a short URL. The
browser fetches each photo once and caches it: the filename carries a stamp,
so replacing a photo produces a new URL and the cache cannot serve a stale
one.

Backups are the deliberate exception. `inline_for_backup` reads the files
back into data URLs so a backup stays a single self-contained file — that
cost is paid when a backup is made, not on every page load.
"""

from __future__ import annotations

import base64
import binascii
import logging
import re
import time
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

PHOTO_DIR_NAME = "wine_cellar_photos"
PHOTO_URL_PREFIX = "/wine_cellar/photos"

SIDES = ("image_url", "back_image_url")
_SIDE_NAMES = {"image_url": "front", "back_image_url": "back"}

_DATA_URL_RE = re.compile(r"^data:image/(?P<fmt>[a-zA-Z0-9.+-]+);base64,(?P<payload>.+)$", re.DOTALL)
_SAFE_ID_RE = re.compile(r"[^A-Za-z0-9_-]")


def photo_dir(hass: HomeAssistant) -> Path:
    """Directory holding the photo files."""
    return Path(hass.config.path(PHOTO_DIR_NAME))


def is_data_url(value: Any) -> bool:
    return isinstance(value, str) and value.startswith("data:image/")


def is_local_photo(value: Any) -> bool:
    return isinstance(value, str) and value.startswith(PHOTO_URL_PREFIX + "/")


def _filename_from_url(url: str) -> str | None:
    if not is_local_photo(url):
        return None
    name = url.rsplit("/", 1)[-1].split("?", 1)[0]
    return name or None


def _write(directory: Path, filename: str, raw: bytes) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    (directory / filename).write_bytes(raw)


async def store_data_url(
    hass: HomeAssistant, wine_id: str, field: str, data_url: str
) -> str | None:
    """Write one data URL to disk and return the URL to store on the wine.

    Returns None when the value is not a data URL we can decode, so callers
    can leave whatever was there untouched rather than losing a photo to a
    parsing detail.
    """
    match = _DATA_URL_RE.match(data_url or "")
    if not match:
        return None
    try:
        raw = base64.b64decode(match.group("payload"), validate=True)
    except (binascii.Error, ValueError) as err:
        _LOGGER.warning("Could not decode photo for wine %s: %s", wine_id, err)
        return None
    if not raw:
        return None

    fmt = match.group("fmt").lower()
    ext = "jpg" if fmt in ("jpeg", "jpg") else re.sub(r"[^a-z0-9]", "", fmt) or "img"
    safe_id = _SAFE_ID_RE.sub("", wine_id) or "wine"
    side = _SIDE_NAMES.get(field, field)
    # The stamp is what makes the URL cache-safe: a replaced photo gets a new
    # name, so a cached copy of the old one can never be served for the new.
    filename = f"{safe_id}-{side}-{int(time.time() * 1000)}.{ext}"

    await hass.async_add_executor_job(_write, photo_dir(hass), filename, raw)
    return f"{PHOTO_URL_PREFIX}/{filename}"


async def store_wine_photos(hass: HomeAssistant, wine: dict[str, Any]) -> bool:
    """Move any inline photo on a wine record out to disk. True if changed."""
    changed = False
    for field in SIDES:
        value = wine.get(field)
        if not is_data_url(value):
            continue
        url = await store_data_url(hass, wine.get("id", ""), field, value)
        if url:
            wine[field] = url
            changed = True
    return changed


def _read_files(directory: Path, names: list[str]) -> dict[str, bytes]:
    out: dict[str, bytes] = {}
    for name in names:
        path = directory / name
        try:
            out[name] = path.read_bytes()
        except OSError:
            continue
    return out


async def inline_for_backup(
    hass: HomeAssistant, wines: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Copies of the wines with their photos back as data URLs.

    A backup has to stand on its own: restoring one onto a fresh install must
    not depend on files this backup never carried.
    """
    wanted: list[str] = []
    for wine in wines:
        for field in SIDES:
            name = _filename_from_url(wine.get(field))
            if name:
                wanted.append(name)
    if not wanted:
        return [dict(w) for w in wines]

    blobs = await hass.async_add_executor_job(
        _read_files, photo_dir(hass), sorted(set(wanted))
    )

    out: list[dict[str, Any]] = []
    for wine in wines:
        copy = dict(wine)
        for field in SIDES:
            name = _filename_from_url(copy.get(field))
            raw = blobs.get(name) if name else None
            if raw:
                ext = name.rsplit(".", 1)[-1].lower() if name else "jpg"
                mime = "jpeg" if ext in ("jpg", "jpeg") else ext
                copy[field] = f"data:image/{mime};base64,{base64.b64encode(raw).decode()}"
        out.append(copy)
    return out


async def externalise_all(hass: HomeAssistant, wines: list[dict[str, Any]]) -> int:
    """Move every inline photo in a wine list out to disk. Returns how many.

    Used for the one-off migration at startup and after restoring a backup,
    which arrives with its photos inline by design.
    """
    moved = 0
    for wine in wines:
        if await store_wine_photos(hass, wine):
            moved += 1
    return moved


def _delete_unreferenced(directory: Path, keep: set[str]) -> int:
    if not directory.is_dir():
        return 0
    removed = 0
    for path in directory.iterdir():
        if path.is_file() and path.name not in keep:
            try:
                path.unlink()
                removed += 1
            except OSError:
                continue
    return removed


async def prune(hass: HomeAssistant, *wine_lists: list[dict[str, Any]]) -> int:
    """Delete photo files nothing refers to any more.

    Deliberately driven by what is still referenced rather than by what was
    just removed: a photo is only deleted once no wine and no history entry
    mentions it, so a bottle drunk today keeps its picture in the history.
    """
    keep: set[str] = set()
    for wines in wine_lists:
        for wine in wines:
            for field in SIDES:
                name = _filename_from_url(wine.get(field))
                if name:
                    keep.add(name)
    return await hass.async_add_executor_job(_delete_unreferenced, photo_dir(hass), keep)
