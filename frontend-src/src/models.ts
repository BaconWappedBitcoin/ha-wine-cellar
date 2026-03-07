export interface TastingNotes {
  aroma: string;
  taste: string;
  finish: string;
  overall: string;
}

export interface Wine {
  id: string;
  barcode: string;
  name: string;
  winery: string;
  region: string;
  country: string;
  vintage: number | null;
  type: WineType;
  grape_variety: string;
  rating: number | null;
  ratings_count: number | null;
  image_url: string;
  price: number | null;
  retail_price: number | null;
  purchase_date: string;
  drink_by: string;
  notes: string;
  description: string;
  food_pairings: string;
  alcohol: string;
  cabinet_id: string;
  row: number | null;
  col: number | null;
  depth: number;
  zone: string;
  user_rating: number | null;
  tasting_notes: TastingNotes | null;
  added_at: string;
  disposition: string;
  drink_window: string;
  ai_ratings: Record<string, number> | null;
}

export type StorageRowType = "bulk" | "box";

export const STORAGE_ROW_TYPE_LABELS: Record<StorageRowType, string> = {
  bulk: "Bulk Bin",
  box: "Wine Box",
};

export const BOX_SIZES = [1, 3, 6, 12, 24] as const;

export interface StorageRow {
  row: number;
  name: string;
  type: StorageRowType;
  capacity: number;
  boxes?: number[];  // for type="box": array of box sizes, e.g. [6, 12, 3]
}

export interface Cabinet {
  id: string;
  name: string;
  type: "grid" | "zone";
  rows: number;
  cols: number;
  depth: number;
  has_bottom_zone: boolean;
  bottom_zone_name: string;
  storage_rows: StorageRow[];
  order: number;
  orientation: "vertical" | "horizontal";
}

export interface CellarStats {
  total_bottles: number;
  total_capacity: number;
  available_slots: number;
  total_value: number;
  total_cost: number;
  by_type: Record<string, number>;
  by_cabinet: Record<string, number>;
}

export interface BarcodeLookupResult {
  name: string;
  winery: string;
  region: string;
  country: string;
  vintage: number | null;
  type: WineType;
  grape_variety: string;
  rating: number | null;
  image_url: string;
  price: number | null;
  source: string;
}

export interface WineListItem {
  index: number;
  name: string;
  winery: string;
  vintage: number | null;
  type: WineType;
  region: string;
  country: string;
  grape_variety: string;
  list_price: number | null;
  list_price_currency: string;
  glass_price: number | null;
  bottle_size: string;
  // Enriched by Vivino
  vivino_rating: number | null;
  vivino_ratings_count: number | null;
  vivino_price: number | null;
  vivino_image_url: string;
  // Enriched by AI
  ai_ratings: Record<string, number> | null;
  ai_description: string;
  ai_disposition: string;
  ai_drink_window: string;
  ai_estimated_price: number | null;
  // Status
  vivino_status: "pending" | "loading" | "done" | "error";
  ai_status: "pending" | "loading" | "done" | "error" | "skipped";
}

export type WineType = "red" | "white" | "rosé" | "sparkling" | "dessert";

export const WINE_TYPE_COLORS: Record<WineType, string> = {
  red: "#722F37",
  white: "#F5E6CA",
  rosé: "#E8A0BF",
  sparkling: "#D4E09B",
  dessert: "#DAA520",
};

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  red: "Red",
  white: "White",
  rosé: "Rosé",
  sparkling: "Sparkling",
  dessert: "Dessert",
};
