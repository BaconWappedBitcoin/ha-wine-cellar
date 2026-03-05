"""Vivino wine search and Open Food Facts fallback."""

from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

VIVINO_SEARCH_URL = "https://www.vivino.com/search/wines?q={query}"
VIVINO_API_URL = "https://www.vivino.com/api/explore/explore"
OFF_API_URL = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"


class VivinoClient:
    """Client for looking up wine data from Vivino and Open Food Facts."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the client."""
        self._hass = hass

    async def lookup_barcode(self, barcode: str) -> dict[str, Any] | None:
        """Look up a wine by barcode, trying Vivino then Open Food Facts."""
        result = await self._search_vivino(barcode)
        if result:
            return result

        result = await self._search_open_food_facts(barcode)
        if result:
            return result

        return None

    async def search_wine(self, query: str) -> list[dict[str, Any]]:
        """Search for wines by name/text query."""
        return await self._search_vivino_explore(query)

    async def _search_vivino(self, query: str) -> dict[str, Any] | None:
        """Search Vivino for wine info."""
        try:
            results = await self._search_vivino_explore(query)
            if results:
                return results[0]
        except Exception:
            _LOGGER.debug("Vivino search failed for query: %s", query)
        return None

    async def _search_vivino_explore(self, query: str) -> list[dict[str, Any]]:
        """Use Vivino's explore API to search for wines."""
        session = async_get_clientsession(self._hass)
        results = []

        try:
            # Vivino explore API requires country_code and currency_code
            params = {
                "q": query,
                "page": 1,
                "page_size": 5,
                "country_code": "US",
                "currency_code": "USD",
                "language": "en",
            }
            headers = {
                "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Accept": "application/json",
            }

            async with session.get(
                VIVINO_API_URL, params=params, headers=headers, timeout=15
            ) as resp:
                if resp.status != 200:
                    _LOGGER.warning(
                        "Vivino API returned status %s for query '%s'",
                        resp.status, query,
                    )
                    return []

                data = await resp.json()
                matches = data.get("explore_vintage", {}).get("matches", [])
                _LOGGER.debug(
                    "Vivino search for '%s' returned %d matches", query, len(matches)
                )

                for match in matches:
                    vintage = match.get("vintage", {})
                    wine = vintage.get("wine", {})
                    winery = wine.get("winery", {})
                    region = wine.get("region", {})
                    country = region.get("country", {})

                    wine_type = _map_wine_type(wine.get("type_id"))

                    results.append({
                        "name": wine.get("name", ""),
                        "winery": winery.get("name", ""),
                        "region": region.get("name", ""),
                        "country": country.get("name", ""),
                        "vintage": vintage.get("year"),
                        "type": wine_type,
                        "grape_variety": "",
                        "rating": wine.get("statistics", {}).get("ratings_average"),
                        "image_url": vintage.get("image", {}).get("location", ""),
                        "price": None,
                        "source": "vivino",
                    })

        except Exception as err:
            _LOGGER.warning("Vivino explore API error for '%s': %s", query, err)

        return results

    async def _search_open_food_facts(self, barcode: str) -> dict[str, Any] | None:
        """Fall back to Open Food Facts for barcode lookup."""
        session = async_get_clientsession(self._hass)

        try:
            url = OFF_API_URL.format(barcode=barcode)
            async with session.get(url, timeout=10) as resp:
                if resp.status != 200:
                    return None

                data = await resp.json()
                if data.get("status") != 1:
                    return None

                product = data.get("product", {})
                name = product.get("product_name", "")
                if not name:
                    return None

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
