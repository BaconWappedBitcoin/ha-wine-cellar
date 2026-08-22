import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  Wine,
  Cabinet,
  BarcodeLookupResult,
  StorageRow,
  WineType,
  WINE_TYPE_LABELS,
} from "../models";
import { sharedStyles } from "../styles";
import { resizeImageForStorage } from "../utils/image";
import {
  Container,
  containerLabel,
  containerOf,
  containerUsage,
  freeAt,
  placementIn,
  planSlots,
  sameContainer,
} from "../utils/location";
import { Suggestion, cuveeKey, suggestDestinations } from "../utils/suggest";
import { normalizeText } from "../utils/search";

import "./barcode-scanner";
import "./label-camera";
import "./star-rating";

type Step = "scan" | "details" | "location" | "confirm";
type ScanMode = "idle" | "barcode" | "label";

@customElement("add-wine-dialog")
export class AddWineDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) cabinets: Cabinet[] = [];
  @property({ attribute: false }) wines: Wine[] = [];
  @property({ attribute: false }) preselectedCabinet: string = "";
  @property({ attribute: false }) preselectedRow: number | null = null;
  @property({ attribute: false }) preselectedCol: number | null = null;
  @property({ attribute: false }) preselectedZone: string = "";
  @property({ attribute: false }) preselectedDepth: number = 0;
  @property({ type: Boolean }) buyListMode = false;

  @state() private _step: Step = "scan";
  @state() private _scanMode: ScanMode = "idle";
  @state() private _barcode = "";
  @state() private _loading = false;
  @state() private _quantity = 1;
  @state() private _addProgress = 0;
  @state() private _lookupResult: BarcodeLookupResult | null = null;
  @state() private _wineData: Partial<Wine> = {};
  @state() private _error = "";
  @state() private _hasGemini = false;
  @state() private _labelLoading = false;
  @state() private _captureStage: "front" | "back" = "front";
  @state() private _frontImageRaw = "";
  @state() private _showBackPrompt = false;
  @state() private _searchResults: BarcodeLookupResult[] = [];
  @state() private _vivinoEnriching = false;
  // Bumped per enrichment so a late reply from a previous bottle cannot land
  // in the current one.
  private _enrichToken = 0;

  static styles = [
    sharedStyles,
    css`
      .step-indicator {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
      }

      .step-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--wc-border);
        transition: all 0.2s;
      }

      .step-dot.active {
        background: var(--wc-primary);
        width: 24px;
        border-radius: 4px;
      }

      .step-dot.done {
        background: var(--wc-primary);
      }

      .scan-section {
        padding: 16px 20px;
      }

      .scan-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }

      .scan-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        background: rgba(255, 255, 255, 0.06);
        color: var(--wc-text);
        text-align: left;
        font-size: 0.95em;
        width: 100%;
      }

      .scan-option:hover {
        border-color: var(--wc-primary);
        background: rgba(255, 255, 255, 0.12);
      }

      .scan-option-icon {
        font-size: 1.5em;
        flex-shrink: 0;
      }

      .scan-option-text {
        flex: 1;
      }

      .scan-option-title {
        font-weight: 600;
        margin-bottom: 2px;
      }

      .scan-option-desc {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .scan-option.disabled {
        opacity: 0.5;
        cursor: default;
      }

      .barcode-input-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .barcode-input-row input {
        flex: 1;
        padding: 10px 14px;
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        font-size: 1em;
        text-align: center;
        letter-spacing: 2px;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
      }

      .barcode-input-row input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      .or-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 14px 0;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .or-divider::before,
      .or-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--wc-border);
      }

      .search-input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        font-size: 1em;
        box-sizing: border-box;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .search-input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      .lookup-result {
        background: rgba(114, 47, 55, 0.05);
        border: 1px solid rgba(114, 47, 55, 0.2);
        border-radius: 10px;
        padding: 12px;
        margin-top: 12px;
        text-align: left;
      }

      .lookup-result .result-name {
        font-weight: 600;
        font-size: 1em;
      }

      .lookup-result .result-detail {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .location-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .vivino-enriching {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-bottom: 10px;
      }

      .suggest-strip {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
        padding: 10px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        background: rgba(114, 47, 55, 0.04);
      }

      .suggest-title {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--wc-text-secondary);
      }

      .suggest-item {
        display: flex;
        align-items: baseline;
        gap: 8px;
        width: 100%;
        text-align: left;
        font: inherit;
        color: inherit;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-card-bg, transparent);
        padding: 8px 10px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .suggest-item:hover:not(.full) {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.08);
      }

      .suggest-item.selected {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.12);
      }

      .suggest-item.full {
        cursor: default;
        opacity: 0.65;
      }

      .suggest-item.full .suggest-where {
        text-decoration: line-through;
      }

      .suggest-where {
        font-weight: 600;
        font-size: 0.85em;
        white-space: nowrap;
      }

      .suggest-why {
        flex: 1;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
      }

      .suggest-space {
        font-size: 0.75em;
        white-space: nowrap;
        color: var(--wc-text-secondary);
      }

      .suggest-space.tight {
        color: #c62828;
      }

      .suggest-alt {
        margin: -2px 0 2px 10px;
        font-size: 0.75em;
        color: var(--wc-text-secondary);
      }

      .suggest-alt button {
        font: inherit;
        color: var(--wc-primary);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
      }

      .location-cabinet {
        border: 2px solid var(--wc-border);
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }

      .location-cabinet:hover {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      .location-cabinet.selected {
        border-color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.1);
      }

      .location-cabinet .cab-name {
        font-weight: 600;
        font-size: 0.9em;
      }

      .location-cabinet .cab-info {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        margin-top: 4px;
      }

      .pos-inputs {
        display: flex;
        gap: 12px;
        margin-top: 12px;
      }

      .pos-inputs .form-group {
        flex: 1;
      }

      .error-msg {
        color: #c62828;
        font-size: 0.85em;
        margin-top: 8px;
      }

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--wc-border);
        border-top-color: var(--wc-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .qty-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 14px;
      }

      .qty-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--wc-text-secondary);
      }

      .qty-stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .qty-btn {
        width: 32px;
        height: 32px;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1.1em;
        line-height: 1;
        cursor: pointer;
      }

      .qty-btn:hover:not(:disabled) {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
      }

      .qty-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .qty-input {
        width: 56px;
        padding: 6px 4px;
        text-align: center;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        background: var(--wc-bg);
        color: var(--wc-text);
        font-size: 1em;
        font-weight: 600;
      }

      .qty-hint {
        margin-top: 6px;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .confirm-summary {
        background: rgba(128, 128, 128, 0.08);
        border-radius: 10px;
        padding: 16px;
      }

      .confirm-summary .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 0.9em;
      }

      .confirm-summary .summary-label {
        color: var(--wc-text-secondary);
      }

      .confirm-summary .summary-value {
        font-weight: 500;
      }

      .label-loading {
        text-align: center;
        padding: 20px;
      }

      .label-loading .loading-spinner {
        width: 32px;
        height: 32px;
        border-width: 3px;
      }

      .camera-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 8px 0;
      }

      .rating-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--wc-border);
      }

      .rating-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--wc-text-secondary);
        margin-bottom: 6px;
      }

      .search-results {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 280px;
        overflow-y: auto;
      }

      .search-results-label {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-bottom: 2px;
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s;
        background: transparent;
        text-align: left;
        color: var(--wc-text);
        width: 100%;
        box-sizing: border-box;
      }

      .search-result-item:hover {
        border-color: var(--wc-primary);
        background: var(--wc-hover);
      }

      .search-result-thumb {
        width: 36px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
        background: rgba(128, 128, 128, 0.1);
      }

      .search-result-info {
        flex: 1;
        min-width: 0;
      }

      .search-result-name {
        font-weight: 600;
        font-size: 0.9em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .search-result-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .search-result-rating {
        font-size: 0.8em;
        font-weight: 600;
        color: #f5a623;
        flex-shrink: 0;
      }
    `,
  ];

  private get _steps(): Step[] {
    return this.buyListMode
      ? ["scan", "details", "confirm"]
      : ["scan", "details", "location", "confirm"];
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("open")) {
      if (this.open) {
        this._step = "scan";
        this._scanMode = "idle";
        this._barcode = "";
        this._lookupResult = null;
        this._error = "";
        this._loading = false;
        this._quantity = 1;
        this._addProgress = 0;
        this._labelLoading = false;
        this._searchResults = [];
        this._captureStage = "front";
        this._frontImageRaw = "";
        this._showBackPrompt = false;
        // Any enrichment still in flight belongs to the previous bottle.
        this._enrichToken++;
        this._vivinoEnriching = false;
        this._wineData = {
          name: "",
          winery: "",
          type: "red",
          vintage: null,
          region: "",
          country: "",
          grape_variety: "",
          price: null,
          retail_price: null,
          notes: "",
          user_rating: null,
          tasting_notes: null,
          cabinet_id: this.preselectedCabinet || "",
          row: this.preselectedRow,
          col: this.preselectedCol,
          depth: this.preselectedDepth || 0,
          zone: this.preselectedZone || "",
        };
        this._checkCapabilities();
      } else {
        // Ensure cameras stop when dialog closes
        this._scanMode = "idle";
      }
    }
  }

  private async _checkCapabilities() {
    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/get_capabilities",
      });
      this._hasGemini = result?.has_gemini || false;
    } catch {
      this._hasGemini = false;
    }
  }

  private _close() {
    this._scanMode = "idle";
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private async _lookupBarcode() {
    if (!this._barcode.trim()) return;
    this._loading = true;
    this._error = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/lookup_barcode",
        barcode: this._barcode.trim(),
      });

      if (result.result) {
        this._lookupResult = result.result;
        this._wineData = {
          ...this._wineData,
          barcode: this._barcode.trim(),
          name: result.result.name || "",
          winery: result.result.winery || "",
          type: result.result.type || "red",
          vintage: result.result.vintage,
          region: result.result.region || "",
          country: result.result.country || "",
          grape_variety: result.result.grape_variety || "",
          rating: result.result.rating,
          ratings_count: result.result.ratings_count || null,
          image_url: result.result.image_url || "",
          description: result.result.description || "",
          food_pairings: result.result.food_pairings || "",
          alcohol: result.result.alcohol || "",
          vivino_updated_at: result.result.source === "vivino" ? new Date().toISOString() : this._wineData.vivino_updated_at,
          vivino_checked_at: result.result.source === "vivino" ? new Date().toISOString() : this._wineData.vivino_checked_at,
        };
        this._step = "details";
      } else {
        this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
        this._onBarcodeLookupFailed("No match for this barcode.");
      }
    } catch (err) {
      this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
      this._onBarcodeLookupFailed("Barcode lookup failed.");
    }

    this._loading = false;
  }

  private _onBarcodeLookupFailed(reason: string) {
    // Not every bottle has a scannable/known barcode — fall back to AI
    // label recognition automatically instead of dead-ending on "enter
    // details manually" when it's available.
    if (this._hasGemini) {
      this._scanMode = "label";
      this._labelLoading = false;
      this._showBackPrompt = false;
      this._captureStage = "front";
      this._frontImageRaw = "";
      this._error = `${reason} Take a photo of the label instead.`;
    } else {
      this._error = `${reason} You can enter details manually.`;
    }
  }

  private async _searchWine() {
    const input = this.shadowRoot?.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    if (!input?.value.trim()) return;

    this._loading = true;
    this._error = "";
    this._searchResults = [];

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/search_wine",
        query: input.value.trim(),
      });

      if (result.results && result.results.length > 0) {
        this._searchResults = result.results;
      } else {
        this._error = "No results found. You can enter details manually.";
      }
    } catch {
      this._error = "Search failed. You can enter details manually.";
    }

    this._loading = false;
  }

  private _selectSearchResult(item: BarcodeLookupResult) {
    this._lookupResult = item;
    this._wineData = {
      ...this._wineData,
      name: item.name || "",
      winery: item.winery || "",
      type: item.type || "red",
      vintage: item.vintage,
      region: item.region || "",
      country: item.country || "",
      grape_variety: item.grape_variety || "",
      rating: item.rating,
      ratings_count: item.ratings_count || null,
      image_url: item.image_url || "",
      description: item.description || "",
      food_pairings: item.food_pairings || "",
      alcohol: item.alcohol || "",
      vivino_updated_at: new Date().toISOString(),
      vivino_checked_at: new Date().toISOString(),
    };
    this._searchResults = [];
    this._step = "details";
  }

  private _onBarcodeDetected(e: CustomEvent) {
    this._barcode = e.detail.barcode;
    this._scanMode = "idle";
    this._lookupBarcode();
  }

  private _onLabelPhotoCaptured(e: CustomEvent) {
    if (this._captureStage === "front") {
      this._frontImageRaw = e.detail.image;
      this._showBackPrompt = true;
    } else {
      this._finishLabelScan(e.detail.image);
    }
  }

  private async _finishLabelScan(backImageRaw?: string) {
    this._showBackPrompt = false;
    this._labelLoading = true;
    this._error = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/recognize_label",
        image: this._frontImageRaw,
        ...(backImageRaw ? { back_image: backImageRaw } : {}),
      });

      if (result.result) {
        // Resize captured photos to thumbnails for storage
        const thumbUrl = await resizeImageForStorage(this._frontImageRaw);
        const backThumbUrl = backImageRaw ? await resizeImageForStorage(backImageRaw) : "";
        const r = result.result;
        this._wineData = {
          ...this._wineData,
          name: r.name || "",
          winery: r.winery || "",
          type: r.type || "red",
          vintage: r.vintage,
          region: r.region || "",
          country: r.country || "",
          grape_variety: r.grape_variety || "",
          disposition: r.disposition || "",
          drink_by: r.drink_by || "",
          drink_window: r.drink_window || "",
          description: r.description || "",
          retail_price: r.estimated_price || null,
          ai_ratings: r.ai_ratings || null,
          notes: r.notes || "",
          barcode: r.barcode || this._wineData.barcode || "",
          image_url: thumbUrl,
          back_image_url: backThumbUrl,
          ai_updated_at: new Date().toISOString(),
          ai_checked_at: new Date().toISOString(),
        };
        this._scanMode = "idle";
        this._step = "details";
        this._captureStage = "front";
        this._frontImageRaw = "";
        // Deliberately not awaited: the form is already usable.
        void this._enrichFromVivino(++this._enrichToken);
      } else {
        // Show specific error from backend if available
        const errorDetail = result.error || "Unknown error";
        this._error = `Label recognition failed: ${errorDetail}`;
        console.error("Wine Cellar: label recognition failed:", errorDetail);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("Wine Cellar: label recognition error:", msg);
      this._error = `Label recognition error: ${msg}`;
    }

    this._labelLoading = false;
  }

  // The label path is AI-only: the model reads what is printed on the bottle,
  // but Vivino's rating, review count and id exist nowhere in that reading —
  // so a wine added by photo used to arrive with none of them, and without a
  // vivino_id it could never be refreshed the cheap way afterwards. Since a
  // barcode that finds no match also falls through to the label, that covered
  // every bottle whose barcode is not in a grocery database.
  //
  // It runs behind the details step rather than in front of it. Waiting on a
  // second lookup before showing anything would spend the user's time on data
  // they are not reading yet.
  private async _enrichFromVivino(token: number) {
    const d = this._wineData;
    const query = [d.winery, d.name, d.vintage].filter(Boolean).join(" ").trim();
    if (!query) return;

    this._vivinoEnriching = true;
    try {
      const res = await this.hass.callWS({ type: "wine_cellar/search_wine", query });
      const top = res?.results?.[0];
      // Bail if the user has moved on, scanned something else, or closed up:
      // writing into _wineData then would be writing into a different bottle.
      if (!top || token !== this._enrichToken) return;
      if (!this._looksLikeSameWine(top)) return;

      const cur = this._wineData;
      const keepExisting = (mine: any, theirs: any) =>
        mine !== undefined && mine !== null && mine !== "" ? mine : theirs || mine;

      this._wineData = {
        ...cur,
        // Only Vivino can supply these, so they are always taken.
        rating: top.rating ?? cur.rating,
        ratings_count: top.ratings_count ?? cur.ratings_count,
        vivino_id: top.vivino_id ?? cur.vivino_id,
        vivino_updated_at: new Date().toISOString(),
        vivino_checked_at: new Date().toISOString(),
        // These the AI may already have read off the bottle, and it was
        // looking at the actual bottle — fill the gaps, do not overwrite.
        region: keepExisting(cur.region, top.region),
        country: keepExisting(cur.country, top.country),
        grape_variety: keepExisting(cur.grape_variety, top.grape_variety),
        alcohol: keepExisting(cur.alcohol, top.alcohol),
        description: keepExisting(cur.description, top.description),
        food_pairings: keepExisting(cur.food_pairings, top.food_pairings),
      };
      // name, winery, vintage and image_url are deliberately left alone: the
      // photo is the user's own, and Vivino's nearest match is not necessarily
      // spelled the way the label is.
    } catch (err) {
      // Enrichment is a bonus. Failing it must not turn into an error the
      // user has to dismiss on a wine that was recognised perfectly well.
      console.warn("Wine Cellar: Vivino enrichment failed", err);
    } finally {
      if (token === this._enrichToken) this._vivinoEnriching = false;
    }
  }

  // Vivino answers every query with something. Attaching a stranger's rating
  // to this bottle would be worse than having no rating at all.
  private _looksLikeSameWine(candidate: any): boolean {
    const d = this._wineData;
    const winery = normalizeText(d.winery).trim();
    const theirWinery = normalizeText(candidate.winery).trim();
    if (winery && theirWinery && winery === theirWinery) return true;
    const name = cuveeKey(d.name);
    return !!name && name === cuveeKey(candidate.name);
  }

  private _goToStep(step: Step) {
    this._step = step;
  }

  private _updateField(field: string, value: any) {
    this._wineData = { ...this._wineData, [field]: value };
  }

  private _zoneUsage(sr: StorageRow) {
    const cabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
    const container: Container = {
      cabinetId: this._wineData.cabinet_id || "",
      kind: "zone",
      zone: `storage-${sr.row}`,
      row: null,
      col: null,
    };
    return containerUsage(container, cabinet, this.wines);
  }

  private _selectZone(sr: StorageRow) {
    // Adding a bottle used to append past the end of a full bin, silently
    // growing it beyond its configured capacity. Refuse instead, the way
    // drag-and-drop and paste already do.
    const { used, capacity, nextDepth, full } = this._zoneUsage(sr);
    const label = sr.name || (sr.type === "box" ? "This box" : "This bin");
    if (full) {
      this._error = `${label} is full (${used}/${capacity}). Free a slot, or raise its capacity in Manage Racks.`;
      return;
    }
    this._error = "";
    this._wineData = {
      ...this._wineData,
      zone: `storage-${sr.row}`,
      row: null,
      col: null,
      depth: nextDepth,
    };
  }

  // Send the bottle to a container the suggestion strip proposed, landing on
  // its first free depth.
  private _applyContainer(c: Container) {
    const cabinet = this.cabinets.find((cab) => cab.id === c.cabinetId);
    const patch = placementIn(c, cabinet, this.wines);
    if (!patch) {
      this._error = `${containerLabel(c, this.cabinets)} is full. Free a slot, or raise its capacity in Manage Racks.`;
      return;
    }
    this._error = "";
    this._wineData = { ...this._wineData, ...patch };
  }

  private _planSlots(count: number): { row: number | null; col: number | null; zone: string; depth: number }[] {
    return planSlots(this._wineData, this.cabinets, this.wines, count);
  }

  // Free space at the chosen destination; null when there is no limit.
  private _availableSlots(): number | null {
    const free = freeAt(this._wineData, this.cabinets, this.wines);
    return Number.isFinite(free) ? free : null;
  }

  private _setQuantity(value: number) {
    const available = this._availableSlots();
    const max = available === null ? 99 : Math.max(1, Math.min(99, available));
    this._quantity = Math.max(1, Math.min(max, Math.round(value) || 1));
  }

  private async _addWine() {
    this._loading = true;
    try {
      if (this.buyListMode) {
        await this.hass.callWS({
          type: "wine_cellar/add_to_buy_list",
          wine: this._wineData,
        });
        this.dispatchEvent(
          new CustomEvent("buy-list-updated", { bubbles: true, composed: true })
        );
      } else {
        const slots = this._planSlots(this._quantity);
        if (!slots.length) {
          this._error = "No free slot left at that destination.";
          this._loading = false;
          return;
        }
        // Each bottle is added at its own slot, so identical bottles never
        // stack on top of each other.
        const addedIds: string[] = [];
        for (let i = 0; i < slots.length; i++) {
          this._addProgress = i + 1;
          const result = await this.hass.callWS({
            type: "wine_cellar/add_wine",
            wine: { ...this._wineData, ...slots[i] },
          });
          if (result?.wine?.id) addedIds.push(result.wine.id);
        }

        // A bin is a pile: what you just put in sits on top, so the new
        // bottles take the first slots and the rest shift down. One call
        // renumbers the bin; listing only the new ids is enough, the backend
        // appends the others in their existing order.
        if (this._wineData.zone && addedIds.length) {
          await this.hass.callWS({
            type: "wine_cellar/reorder_zone",
            cabinet_id: this._wineData.cabinet_id,
            zone: this._wineData.zone,
            wine_ids: addedIds,
          });
        }
        this.dispatchEvent(
          new CustomEvent("wine-added", { bubbles: true, composed: true })
        );
      }
      this._close();
    } catch (err) {
      this._error = this.buyListMode ? "Failed to add to buy list." : "Failed to add wine.";
    }
    this._addProgress = 0;
    this._loading = false;
  }

  private async _quickAddToBuyList() {
    if (!this._wineData.name) return;
    this._loading = true;
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_to_buy_list",
        wine: this._wineData,
      });
      this.dispatchEvent(
        new CustomEvent("buy-list-updated", { bubbles: true, composed: true })
      );
      this._close();
    } catch (err) {
      this._error = "Failed to add to buy list.";
    }
    this._loading = false;
  }

  private _renderStepIndicator() {
    const currentIdx = this._steps.indexOf(this._step);
    return html`
      <div class="step-indicator">
        ${this._steps.map(
          (s, i) => html`
            <div
              class="step-dot ${i === currentIdx ? "active" : ""} ${i < currentIdx ? "done" : ""}"
            ></div>
          `
        )}
      </div>
    `;
  }

  private _renderScanStep() {
    // Barcode camera mode
    if (this._scanMode === "barcode") {
      return html`
        <div class="scan-section">
          <barcode-scanner
            .active=${true}
            @barcode-detected=${this._onBarcodeDetected}
            @scanner-error=${(e: CustomEvent) => { this._error = e.detail.error; this._scanMode = "idle"; }}
          ></barcode-scanner>
          ${this._loading
            ? html`<div class="label-loading"><span class="loading-spinner"></span><div style="margin-top: 8px">Looking up barcode...</div></div>`
            : nothing}
          ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => { this._scanMode = "idle"; this._error = ""; }}>Cancel Scan</button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        </div>
      `;
    }

    // Label camera mode
    if (this._scanMode === "label") {
      return html`
        <div class="scan-section">
          ${this._labelLoading
            ? html`
                <div class="label-loading">
                  <span class="loading-spinner"></span>
                  <div style="margin-top: 8px">Analyzing label with AI...</div>
                </div>
              `
            : this._showBackPrompt
              ? html`
                  <div style="text-align:center;padding:24px 12px">
                    <div style="font-size:2em;margin-bottom:8px">✅</div>
                    <div style="margin-bottom:12px;font-weight:500">Front label captured</div>
                    <p style="font-size:0.85em;color:var(--wc-text-secondary);margin-bottom:16px">
                      Add a photo of the back label too? It often has the vintage year (and sometimes a barcode).
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                      <button class="btn btn-primary" @click=${() => { this._showBackPrompt = false; this._captureStage = "back"; }}>📷 Add Back Photo</button>
                      <button class="btn btn-outline" @click=${() => this._finishLabelScan()}>Skip, Use Front Only</button>
                    </div>
                  </div>
                `
              : html`
                  ${this._captureStage === "back"
                    ? html`<div class="hint" style="text-align:center;margin-bottom:6px">Now photograph the back label</div>`
                    : nothing}
                  <label-camera
                    .active=${true}
                    @photo-captured=${this._onLabelPhotoCaptured}
                  ></label-camera>
                `}
          ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => {
              this._scanMode = "idle";
              this._error = "";
              this._labelLoading = false;
              this._showBackPrompt = false;
              this._captureStage = "front";
              this._frontImageRaw = "";
            }}>Cancel</button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        </div>
      `;
    }

    // Idle mode - show options
    return html`
      <div class="scan-section">
        <div class="scan-options">
          <button class="scan-option" @click=${() => { this._scanMode = "barcode"; this._error = ""; }}>
            <span class="scan-option-icon">📷</span>
            <div class="scan-option-text">
              <div class="scan-option-title">Scan Barcode</div>
              <div class="scan-option-desc">Point camera at wine bottle barcode</div>
            </div>
          </button>

          <button
            class="scan-option ${this._hasGemini ? "" : "disabled"}"
            @click=${() => this._hasGemini && (() => { this._scanMode = "label"; this._error = ""; })()}
            title=${this._hasGemini ? "" : "Configure Gemini API key in integration settings"}
          >
            <span class="scan-option-icon">🤖</span>
            <div class="scan-option-text">
              <div class="scan-option-title">Recognize Label</div>
              <div class="scan-option-desc">
                ${this._hasGemini
                  ? "Take a photo of the wine label"
                  : "Requires Gemini API key in settings"}
              </div>
            </div>
          </button>
        </div>

        <div class="or-divider">or enter manually</div>

        <div class="barcode-input-row">
          <input
            type="text"
            placeholder="Enter barcode..."
            .value=${this._barcode}
            @input=${(e: InputEvent) =>
              (this._barcode = (e.target as HTMLInputElement).value)}
            @keypress=${(e: KeyboardEvent) =>
              e.key === "Enter" && this._lookupBarcode()}
          />
          <button class="btn btn-primary" @click=${this._lookupBarcode}>
            ${this._loading
              ? html`<span class="loading-spinner"></span>`
              : "Look Up"}
          </button>
        </div>

        ${this._lookupResult
          ? html`
              <div class="lookup-result">
                <div class="result-name">${this._lookupResult.name}</div>
                <div class="result-detail">
                  ${this._lookupResult.winery}
                  ${this._lookupResult.vintage
                    ? ` · ${this._lookupResult.vintage}`
                    : ""}
                </div>
              </div>
            `
          : nothing}

        <div class="or-divider">or search by name</div>

        <div class="barcode-input-row">
          <input
            class="search-input"
            type="text"
            placeholder="Search wine name..."
            @keypress=${(e: KeyboardEvent) =>
              e.key === "Enter" && this._searchWine()}
          />
          <button class="btn btn-outline" @click=${this._searchWine}>
            ${this._loading
              ? html`<span class="loading-spinner"></span>`
              : "Search"}
          </button>
        </div>

        ${this._searchResults.length > 0
          ? html`
              <div class="search-results">
                <div class="search-results-label">
                  ${this._searchResults.length} result${this._searchResults.length > 1 ? "s" : ""} — tap to select
                </div>
                ${this._searchResults.map(
                  (item) => html`
                    <button
                      class="search-result-item"
                      @click=${() => this._selectSearchResult(item)}
                    >
                      ${item.image_url
                        ? html`<img class="search-result-thumb" src="${item.image_url}" alt="" />`
                        : html`<div class="search-result-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2em;">🍷</div>`}
                      <div class="search-result-info">
                        <div class="search-result-name">${item.name || "Unknown"}</div>
                        <div class="search-result-meta">
                          ${item.winery || ""}${item.vintage ? ` · ${item.vintage}` : ""}${item.region ? ` · ${item.region}` : ""}
                        </div>
                      </div>
                      ${item.rating
                        ? html`<span class="search-result-rating">★ ${item.rating.toFixed(1)}</span>`
                        : nothing}
                    </button>
                  `
                )}
              </div>
            `
          : nothing}

        ${this._error
          ? html`<div class="error-msg">${this._error}</div>`
          : nothing}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${this._close}>Cancel</button>
        <button
          class="btn btn-outline"
          @click=${() => this._goToStep("details")}
        >
          Skip → Manual Entry
        </button>
      </div>
    `;
  }

  private _renderDetailsStep() {
    return html`
      <div class="dialog-body">
        ${this._vivinoEnriching
          ? html`<div class="vivino-enriching">🍇 Checking Vivino for a rating…</div>`
          : nothing}
        <div class="form-group">
          <label>Wine Name *</label>
          <input
            type="text"
            .value=${this._wineData.name || ""}
            @input=${(e: InputEvent) =>
              this._updateField("name", (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Winery</label>
            <input
              type="text"
              .value=${this._wineData.winery || ""}
              @input=${(e: InputEvent) =>
                this._updateField("winery", (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label>Vintage</label>
            <input
              type="number"
              .value=${this._wineData.vintage?.toString() || ""}
              @input=${(e: InputEvent) =>
                this._updateField("vintage", parseInt((e.target as HTMLInputElement).value) || null)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Type</label>
            <select
              @change=${(e: Event) =>
                this._updateField("type", (e.target as HTMLSelectElement).value)}
            >
              ${(Object.entries(WINE_TYPE_LABELS) as [WineType, string][]).map(
                ([value, label]) =>
                  html`<option value=${value} ?selected=${(this._wineData.type || "red") === value}>${label}</option>`
              )}
            </select>
          </div>
          <div class="form-group">
            <label>Purchase Price</label>
            <input
              type="number"
              step="0.01"
              .value=${this._wineData.price?.toString() || ""}
              @input=${(e: InputEvent) =>
                this._updateField("price", parseFloat((e.target as HTMLInputElement).value) || null)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Current Value</label>
            <input
              type="number"
              step="0.01"
              .value=${this._wineData.retail_price?.toString() || ""}
              @input=${(e: InputEvent) =>
                this._updateField("retail_price", parseFloat((e.target as HTMLInputElement).value) || null)}
            />
          </div>
          <div class="form-group">
            <label>Region</label>
            <input
              type="text"
              .value=${this._wineData.region || ""}
              @input=${(e: InputEvent) =>
                this._updateField("region", (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Country</label>
            <input
              type="text"
              .value=${this._wineData.country || ""}
              @input=${(e: InputEvent) =>
                this._updateField("country", (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Grape Variety</label>
          <input
            type="text"
            .value=${this._wineData.grape_variety || ""}
            @input=${(e: InputEvent) =>
              this._updateField("grape_variety", (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Purchase Date</label>
            <input
              type="date"
              .value=${this._wineData.purchase_date || ""}
              @input=${(e: InputEvent) =>
                this._updateField("purchase_date", (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label>Drink By</label>
            <input
              type="text"
              placeholder="e.g. 2030"
              .value=${this._wineData.drink_by || ""}
              @input=${(e: InputEvent) =>
                this._updateField("drink_by", (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            .value=${this._wineData.notes || ""}
            @input=${(e: InputEvent) =>
              this._updateField("notes", (e.target as HTMLTextAreaElement).value)}
          ></textarea>
        </div>

        <div class="rating-section">
          <div class="rating-label">My Rating</div>
          <star-rating
            .value=${this._wineData.user_rating || 0}
            @rating-change=${(e: CustomEvent) =>
              this._updateField("user_rating", e.detail.value || null)}
          ></star-rating>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("scan")}>
          ← Back
        </button>
        ${!this.buyListMode
          ? html`
              <button
                class="btn btn-primary"
                style="background: #e65100;"
                @click=${this._quickAddToBuyList}
                ?disabled=${!this._wineData.name || this._loading}
                title="Save to buy list instead of cellar"
              >
                ${this._loading ? html`<span class="loading-spinner"></span>` : "🛒 Buy List"}
              </button>
            `
          : nothing}
        <button
          class="btn btn-primary"
          @click=${() => this._goToStep(this.buyListMode ? "confirm" : "location")}
          ?disabled=${!this._wineData.name}
        >
          Next →
        </button>
      </div>
    `;
  }

  // Destinations deduced from where this bottle's relatives already sit. The
  // cellar has no declared zone rules, so its own layout is the only signal:
  // every suggestion says which bottles are already there and why they match.
  private _renderSuggestions() {
    const suggestions = suggestDestinations(this._wineData, this.wines, this.cabinets, 3);
    if (!suggestions.length) return nothing;
    const current = containerOf(this._wineData as Wine);

    const spaceText = (s: Suggestion) => {
      if (s.usage.full) return `Full · ${s.usage.used}/${s.usage.capacity}`;
      if (!Number.isFinite(s.usage.free)) return "Room";
      return s.usage.free === 1 ? "1 free" : `${s.usage.free} free`;
    };

    return html`
      <div class="suggest-strip">
        <div class="suggest-title">Suggested — where its relatives are</div>
        ${suggestions.map((s) => {
          const selected = !!current && sameContainer(current, s.container);
          return html`
            <button
              class="suggest-item ${s.usage.full ? "full" : ""} ${selected ? "selected" : ""}"
              ?disabled=${s.usage.full}
              @click=${() => this._applyContainer(s.container)}
            >
              <span class="suggest-where">${s.label}</span>
              <span class="suggest-why">${s.reason}</span>
              <span class="suggest-space ${s.usage.full || s.usage.free <= 1 ? "tight" : ""}">
                ${spaceText(s)}
              </span>
            </button>
            ${s.alternative
              ? html`
                  <div class="suggest-alt">
                    No room left there — split the series into
                    <button @click=${() => this._applyContainer(s.alternative!.container)}>
                      ${s.alternative.label}
                    </button>
                    (${s.alternative.free === 1 ? "1 free" : `${s.alternative.free} free`}), or free a
                    slot first.
                  </div>
                `
              : nothing}
          `;
        })}
      </div>
    `;
  }

  private _renderLocationStep() {
    const selectedCabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
    const zones = selectedCabinet?.storage_rows || [];
    const hasZone = !!this._wineData.zone;

    return html`
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 8px">Choose Location</div>
        <div style="font-size: 0.85em; color: var(--wc-text-secondary); margin-bottom: 12px">
          Select a cabinet and position for this bottle
        </div>

        ${this._renderSuggestions()}

        <div class="location-grid">
          ${this.cabinets.map(
            (cab) => html`
              <div
                class="location-cabinet ${this._wineData.cabinet_id === cab.id ? "selected" : ""}"
                @click=${() => {
                  this._wineData = { ...this._wineData, cabinet_id: cab.id, row: null, col: null, zone: "" };
                }}
              >
                <div class="cab-name">${cab.name}</div>
                <div class="cab-info">${cab.rows}×${cab.cols} slots</div>
              </div>
            `
          )}
        </div>

        ${selectedCabinet && zones.length > 0 ? html`
          <div style="margin-top:12px">
            <label style="display:block;font-size:0.8em;color:var(--wc-text-secondary);margin-bottom:6px">Bulk / Box Zone</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <button
                class="btn ${!hasZone ? "btn-primary" : "btn-outline"}"
                style="font-size:0.8em;padding:6px 10px"
                @click=${() => this._updateField("zone", "")}
              >None — use grid Row/Col</button>
              ${zones.map((sr) => {
                const usage = this._zoneUsage(sr);
                const selected = this._wineData.zone === `storage-${sr.row}`;
                return html`
                  <button
                    class="btn ${selected ? "btn-primary" : "btn-outline"}"
                    style="font-size:0.8em;padding:6px 10px${usage.full ? ";opacity:0.5" : ""}"
                    title=${usage.full ? "Full — free a slot or raise its capacity" : ""}
                    @click=${() => this._selectZone(sr)}
                  >
                    ${sr.name || (sr.type === "box" ? "Box" : "Bulk Bin")}
                    <span style="opacity:0.75">${usage.used}/${usage.capacity}</span>
                  </button>
                `;
              })}
            </div>
          </div>
        ` : nothing}

        ${this._wineData.cabinet_id && !hasZone
          ? html`
              <div class="pos-inputs">
                <div class="form-group">
                  <label>Row (1-based)</label>
                  <input
                    type="number"
                    min="1"
                    .value=${this._wineData.row != null ? (this._wineData.row + 1).toString() : ""}
                    @input=${(e: InputEvent) =>
                      this._updateField("row", parseInt((e.target as HTMLInputElement).value) - 1)}
                  />
                </div>
                <div class="form-group">
                  <label>Column (1-based)</label>
                  <input
                    type="number"
                    min="1"
                    .value=${this._wineData.col != null ? (this._wineData.col + 1).toString() : ""}
                    @input=${(e: InputEvent) =>
                      this._updateField("col", parseInt((e.target as HTMLInputElement).value) - 1)}
                  />
                </div>
              </div>
            `
          : nothing}
        ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("details")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${() => this._onLocationNext()}>
          Next →
        </button>
      </div>
    `;
  }

  private _onLocationNext() {
    const d = this._wineData;
    // A cabinet with no zone and no complete row/col is a wine with no
    // findable position — it silently vanishes (assigned to the cabinet,
    // but rendered nowhere). Catch that here instead of at save time.
    if (d.cabinet_id && !d.zone && (d.row == null || d.col == null || isNaN(d.row) || isNaN(d.col))) {
      this._error = "Pick a zone, or enter both Row and Column, so the bottle has a findable spot.";
      return;
    }

    const cabinet = this.cabinets.find((c) => c.id === d.cabinet_id);
    if (cabinet && !d.zone && d.row != null && d.col != null) {
      if (d.row < 0 || d.row >= cabinet.rows || d.col < 0 || d.col >= cabinet.cols) {
        this._error = `That slot is outside ${cabinet.name} (${cabinet.rows} rows × ${cabinet.cols} columns).`;
        return;
      }
      const isStorageRow = (cabinet.storage_rows || []).some((sr) => sr.row === d.row);
      if (isStorageRow) {
        this._error = "That row is a bin or box, not grid slots — pick it from the zone list above.";
        return;
      }
      // Stack behind whatever is already in the slot, up to the rack's depth,
      // instead of landing on top of another bottle at depth 0.
      const occupied = new Set(
        this.wines
          .filter((w) => w.cabinet_id === d.cabinet_id && w.row === d.row && w.col === d.col)
          .map((w) => w.depth || 0)
      );
      const rackDepth = cabinet.depth || 1;
      let depth = 0;
      while (occupied.has(depth)) depth++;
      if (depth >= rackDepth) {
        this._error = `Row ${d.row + 1}, column ${d.col + 1} is full (${occupied.size}/${rackDepth} deep).`;
        return;
      }
      this._wineData = { ...this._wineData, depth };
    }

    this._error = "";
    this._goToStep("confirm");
  }

  private _renderQuantityPicker() {
    const available = this._availableSlots();
    const max = available === null ? 99 : Math.max(1, Math.min(99, available));
    const destination = this._wineData.cabinet_id
      ? this._planSlots(this._quantity)
      : null;

    return html`
      <div class="qty-row">
        <span class="qty-label">Bottles</span>
        <div class="qty-stepper">
          <button
            class="qty-btn"
            ?disabled=${this._quantity <= 1}
            @click=${() => this._setQuantity(this._quantity - 1)}
          >−</button>
          <input
            class="qty-input"
            type="number"
            min="1"
            max=${max}
            .value=${String(this._quantity)}
            @change=${(e: Event) =>
              this._setQuantity(Number((e.target as HTMLInputElement).value))}
          />
          <button
            class="qty-btn"
            ?disabled=${this._quantity >= max}
            @click=${() => this._setQuantity(this._quantity + 1)}
          >+</button>
        </div>
      </div>
      <div class="qty-hint">
        ${available === null
          ? "Identical bottles, added unassigned."
          : available === 0
            ? "That destination is full."
            : html`${available} slot${available > 1 ? "s" : ""} free here.
              ${destination && destination.length > 1
                ? `The ${destination.length} bottles take consecutive free slots.`
                : ""}`}
      </div>
    `;
  }

  private _renderConfirmStep() {
    const cabinetName =
      this.cabinets.find((c) => c.id === this._wineData.cabinet_id)?.name ||
      "Unassigned";
    const zoneCabinet = this.cabinets.find((c) => c.id === this._wineData.cabinet_id);
    const zoneRow = this._wineData.zone
      ? zoneCabinet?.storage_rows.find((sr) => `storage-${sr.row}` === this._wineData.zone)
      : undefined;
    const posLabel = zoneRow
      ? zoneRow.name || (zoneRow.type === "box" ? "Box" : "Bulk Bin")
      : this._wineData.row != null && this._wineData.col != null
        ? `Row ${(this._wineData.row ?? 0) + 1}, Col ${(this._wineData.col ?? 0) + 1}`
        : "Not specified";

    return html`
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 12px">Confirm & Add</div>

        <div class="confirm-summary">
          <div class="summary-row">
            <span class="summary-label">Name</span>
            <span class="summary-value">${this._wineData.name}</span>
          </div>
          ${this._wineData.winery
            ? html`
                <div class="summary-row">
                  <span class="summary-label">Winery</span>
                  <span class="summary-value">${this._wineData.winery}</span>
                </div>
              `
            : nothing}
          ${this._wineData.vintage
            ? html`
                <div class="summary-row">
                  <span class="summary-label">Vintage</span>
                  <span class="summary-value">${this._wineData.vintage}</span>
                </div>
              `
            : nothing}
          <div class="summary-row">
            <span class="summary-label">Type</span>
            <span class="summary-value">
              ${WINE_TYPE_LABELS[(this._wineData.type as WineType) || "red"]}
            </span>
          </div>
          ${this.buyListMode
            ? nothing
            : html`
                <div class="summary-row">
                  <span class="summary-label">Cabinet</span>
                  <span class="summary-value">${cabinetName}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Position</span>
                  <span class="summary-value">${posLabel}</span>
                </div>
              `}
          ${this._wineData.user_rating
            ? html`
                <div class="summary-row">
                  <span class="summary-label">My Rating</span>
                  <span class="summary-value">${this._wineData.user_rating}/5</span>
                </div>
              `
            : nothing}
        </div>

        ${this.buyListMode ? nothing : this._renderQuantityPicker()}

        ${this._error
          ? html`<div class="error-msg">${this._error}</div>`
          : nothing}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep(this.buyListMode ? "details" : "location")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${this._addWine}>
          ${this._loading
            ? html`<span class="loading-spinner"></span>${this._addProgress && this._quantity > 1
                ? html` ${this._addProgress}/${this._quantity}`
                : nothing}`
            : this.buyListMode
              ? "Add to Buy List"
              : this._quantity > 1
                ? `Add ${this._quantity} Bottles`
                : "Add Wine"}
        </button>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">${this.buyListMode ? "Add to Buy List" : "Add Wine"}</div>
          ${this._renderStepIndicator()}
          ${this._step === "scan" ? this._renderScanStep() : nothing}
          ${this._step === "details" ? this._renderDetailsStep() : nothing}
          ${this._step === "location" ? this._renderLocationStep() : nothing}
          ${this._step === "confirm" ? this._renderConfirmStep() : nothing}
        </div>
      </div>
    `;
  }
}
