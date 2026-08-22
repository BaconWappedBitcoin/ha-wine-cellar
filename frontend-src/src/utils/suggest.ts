import { Cabinet, Wine, WINE_TYPE_LABELS } from "../models";
import { normalizeText } from "./search";
import {
  Container,
  ContainerUsage,
  containerKey,
  containerLabel,
  containerOf,
  containerUsage,
  containersOf,
  sameContainer,
  storageRowFor,
} from "./location";

// Suggesting where a new bottle should go, deduced from where its relatives
// already are. There are no zone rules to configure: the cellar's own layout
// is the only signal, so a suggestion is always "these bottles are here".

// Three tiers, most specific first. Every tier is shown when it has a hit —
// they are ranked, not filtered, so a brand-new wine still gets a hint from
// its region rather than nothing at all.
export type MatchTier = "same-wine" | "same-winery" | "same-family";

const TIER_ORDER: MatchTier[] = ["same-wine", "same-winery", "same-family"];

export interface Suggestion {
  container: Container;
  label: string;
  usage: ContainerUsage;
  tier: MatchTier;
  reason: string;
  matches: Wine[];
  // Where to go instead when this container is full. A full destination stays
  // in the list rather than being hidden: knowing the rest of the series is
  // here is exactly what makes "split it or reorganize?" answerable.
  alternative: { container: Container; label: string; free: number } | null;
}

const key = (value: unknown) => normalizeText(value).trim();

// Names are free text and a good half of them carry the vintage ("Sassicaia
// 2019") or a bottling note ("Margaux 2018 (Case #2)"). Comparing them raw
// would make "same wine, any vintage" almost never fire, which is the one
// tier the user actually cares about.
function cuveeKey(value: unknown): string {
  return key(value)
    .replace(/\((?:[^()]*)\)/g, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tierOf(draft: Partial<Wine>, wine: Wine): MatchTier | null {
  const dName = cuveeKey(draft.name);
  const dWinery = key(draft.winery);
  const wName = cuveeKey(wine.name);
  const wWinery = key(wine.winery);

  // Same wine, any vintage: the cuvée is what identifies it, not the year.
  // With no winery recorded on either side the name has to carry it alone.
  if (dName && dName === wName && (!dWinery || !wWinery || dWinery === wWinery)) return "same-wine";
  if (dWinery && dWinery === wWinery) return "same-winery";

  const dRegion = key(draft.region);
  if (dRegion && dRegion === key(wine.region) && draft.type && draft.type === wine.type) {
    return "same-family";
  }
  return null;
}

function vintageList(wines: Wine[]): string {
  const years = Array.from(
    new Set(wines.map((w) => w.vintage).filter((v): v is number => typeof v === "number"))
  ).sort((a, b) => a - b);
  return years.join(", ");
}

function reasonFor(tier: MatchTier, draft: Partial<Wine>, matches: Wine[]): string {
  const n = matches.length;
  const bottles = n === 1 ? "1 bottle" : `${n} bottles`;
  if (tier === "same-wine") {
    const years = vintageList(matches);
    const sameYear = matches.every((w) => w.vintage === draft.vintage);
    if (sameYear) return `${bottles} of this exact wine already here`;
    return years ? `${bottles} of this wine here (${years})` : `${bottles} of this wine already here`;
  }
  if (tier === "same-winery") {
    const winery = matches[0]?.winery || draft.winery || "this winery";
    return `${bottles} from ${winery} here`;
  }
  const first = matches[0];
  const region = first?.region || draft.region || "";
  const type = first ? WINE_TYPE_LABELS[first.type] || "" : "";
  return `${bottles} of ${[region, type].filter(Boolean).join(" ")} here`.replace(/\s+/g, " ");
}

// The best place to send the bottle instead, when the natural destination is
// full: somewhere in the same cabinet with room, preferring a container that
// already holds relatives, then simply the nearest one with space.
function alternativeFor(
  full: Container,
  cabinet: Cabinet,
  wines: Wine[],
  matchIds: Set<string>
): { container: Container; label: string; free: number } | null {
  const all = containersOf(cabinet);
  const fullIdx = all.findIndex((c) => sameContainer(c, full));
  const scored = all
    .map((c, idx) => ({ c, idx, usage: containerUsage(c, cabinet, wines) }))
    .filter((x) => !sameContainer(x.c, full) && !x.usage.full)
    .map((x) => ({
      ...x,
      relatives: wines.filter((w) => {
        const wc = containerOf(w);
        return wc !== null && sameContainer(wc, x.c) && matchIds.has(w.id);
      }).length,
    }));
  if (!scored.length) return null;
  scored.sort(
    (a, b) =>
      b.relatives - a.relatives ||
      Math.abs(a.idx - fullIdx) - Math.abs(b.idx - fullIdx) ||
      b.usage.free - a.usage.free
  );
  const best = scored[0];
  return {
    container: best.c,
    label: containerLabel(best.c, [cabinet]),
    free: best.usage.free,
  };
}

// Ranked destinations for a bottle about to be added. Empty when the cellar
// holds nothing related — better to say nothing than to invent a reason.
export function suggestDestinations(
  draft: Partial<Wine>,
  wines: Wine[],
  cabinets: Cabinet[],
  limit = 3
): Suggestion[] {
  const byContainer = new Map<string, { container: Container; tier: MatchTier; matches: Wine[] }>();

  for (const wine of wines) {
    const container = containerOf(wine);
    if (!container) continue;
    // Never point at a bin the rack layout no longer knows about: bottles can
    // outlive a deleted storage row, but sending a new one there would be
    // sending it nowhere.
    const cabinet = cabinets.find((c) => c.id === container.cabinetId);
    if (!cabinet) continue;
    if (container.kind === "zone" && !storageRowFor(cabinet, container.zone)) continue;
    if (container.kind === "bottom" && !cabinet.has_bottom_zone) continue;
    const tier = tierOf(draft, wine);
    if (!tier) continue;
    const k = `${containerKey(container)}::${tier}`;
    const entry = byContainer.get(k);
    if (entry) entry.matches.push(wine);
    else byContainer.set(k, { container, tier, matches: [wine] });
  }

  // A container reached through several tiers is only worth listing once, at
  // its most specific tier.
  const bestPerContainer = new Map<string, { container: Container; tier: MatchTier; matches: Wine[] }>();
  for (const entry of byContainer.values()) {
    const k = containerKey(entry.container);
    const current = bestPerContainer.get(k);
    if (!current || TIER_ORDER.indexOf(entry.tier) < TIER_ORDER.indexOf(current.tier)) {
      bestPerContainer.set(k, entry);
    }
  }

  const ranked = Array.from(bestPerContainer.values()).sort(
    (a, b) =>
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.matches.length - a.matches.length
  );

  return ranked.slice(0, limit).map((entry) => {
    const cabinet = cabinets.find((c) => c.id === entry.container.cabinetId);
    const usage = containerUsage(entry.container, cabinet, wines);
    const matchIds = new Set(entry.matches.map((w) => w.id));
    return {
      container: entry.container,
      label: containerLabel(entry.container, cabinets),
      usage,
      tier: entry.tier,
      reason: reasonFor(entry.tier, draft, entry.matches),
      matches: entry.matches,
      alternative:
        usage.full && cabinet ? alternativeFor(entry.container, cabinet, wines, matchIds) : null,
    };
  });
}
