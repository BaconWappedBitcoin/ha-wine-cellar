"""Google Gemini Vision API client for wine label recognition."""

from __future__ import annotations

import json
import logging
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)

LABEL_PROMPT = """You are a wine label recognition expert. Analyze this wine label image and extract the following information. Return ONLY a JSON object with these exact fields:

{
  "name": "the full wine name including style (e.g. Crémant Demi-Sec, Cabernet Sauvignon Reserve)",
  "winery": "the producer/winery/domaine/château name",
  "vintage": 2020,
  "type": "red",
  "region": "the wine region (e.g. Bordeaux, Napa Valley, Barossa Valley)",
  "country": "the country of origin",
  "grape_variety": "grape varieties if mentioned on label"
}

Rules:
- "name" should include the wine name AND style/designation (Brut, Demi-Sec, Reserve, Grand Cru, etc.) but NOT the winery name
- "vintage" must be a 4-digit year as an integer, or null if not visible (NV wines = null)
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- If you cannot determine a field, use an empty string "" (or null for vintage)
- Do not guess or fabricate information not visible on the label
- For "type", infer from visual cues (bottle color, label text like "Blanc", "Rosé", "Brut", "Méthode Champenoise") if not explicitly stated
- If the image is not a wine label, return {"error": "not_a_wine_label"}"""


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
                        {"text": LABEL_PROMPT},
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

                return {
                    "name": name,
                    "winery": str(result.get("winery", "")).strip(),
                    "region": str(result.get("region", "")).strip(),
                    "country": str(result.get("country", "")).strip(),
                    "vintage": vintage,
                    "type": wine_type,
                    "grape_variety": str(result.get("grape_variety", "")).strip(),
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

    async def analyze_collection(
        self, wines: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze wine collection and return drink/hold dispositions.

        Returns {"dispositions": {wine_id: "D"|"H"|"P"}} or {"error": "..."}.
        """
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        # Build a concise wine list for analysis
        current_year = 2026
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
