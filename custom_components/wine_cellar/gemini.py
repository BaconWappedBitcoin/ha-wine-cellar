"""AI Vision client for wine label/list recognition and enrichment.

Supports two transports behind a shared prompt/validation layer:
- GeminiVisionClient: Google Gemini API directly (api key only).
- OpenAICompatibleClient: any OpenAI-compatible chat completions endpoint
  (relays, aggregators like 1minAI-via-relay, local servers) — base URL +
  bearer token + model name.
"""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"


def build_gemini_api_url(model: str = DEFAULT_GEMINI_MODEL) -> str:
    """Build the Gemini generateContent endpoint for the requested model."""
    return (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )


def parse_json_response(raw_text: str) -> Any:
    """Parse an AI JSON response even when wrapped in markdown fences or extra prose.

    Models frequently wrap JSON in ```json fences, add a sentence of preamble,
    or leave a trailing comma. Try a direct parse first, then fall back to
    extracting the first balanced JSON object/array before giving up.
    """
    text = raw_text.strip()
    if not text:
        raise json.JSONDecodeError("empty response", raw_text, 0)

    if text.startswith("```"):
        lines = [line for line in text.splitlines() if line.strip()]
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    if text.startswith("json") and "\n" in text:
        text = text.split("\n", 1)[1].strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = min(
        [idx for idx in (text.find("{"), text.find("[")) if idx != -1],
        default=-1,
    )
    if start != -1:
        end = None
        brace_depth = 0
        in_string = False
        escaped = False
        for idx in range(start, len(text)):
            char = text[idx]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue
            if char == '"':
                in_string = True
            elif char == "{":
                brace_depth += 1
            elif char == "}":
                brace_depth -= 1
                if brace_depth == 0:
                    end = idx + 1
                    break

        bounded = text[start:end] if end is not None else text[start:]
        try:
            return json.loads(bounded)
        except json.JSONDecodeError:
            pass

        candidate = re.sub(r",(\s*[}\]])", r"\1", bounded)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise json.JSONDecodeError("Unable to parse AI response", raw_text, 0)


LANGUAGE_NAMES = {"en": "English", "fr": "French", "de": "German"}


def _language_prefix(language: str) -> str:
    """Leading prompt directive so free-text fields come back in the chosen language.

    A trailing note is easy for the model to under-weight against an
    otherwise all-English prompt (JSON field names, rules, examples) — an
    upfront, repeated instruction is far more reliably followed.
    """
    if language not in LANGUAGE_NAMES or language == "en":
        return ""
    name = LANGUAGE_NAMES[language]
    return (
        f"Respond in {name}. Every free-text field in your JSON output "
        f"(description, notes, food pairings, tasting profile) MUST be written "
        f"in {name} — not English. This instruction overrides the language of "
        f"the rest of this prompt. Wine names, winery names, dates, and numbers "
        f"stay as-is.\n\n"
    )


def _language_suffix(language: str) -> str:
    """Trailing reminder, reinforcing `_language_prefix` at the end of the prompt."""
    if language not in LANGUAGE_NAMES or language == "en":
        return ""
    return f"\n\nReminder: write every free-text field in {LANGUAGE_NAMES[language]}."


def _extract_base64_from_data_url(value: str | None) -> str | None:
    """Return the raw base64 payload from a `data:image/...;base64,XXXX` string.

    Wine photos captured by the user are stored this way; Vivino-sourced
    photos are a plain https:// URL instead, which can't be sent as inline
    image data — this returns None for those (and anything else unusable).
    """
    if not value or not value.startswith("data:image") or ";base64," not in value:
        return None
    return value.split(";base64,", 1)[1]


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
  "notes": "brief notes from the label",
  "barcode": null
}}

Label reading rules:
- "name" should include the wine name AND style/designation (Brut, Demi-Sec, Reserve, Grand Cru, etc.) but NOT the winery name
- "vintage" must be a 4-digit year as an integer, or null if not visible (NV wines = null) — check both front and back label if two images are provided, since the vintage is often only on the back
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- For "type", infer from visual cues (bottle color, label text like "Blanc", "Rosé", "Brut") if not explicitly stated
- "barcode": if a barcode is visible in any image, read the digits printed alongside/below it (typically 8-14 digits, EAN-13 or UPC-A) and return them as a string. Only return digits you can actually read — null if no barcode is visible or the digits aren't legible.
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
- Rating fields (rating_ws, rating_rp, rating_jd, rating_ag): If you know published critic scores, use those. Otherwise, provide your best estimated score (integer 85-100) based on the producer's reputation, region, and vintage quality. Only use null for obscure wines you truly cannot assess.
  - rating_ws = Wine Spectator, rating_rp = Robert Parker, rating_jd = Jeb Dunnuck, rating_ag = Antonio Galloni
- "notes": brief info from the label itself (appellation, classification, etc.)"""


WINE_LIST_PROMPT = """You are a master sommelier. The current year is {current_year}. Analyze this photograph of a restaurant wine list, wine menu, store receipt, or purchase receipt. Extract EVERY wine listed on the page, and provide expert analysis for each.

Return ONLY a JSON object with this structure:
{{
  "wines": [
    {{
      "name": "the wine name (grape/style/designation, NOT the winery)",
      "winery": "the producer/winery/domaine/chateau",
      "vintage": 2020,
      "type": "red",
      "region": "the wine region if mentioned or inferable",
      "country": "the country if mentioned or inferable",
      "grape_variety": "grape variety if mentioned or inferable",
      "list_price": 65.00,
      "list_price_currency": "USD",
      "estimated_retail_price": 35.00,
      "glass_price": null,
      "bottle_size": "750ml",
      "disposition": "D",
      "drink_window": "2024-2028",
      "description": "2-3 sentence tasting profile",
      "rating_ws": null,
      "rating_rp": null,
      "rating_jd": null,
      "rating_ag": null
    }}
  ],
  "restaurant_name": "name if visible on the menu or receipt (store name, restaurant name, etc.)",
  "currency": "USD"
}}

Extraction rules:
- Extract ALL wines visible on the menu or receipt, including by-the-glass options
- For receipts: extract wine items only (skip non-wine items like food, tax, tips, etc.)
- "name" should include the wine name and style but NOT the winery/producer name
- "vintage" must be a 4-digit year as an integer, or null if NV or not shown
- "type" must be exactly one of: "red", "white", "rosé", "sparkling", "dessert"
- "list_price" is the price as a number (e.g. 65.00). Use null only if truly unreadable.
- "list_price_currency" should be the 3-letter currency code (USD, EUR, GBP, etc.)
- "estimated_retail_price": estimated current US retail price for this wine as a number (e.g. 35.00). Use your knowledge of the wine market to estimate what this bottle currently sells for at a retail store. Use null only if truly unknown.
- "glass_price" is the by-the-glass price if offered, otherwise null
- "bottle_size" defaults to "750ml" unless the menu specifies otherwise
- "currency" is the primary currency used on the document
- "restaurant_name" from any header/logo/store name visible, or null
- For ambiguous types, infer from grape variety or region
- If the image contains no wines at all, return {{"error": "not_a_wine_list"}}
- Be thorough: do not skip any wines. If text is partially obscured, include what you can read.
- Preserve the order wines appear on the document.

Wine analysis rules (apply to every wine):
- "disposition": "D" = Drink Now, "H" = Hold, "P" = Past Peak. Based on the wine's vintage, type, and quality level.
- "drink_window": optimal drinking window as "YYYY-YYYY" range. Use aging guidelines:
  - Everyday reds/whites (under $20): 1-3 years from vintage
  - Quality reds ($20-50): 3-7 years from vintage
  - Premium Bordeaux, Barolo, Napa Cab ($50+): 10-15 years
  - Rosé: 1-2 years. Most whites: 1-3 years. Sparkling NV: 2-3 years.
  - NV wines: "{current_year}-{next_year}"
- "description": Professional 2-3 sentence tasting-style description of this wine's character
- Rating fields (rating_ws, rating_rp, rating_jd, rating_ag): If you know published critic scores, use those. Otherwise, provide your best estimated score (integer 85-100) based on the producer's reputation, region, and vintage quality. Only use null for obscure wines you truly cannot assess.
  - rating_ws = Wine Spectator, rating_rp = Robert Parker, rating_jd = Jeb Dunnuck, rating_ag = Antonio Galloni"""


class BaseAIClient:
    """Shared prompt-building and response validation for wine AI enrichment.

    Subclasses only need to implement `_call_ai`: send a prompt (and
    optional image) to their specific backend and return the parsed JSON
    dict, or `{"error": "..."}` on any transport/parse failure.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def _call_ai(
        self,
        prompt: str,
        image_base64: str | None,
        timeout_s: int,
        temperature: float = 0.1,
        extra_image_base64: str | None = None,
    ) -> dict[str, Any]:
        raise NotImplementedError

    async def recognize_label(
        self, image_base64: str, language: str = "en", back_image_base64: str | None = None
    ) -> dict[str, Any]:
        """Send a front label photo (optionally + a back label photo) to the
        AI backend and get structured wine data. The back label often has
        the vintage and sometimes a barcode that the front doesn't show.

        Returns a dict with either wine data + source="gemini",
        or {"error": "description"} on failure.
        """
        _LOGGER.debug(
            "Sending label image(s) to AI (%d chars base64%s)",
            len(image_base64),
            " + back label" if back_image_base64 else "",
        )

        prompt = _language_prefix(language) + LABEL_PROMPT.format(
            current_year=datetime.now().year, next_year=datetime.now().year + 1
        ) + (
            "\n\nYou were given two images: the FRONT label first, then the BACK "
            "label. Combine information from both — the back label often has "
            "the vintage year and sometimes a barcode that the front doesn't show."
            if back_image_base64 else ""
        ) + _language_suffix(language)

        result = await self._call_ai(
            prompt, image_base64, timeout_s=45, temperature=0.1, extra_image_base64=back_image_base64
        )
        if result.get("error") == "not_a_wine_label":
            return {"error": "Not a wine label"}
        if "error" in result:
            return result

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

        est_price = result.get("estimated_price")
        if est_price is not None:
            try:
                est_price = round(float(est_price), 2)
                if est_price <= 0:
                    est_price = None
            except (ValueError, TypeError):
                est_price = None

        disp = result.get("disposition", "")
        if disp not in ("D", "H", "P"):
            disp = ""

        ai_ratings: dict[str, int] = {}
        for key in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
            val = result.get(key)
            if val and isinstance(val, (int, float)) and 50 <= val <= 100:
                ai_ratings[key] = int(val)

        # Barcode: only accept if it looks like digits (typically EAN-13/UPC-A)
        barcode = str(result.get("barcode") or "").strip()
        if not barcode.isdigit() or not (8 <= len(barcode) <= 14):
            barcode = ""

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
            "barcode": barcode,
            "rating": None,
            "image_url": "",
            "price": None,
            "source": "gemini",
        }

    async def extract_wine_list(self, image_base64: str, language: str = "en") -> dict[str, Any]:
        """Extract all wines from a restaurant wine list photo.

        Returns {"wines": [...], "restaurant_name": ..., "currency": ...}
        or {"error": "description"} on failure.
        """
        _LOGGER.debug("Extracting wine list from image (%d chars base64)", len(image_base64))

        current_year = datetime.now().year
        prompt = _language_prefix(language) + WINE_LIST_PROMPT.format(
            current_year=current_year,
            next_year=current_year + 1,
        ) + _language_suffix(language)

        result = await self._call_ai(prompt, image_base64, timeout_s=180, temperature=0.1)
        if result.get("error") == "not_a_wine_list":
            return {"error": "Not a wine list"}
        if "error" in result:
            return result

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

            estimated_retail = w.get("estimated_retail_price")
            if estimated_retail is not None:
                try:
                    estimated_retail = round(float(estimated_retail), 2)
                    if estimated_retail <= 0:
                        estimated_retail = None
                except (ValueError, TypeError):
                    estimated_retail = None

            glass_price = w.get("glass_price")
            if glass_price is not None:
                try:
                    glass_price = round(float(glass_price), 2)
                    if glass_price <= 0:
                        glass_price = None
                except (ValueError, TypeError):
                    glass_price = None

            disposition = str(w.get("disposition", "")).strip().upper()
            if disposition not in ("D", "H", "P"):
                disposition = ""
            drink_window = str(w.get("drink_window", "")).strip()
            description = str(w.get("description", "")).strip()

            ai_ratings: dict[str, int] = {}
            for rkey in ("rating_ws", "rating_rp", "rating_jd", "rating_ag"):
                rval = w.get(rkey)
                if rval is not None:
                    try:
                        rval = int(rval)
                        if 50 <= rval <= 100:
                            ai_ratings[rkey] = rval
                    except (ValueError, TypeError):
                        pass

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
                "estimated_retail_price": estimated_retail,
                "glass_price": glass_price,
                "bottle_size": str(w.get("bottle_size", "750ml")).strip(),
                "disposition": disposition,
                "drink_window": drink_window,
                "description": description,
                "ai_ratings": ai_ratings if ai_ratings else None,
            })

        raw_name = str(result.get("restaurant_name", "")).strip()
        # Models sometimes return literal "None" or "null"
        if raw_name.lower() in ("none", "null", "n/a", ""):
            raw_name = None  # type: ignore[assignment]

        return {
            "wines": validated,
            "restaurant_name": raw_name or None,
            "currency": str(result.get("currency", "USD")).strip().upper(),
        }

    async def analyze_single_wine(self, wine: dict[str, Any], language: str = "en") -> dict[str, Any]:
        """Analyze a single wine with AI — disposition, drink dates, and ratings.

        If the wine has a stored photo (front and/or back label, from the
        user's own capture), it's sent along so the AI can read the label
        directly — critic knowledge alone is often useless for obscure or
        regional wines Vivino can't match either, but the label itself still
        has the appellation, grape, alcohol %, and sometimes a printed
        tasting note.

        Returns enriched data or {"error": "..."}.
        """
        current_year = datetime.now().year
        vintage = wine.get("vintage") or "NV"
        wine_type = wine.get("type", "red")
        name = wine.get("name", "Unknown")
        winery = wine.get("winery", "")
        region = wine.get("region", "")
        country = wine.get("country", "")
        grape = wine.get("grape_variety", "")
        drink_by = wine.get("drink_by", "")

        front_photo = _extract_base64_from_data_url(wine.get("image_url"))
        back_photo = _extract_base64_from_data_url(wine.get("back_image_url"))

        prompt = _language_prefix(language) + f"""You are a master sommelier and wine critic. The current year is {current_year}.

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
  "rating_ag": null,
  "region": null,
  "country": null,
  "grape_variety": null,
  "alcohol": null
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
- Rating fields: If you know published critic scores for this specific wine and vintage, use those. Otherwise, provide your best estimated score (integer 85-100) based on the producer's track record, region quality, and vintage reputation. Only use null for obscure wines you truly cannot assess.
  - "rating_ws": Wine Spectator score (out of 100)
  - "rating_rp": Robert Parker / Wine Advocate score (out of 100)
  - "rating_jd": Jeb Dunnuck score (out of 100)
  - "rating_ag": Antonio Galloni / Vinous score (out of 100)
- "estimated_price": estimated current retail price in USD as a number (e.g. 45.00). Use your knowledge of the wine market to estimate what this bottle currently sells for. Return null only if you truly cannot estimate.
- "region"/"country"/"grape_variety"/"alcohol": only fill these in if the "Region"/"Country"/"Grape" fields above are empty AND you can actually determine them (from the label photo if attached, or from your own knowledge of this producer). Leave null if already provided above or genuinely unknown — don't guess.""" + (
            "\n\nA photo of the bottle/label is attached"
            + (" (front, then back)" if back_photo else " (front label)")
            + ". If you don't recognize this specific wine from general knowledge "
            "(e.g. it's a small/regional producer), read the label directly instead "
            "of guessing: extract the exact vintage, appellation/region, grape "
            "variety, alcohol %, and reproduce any tasting note or description "
            "printed on the label itself rather than inventing a generic one."
            if front_photo else ""
        ) + _language_suffix(language)

        result = await self._call_ai(
            prompt, front_photo, timeout_s=45, temperature=0.2, extra_image_base64=back_photo
        )
        if "error" in result:
            return result

        disp = result.get("disposition", "D")
        if disp not in ("D", "H", "P"):
            disp = "D"

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
            "region": str(result.get("region") or "").strip(),
            "country": str(result.get("country") or "").strip(),
            "grape_variety": str(result.get("grape_variety") or "").strip(),
            "alcohol": str(result.get("alcohol") or "").strip(),
        }

    async def analyze_collection(self, wines: list[dict[str, Any]]) -> dict[str, Any]:
        """Analyze wine collection and return drink/hold dispositions.

        Returns {"dispositions": {wine_id: "D"|"H"|"P"}} or {"error": "..."}.
        """
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

        dispositions = await self._call_ai(prompt, None, timeout_s=180, temperature=0.1)
        if "error" in dispositions:
            return dispositions

        valid = {"D", "H", "P"}
        cleaned = {}
        for wine_id, disp in dispositions.items():
            cleaned[wine_id] = disp if disp in valid else "D"

        return {"dispositions": cleaned}


class GeminiVisionClient(BaseAIClient):
    """Client for Google Gemini API, used directly with a Google API key."""

    def __init__(self, hass: HomeAssistant, api_key: str, model: str = DEFAULT_GEMINI_MODEL) -> None:
        """Initialize the client."""
        super().__init__(hass)
        self._api_key = api_key
        self._api_url = build_gemini_api_url(model)

    async def _call_ai(
        self,
        prompt: str,
        image_base64: str | None,
        timeout_s: int,
        temperature: float = 0.1,
        extra_image_base64: str | None = None,
    ) -> dict[str, Any]:
        if not self._api_key:
            return {"error": "Gemini API key is empty"}

        session = async_get_clientsession(self._hass)
        parts: list[dict[str, Any]] = [{"text": prompt}]
        if image_base64:
            parts.append({"inlineData": {"mimeType": "image/jpeg", "data": image_base64}})
        if extra_image_base64:
            parts.append({"inlineData": {"mimeType": "image/jpeg", "data": extra_image_base64}})

        body = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": temperature,
            },
        }

        candidates: list[Any] = []
        try:
            timeout = aiohttp.ClientTimeout(total=timeout_s)
            async with session.post(
                self._api_url,
                params={"key": self._api_key},
                json=body,
                timeout=timeout,
            ) as resp:
                resp_text = await resp.text()

                if resp.status in (401, 403):
                    _LOGGER.error(
                        "Gemini API key is invalid (status %s): %s", resp.status, resp_text[:200]
                    )
                    return {"error": f"Gemini API key is invalid (HTTP {resp.status})"}

                if resp.status == 429:
                    _LOGGER.error("Gemini API quota exhausted: %s", resp_text[:300])
                    return {
                        "error": "Gemini API free tier quota exhausted. "
                        "Enable billing at console.cloud.google.com or "
                        "create a new API key at aistudio.google.com/apikey"
                    }

                if resp.status != 200:
                    _LOGGER.error(
                        "Gemini API returned status %s: %s", resp.status, resp_text[:500]
                    )
                    return {"error": f"Gemini API error (HTTP {resp.status})"}

                data = json.loads(resp_text)
                candidates = data.get("candidates", [])
                if not candidates:
                    _LOGGER.warning("Gemini returned no candidates: %s", resp_text[:500])
                    return {"error": "Gemini returned no results"}

                content = candidates[0].get("content", {})
                parts_out = content.get("parts", [])
                if not parts_out:
                    _LOGGER.warning("Gemini response has no parts")
                    return {"error": "Gemini returned empty response"}

                text = parts_out[0].get("text", "")
                _LOGGER.debug("Gemini raw response: %s", text[:500])
                return parse_json_response(text)

        except json.JSONDecodeError as err:
            finish_reason = candidates[0].get("finishReason") if candidates else None
            _LOGGER.error(
                "Failed to parse Gemini response (finishReason=%s): %s", finish_reason, err
            )
            return {"error": f"Failed to parse Gemini response: {err}"}
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error calling Gemini: %s", err)
            return {"error": f"Network error: {err}"}
        except TimeoutError:
            _LOGGER.error("Gemini API timed out")
            return {"error": f"Gemini API timed out ({timeout_s}s)"}
        except Exception as err:
            _LOGGER.error("Gemini API error: %s", err)
            return {"error": f"Unexpected error: {err}"}


def resolve_openai_chat_endpoint(base_url: str) -> str:
    """Turn whatever the user configured into a usable chat completions URL.

    Some relays hand out a full endpoint URL to paste as-is (already ending
    in `/chat/completions`, sometimes with a per-account path segment before
    it, e.g. `.../<token>/v1/chat/completions`); others expect just the host
    and rely on the client appending the standard `/v1/chat/completions`
    suffix. Accept either so users don't have to guess which one to strip.
    """
    url = base_url.strip().rstrip("/")
    if url.endswith("/chat/completions"):
        return url
    return f"{url}/v1/chat/completions"


class OpenAICompatibleClient(BaseAIClient):
    """Client for any OpenAI-compatible chat completions endpoint.

    Works with relays/aggregators (e.g. a 1minAI-to-OpenAI relay) and any
    self-hosted server exposing the standard `/v1/chat/completions` shape.
    """

    def __init__(self, hass: HomeAssistant, base_url: str, api_key: str, model: str) -> None:
        """Initialize the client."""
        super().__init__(hass)
        self._chat_url = resolve_openai_chat_endpoint(base_url)
        self._api_key = api_key
        self._model = model

    async def _call_ai(
        self,
        prompt: str,
        image_base64: str | None,
        timeout_s: int,
        temperature: float = 0.1,
        extra_image_base64: str | None = None,
    ) -> dict[str, Any]:
        if not self._chat_url or not self._api_key or not self._model:
            return {"error": "AI provider not fully configured (base URL, API key, or model missing)"}

        session = async_get_clientsession(self._hass)

        content: Any
        if image_base64:
            content = [{"type": "text", "text": prompt}]
            content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}})
            if extra_image_base64:
                content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{extra_image_base64}"}})
        else:
            content = prompt

        body = {
            "model": self._model,
            "messages": [{"role": "user", "content": content}],
            "temperature": temperature,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        try:
            timeout = aiohttp.ClientTimeout(total=timeout_s)
            async with session.post(
                self._chat_url,
                headers=headers,
                json=body,
                timeout=timeout,
            ) as resp:
                resp_text = await resp.text()

                if resp.status in (401, 403):
                    return {"error": f"AI API key is invalid (HTTP {resp.status})"}
                if resp.status == 429:
                    return {"error": "AI API rate limit or quota exceeded (HTTP 429)"}
                if resp.status != 200:
                    _LOGGER.error("AI API returned status %s: %s", resp.status, resp_text[:500])
                    return {"error": f"AI API error (HTTP {resp.status})"}

                data = json.loads(resp_text)
                choices = data.get("choices", [])
                if not choices:
                    _LOGGER.warning("AI API returned no choices: %s", resp_text[:500])
                    return {"error": "AI API returned no results"}

                text = choices[0].get("message", {}).get("content", "")
                _LOGGER.debug("AI raw response: %s", text[:500])
                return parse_json_response(text)

        except json.JSONDecodeError as err:
            _LOGGER.error("Failed to parse AI response: %s", err)
            return {"error": f"Failed to parse AI response: {err}"}
        except aiohttp.ClientError as err:
            _LOGGER.error("Network error calling AI API: %s", err)
            return {"error": f"Network error: {err}"}
        except TimeoutError:
            _LOGGER.error("AI API timed out")
            return {"error": f"AI API timed out ({timeout_s}s)"}
        except Exception as err:
            _LOGGER.error("AI API error: %s", err)
            return {"error": f"Unexpected error: {err}"}
