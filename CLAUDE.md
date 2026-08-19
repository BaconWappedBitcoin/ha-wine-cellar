# ha-wine-cellar ("Cork Dork") — project context for Claude

Home Assistant custom integration + Lovelace card for managing a wine cellar: rack/bin layout, barcode/label scanning, Vivino enrichment, AI (Gemini) enrichment, buy list, history.

## Repo / remotes — read this before touching git

- `origin` = **dobunzli/ha-wine-cellar** (this fork). Full rights, PR freely, no confirmation needed.
- `upstream` = **BaconWappedBitcoin/ha-wine-cellar** (original maintainer). **Never push, open a PR, comment, or touch upstream in any way without the user's explicit, per-action confirmation — every single time, regardless of access level.** Even mentioning `owner/repo#123` as a link (not backticks) pings upstream — use backticks when citing an upstream issue/PR number.
- **The user now has merge rights on upstream** (the maintainer offered collaborator access after reaching out about pulling the fork's work in) — they merged PR upstream#21 themselves on 2026-08-19. Having write access does **not** relax the confirmation rule above; it just means actions there are technically possible, not pre-authorized.
- **Upstream sync resolved (2026-08-19):** rather than the originally-planned "wait for #18/#19, then rebuild everything as new stacked PRs" approach, a single comprehensive PR (`dobunzli:main` → `BaconWappedBitcoin:main`, upstream#21) was opened instead, covering everything below plus what #18/#19 already had. Upstream#19 merged on its own; upstream#18 was closed as superseded; upstream#21 was merged. `upstream/main` and this fork's `main` are now effectively in sync (upstream may have a few of its own independent commits on top — `git fetch upstream && git log upstream/main` to check before assuming a specific diff). **Now waiting on the maintainer to cut a new upstream release** — no further action needed from this side until that happens or the user says otherwise.
- If more fork work needs to go upstream in the future, ask the user fresh each time whether they want a single comprehensive PR (simple, no dependency-chain risk) or split by feature (better for review, but only stack multiple PRs on unmerged upstream branches if the user explicitly accepts that the maintainer must then merge them in order — confirmed this constraint the hard way this round).

## Current state (as of 2026-08-19)

Fork `main` and `upstream/main` are in sync (see above). Fork history: PRs #1–#9, #11, #18 all merged (backup/restore, CSV, capacity stats, Vivino search reliability, multi-currency, UI polish, mobile-API Vivino lookup, codeowners correction) — plus PRs #12–#17 merged in a separate session on another machine (copy-paste/capacity fix, history restore, MIT LICENSE, drag-drop capacity bypass fix, local preview capacity-test scenario, credit line + codeowners — the codeowners part was later reverted per the maintainer's request).

**Not yet confirmed working on the user's Synology for the latest round** — ask before doing more work on top if unsure. Deploy file list and `FRONTEND_VERSION` change every session; always regenerate the list from the actual current diff rather than trusting a stale value here.

## Key technical findings from recent work (don't re-discover these)

- **Vivino's `www.vivino.com/api/explore/explore` search API silently ignores the `q` param** for unauthenticated requests — returns the same generic "trending wines" list regardless of query (verified live, repeatedly). `search_wine()` in `vivino.py` now checks the top result for basic relevance before trusting it, falling back to HTML scraping (which *does* do real text search) when it looks wrong.
- **`api.vivino.com` (the mobile-app-facing backend) is open and unprotected** — no auth, no special headers, plain `GET https://api.vivino.com/wines/{id}` / `/vintages/{id}` / `/grapes/{id}` / `/foods` all work. Used for reliable refreshes once a wine's `vivino_id` is known (`VivinoClient.get_wine_by_id`). It has **no search endpoint** (by-id lookup only) and **no price data anywhere** — confirmed via extensive live testing (explore API, HTML scrape, real browser navigation, mobile API, even `curl` with browser-identical headers). Vivino's real price is not reliably scrapable; AI estimation (with user consent) is the fallback.
- A `Vivino Batch failed` bug turned out to be a websocket schema validation error (`ai_fallback` param sent by the frontend but not declared in the backend schema) — always check HA logs (`Paramètres > Système > Journaux`) for exact errors before guessing.
- LWIN / Liv-ex was investigated as a wine-ID/pricing source and **rejected**: the free LWIN database has no price/rating data (identification only), and Liv-ex's price data (Wine Matcher, Automation) is a professional fine-wine-trade product, not viable for this project.

## Deploy workflow (Synology, no CI)

- No CI/CD, no remote dev environment. After any change: list the exact changed `.py` files + compiled frontend JS to copy, user copies them via the Synology File Station, then does a **full Home Assistant restart** (a simple integration reload is NOT enough — Python module caching).
- Frontend: TypeScript/Lit in `frontend-src/src/`, built via `npm run build` (run from `frontend-src/`) to `custom_components/wine_cellar/frontend/wine-cellar-card.js`. After any frontend change, bump `FRONTEND_VERSION` in `custom_components/wine_cellar/const.py` (format `YYYYMMDD` + incrementing letter) to bust the browser cache.
- **HACS-based testing (the user's own instance now tracks `dobunzli/ha-wine-cellar` directly via a HACS custom repository, not just Synology File Station copies)**: HACS's "update available" detection is driven by GitHub Releases, not raw commits on `main` — after merging a PR to `main`, bump `manifest.json`'s `version` (semver: patch for fixes, minor for features) and `gh release create vX.Y.Z --target main` on that commit, or the user's HACS install will keep resolving to the last-tagged release and silently miss the fix. Skip the version bump for no-op/doc-only changes (e.g. a LICENSE-only PR) unless asked otherwise.
- **After every deploy (Synology copy *or* HACS redownload) + full HA restart, also remind the user to hard-refresh the browser tab (Cmd+Shift+R).** Home Assistant's frontend is a persistent single-page app — restarting the backend does NOT reload an already-open tab's JS. Two consecutive "the fix still doesn't work" reports on this project turned out to be exactly this: the fix was correct both times, the browser tab just hadn't picked it up yet. Don't let "restart Home Assistant" alone imply the browser will pick up new code.
- Verification (no live HA access from here): `npm run build` (4 pre-existing `TS2339` warnings in `add-wine-dialog.ts` re: `BarcodeLookupResult` are known/harmless, ignore them), `node --check` on the compiled JS bundle, `python3 -c "import ast; ast.parse(...)"` per changed `.py` file.
- **Local frontend preview**: `custom_components/wine_cellar/frontend/index.html` is a standalone preview page with a full mock `hass` object (mocked `callWS` for every command the card uses — wines, cabinets, buy list, history, etc. — no real backend needed). Run `npm run dev` from `frontend-src/` (rollup watch + serve, port 5050) and open `http://localhost:5050` to interact with the *real* compiled component — including real mouse drag-and-drop — before asking the user to test on Synology/HACS. Includes a dedicated "Capacity Test" cabinet (a Bulk Bin already at capacity + a Spare Bin) for exercising the bin/box capacity-check logic specifically. Prefer this over writing a throwaway test harness from scratch. For a case the mock doesn't cover cleanly, a synthetic DOM `drop` event (with a hand-built `dataTransfer.getData("text/plain")` payload matching what `cabinet-grid.ts`'s real drag produces) is a reliable way to exercise `_onWineDrop` deterministically without fighting mouse-coordinate drag simulation.
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
