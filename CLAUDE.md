# ha-wine-cellar ("Cork Dork") — project context for Claude

Home Assistant custom integration + Lovelace card for managing a wine cellar: rack/bin layout, barcode/label scanning, Vivino enrichment, AI (Gemini) enrichment, buy list, history.

## Repo / remotes — read this before touching git

- `origin` = **dobunzli/ha-wine-cellar** (this fork). Full rights, PR freely, no confirmation needed.
- `upstream` = **BaconWappedBitcoin/ha-wine-cellar** (original maintainer). **Never push, open a PR, comment, or touch upstream in any way without the user's explicit, per-action confirmation.** Even mentioning `owner/repo#123` as a link (not backticks) pings upstream — use backticks when citing an upstream issue/PR number.
- Two PRs already open on upstream, awaiting the maintainer's review: `#18` (dobunzli:fix-bulk-drag-drop) and `#19` (dobunzli:wine-location-and-inventory-fix). **Plan:** once those are reviewed/merged, rebuild the fork-only work (photo management, Vivino/AI data quality, currency, mobile API, UI polish — everything below) cleanly on top of the then-current upstream `main`, then open new upstream PRs — again, only with explicit confirmation each time.

## Current state (as of this file's creation)

`main` is up to date and contains everything through PR #11. Recent fork history: PRs #1–#9, #11 all merged (backup/restore, CSV, capacity stats, Vivino search reliability, multi-currency, UI polish — batch-AI confirm, photo swipe/quality, copy-paste fix, barcode→AI fallback, Vivino/AI settings dialog, clickable Vivino link).

**Not yet confirmed working on the user's Synology** — last deploy instructions were given for the final `main` state (files: `const.py`, `gemini.py`, `vivino.py`, `websocket.py`, `wine_storage.py`, `frontend/wine-cellar-card.js`, `frontend/wine-cellar-card.js.map`; `FRONTEND_VERSION = "20260817s"`). Ask the user if this was tested before doing more work on top.

## Key technical findings from recent work (don't re-discover these)

- **Vivino's `www.vivino.com/api/explore/explore` search API silently ignores the `q` param** for unauthenticated requests — returns the same generic "trending wines" list regardless of query (verified live, repeatedly). `search_wine()` in `vivino.py` now checks the top result for basic relevance before trusting it, falling back to HTML scraping (which *does* do real text search) when it looks wrong.
- **`api.vivino.com` (the mobile-app-facing backend) is open and unprotected** — no auth, no special headers, plain `GET https://api.vivino.com/wines/{id}` / `/vintages/{id}` / `/grapes/{id}` / `/foods` all work. Used for reliable refreshes once a wine's `vivino_id` is known (`VivinoClient.get_wine_by_id`). It has **no search endpoint** (by-id lookup only) and **no price data anywhere** — confirmed via extensive live testing (explore API, HTML scrape, real browser navigation, mobile API, even `curl` with browser-identical headers). Vivino's real price is not reliably scrapable; AI estimation (with user consent) is the fallback.
- A `Vivino Batch failed` bug turned out to be a websocket schema validation error (`ai_fallback` param sent by the frontend but not declared in the backend schema) — always check HA logs (`Paramètres > Système > Journaux`) for exact errors before guessing.
- LWIN / Liv-ex was investigated as a wine-ID/pricing source and **rejected**: the free LWIN database has no price/rating data (identification only), and Liv-ex's price data (Wine Matcher, Automation) is a professional fine-wine-trade product, not viable for this project.

## Deploy workflow (Synology, no CI)

- No CI/CD, no remote dev environment. After any change: list the exact changed `.py` files + compiled frontend JS to copy, user copies them via the Synology File Station, then does a **full Home Assistant restart** (a simple integration reload is NOT enough — Python module caching).
- Frontend: TypeScript/Lit in `frontend-src/src/`, built via `npm run build` (run from `frontend-src/`) to `custom_components/wine_cellar/frontend/wine-cellar-card.js`. After any frontend change, bump `FRONTEND_VERSION` in `custom_components/wine_cellar/const.py` (format `YYYYMMDD` + incrementing letter) to bust the browser cache.
- Verification (no live HA access from here): `npm run build` (4 pre-existing `TS2339` warnings in `add-wine-dialog.ts` re: `BarcodeLookupResult` are known/harmless, ignore them), `node --check` on the compiled JS bundle, `python3 -c "import ast; ast.parse(...)"` per changed `.py` file.
- **A repo-local PreToolUse hook blocks `cat`/`head`/`tail`/`sed`/`awk` in Bash and the Read tool without `offset`/`limit` for files >150 lines.** Use `Read` with `offset`/`limit`, or plain `grep` (careful: piping `grep` into `head`/`tail` in the *same* command also trips the hook).

## Branch / PR workflow

One branch per feature/fix, tested by the user on Synology, then PR + merge on the fork. For genuinely large sessions, group related changes into a small number of themed PRs rather than one-per-tiny-fix (discussed and agreed with the user) — but if PRs are stacked (PR B based on PR A's branch), **do not delete branch A when merging PR A** (`gh pr merge --delete-branch`) until PR B has been retargeted/merged — deleting a stacked PR's base branch auto-closes it on GitHub. Retarget or merge in the right order instead.

## Where to look

- `custom_components/wine_cellar/vivino.py` — Vivino explore API, HTML scrape, mobile API (`api.vivino.com`), barcode lookup.
- `custom_components/wine_cellar/gemini.py` — AI (Gemini/OpenAI-compatible) enrichment, label recognition, wine list extraction.
- `custom_components/wine_cellar/websocket.py` — all frontend↔backend commands; most business logic (refresh, batch refresh, settings, backup/restore) lives here.
- `custom_components/wine_cellar/wine_storage.py` — persisted data shape (`.storage/wine_cellar`), the Wine/Cabinet/BuyList schema.
- `frontend-src/src/wine-cellar-card.ts` — main card (grid, tabs, batch actions, stats).
- `frontend-src/src/components/` — dialogs (wine detail, add wine, inventory, rack settings, Vivino/AI settings, wine list scan).

## Persistent memory

There's also a Claude auto-memory system (outside this repo) with the upstream-confirmation rule and deploy workflow — this file is the repo-visible, git-tracked counterpart so the context survives even in a fresh environment/session that doesn't have that memory loaded.
