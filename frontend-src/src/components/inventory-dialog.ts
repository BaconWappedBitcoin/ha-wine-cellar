import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Wine, Cabinet, WineType, WINE_TYPE_COLORS, WINE_TYPE_LABELS } from "../models";
import { sharedStyles } from "../styles";
import "./wine-detail-dialog";

type SortField = "name" | "winery" | "vintage" | "type" | "rating" | "price" | "added_at" | "cabinet";
type SortDir = "asc" | "desc";

@customElement("inventory-dialog")
export class InventoryDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) wines: Wine[] = [];
  @property({ attribute: false }) cabinets: Cabinet[] = [];
  @property({ type: Boolean }) hasGemini = false;

  @state() private _searchQuery = "";
  @state() private _typeFilter = "all";
  @state() private _sortField: SortField = "name";
  @state() private _sortDir: SortDir = "asc";
  @state() private _detailWine: Wine | null = null;
  @state() private _showDetail = false;

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

      .inv-chips {
        display: flex;
        gap: 4px;
        padding: 0 16px 10px;
        flex-wrap: wrap;
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
        width: 32px;
        height: 44px;
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
      }

      .inv-count {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
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
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("open") && this.open) {
      this._searchQuery = "";
      this._typeFilter = "all";
      this._sortField = "name";
      this._sortDir = "asc";
      this._showDetail = false;
      this._detailWine = null;
    }
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _getFilteredAndSortedWines(): Wine[] {
    let wines = [...this.wines];

    if (this._typeFilter !== "all") {
      wines = wines.filter((w) => w.type === this._typeFilter);
    }

    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      wines = wines.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.winery.toLowerCase().includes(q) ||
          (w.region || "").toLowerCase().includes(q) ||
          (w.country || "").toLowerCase().includes(q) ||
          (w.grape_variety || "").toLowerCase().includes(q) ||
          (w.type || "").toLowerCase().includes(q) ||
          (w.notes || "").toLowerCase().includes(q) ||
          (w.description || "").toLowerCase().includes(q) ||
          String(w.vintage || "").includes(q) ||
          (w.barcode || "").includes(q)
      );
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
        case "price":
          return dir * ((a.retail_price || a.price || 0) - (b.retail_price || b.price || 0));
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

  private _exportCSV() {
    const wines = this._getFilteredAndSortedWines();
    const headers = [
      "Name",
      "Winery",
      "Vintage",
      "Type",
      "Region",
      "Country",
      "Grape Variety",
      "Rating",
      "Ratings Count",
      "Purchase Price",
      "Retail Price",
      "Purchase Date",
      "Drink By",
      "Drink Window",
      "Disposition",
      "Notes",
      "Description",
      "Food Pairings",
      "Alcohol",
      "Cabinet",
      "Row",
      "Col",
      "Zone",
      "Depth",
      "User Rating",
      "Added At",
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = wines.map((w) =>
      [
        w.name,
        w.winery,
        w.vintage,
        w.type,
        w.region,
        w.country,
        w.grape_variety,
        w.rating,
        w.ratings_count,
        w.price,
        w.retail_price,
        w.purchase_date,
        w.drink_by,
        w.drink_window,
        w.disposition,
        w.notes,
        w.description,
        w.food_pairings,
        w.alcohol,
        this.cabinets.find((c) => c.id === w.cabinet_id)?.name || "",
        w.row !== null ? w.row + 1 : "",
        w.col !== null ? w.col + 1 : "",
        w.zone,
        w.depth,
        w.user_rating,
        w.added_at,
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wine-cellar-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private _showWineDetail(wine: Wine) {
    this._detailWine = wine;
    this._showDetail = true;
  }

  private _renderWineItem(wine: Wine) {
    const typeColor = WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red;
    const cabinetName = this.cabinets.find((c) => c.id === wine.cabinet_id)?.name || "";
    let location = "Unassigned";
    if (cabinetName) {
      if (wine.row !== null && wine.col !== null) {
        location = `${cabinetName} R${wine.row + 1}C${wine.col + 1}`;
      } else if (wine.zone) {
        location = `${cabinetName}`;
      } else {
        location = cabinetName;
      }
    }
    const displayPrice = wine.retail_price || wine.price;

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
              : nothing}
          </div>
        </div>
        <div class="inv-right">
          ${displayPrice ? html`<div class="inv-price">$${displayPrice.toFixed(0)}</div>` : nothing}
          <div class="inv-location">${location}</div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    const filteredWines = this._getFilteredAndSortedWines();
    const allStats = this._computeStats(this.wines);

    const sortOptions: { value: SortField; label: string }[] = [
      { value: "name", label: "Name" },
      { value: "winery", label: "Winery" },
      { value: "vintage", label: "Vintage" },
      { value: "type", label: "Type" },
      { value: "rating", label: "Rating" },
      { value: "price", label: "Price" },
      { value: "added_at", label: "Date Added" },
      { value: "cabinet", label: "Cabinet" },
    ];

    const filters: { id: string; label: string }[] = [
      { id: "all", label: "All" },
      { id: "red", label: "Red" },
      { id: "white", label: "White" },
      { id: "rosé", label: "Rosé" },
      { id: "sparkling", label: "Sparkling" },
      { id: "dessert", label: "Dessert" },
    ];

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:800px" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Header -->
          <div class="inv-header">
            <span class="inv-header-title">📦 Inventory</span>
            <button class="inv-close" @click=${this._close}>✕</button>
          </div>

          <!-- Summary Stats -->
          <div class="inv-stats">
            <div class="stat">
              <span class="stat-value">${allStats.count}</span> bottles
            </div>
            ${allStats.totalValue
              ? html`
                  <div class="stat">
                    <span class="stat-value"
                      >$${allStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span
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
                }}
                title="${this._sortDir === "asc" ? "Ascending" : "Descending"}"
              >
                ${this._sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <!-- Type Filter Chips -->
          <div class="inv-chips">
            ${filters.map(
              (f) => html`
                <button
                  class="inv-chip ${this._typeFilter === f.id ? "active" : ""}"
                  @click=${() => {
                    this._typeFilter = f.id;
                  }}
                >
                  ${f.label}
                </button>
              `
            )}
          </div>

          <!-- Wine List -->
          <div class="inv-list">
            ${filteredWines.length === 0
              ? html`<div class="inv-empty">No wines match your search</div>`
              : filteredWines.map((w) => this._renderWineItem(w))}
          </div>

          <!-- Footer -->
          <div class="inv-footer">
            <span class="inv-count">
              ${filteredWines.length === this.wines.length
                ? `${filteredWines.length} wines`
                : `${filteredWines.length} of ${this.wines.length} wines`}
            </span>
            <button
              class="btn btn-primary"
              style="font-size:0.8em;padding:6px 14px;background:#2e7d32"
              @click=${this._exportCSV}
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Sub-dialog: Wine Detail -->
      <wine-detail-dialog
        .wine=${this._detailWine}
        .hass=${this.hass}
        .open=${this._showDetail}
        .hasGemini=${this.hasGemini}
        .mode=${"cellar"}
        @close=${() => (this._showDetail = false)}
        @wine-updated=${() => {
          this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
        }}
      ></wine-detail-dialog>
    `;
  }
}
