import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { Wine, Cabinet, CellarStats } from "./models";

import "./components/cabinet-grid";
import "./components/wine-detail-dialog";
import "./components/add-wine-dialog";
import "./components/search-bar";

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
  @state() private _addPreselect = { cabinet: "", row: null as number | null, col: null as number | null };
  @state() private _loading = true;

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

  private _onCellClick(e: CustomEvent) {
    const { wine, cabinet, row, col } = e.detail;
    if (wine) {
      this._selectedWine = wine;
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row, col };
      this._showAddDialog = true;
    }
  }

  private _onZoneClick(e: CustomEvent) {
    const { wine, cabinet } = e.detail;
    if (wine) {
      this._selectedWine = wine;
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row: null, col: null };
      this._showAddDialog = true;
    }
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
    const showGrid = this._activeTab === "all" || this._cabinets.some((c) => c.id === this._activeTab);

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
              @click=${() => {
                this._addPreselect = { cabinet: "", row: null, col: null };
                this._showAddDialog = true;
              }}
            >
              + Add Wine
            </button>
          </div>
        </div>

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

        <!-- Filtered wine list (shown when searching) -->
        ${this._searchQuery || this._searchFilter !== "all"
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
                          <div
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
                          ></div>
                          <div class="wine-list-info">
                            <div class="wine-list-name">${wine.name}</div>
                            <div class="wine-list-meta">
                              ${wine.winery}${wine.vintage ? ` · ${wine.vintage}` : ""}
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
          .open=${this._showDetail}
          @close=${() => (this._showDetail = false)}
          @remove-wine=${this._onRemoveWine}
          @move-wine=${(e: CustomEvent) => {
            this._showDetail = false;
            this._addPreselect = { cabinet: "", row: null, col: null };
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
          @close=${() => (this._showAddDialog = false)}
          @wine-added=${this._onWineAdded}
        ></add-wine-dialog>
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
