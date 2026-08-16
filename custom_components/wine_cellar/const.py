"""Constants for Wine Cellar Tracker."""

DOMAIN = "wine_cellar"
STORAGE_KEY = "wine_cellar"
STORAGE_VERSION = 1

WINE_TYPES = ["red", "white", "rosé", "sparkling", "dessert"]

WINE_TYPE_COLORS = {
    "red": "#722F37",
    "white": "#F5E6CA",
    "rosé": "#E8A0BF",
    "sparkling": "#D4E09B",
    "dessert": "#DAA520",
}

DEFAULT_CABINETS = [
    {
        "id": "cabinet-1",
        "name": "Section 1",
        "type": "grid",
        "rows": 10,
        "cols": 9,
        "depth": 1,
        "has_bottom_zone": False,
        "bottom_zone_name": "",
        "storage_rows": [{"row": 9, "name": "Box Storage", "type": "bulk", "capacity": 20}],
        "order": 0,
    },
    {
        "id": "cabinet-2",
        "name": "Section 2",
        "type": "grid",
        "rows": 10,
        "cols": 9,
        "depth": 1,
        "has_bottom_zone": False,
        "bottom_zone_name": "",
        "storage_rows": [{"row": 9, "name": "Box Storage", "type": "bulk", "capacity": 20}],
        "order": 1,
    },
    {
        "id": "cabinet-3",
        "name": "Section 3",
        "type": "grid",
        "rows": 10,
        "cols": 9,
        "depth": 1,
        "has_bottom_zone": False,
        "bottom_zone_name": "",
        "storage_rows": [{"row": 9, "name": "Box Storage", "type": "bulk", "capacity": 20}],
        "order": 2,
    },
]

CONF_CABINETS = "cabinets"
CONF_WINES = "wines"
CONF_BARCODE_CACHE = "barcode_cache"
CONF_BUY_LIST = "buy_list"
CONF_WINE_HISTORY = "wine_history"
CONF_SETTINGS = "settings"

CONF_GEMINI_API_KEY = "gemini_api_key"
CONF_GEMINI_MODEL = "gemini_model"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

# AI provider: "gemini" (Google direct) or "openai_compatible" (any relay /
# aggregator / self-hosted server exposing the standard chat completions API).
CONF_AI_PROVIDER = "ai_provider"
CONF_AI_BASE_URL = "ai_base_url"
CONF_AI_API_KEY = "ai_api_key"
CONF_AI_MODEL = "ai_model"
DEFAULT_AI_PROVIDER = "gemini"
AI_PROVIDERS = ["gemini", "openai_compatible"]

CONF_METADATA_LANGUAGE = "metadata_language"
DEFAULT_METADATA_LANGUAGE = "en"
SUPPORTED_METADATA_LANGUAGES = ["en", "fr", "de"]

# When Vivino finds no confident match, offer AI as a fallback instead of
# applying automatically. "always" skips asking and just uses AI every time.
CONF_AI_FALLBACK_ALWAYS = "ai_fallback_always"

ATTR_TOTAL_BOTTLES = "total_bottles"
ATTR_TOTAL_CAPACITY = "total_capacity"

FRONTEND_VERSION = "20260817f"
