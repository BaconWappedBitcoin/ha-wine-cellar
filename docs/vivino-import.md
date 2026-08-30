# Connecting your Vivino cellar to Cork Dork

Vivino has no public read API for your own cellar. The website authenticates
with a Rails/Devise **HttpOnly session cookie** (no bearer token) and serves the
cellar from an **Inertia.js** endpoint on `www.vivino.com` — not the
`api.vivino.com` mobile backend. Home Assistant can't drive a browser to log in,
so you paste your **session cookie** and **cellar URL** once; the integration
then reads the cellar on a schedule using that cookie.

When the cookie eventually expires, Cork Dork raises a notification asking you to
paste a fresh one.

## Method A — Integration sync (recommended)

### 1. Find your cellar URL

Log in to <https://www.vivino.com> in a desktop browser and open your **cellar**
page. The URL looks like:

```
https://www.vivino.com/sv/cellars/5398850
```

Copy that whole URL.

### 2. Copy your session cookie

The session cookie is **HttpOnly**, so you must read it from the browser's
developer tools (the `document.cookie` console trick won't show it):

1. With vivino.com open and logged in, press `F12` → **Application** tab
   (Chrome/Edge) or **Storage** tab (Firefox).
2. In the left sidebar: **Cookies → https://www.vivino.com**.
3. Find the row named **`_ruby-web_session`** and copy its **Value** (a long
   string). That value is your session cookie.

*Optional, more robust:* to also capture a longer-lived "remember me" cookie,
use the **Network** tab instead — click any request to `www.vivino.com`, find
**Request Headers → Cookie**, and copy the entire value. Paste that whole string
(it contains `_ruby-web_session=…; vv_sid=…; …`).

### 3. Configure Cork Dork

1. **Settings → Devices & Services → Cork Dork → Configure**.
2. Paste the **cellar URL** and the **session cookie**.
3. Choose the **Vivino mode** — see [Import or Synchronize](#import-or-synchronize)
   below. The default, Import, never writes to your Vivino account.
4. Optionally enable **Automatically sync the Vivino cellar twice a day**.
5. Save. The cookie is verified against your cellar immediately — a wrong or
   expired cookie is rejected with an error so you can fix it.

### 4. Sync

- Click the button in the card header — **⬇️ Vivino Import** or **🔄 Vivino
  Sync**, depending on the mode — or call the `wine_cellar.sync_vivino`
  service.
- Imported bottles land in the **Unassigned** tab; open any wine and use
  **Move** to place it in a rack.
- Only bottles you actually own (positive bottle count) are imported; your
  personal star ratings and tasting notes come across too.

> **Cookie lifetime:** Vivino sessions expire after a while. When that happens a
> sync fails and Cork Dork shows a "Vivino session expired" notification — just
> repeat steps 2–3 with a fresh cookie.

## Import or Synchronize

The Vivino mode in the integration's options decides what the connection is
allowed to do:

- **Import** (default) — a one-way mirror. Vivino is the source of truth:
  bottles added or consumed there are reflected in Cork Dork on the next sync,
  and **nothing is ever written to your Vivino account**. Local count changes
  on Vivino-synced wines are overwritten by the mirror, so manage your bottle
  counts in Vivino. Manually added wines are never touched.
- **Synchronize** — a two-way reconcile. Changes on either side since the last
  sync are applied to the other: Vivino-side changes update Cork Dork, and
  bottles you add or drink in Cork Dork are pushed back to Vivino as cellar
  events (visible — and undoable — in Vivino's cellar history, tagged
  "Cork Dork sync"). Pushes are paced and capped per sync, with the remainder
  queued for the next one. Two guards protect your data: a suspiciously short
  Vivino fetch never deletes locally, and a suspiciously large local shortfall
  never wipes your Vivino cellar.

### When a bottle disappears from Vivino

If the right bottle to remove is obvious — the wine is gone entirely, or
unplaced bottles cover the removal — Cork Dork removes it and the sync toast
reports the count. When a *placed* bottle would have to go and there are
several to choose from, nothing is deleted: the card shows a panel, selecting
the wine rings every candidate bottle in your racks in orange, and you click
the bottle that is actually gone and confirm. Every removed bottle is archived
to the wine history with the reason `removed_on_vivino`.

### When both sides changed the same wine

If a wine changed on Vivino *and* in Cork Dork between syncs (say a bottle was
consumed on Vivino while another was added locally), the sync changes nothing
and lists the conflict in the card. Select it to ring all of your local
bottles for review, correct anything that's off, then confirm **Cork Dork is
right** — Vivino is updated to match your local count and the conflict closes.
Conflict resolution writes to Vivino and therefore requires Synchronize mode.

## Method B — One-time CSV export (no config)

If you'd rather not store a cookie, export once from your browser and import the
CSV. On your **cellar** page, open the console (`F12` → **Console**), paste this,
and press Enter — it downloads `vivino-wines.csv`:

```js
(async () => {
  const appEl = document.getElementById("app") || document.querySelector("[data-page]");
  if (!appEl || !appEl.dataset.page) { console.warn("Open your cellar page first."); return; }
  const page0 = JSON.parse(appEl.dataset.page);
  const version = page0.version, basePath = location.pathname;
  const looksLikeWine = (o) => o && typeof o === "object" &&
    (o.wine || o.vintage || (o.name && (o.winery || o.region)));
  const findWineArray = (node) => {
    let best = null;
    const visit = (n) => {
      if (Array.isArray(n)) {
        if (n.length && n.filter(looksLikeWine).length >= Math.ceil(n.length / 2) &&
            (!best || n.length > best.length)) best = n.filter((x) => x && typeof x === "object");
        n.forEach(visit);
      } else if (n && typeof n === "object") Object.values(n).forEach(visit);
    };
    visit(node); return best;
  };
  const fetchPage = async (n) => {
    const r = await fetch(`${basePath}?page=${n}`, {
      headers: { "X-Inertia": "true", "X-Inertia-Version": version || "", "Accept": "application/json" },
      credentials: "include",
    });
    return r.ok ? r.json() : null;
  };
  const all = [], seen = new Set();
  const collect = (arr) => arr.forEach((rec) => {
    const id = rec.id || (rec.vintage && rec.vintage.id) || (rec.name || "") + Math.random();
    if (!seen.has(id)) { seen.add(id); all.push(rec); }
  });
  let first = findWineArray(page0.props);
  if (!first) { console.warn("Wine list not found. props keys:", Object.keys(page0.props||{})); console.log(JSON.stringify(page0.props,null,2).slice(0,4000)); return; }
  collect(first);
  for (let n = 2; n <= 100; n++) {
    const pg = await fetchPage(n); if (!pg || !pg.props) break;
    const f = findWineArray(pg.props); if (!f || !f.length) break;
    const before = all.length; collect(f); if (all.length === before) break;
  }
  const TYPE = { 1: "red", 2: "white", 3: "sparkling", 4: "rosé", 7: "dessert" };
  const cell = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const cols = ["name","winery","vintage","type","region","country","grape variety","rating","ratings count","user rating","alcohol","notes"];
  const rows = [cols.join(",")];
  for (const rec of all) {
    const vintage = rec.vintage || rec, wine = vintage.wine || rec.wine || rec;
    const name = wine.name || vintage.name; if (!name) continue;
    const count = rec.cellar_count ?? rec.bottle_count ?? rec.count;
    if (count != null && Number(count) <= 0) continue;
    const region = wine.region || {}, review = rec.user_review || rec.review || {};
    const stats = wine.statistics || {};
    let year = parseInt(vintage.year, 10); if (!year || year < 1800) year = "";
    rows.push([name,(wine.winery||{}).name||"",year,TYPE[wine.type_id]||"red",region.name||"",
      (region.country||{}).name||"",(wine.grapes||[]).map(x=>x.name).filter(Boolean).join(", "),
      stats.ratings_average?Number(stats.ratings_average).toFixed(1):"",stats.ratings_count||"",
      review.rating?Math.round(review.rating*2)/2:"",wine.alcohol?wine.alcohol+"%":"",
      (review.note||"").replace(/\s+/g," ").trim()].map(cell).join(","));
  }
  if (rows.length < 2) { console.warn("No owned wines found."); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
  a.download = "vivino-wines.csv"; a.click();
  console.log(`Exported ${rows.length - 1} wines.`);
})();
```

Then in Cork Dork: **📦 Inventory → Import CSV** and choose the file.

## Troubleshooting

- **"Vivino returned a web page instead of cellar data"** — the cookie is wrong
  or expired. Re-copy `_ruby-web_session` (step 2).
- **Sync reports "no recognizable wine list"** with a list of `props keys` in the
  Home Assistant log — Vivino changed the cellar data shape. Share that log line
  (or the console output from Method B) so the parser can be pointed at the new
  fields.
- After importing, use **🍇 Vivino Batch Scan** to enrich wines with the latest
  ratings, prices, descriptions, and images from Vivino's public data.
