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
  back_image_url: string;
  price: number | null;
  retail_price: number | null;
  retail_price_currency: string | null;
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
  // Where the bottle came from ("vivino_cellar", "manual", ...). Bottles
  // whose source starts with "vivino" take part in Vivino reconciliation.
  source?: string;
  disposition: string;
  drink_window: string;
  ai_ratings: Record<string, number> | null;
  // `*_updated_at` is when the data last actually changed; `*_checked_at` is
  // when the source was last consulted. A checked_at newer than updated_at
  // means the last lookup found nothing new — which is worth knowing, and
  // was impossible to tell when one field carried both meanings.
  vivino_updated_at: string | null;
  vivino_checked_at: string | null;
  ai_updated_at: string | null;
  ai_checked_at: string | null;
  vivino_id: number | null;
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
  // Returned by the backend and read by the add dialog, but never declared —
  // which is what the four standing TS2339 warnings were. The compiler was
  // not checking that code path at all.
  ratings_count?: number | null;
  description?: string;
  food_pairings?: string;
  alcohol?: string;
  vivino_id?: number | null;
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

export interface WineHistoryItem {
  id: string;
  original_id: string;
  name: string;
  winery: string;
  vintage: number | null;
  type: string;
  region: string;
  country: string;
  grape_variety: string;
  rating: number | null;
  price: number | null;
  image_url: string;
  added_at: string;
  removed_at: string;
  reason: string;
}

export const REMOVAL_REASONS = [
  { id: "drank", label: "Drank" },
  { id: "gifted", label: "Gifted" },
  { id: "sold", label: "Sold" },
  { id: "broken", label: "Broken" },
  { id: "spoiled", label: "Spoiled" },
  { id: "other", label: "Other" },
] as const;

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

// Every physical (row, col) grid slot in a cabinet, in display order,
// skipping rows configured as bulk/box storage zones.
export function getRackSlots(cabinet: Cabinet): { row: number; col: number }[] {
  const storageRowSet = new Set((cabinet.storage_rows || []).map((sr) => sr.row));
  const slots: { row: number; col: number }[] = [];
  for (let r = 0; r < cabinet.rows; r++) {
    if (storageRowSet.has(r)) continue;
    for (let c = 0; c < cabinet.cols; c++) slots.push({ row: r, col: c });
  }
  return slots;
}

export interface WineLocation {
  text: string;
  cabinet: Cabinet | null;
  zone: string;
  storageRow: StorageRow | null;
}

// A precise, human-readable location for a wine: cabinet name, plus the
// zone name and slot number when it's in a bulk bin or wine box, or the
// rack's linear slot number when it's in a grid cell.
export function getWineLocation(wine: Wine, cabinets: Cabinet[]): WineLocation {
  const cabinet = wine.cabinet_id ? cabinets.find((c) => c.id === wine.cabinet_id) || null : null;
  if (!cabinet) return { text: "Unassigned", cabinet: null, zone: "", storageRow: null };

  if (wine.row !== null && wine.col !== null) {
    const slotIdx = getRackSlots(cabinet).findIndex((s) => s.row === wine.row && s.col === wine.col);
    const slotLabel = slotIdx >= 0 ? `Slot ${slotIdx + 1}` : `R${wine.row + 1}C${wine.col + 1}`;
    return { text: `${cabinet.name} · ${slotLabel}`, cabinet, zone: "", storageRow: null };
  }

  if (wine.zone && wine.zone !== "bottom") {
    const rowIdx = parseInt(wine.zone.replace("storage-", ""), 10);
    const storageRow = (cabinet.storage_rows || []).find((sr) => sr.row === rowIdx) || null;
    const zoneName = storageRow?.name || "Storage";
    return { text: `${cabinet.name} · ${zoneName} · Slot ${(wine.depth || 0) + 1}`, cabinet, zone: wine.zone, storageRow };
  }

  if (wine.zone === "bottom") {
    return { text: `${cabinet.name} · ${cabinet.bottom_zone_name || "Storage"}`, cabinet, zone: "bottom", storageRow: null };
  }

  return { text: cabinet.name, cabinet, zone: "", storageRow: null };
}
