# Cork Dork — Wine Cellar Tracker for Home Assistant

A custom Home Assistant integration for managing your wine collection. Track bottles by location in interactive rack grids, scan labels and wine lists with AI, get Vivino ratings and pricing, drag-and-drop bottles between slots, browse and export your full inventory, and visualize your cellar with a feature-rich Lovelace card.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

![Wine Cellar Rack View](docs/screenshot-rack-view.png)

![Wine Detail Dialog](docs/screenshot-wine-detail.png)

## Features

### Visual Cellar Management
- **Interactive Cabinet Grid** — Color-coded bottles by type (red, white, rosé, sparkling, dessert) with thumbnail images, scalable disposition badges (Drink/Hold/Past Peak), and Vivino ratings
- **Deep Rack Support** — Racks can be 1-6 bottles deep; click any deep cell to open the depth side panel showing every bottle stacked front-to-back
- **Depth Side Panel** — Slide-out panel reveals all bottles in a deep cell, click any wine for its detail or tap an empty slot to add a bottle at that specific depth
- **Visual Rack Editor** — Create and edit racks with a live grid preview, stepper controls for rows/columns/depth, and per-row type selectors. Racks can be any size up to 20×20.
- **Drag & Drop** — Rearrange bottles by dragging on desktop; long-press to move on mobile
- **Move & Swap** — Move button in wine detail or long-press on mobile; bottles swap automatically if the target cell is occupied
- **Copy & Paste** — Duplicate wines across your cellar for multi-bottle purchases
- **Search & Filter** — Filter by wine type or search by name, winery, region, or grape variety
- **Statistics Dashboard** — Total bottles, capacity, available slots, total cellar value, and gain/loss at a glance
- **Responsive Design** — Optimized layouts for phone, tablet, and desktop with full dark mode support

![Depth Side Panel](docs/screenshot-depth-panel.png)

### Storage Zone Types
- **Bulk Bins** — Open storage for loosely grouped bottles (e.g., daily drinkers, pending sort). Shows individual wine squares with configurable capacity.
- **Wine Boxes** — Multi-box rows with configurable box sizes (e.g., [6, 12, 3]). CSS-drawn box shapes with wine count displayed inside each box (e.g., "2/6") and pack size labels.
- **Zone Side Panel** — Click any storage zone container to open a slide-out panel (same UX as the depth panel) showing all wines in that zone with add/remove capability.
- **Per-Row Type Selector** — Each rack row can be independently set to Slots (grid), Bulk Bin, or Wine Box via the rack settings dialog.

### Cellar Arrangement
- **Tidy-Up Analysis** — A counter in the header ("2 tidy-ups") opens a report of what has drifted out of order. It finds three things: bottles of one wine scattered across several places, a container dominated by one wine type with one or two odd ones out, and a bottle due to be drunk soon that is stuck behind bottles you are holding.
- **Act or Dismiss** — Each finding proposes concrete moves. "I moved it" records the move so the cellar matches reality; dismissing a finding retires it for good, so a suggestion you have judged and rejected never comes back on re-analysis.
- **Suggested Destination** — When you add a bottle, Cork Dork proposes where it should go, based on where its relatives already live: the same wine first, then the same winery, then the same region and type. If the natural home is full, it looks for space in the same cabinet, preferring a container that already holds matching bottles.
- **Multi-Bottle Add** — Add several identical bottles in one step from the confirmation screen, with placement planned across the free slots.

### Inventory Browser & Wine History
- **Full Inventory Dialog** — Browse, search, sort, and export your entire cellar collection from the 📦 Inventory button
- **Wine History** — Track removed bottles with reason (Drank, Gifted, Sold, Broken, Spoiled, Other). Switch between Inventory and History tabs to see your consumption log sorted by date.
- **Multi-Field Search** — Search across name, winery, region, country, grape variety, vintage, barcode, notes, and description
- **Sort Options** — Sort by name, winery, vintage, type, rating, your own rating, price, drink-by date, urgency, purchase date, date added, or cabinet location (ascending/descending)
- **Type Filter Chips** — Quick-filter by wine type (All / Red / White / Rosé / Sparkling / Dessert)
- **Detailed Filters** — Narrow by country, grape, cabinet, food pairing, minimum rating, maximum price, and vintage range
- **Presets** — One-tap views for the questions actually worth asking: Drink this year, Past peak, Not rated, Missing data, Added recently
- **Summary Stats** — Total bottles, estimated collection value, and type breakdown with colored indicators
- **Disposition Search** — Search by "Drink", "Hold", or "Past Peak" to filter by disposition; also searches drink window field
- **CSV Export** — Download your filtered/sorted inventory as a date-stamped CSV file with 26 data columns
- **Server Backup** — Save timestamped backups to the HA server (config/wine_cellar_backups/) with one click. Old backups are pruned automatically; how many to keep is configurable (0 keeps every one forever).
- **Server Restore** — Browse and restore from any previous server backup with a date/size picker
- **Download/Upload** — Download the full cellar as JSON or upload a JSON backup to restore
- **CSV Import** — Import wines from a CSV file, either adding every row as a new bottle or updating existing wines matched by id
- **Click to Detail** — Tap any wine in the inventory to open the full detail dialog with edit, move, and action capabilities

### Unassigned Wines
- **Unassigned Tab** — When wines exist that are not assigned to any rack (e.g., after rack deletion), an orange "Unassigned" tab appears automatically
- **Always Visible** — Unassigned wines also appear at the bottom of the "All Sections" view so they are never hidden
- **Easy Reassignment** — Tap any unassigned wine to open its detail, then use Move to place it in a rack

### Buy List
- **Wine Wishlist** — Save wines you want to purchase with full detail tracking (ratings, pricing, tasting notes)
- **Quick Add** — Add wines to the buy list from the wine list scanner or the Add Wine dialog
- **Move to Cellar** — One-tap to move a buy list wine into a specific rack position
- **Full Detail View** — Tap any buy list item to see its complete detail with Vivino refresh, AI scan, and tasting notes

![Buy List](docs/screenshot-buy-list.png)

### AI-Powered Wine Intelligence
- **One-Scan Label Recognition** — Snap a photo of a wine label and Google Gemini identifies the wine and provides a full sommelier assessment in one call: name, winery, vintage, type, region, grape variety, disposition, drink window, tasting description, estimated price, and critic rating estimates (Wine Spectator, Robert Parker, James Dunnuck, Antonio Galloni)
- **AI Batch Scan** — One-click full AI analysis on your entire cellar: disposition, drink windows, descriptions, pricing, and ratings for every bottle
- **Wine List / Receipt Scanner** — Photograph a restaurant wine list or store receipt and get every wine extracted with AI-powered analysis in a single call: critic scores, disposition, drink window, description, retail price estimates, and markup percentages. Highlights best-value picks and lets you add any wine to your cellar or buy list with one tap. Shows "IN CELLAR" badge and your personal score when a scanned wine matches one already in your collection. Optionally enrich with Vivino ratings and images. Supports long lists (up to 3 minute timeout).
- **Gemini Price Fallback** — When Vivino has no pricing data, Gemini AI provides estimated retail prices as a fallback for single wine refresh and batch scans
- **Auto-Enrich on Add** — When you add a wine, Vivino data (rating, price, description, food pairings) is automatically fetched in the background

### Vivino Integration
- **Cellar Connection** — Connect your Vivino cellar by pasting your cellar URL and session cookie once (see **[docs/vivino-import.md](docs/vivino-import.md)**). One tap on the card's button then brings in every bottle you own (with ratings, images, region, grape data, and your personal star ratings/notes) as unassigned wines. Bottle counts are respected and already-imported bottles are never duplicated.
- **Vivino Mode: Import or Synchronize** — Chosen in the integration's options. **Import** (the default) is a one-way mirror: Vivino is the source of truth and Cork Dork follows it; nothing is ever written to your Vivino account. **Synchronize** is a two-way reconcile: bottles you add or drink in Cork Dork are pushed back to your Vivino cellar as cellar events (visible and undoable in Vivino's history), guarded so a bad fetch can't wipe Cork Dork and corrupt local data can't wipe Vivino. The card's button reflects the mode — ⬇️ Vivino Import or 🔄 Vivino Sync.
- **You Pick the Bottle** — When Vivino loses a bottle and the choice of which physical bottle to remove is obvious (the wine is gone entirely, or unplaced bottles cover it), Cork Dork handles it and the sync toast reports the count. When a placed bottle would have to go and there are several to choose from, nothing is deleted: the card shows a panel, selecting the wine rings every candidate bottle in your racks in orange, and you click the bottle that is actually gone and confirm. Removed bottles are archived to history either way.
- **Conflicts Are Yours to Settle** — If both sides changed the same wine between syncs (say a bottle drunk on Vivino while one was added in Cork Dork), the sync changes nothing and the card shows the conflict. Selecting it rings all of your local bottles for review; after correcting anything that's off, one confirmed click declares Cork Dork's count the truth and updates Vivino to match.
- **Auto Sync** — Optionally sync the cellar automatically twice a day. When the session cookie expires, a notification prompts you to paste a fresh one.
- **Sync Service & Sensor** — `wine_cellar.sync_vivino` service for automations plus a `Cork Dork Vivino Cellar` sensor reporting the last sync
- **Vivino Batch Scan** — Refresh all wines from Vivino in one click: ratings, review counts, market pricing, descriptions, food pairings, alcohol content, and grape variety. Falls back to Gemini AI pricing when Vivino has no price.
- **Individual Vivino Refresh** — Update any single wine's Vivino data from the detail dialog
- **Wine Search** — Search Vivino by name to find and add wines without a barcode
- **Wine List Vivino Enrichment** — After scanning a wine list, optionally click "Get Vivino Scores" to add Vivino ratings and images to your results

### Scanning & Input
- **Camera Barcode Scanning** — Point your phone or tablet camera at a barcode to auto-lookup details from Vivino and Open Food Facts
- **AI Label Scanning** — Photo-based label recognition with full wine analysis
- **Manual Entry** — Add wines by hand with a comprehensive form

### Ratings & Notes
- **Interactive Half-Star Rating** — Rate wines from 0.5 to 5.0 stars
- **Structured Tasting Notes** — Record aroma, taste, finish, and overall impression
- **AI Critic Estimates** — Gemini provides estimated scores from Wine Spectator, Robert Parker, James Dunnuck, and Antonio Galloni
- **Vivino Community Ratings** — Real ratings and review counts from Vivino's user base

### Language & Currency
- **Metadata Language** — Ask the AI for descriptions, food pairings and tasting notes in English, French or German
- **Multiple Currencies** — Record and display prices in USD, EUR, GBP or CHF, with cellar value and gain/loss following the currency you chose

### Home Assistant Integration
- **HA Sensors** — Entities for total bottles, capacity percentage, and per-cabinet counts for use in automations and dashboards
- **Services** — Automate adding, removing, and moving wines via HA services

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the three dots in the top right and select **Custom repositories**
3. Add `https://github.com/BaconWappedBitcoin/ha-wine-cellar` with category **Integration**
4. Search for **Cork Dork** and click **Install**
5. Restart Home Assistant

### Manual

1. Copy the `custom_components/wine_cellar` folder into your Home Assistant `custom_components` directory
2. Restart Home Assistant

## Setup

1. Go to **Settings > Devices & Services > Add Integration**
2. Search for **Cork Dork** and follow the setup flow
3. Add the Lovelace card to your dashboard:

```yaml
type: custom:wine-cellar-card
title: Cork Dork
```

### AI Features (Optional)

To enable label recognition, AI analysis, wine list scanning, and batch AI scanning:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Go to **Settings > Devices & Services > Cork Dork > Configure**
3. Enter your Gemini API key
4. Features unlocked:
   - **Recognize Label** button in the Add Wine dialog (camera to full analysis in one scan)
   - **AI** button on individual wines (full analysis with disposition, ratings, pricing)
   - **AI Batch Scan** button in the card header (analyze all wines at once)
   - **Scan List** button to photograph wine lists and receipts for instant analysis
   - **Gemini price fallback** when Vivino has no pricing data

### Language & Currency

Both are set on the card itself, under **⚙️ Vivino/AI Settings**, not in the
integration options. Pick the language the AI should write descriptions,
food pairings and tasting notes in (English, French or German), and the
currency prices are recorded and totalled in (USD, EUR, GBP or CHF).

### Connecting Your Vivino Cellar

Vivino has no public read API for your own cellar — the site uses a Rails
session cookie and serves the cellar from an Inertia.js endpoint on
`www.vivino.com` (not the `api.vivino.com` mobile backend). Cork Dork reads it
by replaying a session cookie you paste from your browser.

- **[docs/vivino-import.md](docs/vivino-import.md)** has full instructions for
  both methods:
  - **Integration sync (recommended):** paste your cellar URL and session cookie
    in **Cork Dork → Configure**, then use **🔄 Vivino Sync** (or enable twice-daily
    auto-sync). When the cookie expires, a notification prompts you to refresh it.
  - **One-time CSV export:** run a browser-console snippet and load the file via
    **📦 Inventory → Import CSV**.
- After importing, **🍇 Vivino Batch Scan** enriches wines with ratings, pricing,
  descriptions, and images from Vivino's public data.

## Default Cabinet Layout

The integration ships with 3 cabinet sections, each with 10 rows and 9 columns (90 slots per section, 270 total). The bottom row of each section defaults to a bulk bin storage zone. Rack dimensions (up to 20×20), names, depth (1-6 bottles deep), and per-row storage types (Slots, Bulk Bin, Wine Box) can all be customized through the **Manage Racks** button in the tab bar.

## Data Sources

| Source | Data Provided |
|---|---|
| **Vivino** | Wine name, winery, region, country, type, vintage, rating, ratings count, image, grape variety, description, food pairings, alcohol %, market price |
| **Open Food Facts** | Wine name, brand, origin, country, image |
| **UPC Item DB** | Wine name, brand (barcode lookup) |
| **Google Gemini** | Label recognition, wine list extraction, full wine analysis (disposition, drink window, description, estimated retail price, critic rating estimates), price fallback |

## Services

| Service | Description |
|---|---|
| `wine_cellar.add_wine` | Add a wine bottle to your collection |
| `wine_cellar.remove_wine` | Remove a wine bottle (optional reason: drank, gifted, sold, broken, spoiled, other) |
| `wine_cellar.move_wine` | Move a wine to a different cabinet/position |
| `wine_cellar.scan_barcode` | Look up a barcode and fire a result event |
| `wine_cellar.sync_vivino` | Import your Vivino cellar and wishlist (target: all, cellar, or wishlist) |

## Sensors

| Entity | Description |
|---|---|
| `sensor.wine_cellar_total_bottles` | Total number of bottles in your cellar |
| `sensor.wine_cellar_capacity` | Percentage of cellar capacity used |
| `sensor.wine_cellar_cabinet_*_count` | Bottle count per cabinet section |
| `sensor.cork_dork_vivino_cellar` | Bottles in your Vivino cellar at last sync (with sync details as attributes) |

## Where Your Data Lives

| Path | Contents |
|---|---|
| `.storage/wine_cellar` | Wines, cabinets, buy list, history — the cellar itself |
| `config/wine_cellar_photos/` | Bottle photos, one file per photo |
| `config/wine_cellar_backups/` | Timestamped server backups |

Bottle photos are kept as files and referenced by URL rather than embedded in
each wine record. This matters more than it sounds: as inline data they were
re-sent over the websocket on every load and after every edit, which a cellar
entered by photo feels immediately. Existing photos are moved out to disk
automatically on first start after upgrading — there is nothing to do.

Backups are the deliberate exception: they carry their photos inside them, so
a backup file stands on its own and restores onto a fresh install without
depending on files it never contained.

## Known Limitations

- **Barcode scanning does not work on iOS.** Safari does not implement the
  `BarcodeDetector` API at all, on any connection. This is not a permissions
  problem and cannot be fixed from here; use label recognition or manual entry
  on an iPhone or iPad.
- **The live camera needs HTTPS.** Browsers only expose camera access in a
  secure context, so reaching Home Assistant over plain `http://` leaves the
  live camera unavailable. Cork Dork detects this and offers the photo picker
  instead, which opens the native camera and works fine — you just take the
  picture in the camera app rather than in the card.
- **Vivino has no price data in its public endpoints.** Ratings, regions,
  grapes and images are all available; price is not, anywhere that can be read
  reliably. Where a price is shown without one, it is an AI estimate and is
  labelled as such.

## License

MIT
