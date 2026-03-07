import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Wine, WineListItem, WineType, WINE_TYPE_COLORS, WINE_TYPE_LABELS } from "../models";
import { sharedStyles } from "../styles";
import "./label-camera";
import "./wine-detail-dialog";

type Phase = "capture" | "extracting" | "results";

@customElement("wine-list-dialog")
export class WineListDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;

  @state() private _phase: Phase = "capture";
  @state() private _wines: WineListItem[] = [];
  @state() private _restaurantName: string | null = null;
  @state() private _currency = "USD";
  @state() private _error = "";
  @state() private _enriching = false;
  @state() private _aiEnriching = false;
  @state() private _expandedIndex: number | null = null;
  @state() private _addedIndices: Set<number> = new Set();
  @state() private _cancelEnrichment = false;
  @state() private _buyListIndices: Set<number> = new Set();
  @state() private _detailWine: Wine | null = null;
  @state() private _showDetail = false;
  @property({ type: Boolean }) hasGemini = false;

  static styles = [
    sharedStyles,
    css`
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 8px;
      }

      .header-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text);
      }

      .header-subtitle {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        padding: 0 20px 12px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.3em;
        cursor: pointer;
        color: var(--wc-text-secondary);
        padding: 4px 8px;
        border-radius: 6px;
        line-height: 1;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .extracting {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--wc-border);
        border-top: 3px solid var(--wc-primary, #6d4c41);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-msg {
        padding: 12px 20px;
        color: #c62828;
        font-size: 0.85em;
        background: rgba(198, 40, 40, 0.08);
        border-radius: 8px;
        margin: 0 20px 12px;
      }

      .enrichment-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .progress-track {
        flex: 1;
        height: 4px;
        background: var(--wc-border);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s;
      }

      .progress-fill.vivino { background: #8e24aa; }
      .progress-fill.ai { background: #1565c0; }

      .wine-list-results {
        max-height: 55vh;
        overflow-y: auto;
        padding: 0 16px 16px;
      }

      .wine-list-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        margin-bottom: 8px;
        transition: background 0.2s;
        cursor: pointer;
      }

      .wine-list-item:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .wine-list-item.expanded {
        background: rgba(255, 255, 255, 0.06);
      }

      .wl-type-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 5px;
      }

      .wl-thumb {
        width: 28px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .wl-info {
        flex: 1;
        min-width: 0;
      }

      .wl-name {
        font-weight: 600;
        font-size: 0.88em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wl-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wl-scores {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 4px;
        flex-wrap: wrap;
      }

      .wl-vivino-rating {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 0.82em;
        font-weight: 600;
        color: #f5a623;
      }

      .wl-price-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 3px;
        font-size: 0.82em;
      }

      .wl-list-price {
        font-weight: 600;
        color: var(--wc-text);
      }

      .wl-market-price {
        color: var(--wc-text-secondary);
        text-decoration: line-through;
      }

      .wl-markup-badge {
        font-size: 0.72em;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 8px;
        color: #fff;
      }

      .wl-value-badge {
        font-size: 0.7em;
        font-weight: 500;
        padding: 1px 6px;
        border-radius: 8px;
        color: #fff;
      }

      .wl-ai-chips {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .wl-ai-chip {
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: 10px;
        background: rgba(245, 166, 35, 0.12);
        border: 1px solid rgba(245, 166, 35, 0.3);
        color: #f5a623;
        font-weight: 600;
      }

      .wl-expanded-detail {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--wc-border);
        font-size: 0.82em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
      }

      .wl-detail-row {
        margin-bottom: 4px;
      }

      .wl-detail-label {
        font-weight: 600;
        color: var(--wc-text);
        margin-right: 4px;
      }

      .wl-loading-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border: 2px solid var(--wc-border);
        border-top: 2px solid var(--wc-primary, #6d4c41);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      .wl-actions {
        flex-shrink: 0;
      }

      .wl-add-btn {
        background: #2e7d32;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
      }

      .wl-add-btn:hover { background: #1b5e20; }

      .wl-add-btn.added {
        background: #546e7a;
        cursor: default;
      }

      .wl-buy-btn {
        background: #e65100;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
        margin-top: 4px;
      }

      .wl-buy-btn:hover { background: #bf360c; }

      .wl-buy-btn.added {
        background: #546e7a;
        cursor: default;
      }

      .footer-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px 16px;
        border-top: 1px solid var(--wc-border);
        justify-content: center;
        flex-wrap: wrap;
      }

      .footer-actions .btn {
        font-size: 0.8em;
        padding: 6px 12px;
      }

      @media (max-width: 599px) {
        .wine-list-results {
          max-height: 65vh;
        }
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("open") && this.open) {
      // Reset when opening
      this._phase = "capture";
      this._wines = [];
      this._restaurantName = null;
      this._currency = "USD";
      this._error = "";
      this._enriching = false;
      this._aiEnriching = false;
      this._expandedIndex = null;
      this._addedIndices = new Set();
      this._buyListIndices = new Set();
      this._cancelEnrichment = false;
    }
  }

  private _close() {
    this._cancelEnrichment = true;
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private async _onPhotoCaptured(e: CustomEvent) {
    this._phase = "extracting";
    this._error = "";

    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/extract_wine_list",
        image: e.detail.image,
      });

      if (result.error) {
        this._error = result.error;
        this._phase = "capture";
        return;
      }

      const data = result;
      if (!data || !Array.isArray(data.wines)) {
        this._error = "No wines found in the image. Try a clearer photo.";
        this._phase = "capture";
        return;
      }
      const baseIndex = this._wines.length;
      const newWines: WineListItem[] = data.wines.map((w: any, i: number) => ({
        ...w,
        index: baseIndex + i,
        vivino_rating: null,
        vivino_ratings_count: null,
        vivino_price: null,
        vivino_image_url: "",
        ai_ratings: null,
        ai_description: "",
        ai_disposition: "",
        ai_drink_window: "",
        ai_estimated_price: null,
        vivino_status: "pending" as const,
        ai_status: "pending" as const,
      }));

      this._wines = [...this._wines, ...newWines];
      this._restaurantName = data.restaurant_name || this._restaurantName;
      this._currency = data.currency || "USD";
      this._phase = "results";

      // Auto-start Vivino enrichment for new wines
      this._startVivinoEnrichment();
    } catch (err: any) {
      this._error = `Extraction failed: ${err?.message || err}`;
      this._phase = "capture";
    }
  }

  private async _startVivinoEnrichment() {
    this._enriching = true;
    this._cancelEnrichment = false;

    for (const wine of this._wines) {
      if (this._cancelEnrichment) break;
      if (wine.vivino_status !== "pending") continue;

      wine.vivino_status = "loading";
      this._wines = [...this._wines];

      try {
        const resp = await this.hass.callWS({
          type: "wine_cellar/enrich_wine_vivino",
          wine: {
            name: wine.name,
            winery: wine.winery,
            vintage: wine.vintage,
            type: wine.type,
          },
        });

        if (resp.result) {
          wine.vivino_rating = resp.result.rating;
          wine.vivino_ratings_count = resp.result.ratings_count;
          wine.vivino_price = resp.result.price || null;
          wine.vivino_image_url = resp.result.image_url || "";
        }
        wine.vivino_status = "done";
      } catch {
        wine.vivino_status = "error";
      }

      this._wines = [...this._wines];
      // Rate limit
      await new Promise((r) => setTimeout(r, 1000));
    }

    this._enriching = false;
  }

  private async _startAIEnrichment() {
    this._aiEnriching = true;
    this._cancelEnrichment = false;

    for (const wine of this._wines) {
      if (this._cancelEnrichment) break;
      if (wine.ai_status !== "pending") continue;

      wine.ai_status = "loading";
      this._wines = [...this._wines];

      try {
        const resp = await this.hass.callWS({
          type: "wine_cellar/analyze_wine_transient",
          wine: {
            name: wine.name,
            winery: wine.winery,
            vintage: wine.vintage,
            type: wine.type,
            region: wine.region,
            country: wine.country,
            grape_variety: wine.grape_variety,
          },
        });

        if (resp.result) {
          const r = resp.result;
          const ratings: Record<string, number> = {};
          for (const key of ["rating_ws", "rating_rp", "rating_jd", "rating_ag"]) {
            const val = r[key];
            if (val && typeof val === "number" && val >= 50 && val <= 100) {
              ratings[key] = val;
            }
          }
          wine.ai_ratings = Object.keys(ratings).length ? ratings : null;
          wine.ai_description = r.description || "";
          wine.ai_disposition = r.disposition || "";
          wine.ai_drink_window = r.drink_window || "";
          wine.ai_estimated_price = r.estimated_price || null;
        }
        wine.ai_status = "done";
      } catch {
        wine.ai_status = "error";
      }

      this._wines = [...this._wines];
      await new Promise((r) => setTimeout(r, 500));
    }

    this._aiEnriching = false;
  }

  private async _addToCellar(wine: WineListItem) {
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_wine",
        wine: {
          name: wine.name,
          winery: wine.winery,
          vintage: wine.vintage,
          type: wine.type,
          region: wine.region,
          country: wine.country,
          grape_variety: wine.grape_variety,
          rating: wine.vivino_rating,
          ratings_count: wine.vivino_ratings_count,
          image_url: wine.vivino_image_url,
          price: wine.list_price,
          retail_price: wine.vivino_price || wine.ai_estimated_price,
          description: wine.ai_description,
          ai_ratings: wine.ai_ratings,
          disposition: wine.ai_disposition,
          drink_window: wine.ai_drink_window,
        },
      });
      this._addedIndices = new Set([...this._addedIndices, wine.index]);
      this.dispatchEvent(
        new CustomEvent("wine-added", { bubbles: true, composed: true })
      );
    } catch (err) {
      console.error("Failed to add wine from list", err);
    }
  }

  private async _addToBuyList(wine: WineListItem) {
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_to_buy_list",
        wine: {
          name: wine.name,
          winery: wine.winery,
          vintage: wine.vintage,
          type: wine.type,
          region: wine.region,
          country: wine.country,
          grape_variety: wine.grape_variety,
          rating: wine.vivino_rating,
          ratings_count: wine.vivino_ratings_count,
          image_url: wine.vivino_image_url,
          price: wine.list_price,
          retail_price: wine.vivino_price || wine.ai_estimated_price,
          description: wine.ai_description,
          ai_ratings: wine.ai_ratings,
          disposition: wine.ai_disposition,
          drink_window: wine.ai_drink_window,
        },
      });
      this._buyListIndices = new Set([...this._buyListIndices, wine.index]);
      this.dispatchEvent(
        new CustomEvent("buy-list-updated", { bubbles: true, composed: true })
      );
    } catch (err) {
      console.error("Failed to add wine to buy list", err);
    }
  }

  private _scanAnotherPage() {
    this._phase = "capture";
    this._error = "";
  }

  private _formatPrice(amount: number | null, currency: string = "USD"): string {
    if (amount === null || amount === undefined) return "---";
    const symbols: Record<string, string> = {
      USD: "$", EUR: "\u20AC", GBP: "\u00A3", JPY: "\u00A5",
      CHF: "CHF ", AUD: "A$", CAD: "C$",
    };
    const sym = symbols[currency] || `${currency} `;
    return `${sym}${amount.toFixed(0)}`;
  }

  private _calcMarkup(
    listPrice: number | null,
    marketPrice: number | null
  ): { text: string; color: string } | null {
    if (!listPrice || !marketPrice || marketPrice <= 0) return null;
    const pct = ((listPrice - marketPrice) / marketPrice) * 100;
    const text = `${pct >= 0 ? "+" : ""}${Math.round(pct)}%`;
    const ratio = listPrice / marketPrice;
    const color =
      ratio <= 1.5 ? "#2e7d32" : ratio <= 2.5 ? "#f57f17" : "#c62828";
    return { text, color };
  }

  private _getValueBadge(
    wine: WineListItem
  ): { label: string; color: string } | null {
    const listPrice = wine.list_price;
    const marketPrice = wine.vivino_price || wine.ai_estimated_price;
    if (!listPrice || !marketPrice) return null;
    const ratio = listPrice / marketPrice;
    if (ratio <= 1.5) return { label: "Great Value", color: "#2e7d32" };
    if (ratio <= 2.0) return { label: "Fair Price", color: "#558b2f" };
    if (ratio <= 3.0) return { label: "Typical", color: "#f57f17" };
    return { label: "Premium", color: "#c62828" };
  }

  private _showWineDetail(wine: WineListItem) {
    // Convert WineListItem to Wine-like object for the detail dialog
    this._detailWine = {
      id: `winelist-${wine.index}`,
      barcode: "",
      name: wine.name,
      winery: wine.winery,
      region: wine.region,
      country: wine.country,
      vintage: wine.vintage || 0,
      type: wine.type || "red",
      grape_variety: wine.grape_variety,
      rating: wine.vivino_rating || 0,
      ratings_count: wine.vivino_ratings_count || 0,
      image_url: wine.vivino_image_url || "",
      price: wine.list_price || 0,
      retail_price: wine.vivino_price || wine.ai_estimated_price || 0,
      purchase_date: "",
      drink_by: "",
      drink_window: wine.ai_drink_window || "",
      notes: "",
      description: wine.ai_description || "",
      food_pairings: "",
      alcohol: "",
      cabinet_id: "",
      row: null as any,
      col: null as any,
      depth: 0,
      zone: "",
      disposition: wine.ai_disposition || "",
      ai_ratings: wine.ai_ratings as any,
      added_at: "",
    } as Wine;
    this._showDetail = true;
  }

  private _renderWineItem(wine: WineListItem) {
    const typeColor = WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red;
    const expanded = this._expandedIndex === wine.index;
    const added = this._addedIndices.has(wine.index);
    const marketPrice = wine.vivino_price || wine.ai_estimated_price;
    const markup = this._calcMarkup(wine.list_price, marketPrice);
    const valueBadge = this._getValueBadge(wine);

    return html`
      <div
        class="wine-list-item ${expanded ? "expanded" : ""}"
        @click=${() => this._showWineDetail(wine)}
      >
        <div class="wl-type-dot" style="background: ${typeColor}"></div>
        ${wine.vivino_image_url
          ? html`<img class="wl-thumb" src="${wine.vivino_image_url}" alt="" />`
          : nothing}
        <div class="wl-info">
          <div class="wl-name">${wine.winery ? `${wine.winery} ` : ""}${wine.name}</div>
          <div class="wl-meta">
            ${wine.vintage || "NV"} ${wine.region ? `\u2022 ${wine.region}` : ""}
            ${wine.grape_variety ? `\u2022 ${wine.grape_variety}` : ""}
          </div>

          <!-- Prices -->
          <div class="wl-price-row">
            ${wine.list_price !== null
              ? html`<span class="wl-list-price">${this._formatPrice(wine.list_price, this._currency)}</span>`
              : nothing}
            ${marketPrice
              ? html`<span class="wl-market-price">${this._formatPrice(marketPrice, "USD")}</span>`
              : nothing}
            ${markup
              ? html`<span class="wl-markup-badge" style="background:${markup.color}">${markup.text}</span>`
              : nothing}
            ${valueBadge
              ? html`<span class="wl-value-badge" style="background:${valueBadge.color}">${valueBadge.label}</span>`
              : nothing}
          </div>

          <!-- Scores row -->
          <div class="wl-scores">
            ${wine.vivino_status === "loading"
              ? html`<span class="wl-loading-dot"></span>`
              : wine.vivino_rating
                ? html`<span class="wl-vivino-rating">\u2605 ${wine.vivino_rating.toFixed(1)}</span>`
                : nothing}
            ${wine.ai_status === "loading"
              ? html`<span class="wl-loading-dot"></span>`
              : nothing}
            ${wine.ai_ratings
              ? html`
                  <div class="wl-ai-chips">
                    ${wine.ai_ratings.rating_ws ? html`<span class="wl-ai-chip">WS ${wine.ai_ratings.rating_ws}</span>` : nothing}
                    ${wine.ai_ratings.rating_rp ? html`<span class="wl-ai-chip">RP ${wine.ai_ratings.rating_rp}</span>` : nothing}
                    ${wine.ai_ratings.rating_jd ? html`<span class="wl-ai-chip">JD ${wine.ai_ratings.rating_jd}</span>` : nothing}
                    ${wine.ai_ratings.rating_ag ? html`<span class="wl-ai-chip">AG ${wine.ai_ratings.rating_ag}</span>` : nothing}
                  </div>
                `
              : nothing}
          </div>

          <!-- Expanded details -->
          ${expanded
            ? html`
                <div class="wl-expanded-detail">
                  ${wine.ai_description
                    ? html`<div class="wl-detail-row" style="font-style:italic">${wine.ai_description}</div>`
                    : nothing}
                  ${wine.ai_drink_window
                    ? html`<div class="wl-detail-row"><span class="wl-detail-label">Drink window:</span>${wine.ai_drink_window}</div>`
                    : nothing}
                  ${wine.glass_price
                    ? html`<div class="wl-detail-row"><span class="wl-detail-label">By the glass:</span>${this._formatPrice(wine.glass_price, this._currency)}</div>`
                    : nothing}
                  ${wine.bottle_size && wine.bottle_size !== "750ml"
                    ? html`<div class="wl-detail-row"><span class="wl-detail-label">Size:</span>${wine.bottle_size}</div>`
                    : nothing}
                  ${wine.vivino_ratings_count
                    ? html`<div class="wl-detail-row"><span class="wl-detail-label">Vivino:</span>${wine.vivino_rating?.toFixed(1)} (${wine.vivino_ratings_count.toLocaleString()} ratings)</div>`
                    : nothing}
                </div>
              `
            : nothing}
        </div>

        <div class="wl-actions" @click=${(e: Event) => e.stopPropagation()}>
          <button
            class="wl-add-btn ${added ? "added" : ""}"
            ?disabled=${added}
            @click=${() => !added && this._addToCellar(wine)}
          >
            ${added ? "\u2713" : "+ Add"}
          </button>
          <button
            class="wl-buy-btn ${this._buyListIndices.has(wine.index) ? "added" : ""}"
            ?disabled=${this._buyListIndices.has(wine.index)}
            @click=${() => !this._buyListIndices.has(wine.index) && this._addToBuyList(wine)}
          >
            ${this._buyListIndices.has(wine.index) ? "\u2713" : "\uD83D\uDED2 Buy"}
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    const vivinoDone = this._wines.filter(
      (w) => w.vivino_status === "done" || w.vivino_status === "error"
    ).length;
    const aiDone = this._wines.filter(
      (w) => w.ai_status === "done" || w.ai_status === "error"
    ).length;
    const total = this._wines.length;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:600px" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <span class="header-title">
              ${this._phase === "capture"
                ? "\uD83C\uDF7D\uFE0F Scan List"
                : this._restaurantName
                  ? `\uD83C\uDF7D\uFE0F ${this._restaurantName}`
                  : "\uD83C\uDF7D\uFE0F Scanned List"}
            </span>
            <button class="close-btn" @click=${this._close}>\u2715</button>
          </div>

          ${this._phase === "capture"
            ? html`
                ${this._error
                  ? html`<div class="error-msg">${this._error}</div>`
                  : nothing}
                ${this._wines.length > 0
                  ? html`<div class="header-subtitle">${this._wines.length} wines already scanned. Take another photo to add more.</div>`
                  : html`<div class="header-subtitle">Take a photo of a wine list or receipt to see ratings, scores, and value.</div>`}
                <div style="padding: 0 16px 16px">
                  <label-camera .active=${this._phase === "capture"} @photo-captured=${this._onPhotoCaptured}></label-camera>
                </div>
                ${this._wines.length > 0
                  ? html`
                      <div class="footer-actions">
                        <button class="btn btn-primary" @click=${() => (this._phase = "results")}>
                          Back to Results (${this._wines.length})
                        </button>
                      </div>
                    `
                  : nothing}
              `
            : nothing}

          ${this._phase === "extracting"
            ? html`
                <div class="extracting">
                  <div class="spinner"></div>
                  <div>Analyzing list...</div>
                  <div style="font-size:0.85em">Gemini is reading the image</div>
                </div>
              `
            : nothing}

          ${this._phase === "results"
            ? html`
                <div class="header-subtitle">
                  ${total} wine${total !== 1 ? "s" : ""} found
                  ${this._currency !== "USD" ? ` \u2022 Prices in ${this._currency}` : ""}
                </div>

                <!-- Vivino enrichment progress -->
                ${this._enriching
                  ? html`
                      <div class="enrichment-bar">
                        <span>\uD83C\uDF47 Vivino ${vivinoDone}/${total}</span>
                        <div class="progress-track">
                          <div
                            class="progress-fill vivino"
                            style="width: ${total ? (vivinoDone / total) * 100 : 0}%"
                          ></div>
                        </div>
                      </div>
                    `
                  : nothing}

                <!-- AI enrichment progress -->
                ${this._aiEnriching
                  ? html`
                      <div class="enrichment-bar">
                        <span>\uD83E\uDD16 AI ${aiDone}/${total}</span>
                        <div class="progress-track">
                          <div
                            class="progress-fill ai"
                            style="width: ${total ? (aiDone / total) * 100 : 0}%"
                          ></div>
                        </div>
                      </div>
                    `
                  : nothing}

                <div class="wine-list-results">
                  ${this._wines.map((w) => this._renderWineItem(w))}
                </div>

                <div class="footer-actions">
                  ${!this._aiEnriching && this._wines.some((w) => w.ai_status === "pending")
                    ? html`
                        <button
                          class="btn btn-primary"
                          style="background:#1565c0"
                          @click=${this._startAIEnrichment}
                        >
                          \uD83E\uDD16 Get AI Scores
                        </button>
                      `
                    : nothing}
                  <button
                    class="btn btn-primary"
                    style="background:#00695c"
                    @click=${this._scanAnotherPage}
                  >
                    \uD83D\uDCF7 Scan Another Page
                  </button>
                </div>
              `
            : nothing}
        </div>
      </div>

      <!-- Wine detail dialog for wine list items -->
      <wine-detail-dialog
        .wine=${this._detailWine}
        .hass=${this.hass}
        .open=${this._showDetail}
        .hasGemini=${this.hasGemini}
        .mode=${"winelist"}
        @close=${() => (this._showDetail = false)}
      ></wine-detail-dialog>
    `;
  }
}
