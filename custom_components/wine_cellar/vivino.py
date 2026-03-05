"""Wine lookup via Vivino, UPC Item DB, and Open Food Facts."""

from __future__ import annotations

import json
import logging
import re
from html import unescape
from typing import Any
from urllib.parse import quote_plus

import aiohttp

from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

VIVINO_API_URL = "https://www.vivino.com/api/explore/explore"
VIVINO_SEARCH_URL = "https://www.vivino.com/search/wines?q={query}"
OFF_API_URL = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
UPC_DB_URL = "https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}"

# All Vivino wine type IDs (required filter for explore API)
ALL_WINE_TYPE_IDS = [1, 2, 3, 4, 7]  # red, white, sparkling, rosé, dessert

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    ),
    "Accept": "application/json",
}


class VivinoClient:
    """Client for looking up wine data from multiple sources."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the client."""
        self._hass = hass

    async def lookup_barcode(self, barcode: str) -> dict[str, Any] | None:
        """Look up a wine by barcode using multiple sources."""
        # 1. Try UPC Item DB first (good barcode database)
        result = await self._lookup_upc_itemdb(barcode)
        if result:
            return result

        # 2. Try Open Food Facts
        result = await self._search_open_food_facts(barcode)
        if result:
            return result

        # 3. Try Vivino HTML search as last resort
        result = await self._search_vivino_html(barcode)
        if result:
            return result

        _LOGGER.warning("No results found for barcode: %s", barcode)
        return None

    async def search_wine(self, query: str) -> list[dict[str, Any]]:
        """Search for wines by name/text query."""
        # Vivino HTML search is the most reliable (explore API ignores q param)
        result = await self._search_vivino_html(query)
        if result:
            return [result]

        return []

    # ── Vivino Explore API ──────────────────────────────────────────

    async def _search_vivino_explore(self, query: str) -> list[dict[str, Any]]:
        """Use Vivino's explore API to search for wines."""
        session = async_get_clientsession(self._hass)
        results: list[dict[str, Any]] = []

        try:
            timeout = aiohttp.ClientTimeout(total=15)
            # Vivino API requires at least one wine_type_ids[] filter
            params: list[tuple[str, str]] = [
                ("q", query),
                ("page", "1"),
                ("page_size", "5"),
                ("country_code", "US"),
                ("currency_code", "USD"),
                ("language", "en"),
            ]
            # Add all wine type IDs as required filter
            for wt_id in ALL_WINE_TYPE_IDS:
                params.append(("wine_type_ids[]", str(wt_id)))

            async with session.get(
                VIVINO_API_URL, params=params, headers=HEADERS, timeout=timeout
            ) as resp:
                if resp.status != 200:
                    _LOGGER.warning(
                        "Vivino API status %s for query '%s'", resp.status, query
                    )
                    return []

                data = await resp.json()
                matches = data.get("explore_vintage", {}).get("matches", [])
                _LOGGER.debug(
                    "Vivino search for '%s' returned %d matches",
                    query,
                    len(matches),
                )

                for match in matches[:5]:
                    vintage = match.get("vintage", {})
                    wine = vintage.get("wine", {})
                    winery = wine.get("winery", {})
                    region = wine.get("region", {})
                    country = region.get("country", {})
                    wine_type = _map_wine_type(wine.get("type_id"))

                    results.append(
                        {
                            "name": wine.get("name", ""),
                            "winery": winery.get("name", ""),
                            "region": region.get("name", ""),
                            "country": country.get("name", ""),
                            "vintage": vintage.get("year"),
                            "type": wine_type,
                            "grape_variety": "",
                            "rating": wine.get("statistics", {}).get(
                                "ratings_average"
                            ),
                            "image_url": vintage.get("image", {}).get(
                                "location", ""
                            ),
                            "price": None,
                            "source": "vivino",
                        }
                    )

        except Exception as err:
            _LOGGER.warning("Vivino explore API error for '%s': %s", query, err)

        return results

    # ── Vivino HTML Search (scrape) ──────────────────────────────────

    async def _search_vivino_html(self, query: str) -> dict[str, Any] | None:
        """Search Vivino by scraping the HTML search results page."""
        session = async_get_clientsession(self._hass)

        try:
            url = VIVINO_SEARCH_URL.format(query=quote_plus(query))
            timeout = aiohttp.ClientTimeout(total=15)
            headers = {**HEADERS, "Accept": "text/html"}

            async with session.get(
                url, headers=headers, timeout=timeout, allow_redirects=True
            ) as resp:
                if resp.status != 200:
                    _LOGGER.debug("Vivino HTML search status %s", resp.status)
                    return None

                html = await resp.text()

                # Vivino embeds wine data as HTML-encoded JSON in React component props
                # Look for js-react-on-rails-component with wine data
                wine_data = _parse_vivino_html(html)
                if wine_data:
                    _LOGGER.debug(
                        "Vivino HTML search found: %s", wine_data.get("name")
                    )
                    return wine_data

        except Exception as err:
            _LOGGER.debug("Vivino HTML search error: %s", err)

        return None

    # ── UPC Item DB ──────────────────────────────────────────────────

    async def _lookup_upc_itemdb(self, barcode: str) -> dict[str, Any] | None:
        """Look up barcode via UPC Item DB (free trial API)."""
        session = async_get_clientsession(self._hass)

        try:
            url = UPC_DB_URL.format(barcode=barcode)
            timeout = aiohttp.ClientTimeout(total=10)
            async with session.get(url, timeout=timeout) as resp:
                if resp.status != 200:
                    _LOGGER.debug("UPC Item DB status %s for %s", resp.status, barcode)
                    return None

                data = await resp.json()
                items = data.get("items", [])
                if not items:
                    return None

                item = items[0]
                title = item.get("title", "")
                brand = item.get("brand", "")

                if not title:
                    return None

                # Check if this looks like a wine product
                title_lower = title.lower()
                wine_keywords = [
                    "wine",
                    "cabernet",
                    "merlot",
                    "chardonnay",
                    "pinot",
                    "sauvignon",
                    "blend",
                    "red",
                    "white",
                    "rosé",
                    "rose",
                    "champagne",
                    "prosecco",
                    "brut",
                    "750ml",
                    "bottle",
                ]
                is_wine = any(kw in title_lower for kw in wine_keywords)
                if not is_wine:
                    _LOGGER.debug(
                        "UPC Item DB result doesn't look like wine: %s", title
                    )
                    return None

                # Infer wine type from title
                wine_type = "red"
                if "white" in title_lower or "chardonnay" in title_lower:
                    wine_type = "white"
                elif "rosé" in title_lower or "rose" in title_lower:
                    wine_type = "rosé"
                elif any(
                    kw in title_lower
                    for kw in ["sparkling", "champagne", "prosecco", "brut"]
                ):
                    wine_type = "sparkling"

                # Try to extract vintage from title
                vintage = None
                year_match = re.search(r"\b(19|20)\d{2}\b", title)
                if year_match:
                    vintage = int(year_match.group())

                return {
                    "name": title,
                    "winery": brand,
                    "region": "",
                    "country": "",
                    "vintage": vintage,
                    "type": wine_type,
                    "grape_variety": "",
                    "rating": None,
                    "image_url": "",
                    "price": None,
                    "source": "upc_itemdb",
                }

        except Exception as err:
            _LOGGER.debug("UPC Item DB error: %s", err)

        return None

    # ── Open Food Facts ──────────────────────────────────────────────

    async def _search_open_food_facts(self, barcode: str) -> dict[str, Any] | None:
        """Fall back to Open Food Facts for barcode lookup."""
        session = async_get_clientsession(self._hass)

        try:
            # Try both the original and zero-padded barcode
            for bc in [barcode, barcode.zfill(13)]:
                url = OFF_API_URL.format(barcode=bc)
                timeout = aiohttp.ClientTimeout(total=10)
                async with session.get(url, timeout=timeout) as resp:
                    if resp.status != 200:
                        continue

                    data = await resp.json()
                    if data.get("status") != 1:
                        continue

                    product = data.get("product", {})
                    name = product.get("product_name", "")
                    if not name:
                        continue

                    brand = product.get("brands", "")
                    categories = product.get("categories", "").lower()
                    image = product.get("image_url", "")
                    origin = product.get("origins", "")
                    country = product.get("countries", "")

                    wine_type = "red"
                    if "white" in categories or "blanc" in categories:
                        wine_type = "white"
                    elif "rosé" in categories or "rose" in categories:
                        wine_type = "rosé"
                    elif "sparkling" in categories or "champagne" in categories:
                        wine_type = "sparkling"

                    vintage = None
                    year_match = re.search(r"(19|20)\d{2}", name)
                    if year_match:
                        vintage = int(year_match.group())

                    return {
                        "name": name,
                        "winery": brand,
                        "region": origin,
                        "country": country,
                        "vintage": vintage,
                        "type": wine_type,
                        "grape_variety": "",
                        "rating": None,
                        "image_url": image,
                        "price": None,
                        "source": "open_food_facts",
                    }

        except Exception as err:
            _LOGGER.debug("Open Food Facts lookup error: %s", err)

        return None


def _parse_vivino_html(html: str) -> dict[str, Any] | None:
    """Extract the first wine result from Vivino's HTML search page.

    Vivino embeds wine data as JSON in the HTML. We extract the first
    wine result using regex patterns against the decoded HTML.
    """
    try:
        decoded = unescape(html)

        # Find wines via "seo_name":"slug","name":"Wine Name" pattern
        wine_matches = re.findall(
            r'"seo_name":"([^"]+)","name":"([^"]+)"', decoded
        )
        if not wine_matches:
            return None

        # First match is the first wine result
        _, wine_name = wine_matches[0]

        # Extract vintage from wine name (e.g. "2023" in "Apothic Red 2023")
        vintage = None
        year_match = re.search(r"\b(19|20)\d{2}\b", wine_name)
        if year_match:
            vintage = int(year_match.group())

        # Extract winery name
        winery_match = re.search(
            r'"winery":\{"id":\d+,"name":"([^"]+)"', decoded
        )

        # Extract region name
        region_match = re.search(
            r'"region":\{"id":\d+,"name":"([^"]+)"', decoded
        )

        # Extract country name
        country_match = re.search(
            r'"country":\{"code":"[^"]*","name":"([^"]+)"', decoded
        )

        # Extract wine type
        type_match = re.search(r'"type_id":(\d+)', decoded)
        wine_type = _map_wine_type(
            int(type_match.group(1)) if type_match else None
        )

        # Extract rating
        rating = None
        for pattern in [r'"wine_ratings_average":([\d.]+)',
                        r'"ratings_average":([\d.]+)']:
            m = re.search(pattern, decoded)
            if m:
                val = float(m.group(1))
                if val > 0:
                    rating = round(val, 1)
                    break

        return {
            "name": wine_name,
            "winery": winery_match.group(1) if winery_match else "",
            "region": region_match.group(1) if region_match else "",
            "country": country_match.group(1) if country_match else "",
            "vintage": vintage,
            "type": wine_type,
            "grape_variety": "",
            "rating": rating,
            "image_url": "",
            "price": None,
            "source": "vivino",
        }

    except Exception as err:
        _LOGGER.debug("Failed to parse Vivino HTML: %s", err)

    return None


def _map_wine_type(type_id: int | None) -> str:
    """Map Vivino wine type ID to our type string."""
    mapping = {
        1: "red",
        2: "white",
        3: "sparkling",
        4: "rosé",
        7: "dessert",
    }
    return mapping.get(type_id, "red") if type_id else "red"
