"""Vivino cellar connection via the website's Inertia.js endpoint.

Vivino has no public read API for your own cellar. The website authenticates
with a Rails/Devise **HttpOnly session cookie** (no bearer token, invisible to
page JavaScript) and serves the cellar from an **Inertia.js** endpoint on
``www.vivino.com`` — not the ``api.vivino.com`` mobile backend.

Home Assistant cannot drive a browser to log in, so the user pastes their
Vivino session cookie (copied once from their browser) plus their cellar page
URL. This client replays that cookie against the Inertia cellar endpoint with
the ``X-Inertia`` headers, pages through the results, and parses the wine
records. When the cookie expires the endpoint stops returning JSON, which is
surfaced as an auth error so the integration can prompt for a fresh cookie.

Endpoint/response shapes are unofficial and may change, so parsing is
defensive: the wine list is located structurally within the Inertia props and
unknown fields are ignored rather than raising.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import unquote, urlparse

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from .const import (
    CONF_VIVINO_MODE,
    DEFAULT_VIVINO_MODE,
    DOMAIN,
    VIVINO_MODE_IMPORT,
    VIVINO_MODE_SYNC,
)
from .vivino_reconcile import (
    build_corkdork_state,
    build_vivino_state,
    is_delete_wave_suspicious,
    reconcile,
)

_LOGGER = logging.getLogger(__name__)

WWW_BASE = "https://www.vivino.com"

REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=30)
MAX_PAGES = 60  # safety cap

# Detail lookup for thin cellar records.
#
# Vivino's cellar endpoint serves a stripped-down record for wines still below
# their data threshold (``statistics.status == "BelowThreshold"``): winery and
# region are null and the image is the default_label.jpg placeholder. This hits
# wines the user has just added themselves — precisely the ones they care about
# most. The wine's own page does carry a real label image and a winery, so those
# are fetched from there and filled in afterwards.
ENRICH_SPACING_SECONDS = 1.0
MAX_ENRICH_PER_SYNC = 25
PLACEHOLDER_LABEL = "default_label"

# The wine page gives the country as an ISO code while the rest of the data
# carries localized names ("Italien", "Frankrike"). Without translation the
# lookup would write "it" among all the "Italien". Unknown codes are left empty
# rather than wrong.
COUNTRY_NAMES = {
    "it": "Italien", "fr": "Frankrike", "es": "Spanien", "pt": "Portugal",
    "de": "Tyskland", "at": "Österrike", "us": "USA", "au": "Australien",
    "cl": "Chile", "ar": "Argentina", "za": "Sydafrika", "nz": "Nya Zeeland",
    "gr": "Grekland", "hu": "Ungern", "ro": "Rumänien", "se": "Sverige",
}

# Write-back pacing to stay under Vivino's rate limiting.
PUSH_SPACING_SECONDS = 2.0
MAX_PUSHES_PER_SYNC = 12

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


class VivinoAuthError(Exception):
    """Raised when Vivino login fails or the session is rejected."""


class VivinoConnectionError(Exception):
    """Raised when Vivino cannot be reached (network/server trouble)."""


def _normalize_cookie(raw: str) -> str:
    """Normalize a pasted cookie into a Cookie header value.

    Accepts a full ``name=value; name2=value2`` header (best — copied from the
    browser's Network tab), a single ``name=value`` pair, or a bare session
    value (wrapped as ``_ruby-web_session=<value>`` — Vivino's Rails session
    cookie name).
    """
    raw = (raw or "").strip().strip(";").strip()
    if "=" in raw:
        return raw
    return f"_ruby-web_session={raw}"


def _cellar_path(cellar_url: str) -> str:
    """Extract the path (e.g. /sv/cellars/5398850) from a cellar URL."""
    raw = (cellar_url or "").strip()
    if not raw:
        return ""
    if "://" in raw:
        parsed = urlparse(raw)
        return parsed.path or "/"
    return raw if raw.startswith("/") else "/" + raw


def _parse_data_page(html: str) -> dict[str, Any] | None:
    """Extract and decode the Inertia ``#app data-page`` JSON from cellar HTML."""
    m = re.search(r'data-page="([^"]+)"', html)
    if not m:
        return None
    raw = (m.group(1).replace("&quot;", '"').replace("&amp;", "&")
           .replace("&#39;", "'").replace("&#34;", '"'))
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else None
    except (ValueError, TypeError):
        return None


def _count_in_props(props: Any, vintage_id: int | str) -> int | None:
    """Owned-bottle count for a vintage within already-fetched props, or None."""
    target = str(vintage_id)
    for rec in _find_wine_array(props):
        w = _parse_user_wine(rec)
        if w and w.get("vivino_id") == target:
            return w.get("owned_count") or 0
    return None


def _split_cookie(cookie_header: str) -> dict[str, str]:
    """Parse a ``name=value; name2=value2`` cookie header into a dict."""
    out: dict[str, str] = {}
    for part in (cookie_header or "").split(";"):
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            out[k.strip()] = v.strip()
    return out


def _parse_set_cookies(headers: Any) -> dict[str, str]:
    """Extract name=value pairs from a response's Set-Cookie headers."""
    out: dict[str, str] = {}
    try:
        for c in headers.getall("Set-Cookie", []):
            nv = c.split(";", 1)[0]
            if "=" in nv:
                k, v = nv.split("=", 1)
                out[k.strip()] = v.strip()
    except Exception:
        pass
    return out


def _looks_like_wine(obj: Any) -> bool:
    """Heuristic: does this object look like a cellar/wine record?"""
    if not isinstance(obj, dict):
        return False
    if isinstance(obj.get("wine"), dict) or isinstance(obj.get("vintage"), dict):
        return True
    return bool(obj.get("name")) and (
        bool(obj.get("winery")) or bool(obj.get("region"))
    )


def _find_wine_array(node: Any) -> list[dict[str, Any]]:
    """Locate the array of wine-like records in Inertia cellar props.

    Prefers the known Vivino cellar key (``props.entries``); otherwise falls
    back to the largest wine-like array found anywhere in the tree.
    """
    if isinstance(node, dict):
        for key in ("entries", "cellar_entries", "wines", "user_vintages"):
            v = node.get(key)
            if (
                isinstance(v, list) and v
                and sum(1 for x in v if _looks_like_wine(x)) >= max(1, len(v) // 2)
            ):
                return [x for x in v if isinstance(x, dict)]

    best: list[dict[str, Any]] = []

    def visit(n: Any) -> None:
        nonlocal best
        if isinstance(n, list):
            wine_like = [x for x in n if _looks_like_wine(x)]
            if n and len(wine_like) >= max(1, len(n) // 2) and len(n) > len(best):
                best = [x for x in n if isinstance(x, dict)]
            for x in n:
                visit(x)
        elif isinstance(n, dict):
            for v in n.values():
                visit(v)

    visit(node)
    return best


def _is_thin(wine: dict[str, Any]) -> bool:
    """True when the cellar record lacks what the wine page can fill in.

    The winery is the clearest marker: it is null in the cellar record for
    wines below Vivino's data threshold, but present on the wine page.
    """
    return (
        not wine.get("winery")
        or PLACEHOLDER_LABEL in str(wine.get("image_url") or "")
    )


def _parse_wine_page(html: str) -> dict[str, str]:
    """Pull image, winery, region and country out of a Vivino wine page.

    The page is not Inertia but classically rendered, so the data sits in two
    places: an ``ld+json`` block holding the image, and an HTML-escaped
    ``light_winery`` inside the page's preloaded state. Both are read
    defensively — if absent the field is left empty rather than breaking sync.
    """
    ut: dict[str, str] = {}

    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if m:
        try:
            bilder = json.loads(m.group(1)).get("image") or []
            if bilder and PLACEHOLDER_LABEL not in str(bilder[0]):
                ut["image_url"] = str(bilder[0])
        except (ValueError, AttributeError, IndexError):
            pass

    m = re.search(r'&quot;light_winery&quot;:\{(.{0,400}?)\}', html)
    if m:
        raw = ("{" + m.group(1) + "}").replace("&quot;", '"') \
            .replace("&amp;", "&").replace("&#39;", "'").replace("&#34;", '"')
        try:
            w = json.loads(raw)
        except ValueError:
            w = {}
        if isinstance(w, dict):
            if w.get("name"):
                ut["winery"] = str(w["name"])
            if w.get("region"):
                ut["region"] = str(w["region"])
            land = COUNTRY_NAMES.get(str(w.get("country") or "").lower())
            if land:
                ut["country"] = land
    return ut


class VivinoAccountClient:
    """Reads a user's Vivino cellar via the Inertia endpoint using a session cookie."""

    def __init__(self, hass: HomeAssistant, session_cookie: str, cellar_url: str) -> None:
        """Initialize with a pasted session cookie and the cellar page URL."""
        self._hass = hass
        self._cookie = _normalize_cookie(session_cookie)
        self._path = _cellar_path(cellar_url)
        self._version: str | None = None
        # Kept for compatibility with the shared sync/sensor code.
        self.alias: str = ""
        self.user_id: int | None = None
        self._session_rejected = False
        self.token_diagnostics: dict[str, Any] = {}
        # Wine pages change rarely; the cache keeps the lookup to one request
        # per wine per sync even if the same wine appears several times.
        self._detail_cache: dict[str, dict[str, str]] = {}
        # Dedicated session so Vivino cookies never leak into HA's shared one.
        self._session: aiohttp.ClientSession | None = None

    def reset_session_backoff(self) -> None:
        """No-op kept for API parity with the previous client."""
        self._session_rejected = False

    def _get_session(self) -> aiohttp.ClientSession:
        """Return the dedicated aiohttp session, creating it if needed.

        Uses a DummyCookieJar so aiohttp never stores or auto-sends cookies —
        the pasted session cookie is supplied verbatim via the Cookie header,
        avoiding duplicate/rewritten Cookie headers (which corrupt the
        percent-encoded session value).
        """
        if self._session is None or self._session.closed:
            self._session = async_create_clientsession(
                self._hass, cookie_jar=aiohttp.DummyCookieJar()
            )
        return self._session

    def _headers(self, inertia: bool = False) -> dict[str, str]:
        h = {**HEADERS, "Cookie": self._cookie}
        if inertia:
            h["X-Inertia"] = "true"
            h["X-Requested-With"] = "XMLHttpRequest"
            if self._version:
                h["X-Inertia-Version"] = self._version
        return h

    async def _get_props(self, page: int) -> dict[str, Any]:
        """Fetch one page of cellar Inertia props.

        Page 1 is read from the cellar page's rendered HTML — its embedded
        ``#app data-page`` payload carries both the Inertia asset version and
        the first page of wines. Later pages use the Inertia XHR protocol with
        that version. A redirect to the login page (or an HTML body where JSON
        was expected) means the session cookie is missing or expired.
        """
        if not self._path:
            raise VivinoAuthError("No Vivino cellar URL configured")
        session = self._get_session()

        if page == 1:
            try:
                async with session.get(
                    f"{WWW_BASE}{self._path}",
                    headers={**HEADERS, "Cookie": self._cookie,
                             "Accept": "text/html"},
                    timeout=REQUEST_TIMEOUT, allow_redirects=False,
                ) as resp:
                    _LOGGER.debug("Vivino cellar page -> HTTP %s", resp.status)
                    if resp.status in (301, 302, 303, 307, 308):
                        raise VivinoAuthError(
                            "Vivino redirected to login — the session cookie is "
                            "missing or expired; paste a fresh one"
                        )
                    if resp.status != 200:
                        raise RuntimeError(
                            f"Vivino cellar page returned HTTP {resp.status}"
                        )
                    html = await resp.text()
            except (VivinoAuthError, VivinoConnectionError, RuntimeError):
                raise
            except Exception as err:
                raise VivinoConnectionError(
                    f"Could not reach Vivino: {err}"
                ) from err

            page_obj = _parse_data_page(html)
            if not page_obj:
                raise VivinoAuthError(
                    "No cellar data found on the page — the session cookie is "
                    "likely invalid or expired; paste a fresh one"
                )
            self._version = page_obj.get("version")
            props = page_obj.get("props")
            return props if isinstance(props, dict) else {}

        # Pages 2+ via the Inertia XHR protocol
        url = f"{WWW_BASE}{self._path}?page={page}"
        for attempt in (1, 2):
            try:
                async with session.get(
                    url, headers=self._headers(inertia=True),
                    timeout=REQUEST_TIMEOUT, allow_redirects=False,
                ) as resp:
                    if resp.status == 409 and attempt == 1:
                        # Asset version drifted → re-read it from the page
                        await self._get_props(1)
                        continue
                    if resp.status in (301, 302, 303, 307, 308):
                        raise VivinoAuthError(
                            "Vivino session expired mid-sync; paste a fresh cookie"
                        )
                    if resp.status != 200:
                        raise RuntimeError(
                            f"Vivino cellar XHR returned HTTP {resp.status}"
                        )
                    text = await resp.text()
            except (VivinoAuthError, VivinoConnectionError, RuntimeError):
                raise
            except Exception as err:
                raise VivinoConnectionError(f"Vivino request failed: {err}") from err

            try:
                data = json.loads(text)
            except ValueError:
                raise VivinoAuthError(
                    "Vivino returned a web page instead of cellar data; paste a "
                    "fresh session cookie"
                )
            props = data.get("props") if isinstance(data, dict) else None
            return props if isinstance(props, dict) else {}
        return {}

    async def async_verify(self) -> dict[str, Any]:
        """Validate the cookie + cellar URL by loading the cellar page."""
        props = await self._get_props(1)
        wines = _find_wine_array(props)
        return {"reachable": True, "first_page_wines": len(wines)}

    async def async_get_cellar(self) -> list[dict[str, Any]]:
        """Return the user's Vivino cellar as parsed wine dicts."""
        records: list[dict[str, Any]] = []
        seen: set[str] = set()
        for page in range(1, MAX_PAGES + 1):
            props = await self._get_props(page)
            batch = _find_wine_array(props)
            if not batch:
                if page == 1 and props:
                    _LOGGER.warning(
                        "Vivino cellar page had no recognizable wine list; "
                        "props keys: %s", list(props.keys()),
                    )
                break
            new = 0
            for rec in batch:
                rid = str(
                    rec.get("id")
                    or (rec.get("vintage") or {}).get("id")
                    or f"{page}:{rec.get('name','')}"
                )
                if rid in seen:
                    continue
                seen.add(rid)
                records.append(rec)
                new += 1
            if new == 0:  # nothing new on this page → done
                break

        wines = [w for w in (_parse_user_wine(r) for r in records) if w]
        _log_parse_outcome("cellar", records, wines)
        await self._enrich_thin_wines(wines)
        return wines

    async def _enrich_thin_wines(self, wines: list[dict[str, Any]]) -> None:
        """Fill in image and winery for records the cellar endpoint left empty.

        Only fields that are missing are touched, so an image set by hand is
        never overwritten. Fails quietly per wine — one broken wine page must
        not stop an otherwise working sync.
        """
        thin = [w for w in wines if _is_thin(w) and w.get("vivino_id")]
        if not thin:
            return
        # Better an explicit limit than a sync fetching hundreds of pages on
        # first import. What is skipped gets logged — a silent truncation would
        # look like everything had been fetched.
        if len(thin) > MAX_ENRICH_PER_SYNC:
            _LOGGER.info(
                "Vivino: %d thin poster, hämtar details för de första %d "
                "denna synk; resten tas nästa gång",
                len(thin), MAX_ENRICH_PER_SYNC,
            )
            thin = thin[:MAX_ENRICH_PER_SYNC]

        succeeded_count = 0
        for i, wine in enumerate(thin):
            if i:
                await asyncio.sleep(ENRICH_SPACING_SECONDS)
            extra = await self._fetch_wine_details(str(wine["vivino_id"]))
            if not extra:
                continue
            for key, value in extra.items():
                if key == "image_url":
                    if PLACEHOLDER_LABEL in str(wine.get("image_url") or ""):
                        wine["image_url"] = value
                elif not wine.get(key):
                    wine[key] = value
            succeeded_count += 1
        _LOGGER.debug(
            "Vivino: efterhämtade details för %d av %d thin poster",
            succeeded_count, len(thin),
        )

    async def _fetch_wine_details(self, vintage_id: str) -> dict[str, str]:
        """Fetch a wine page and extract what the cellar record was missing."""
        if vintage_id in self._detail_cache:
            return self._detail_cache[vintage_id]
        try:
            session = self._get_session()
            async with session.get(
                f"{WWW_BASE}/wines/{vintage_id}",
                headers={**HEADERS, "Cookie": self._cookie, "Accept": "text/html"},
                timeout=REQUEST_TIMEOUT,
            ) as resp:
                if resp.status != 200:
                    _LOGGER.debug(
                        "Vivino vinsida %s -> HTTP %s", vintage_id, resp.status
                    )
                    return {}
                html = await resp.text()
        except Exception as err:  # noqa: BLE001 – får aldrig stoppa synken
            _LOGGER.debug("Kunde inte hämta vinsida %s: %s", vintage_id, err)
            return {}
        details = _parse_wine_page(html)
        self._detail_cache[vintage_id] = details
        return details

    # ── Write-back (Cork Dork -> Vivino) ─────────────────────────────

    def _cellar_numeric_id(self) -> str:
        """Return the numeric cellar id from the configured path."""
        m = re.search(r"/cellars/(\d+)", self._path or "")
        if not m:
            raise VivinoAuthError("Could not determine the Vivino cellar id")
        return m.group(1)

    async def _load_write_context(self) -> tuple[str, str, str, str, dict[str, Any]]:
        """GET the cellar page to obtain everything a write needs.

        Writes require more than reads: a fresh CSRF token pair. The GET
        Set-Cookies ``csrf_token`` / ``XSRF-TOKEN`` and embeds a ``csrf-token``
        meta; we replay all of those on the POST. Returns
        ``(version, cookie_header, csrf_meta, xsrf_value, props)``.
        """
        session = self._get_session()
        try:
            async with session.get(
                f"{WWW_BASE}{self._path}",
                headers={**HEADERS, "Cookie": self._cookie, "Accept": "text/html"},
                timeout=REQUEST_TIMEOUT, allow_redirects=False,
            ) as resp:
                if resp.status in (301, 302, 303, 307, 308):
                    raise VivinoAuthError(
                        "Vivino redirected to login — session cookie expired"
                    )
                if resp.status != 200:
                    raise RuntimeError(f"Cellar page returned HTTP {resp.status}")
                html = await resp.text()
                fresh = _parse_set_cookies(resp.headers)
        except (VivinoAuthError, VivinoConnectionError, RuntimeError):
            raise
        except Exception as err:
            raise VivinoConnectionError(f"Could not reach Vivino: {err}") from err

        m = re.search(r'<meta name="csrf-token" content="([^"]+)"', html)
        page = _parse_data_page(html)
        if not m or not page:
            raise VivinoAuthError(
                "No CSRF token / cellar data on the page — session cookie is "
                "likely invalid; paste a fresh one"
            )
        cookies = _split_cookie(self._cookie)
        cookies.update(fresh)  # fresh session + csrf_token + XSRF-TOKEN win
        cookie_header = "; ".join(f"{k}={v}" for k, v in cookies.items())
        return (
            page.get("version") or "",
            cookie_header,
            m.group(1),
            cookies.get("XSRF-TOKEN", ""),
            page.get("props") or {},
        )

    async def _count_for_vintage(self, vintage_id: int | str) -> int:
        """Read the current owned-bottle count for a vintage (0 if absent).

        A just-modified wine sorts to the top, so page 1 almost always has it;
        we still page through as a fallback.
        """
        target = str(vintage_id)
        for page in range(1, MAX_PAGES + 1):
            props = await self._get_props(page)
            batch = _find_wine_array(props)
            if not batch:
                break
            for rec in batch:
                w = _parse_user_wine(rec)
                if w and w.get("vivino_id") == target:
                    return w.get("owned_count") or 0
        return 0

    async def async_change_bottles(
        self, vintage_id: int | str, delta: int, comment: str = "Cork Dork sync"
    ) -> dict[str, Any]:
        """Add (delta>0) or consume (delta<0) bottles of a vintage in the cellar.

        Success is judged by re-reading the cellar, NOT by the HTTP status:
        Vivino's ``add`` returns HTTP 500 while still succeeding, so a 500 is
        never treated as failure and never retried (that would double-add).
        Returns a result dict with before/after counts and an ``ok`` flag.
        """
        vintage_id = int(vintage_id)
        if delta == 0:
            return {"vintage_id": vintage_id, "delta": 0, "ok": True, "skipped": True}

        version, cookie_header, csrf, xsrf, props = await self._load_write_context()
        before = _count_in_props(props, vintage_id)
        if before is None:
            before = await self._count_for_vintage(vintage_id)

        typ = "add" if delta > 0 else "consume"
        cid = self._cellar_numeric_id()
        headers = {
            **HEADERS,
            "Cookie": cookie_header,
            "Accept": "text/html, application/xhtml+xml",
            "Content-Type": "application/json",
            "X-Inertia": "true",
            "X-Inertia-Version": version,
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-Token": csrf,
            "X-XSRF-TOKEN": unquote(xsrf) if xsrf else "",
            "Origin": WWW_BASE,
            "Referer": f"{WWW_BASE}{self._path}",
        }
        body = json.dumps({
            "vintage_id": vintage_id,
            "type": typ,
            "count": abs(delta),
            "comment": comment,
        })

        session = self._get_session()
        status: int | None = None
        try:
            async with session.post(
                f"{WWW_BASE}/cellars/{cid}/events",
                headers=headers, data=body,
                timeout=REQUEST_TIMEOUT, allow_redirects=False,
            ) as resp:
                status = resp.status
                await resp.read()
        except Exception as err:
            # Network failure: we cannot know if it applied — verify below.
            _LOGGER.debug("Vivino event POST raised (will verify): %s", err)

        # Verify by re-reading — the only reliable signal.
        after = await self._count_for_vintage(vintage_id)
        expected = max(0, before + delta)
        ok = after == expected
        _LOGGER.debug(
            "Vivino %s vintage %s x%d: http=%s before=%s after=%s expected=%s ok=%s",
            typ, vintage_id, abs(delta), status, before, after, expected, ok,
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

    async def async_get_wishlist(self) -> list[dict[str, Any]]:
        """Wishlist import is not supported via the Inertia cellar endpoint."""
        return []

    async def async_get_my_wines(self) -> list[dict[str, Any]]:
        """"My Wines" import is not supported via the Inertia cellar endpoint."""
        return []



# ── Response parsing ─────────────────────────────────────────────────


def _log_parse_outcome(
    what: str, raw: list[dict[str, Any]], wines: list[dict[str, Any]]
) -> None:
    """Log fetch results, loudly when records existed but none parsed."""
    if raw and not wines:
        _LOGGER.warning(
            "Vivino %s returned %d records but none could be parsed; "
            "first record keys: %s — please report this structure",
            what, len(raw), list(raw[0].keys()),
        )
    else:
        _LOGGER.debug("Fetched %d %s wines from Vivino", len(wines), what)


def _parse_user_wine(record: dict[str, Any]) -> dict[str, Any] | None:
    """Convert a Vivino cellar/wishlist record into our wine dict shape.

    Records typically nest as {bottle_count, vintage: {year, wine: {...}}}
    but may also put the vintage/wine at the top level.
    """
    try:
        vintage = record.get("vintage")
        if not isinstance(vintage, dict):
            vintage = record if record.get("wine") else {}
        wine = vintage.get("wine")
        if not isinstance(wine, dict):
            wine = record.get("wine") if isinstance(record.get("wine"), dict) else {}
        if not wine and not vintage:
            return None

        name = wine.get("name") or vintage.get("name") or record.get("name") or ""
        if not name:
            return None

        winery = wine.get("winery") or {}
        region = wine.get("region") or {}
        country = region.get("country") if isinstance(region, dict) else {}
        if not isinstance(country, dict):
            country = {}

        year = vintage.get("year") or record.get("year")
        try:
            year = int(year)
        except (TypeError, ValueError):
            year = None
        # Vivino uses year 0 / "N.V." for non-vintage wines
        if not year or year < 1800:
            year = None

        stats = wine.get("statistics") or vintage.get("statistics") or {}
        rating = stats.get("ratings_average")
        if not (isinstance(rating, (int, float)) and rating > 0):
            rating = None
        else:
            rating = round(float(rating), 1)
        ratings_count = stats.get("ratings_count")
        if not isinstance(ratings_count, int):
            ratings_count = None

        image_url = ""
        image = vintage.get("image") or wine.get("image") or {}
        if isinstance(image, dict):
            image_url = image.get("location") or ""
            if not image_url:
                variations = image.get("variations")
                if isinstance(variations, dict):
                    image_url = (
                        variations.get("bottle_medium")
                        or variations.get("bottle_large")
                        or ""
                    )
        if image_url.startswith("//"):
            image_url = "https:" + image_url

        grape = ""
        grapes = wine.get("grapes")
        if isinstance(grapes, list):
            grape = ", ".join(
                g.get("name", "") for g in grapes
                if isinstance(g, dict) and g.get("name")
            )

        alcohol = ""
        alc = wine.get("alcohol")
        if isinstance(alc, (int, float)) and alc > 0:
            alcohol = f"{alc}%"

        # How many bottles the user owns. A Vivino cellar entry stores its
        # physical bottles as record.extras.cellar_bottles (each with a
        # deleted_at that is set once the bottle is consumed); the live count
        # is the number of non-deleted bottles. Fall back to a user_vintage or
        # top-level integer count for other response shapes.
        owned_count = None
        purchase_price = None
        extras = record.get("extras")
        if isinstance(extras, dict):
            bottles = extras.get("cellar_bottles")
            if isinstance(bottles, list):
                live = [
                    b for b in bottles
                    if isinstance(b, dict) and not b.get("deleted_at")
                ]
                owned_count = len(live)
                for b in live:
                    pp = b.get("purchase_price")
                    if isinstance(pp, (int, float)) and pp > 0:
                        purchase_price = round(float(pp), 2)
                        break
        if owned_count is None:
            uv = record.get("user_vintage")
            if isinstance(uv, dict) and isinstance(uv.get("cellar_count"), int):
                owned_count = uv["cellar_count"]
        if owned_count is None:
            for key in ("cellar_count", "bottle_count", "count"):
                val = record.get(key)
                if isinstance(val, int) and val >= 0:
                    owned_count = val
                    break
        bottle_count = owned_count if owned_count and owned_count > 0 else 1

        # The user's own rating/note. Vivino cellar entries carry these under
        # user_vintage (rating + personal_note, or a nested review); other
        # shapes use user_review/review/rating.
        user_rating = None
        user_note = ""

        def _apply_review(src: dict[str, Any]) -> None:
            nonlocal user_rating, user_note
            ur = src.get("rating")
            if user_rating is None and isinstance(ur, (int, float)) and 0 < ur <= 5:
                user_rating = round(float(ur) * 2) / 2  # half-star steps
            for note_key in ("personal_note", "note"):
                note = src.get(note_key)
                if not user_note and isinstance(note, str) and note.strip():
                    user_note = note.strip()

        uv = record.get("user_vintage")
        if isinstance(uv, dict):
            _apply_review(uv)
            if isinstance(uv.get("review"), dict):
                _apply_review(uv["review"])
        for alt in ("user_review", "review"):
            if isinstance(record.get(alt), dict):
                _apply_review(record[alt])
        if user_rating is None and isinstance(record.get("rating"), (int, float)):
            r = record["rating"]
            if 0 < r <= 5:
                user_rating = round(float(r) * 2) / 2

        # Stable Vivino identity for dedupe across syncs: prefer vintage id
        vivino_id = vintage.get("id") or wine.get("id") or record.get("id")

        wine_type_id = wine.get("type_id")
        type_map = {1: "red", 2: "white", 3: "sparkling", 4: "rosé", 7: "dessert"}
        wine_type = type_map.get(wine_type_id, "red")

        return {
            "name": str(name),
            "winery": winery.get("name", "") if isinstance(winery, dict) else "",
            "region": region.get("name", "") if isinstance(region, dict) else "",
            "country": country.get("name", ""),
            "vintage": year,
            "type": wine_type,
            "grape_variety": grape,
            "rating": rating,
            "ratings_count": ratings_count,
            "image_url": image_url,
            "alcohol": alcohol,
            "user_rating": user_rating,
            "notes": user_note,
            "price": purchase_price,
            "vivino_id": str(vivino_id) if vivino_id is not None else "",
            "bottle_count": bottle_count,
            "owned_count": owned_count,
            "source": "vivino_account",
        }
    except Exception as err:
        _LOGGER.debug("Could not parse Vivino record: %s", err)
        return None


# ── Sync into local storage ──────────────────────────────────────────


def _wine_key(wine: dict[str, Any]) -> tuple[str, str, Any]:
    """Fallback identity when a wine has no vivino_id."""
    return (
        (wine.get("name") or "").strip().lower(),
        (wine.get("winery") or "").strip().lower(),
        wine.get("vintage"),
    )


async def _reconcile_cellar(
    hass: HomeAssistant,
    storage: Any,
    client: VivinoAccountClient,
    cellar: list[dict[str, Any]],
    result: dict[str, Any],
    mode: str,
) -> None:
    """Reconcile the fetched Vivino cellar against Cork Dork and apply changes.

    ``mode`` is one of the ``VIVINO_MODE_*`` constants. In import mode Vivino
    is authoritative: Cork Dork mirrors it and nothing is ever pushed back.
    In sync mode a three-way merge against the stored baseline decides which
    side changed, and Cork-Dork-side changes are pushed to Vivino.
    """
    vivino_state = build_vivino_state(cellar)
    corkdork_counts = build_corkdork_state(storage.wines)
    old_baseline = storage.get_vivino_baseline()
    if mode == VIVINO_MODE_IMPORT:
        # Mirror: use Cork Dork's own state as the baseline. Every difference
        # then reads as "only Vivino changed", so the plan converges Cork Dork
        # to Vivino and can never contain pushes or conflicts.
        mirror_baseline = {v: {"count": n} for v, n in corkdork_counts.items()}
        plan = reconcile(mirror_baseline, vivino_state, corkdork_counts)
    else:
        plan = reconcile(old_baseline, vivino_state, corkdork_counts)

    vivino_total = sum(e.get("count", 0) for e in vivino_state.values())
    corkdork_total = sum(corkdork_counts.values())
    result["cellar_total"] = vivino_total

    # Guard 1: a suspiciously large delete wave (probably a bad/short fetch)
    # must not delete from Cork Dork.
    removes_suspicious = is_delete_wave_suspicious(plan, vivino_total, corkdork_total)
    # Guard 2: a large consume push (Cork Dork far below Vivino, e.g. local
    # data loss) must not wipe the user's Vivino cellar.
    push_consume = sum(frm - to for (_v, frm, to) in plan.push if to < frm)
    pushback_suspicious = push_consume > max(3, int(0.25 * vivino_total))

    # ── Apply Vivino → Cork Dork adds (safe: local only) ──────────────
    added = 0
    for vid, wine, n in plan.add:
        for _ in range(n):
            wine_data = {
                k: v for k, v in wine.items()
                if k not in ("owned_count", "bottle_count", "count")
            }
            wine_data["cabinet_id"] = ""      # lands in the Unassigned tab
            wine_data["source"] = "vivino_cellar"
            storage.add_wine(wine_data)
            added += 1

    # ── Fill gaps on wines that already exist ────────────────────────
    #
    # The plan above only adds and removes bottles; fields on existing wines
    # were never touched. That left a wine imported while Vivino still lacked a
    # winery and label image empty forever, even after Vivino filled it in.
    #
    # Only empty fields are filled, and the image is replaced only when it is
    # the placeholder, so anything entered by hand stays untouched.
    enriched_count = 0
    if cellar:
        by_id = {str(w.get("vivino_id")): w for w in cellar if w.get("vivino_id")}
        for local in storage.wines:
            fresh = by_id.get(str(local.get("vivino_id") or ""))
            if not fresh:
                continue
            changes: dict[str, Any] = {}
            for key in ("winery", "region", "country", "grape_variety",
                           "rating", "ratings_count", "alcohol", "description"):
                if not local.get(key) and fresh.get(key):
                    changes[key] = fresh[key]
            image = str(fresh.get("image_url") or "")
            if (image and PLACEHOLDER_LABEL not in image
                    and PLACEHOLDER_LABEL in str(local.get("image_url") or "")):
                changes["image_url"] = image
            if changes:
                storage.update_wine(local.get("id"), changes)
                enriched_count += 1
    result["cellar_enriched"] = enriched_count
    if enriched_count:
        _LOGGER.debug("Vivino: fyllde i luckor på %d befintliga viner", enriched_count)

    # ── Apply Vivino → Cork Dork removals (unless suspicious) ─────────
    removed = 0
    if plan.remove and removes_suspicious:
        result["errors"].append(
            f"Skipped removing {plan.remove_count} bottle(s): Vivino returned "
            "suspiciously few wines (possible bad fetch) — not deleting locally."
        )
    else:
        for vid, n in plan.remove:
            removed += storage.remove_vivino_bottles(vid, n)

    # ── Apply Cork Dork → Vivino push-back (paced + capped) ──────────
    pushed = 0
    push_failed = 0
    succeeded: set[str] = set()
    if mode == VIVINO_MODE_SYNC and plan.push and not pushback_suspicious:
        for vid, frm, to in plan.push:
            if pushed + push_failed >= MAX_PUSHES_PER_SYNC:
                break  # remainder stays queued and retries next sync
            try:
                res = await client.async_change_bottles(int(vid), to - frm)
                if res.get("ok"):
                    pushed += 1
                    succeeded.add(vid)
                else:
                    push_failed += 1
            except Exception as err:
                push_failed += 1
                _LOGGER.warning("Vivino push-back failed for %s: %s", vid, err)
            await asyncio.sleep(PUSH_SPACING_SECONDS)
    elif plan.push and pushback_suspicious:
        result["errors"].append(
            f"Skipped pushing {push_consume} removal(s) to Vivino: Cork Dork has "
            "far fewer bottles than Vivino (possible local data loss) — not "
            "modifying your Vivino cellar."
        )

    # ── Rebuild the baseline = the newly-agreed state ────────────────
    # Wines that are still not reconciled (conflicts, failed/capped/suspicious
    # pushes, skipped removals) keep their OLD baseline so the discrepancy is
    # re-detected and retried next sync instead of being silently accepted.
    corkdork_after = build_corkdork_state(storage.wines)
    unresolved: set[str] = {vid for (vid, _b, _v, _c) in plan.conflicts}
    unresolved |= {vid for (vid, _f, _t) in plan.push if vid not in succeeded}
    if removes_suspicious:
        unresolved |= {vid for (vid, _n) in plan.remove}

    new_baseline: dict[str, Any] = {}
    for vid in set(vivino_state) | set(corkdork_after) | set(old_baseline):
        if vid in unresolved:
            if vid in old_baseline:
                new_baseline[vid] = old_baseline[vid]
            continue
        cnt = corkdork_after.get(vid, 0)
        if cnt <= 0:
            continue
        meta = vivino_state.get(vid, {}).get("wine") or {}
        ob = old_baseline.get(vid, {})
        new_baseline[vid] = {
            "count": cnt,
            "name": meta.get("name") or ob.get("name", ""),
            "winery": meta.get("winery") or ob.get("winery", ""),
            "vintage": meta.get("vintage", ob.get("vintage")),
        }
    storage.set_vivino_baseline(new_baseline)

    # Informational queue of pushes not yet applied
    pending = [
        {"vintage_id": vid, "from": frm, "to": to}
        for (vid, frm, to) in plan.push if vid not in succeeded
    ]
    storage.set_vivino_pending_push(pending)

    result["cellar_added"] = added
    result["cellar_removed"] = removed
    result["cellar_imported"] = added  # backward-compat
    result["cellar_pushed"] = pushed
    result["cellar_push_failed"] = push_failed
    result["cellar_pending_push"] = len(pending)
    result["cellar_conflicts"] = len(plan.conflicts)
    result["conflicts_detail"] = [
        {"vintage_id": vid, "baseline": b, "vivino": v, "cork": c}
        for (vid, b, v, c) in plan.conflicts
    ]
    _LOGGER.info(
        "Vivino reconcile: +%d/-%d local, %d pushed (%d failed, %d pending), "
        "%d conflicts", added, removed, pushed, push_failed, len(pending),
        len(plan.conflicts),
    )


async def async_sync_from_vivino(
    hass: HomeAssistant,
    storage: Any,
    client: VivinoAccountClient,
    sync_cellar: bool = True,
    sync_wishlist: bool = True,
    sync_my_wines: bool = False,
    mode: str | None = None,
) -> dict[str, Any]:
    """Reconcile the Vivino cellar with Cork Dork, honoring the Vivino mode.

    ``mode`` defaults to the ``vivino_mode`` option on the config entry
    (falling back to import), so every caller — service, websocket, timer —
    respects what the user chose in the UI unless a test overrides it.

    Import mode mirrors Vivino into Cork Dork and never writes to the user's
    Vivino account. Sync mode uses a stored baseline (last-synced state) for
    a three-way merge: Vivino-side changes are applied to Cork Dork (adds and
    removals), Cork-Dork-side changes are pushed back to Vivino (paced +
    capped), and both-sides-differ cases are flagged as conflicts and left
    untouched. Guarded so a bad fetch can't wipe Cork Dork and corrupt local
    data can't wipe Vivino. Returns a result summary, also stored for the
    status sensor.
    """
    if mode is None:
        entries = hass.config_entries.async_entries(DOMAIN)
        mode = (
            entries[0].options.get(CONF_VIVINO_MODE, DEFAULT_VIVINO_MODE)
            if entries else DEFAULT_VIVINO_MODE
        )
    result: dict[str, Any] = {
        "cellar_total": 0,
        "cellar_imported": 0,          # backward-compat alias for added
        "cellar_added": 0,
        "cellar_removed": 0,
        "cellar_pushed": 0,
        "cellar_push_failed": 0,
        "cellar_pending_push": 0,
        "cellar_conflicts": 0,
        "conflicts_detail": [],
        "cellar_skipped_no_bottles": 0,
        "wishlist_total": 0,
        "wishlist_imported": 0,
        "my_wines_total": 0,
        "my_wines_imported": 0,
        "my_wines_skipped_no_bottles": 0,
        "errors": [],
        "vivino_mode": mode,
    }

    client.reset_session_backoff()

    if sync_cellar:
        cellar: list[dict[str, Any]] | None = None
        try:
            cellar = await client.async_get_cellar()
        except VivinoAuthError as err:
            result["errors"].append(f"Cellar: {err}")
        except Exception as err:
            _LOGGER.warning("Vivino cellar fetch failed: %s", err)
            result["errors"].append(f"Cellar: {err}")

        if cellar is not None:
            await _reconcile_cellar(
                hass, storage, client, cellar, result, mode
            )

    if sync_my_wines:
        try:
            mw = await client.async_get_my_wines()  # currently returns []
            result["my_wines_total"] = sum(w.get("owned_count") or 0 for w in mw)
        except Exception as err:
            result["errors"].append(f"My Wines: {err}")

    if sync_wishlist:
        try:
            wishlist = await client.async_get_wishlist()
            result["wishlist_total"] = len(wishlist)

            buy_ids = {i.get("vivino_id") for i in storage.buy_list if i.get("vivino_id")}
            buy_keys = {_wine_key(i) for i in storage.buy_list}
            # Wines already in the cellar shouldn't be re-suggested to buy
            cellar_ids = {w.get("vivino_id") for w in storage.wines if w.get("vivino_id")}

            for entry in wishlist:
                vid = entry.get("vivino_id", "")
                if vid and (vid in buy_ids or vid in cellar_ids):
                    continue
                if _wine_key(entry) in buy_keys:
                    continue
                item = {k: v for k, v in entry.items() if k != "bottle_count"}
                storage.add_buy_list_item(item)
                result["wishlist_imported"] += 1
                if vid:
                    buy_ids.add(vid)
                buy_keys.add(_wine_key(entry))
        except VivinoAuthError as err:
            result["errors"].append(f"Wishlist: {err}")
        except Exception as err:
            _LOGGER.warning("Vivino wishlist sync failed: %s", err)
            result["errors"].append(f"Wishlist: {err}")

    result["last_sync"] = datetime.now(timezone.utc).isoformat()
    result["user_id"] = client.user_id
    result["alias"] = client.alias
    result["auth"] = client.token_diagnostics

    # Persist the result so the sync sensor survives restarts
    storage.set_vivino_sync_status(result)
    await storage.async_save()
    hass.data.setdefault(DOMAIN, {})["vivino_sync_status"] = result

    # Always fire so the card and the Vivino sync sensor refresh
    hass.bus.async_fire(f"{DOMAIN}_updated")

    # Prompt the user to refresh the cookie when the session has expired;
    # clear the prompt once a sync authenticates again.
    try:
        from homeassistant.components import persistent_notification
        auth_failed = any(
            "cookie" in e.lower() or "session" in e.lower()
            for e in result["errors"]
        )
        if auth_failed and not result["cellar_imported"]:
            persistent_notification.async_create(
                hass,
                "Cork Dork could not read your Vivino cellar — the session "
                "cookie has expired. Open Settings > Devices & Services > "
                "Cork Dork > Configure and paste a fresh Vivino session cookie.",
                title="Vivino session expired",
                notification_id="wine_cellar_vivino_reauth",
            )
        elif not result["errors"]:
            persistent_notification.async_dismiss(
                hass, "wine_cellar_vivino_reauth"
            )
        # Surface conflicts (both sides changed a wine differently)
        if result.get("cellar_conflicts"):
            persistent_notification.async_create(
                hass,
                f"{result['cellar_conflicts']} wine(s) changed in both Cork Dork "
                "and Vivino since the last sync and couldn't be reconciled "
                "automatically. Adjust one side to match, then sync again.",
                title="Vivino sync conflicts",
                notification_id="wine_cellar_vivino_conflicts",
            )
        else:
            persistent_notification.async_dismiss(
                hass, "wine_cellar_vivino_conflicts"
            )
    except Exception:  # notifications are best-effort
        pass

    _LOGGER.info(
        "Vivino sync: cellar +%d/-%d (own %d), pushed %d, %d conflicts, "
        "%d wishlist, %d errors",
        result["cellar_added"], result["cellar_removed"], result["cellar_total"],
        result["cellar_pushed"], result["cellar_conflicts"],
        result["wishlist_imported"], len(result["errors"]),
    )
    return result
