"""Vivino cellar connection via the mobile app's own login (email + password).

The Vivino Android app does not use the website's session cookie. It signs in
against ``api.vivino.com`` with a standard OAuth2 *password* grant, using a
client id/secret that ships inside the app, and then reads the cellar from
dedicated ``v13`` endpoints with a ``Bearer`` token. The access token is
renewed with the ``refresh_token`` grant, so once signed in the connection keeps
working without the user pasting anything again.

Endpoints (reconstructed from the Android app, ``vivino.web.app`` 2026.47.1):

- ``POST /v/9.0.0/oauth/token``         password / refresh_token grants
- ``GET  /v/9.0.1/users/me``            user profile (id, alias)
- ``GET  /cellars``                     the user's cellar lists ``[{id, name}]``
- ``GET  /v13/cellar_bottles``          cellar contents, one group per vintage,
                                        paged with ``start_from`` / ``limit``,
                                        filterable with ``vintage_ids``
- ``GET  /v/9.1.1/_vintages?full=1``    full vintage records by ``ids[]``
- ``POST /cellars/{list_id}/vintages``  cellar event (``type`` add / consume)

This client exposes the same interface as ``VivinoAccountClient`` (the
session-cookie client), so reconciliation, the Import/Synchronize modes, the
service and the card work unchanged with either.

The password is only used to obtain tokens; it is never stored. Tokens are
kept in Home Assistant's ``.storage`` (``wine_cellar.vivino_app_auth``).
"""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store

from .vivino_account import (
    COUNTRY_NAMES,
    VivinoAuthError,
    VivinoConnectionError,
    _log_parse_outcome,
    _parse_user_wine,
)

_LOGGER = logging.getLogger(__name__)

API_BASE = "https://api.vivino.com"

# Public OAuth client credentials embedded in the official Android app. Anyone
# can extract them from the APK; if Vivino rotates them in a future app
# release, update them here.
OAUTH_CLIENT_ID = "uLGCMd5hl6jDJw5y6uCdwsdMCHdxQR31wRUuSazL"
OAUTH_CLIENT_SECRET = "tKaH7pdpBv4uD5OJJhow6YiaMp0NmqDDuSZXqiji"

TOKEN_STORE_KEY = "wine_cellar.vivino_app_auth"
TOKEN_STORE_VERSION = 1

REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=30)
PAGE_SIZE = 50
MAX_PAGES = 60  # safety cap: 3000 vintages
VINTAGE_CHUNK = 40

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "HomeAssistant-CorkDork",
}

# Name given to a vintage whose details could not be fetched, so its bottles
# are kept. A later sync replaces it (see the gap-fill in vivino_account).
PLACEHOLDER_NAME_PREFIX = "Vivino wine "

REAUTH_MESSAGE = (
    "Vivino session expired — open Settings > Devices & Services > Cork Dork > "
    "Configure and enter your Vivino password again"
)


def _store(hass: HomeAssistant) -> Store:
    return Store(hass, TOKEN_STORE_VERSION, TOKEN_STORE_KEY, private=True)


async def _read_json(resp: aiohttp.ClientResponse) -> Any:
    try:
        return await resp.json(content_type=None)
    except (ValueError, aiohttp.ContentTypeError):
        return {"_raw": (await resp.text())[:300]}


def _error_text(body: Any, status: int) -> str:
    if isinstance(body, dict):
        for key in ("error_description", "message", "error", "_raw"):
            if body.get(key):
                return f"HTTP {status}: {body[key]}"
    return f"HTTP {status}"


def _extract_vintages(body: Any) -> list[dict[str, Any]]:
    """Vintage records out of a ``_vintages`` response.

    Vivino answers with an object keyed by vintage id
    (``{"1213615": {"id": 1213615, "name": ..., "wine": {...}}, ...}``);
    a bare list or a ``{"vintages": [...]}`` wrapper are accepted too.
    """
    if isinstance(body, list):
        return [v for v in body if isinstance(v, dict)]
    if isinstance(body, dict):
        for key in ("vintages", "items", "data"):
            if isinstance(body.get(key), list):
                return [v for v in body[key] if isinstance(v, dict)]
        if body.get("id") and body.get("wine"):
            return [body]
        return [
            v for v in body.values()
            if isinstance(v, dict) and v.get("id") is not None
        ]
    return []


def _live_bottles(group: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        b for b in (group.get("bottles") or [])
        if isinstance(b, dict) and not b.get("deleted_at")
    ]


def _group_count(group: dict[str, Any]) -> int:
    bottles = group.get("bottles")
    if isinstance(bottles, list) and bottles:
        return len(_live_bottles(group))
    count = group.get("bottle_count")
    return count if isinstance(count, int) and count > 0 else 0


def _to_record(
    group: dict[str, Any],
    vintage: dict[str, Any] | None,
    country_names: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Shape a v13 cellar group like the records ``_parse_user_wine`` reads.

    The cellar endpoint only carries ids; names, winery, region, image and
    ratings come from the full vintage record. Without one, a minimal vintage
    keeps the bottles (and their ``vivino_id``) instead of dropping them.
    """
    vid = group.get("vintage_id")
    if not vintage:
        vintage = {
            "id": vid,
            "year": group.get("vintage_year"),
            "name": f"{PLACEHOLDER_NAME_PREFIX}{vid}",
            "wine": {
                "id": group.get("wine_id"),
                "type_id": group.get("wine_type_id"),
            },
        }
    vintage = dict(vintage)
    wine = vintage.get("wine")
    if isinstance(wine, dict):
        wine = vintage["wine"] = dict(wine)
        if wine.get("type_id") is None:
            wine["type_id"] = group.get("wine_type_id")
        # _vintages gives the region's country as an ISO code ("fr"), where
        # the parser expects the object the website returns.
        region = wine.get("region")
        if isinstance(region, dict) and isinstance(region.get("country"), str):
            code = region["country"]
            wine["region"] = {
                **region,
                "country": {
                    "code": code,
                    "name": (country_names or {}).get(code.lower())
                    or COUNTRY_NAMES.get(code.lower(), code.upper()),
                },
            }
    bottles = group.get("bottles")
    if not isinstance(bottles, list) or not bottles:
        bottles = [{} for _ in range(_group_count(group))]
    return {
        "vintage": vintage,
        "bottle_count": _group_count(group),
        "extras": {"cellar_bottles": bottles},
    }


class VivinoAppAccountClient:
    """Reads (and optionally writes) a Vivino cellar with the app's OAuth login."""

    reauth_message = REAUTH_MESSAGE
    reauth_notification = (
        "Cork Dork could not read your Vivino cellar — the Vivino sign-in has "
        "expired. Open Settings > Devices & Services > Cork Dork > Configure "
        "and enter your Vivino password again."
    )

    def __init__(self, hass: HomeAssistant, email: str) -> None:
        self._hass = hass
        self._email = (email or "").strip().lower()
        self._tokens: dict[str, Any] | None = None
        self._loaded = False
        self._session_rejected = False
        self._list_id: int | None = None
        self._vintage_cache: dict[int, dict[str, Any]] = {}
        self._country_names: dict[str, str] | None = None
        self.alias: str = ""
        self.user_id: int | None = None
        self.token_diagnostics: dict[str, Any] = {"method": "app_login"}

    # ── Authentication ───────────────────────────────────────────────

    @staticmethod
    async def async_login(
        hass: HomeAssistant, email: str, password: str
    ) -> dict[str, Any]:
        """Sign in with email + password and persist the resulting tokens.

        Raises VivinoAuthError on rejected credentials. Returns the profile.
        """
        client = VivinoAppAccountClient(hass, email)
        client._loaded = True
        client._tokens = await client._token_request({
            "grant_type": "password",
            "username": client._email,
            "password": password,
        })
        profile = await client._fetch_profile()
        await client._save_tokens()
        return profile

    @staticmethod
    async def async_has_tokens(hass: HomeAssistant, email: str) -> bool:
        data = await _store(hass).async_load() or {}
        return bool((data.get("email") == (email or "").strip().lower())
                    and data.get("refresh_token"))

    @staticmethod
    async def async_clear_tokens(hass: HomeAssistant) -> None:
        await _store(hass).async_remove()

    async def _load_tokens(self) -> None:
        if self._loaded:
            return
        data = await _store(self._hass).async_load() or {}
        if data.get("email") == self._email:
            self._tokens = data
            self.user_id = data.get("user_id")
            self.alias = data.get("alias") or ""
        self._loaded = True

    async def _save_tokens(self) -> None:
        if not self._tokens:
            return
        await _store(self._hass).async_save({
            **self._tokens,
            "email": self._email,
            "user_id": self.user_id,
            "alias": self.alias,
        })

    async def _token_request(self, data: dict[str, Any]) -> dict[str, Any]:
        session = async_get_clientsession(self._hass)
        payload = {
            **data,
            "client_id": OAUTH_CLIENT_ID,
            "client_secret": OAUTH_CLIENT_SECRET,
        }
        try:
            async with session.post(
                f"{API_BASE}/v/9.0.0/oauth/token", data=payload,
                headers=HEADERS, timeout=REQUEST_TIMEOUT,
            ) as resp:
                body = await _read_json(resp)
                status = resp.status
        except aiohttp.ClientError as err:
            raise VivinoConnectionError(f"Could not reach Vivino: {err}") from err

        if status in (400, 401, 403):
            self.token_diagnostics["last_auth_error"] = _error_text(body, status)
            raise VivinoAuthError(
                f"Vivino rejected the sign-in ({_error_text(body, status)})"
            )
        if status >= 300 or not isinstance(body, dict) or not body.get("access_token"):
            raise VivinoConnectionError(
                f"Unexpected Vivino sign-in response ({_error_text(body, status)})"
            )

        expires_in = body.get("expires_in")
        expires = body.get("expires")
        if expires_in:
            expires_at = time.time() + float(expires_in)
        elif expires and float(expires) > 1e9:
            expires_at = float(expires)
        else:
            expires_at = time.time() + 3600
        tokens = {
            "access_token": body["access_token"],
            "refresh_token": body.get("refresh_token")
            or (self._tokens or {}).get("refresh_token"),
            "expires_at": expires_at,
        }
        self.token_diagnostics.update({
            "token_expires_at": datetime.fromtimestamp(
                expires_at, timezone.utc).isoformat(),
            "has_refresh_token": bool(tokens["refresh_token"]),
        })
        return tokens

    async def _refresh(self) -> None:
        if self._session_rejected:
            raise VivinoAuthError(self.reauth_message)
        refresh_token = (self._tokens or {}).get("refresh_token")
        if not refresh_token:
            self._session_rejected = True
            raise VivinoAuthError(self.reauth_message)
        data: dict[str, Any] = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        if self.user_id:
            data["userId"] = str(self.user_id)
        try:
            self._tokens = await self._token_request(data)
        except VivinoAuthError:
            # Don't hammer the token endpoint for the rest of this sync.
            self._session_rejected = True
            raise VivinoAuthError(self.reauth_message) from None
        await self._save_tokens()

    async def _access_token(self) -> str:
        await self._load_tokens()
        if not self._tokens:
            raise VivinoAuthError(self.reauth_message)
        if time.time() > float(self._tokens.get("expires_at") or 0) - 60:
            await self._refresh()
        return self._tokens["access_token"]

    def reset_session_backoff(self) -> None:
        """Allow one fresh refresh attempt (called at the start of a sync)."""
        self._session_rejected = False

    # ── HTTP ─────────────────────────────────────────────────────────

    async def _request(
        self, method: str, path: str, *, params: Any = None,
        data: Any = None, retry: bool = True,
    ) -> Any:
        token = await self._access_token()
        session = async_get_clientsession(self._hass)
        try:
            async with session.request(
                method, f"{API_BASE}{path}", params=params, data=data,
                headers={**HEADERS, "Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT,
            ) as resp:
                status = resp.status
                body = await _read_json(resp)
        except aiohttp.ClientError as err:
            raise VivinoConnectionError(f"Vivino request failed: {err}") from err

        if status == 401 and retry:
            await self._refresh()
            return await self._request(
                method, path, params=params, data=data, retry=False
            )
        if status in (401, 403):
            raise VivinoAuthError(self.reauth_message)
        if status >= 300:
            raise RuntimeError(f"Vivino {path} returned {_error_text(body, status)}")
        return body

    async def _get(self, path: str, params: Any = None) -> Any:
        return await self._request("GET", path, params=params)

    # ── Reads ────────────────────────────────────────────────────────

    async def _fetch_profile(self) -> dict[str, Any]:
        body = await self._get("/v/9.0.1/users/me")
        user = body.get("user", body) if isinstance(body, dict) else {}
        if not isinstance(user, dict):
            return {}
        if user.get("id"):
            self.user_id = int(user["id"])
        self.alias = (
            user.get("alias")
            or " ".join(p for p in (user.get("first_name"), user.get("last_name")) if p)
            or self._email
        )
        return user

    async def _cellar_list_id(self) -> int | None:
        if self._list_id is None:
            body = await self._get("/cellars")
            if isinstance(body, dict):
                body = body.get("cellars") or []
            ids = [c.get("id") for c in body or [] if isinstance(c, dict) and c.get("id")]
            self._list_id = int(ids[0]) if ids else None
        return self._list_id

    async def _cellar_groups(
        self, vintage_ids: list[int] | None = None
    ) -> list[dict[str, Any]]:
        groups: list[dict[str, Any]] = []
        start = 0
        for _ in range(MAX_PAGES):
            params: dict[str, Any] = {"start_from": start, "limit": PAGE_SIZE}
            if vintage_ids:
                params["vintage_ids"] = ",".join(str(v) for v in vintage_ids)
            body = await self._get("/v13/cellar_bottles", params=params)
            page = (body or {}).get("vintages") or [] if isinstance(body, dict) else []
            groups.extend(g for g in page if isinstance(g, dict))
            start += len(page)
            total = body.get("total_vintages") if isinstance(body, dict) else None
            if len(page) < PAGE_SIZE or (isinstance(total, int) and start >= total):
                break
        return groups

    async def _vintages(self, ids: list[int]) -> dict[int, dict[str, Any]]:
        """Full vintage records (cached), in chunks; failures leave gaps only."""
        missing = [i for i in dict.fromkeys(ids) if i not in self._vintage_cache]
        for i in range(0, len(missing), VINTAGE_CHUNK):
            chunk = missing[i:i + VINTAGE_CHUNK]
            params: list[tuple[str, Any]] = [("full", 1)]
            if self.user_id:
                params.append(("user_id", self.user_id))
            params.extend(("ids[]", vid) for vid in chunk)
            try:
                body = await self._get("/v/9.1.1/_vintages", params=params)
            except VivinoAuthError:
                raise
            except Exception as err:  # noqa: BLE001 - names are best-effort
                _LOGGER.warning("Vivino vintage details unavailable: %s", err)
                break
            for v in _extract_vintages(body):
                if v.get("id") is not None:
                    self._vintage_cache[int(v["id"])] = v
        return {i: self._vintage_cache[i] for i in ids if i in self._vintage_cache}

    async def _countries(self) -> dict[str, str]:
        """ISO code -> country name in Home Assistant's language (cached).

        ``_vintages`` only carries the code; ``/countries`` is public and
        localized with ``language``. Failure falls back to ``COUNTRY_NAMES``.
        """
        if self._country_names is None:
            self._country_names = {}
            language = (self._hass.config.language or "en").split("-")[0]
            try:
                body = await self._get("/countries", params={"language": language})
            except VivinoAuthError:
                raise
            except Exception as err:  # noqa: BLE001 - names are best-effort
                _LOGGER.debug("Vivino country names unavailable: %s", err)
                body = []
            for c in body if isinstance(body, list) else []:
                if isinstance(c, dict) and c.get("code") and c.get("name"):
                    self._country_names[str(c["code"]).lower()] = c["name"]
        return self._country_names

    async def async_verify(self) -> dict[str, Any]:
        """Validate the stored tokens by reading the cellar's first page."""
        body = await self._get(
            "/v13/cellar_bottles", params={"start_from": 0, "limit": 1}
        )
        total = body.get("total_vintages") if isinstance(body, dict) else None
        return {"reachable": True, "total_vintages": total}

    async def async_get_cellar(self) -> list[dict[str, Any]]:
        """Return the user's Vivino cellar as parsed wine dicts."""
        if self.user_id is None:
            try:
                await self._fetch_profile()
            except (VivinoAuthError, VivinoConnectionError):
                raise
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Vivino profile unavailable: %s", err)
        groups = await self._cellar_groups()
        ids = [int(g["vintage_id"]) for g in groups if g.get("vintage_id") is not None]
        details = await self._vintages(ids)
        countries = await self._countries() if details else {}
        records = [
            _to_record(g, details.get(int(g.get("vintage_id") or 0)), countries)
            for g in groups if _group_count(g) > 0
        ]
        wines = [w for w in (_parse_user_wine(r) for r in records) if w]
        _log_parse_outcome("cellar", records, wines)
        return wines

    async def _count_for_vintage(self, vintage_id: int | str) -> int:
        groups = await self._cellar_groups([int(vintage_id)])
        return sum(
            _group_count(g) for g in groups
            if str(g.get("vintage_id")) == str(vintage_id)
        )

    async def async_get_wishlist(self) -> list[dict[str, Any]]:
        """Wishlist import is not wired yet (parity with the cookie client).

        The app reads it from ``GET /v/9.0.0/users/{user_id}/wishlist``
        (``start_from`` / ``limit``); left for a follow-up so this change does
        not start filling the buy list on its own.
        """
        return []

    async def async_get_my_wines(self) -> list[dict[str, Any]]:
        return []

    # ── Write-back (Cork Dork -> Vivino) ─────────────────────────────

    async def async_change_bottles(
        self, vintage_id: int | str, delta: int, comment: str = "Cork Dork sync"
    ) -> dict[str, Any]:
        """Add (delta>0) or consume (delta<0) bottles, then verify by re-reading.

        Consuming names the exact bottles (``cellar_bottle_ids[]``), as the app
        does, so Vivino removes those and nothing else.
        """
        vintage_id = int(vintage_id)
        if delta == 0:
            return {"vintage_id": vintage_id, "delta": 0, "ok": True, "skipped": True}

        groups = [
            g for g in await self._cellar_groups([vintage_id])
            if str(g.get("vintage_id")) == str(vintage_id)
        ]
        before = sum(_group_count(g) for g in groups)
        typ = "add" if delta > 0 else "consume"
        count = abs(delta)

        list_id = next((g.get("list_id") for g in groups if g.get("list_id")), None)
        if list_id is None:
            list_id = await self._cellar_list_id()
        if list_id is None:
            raise RuntimeError("Could not determine the Vivino cellar id")

        form: list[tuple[str, Any]] = [
            ("vintage_id", vintage_id),
            ("type", typ),
            ("count", count),
            ("comment", comment),
            ("date", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")),
            ("quick_action", "false"),
        ]
        if typ == "consume":
            live = [b for g in groups for b in _live_bottles(g) if b.get("id")]
            # Oldest first: drink the bottles that have been there longest.
            live.sort(key=lambda b: str(b.get("created_at") or ""))
            if len(live) < count:
                count = len(live)
                form[2] = ("count", count)
            if count == 0:
                return {"vintage_id": vintage_id, "delta": delta, "type": typ,
                        "before": before, "after": before, "expected": before,
                        "ok": before == 0}
            form.extend(("cellar_bottle_ids[]", b["id"]) for b in live[:count])

        status: int | None = None
        try:
            await self._request("POST", f"/cellars/{list_id}/vintages", data=form)
            status = 200
        except VivinoAuthError:
            raise
        except Exception as err:  # noqa: BLE001 - verify below either way
            _LOGGER.debug("Vivino cellar event raised (will verify): %s", err)

        after = await self._count_for_vintage(vintage_id)
        if after != max(0, before + delta):
            # Vivino may serve a stale count right after a write.
            await asyncio.sleep(2)
            after = await self._count_for_vintage(vintage_id)
        expected = max(0, before + delta)
        ok = after == expected
        _LOGGER.debug(
            "Vivino %s vintage %s x%d: before=%s after=%s expected=%s ok=%s",
            typ, vintage_id, count, before, after, expected, ok,
        )
        return {
            "vintage_id": vintage_id,
            "delta": delta,
            "type": typ,
            "http_status": status,
            "before": before,
            "after": after,
            "expected": expected,
            "ok": ok,
        }
