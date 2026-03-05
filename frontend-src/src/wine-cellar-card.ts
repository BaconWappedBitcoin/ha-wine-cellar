import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { Wine, Cabinet, CellarStats } from "./models";

import "./components/cabinet-grid";
import "./components/wine-detail-dialog";
import "./components/add-wine-dialog";
import "./components/search-bar";
import "./components/rack-settings-dialog";

interface WineCellarCardConfig {
  type: string;
  title?: string;
}

@customElement("wine-cellar-card")
export class WineCellarCard extends LitElement {
  @property({ attribute: false }) hass: any;

  @state() private _config?: WineCellarCardConfig;
  @state() private _wines: Wine[] = [];
  @state() private _cabinets: Cabinet[] = [];
  @state() private _stats: CellarStats | null = null;
  @state() private _activeTab = "all";
  @state() private _searchQuery = "";
  @state() private _searchFilter = "all";
  @state() private _selectedWine: Wine | null = null;
  @state() private _showDetail = false;
  @state() private _showAddDialog = false;
  @state() private _addPreselect = { cabinet: "", row: null as number | null, col: null as number | null, zone: "" };
  @state() private _loading = true;
  @state() private _showRackSettings = false;
  @state() private _copiedWine: Wine | null = null;
  @state() private _analyzing = false;
  @state() private _toast = "";

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      ha-card {
        overflow: hidden;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 8px;
      }

      .title {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--wc-text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title-icon {
        font-size: 1.2em;
      }

      .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .cabinets-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        padding: 12px 16px 16px;
      }

      .wine-list {
        padding: 0 16px 16px;
      }

      .wine-list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .wine-list-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .wine-list-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .wine-list-thumb {
        width: 36px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .wine-list-info {
        flex: 1;
        min-width: 0;
      }

      .wine-list-name {
        font-weight: 500;
        font-size: 0.95em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wine-list-meta {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .wine-list-location {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-align: right;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--wc-text-secondary);
      }

      .empty-state-icon {
        font-size: 3em;
        margin-bottom: 8px;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--wc-text-secondary);
      }

      .copy-banner {
        background: rgba(46, 125, 50, 0.1);
        border: 1px solid rgba(46, 125, 50, 0.3);
        color: #2e7d32;
        font-size: 0.85em;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .copy-banner button {
        background: transparent;
        border: 1px solid rgba(46, 125, 50, 0.4);
        color: #2e7d32;
        border-radius: 6px;
        padding: 2px 10px;
        cursor: pointer;
        font-size: 0.9em;
      }

      .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.9em;
        z-index: 1000;
        animation: fadeIn 0.2s;
        pointer-events: none;
      }

      /* Phone: stack cabinets vertically */
      @media (max-width: 599px) {
        .header-row {
          padding: 12px 12px 6px;
        }
        .title {
          font-size: 1.1em;
        }
        .stats-bar {
          flex-wrap: wrap;
          gap: 8px;
          padding: 6px 12px;
          font-size: 0.8em;
        }
        .cabinets-row {
          grid-template-columns: 1fr;
          gap: 10px;
          padding: 8px 12px 12px;
        }
        .wine-list-item {
          padding: 8px;
          gap: 8px;
        }
        .btn-primary {
          padding: 6px 12px;
          font-size: 0.85em;
        }
      }

      /* Tablet: 2 cabinets side by side */
      @media (min-width: 600px) and (max-width: 1023px) {
        .cabinets-row {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
      }

      /* Desktop: all cabinets side by side */
      @media (min-width: 1024px) {
        .cabinets-row {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
      }
    `,
  ];

  setConfig(config: WineCellarCardConfig) {
    this._config = config;
  }

  static getConfigElement() {
    return document.createElement("wine-cellar-card-editor");
  }

  static getStubConfig() {
    return { type: "custom:wine-cellar-card" };
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadData();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("hass") && this.hass) {
      // Refresh on HA state changes (lightweight check)
    }
  }

  private async _loadData() {
    if (!this.hass) {
      // Retry after hass is set
      setTimeout(() => this._loadData(), 500);
      return;
    }

    this._loading = true;
    try {
      const [winesResult, cabinetsResult, statsResult] = await Promise.all([
        this.hass.callWS({ type: "wine_cellar/get_wines" }),
        this.hass.callWS({ type: "wine_cellar/get_cabinets" }),
        this.hass.callWS({ type: "wine_cellar/get_stats" }),
      ]);

      this._wines = winesResult.wines || [];
      this._cabinets = (cabinetsResult.cabinets || []).sort(
        (a: Cabinet, b: Cabinet) => a.order - b.order
      );
      this._stats = statsResult;
    } catch (err) {
      console.error("Wine Cellar: Failed to load data", err);
    }
    this._loading = false;
  }

  private _getFilteredWines(): Wine[] {
    let wines = [...this._wines];

    // Filter by active tab (cabinet)
    if (this._activeTab !== "all") {
      wines = wines.filter((w) => w.cabinet_id === this._activeTab);
    }

    // Filter by wine type
    if (this._searchFilter !== "all") {
      wines = wines.filter((w) => w.type === this._searchFilter);
    }

    // Filter by search query
    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      wines = wines.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.winery.toLowerCase().includes(q) ||
          w.region.toLowerCase().includes(q) ||
          w.grape_variety.toLowerCase().includes(q)
      );
    }

    return wines;
  }

  private _showToast(message: string) {
    this._toast = message;
    setTimeout(() => (this._toast = ""), 2500);
  }

  // --- Copy/Paste wine ---
  private _onCellClick(e: CustomEvent) {
    const { wine, cabinet, row, col } = e.detail;

    // If we have a copied wine and clicked an empty cell, paste it
    if (this._copiedWine && !wine) {
      this._pasteWine(cabinet.id, row, col);
      return;
    }

    if (wine) {
      this._selectedWine = wine;
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row, col, zone: "" };
      this._showAddDialog = true;
    }
  }

  private _onZoneClick(e: CustomEvent) {
    const { wine, cabinet, zone } = e.detail;
    if (wine) {
      this._selectedWine = wine;
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row: null, col: null, zone: zone || "bottom" };
      this._showAddDialog = true;
    }
  }

  private _copyWine(wine: Wine) {
    this._copiedWine = wine;
    this._showToast(`Copied "${wine.name}" — tap empty cells to paste`);
    this._showDetail = false;
  }

  private async _pasteWine(cabinetId: string, row: number, col: number) {
    if (!this._copiedWine) return;
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_wine",
        wine: {
          barcode: this._copiedWine.barcode,
          name: this._copiedWine.name,
          winery: this._copiedWine.winery,
          region: this._copiedWine.region,
          country: this._copiedWine.country,
          vintage: this._copiedWine.vintage,
          type: this._copiedWine.type,
          grape_variety: this._copiedWine.grape_variety,
          rating: this._copiedWine.rating,
          image_url: this._copiedWine.image_url,
          price: this._copiedWine.price,
          drink_by: this._copiedWine.drink_by,
          notes: this._copiedWine.notes,
          description: this._copiedWine.description,
          food_pairings: this._copiedWine.food_pairings,
          alcohol: this._copiedWine.alcohol,
          ratings_count: this._copiedWine.ratings_count,
          cabinet_id: cabinetId,
          row,
          col,
          zone: "",
          user_rating: this._copiedWine.user_rating,
          disposition: this._copiedWine.disposition,
        },
      });
      this._showToast("Wine pasted! Tap more empty cells or click ✕ to stop.");
      await this._loadData();
    } catch {
      this._showToast("Failed to paste wine.");
    }
  }

  // --- AI Analysis ---
  private async _analyzeWines() {
    this._analyzing = true;
    this._showToast("Analyzing wines with AI...");
    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/analyze_wines",
      });
      if (result.error) {
        this._showToast(`Analysis failed: ${result.error}`);
      } else {
        this._showToast(
          `Analysis complete! ${result.updated}/${result.total} wines updated.`
        );
        await this._loadData();
      }
    } catch (err: any) {
      this._showToast("Analysis failed.");
    }
    this._analyzing = false;
  }

  private async _onRemoveWine(e: CustomEvent) {
    try {
      await this.hass.callWS({
        type: "wine_cellar/remove_wine",
        wine_id: e.detail.wine_id,
      });
      await this._loadData();
    } catch (err) {
      console.error("Failed to remove wine", err);
    }
  }

  private async _onWineAdded() {
    await this._loadData();
  }

  private _onSearch(e: CustomEvent) {
    this._searchQuery = e.detail.query;
    this._searchFilter = e.detail.filter;
  }

  private _getCabinetWines(cabinetId: string): Wine[] {
    return this._wines.filter((w) => w.cabinet_id === cabinetId);
  }

  render() {
    if (this._loading) {
      return html`
        <ha-card>
          <div class="loading">Loading wine cellar...</div>
        </ha-card>
      `;
    }

    const title = this._config?.title || "Wine Cellar";
    const filteredWines = this._getFilteredWines();
    const isSearching = !!(this._searchQuery || this._searchFilter !== "all");
    const showGrid = !isSearching && (this._activeTab === "all" || this._cabinets.some((c) => c.id === this._activeTab));

    return html`
      <ha-card>
        <div class="header-row">
          <div class="title">
            <span class="title-icon">🍷</span>
            ${title}
          </div>
          <div class="header-actions">
            <button
              class="btn btn-primary"
              style="font-size: 0.85em; padding: 6px 14px; background: #1565c0;"
              @click=${this._analyzeWines}
              title="AI Drink/Hold Analysis"
              ?disabled=${this._analyzing}
            >
              ${this._analyzing ? "Analyzing..." : "AI Scan"}
            </button>
            <button
              class="btn btn-icon"
              @click=${() => (this._showRackSettings = true)}
              title="Manage Racks"
            >
              ⚙️
            </button>
            <button
              class="btn btn-primary"
              @click=${() => {
                this._addPreselect = { cabinet: "", row: null, col: null, zone: "" };
                this._showAddDialog = true;
              }}
            >
              + Add Wine
            </button>
          </div>
        </div>

        <!-- Copy mode banner -->
        ${this._copiedWine
          ? html`
              <div class="copy-banner">
                <span>📋 Copying "${this._copiedWine.name}" — tap empty cells to place copies</span>
                <button @click=${() => (this._copiedWine = null)}>✕ Done</button>
              </div>
            `
          : nothing}

        <!-- Stats bar -->
        ${this._stats
          ? html`
              <div class="stats-bar">
                <div class="stat">
                  <span class="stat-value">${this._stats.total_bottles}</span>
                  bottles
                </div>
                <div class="stat">
                  <span class="stat-value">${this._stats.total_capacity}</span>
                  capacity
                </div>
                <div class="stat">
                  <span class="stat-value">${this._stats.available_slots}</span>
                  available
                </div>
                ${this._stats.total_value
                  ? html`
                      <div class="stat">
                        <span class="stat-value">$${this._stats.total_value.toLocaleString()}</span>
                        value
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}

        <!-- Tab bar -->
        <div class="tab-bar">
          <button
            class="tab ${this._activeTab === "all" ? "active" : ""}"
            @click=${() => (this._activeTab = "all")}
          >
            All Sections
          </button>
          ${this._cabinets.map(
            (cab) => html`
              <button
                class="tab ${this._activeTab === cab.id ? "active" : ""}"
                @click=${() => (this._activeTab = cab.id)}
              >
                ${cab.name}
                (${this._getCabinetWines(cab.id).length})
              </button>
            `
          )}
        </div>

        <!-- Search bar -->
        <wine-search-bar @search-change=${this._onSearch}></wine-search-bar>

        <!-- Cabinet grids -->
        ${showGrid
          ? html`
              <div class="cabinets-row">
                ${this._activeTab === "all"
                  ? this._cabinets.map(
                      (cab) => html`
                        <cabinet-grid
                          .cabinet=${cab}
                          .wines=${this._getCabinetWines(cab.id)}
                          @cell-click=${this._onCellClick}
                          @zone-click=${this._onZoneClick}
                        ></cabinet-grid>
                      `
                    )
                  : this._cabinets
                      .filter((c) => c.id === this._activeTab)
                      .map(
                        (cab) => html`
                          <cabinet-grid
                            .cabinet=${cab}
                            .wines=${this._getCabinetWines(cab.id)}
                            @cell-click=${this._onCellClick}
                            @zone-click=${this._onZoneClick}
                          ></cabinet-grid>
                        `
                      )}
              </div>
            `
          : nothing}

        <!-- Filtered wine list (shown when searching or filtering) -->
        ${isSearching
          ? html`
              <div class="wine-list">
                ${filteredWines.length === 0
                  ? html`
                      <div class="empty-state">
                        <div>No wines match your search</div>
                      </div>
                    `
                  : filteredWines.map((wine) => {
                      const cabinetName =
                        this._cabinets.find((c) => c.id === wine.cabinet_id)
                          ?.name || "Unassigned";
                      return html`
                        <div
                          class="wine-list-item"
                          @click=${() => {
                            this._selectedWine = wine;
                            this._showDetail = true;
                          }}
                        >
                          ${wine.image_url
                            ? html`<img class="wine-list-thumb" src="${wine.image_url}" alt="" />`
                            : html`<div
                                class="wine-list-dot"
                                style="background: ${
                                  wine.type === "red"
                                    ? "#722F37"
                                    : wine.type === "white"
                                      ? "#F5E6CA"
                                      : wine.type === "rosé"
                                        ? "#E8A0BF"
                                        : wine.type === "sparkling"
                                          ? "#D4E09B"
                                          : "#DAA520"
                                }"
                              ></div>`}
                          <div class="wine-list-info">
                            <div class="wine-list-name">${wine.name}</div>
                            <div class="wine-list-meta">
                              ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}
                              ${wine.rating ? ` · ★${wine.rating}` : ""}
                              ${wine.disposition
                                ? html` · <span style="color: ${
                                    wine.disposition === "D" ? "#2e7d32" :
                                    wine.disposition === "H" ? "#1565c0" :
                                    wine.disposition === "P" ? "#c62828" : "inherit"
                                  }">${
                                    wine.disposition === "D" ? "Drink" :
                                    wine.disposition === "H" ? "Hold" :
                                    wine.disposition === "P" ? "Past Peak" : ""
                                  }</span>`
                                : nothing}
                            </div>
                          </div>
                          <div class="wine-list-location">${cabinetName}</div>
                        </div>
                      `;
                    })}
              </div>
            `
          : nothing}

        <!-- Empty state -->
        ${this._wines.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon">🍾</div>
                <div style="font-weight: 500; margin-bottom: 4px">
                  Your cellar is empty
                </div>
                <div style="font-size: 0.9em">
                  Tap "Add Wine" to start building your collection
                </div>
              </div>
            `
          : nothing}

        <!-- Wine Detail Dialog -->
        <wine-detail-dialog
          .wine=${this._selectedWine}
          .hass=${this.hass}
          .open=${this._showDetail}
          @close=${() => (this._showDetail = false)}
          @remove-wine=${this._onRemoveWine}
          @wine-updated=${() => this._loadData()}
          @copy-wine=${(e: CustomEvent) => this._copyWine(e.detail.wine)}
          @move-wine=${(e: CustomEvent) => {
            this._showDetail = false;
            this._addPreselect = { cabinet: "", row: null, col: null, zone: "" };
            // TODO: implement move flow
          }}
        ></wine-detail-dialog>

        <!-- Add Wine Dialog -->
        <add-wine-dialog
          .open=${this._showAddDialog}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .preselectedCabinet=${this._addPreselect.cabinet}
          .preselectedRow=${this._addPreselect.row}
          .preselectedCol=${this._addPreselect.col}
          .preselectedZone=${this._addPreselect.zone}
          @close=${() => (this._showAddDialog = false)}
          @wine-added=${this._onWineAdded}
        ></add-wine-dialog>

        <!-- Rack Settings Dialog -->
        <rack-settings-dialog
          .open=${this._showRackSettings}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .wines=${this._wines}
          @close=${() => (this._showRackSettings = false)}
          @racks-updated=${() => this._loadData()}
        ></rack-settings-dialog>

        <!-- Toast -->
        ${this._toast ? html`<div class="toast">${this._toast}</div>` : nothing}
      </ha-card>
    `;
  }

  getCardSize() {
    return 6;
  }
}

// Register the card with Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "wine-cellar-card",
  name: "Wine Cellar",
  description: "Track your wine collection with visual cabinet layout",
  preview: true,
});
