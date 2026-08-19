import { Wine, Cabinet } from "../models";

// Shared search / filter / sort helpers.
//
// The card and the inventory dialog used to carry two separate, silently
// diverging search implementations (6 fields vs 11). Everything text-search
// related now lives here so a field only ever has to be added once.

// Accent-insensitive lowercase: "Côtes" and "cotes", "Rosé" and "rose" must
// match. Home Assistant users type without accents far more often than with.
export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Free-text search terms that map onto a disposition code rather than onto
// any stored text.
const DISPOSITION_TERMS: Record<string, string> = {
  drink: "D",
  "drink now": "D",
  hold: "H",
  past: "P",
  peak: "P",
  "past peak": "P",
  "past-peak": "P",
};

interface HaystackEntry {
  extra: string;
  text: string;
}

// Rebuilding the haystack for every wine on every keystroke is wasteful once
// a cellar gets large; wine objects are replaced wholesale on each reload, so
// a WeakMap keyed on the object stays correct without any invalidation.
const haystackCache = new WeakMap<Wine, HaystackEntry>();

function buildHaystack(wine: Wine, extra: string): string {
  const tn = wine.tasting_notes;
  const parts: unknown[] = [
    wine.name,
    wine.winery,
    wine.region,
    wine.country,
    wine.grape_variety,
    wine.type,
    wine.vintage,
    wine.notes,
    wine.description,
    wine.food_pairings,
    wine.alcohol,
    wine.barcode,
    wine.drink_by,
    wine.drink_window,
    wine.purchase_date,
    tn?.aroma,
    tn?.taste,
    tn?.finish,
    tn?.overall,
    extra,
  ];
  return parts.map(normalizeText).filter(Boolean).join("\n");
}

function haystackFor(wine: Wine, extra: string): string {
  const cached = haystackCache.get(wine);
  if (cached && cached.extra === extra) return cached.text;
  const text = buildHaystack(wine, extra);
  haystackCache.set(wine, { extra, text });
  return text;
}

// The cabinet name is searchable too ("kitchen" finds everything stored
// there), which means it has to be resolved before matching.
export function cabinetNameFor(wine: Wine, cabinets: Cabinet[]): string {
  if (!wine.cabinet_id) return "";
  return cabinets.find((c) => c.id === wine.cabinet_id)?.name || "";
}

// Every whitespace-separated token must match somewhere, so "bordeaux 2015"
// finally works — the old single-blob `includes` could never match a query
// spanning two different fields.
export function matchesQuery(
  wine: Wine,
  query: string,
  cabinets: Cabinet[] = []
): boolean {
  const normalized = normalizeText(query).trim();
  if (!normalized) return true;

  const fullCode = DISPOSITION_TERMS[normalized];
  if (fullCode && wine.disposition === fullCode) return true;

  const haystack = haystackFor(wine, normalizeText(cabinetNameFor(wine, cabinets)));
  const tokens = normalized.split(/\s+/).filter(Boolean);

  return tokens.every((token) => {
    if (haystack.includes(token)) return true;
    const code = DISPOSITION_TERMS[token];
    return !!code && wine.disposition === code;
  });
}

// ── Drink-by ───────────────────────────────────────────────────────────

// `drink_by` is a free-text year ("2028", "drink by 2030") and `drink_window`
// a range ("2025-2028"); both come from the AI, so parse defensively and fall
// back to the end of the window when no explicit year was stored.
export function drinkByYear(wine: Wine): number | null {
  const explicit = String(wine.drink_by || "").match(/\d{4}/);
  if (explicit) return parseInt(explicit[0], 10);

  const windowYears = String(wine.drink_window || "").match(/\d{4}/g);
  if (windowYears && windowYears.length) {
    return parseInt(windowYears[windowYears.length - 1], 10);
  }
  return null;
}

// Wines with no drink-by data sort to the bottom in *both* directions —
// otherwise an ascending sort buries the urgent bottles under every wine
// that was never analyzed.
export function compareNullable<T>(
  a: T | null,
  b: T | null,
  dir: number,
  cmp: (x: T, y: T) => number
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir * cmp(a, b);
}

// ── Facets ─────────────────────────────────────────────────────────────

// Comma-separated fields (grape varieties, food pairings) are exploded into
// individual values so the filter menus only ever offer what the cellar
// actually contains.
export function splitMulti(value: string): string[] {
  return (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function collectFacet(
  wines: Wine[],
  pick: (wine: Wine) => string[]
): string[] {
  const seen = new Map<string, string>();
  for (const wine of wines) {
    for (const value of pick(wine)) {
      const key = normalizeText(value);
      if (key && !seen.has(key)) seen.set(key, value);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
