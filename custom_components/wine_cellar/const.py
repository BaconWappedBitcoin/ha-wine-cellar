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
        "has_bottom_zone": True,
        "bottom_zone_name": "Box Storage",
        "order": 0,
    },
    {
        "id": "cabinet-2",
        "name": "Section 2",
        "type": "grid",
        "rows": 10,
        "cols": 9,
        "has_bottom_zone": True,
        "bottom_zone_name": "Box Storage",
        "order": 1,
    },
    {
        "id": "cabinet-3",
        "name": "Section 3",
        "type": "grid",
        "rows": 10,
        "cols": 9,
        "has_bottom_zone": True,
        "bottom_zone_name": "Box Storage",
        "order": 2,
    },
]

CONF_CABINETS = "cabinets"
CONF_WINES = "wines"
CONF_BARCODE_CACHE = "barcode_cache"

CONF_GEMINI_API_KEY = "gemini_api_key"

ATTR_TOTAL_BOTTLES = "total_bottles"
ATTR_TOTAL_CAPACITY = "total_capacity"
