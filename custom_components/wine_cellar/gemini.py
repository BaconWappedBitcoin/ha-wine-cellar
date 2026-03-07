"""Google Gemini Vision API client for wine label recognition."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)

LABEL_PROMPT = """You are a master sommelier and wine label recognition expert. The current year is {current_year}. Analyze this wine label image, identify the wine, and provide a full assessment. Return ONLY a JSON object with these exact fields:

{{
  "name": "the full wine name including style (e.g. Crémant Demi-Sec, Cabernet Sauvignon Reserve)",
  "winery": "the producer/winery/domaine/château name",
  "vintage": 2020,
  "type": "red",
  "region": "the wine region (e.g. Bordeaux, Napa Valley, Barossa Valley)",
  "country": "the country of origin",
  "grape_variety": "grape varieties if mentioned on label or known for this wine",
  "disposition": "D",
  "drink_by": "2028",
  "drink_window": "2025-2028",
  "description": "2-3 sentence tasting profile",
  "estimated_price": null,
  "rating_ws": null,
  "rating_rp": null,
  "rating_jd": null,
  "rating_ag": null,
  "notes": "brief notes from the label"
}}

Label reading rules:
- "name" should include the wine name AND style/designation (Brut, Demi-Sec, Reserve, Grand Cru, etc.) but NOT the winery name
- "vintage" must be a 4-digit year as an integer, or null if not visible (NV wines = null)
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- For "type", infer from visual cues (bottle color, label text like "Blanc", "Rosé", "Brut") if not explicitly stated
- If the image is not a wine label, return {{"error": "not_a_wine_label"}}

Wine analysis rules:
- "disposition": "D" = Drink Now, "H" = Hold, "P" = Past Peak
- "drink_by": the LAST year of the drinking window
- "drink_window": optimal drinking window as "YYYY-YYYY" range
- Aging guidelines — be conservative:
  - Everyday reds/whites (under $20): 1-3 years from vintage = "Drink Now"
  - Quality reds ($20-50): 3-7 years from vintage
  - Premium Bordeaux, Barolo, Napa Cab ($50+): 10-15 years, rarely more than 20
  - Rosé: 1-2 years = always "Drink Now"
  - Most whites: 1-3 years. Quality Chardonnay/Riesling: 3-5 years
  - Sparkling NV: 2-3 years. Vintage Champagne: 5-10 years
  - Dessert wines: 10-20+ years
  - NV wines: "Drink Now" with drink_window "{current_year}-{next_year}"
- "description": Professional tasting-style description of this wine's character
- "estimated_price": estimated current US retail price as a number (e.g. 45.00). Use null only if truly unknown.
- Rating fields (rating_ws, rating_rp, rating_jd, rating_ag): critic scores out of 100 if known. Use null if unknown. Do NOT fabricate.
- "notes": brief info from the label itself (appellation, classification, etc.)"""


WINE_LIST_PROMPT = """You are a master sommelier. Analyze this photograph of a restaurant wine list, wine menu, store receipt, or purchase receipt. Extract EVERY wine listed on the page.

Return ONLY a JSON object with this structure:
{
  "wines": [
    {
      "name": "the wine name (grape/style/designation, NOT the winery)",
      "winery": "the producer/winery/domaine/chateau",
      "vintage": 2020,
      "type": "red",
      "region": "the wine region if mentioned or inferable",
      "country": "the country if mentioned or inferable",
      "grape_variety": "grape variety if mentioned or inferable",
      "list_price": 65.00,
      "list_price_currency": "USD",
      "glass_price": null,
      "bottle_size": "750ml"
    }
  ],
  "restaurant_name": "name if visible on the menu or receipt (store name, restaurant name, etc.)",
  "currency": "USD"
}

Rules:
- Extract ALL wines visible on the menu or receipt, including by-the-glass options
- For receipts: extract wine items only (skip non-wine items like food, tax, tips, etc.)
- "name" should include the wine name and style but NOT the winery/producer name
- "vintage" must be a 4-digit year as an integer, or null if NV or not shown
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- "list_price" is the price as a number (e.g. 65.00). Use null only if truly unreadable.
- "list_price_currency" should be the 3-letter currency code (USD, EUR, GBP, etc.)
- "glass_price" is the by-the-glass price if offered, otherwise null
- "bottle_size" defaults to "750ml" unless the menu specifies otherwise
- "currency" is the primary currency used on the document
- "restaurant_name" from any header/logo/store name visible, or null
- For ambiguous types, infer from grape variety or region
- If the image contains no wines at all, return {"error": "not_a_wine_list"}
- Be thorough: do not skip any wines. If text is partially obscured, include what you can read.
- Preserve the order wines appear on the document."""


class GeminiVisionClient:
    """Client for Google Gemini Vision API wine label recognition."""

    def __init__(self, hass: HomeAssistant, api_key: str) -> None:
        """Initialize the client."""
        self._hass = hass
        self._api_key = api_key

    async def recognize_label(self, image_base64: str) -> dict[str, Any]:
        """Send image to Gemini Vision and get structured wine data.

        Returns a dict with either wine data + source="gemini",
        or {"error": "description"} on failure.
        """
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        session = async_get_clientsession(self._hass)

        _LOGGER.debug(
            "Sending image to Gemini (%d chars base64)", len(image_base64)
        )

        body = {
            "contents": [
                {
                    "parts": [
                        {"text": LABEL_PROMPT.format(current_year=datetime.now().year, next_year=datetime.now().year + 1)},
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": image_base64,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            timeout = aiohttp.ClientTimeout(total=45)
            async with session.post(
                GEMINI_API_URL,
                params={"key": self._api_key},
                json=body,
                timeout=timeout,
            ) as resp:
                resp_text = await resp.text()

                if resp.status == 401 or resp.status == 403:
                    _LOGGER.error(
                        "Gemini API key is invalid (status %s): %s",
                        resp.status,
                        resp_text[:200],
                    )
                    return {"error": f"Gemini API key is invalid (HTTP {resp.status})"}

                if resp.status == 429:
                    _LOGGER.error(
                        "Gemini API quota exhausted: %s", resp_text[:300]
                    )
                    return {
                        "error": "Gemini API free tier quota exhausted. "
                        "Enable billing at console.cloud.google.com or "
                        "create a new API key at aistudio.google.com/apikey"
                    }

                if resp.status != 200:
                    _LOGGER.error(
                        "Gemini API returned status %s: %s",
                        resp.status,
                        resp_text[:500],
                    )
                    return {"error": f"Gemini API error (HTTP {resp.status})"}

                data = json.loads(resp_text)

                # Extract text from Gemini response
                candidates = data.get("candidates", [])
                if not candidates:
                    _LOGGER.warning(
                        "Gemini returned no candidates: %s", resp_text[:500]
                    )
                    return {"error": "Gemini returned no results"}

                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if not parts:
                    _LOGGER.warning("Gemini response has no parts")
                    return {"error": "Gemini returned empty response"}

                text = parts[0].get("text", "")
                _LOGGER.debug("Gemini raw response: %s", text[:500])
                result = json.loads(text)

                # Check for error response from Gemini
                if "error" in result:
                    _LOGGER.debug("Gemini: %s", result["error"])
                    return {"error": f"Not a wine label: {result['error']}"}

                # Validate and normalize
                valid_types = {"red", "white", "rosé", "sparkling", "dessert"}
                wine_type = result.get("type", "red")
                if wine_type not in valid_types:
                    wine_type = "red"

                vintage = result.get("vintage")
                if vintage is not None:
                    try:
                        vintage = int(vintage)
                        if vintage < 1900 or vintage > 2030:
                            vintage = None
                    except (ValueError, TypeError):
                        vintage = None

                name = str(result.get("name", "")).strip()
                if not name:
                    return {"error": "Could not read wine name from label"}

                # Parse estimated price
                est_price = result.get("estimated_price")
                if est_price is not None:
                    try:
                        est_price = round(float(est_price), 2)
                        if est_price <= 0:
                            est_price = None
                    except (ValueError, TypeError):
                        est_price = None

                # Parse disposition
                disp = result.get("disposition", "")
                if disp not in ("D", "H", "P"):
                    disp = ""

                # Parse AI ratings
                ai_ratings: dict[str, int] = {}
                for key in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
                    val = result.get(key)
                    if val and isinstance(val, (int, float)) and 50 <= val <= 100:
                        ai_ratings[key] = int(val)

                return {
                    "name": name,
                    "winery": str(result.get("winery", "")).strip(),
                    "region": str(result.get("region", "")).strip(),
                    "country": str(result.get("country", "")).strip(),
                    "vintage": vintage,
                    "type": wine_type,
                    "grape_variety": str(result.get("grape_variety", "")).strip(),
                    "disposition": disp,
                    "drink_by": str(result.get("drink_by", "")).strip(),
                    "drink_window": str(result.get("drink_window", "")).strip(),
                    "description": str(result.get("description", "")).strip(),
                    "estimated_price": est_price,
                    "ai_ratings": ai_ratings if ai_ratings else None,
                    "notes": str(result.get("notes", "")).strip(),
                    "rating": None,
                    "image_url": "",
                    "price": None,
                    "source": "gemini",
                }

        except json.JSONDecodeError as err:
            _LOGGER.error("Failed to parse Gemini response: %s", err)
            return {"error": f"Failed to parse Gemini response: {err}"}
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error calling Gemini: %s", err)
            return {"error": f"Network error: {err}"}
        except TimeoutError:
            _LOGGER.error("Gemini API timed out")
            return {"error": "Gemini API timed out (45s)"}
        except Exception as err:
            _LOGGER.error("Gemini API error: %s", err)
            return {"error": f"Unexpected error: {err}"}

    async def extract_wine_list(self, image_base64: str) -> dict[str, Any]:
        """Extract all wines from a restaurant wine list photo.

        Returns {"wines": [...], "restaurant_name": ..., "currency": ...}
        or {"error": "description"} on failure.
        """
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        session = async_get_clientsession(self._hass)
        _LOGGER.debug(
            "Extracting wine list from image (%d chars base64)", len(image_base64)
        )

        body = {
            "contents": [
                {
                    "parts": [
                        {"text": WINE_LIST_PROMPT},
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": image_base64,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            timeout = aiohttp.ClientTimeout(total=60)
            async with session.post(
                GEMINI_API_URL,
                params={"key": self._api_key},
                json=body,
                timeout=timeout,
            ) as resp:
                if resp.status in (401, 403):
                    return {"error": f"Gemini API key is invalid (HTTP {resp.status})"}
                if resp.status == 429:
                    return {"error": "Gemini API quota exhausted"}
                if resp.status != 200:
                    return {"error": f"Gemini API error (HTTP {resp.status})"}

                data = json.loads(await resp.text())
                candidates = data.get("candidates", [])
                if not candidates:
                    return {"error": "Gemini returned no results"}

                text = (
                    candidates[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                result = json.loads(text)

                if "error" in result:
                    return {"error": f"Not a wine list: {result['error']}"}

                raw_wines = result.get("wines", [])
                if not raw_wines:
                    return {"error": "No wines found in the image"}

                valid_types = {"red", "white", "rosé", "sparkling", "dessert"}
                validated = []

                for i, w in enumerate(raw_wines):
                    name = str(w.get("name", "")).strip()
                    if not name:
                        continue

                    wine_type = w.get("type", "red")
                    if wine_type not in valid_types:
                        wine_type = "red"

                    vintage = w.get("vintage")
                    if vintage is not None:
                        try:
                            vintage = int(vintage)
                            if vintage < 1900 or vintage > 2030:
                                vintage = None
                        except (ValueError, TypeError):
                            vintage = None

                    list_price = w.get("list_price")
                    if list_price is not None:
                        try:
                            list_price = round(float(list_price), 2)
                            if list_price <= 0:
                                list_price = None
                        except (ValueError, TypeError):
                            list_price = None

                    glass_price = w.get("glass_price")
                    if glass_price is not None:
                        try:
                            glass_price = round(float(glass_price), 2)
                            if glass_price <= 0:
                                glass_price = None
                        except (ValueError, TypeError):
                            glass_price = None

                    validated.append({
                        "index": i,
                        "name": name,
                        "winery": str(w.get("winery", "")).strip(),
                        "vintage": vintage,
                        "type": wine_type,
                        "region": str(w.get("region", "")).strip(),
                        "country": str(w.get("country", "")).strip(),
                        "grape_variety": str(w.get("grape_variety", "")).strip(),
                        "list_price": list_price,
                        "list_price_currency": str(
                            w.get("list_price_currency", "USD")
                        ).strip().upper(),
                        "glass_price": glass_price,
                        "bottle_size": str(w.get("bottle_size", "750ml")).strip(),
                    })

                return {
                    "wines": validated,
                    "restaurant_name": str(
                        result.get("restaurant_name", "")
                    ).strip() or None,
                    "currency": str(
                        result.get("currency", "USD")
                    ).strip().upper(),
                }

        except json.JSONDecodeError as err:
            _LOGGER.error("Failed to parse wine list response: %s", err)
            return {"error": f"Failed to parse response: {err}"}
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error extracting wine list: %s", err)
            return {"error": f"Network error: {err}"}
        except TimeoutError:
            return {"error": "Gemini API timed out (60s)"}
        except Exception as err:
            _LOGGER.error("Wine list extraction error: %s", err)
            return {"error": f"Unexpected error: {err}"}

    async def analyze_single_wine(self, wine: dict[str, Any]) -> dict[str, Any]:
        """Analyze a single wine with AI — disposition, drink dates, and ratings.

        Returns enriched data or {"error": "..."}.
        """
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        current_year = datetime.now().year
        vintage = wine.get("vintage") or "NV"
        wine_type = wine.get("type", "red")
        name = wine.get("name", "Unknown")
        winery = wine.get("winery", "")
        region = wine.get("region", "")
        country = wine.get("country", "")
        grape = wine.get("grape_variety", "")
        drink_by = wine.get("drink_by", "")

        prompt = f"""You are a master sommelier and wine critic. The current year is {current_year}.

Analyze this wine and provide detailed assessment:

Wine: {name}
Winery: {winery}
Vintage: {vintage}
Type: {wine_type}
Region: {region}
Country: {country}
Grape: {grape}
Current drink_by: {drink_by}

Return ONLY a JSON object with these fields:
{{
  "disposition": "D or H or P",
  "drink_by": "optimal year to drink by, e.g. 2028",
  "drink_window": "e.g. 2025-2030",
  "description": "2-3 sentence tasting profile and character of this wine",
  "estimated_price": null,
  "rating_ws": null,
  "rating_rp": null,
  "rating_jd": null,
  "rating_ag": null
}}

Rules:
- "disposition": "D" = Drink Now, "H" = Hold, "P" = Past Peak
- "drink_by": the LAST year of the drinking window — when the wine should be consumed by. Be conservative and realistic.
- "drink_window": optimal drinking window as "YYYY-YYYY" range. This is what will be shown to the user.
- IMPORTANT aging guidelines — be conservative, most wines don't age long:
  - Most everyday reds and whites (under $20): drink within 1-3 years of vintage. These are "Drink Now."
  - Quality reds (good Cabernet, Merlot, Syrah, $20-50): 3-7 years from vintage
  - Premium Bordeaux, Barolo, Napa Cab ($50+): can age 10-15 years, rarely more than 20
  - Rosé: drink within 1-2 years of vintage — always "Drink Now"
  - Most whites (Sauvignon Blanc, Pinot Grigio): 1-3 years from vintage
  - Quality Chardonnay/Riesling: 3-5 years from vintage
  - Sparkling/Champagne NV: drink within 2-3 years. Vintage Champagne: 5-10 years.
  - Dessert wines (Sauternes, Port): can age 10-20+ years
  - NV (non-vintage) wines: assume current, "Drink Now" with drink_window "{current_year}-{current_year + 1}"
  - If the wine is already past its typical aging window, mark as "Past Peak" or "Drink Now" (not "Hold")
  - When in doubt, err on the side of drinking sooner rather than later
- "description": Write a professional tasting-style description of what this wine is known for. If you know the wine, describe its character. If not, describe what to expect based on grape, region, and vintage.
- Rating fields: If you know or can reliably estimate ratings for this specific wine and vintage from major critics, provide them as numbers (e.g. 92). Use null if unknown.
  - "rating_ws": Wine Spectator score (out of 100)
  - "rating_rp": Robert Parker / Wine Advocate score (out of 100)
  - "rating_jd": James Suckling / Jeb Dunnuck score (out of 100)
  - "rating_ag": Antonio Galloni / Vinous score (out of 100)
- "estimated_price": estimated current retail price in USD as a number (e.g. 45.00). Use your knowledge of the wine market to estimate what this bottle currently sells for. Return null only if you truly cannot estimate.
- Only provide ratings you are reasonably confident about. Use null for wines you cannot rate with confidence.
- Do NOT fabricate ratings. Better to return null than guess."""

        session = async_get_clientsession(self._hass)

        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            },
        }

        try:
            timeout = aiohttp.ClientTimeout(total=45)
            async with session.post(
                GEMINI_API_URL,
                params={"key": self._api_key},
                json=body,
                timeout=timeout,
            ) as resp:
                if resp.status == 429:
                    return {"error": "Gemini API quota exhausted"}
                if resp.status != 200:
                    return {"error": f"Gemini API error (HTTP {resp.status})"}

                data = json.loads(await resp.text())
                candidates = data.get("candidates", [])
                if not candidates:
                    return {"error": "Gemini returned no results"}

                text = candidates[0]["content"]["parts"][0]["text"]
                result = json.loads(text)

                # Validate disposition
                disp = result.get("disposition", "D")
                if disp not in ("D", "H", "P"):
                    disp = "D"

                # Parse estimated price
                est_price = result.get("estimated_price")
                if est_price is not None:
                    try:
                        est_price = round(float(est_price), 2)
                        if est_price <= 0:
                            est_price = None
                    except (ValueError, TypeError):
                        est_price = None

                return {
                    "disposition": disp,
                    "drink_by": str(result.get("drink_by", "")).strip(),
                    "drink_window": str(result.get("drink_window", "")).strip(),
                    "description": str(result.get("description", "")).strip(),
                    "estimated_price": est_price,
                    "rating_ws": result.get("rating_ws"),
                    "rating_rp": result.get("rating_rp"),
                    "rating_jd": result.get("rating_jd"),
                    "rating_ag": result.get("rating_ag"),
                }

        except Exception as err:
            _LOGGER.error("Single wine analysis error: %s", err)
            return {"error": f"Analysis failed: {err}"}

    async def analyze_collection(
        self, wines: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze wine collection and return drink/hold dispositions.

        Returns {"dispositions": {wine_id: "D"|"H"|"P"}} or {"error": "..."}.
        """
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        # Build a concise wine list for analysis
        current_year = datetime.now().year
        wine_lines = []
        for w in wines:
            vintage = w.get("vintage") or "NV"
            wine_type = w.get("type", "red")
            name = w.get("name", "Unknown")
            winery = w.get("winery", "")
            region = w.get("region", "")
            drink_by = w.get("drink_by", "")
            line = (
                f'ID:{w["id"]}|{name}|{winery}|{vintage}|{wine_type}'
                f"|{region}|drink_by:{drink_by}"
            )
            wine_lines.append(line)

        prompt = f"""You are a wine sommelier. The current year is {current_year}.
Analyze each wine and assign a disposition:
- "D" = Drink Now (at or near peak, best enjoyed soon)
- "H" = Hold (will improve with more aging)
- "P" = Past Peak (likely past its prime drinking window)

Consider vintage age, wine type, region, and any drink_by dates.
General guidelines:
- Most everyday reds/whites: drink within 3-5 years of vintage
- Quality Bordeaux/Barolo/Napa Cab: can age 10-20+ years
- Sparkling: drink within 3-5 years unless vintage champagne
- Rosé/most whites: drink within 2-3 years
- Dessert wines: can age decades
- NV wines: assume current, Drink Now

Return ONLY a JSON object mapping wine IDs to dispositions:
{{"wine_id_1": "D", "wine_id_2": "H", "wine_id_3": "P"}}

Wines:
{chr(10).join(wine_lines)}"""

        session = async_get_clientsession(self._hass)

        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            timeout = aiohttp.ClientTimeout(total=60)
            async with session.post(
                GEMINI_API_URL,
                params={"key": self._api_key},
                json=body,
                timeout=timeout,
            ) as resp:
                if resp.status == 429:
                    return {"error": "Gemini API quota exhausted"}
                if resp.status != 200:
                    return {"error": f"Gemini API error (HTTP {resp.status})"}

                data = json.loads(await resp.text())
                candidates = data.get("candidates", [])
                if not candidates:
                    return {"error": "Gemini returned no results"}

                text = candidates[0]["content"]["parts"][0]["text"]
                dispositions = json.loads(text)

                # Validate dispositions
                valid = {"D", "H", "P"}
                cleaned = {}
                for wine_id, disp in dispositions.items():
                    if disp in valid:
                        cleaned[wine_id] = disp
                    else:
                        cleaned[wine_id] = "D"

                return {"dispositions": cleaned}

        except Exception as err:
            _LOGGER.error("Wine analysis error: %s", err)
            return {"error": f"Analysis failed: {err}"}
