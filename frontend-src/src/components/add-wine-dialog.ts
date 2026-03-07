import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  Wine,
  Cabinet,
  BarcodeLookupResult,
  WineType,
  WINE_TYPE_LABELS,
} from "../models";
import { sharedStyles } from "../styles";

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
  @state() private _lookupResult: BarcodeLookupResult | null = null;
  @state() private _wineData: Partial<Wine> = {};
  @state() private _error = "";
  @state() private _hasGemini = false;
  @state() private _labelLoading = false;

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

      .confirm-summary {
        background: rgba(0, 0, 0, 0.03);
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
    `,
  ];

  private get _steps(): Step[] {
    return this.buyListMode
      ? ["scan", "details", "confirm"]
      : ["scan", "details", "location", "confirm"];
  }

  /** Resize a base64 JPEG to a small thumbnail for storage */
  private _resizeImageForStorage(base64: string, maxDim = 200, quality = 0.6): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve("");
      img.src = `data:image/jpeg;base64,${base64}`;
    });
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
        this._labelLoading = false;
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
        };
        this._step = "details";
      } else {
        this._error = "No results found. You can enter details manually.";
        this._wineData = { ...this._wineData, barcode: this._barcode.trim() };
      }
    } catch (err) {
      this._error = "Lookup failed. You can enter details manually.";
    }

    this._loading = false;
  }

  private async _searchWine() {
    const input = this.shadowRoot?.querySelector(
      ".search-input"
    ) as HTMLInputElement;
    if (!input?.value.trim()) return;

    this._loading = true;
    this._error = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/search_wine",
        query: input.value.trim(),
      });

      if (result.results && result.results.length > 0) {
        const first = result.results[0];
        this._lookupResult = first;
        this._wineData = {
          ...this._wineData,
          name: first.name || "",
          winery: first.winery || "",
          type: first.type || "red",
          vintage: first.vintage,
          region: first.region || "",
          country: first.country || "",
          grape_variety: first.grape_variety || "",
          rating: first.rating,
          ratings_count: first.ratings_count || null,
          image_url: first.image_url || "",
          description: first.description || "",
          food_pairings: first.food_pairings || "",
          alcohol: first.alcohol || "",
        };
        this._step = "details";
      } else {
        this._error = "No results found. You can enter details manually.";
      }
    } catch {
      this._error = "Search failed. You can enter details manually.";
    }

    this._loading = false;
  }

  private _onBarcodeDetected(e: CustomEvent) {
    this._barcode = e.detail.barcode;
    this._scanMode = "idle";
    this._lookupBarcode();
  }

  private async _onPhotoCaptured(e: CustomEvent) {
    this._labelLoading = true;
    this._error = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/recognize_label",
        image: e.detail.image,
      });

      if (result.result) {
        // Resize captured photo to thumbnail for storage
        const thumbUrl = await this._resizeImageForStorage(e.detail.image);
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
          image_url: thumbUrl,
        };
        this._scanMode = "idle";
        this._step = "details";
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

  private _goToStep(step: Step) {
    this._step = step;
  }

  private _updateField(field: string, value: any) {
    this._wineData = { ...this._wineData, [field]: value };
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
        await this.hass.callWS({
          type: "wine_cellar/add_wine",
          wine: this._wineData,
        });
        this.dispatchEvent(
          new CustomEvent("wine-added", { bubbles: true, composed: true })
        );
      }
      this._close();
    } catch (err) {
      this._error = this.buyListMode ? "Failed to add to buy list." : "Failed to add wine.";
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
            : html`
                <label-camera
                  .active=${true}
                  @photo-captured=${this._onPhotoCaptured}
                ></label-camera>
              `}
          ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
          <div class="camera-actions">
            <button class="btn btn-outline" @click=${() => { this._scanMode = "idle"; this._error = ""; this._labelLoading = false; }}>Cancel</button>
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
            Search
          </button>
        </div>

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
              .value=${this._wineData.type || "red"}
              @change=${(e: Event) =>
                this._updateField("type", (e.target as HTMLSelectElement).value)}
            >
              ${(Object.entries(WINE_TYPE_LABELS) as [WineType, string][]).map(
                ([value, label]) =>
                  html`<option value=${value}>${label}</option>`
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

  private _renderLocationStep() {
    return html`
      <div class="dialog-body">
        <div style="font-weight: 500; margin-bottom: 8px">Choose Location</div>
        <div style="font-size: 0.85em; color: var(--wc-text-secondary); margin-bottom: 12px">
          Select a cabinet and position for this bottle
        </div>

        <div class="location-grid">
          ${this.cabinets.map(
            (cab) => html`
              <div
                class="location-cabinet ${this._wineData.cabinet_id === cab.id ? "selected" : ""}"
                @click=${() => this._updateField("cabinet_id", cab.id)}
              >
                <div class="cab-name">${cab.name}</div>
                <div class="cab-info">${cab.rows}×${cab.cols} slots</div>
              </div>
            `
          )}
        </div>

        ${this._wineData.cabinet_id
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
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => this._goToStep("details")}>
          ← Back
        </button>
        <button class="btn btn-primary" @click=${() => this._goToStep("confirm")}>
          Next →
        </button>
      </div>
    `;
  }

  private _renderConfirmStep() {
    const cabinetName =
      this.cabinets.find((c) => c.id === this._wineData.cabinet_id)?.name ||
      "Unassigned";
    const posLabel =
      this._wineData.row != null && this._wineData.col != null
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
            ? html`<span class="loading-spinner"></span>`
            : this.buyListMode ? "Add to Buy List" : "Add Wine"}
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
