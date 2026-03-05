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
    "gemini-2.0-flash:generateContent"
)

LABEL_PROMPT = """You are a wine label recognition expert. Analyze this wine label image and extract the following information. Return ONLY a JSON object with these exact fields:

{
  "name": "the wine name as shown on the label",
  "winery": "the producer/winery/domaine/château name",
  "vintage": 2020,
  "type": "red",
  "region": "the wine region (e.g. Bordeaux, Napa Valley, Barossa Valley)",
  "country": "the country of origin",
  "grape_variety": "grape varieties if mentioned on label"
}

Rules:
- "vintage" must be a 4-digit year as an integer, or null if not visible
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- If you cannot determine a field, use an empty string "" (or null for vintage)
- Do not guess or fabricate information not visible on the label
- For "type", infer from visual cues (bottle color, label text like "Blanc", "Rosé", "Brut") if not explicitly stated
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
