import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Wine, Cabinet, WineType, WINE_TYPE_COLORS, WINE_TYPE_LABELS, WineHistoryItem, getWineLocation } from "../models";
import { sharedStyles } from "../styles";
import {
  matchesQuery,
  normalizeText,
  drinkByYear,
  compareNullable,
  splitMulti,
  collectFacet,
} from "../utils/search";
import "./wine-detail-dialog";

type SortField =
  | "name"
  | "winery"
  | "vintage"
  | "type"
  | "rating"
  | "user_rating"
  | "price"
  | "drink_by"
  | "urgency"
  | "purchase_date"
  | "added_at"
  | "cabinet";
type SortDir = "asc" | "desc";
type Preset = "all" | "drink_this_year" | "past_peak" | "unrated" | "incomplete" | "recent";

// Persisted so the inventory reopens the way it was left; the search query is
// deliberately excluded — a stale query silently hiding the cellar is far more
// confusing than a stale sort order.
const PREFS_KEY = "wine_cellar_inventory_prefs_v1";

const DEFAULT_FILTERS = {
  typeFilter: "all",
  dispositionFilter: "all",
  countryFilter: "all",
  grapeFilter: "all",
  foodFilter: "all",
  cabinetFilter: "all",
  minRating: 0,
  maxPrice: null as number | null,
  vintageMin: null as number | null,
  vintageMax: null as number | null,
  preset: "all" as Preset,
};

@customElement("inventory-dialog")
export class InventoryDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) wines: Wine[] = [];
  @property({ attribute: false }) cabinets: Cabinet[] = [];
  @property({ type: Boolean }) hasGemini = false;
  @property({ type: String }) currency = "USD";

  @state() private _searchQuery = "";
  @state() private _typeFilter = DEFAULT_FILTERS.typeFilter;
  @state() private _dispositionFilter = DEFAULT_FILTERS.dispositionFilter;
  @state() private _countryFilter = DEFAULT_FILTERS.countryFilter;
  @state() private _grapeFilter = DEFAULT_FILTERS.grapeFilter;
  @state() private _foodFilter = DEFAULT_FILTERS.foodFilter;
  @state() private _cabinetFilter = DEFAULT_FILTERS.cabinetFilter;
  @state() private _minRating = DEFAULT_FILTERS.minRating;
  @state() private _maxPrice: number | null = DEFAULT_FILTERS.maxPrice;
  @state() private _vintageMin: number | null = DEFAULT_FILTERS.vintageMin;
  @state() private _vintageMax: number | null = DEFAULT_FILTERS.vintageMax;
  @state() private _preset: Preset = DEFAULT_FILTERS.preset;
  @state() private _showFilters = false;
  @state() private _sortField: SortField = "name";
  @state() private _sortDir: SortDir = "asc";
  @state() private _detailWine: Wine | null = null;
  @state() private _showDetail = false;
  @state() private _backingUp = false;
  @state() private _importing = false;
  @state() private _restoring = false;
  @state() private _confirmRestore = false;
  @state() private _restoreData: any = null;
  @state() private _confirmImport = false;
  @state() private _pendingImport: any[] | null = null;
  @state() private _importMatches = 0;
  @state() private _statusMsg = "";
  @state() private _serverBackingUp = false;
  @state() private _serverBackupLabel = "";
  @state() private _showServerRestore = false;
  @state() private _serverBackups: any[] = [];
  @state() private _serverRestoring = false;
  @state() private _backupKeep = 10;
  @state() private _backupKeepChoices: number[] = [0, 5, 10, 20, 50];
  @state() private _storageInfo: any = null;
  @state() private _enriching: "" | "vivino" | "ai" = "";
  @state() private _confirmEnrich: "" | "vivino" | "ai" = "";
  @state() private _viewMode: "inventory" | "history" = "inventory";
  @state() private _historyItems: WineHistoryItem[] = [];
  @state() private _historyLoading = false;

  static styles = [
    sharedStyles,
    css`
      .inv-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 8px;
      }

      .inv-header-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text);
      }

      .inv-close {
        background: none;
        border: none;
        font-size: 1.3em;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
        color: var(--wc-text-secondary);
      }

      .inv-close:hover {
        background: var(--wc-hover);
      }

      .inv-stats {
        display: flex;
        gap: 16px;
        padding: 4px 20px 10px;
        flex-wrap: wrap;
        font-size: 0.82em;
        color: var(--wc-text-secondary);
      }

      .inv-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .inv-stats .stat-value {
        font-weight: 600;
        color: var(--wc-text);
      }

      .inv-type-dot-sm {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 2px;
      }

      .inv-controls {
        display: flex;
        gap: 8px;
        padding: 0 16px 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .inv-search-wrapper {
        flex: 1;
        min-width: 140px;
        position: relative;
      }

      .inv-search-wrapper input {
        width: 100%;
        padding: 8px 12px 8px 30px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        font-size: 0.88em;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
      }

      .inv-search-wrapper input:focus {
        outline: none;
        border-color: var(--wc-primary);
      }

      .inv-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85em;
        pointer-events: none;
      }

      .inv-sort {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .inv-sort select {
        padding: 6px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 0.8em;
        cursor: pointer;
      }

      .inv-sort-dir {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        padding: 5px 9px;
        cursor: pointer;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1;
      }

      .inv-sort-dir:hover {
        background: var(--wc-hover);
      }

      .inv-filter-toggle {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 14px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }

      .inv-filter-toggle:hover {
        background: var(--wc-hover);
      }

      .inv-filter-toggle.active {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
      }

      .inv-filter-badge {
        background: var(--wc-primary);
        color: #fff;
        border-radius: 9px;
        padding: 1px 6px;
        font-size: 0.85em;
        font-weight: 600;
      }

      .inv-filter-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px 12px;
        padding: 12px 16px;
        margin: 0 16px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        background: var(--wc-bg);
      }

      .inv-filter-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-filter-field select,
      .inv-filter-field input {
        padding: 6px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-card-bg, var(--wc-bg));
        color: var(--wc-text);
        font-size: 1.05em;
        width: 100%;
        box-sizing: border-box;
      }

      .inv-filter-field select:focus,
      .inv-filter-field input:focus {
        outline: none;
        border-color: var(--wc-primary);
      }

      .inv-filter-range {
        display: flex;
        gap: 6px;
      }

      .inv-filter-hint {
        font-size: 0.9em;
        opacity: 0.75;
        line-height: 1.3;
      }

      .inv-active-filters {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 0 16px 10px;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(114, 47, 55, 0.08);
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-clear-filters {
        background: none;
        border: none;
        color: var(--wc-primary);
        cursor: pointer;
        font-size: 1em;
        font-weight: 600;
        padding: 2px 4px;
        white-space: nowrap;
      }

      .inv-clear-filters:hover {
        text-decoration: underline;
      }

      .inv-drink-by {
        opacity: 0.8;
      }

      .inv-enrich {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin: 0 16px 10px;
        padding: 8px 10px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .inv-enrich-text {
        line-height: 1.4;
      }

      .inv-enrich-text strong {
        color: var(--wc-text);
      }

      .inv-enrich-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .inv-storage-info {
        margin: 0 16px 8px;
        padding: 6px 10px;
        border-radius: 8px;
        background: var(--wc-bg);
        border: 1px solid var(--wc-border);
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .inv-storage-info.heavy {
        border-color: #c98a00;
      }

      .inv-keep-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .inv-keep-row select {
        padding: 5px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1em;
        cursor: pointer;
      }

      .inv-backup-list {
        max-height: 250px;
        overflow-y: auto;
        margin: 8px 0;
      }

      .inv-backup-row {
        display: flex;
        gap: 4px;
        margin-bottom: 4px;
      }

      .inv-backup-pick {
        flex: 1;
        text-align: left;
        font-size: 0.82em;
        padding: 8px 12px;
      }

      .inv-backup-meta {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
      }

      .inv-backup-del {
        background: none;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        color: var(--wc-text-secondary);
        cursor: pointer;
        padding: 0 10px;
        font-size: 0.9em;
      }

      .inv-backup-del:hover {
        border-color: #c62828;
        color: #c62828;
      }

      .inv-chips {
        display: flex;
        gap: 4px;
        padding: 0 16px 10px;
        flex-wrap: wrap;
      }

      .inv-chip.preset.active {
        background: var(--wc-text-secondary);
        border-color: var(--wc-text-secondary);
      }

      .inv-chip {
        padding: 4px 10px;
        border-radius: 14px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.75em;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .inv-chip:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      .inv-chip.active {
        background: var(--wc-primary);
        color: #fff;
        border-color: var(--wc-primary);
      }

      .inv-list {
        max-height: 55vh;
        overflow-y: auto;
        padding: 0 16px 8px;
      }

      .inv-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--wc-border);
        cursor: pointer;
        transition: background 0.15s;
      }

      .inv-item:hover {
        background: var(--wc-hover);
      }

      .inv-item:last-child {
        border-bottom: none;
      }

      .inv-thumb {
        width: 48px;
        height: 66px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .inv-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .inv-info {
        flex: 1;
        min-width: 0;
      }

      .inv-name {
        font-weight: 600;
        font-size: 0.88em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .inv-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .inv-right {
        text-align: right;
        flex-shrink: 0;
        min-width: 60px;
      }

      .inv-price {
        font-weight: 600;
        font-size: 0.85em;
        color: var(--wc-text);
      }

      .inv-location {
        font-size: 0.72em;
        color: var(--wc-text-secondary);
      }

      .inv-empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .inv-footer {
        display: flex;
        gap: 8px;
        padding: 10px 16px 16px;
        border-top: 1px solid var(--wc-border);
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }

      .inv-count {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .inv-footer-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .inv-btn {
        font-size: 0.76em;
        padding: 5px 12px;
        border-radius: 16px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
      }

      .inv-btn:hover {
        background: var(--wc-hover);
        border-color: var(--wc-text-secondary);
      }

      .inv-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .inv-status {
        width: 100%;
        text-align: center;
        font-size: 0.78em;
        padding: 4px 0 0;
        color: #2e7d32;
        font-weight: 500;
      }

      /* Restore confirm overlay */
      .inv-confirm-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 16px;
      }

      .inv-confirm-box {
        background: var(--wc-bg);
        border-radius: 12px;
        padding: 24px;
        max-width: 380px;
        width: 90%;
        text-align: center;
      }

      .inv-confirm-box h3 {
        margin: 0 0 8px;
        font-size: 1em;
        color: var(--wc-text);
      }

      .inv-confirm-box p {
        margin: 0 0 16px;
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .inv-confirm-stats {
        font-size: 0.82em;
        color: var(--wc-text);
        margin: 0 0 16px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
      }

      .inv-confirm-btns {
        display: flex;
        gap: 8px;
        justify-content: center;
      }

      .inv-confirm-btns button {
        padding: 8px 20px;
        border-radius: 20px;
        border: none;
        font-size: 0.85em;
        cursor: pointer;
        font-weight: 500;
      }

      .inv-confirm-cancel {
        background: var(--wc-hover);
        color: var(--wc-text);
      }

      .inv-confirm-go {
        background: #e65100;
        color: #fff;
      }

      .inv-toggle {
        display: flex;
        margin: 0 16px 8px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        overflow: hidden;
      }

      .inv-toggle button {
        flex: 1;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: var(--wc-text-secondary);
        font-size: 0.82em;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .inv-toggle button.active {
        background: var(--wc-primary);
        color: #fff;
      }

      .inv-history-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-bottom: 1px solid var(--wc-border);
      }

      .inv-history-item:last-child {
        border-bottom: none;
      }

      .inv-reason-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.72em;
        font-weight: 500;
        background: rgba(114, 47, 55, 0.12);
        color: var(--wc-primary);
      }

      @media (max-width: 599px) {
        .inv-controls {
          flex-direction: column;
          gap: 6px;
        }
        .inv-search-wrapper {
          width: 100%;
        }
        .inv-stats {
          gap: 8px;
          font-size: 0.78em;
          padding: 4px 16px 8px;
        }
        .inv-list {
          max-height: 60vh;
        }
        .inv-footer {
          justify-content: center;
        }
        .inv-footer-btns {
          justify-content: center;
        }
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("open") && this.open) {
      // Only the search query is transient. Sort order and filters are
      // restored from localStorage on connect and must survive a reopen —
      // resetting them here would silently undo the saved preferences.
      this._searchQuery = "";
      this._showDetail = false;
      this._detailWine = null;
      this._statusMsg = "";
      this._confirmRestore = false;
      this._confirmEnrich = "";
      this._confirmImport = false;
      this._pendingImport = null;
      this._showServerRestore = false;
      this._restoreData = null;
      this._viewMode = "inventory";
      this._historyItems = [];
    }
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  // ── Preferences (sort + filters survive a reopen) ─────────────

  connectedCallback() {
    super.connectedCallback();
    this._loadPrefs();
  }

  private _loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.sortField) this._sortField = p.sortField;
      if (p.sortDir) this._sortDir = p.sortDir;
      if (p.typeFilter) this._typeFilter = p.typeFilter;
      if (p.dispositionFilter) this._dispositionFilter = p.dispositionFilter;
      if (p.countryFilter) this._countryFilter = p.countryFilter;
      if (p.grapeFilter) this._grapeFilter = p.grapeFilter;
      if (p.foodFilter) this._foodFilter = p.foodFilter;
      if (p.cabinetFilter) this._cabinetFilter = p.cabinetFilter;
      if (typeof p.minRating === "number") this._minRating = p.minRating;
      if (p.maxPrice !== undefined) this._maxPrice = p.maxPrice;
      if (p.vintageMin !== undefined) this._vintageMin = p.vintageMin;
      if (p.vintageMax !== undefined) this._vintageMax = p.vintageMax;
      if (p.preset) this._preset = p.preset;
    } catch {
      // A corrupt or unavailable localStorage must never keep the dialog
      // from opening — fall back to defaults silently.
    }
  }

  private _savePrefs() {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          sortField: this._sortField,
          sortDir: this._sortDir,
          typeFilter: this._typeFilter,
          dispositionFilter: this._dispositionFilter,
          countryFilter: this._countryFilter,
          grapeFilter: this._grapeFilter,
          foodFilter: this._foodFilter,
          cabinetFilter: this._cabinetFilter,
          minRating: this._minRating,
          maxPrice: this._maxPrice,
          vintageMin: this._vintageMin,
          vintageMax: this._vintageMax,
          preset: this._preset,
        })
      );
    } catch {
      // Private browsing / full quota — not worth surfacing.
    }
  }

  private _clearFilters() {
    this._typeFilter = DEFAULT_FILTERS.typeFilter;
    this._dispositionFilter = DEFAULT_FILTERS.dispositionFilter;
    this._countryFilter = DEFAULT_FILTERS.countryFilter;
    this._grapeFilter = DEFAULT_FILTERS.grapeFilter;
    this._foodFilter = DEFAULT_FILTERS.foodFilter;
    this._cabinetFilter = DEFAULT_FILTERS.cabinetFilter;
    this._minRating = DEFAULT_FILTERS.minRating;
    this._maxPrice = DEFAULT_FILTERS.maxPrice;
    this._vintageMin = DEFAULT_FILTERS.vintageMin;
    this._vintageMax = DEFAULT_FILTERS.vintageMax;
    this._preset = DEFAULT_FILTERS.preset;
    this._searchQuery = "";
    this._savePrefs();
  }

  // Everything that is currently narrowing the list, so a persisted filter
  // can never silently hide half the cellar.
  private _activeFilterCount(): number {
    let n = 0;
    if (this._typeFilter !== "all") n++;
    if (this._dispositionFilter !== "all") n++;
    if (this._countryFilter !== "all") n++;
    if (this._grapeFilter !== "all") n++;
    if (this._foodFilter !== "all") n++;
    if (this._cabinetFilter !== "all") n++;
    if (this._minRating > 0) n++;
    if (this._maxPrice !== null) n++;
    if (this._vintageMin !== null) n++;
    if (this._vintageMax !== null) n++;
    if (this._preset !== "all") n++;
    return n;
  }

  // ── Facets ────────────────────────────────────────────────────

  private _countryOptions(): string[] {
    return collectFacet(this.wines, (w) => (w.country ? [w.country] : []));
  }

  private _grapeOptions(): string[] {
    return collectFacet(this.wines, (w) => splitMulti(w.grape_variety));
  }

  // Vivino returns pairings from a closed vocabulary ("Beef", "Blue cheese",
  // "Spicy food"…), so offering the ones actually present in the cellar beats
  // hoping the user guesses the exact wording.
  private _foodOptions(): string[] {
    return collectFacet(this.wines, (w) => splitMulti(w.food_pairings));
  }

  private _winesWithoutPairings(): number {
    return this.wines.filter((w) => !splitMulti(w.food_pairings).length).length;
  }

  // ── Enrichment ────────────────────────────────────────────────

  // Vivino is the *only* source of food pairings; it also supplies the
  // description. Rating and photo are deliberately not part of the test —
  // Vivino has no match for plenty of bottles, and a wine that will never
  // gain a photo must not sit in this list forever nagging the user.
  // `vivino_updated_at` drops a wine out once it has actually been looked up.
  private _winesNeedingVivino(): Wine[] {
    return this.wines.filter(
      (w) => !w.vivino_updated_at && (!w.food_pairings || !w.description)
    );
  }

  // The AI supplies the drinking verdict and window; it never returns food
  // pairings. Critic scores are excluded for the same reason as the photo
  // above — the AI legitimately has none for many wines.
  private _winesNeedingAI(): Wine[] {
    return this.wines.filter((w) => !w.ai_updated_at && (!w.disposition || !w.drink_window));
  }

  private async _runEnrich(source: "vivino" | "ai") {
    const wines = source === "vivino" ? this._winesNeedingVivino() : this._winesNeedingAI();
    this._confirmEnrich = "";
    if (!wines.length) return;

    this._enriching = source;
    this._statusMsg = `Refreshing ${wines.length} wines via ${source === "vivino" ? "Vivino" : "AI"}…`;
    try {
      const result = await this.hass.callWS({
        type: source === "vivino" ? "wine_cellar/batch_refresh_vivino" : "wine_cellar/batch_analyze_wines",
        wine_ids: wines.map((w) => w.id),
      });
      if (result?.error) {
        this._statusMsg = `Refresh failed: ${result.error}`;
      } else {
        const updated = result?.updated ?? 0;
        const errors = result?.errors ?? 0;
        this._statusMsg =
          `Updated ${updated} of ${result?.total ?? wines.length} wines` +
          (errors ? ` — ${errors} could not be looked up.` : ".");
        this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
      }
    } catch (err: any) {
      this._statusMsg = `Refresh failed: ${err.message || err}`;
    }
    this._enriching = "";
  }

  // ── Filtering & sorting ───────────────────────────────────────

  private _matchesPreset(wine: Wine, currentYear: number, recentCutoff: string): boolean {
    switch (this._preset) {
      case "drink_this_year": {
        if (wine.disposition === "P") return false;
        const year = drinkByYear(wine);
        return year !== null ? year <= currentYear : wine.disposition === "D";
      }
      case "past_peak":
        return wine.disposition === "P";
      case "unrated":
        return !wine.user_rating;
      case "incomplete":
        return (
          !wine.food_pairings || !wine.description || !wine.drink_window || !wine.image_url
        );
      case "recent":
        return !!wine.added_at && wine.added_at >= recentCutoff;
      default:
        return true;
    }
  }

  private _getFilteredAndSortedWines(): Wine[] {
    let wines = [...this.wines];

    if (this._typeFilter !== "all") {
      wines = wines.filter((w) => w.type === this._typeFilter);
    }

    if (this._dispositionFilter !== "all") {
      const want = this._dispositionFilter;
      wines = wines.filter((w) =>
        want === "none" ? !w.disposition : w.disposition === want
      );
    }

    if (this._countryFilter !== "all") {
      const want = normalizeText(this._countryFilter);
      wines = wines.filter((w) => normalizeText(w.country) === want);
    }

    if (this._grapeFilter !== "all") {
      const want = normalizeText(this._grapeFilter);
      wines = wines.filter((w) => normalizeText(w.grape_variety).includes(want));
    }

    if (this._foodFilter !== "all") {
      const want = normalizeText(this._foodFilter);
      wines = wines.filter((w) => normalizeText(w.food_pairings).includes(want));
    }

    if (this._cabinetFilter !== "all") {
      const known = new Set(this.cabinets.map((c) => c.id));
      wines = wines.filter((w) =>
        this._cabinetFilter === "unassigned"
          ? !w.cabinet_id || !known.has(w.cabinet_id)
          : w.cabinet_id === this._cabinetFilter
      );
    }

    if (this._minRating > 0) {
      wines = wines.filter((w) => (w.rating || 0) >= this._minRating);
    }

    // "Under X" can only be answered for wines that actually carry a price —
    // an unpriced bottle is unknown, not cheap.
    if (this._maxPrice !== null) {
      const max = this._maxPrice;
      wines = wines.filter((w) => {
        const price = w.retail_price || w.price;
        return !!price && price <= max;
      });
    }

    if (this._vintageMin !== null) {
      const min = this._vintageMin;
      wines = wines.filter((w) => w.vintage !== null && w.vintage >= min);
    }
    if (this._vintageMax !== null) {
      const max = this._vintageMax;
      wines = wines.filter((w) => w.vintage !== null && w.vintage <= max);
    }

    if (this._preset !== "all") {
      const currentYear = new Date().getFullYear();
      const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
      wines = wines.filter((w) => this._matchesPreset(w, currentYear, cutoff));
    }

    if (this._searchQuery) {
      wines = wines.filter((w) => matchesQuery(w, this._searchQuery, this.cabinets));
    }

    const dir = this._sortDir === "asc" ? 1 : -1;
    wines.sort((a, b) => {
      switch (this._sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "winery":
          return dir * (a.winery || "").localeCompare(b.winery || "");
        case "vintage":
          return dir * ((a.vintage || 0) - (b.vintage || 0));
        case "type":
          return dir * (a.type || "").localeCompare(b.type || "");
        case "rating":
          return dir * ((a.rating || 0) - (b.rating || 0));
        case "user_rating":
          return dir * ((a.user_rating || 0) - (b.user_rating || 0));
        case "price":
          return dir * ((a.retail_price || a.price || 0) - (b.retail_price || b.price || 0));
        case "drink_by":
          return compareNullable(drinkByYear(a), drinkByYear(b), dir, (x, y) => x - y);
        case "urgency": {
          // Past peak first, then drink-now, then hold, then unanalyzed —
          // within a bucket, the soonest drink-by year leads.
          const rank = (w: Wine) =>
            w.disposition === "P" ? 0 : w.disposition === "D" ? 1 : w.disposition === "H" ? 2 : 3;
          const byRank = rank(a) - rank(b);
          if (byRank !== 0) return dir * byRank;
          return compareNullable(drinkByYear(a), drinkByYear(b), dir, (x, y) => x - y);
        }
        case "purchase_date":
          return compareNullable(
            a.purchase_date || null,
            b.purchase_date || null,
            dir,
            (x, y) => x.localeCompare(y)
          );
        case "added_at":
          return dir * (a.added_at || "").localeCompare(b.added_at || "");
        case "cabinet": {
          const cabA = this.cabinets.find((c) => c.id === a.cabinet_id)?.name || "";
          const cabB = this.cabinets.find((c) => c.id === b.cabinet_id)?.name || "";
          return dir * cabA.localeCompare(cabB);
        }
        default:
          return 0;
      }
    });

    return wines;
  }

  private _computeStats(wines: Wine[]) {
    const count = wines.length;
    let totalValue = 0;
    const byType: Record<string, number> = {};

    for (const w of wines) {
      if (w.retail_price) totalValue += w.retail_price;
      else if (w.price) totalValue += w.price;
      const t = w.type || "unknown";
      byType[t] = (byType[t] || 0) + 1;
    }

    return { count, totalValue, byType };
  }

  // ── History ──────────────────────────────────────────────────

  private async _switchToHistory() {
    this._viewMode = "history";
    this._historyLoading = true;
    this._loadStorageInfo();
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/get_wine_history" });
      this._historyItems = (result?.history || []).sort(
        (a: WineHistoryItem, b: WineHistoryItem) =>
          (b.removed_at || "").localeCompare(a.removed_at || "")
      );
    } catch (err) {
      console.error("Failed to load wine history", err);
      this._historyItems = [];
    }
    this._historyLoading = false;
  }

  private async _clearHistory() {
    try {
      await this.hass.callWS({ type: "wine_cellar/clear_wine_history" });
      this._historyItems = [];
      this._loadStorageInfo();
      this._statusMsg = "History cleared";
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  }

  private async _restoreFromHistory(historyId: string) {
    try {
      await this.hass.callWS({ type: "wine_cellar/restore_wine", history_id: historyId });
      this._historyItems = this._historyItems.filter((i) => i.id !== historyId);
      this._statusMsg = "Wine restored to Unassigned";
      this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
    } catch (err) {
      console.error("Failed to restore wine from history", err);
      this._statusMsg = "Failed to restore wine";
    }
  }

  private _formatReason(reason: string): string {
    const map: Record<string, string> = {
      drank: "Drank", gifted: "Gifted", sold: "Sold",
      broken: "Broken", spoiled: "Spoiled", other: "Other",
    };
    return map[reason] || reason;
  }

  private _formatDate(iso: string): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch { return iso; }
  }

  private _renderHistory() {
    if (this._historyLoading) {
      return html`<div class="inv-empty">Loading history...</div>`;
    }
    if (this._historyItems.length === 0) {
      return html`
        ${this._renderStorageInfo()}
        <div class="inv-empty">No removal history yet</div>
        <div class="inv-footer">
          <span class="inv-count">0 wines removed</span>
        </div>
      `;
    }
    return html`
      ${this._renderStorageInfo()}
      <div class="inv-list">
        ${this._historyItems.map(item => html`
          <div class="inv-history-item">
            ${item.image_url
              ? html`<img class="inv-thumb" src="${item.image_url}" alt="" loading="lazy" />`
              : html`<div class="inv-dot" style="background:${WINE_TYPE_COLORS[item.type as WineType] || "#999"}"></div>`}
            <div class="inv-info">
              <div class="inv-name">${item.name}</div>
              <div class="inv-meta">
                ${item.winery}${item.vintage ? ` · ${item.vintage}` : ""}
                · <span class="inv-reason-badge">${this._formatReason(item.reason)}</span>
              </div>
            </div>
            <div class="inv-right">
              ${item.price ? html`<div class="inv-price">${this.currency} ${item.price.toFixed(0)}</div>` : nothing}
              <div class="inv-location">${this._formatDate(item.removed_at)}</div>
              <button class="inv-btn" style="margin-top:4px" @click=${() => this._restoreFromHistory(item.id)}>Restore</button>
            </div>
          </div>
        `)}
      </div>
      <div class="inv-footer">
        <span class="inv-count">${this._historyItems.length} wines removed</span>
        ${this._statusMsg
          ? html`<div class="inv-status">${this._statusMsg}</div>`
          : nothing}
        <div class="inv-footer-btns">
          <button class="inv-btn" @click=${this._clearHistory}>Clear History</button>
        </div>
      </div>
    `;
  }

  // Sits under the list: how many bottles are still missing data, and the two
  // actions that can fill it. Each source is labelled with what it actually
  // supplies, so nobody runs AI hoping for food pairings.
  private _renderEnrichBar() {
    const needVivino = this._winesNeedingVivino().length;
    const needAI = this._winesNeedingAI().length;
    if (!needVivino && !needAI) return nothing;
    const busy = !!this._enriching;

    return html`
      <div class="inv-enrich">
        <span class="inv-enrich-text">
          ${needVivino
            ? html`<strong>${needVivino}</strong> never looked up on Vivino (pairings,
                description)`
            : nothing}${needVivino && needAI ? " · " : ""}${needAI
            ? html`<strong>${needAI}</strong> never analyzed by AI (drink window,
                verdict)`
            : nothing}
        </span>
        <span class="inv-enrich-btns">
          ${needVivino
            ? html`<button
                class="inv-btn"
                ?disabled=${busy}
                @click=${() => (this._confirmEnrich = "vivino")}
              >
                ${this._enriching === "vivino" ? "Filling…" : `Fill from Vivino (${needVivino})`}
              </button>`
            : nothing}
          ${needAI && this.hasGemini
            ? html`<button
                class="inv-btn"
                ?disabled=${busy}
                @click=${() => (this._confirmEnrich = "ai")}
              >
                ${this._enriching === "ai" ? "Analyzing…" : `Analyze with AI (${needAI})`}
              </button>`
            : nothing}
        </span>
      </div>
    `;
  }

  private _renderEnrichConfirm() {
    if (!this._confirmEnrich) return nothing;
    const source = this._confirmEnrich;
    const count =
      source === "vivino" ? this._winesNeedingVivino().length : this._winesNeedingAI().length;
    return html`
      <div class="inv-confirm-overlay" @click=${() => (this._confirmEnrich = "")}>
        <div class="inv-confirm-box" @click=${(e: Event) => e.stopPropagation()}>
          <h3>${source === "vivino" ? "🍇 Fill from Vivino?" : "🤖 Analyze with AI?"}</h3>
          <p>
            ${count} wine${count > 1 ? "s" : ""} will be looked up one at a time. This is a
            slow, rate-limited network call — expect it to run for a while, and leave the
            dialog open until it finishes.
          </p>
          <div class="inv-confirm-stats">
            ${source === "vivino"
              ? "Fills food pairings, description, rating and the label photo where Vivino has them. Existing values are kept."
              : "Fills the drinking verdict, drink window and critic scores where the AI can infer them. Existing values are kept."}
          </div>
          <div class="inv-confirm-btns">
            <button class="inv-confirm-cancel" @click=${() => (this._confirmEnrich = "")}>
              Cancel
            </button>
            <button class="inv-confirm-go" @click=${() => this._runEnrich(source)}>
              Start
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderStorageInfo() {
    const info = this._storageInfo;
    if (!info) return nothing;
    const share = info.total_bytes
      ? Math.round((info.history_bytes / info.total_bytes) * 100)
      : 0;
    const heavy = info.history_bytes > 512 * 1024;
    return html`
      <div class="inv-storage-info ${heavy ? "heavy" : ""}">
        Database ${this._formatBytes(info.total_bytes)} ·
        history ${this._formatBytes(info.history_bytes)} (${share}%) ·
        ${info.wines_count} wines, ${info.history_count} archived
        ${heavy
          ? html`<br /><small
              >Home Assistant rewrites this whole file on every change —
              clearing old history speeds up every edit.</small
            >`
          : nothing}
      </div>
    `;
  }

  // ── Export CSV ─────────────────────────────────────────────────

  private _exportCSV() {
    const wines = this._getFilteredAndSortedWines();
    const headers = [
      "ID",
      "Name", "Winery", "Vintage", "Type", "Region", "Country",
      "Grape Variety", "Rating", "Ratings Count", "Purchase Price",
      "Retail Price", "Purchase Date", "Drink By", "Drink Window",
      "Disposition", "Notes", "Description", "Food Pairings",
      "Alcohol", "Cabinet", "Row", "Col", "Zone", "Depth",
      "User Rating", "Added At",
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = wines.map((w) =>
      [
        w.id,
        w.name, w.winery, w.vintage, w.type, w.region, w.country,
        w.grape_variety, w.rating, w.ratings_count, w.price,
        w.retail_price, w.purchase_date, w.drink_by, w.drink_window,
        w.disposition, w.notes, w.description, w.food_pairings,
        w.alcohol,
        this.cabinets.find((c) => c.id === w.cabinet_id)?.name || "",
        w.row !== null ? w.row + 1 : "",
        w.col !== null ? w.col + 1 : "",
        w.zone, w.depth, w.user_rating, w.added_at,
      ]
        .map(escapeCSV)
        .join(",")
    );

    // Excel only recognizes a CSV as UTF-8 when it starts with a BOM;
    // without it every accented wine name comes back mangled.
    const csv = "\ufeff" + [headers.join(","), ...rows].join("\n");
    this._downloadFile(
      csv,
      `wine-cellar-inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8;"
    );
  }

  // ── Backup JSON ───────────────────────────────────────────────

  private async _backupJSON() {
    this._backingUp = true;
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/get_backup" });
      const json = JSON.stringify(result, null, 2);
      this._downloadFile(
        json,
        `wine-cellar-backup-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json"
      );
      this._statusMsg = `Backup saved — ${result.wines?.length || 0} wines, ${result.cabinets?.length || 0} racks, ${result.buy_list?.length || 0} buy list`;
    } catch (err: any) {
      this._statusMsg = `Backup failed: ${err.message || err}`;
    }
    this._backingUp = false;
  }

  // ── Import CSV ────────────────────────────────────────────────

  private _triggerImportCSV() {
    const input = this.shadowRoot?.querySelector("#inv-csv-input") as HTMLInputElement;
    if (input) {
      input.value = "";
      input.click();
    }
  }

  private async _handleImportCSV(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this._statusMsg = "";

    let wines: any[];
    try {
      wines = this._parseCSV(await file.text());
    } catch (err: any) {
      this._statusMsg = `Import failed: ${err.message || err}`;
      return;
    }

    if (wines.length === 0) {
      this._statusMsg = "No wines found in CSV file.";
      return;
    }

    // A CSV exported from here carries each bottle's ID. When those IDs match
    // wines already in the cellar the user almost certainly edited an export
    // (bulk price or drinking-window changes) and wants those bottles
    // updated, not duplicated — so ask instead of silently doubling the cellar.
    const knownIds = new Set(this.wines.map((w) => w.id));
    this._importMatches = wines.filter((w) => w.id && knownIds.has(w.id)).length;

    if (this._importMatches > 0) {
      this._pendingImport = wines;
      this._confirmImport = true;
      return;
    }

    await this._runImport(wines, "add");
  }

  private async _runImport(wines: any[], mode: "add" | "update") {
    this._confirmImport = false;
    this._pendingImport = null;
    this._importing = true;
    this._statusMsg = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/import_wines",
        wines,
        mode,
      });

      const added = result.imported || 0;
      const updated = result.updated || 0;
      const skipped = result.location_skipped || 0;
      const base = updated
        ? `Updated ${updated} wines${added ? `, added ${added} new` : ""}.`
        : `Imported ${added} wines successfully!`;
      this._statusMsg = skipped
        ? `${base} ${skipped} row${skipped > 1 ? "s" : ""} kept their previous spot — the location given was unknown, out of range or already taken.`
        : base;
      this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
    } catch (err: any) {
      this._statusMsg = `Import failed: ${err.message || err}`;
    }
    this._importing = false;
  }

  private _parseCSV(text: string): any[] {
    const rows = this._parseCSVRows(text.replace(/^\ufeff/, ""));
    if (rows.length < 2) return [];

    // Parse header row
    const headers = rows[0].map((h) => h.trim().toLowerCase());

    // Map CSV headers to wine fields
    const fieldMap: Record<string, string> = {
      name: "name",
      winery: "winery",
      vintage: "vintage",
      type: "type",
      region: "region",
      country: "country",
      "grape variety": "grape_variety",
      grape_variety: "grape_variety",
      rating: "rating",
      "ratings count": "ratings_count",
      ratings_count: "ratings_count",
      "purchase price": "price",
      price: "price",
      "retail price": "retail_price",
      retail_price: "retail_price",
      "purchase date": "purchase_date",
      purchase_date: "purchase_date",
      "drink by": "drink_by",
      drink_by: "drink_by",
      "drink window": "drink_window",
      drink_window: "drink_window",
      disposition: "disposition",
      notes: "notes",
      description: "description",
      "food pairings": "food_pairings",
      food_pairings: "food_pairings",
      alcohol: "alcohol",
      zone: "zone",
      "user rating": "user_rating",
      user_rating: "user_rating",
      barcode: "barcode",
      id: "id",
      depth: "depth",
      cabinet: "cabinet",
      row: "row",
      col: "col",
      "added at": "added_at",
      added_at: "added_at",
    };

    const numericFields = new Set([
      "vintage", "rating", "ratings_count", "price",
      "retail_price", "user_rating", "depth", "row", "col",
    ]);

    const wines: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length === 0) continue;

      const wine: any = {};
      for (let j = 0; j < headers.length && j < values.length; j++) {
        const field = fieldMap[headers[j]];
        if (!field) continue;
        let val: any = values[j].trim();
        if (!val) continue;

        if (numericFields.has(field)) {
          const num = parseFloat(val);
          if (!isNaN(num)) val = num;
          else continue;
        }

        wine[field] = val;
      }

      // Validate wine type
      if (wine.type) {
        const validTypes = ["red", "white", "rosé", "sparkling", "dessert"];
        const lt = wine.type.toLowerCase();
        if (validTypes.includes(lt)) {
          wine.type = lt;
        } else {
          wine.type = "red";
        }
      }

      if (wine.name) {
        wines.push(wine);
      }
    }

    return wines;
  }

  // Quote-aware: a comma or newline inside a quoted field (as produced by
  // escapeCSV for multi-line Notes/Description) does not end the field/row.
  private _parseCSVRows(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;

    const endField = () => {
      row.push(field);
      field = "";
    };
    const endRow = () => {
      endField();
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    };

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        endField();
      } else if (ch === "\r") {
        // skip, \n (or end of text) closes the row
      } else if (ch === "\n") {
        endRow();
      } else {
        field += ch;
      }
    }
    if (field !== "" || row.length > 0) endRow();

    return rows;
  }

  // ── Restore JSON ──────────────────────────────────────────────

  private _triggerRestore() {
    const input = this.shadowRoot?.querySelector("#inv-json-input") as HTMLInputElement;
    if (input) {
      input.value = "";
      input.click();
    }
  }

  private async _handleRestoreFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.wines || !Array.isArray(data.wines)) {
        this._statusMsg = "Invalid backup file: missing wines array.";
        return;
      }
      if (!data.cabinets || !Array.isArray(data.cabinets)) {
        this._statusMsg = "Invalid backup file: missing cabinets array.";
        return;
      }

      this._restoreData = data;
      this._confirmRestore = true;
    } catch (err: any) {
      this._statusMsg = `Invalid JSON file: ${err.message || err}`;
    }
  }

  private async _executeRestore() {
    if (!this._restoreData) return;

    this._confirmRestore = false;
    this._restoring = true;
    this._statusMsg = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/restore_backup",
        backup: this._restoreData,
      });

      if (result.error) {
        this._statusMsg = `Restore failed: ${result.error}`;
      } else {
        this._statusMsg = `Restored ${result.wines} wines, ${result.cabinets} racks, ${result.buy_list} buy list items!`;
        this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
      }
    } catch (err: any) {
      this._statusMsg = `Restore failed: ${err.message || err}`;
    }

    this._restoring = false;
    this._restoreData = null;
  }

  // ── Cloud Sync (Google Drive / file system) ──────────────────

  private async _serverBackupSave() {
    this._serverBackingUp = true;
    this._serverBackupLabel = "Saving…";
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/server_backup_save" });
      if (result && result.error) {
        this._statusMsg = `Server backup failed: ${result.error}`;
        this._serverBackupLabel = "";
      } else {
        this._statusMsg = `Saved ${result?.wines ?? "?"} wines, ${result?.cabinets ?? "?"} racks to server`;
        this._serverBackupLabel = "✅ Saved!";
        setTimeout(() => { this._serverBackupLabel = ""; }, 4000);
      }
    } catch (err: any) {
      this._statusMsg = `Server backup failed: ${err.message || err}`;
      this._serverBackupLabel = "";
    }
    this._serverBackingUp = false;
  }

  private async _serverBackupShowRestore() {
    this._showServerRestore = true;
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/server_backup_list" });
      this._serverBackups = result?.backups || [];
      if (typeof result?.keep === "number") this._backupKeep = result.keep;
      if (Array.isArray(result?.keep_choices)) this._backupKeepChoices = result.keep_choices;
    } catch (err: any) {
      this._statusMsg = `Failed to list backups: ${err.message || err}`;
      this._serverBackups = [];
    }
  }

  private _formatBytes(bytes: number): string {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private async _setBackupKeep(keep: number) {
    this._backupKeep = keep;
    try {
      await this.hass.callWS({
        type: "wine_cellar/update_settings",
        updates: { server_backup_keep: keep },
      });
      this._statusMsg =
        keep === 0
          ? "Keeping every server backup."
          : `Keeping the ${keep} most recent server backups.`;
    } catch (err: any) {
      this._statusMsg = `Could not save retention: ${err.message || err}`;
    }
  }

  private async _serverBackupDelete(filename: string) {
    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/server_backup_delete",
        filename,
      });
      if (result?.error) {
        this._statusMsg = `Delete failed: ${result.error}`;
        return;
      }
      this._serverBackups = this._serverBackups.filter((b: any) => b.filename !== filename);
      this._statusMsg = `Deleted ${filename}`;
    } catch (err: any) {
      this._statusMsg = `Delete failed: ${err.message || err}`;
    }
  }

  private async _loadStorageInfo() {
    try {
      this._storageInfo = await this.hass.callWS({ type: "wine_cellar/get_storage_info" });
    } catch {
      this._storageInfo = null;
    }
  }

  private async _serverBackupRestore(filename: string) {
    this._showServerRestore = false;
    this._serverRestoring = true;
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/server_backup_restore", filename });
      if (result.error) {
        this._statusMsg = `Restore failed: ${result.error}`;
      } else {
        this._statusMsg = `Restored ${result.wines} wines, ${result.cabinets} racks from ${filename}`;
        this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
      }
    } catch (err: any) {
      this._statusMsg = `Restore failed: ${err.message || err}`;
    }
    this._serverRestoring = false;
  }

  // ── Helpers ───────────────────────────────────────────────────

  private _downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private _showWineDetail(wine: Wine) {
    this._detailWine = wine;
    this._showDetail = true;
  }

  // Parses a number input back to `null` when emptied, so clearing a bound
  // actually removes the filter instead of turning it into 0.
  private _numberOrNull(e: Event): number | null {
    const raw = (e.target as HTMLInputElement).value.trim();
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private _renderFilterPanel(missingPairings: number) {
    const foodOptions = this._foodOptions();
    const countryOptions = this._countryOptions();
    const grapeOptions = this._grapeOptions();

    return html`
      <div class="inv-filter-panel">
        <label class="inv-filter-field">
          <span>Ready to drink</span>
          <select
            @change=${(e: Event) => {
              this._dispositionFilter = (e.target as HTMLSelectElement).value;
              this._savePrefs();
            }}
          >
            <option value="all" ?selected=${this._dispositionFilter === "all"}>Any</option>
            <option value="D" ?selected=${this._dispositionFilter === "D"}>Drink now</option>
            <option value="H" ?selected=${this._dispositionFilter === "H"}>Hold</option>
            <option value="P" ?selected=${this._dispositionFilter === "P"}>Past peak</option>
            <option value="none" ?selected=${this._dispositionFilter === "none"}>
              Not analyzed
            </option>
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Pairs with</span>
          <select
            @change=${(e: Event) => {
              this._foodFilter = (e.target as HTMLSelectElement).value;
              this._savePrefs();
            }}
          >
            <option value="all" ?selected=${this._foodFilter === "all"}>Any food</option>
            ${foodOptions.map(
              (f) => html`<option value=${f} ?selected=${this._foodFilter === f}>${f}</option>`
            )}
          </select>
          ${missingPairings
            ? html`<small class="inv-filter-hint"
                >${missingPairings} wine${missingPairings > 1 ? "s have" : " has"} no pairing
                data. Only Vivino supplies pairings — use “Fill from Vivino” below the
                list.</small
              >`
            : nothing}
        </label>

        <label class="inv-filter-field">
          <span>Country</span>
          <select
            @change=${(e: Event) => {
              this._countryFilter = (e.target as HTMLSelectElement).value;
              this._savePrefs();
            }}
          >
            <option value="all" ?selected=${this._countryFilter === "all"}>Any</option>
            ${countryOptions.map(
              (c) => html`<option value=${c} ?selected=${this._countryFilter === c}>${c}</option>`
            )}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Grape</span>
          <select
            @change=${(e: Event) => {
              this._grapeFilter = (e.target as HTMLSelectElement).value;
              this._savePrefs();
            }}
          >
            <option value="all" ?selected=${this._grapeFilter === "all"}>Any</option>
            ${grapeOptions.map(
              (g) => html`<option value=${g} ?selected=${this._grapeFilter === g}>${g}</option>`
            )}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Cabinet</span>
          <select
            @change=${(e: Event) => {
              this._cabinetFilter = (e.target as HTMLSelectElement).value;
              this._savePrefs();
            }}
          >
            <option value="all" ?selected=${this._cabinetFilter === "all"}>Any</option>
            ${this.cabinets.map(
              (c) =>
                html`<option value=${c.id} ?selected=${this._cabinetFilter === c.id}>
                  ${c.name}
                </option>`
            )}
            <option value="unassigned" ?selected=${this._cabinetFilter === "unassigned"}>
              Unassigned
            </option>
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Min rating</span>
          <select
            @change=${(e: Event) => {
              this._minRating = Number((e.target as HTMLSelectElement).value);
              this._savePrefs();
            }}
          >
            ${[0, 3, 3.5, 4, 4.5].map(
              (r) =>
                html`<option value=${r} ?selected=${this._minRating === r}>
                  ${r === 0 ? "Any" : `★ ${r}+`}
                </option>`
            )}
          </select>
        </label>

        <label class="inv-filter-field">
          <span>Max price</span>
          <input
            type="number"
            min="0"
            placeholder="Any"
            .value=${this._maxPrice === null ? "" : String(this._maxPrice)}
            @change=${(e: Event) => {
              this._maxPrice = this._numberOrNull(e);
              this._savePrefs();
            }}
          />
          <small class="inv-filter-hint">Priced wines only.</small>
        </label>

        <label class="inv-filter-field">
          <span>Vintage</span>
          <div class="inv-filter-range">
            <input
              type="number"
              placeholder="From"
              .value=${this._vintageMin === null ? "" : String(this._vintageMin)}
              @change=${(e: Event) => {
                this._vintageMin = this._numberOrNull(e);
                this._savePrefs();
              }}
            />
            <input
              type="number"
              placeholder="To"
              .value=${this._vintageMax === null ? "" : String(this._vintageMax)}
              @change=${(e: Event) => {
                this._vintageMax = this._numberOrNull(e);
                this._savePrefs();
              }}
            />
          </div>
        </label>
      </div>
    `;
  }

  private _renderWineItem(wine: Wine) {
    const typeColor = WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red;
    const location = getWineLocation(wine, this.cabinets).text;
    // Sorting by drink-by is useless if the value stays invisible.
    const drinkBy = drinkByYear(wine);
    const displayPrice = wine.retail_price || wine.price;
    // A retail_price keeps the currency it was actually captured in — show
    // that instead of the globally selected one, or a stale price ends up
    // mislabeled as if it were in the new currency.
    const displayCurrency = wine.retail_price ? (wine.retail_price_currency || this.currency) : this.currency;

    return html`
      <div class="inv-item" @click=${() => this._showWineDetail(wine)}>
        ${wine.image_url
          ? html`<img class="inv-thumb" src="${wine.image_url}" alt="" loading="lazy" />`
          : html`<div class="inv-dot" style="background: ${typeColor}"></div>`}
        <div class="inv-info">
          <div class="inv-name">${wine.name}</div>
          <div class="inv-meta">
            ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}${wine.rating
              ? ` · ★${wine.rating.toFixed(1)}`
              : ""}${wine.disposition
              ? html` ·
                  <span
                    style="color: ${wine.disposition === "D"
                      ? "#2e7d32"
                      : wine.disposition === "H"
                        ? "#1565c0"
                        : wine.disposition === "P"
                          ? "#c62828"
                          : "inherit"}"
                    >${wine.disposition === "D"
                      ? "Drink"
                      : wine.disposition === "H"
                        ? "Hold"
                        : wine.disposition === "P"
                          ? "Past Peak"
                          : ""}</span
                  >`
              : nothing}${drinkBy
              ? html` · <span class="inv-drink-by">by ${drinkBy}</span>`
              : nothing}
          </div>
        </div>
        <div class="inv-right">
          ${displayPrice ? html`<div class="inv-price">${displayCurrency} ${displayPrice.toFixed(0)}</div>` : nothing}
          <div class="inv-location">${location}</div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    const filteredWines = this._getFilteredAndSortedWines();
    const activeFilters = this._activeFilterCount();
    const narrowed = activeFilters > 0 || !!this._searchQuery;
    // With a filter on, cellar-wide totals are the wrong answer: the point of
    // narrowing is to know what the *selection* holds and what it is worth.
    const allStats = this._computeStats(narrowed ? filteredWines : this.wines);
    const missingPairings = this._winesWithoutPairings();

    const sortOptions: { value: SortField; label: string }[] = [
      { value: "name", label: "Name" },
      { value: "winery", label: "Winery" },
      { value: "vintage", label: "Vintage" },
      { value: "type", label: "Type" },
      { value: "rating", label: "Rating" },
      { value: "user_rating", label: "My Rating" },
      { value: "price", label: "Price" },
      { value: "drink_by", label: "Drink By" },
      { value: "urgency", label: "Urgency" },
      { value: "purchase_date", label: "Purchase Date" },
      { value: "added_at", label: "Date Added" },
      { value: "cabinet", label: "Cabinet" },
    ];

    const presets: { id: Preset; label: string }[] = [
      { id: "all", label: "All" },
      { id: "drink_this_year", label: "Drink this year" },
      { id: "past_peak", label: "Past peak" },
      { id: "unrated", label: "Not rated" },
      { id: "incomplete", label: "Incomplete" },
      { id: "recent", label: "Added recently" },
    ];

    const filters: { id: string; label: string }[] = [
      { id: "all", label: "All" },
      { id: "red", label: "Red" },
      { id: "white", label: "White" },
      { id: "rosé", label: "Rosé" },
      { id: "sparkling", label: "Sparkling" },
      { id: "dessert", label: "Dessert" },
    ];

    const busy = this._importing || this._restoring || this._backingUp || this._serverBackingUp || this._serverRestoring;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:800px;position:relative" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Header -->
          <div class="inv-header">
            <span class="inv-header-title">📦 Inventory</span>
            <button class="inv-close" @click=${this._close}>✕</button>
          </div>

          <!-- Inventory / History Toggle -->
          <div class="inv-toggle">
            <button
              class="${this._viewMode === "inventory" ? "active" : ""}"
              @click=${() => { this._viewMode = "inventory"; }}
            >Inventory</button>
            <button
              class="${this._viewMode === "history" ? "active" : ""}"
              @click=${() => this._switchToHistory()}
            >History</button>
          </div>

          ${this._viewMode === "history" ? this._renderHistory() : html`
          <!-- Summary Stats -->
          <div class="inv-stats">
            <div class="stat">
              <span class="stat-value">${allStats.count}</span>
              ${narrowed ? `of ${this.wines.length} bottles` : "bottles"}
            </div>
            ${allStats.totalValue
              ? html`
                  <div class="stat">
                    <span class="stat-value"
                      >${this.currency} ${allStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span
                    >
                    est. value
                  </div>
                `
              : nothing}
            ${Object.entries(allStats.byType).map(
              ([type, count]) => html`
                <div class="stat">
                  <span
                    class="inv-type-dot-sm"
                    style="background:${WINE_TYPE_COLORS[type as WineType] || "#999"}"
                  ></span>
                  <span class="stat-value">${count}</span>
                  ${WINE_TYPE_LABELS[type as WineType] || type}
                </div>
              `
            )}
          </div>

          <!-- Search + Sort -->
          <div class="inv-controls">
            <div class="inv-search-wrapper">
              <span class="inv-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search wines..."
                .value=${this._searchQuery}
                @input=${(e: InputEvent) => {
                  this._searchQuery = (e.target as HTMLInputElement).value;
                }}
              />
            </div>
            <div class="inv-sort">
              <select
                @change=${(e: Event) => {
                  this._sortField = (e.target as HTMLSelectElement).value as SortField;
                  this._savePrefs();
                }}
              >
                ${sortOptions.map(
                  (o) =>
                    html`<option value=${o.value} ?selected=${this._sortField === o.value}>
                      ${o.label}
                    </option>`
                )}
              </select>
              <button
                class="inv-sort-dir"
                @click=${() => {
                  this._sortDir = this._sortDir === "asc" ? "desc" : "asc";
                  this._savePrefs();
                }}
                title="${this._sortDir === "asc" ? "Ascending" : "Descending"}"
              >
                ${this._sortDir === "asc" ? "↑" : "↓"}
              </button>
              <button
                class="inv-filter-toggle ${activeFilters ? "active" : ""}"
                @click=${() => {
                  this._showFilters = !this._showFilters;
                }}
                title="More filters"
              >
                ⚙︎ Filters${activeFilters
                  ? html`<span class="inv-filter-badge">${activeFilters}</span>`
                  : nothing}
              </button>
            </div>
          </div>

          <!-- Quick views -->
          <div class="inv-chips">
            ${presets.map(
              (p) => html`
                <button
                  class="inv-chip preset ${this._preset === p.id ? "active" : ""}"
                  @click=${() => {
                    this._preset = p.id;
                    this._savePrefs();
                  }}
                >
                  ${p.label}
                </button>
              `
            )}
          </div>

          <!-- Type Filter Chips -->
          <div class="inv-chips">
            ${filters.map(
              (f) => html`
                <button
                  class="inv-chip ${this._typeFilter === f.id ? "active" : ""}"
                  @click=${() => {
                    this._typeFilter = f.id;
                    this._savePrefs();
                  }}
                >
                  ${f.label}
                </button>
              `
            )}
          </div>

          ${this._showFilters ? this._renderFilterPanel(missingPairings) : nothing}

          ${narrowed
            ? html`
                <div class="inv-active-filters">
                  <span
                    >${filteredWines.length} of ${this.wines.length} wines shown${activeFilters
                      ? ` · ${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`
                      : ""}</span
                  >
                  <button class="inv-clear-filters" @click=${this._clearFilters}>
                    Clear all
                  </button>
                </div>
              `
            : nothing}

          <!-- Wine List -->
          <div class="inv-list">
            ${filteredWines.length === 0
              ? html`<div class="inv-empty">No wines match your search</div>`
              : filteredWines.map((w) => this._renderWineItem(w))}
          </div>

          ${this._renderEnrichBar()}

          <!-- Footer -->
          <div class="inv-footer">
            <span class="inv-count">
              ${filteredWines.length === this.wines.length
                ? `${filteredWines.length} wines`
                : `${filteredWines.length} of ${this.wines.length} wines`}
            </span>
            ${this._statusMsg
              ? html`<div class="inv-status">${this._statusMsg}</div>`
              : nothing}
            <div class="inv-footer-btns">
              <button
                class="inv-btn"
                @click=${this._serverBackupSave}
                ?disabled=${busy}
                title="Save timestamped backup to HA server"
              >
                ${this._serverBackupLabel || "Server Backup"}
              </button>
              <button
                class="inv-btn"
                @click=${this._serverBackupShowRestore}
                ?disabled=${busy}
                title="Restore from a server backup"
              >
                ${this._serverRestoring ? "Restoring…" : "Server Restore"}
              </button>
              <button
                class="inv-btn"
                @click=${this._backupJSON}
                ?disabled=${busy}
                title="Download full cellar backup as JSON"
              >
                ${this._backingUp ? "Saving…" : "Download"}
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerRestore}
                ?disabled=${busy}
                title="Restore cellar from a JSON backup file"
              >
                ${this._restoring ? "Restoring…" : "Upload"}
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerImportCSV}
                ?disabled=${busy}
                title="Import wines from a CSV file"
              >
                ${this._importing ? "Importing…" : "Import CSV"}
              </button>
              <button
                class="inv-btn"
                @click=${this._exportCSV}
                ?disabled=${busy}
                title="Export wines as CSV"
              >
                Export CSV
              </button>
            </div>
          </div>

          `}

          <!-- Hidden file inputs -->
          <input
            type="file"
            id="inv-csv-input"
            accept=".csv"
            style="display:none"
            @change=${this._handleImportCSV}
          />
          <input
            type="file"
            id="inv-json-input"
            accept=".json"
            style="display:none"
            @change=${this._handleRestoreFile}
          />

          <!-- Server Restore Picker Overlay -->
          ${this._showServerRestore
            ? html`
                <div class="inv-confirm-overlay" @click=${() => (this._showServerRestore = false)}>
                  <div class="inv-confirm-box" style="max-width:420px" @click=${(e: Event) => e.stopPropagation()}>
                    <h3>Server Backups</h3>
                    <label class="inv-keep-row">
                      <span>Keep the last</span>
                      <select
                        @change=${(e: Event) =>
                          this._setBackupKeep(Number((e.target as HTMLSelectElement).value))}
                      >
                        ${this._backupKeepChoices.map(
                          (n) => html`<option value=${n} ?selected=${this._backupKeep === n}>
                            ${n === 0 ? "All (never delete)" : `${n} backups`}
                          </option>`
                        )}
                      </select>
                    </label>
                    ${this._serverBackups.length === 0
                      ? html`<p>No server backups found. Use "Server Backup" to create one.</p>`
                      : html`
                        <p>
                          Select a backup to restore — this will <strong>replace</strong> all
                          current data. ${this._serverBackups.length} stored,
                          ${this._formatBytes(
                            this._serverBackups.reduce((t: number, b: any) => t + (b.size || 0), 0)
                          )} on disk.
                        </p>
                        <div class="inv-backup-list">
                          ${this._serverBackups.map(
                            (b: any) => html`
                              <div class="inv-backup-row">
                                <button
                                  class="inv-btn inv-backup-pick"
                                  @click=${() => this._serverBackupRestore(b.filename)}
                                >
                                  <div>${b.timestamp ? new Date(b.timestamp).toLocaleString() : b.filename}</div>
                                  <div class="inv-backup-meta">
                                    ${b.error
                                      ? "unreadable file"
                                      : `${b.wines} wines, ${b.cabinets} racks · ${this._formatBytes(b.size || 0)}`}
                                  </div>
                                </button>
                                <button
                                  class="inv-backup-del"
                                  title="Delete this backup"
                                  @click=${() => this._serverBackupDelete(b.filename)}
                                >
                                  🗑
                                </button>
                              </div>
                            `
                          )}
                        </div>
                      `}
                    <div class="inv-confirm-btns">
                      <button class="inv-confirm-cancel" @click=${() => (this._showServerRestore = false)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              `
            : nothing}

          ${this._renderEnrichConfirm()}

          <!-- CSV Import Mode Overlay -->
          ${this._confirmImport && this._pendingImport
            ? html`
                <div class="inv-confirm-overlay" @click=${() => (this._confirmImport = false)}>
                  <div class="inv-confirm-box" @click=${(e: Event) => e.stopPropagation()}>
                    <h3>📄 Update existing wines?</h3>
                    <p>
                      This CSV looks like an edited export — some rows carry the ID of a
                      wine already in your cellar.
                    </p>
                    <div class="inv-confirm-stats">
                      <strong>${this._importMatches}</strong> row${this._importMatches > 1 ? "s" : ""}
                      match existing wines ·
                      <strong>${this._pendingImport.length - this._importMatches}</strong> new
                      <br />
                      <small>
                        Updating only touches the columns present in the file; blank cells
                        leave the stored value alone.
                      </small>
                    </div>
                    <div class="inv-confirm-btns">
                      <button
                        class="inv-confirm-cancel"
                        @click=${() => this._runImport(this._pendingImport!, "add")}
                      >
                        Add all as new
                      </button>
                      <button
                        class="inv-confirm-go"
                        @click=${() => this._runImport(this._pendingImport!, "update")}
                      >
                        Update ${this._importMatches} wine${this._importMatches > 1 ? "s" : ""}
                      </button>
                    </div>
                  </div>
                </div>
              `
            : nothing}

          <!-- Restore Confirmation Overlay -->
          ${this._confirmRestore && this._restoreData
            ? html`
                <div class="inv-confirm-overlay" @click=${() => (this._confirmRestore = false)}>
                  <div class="inv-confirm-box" @click=${(e: Event) => e.stopPropagation()}>
                    <h3>🔄 Restore Backup?</h3>
                    <p>
                      This will <strong>replace</strong> all your current cellar data with the backup.
                      This action cannot be undone.
                    </p>
                    <div class="inv-confirm-stats">
                      Backup contains:<br />
                      <strong>${this._restoreData.wines?.length || 0}</strong> wines ·
                      <strong>${this._restoreData.cabinets?.length || 0}</strong> racks ·
                      <strong>${this._restoreData.buy_list?.length || 0}</strong> buy list items
                      ${this._restoreData.timestamp
                        ? html`<br /><small>Created: ${new Date(this._restoreData.timestamp).toLocaleString()}</small>`
                        : nothing}
                    </div>
                    <div class="inv-confirm-btns">
                      <button class="inv-confirm-cancel" @click=${() => (this._confirmRestore = false)}>
                        Cancel
                      </button>
                      <button class="inv-confirm-go" @click=${this._executeRestore}>
                        Restore Now
                      </button>
                    </div>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </div>

      <!-- Sub-dialog: Wine Detail -->
      <wine-detail-dialog
        .wine=${this._detailWine}
        .hass=${this.hass}
        .cabinets=${this.cabinets}
        .open=${this._showDetail}
        .hasGemini=${this.hasGemini}
        .mode=${"cellar"}
        @close=${() => (this._showDetail = false)}
        @wine-updated=${() => {
          this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }}
        @locate-wine=${(e: CustomEvent) => {
          this._showDetail = false;
          this.dispatchEvent(new CustomEvent("locate-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @copy-wine=${(e: CustomEvent) => {
          this._showDetail = false;
          this.dispatchEvent(new CustomEvent("copy-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @move-wine=${(e: CustomEvent) => {
          this._showDetail = false;
          this.dispatchEvent(new CustomEvent("move-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
        @remove-wine=${(e: CustomEvent) => {
          this._showDetail = false;
          this.dispatchEvent(new CustomEvent("remove-wine", { detail: e.detail, bubbles: true, composed: true }));
        }}
      ></wine-detail-dialog>
    `;
  }
}
