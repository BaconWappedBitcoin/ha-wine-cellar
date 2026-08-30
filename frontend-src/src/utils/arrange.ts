import { Cabinet, Wine, WINE_TYPE_LABELS, WineType } from "../models";
import { drinkByYear, normalizeText } from "./search";
import {
  Container,
  containerKey,
  containerLabel,
  containerOf,
  containerUsage,
  containersOf,
} from "./location";
import { cuveeKey } from "./suggest";

// Reading the cellar's current state back as advice.
//
// There are no declared zone rules to check against, so nothing here can say
// "this bottle is in the wrong place" — only "these bottles disagree with each
// other". Every finding is a disagreement inside the cellar's own arrangement,
// which is what makes it checkable without the user having configured anything.
//
// This runs once in a while — after scanning a cellar in, mostly — so it is
// deliberately conservative: a cellar always has some scatter, and a finding
// that fires on every small imperfection becomes a badge people learn to
// ignore.

export type FindingKind = "consolidate" | "outlier" | "buried";

export interface Move {
  wine: Wine;
  from: Container;
  to: Container;
  fromLabel: string;
  toLabel: string;
}

export interface Finding {
  // Stable across re-analysis: dismissing one has to keep it dismissed.
  id: string;
  kind: FindingKind;
  title: string;
  detail: string;
  wines: Wine[];
  // Empty when the fix is physical but not expressible as single moves — a
  // swap needs two bottles to trade places, and pretending otherwise would
  // write positions the cellar does not actually have.
  moves: Move[];
}

const MIN_GROUP_BOTTLES = 3;
const MIN_CONTAINER_BOTTLES = 4;
const DOMINANCE = 0.75;
const MAX_INTRUDERS = 2;

const groupKey = (w: Wine) =>
  `${cuveeKey(w.name)}|${normalizeText(w.winery).trim()}`.replace(/^\||\|$/g, "");

// A bottle whose window is closing: explicitly marked drink/past, or carrying a
// drink-by year that has arrived.
function isDrinkSoon(wine: Wine): boolean {
  const code = (wine.disposition || "").toUpperCase();
  if (code === "D" || code === "P") return true;
  const year = drinkByYear(wine);
  return year !== null && year <= new Date().getFullYear();
}

function isKeeper(wine: Wine): boolean {
  return (wine.disposition || "").toUpperCase() === "H" && !isDrinkSoon(wine);
}

// Containers that actually exist in the current rack layout. Bottles can
// outlive a deleted storage row, but proposing a move into one would be
// proposing a move into nothing.
function liveContainers(cabinets: Cabinet[]): Map<string, { container: Container; cabinet: Cabinet }> {
  const out = new Map<string, { container: Container; cabinet: Cabinet }>();
  for (const cabinet of cabinets) {
    for (const container of containersOf(cabinet)) {
      out.set(containerKey(container), { container, cabinet });
    }
  }
  return out;
}

function placedWines(wines: Wine[], live: ReturnType<typeof liveContainers>) {
  return wines
    .map((wine) => ({ wine, container: containerOf(wine) }))
    .filter(
      (x): x is { wine: Wine; container: Container } =>
        x.container !== null && live.has(containerKey(x.container))
    );
}

function dominantType(bottles: Wine[]): { type: WineType; share: number } | null {
  const counts = new Map<WineType, number>();
  for (const w of bottles) counts.set(w.type, (counts.get(w.type) || 0) + 1);
  let best: WineType | null = null;
  let bestCount = 0;
  for (const [type, count] of counts) {
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }
  if (best === null) return null;
  return { type: best, share: bestCount / bottles.length };
}

// Bottles of one wine scattered across several places. The fix is real work,
// so only worth raising for a series big enough to be worth gathering.
function findScatter(
  placed: { wine: Wine; container: Container }[],
  live: ReturnType<typeof liveContainers>,
  cabinets: Cabinet[],
  wines: Wine[]
): Finding[] {
  const groups = new Map<string, { wine: Wine; container: Container }[]>();
  for (const entry of placed) {
    const k = groupKey(entry.wine);
    if (!k) continue;
    const list = groups.get(k);
    if (list) list.push(entry);
    else groups.set(k, [entry]);
  }

  const out: Finding[] = [];
  for (const [key, entries] of groups) {
    if (entries.length < MIN_GROUP_BOTTLES) continue;
    const byContainer = new Map<string, { wine: Wine; container: Container }[]>();
    for (const e of entries) {
      const ck = containerKey(e.container);
      const list = byContainer.get(ck);
      if (list) list.push(e);
      else byContainer.set(ck, [e]);
    }
    if (byContainer.size < 2) continue;

    // Gather towards wherever most of the series already sits, preferring the
    // one that can actually take the rest.
    const candidates = [...byContainer.entries()]
      .map(([ck, held]) => {
        const entry = live.get(ck)!;
        const strays = entries.length - held.length;
        const usage = containerUsage(entry.container, entry.cabinet, wines);
        return { ck, held, strays, free: usage.free, container: entry.container };
      })
      .sort((a, b) => (b.free >= b.strays ? 1 : 0) - (a.free >= a.strays ? 1 : 0) || b.held.length - a.held.length || b.free - a.free);

    const target = candidates[0];
    if (!target || target.free < 1) continue;

    const strays = entries.filter((e) => containerKey(e.container) !== target.ck);
    const movable = strays.slice(0, Number.isFinite(target.free) ? target.free : strays.length);
    if (!movable.length) continue;

    const targetLabel = containerLabel(target.container, cabinets);
    const name = entries[0].wine.name || entries[0].wine.winery || "This wine";
    const partial = movable.length < strays.length;
    out.push({
      id: `consolidate:${key}`,
      kind: "consolidate",
      title: `${name} — ${entries.length} bottles across ${byContainer.size} places`,
      detail: partial
        ? `${targetLabel} holds ${target.held.length} of them and has room for ${movable.length} more, not all ${strays.length}. Gathering what fits still cuts the search in half.`
        : `${targetLabel} already holds ${target.held.length} of them and has room for the other ${movable.length}.`,
      wines: entries.map((e) => e.wine),
      moves: movable.map((e) => ({
        wine: e.wine,
        from: e.container,
        to: target.container,
        fromLabel: containerLabel(e.container, cabinets),
        toLabel: targetLabel,
      })),
    });
  }
  return out;
}

// A bin that is overwhelmingly one kind of wine, with a couple of bottles that
// are not. The bin's purpose was never declared, but at this concentration it
// plainly has one.
function findOutliers(
  placed: { wine: Wine; container: Container }[],
  live: ReturnType<typeof liveContainers>,
  cabinets: Cabinet[],
  wines: Wine[]
): Finding[] {
  const byContainer = new Map<string, Wine[]>();
  for (const e of placed) {
    const ck = containerKey(e.container);
    const list = byContainer.get(ck);
    if (list) list.push(e.wine);
    else byContainer.set(ck, [e.wine]);
  }

  // Where each type feels at home, for suggesting somewhere better.
  const homes = new Map<WineType, { container: Container; cabinet: Cabinet; count: number }[]>();
  for (const [ck, bottles] of byContainer) {
    const dom = dominantType(bottles);
    if (!dom || dom.share < DOMINANCE) continue;
    const entry = live.get(ck)!;
    const list = homes.get(dom.type) || [];
    list.push({ ...entry, count: bottles.filter((w) => w.type === dom.type).length });
    homes.set(dom.type, list);
  }

  const out: Finding[] = [];
  for (const [ck, bottles] of byContainer) {
    if (bottles.length < MIN_CONTAINER_BOTTLES) continue;
    const dom = dominantType(bottles);
    if (!dom || dom.share < DOMINANCE) continue;
    const intruders = bottles.filter((w) => w.type !== dom.type);
    if (!intruders.length || intruders.length > MAX_INTRUDERS) continue;

    const here = live.get(ck)!;
    const moves: Move[] = [];
    for (const wine of intruders) {
      const better = (homes.get(wine.type) || [])
        .filter((h) => containerKey(h.container) !== ck)
        .map((h) => ({ ...h, free: containerUsage(h.container, h.cabinet, wines).free }))
        .filter((h) => h.free > 0)
        .sort((a, b) => b.count - a.count || b.free - a.free)[0];
      if (!better) continue;
      moves.push({
        wine,
        from: here.container,
        to: better.container,
        fromLabel: containerLabel(here.container, cabinets),
        toLabel: containerLabel(better.container, cabinets),
      });
    }
    if (!moves.length) continue;

    const label = containerLabel(here.container, cabinets);
    const typeName = WINE_TYPE_LABELS[dom.type] || dom.type;
    out.push({
      id: `outlier:${ck}:${dom.type}`,
      kind: "outlier",
      title: `${label} is ${Math.round(dom.share * 100)}% ${typeName}`,
      detail: `${intruders.length === 1 ? "One bottle does" : `${intruders.length} bottles do`} not belong to that group. Nothing says this bin is only for ${typeName} — but it nearly is.`,
      wines: intruders,
      moves,
    });
  }
  return out;
}

// A bottle whose drinking window is closing, stuck behind or under bottles
// meant to be kept. No move is proposed: freeing it means two bottles trading
// places, and writing that as one-way moves would misdescribe the rack.
function findBuried(
  placed: { wine: Wine; container: Container }[],
  cabinets: Cabinet[]
): Finding[] {
  const byContainer = new Map<string, { wine: Wine; container: Container }[]>();
  for (const e of placed) {
    const ck = containerKey(e.container);
    const list = byContainer.get(ck);
    if (list) list.push(e);
    else byContainer.set(ck, [e]);
  }

  const out: Finding[] = [];
  for (const entries of byContainer.values()) {
    if (entries.length < 2) continue;
    for (const e of entries) {
      if (!isDrinkSoon(e.wine)) continue;
      const depth = e.wine.depth || 0;
      const inFront = entries.filter((o) => (o.wine.depth || 0) < depth && isKeeper(o.wine));
      if (!inFront.length) continue;
      const label = containerLabel(e.container, cabinets);
      const year = drinkByYear(e.wine);
      out.push({
        id: `buried:${e.wine.id}`,
        kind: "buried",
        title: `${e.wine.name || "A bottle"} is due${year ? ` by ${year}` : ""} but hard to reach`,
        detail: `It sits at slot ${depth + 1} of ${label}, behind ${inFront.length === 1 ? "a bottle" : `${inFront.length} bottles`} marked to keep. Swap them by hand next time the door is open.`,
        wines: [e.wine, ...inFront.map((o) => o.wine)],
        moves: [],
      });
    }
  }
  return out;
}

const KIND_ORDER: FindingKind[] = ["consolidate", "outlier", "buried"];

// Everything the cellar's own arrangement disagrees about, minus what the user
// has waved off for good.
export function analyzeArrangement(
  wines: Wine[],
  cabinets: Cabinet[],
  dismissed: string[] = []
): Finding[] {
  const live = liveContainers(cabinets);
  const placed = placedWines(wines, live);
  const hidden = new Set(dismissed);
  return [
    ...findScatter(placed, live, cabinets, wines),
    ...findOutliers(placed, live, cabinets, wines),
    ...findBuried(placed, cabinets),
  ]
    .filter((f) => !hidden.has(f.id))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
}
