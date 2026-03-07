import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { Wine, Cabinet, CellarStats, WINE_TYPE_COLORS, WineType } from "./models";

import "./components/cabinet-grid";
import "./components/wine-detail-dialog";
import "./components/add-wine-dialog";
import "./components/search-bar";
import "./components/rack-settings-dialog";
import "./components/wine-list-dialog";

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
  @state() private _detailMode: "cellar" | "buylist" | "winelist" = "cellar";
  @state() private _showAddDialog = false;
  @state() private _addPreselect = { cabinet: "", row: null as number | null, col: null as number | null, zone: "", depth: 0 };
  @state() private _loading = true;
  @state() private _showRackSettings = false;
  @state() private _copiedWine: Wine | null = null;
  @state() private _movingWine: Wine | null = null;
  @state() private _analyzing = false;
  @state() private _batchVivino = false;
  @state() private _toast = "";
  @state() private _hasGemini = false;
  @state() private _showWineList = false;
  @state() private _buyList: Wine[] = [];
  @state() private _addToBuyListMode = false;
  @state() private _movingBuyListItem: Wine | null = null;

  // Depth side panel
  @state() private _depthPanelOpen = false;
  @state() private _depthPanelCabinet: Cabinet | null = null;
  @state() private _depthPanelRow: number | null = null;
  @state() private _depthPanelCol: number | null = null;
  @state() private _depthPanelWines: Wine[] = [];
  @state() private _depthPanelMaxDepth = 1;

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
        flex-wrap: wrap;
        justify-content: flex-end;
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
        background: var(--wc-hover);
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

      .buy-list-view {
        padding: 0 16px 16px;
      }

      .buy-list-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        margin-bottom: 8px;
        transition: background 0.2s;
      }

      .buy-list-card:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .bl-info {
        flex: 1;
        min-width: 0;
      }

      .bl-name {
        font-weight: 600;
        font-size: 0.9em;
        color: var(--wc-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bl-meta {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .bl-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }

      .bl-cellar-btn {
        background: #2e7d32;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
      }

      .bl-cellar-btn:hover { background: #1b5e20; }

      .bl-remove-btn {
        background: #c62828;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.75em;
        padding: 4px 8px;
        cursor: pointer;
        white-space: nowrap;
      }

      .bl-remove-btn:hover { background: #b71c1c; }

      .buy-list-banner {
        background: rgba(230, 81, 0, 0.1);
        border: 1px solid rgba(230, 81, 0, 0.3);
        color: #e65100;
        font-size: 0.85em;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .buy-list-banner button {
        background: transparent;
        border: 1px solid rgba(230, 81, 0, 0.4);
        color: #e65100;
        border-radius: 6px;
        padding: 2px 10px;
        cursor: pointer;
        font-size: 0.9em;
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
      const [winesResult, cabinetsResult, statsResult, capResult, buyListResult] = await Promise.all([
        this.hass.callWS({ type: "wine_cellar/get_wines" }),
        this.hass.callWS({ type: "wine_cellar/get_cabinets" }),
        this.hass.callWS({ type: "wine_cellar/get_stats" }),
        this.hass.callWS({ type: "wine_cellar/get_capabilities" }).catch(() => ({ has_gemini: false })),
        this.hass.callWS({ type: "wine_cellar/get_buy_list" }).catch(() => ({ buy_list: [] })),
      ]);

      this._wines = winesResult.wines || [];
      this._cabinets = (cabinetsResult.cabinets || []).sort(
        (a: Cabinet, b: Cabinet) => a.order - b.order
      );
      this._stats = statsResult;
      this._hasGemini = capResult?.has_gemini || false;
      this._buyList = buyListResult?.buy_list || [];

      // Refresh selected wine if detail dialog is open
      if (this._selectedWine) {
        const updated = this._wines.find((w: Wine) => w.id === this._selectedWine!.id);
        if (updated) this._selectedWine = updated;
      }

      // Refresh depth panel if open
      this._refreshDepthPanel();
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
          (w.region || "").toLowerCase().includes(q) ||
          (w.grape_variety || "").toLowerCase().includes(q) ||
          (w.type || "").toLowerCase().includes(q) ||
          (w.country || "").toLowerCase().includes(q)
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
    const { wine, wines = [], cabinet, row, col, wineCount = 0, cabinetDepth = 1 } = e.detail;
    const hasRoom = wineCount < cabinetDepth;
    const nextDepth = wineCount;

    // If we have a copied wine and cell has room, paste it
    if (this._copiedWine && hasRoom) {
      this._pasteWine(cabinet.id, row, col, nextDepth);
      return;
    }

    // If we're moving a wine and cell has room, place it here
    if (this._movingWine && hasRoom) {
      this._executeMoveWine(cabinet.id, row, col, "", nextDepth);
      return;
    }

    // If we're placing a buy list item and cell has room, move it to cellar
    if (this._movingBuyListItem && hasRoom) {
      this._executeMoveTocellar(cabinet.id, row, col, "", nextDepth);
      return;
    }

    // For deep cabinets (depth >= 2), open side panel instead of detail
    if (cabinetDepth >= 2) {
      this._openDepthPanel(cabinet, row, col, wines, cabinetDepth);
      return;
    }

    if (wine) {
      this._selectedWine = wine;
      this._detailMode = "cellar";
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row, col, zone: "", depth: 0 };
      this._showAddDialog = true;
    }
  }

  // --- Depth side panel ---
  private _openDepthPanel(cabinet: Cabinet, row: number, col: number, wines: Wine[], maxDepth: number) {
    this._depthPanelCabinet = cabinet;
    this._depthPanelRow = row;
    this._depthPanelCol = col;
    this._depthPanelWines = [...wines].sort((a, b) => (a.depth || 0) - (b.depth || 0));
    this._depthPanelMaxDepth = maxDepth;
    this._depthPanelOpen = true;
  }

  private _closeDepthPanel() {
    this._depthPanelOpen = false;
  }

  private _refreshDepthPanel() {
    if (!this._depthPanelOpen || !this._depthPanelCabinet || this._depthPanelRow === null || this._depthPanelCol === null) return;
    const wines = this._wines.filter(
      (w) => w.cabinet_id === this._depthPanelCabinet!.id && w.row === this._depthPanelRow && w.col === this._depthPanelCol
    );
    this._depthPanelWines = [...wines].sort((a, b) => (a.depth || 0) - (b.depth || 0));
  }

  private _onDepthSlotClick(depthIndex: number, wine?: Wine) {
    if (wine) {
      this._selectedWine = wine;
      this._detailMode = "cellar";
      this._showDetail = true;
    } else {
      this._addPreselect = {
        cabinet: this._depthPanelCabinet!.id,
        row: this._depthPanelRow,
        col: this._depthPanelCol,
        zone: "",
        depth: depthIndex,
      };
      this._showAddDialog = true;
    }
  }

  private _getDepthLabel(index: number): string {
    const labels = ["Front", "2nd", "3rd", "4th", "5th", "6th"];
    return labels[index] || `${index + 1}th`;
  }

  private _onZoneClick(e: CustomEvent) {
    const { wine, cabinet, zone } = e.detail;

    // If we're moving a wine, place it in this zone
    if (this._movingWine && !wine) {
      this._executeMoveWine(cabinet.id, null, null, zone || "bottom");
      return;
    }

    // If we're placing a buy list item, move it to cellar
    if (this._movingBuyListItem && !wine) {
      this._executeMoveTocellar(cabinet.id, null, null, zone || "bottom");
      return;
    }

    if (wine) {
      this._selectedWine = wine;
      this._detailMode = "cellar";
      this._showDetail = true;
    } else {
      this._addPreselect = { cabinet: cabinet.id, row: null, col: null, zone: zone || "bottom", depth: 0 };
      this._showAddDialog = true;
    }
  }

  private async _executeMoveWine(cabinetId: string, row: number | null, col: number | null, zone: string, depth = 0) {
    if (!this._movingWine) return;
    try {
      await this.hass.callWS({
        type: "wine_cellar/move_wine",
        wine_id: this._movingWine.id,
        cabinet_id: cabinetId,
        row,
        col,
        zone,
        depth,
      });
      this._showToast(`Moved "${this._movingWine.name}"`);
      this._movingWine = null;
      await this._loadData();
    } catch (err) {
      console.error("Failed to move wine:", err);
      this._showToast("Failed to move wine");
    }
  }

  private async _onWineDrop(e: CustomEvent) {
    const d = e.detail;
    // Don't drop on same position
    if (d.sourceCabinetId === d.targetCabinetId && d.sourceRow === d.targetRow && d.sourceCol === d.targetCol && d.sourceZone === d.targetZone) return;

    try {
      // Check if target cell has a wine (swap)
      let targetWine: Wine | undefined;
      if (d.targetRow !== null && d.targetCol !== null && !d.targetZone) {
        targetWine = this._wines.find(
          (w) => w.cabinet_id === d.targetCabinetId && w.row === d.targetRow && w.col === d.targetCol
        );
      }

      if (targetWine) {
        // Swap: move target wine to source position first
        await this.hass.callWS({
          type: "wine_cellar/move_wine",
          wine_id: targetWine.id,
          cabinet_id: d.sourceCabinetId,
          row: d.sourceRow,
          col: d.sourceCol,
          zone: d.sourceZone || "",
        });
      }

      // Move dragged wine to target
      await this.hass.callWS({
        type: "wine_cellar/move_wine",
        wine_id: d.wineId,
        cabinet_id: d.targetCabinetId,
        row: d.targetRow,
        col: d.targetCol,
        zone: d.targetZone || "",
      });

      this._showToast(targetWine ? "Swapped wines" : "Wine moved");
      await this._loadData();
    } catch (err) {
      console.error("Failed to move wine:", err);
      this._showToast("Failed to move wine");
    }
  }

  private _copyWine(wine: Wine) {
    this._copiedWine = wine;
    this._showToast(`Copied "${wine.name}" — tap empty cells to paste`);
    this._showDetail = false;
  }

  private async _pasteWine(cabinetId: string, row: number, col: number, depth = 0) {
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
          depth,
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

  // --- Batch AI Analysis ---
  private async _batchAnalyzeWines() {
    this._analyzing = true;
    this._showToast("Running full AI analysis on all wines...");
    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/batch_analyze_wines",
      });
      if (result.error) {
        this._showToast(`AI Batch failed: ${result.error}`);
      } else {
        const parts = [`AI Batch complete! ${result.updated}/${result.total} updated`];
        if (result.errors > 0) parts.push(`(${result.errors} errors)`);
        this._showToast(parts.join(" "));
        await this._loadData();
      }
    } catch (err: any) {
      this._showToast("AI Batch analysis failed.");
    }
    this._analyzing = false;
  }

  // --- Batch Vivino Refresh ---
  private async _batchRefreshVivino() {
    this._batchVivino = true;
    this._showToast("Refreshing all wines from Vivino...");
    try {
      const result = await this.hass.callWS({
        type: "wine_cellar/batch_refresh_vivino",
      });
      if (result.error) {
        this._showToast(`Vivino Batch failed: ${result.error}`);
      } else {
        const parts = [`Vivino Batch complete! ${result.updated}/${result.total} updated`];
        if (result.errors > 0) parts.push(`(${result.errors} errors)`);
        this._showToast(parts.join(" "));
        await this._loadData();
      }
    } catch (err: any) {
      this._showToast("Vivino Batch refresh failed.");
    }
    this._batchVivino = false;
  }

  // --- Buy List ---
  private _showBuyListDetail(item: Wine) {
    this._selectedWine = item;
    this._detailMode = "buylist";
    this._showDetail = true;
  }

  private async _removeBuyListItem(itemId: string) {
    try {
      await this.hass.callWS({
        type: "wine_cellar/remove_from_buy_list",
        item_id: itemId,
      });
      this._showToast("Removed from buy list");
      await this._loadData();
    } catch (err) {
      console.error("Failed to remove from buy list", err);
      this._showToast("Failed to remove from buy list");
    }
  }

  private _startMoveBuyListItem(item: Wine) {
    this._movingBuyListItem = item;
    this._activeTab = "all";
    this._showToast(`Tap a cell to place "${item.name}"`);
  }

  private async _executeMoveTocellar(cabinetId: string, row: number | null, col: number | null, zone: string, depth = 0) {
    if (!this._movingBuyListItem) return;
    try {
      await this.hass.callWS({
        type: "wine_cellar/move_to_cellar",
        item_id: this._movingBuyListItem.id,
        cabinet_id: cabinetId,
        row,
        col,
        zone,
        depth,
      });
      this._showToast(`Moved "${this._movingBuyListItem.name}" to cellar`);
      this._movingBuyListItem = null;
      await this._loadData();
    } catch (err) {
      console.error("Failed to move to cellar:", err);
      this._showToast("Failed to move to cellar");
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
    const isSearching = !!(this._searchQuery || this._searchFilter !== "all");
    const showGrid = !isSearching && this._activeTab !== "buy-list" && (this._activeTab === "all" || this._cabinets.some((c) => c.id === this._activeTab));
    const showBuyList = this._activeTab === "buy-list" && !isSearching;

    return html`
      <ha-card>
        <div class="header-row">
          <div class="title">
            <span class="title-icon">🍷</span>
            ${title}
          </div>
          <div class="header-actions">
            ${this._hasGemini ? html`
              <button
                class="btn btn-primary"
                style="font-size: 0.8em; padding: 5px 10px; background: #1565c0;"
                @click=${this._batchAnalyzeWines}
                title="Full AI analysis on all wines (disposition, ratings, price, description)"
                ?disabled=${this._analyzing || this._batchVivino}
              >
                ${this._analyzing ? "AI Scanning..." : "🤖 AI Batch Scan"}
              </button>
            ` : nothing}
            <button
              class="btn btn-primary"
              style="font-size: 0.8em; padding: 5px 10px; background: #8e24aa;"
              @click=${this._batchRefreshVivino}
              title="Refresh all wines from Vivino (ratings, price, description)"
              ?disabled=${this._batchVivino || this._analyzing}
            >
              ${this._batchVivino ? "Vivino Scanning..." : "🍇 Vivino Batch Scan"}
            </button>
            ${this._hasGemini ? html`
              <button
                class="btn btn-primary"
                style="font-size: 0.8em; padding: 5px 10px; background: #00695c;"
                @click=${() => (this._showWineList = true)}
                title="Scan a restaurant wine list for ratings and value"
              >
                🍽️ Scan Wine List
              </button>
            ` : nothing}
            <button
              class="btn btn-primary"
              style="background: #e65100;"
              @click=${() => { this._addToBuyListMode = true; this._showAddDialog = true; }}
            >
              + Buy List
            </button>
            <button
              class="btn btn-primary"
              @click=${() => {
                this._addPreselect = { cabinet: "", row: null, col: null, zone: "", depth: 0 };
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

        <!-- Move mode banner -->
        ${this._movingWine
          ? html`
              <div class="copy-banner">
                <span>📦 Moving "${this._movingWine.name}" — tap a cell to place it</span>
                <button @click=${() => (this._movingWine = null)}>✕ Cancel</button>
              </div>
            `
          : nothing}

        <!-- Buy list move mode banner -->
        ${this._movingBuyListItem
          ? html`
              <div class="buy-list-banner">
                <span>🛒 Placing "${this._movingBuyListItem.name}" — tap a cell in your cellar</span>
                <button @click=${() => (this._movingBuyListItem = null)}>✕ Cancel</button>
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
                        ${this._stats.total_cost
                          ? html`<span style="font-size:0.75em;color:${this._stats.total_value - this._stats.total_cost >= 0 ? '#2e7d32' : '#c62828'}">${this._stats.total_value - this._stats.total_cost >= 0 ? '+' : ''}$${(this._stats.total_value - this._stats.total_cost).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>`
                          : nothing}
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
          <button
            class="tab ${this._activeTab === "buy-list" ? "active" : ""}"
            @click=${() => (this._activeTab = "buy-list")}
            style="${this._activeTab === "buy-list" ? "border-color: #e65100; color: #e65100;" : ""}"
          >
            Buy List (${this._buyList.length})
          </button>
          <button
            class="tab manage-racks-btn"
            @click=${() => (this._showRackSettings = true)}
          >
            Manage Racks
          </button>
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
                          @wine-drop=${this._onWineDrop}
                          @wine-longpress=${(e: CustomEvent) => {
                            this._movingWine = e.detail.wine;
                            this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
                          }}
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

        <!-- Buy List view -->
        ${showBuyList
          ? html`
              <div class="buy-list-view">
                ${this._buyList.length === 0
                  ? html`
                      <div class="empty-state">
                        <div class="empty-state-icon">🛒</div>
                        <div style="font-weight: 500; margin-bottom: 4px">
                          Your buy list is empty
                        </div>
                        <div style="font-size: 0.9em">
                          Tap "+ Buy List" or use 🛒 Buy in the wine list scanner
                        </div>
                      </div>
                    `
                  : this._buyList.map((item) => {
                      const typeColor =
                        item.type === "red" ? "#722F37"
                          : item.type === "white" ? "#F5E6CA"
                            : item.type === "rosé" ? "#E8A0BF"
                              : item.type === "sparkling" ? "#D4E09B"
                                : "#DAA520";
                      return html`
                        <div class="buy-list-card" @click=${() => this._showBuyListDetail(item)} style="cursor:pointer">
                          ${item.image_url
                            ? html`<img class="wine-list-thumb" src="${item.image_url}" alt="" />`
                            : html`<div class="wine-list-dot" style="background: ${typeColor}"></div>`}
                          <div class="bl-info">
                            <div class="bl-name">${item.name}</div>
                            <div class="bl-meta">
                              ${item.winery}${item.vintage ? ` · ${item.vintage}` : ""}
                              ${item.rating ? ` · ★${item.rating.toFixed(1)}` : ""}
                              ${item.retail_price ? ` · $${item.retail_price}` : ""}
                            </div>
                          </div>
                          <div class="bl-actions">
                            <button
                              class="bl-cellar-btn"
                              @click=${(e: Event) => { e.stopPropagation(); this._startMoveBuyListItem(item); }}
                              title="Move to cellar"
                            >
                              + Cellar
                            </button>
                            <button
                              class="bl-remove-btn"
                              @click=${(e: Event) => { e.stopPropagation(); this._removeBuyListItem(item.id); }}
                              title="Remove from buy list"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      `;
                    })}
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
                            this._detailMode = "cellar";
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
          .hasGemini=${this._hasGemini}
          .mode=${this._detailMode}
          @close=${() => (this._showDetail = false)}
          @remove-wine=${this._onRemoveWine}
          @remove-buy-list-item=${(e: CustomEvent) => {
            this._removeBuyListItem(e.detail.item_id);
          }}
          @wine-updated=${() => this._loadData()}
          @buy-list-updated=${() => this._loadData()}
          @copy-wine=${(e: CustomEvent) => this._copyWine(e.detail.wine)}
          @move-wine=${(e: CustomEvent) => {
            this._showDetail = false;
            this._movingWine = e.detail.wine;
            this._showToast(`Tap a cell to move "${e.detail.wine.name}"`);
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
          .preselectedDepth=${this._addPreselect.depth || 0}
          .buyListMode=${this._addToBuyListMode}
          @close=${() => { this._showAddDialog = false; this._addToBuyListMode = false; }}
          @wine-added=${this._onWineAdded}
          @buy-list-updated=${() => this._loadData()}
        ></add-wine-dialog>

        <!-- Wine List Scanner Dialog -->
        <wine-list-dialog
          .open=${this._showWineList}
          .hass=${this.hass}
          .hasGemini=${this._hasGemini}
          @close=${() => (this._showWineList = false)}
          @wine-added=${this._onWineAdded}
          @buy-list-updated=${() => this._loadData()}
        ></wine-list-dialog>

        <!-- Rack Settings Dialog -->
        <rack-settings-dialog
          .open=${this._showRackSettings}
          .hass=${this.hass}
          .cabinets=${this._cabinets}
          .wines=${this._wines}
          @close=${() => (this._showRackSettings = false)}
          @racks-updated=${() => this._loadData()}
        ></rack-settings-dialog>

        <!-- Depth Side Panel -->
        ${this._depthPanelOpen
          ? html`
              <div class="depth-panel-backdrop" @click=${this._closeDepthPanel}></div>
              <div class="depth-panel open">
                <div class="depth-panel-header">
                  <span class="depth-panel-title">
                    Row ${(this._depthPanelRow ?? 0) + 1}, Col ${(this._depthPanelCol ?? 0) + 1}
                    <span class="depth-panel-subtitle">
                      ${this._depthPanelWines.length}/${this._depthPanelMaxDepth} deep
                    </span>
                  </span>
                  <button class="depth-panel-close" @click=${this._closeDepthPanel}>✕</button>
                </div>
                <div class="depth-panel-slots">
                  ${Array.from({ length: this._depthPanelMaxDepth }, (_, i) => {
                    const wine = this._depthPanelWines.find((w) => (w.depth || 0) === i);
                    const typeColor = wine ? WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red : "";
                    return html`
                      <div
                        class="depth-slot ${wine ? "filled" : "empty"}"
                        @click=${() => this._onDepthSlotClick(i, wine)}
                      >
                        <div class="depth-slot-label">${this._getDepthLabel(i)}</div>
                        ${wine
                          ? html`
                              <div class="depth-slot-wine" style="border-left: 4px solid ${typeColor}">
                                ${wine.image_url
                                  ? html`<img class="depth-slot-thumb" src="${wine.image_url}" alt="" />`
                                  : html`<div class="depth-slot-dot" style="background: ${typeColor}"></div>`}
                                <div class="depth-slot-info">
                                  <div class="depth-slot-name">${wine.name}</div>
                                  <div class="depth-slot-meta">
                                    ${wine.vintage || "NV"}
                                    ${wine.rating ? html` · ★${wine.rating}` : nothing}
                                    ${wine.price ? html` · $${wine.price}` : nothing}
                                  </div>
                                </div>
                              </div>
                            `
                          : html`
                              <div class="depth-slot-empty">
                                <span class="depth-slot-plus">+</span>
                                <span>Empty</span>
                              </div>
                            `}
                      </div>
                    `;
                  })}
                </div>
              </div>
            `
          : nothing}

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
