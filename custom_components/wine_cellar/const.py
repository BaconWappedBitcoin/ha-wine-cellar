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
        "orientation": "vertical",
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
        "orientation": "vertical",
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
        "orientation": "vertical",
        "order": 2,
    },
]

CONF_CABINETS = "cabinets"
CONF_WINES = "wines"
CONF_BARCODE_CACHE = "barcode_cache"
CONF_BUY_LIST = "buy_list"

CONF_GEMINI_API_KEY = "gemini_api_key"

ATTR_TOTAL_BOTTLES = "total_bottles"
ATTR_TOTAL_CAPACITY = "total_capacity"

FRONTEND_VERSION = "20260307v"
