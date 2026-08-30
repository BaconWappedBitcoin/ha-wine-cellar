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
# Enough that a normal cellar never evicts; small enough that the store
# file cannot grow without bound from scanning alone.
BARCODE_CACHE_MAX = 500
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

CONF_METADATA_CURRENCY = "metadata_currency"
DEFAULT_METADATA_CURRENCY = "USD"
SUPPORTED_METADATA_CURRENCIES = ["USD", "EUR", "GBP", "CHF"]

# When Vivino finds no confident match, offer AI as a fallback instead of
# applying automatically. "always" skips asking and just uses AI every time.
CONF_AI_FALLBACK_ALWAYS = "ai_fallback_always"

# How many timestamped server backups to keep on disk. Older ones are pruned
# after each new save; 0 keeps every backup forever.
# Arrangement findings the user has waved off for good. Kept as a list of
# stable finding ids so a dismissed suggestion never comes back on re-analysis.
CONF_DISMISSED_ARRANGEMENTS = "dismissed_arrangements"

CONF_SERVER_BACKUP_KEEP = "server_backup_keep"
DEFAULT_SERVER_BACKUP_KEEP = 10
SERVER_BACKUP_KEEP_CHOICES = [0, 5, 10, 20, 50]

# Vivino account sync (from upstream): the session cookie + cellar URL identify
# the account, and the optional timer re-syncs on this interval.
CONF_VIVINO_SESSION_COOKIE = "vivino_session_cookie"
CONF_VIVINO_CELLAR_URL = "vivino_cellar_url"
CONF_VIVINO_AUTO_SYNC = "vivino_auto_sync"

# What the Vivino connection is allowed to do. "import" mirrors the Vivino
# cellar into Cork Dork and never writes to the user's Vivino account;
# "sync" is the full two-way reconcile that also pushes Cork Dork changes
# back to Vivino. Import is the default so connecting an account never
# modifies it unless the user explicitly opts in.
CONF_VIVINO_MODE = "vivino_mode"
VIVINO_MODE_SYNC = "sync"
VIVINO_MODE_IMPORT = "import"
VIVINO_MODES = [VIVINO_MODE_IMPORT, VIVINO_MODE_SYNC]
DEFAULT_VIVINO_MODE = VIVINO_MODE_IMPORT

VIVINO_AUTO_SYNC_INTERVAL_HOURS = 12

ATTR_TOTAL_BOTTLES = "total_bottles"
ATTR_TOTAL_CAPACITY = "total_capacity"

FRONTEND_VERSION = "20260830b"
