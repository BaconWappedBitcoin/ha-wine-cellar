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
  purchase_date: string;
  drink_by: string;
  notes: string;
  description: string;
  food_pairings: string;
  alcohol: string;
  cabinet_id: string;
  row: number | null;
  col: number | null;
  zone: string;
  user_rating: number | null;
  tasting_notes: TastingNotes | null;
  added_at: string;
  disposition: string;
}

export interface StorageRow {
  row: number;
  name: string;
}

export interface Cabinet {
  id: string;
  name: string;
  type: "grid" | "zone";
  rows: number;
  cols: number;
  has_bottom_zone: boolean;
  bottom_zone_name: string;
  storage_rows: StorageRow[];
  order: number;
}

export interface CellarStats {
  total_bottles: number;
  total_capacity: number;
  available_slots: number;
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
