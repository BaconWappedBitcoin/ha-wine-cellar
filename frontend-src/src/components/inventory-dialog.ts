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
  @state() private _backingUp = false;
  @state() private _importing = false;
  @state() private _restoring = false;
  @state() private _confirmRestore = false;
  @state() private _restoreData: any = null;
  @state() private _statusMsg = "";
  @state() private _syncing = false;
  @state() private _confirmSyncLoad = false;

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

      .inv-btn-primary {
        background: #2e7d32;
        color: #fff;
        border-color: #2e7d32;
      }

      .inv-btn-primary:hover {
        background: #256d29;
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
        background: var(--wc-card-bg, #fff);
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
      this._searchQuery = "";
      this._typeFilter = "all";
      this._sortField = "name";
      this._sortDir = "asc";
      this._showDetail = false;
      this._detailWine = null;
      this._statusMsg = "";
      this._confirmRestore = false;
      this._confirmSyncLoad = false;
      this._restoreData = null;
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
      // Map disposition search terms to codes
      const dispMap: Record<string, string> = {
        drink: "D", "drink now": "D",
        hold: "H",
        past: "P", "past peak": "P", "past-peak": "P",
      };
      const dispCode = dispMap[q];
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
          (w.barcode || "").includes(q) ||
          (dispCode && w.disposition === dispCode) ||
          (w.drink_window || "").toLowerCase().includes(q)
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

  // ── Export CSV ─────────────────────────────────────────────────

  private _exportCSV() {
    const wines = this._getFilteredAndSortedWines();
    const headers = [
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
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = wines.map((w) =>
      [
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

    const csv = [headers.join(","), ...rows].join("\n");
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

    this._importing = true;
    this._statusMsg = "";

    try {
      const text = await file.text();
      const wines = this._parseCSV(text);

      if (wines.length === 0) {
        this._statusMsg = "No wines found in CSV file.";
        this._importing = false;
        return;
      }

      const result = await this.hass.callWS({
        type: "wine_cellar/import_wines",
        wines,
      });

      this._statusMsg = `Imported ${result.imported} wines successfully!`;
      this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
    } catch (err: any) {
      this._statusMsg = `Import failed: ${err.message || err}`;
    }
    this._importing = false;
  }

  private _parseCSV(text: string): any[] {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    // Parse header row
    const headers = this._parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());

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
    };

    const numericFields = new Set([
      "vintage", "rating", "ratings_count", "price",
      "retail_price", "user_rating",
    ]);

    const wines: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this._parseCSVRow(lines[i]);
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

  private _parseCSVRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
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

  private async _syncSave() {
    this._syncing = true;
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/sync_save" });
      if (result.error) {
        this._statusMsg = `Sync save failed: ${result.error}`;
      } else {
        this._statusMsg = `☁️ Saved to server — ${result.wines} wines, ${result.cabinets} racks. Sync this file with Google Drive: ${result.path}`;
      }
    } catch (err: any) {
      this._statusMsg = `Sync save failed: ${err.message || err}`;
    }
    this._syncing = false;
  }

  private async _syncLoad() {
    this._confirmSyncLoad = false;
    this._syncing = true;
    this._statusMsg = "";
    try {
      const result = await this.hass.callWS({ type: "wine_cellar/sync_load" });
      if (result.error) {
        this._statusMsg = `Sync load failed: ${result.error}`;
      } else {
        this._statusMsg = `☁️ Loaded from server — ${result.wines} wines, ${result.cabinets} racks${result.timestamp ? ` (backup from ${new Date(result.timestamp).toLocaleString()})` : ""}`;
        this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
      }
    } catch (err: any) {
      this._statusMsg = `Sync load failed: ${err.message || err}`;
    }
    this._syncing = false;
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

    const busy = this._importing || this._restoring || this._backingUp || this._syncing;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:800px;position:relative" @click=${(e: Event) => e.stopPropagation()}>
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
            <div class="inv-footer-btns">
              <button
                class="inv-btn"
                @click=${this._syncSave}
                ?disabled=${busy}
                title="Save backup to HA server for Google Drive sync"
              >
                ${this._syncing ? "Syncing…" : "☁️ Sync Save"}
              </button>
              <button
                class="inv-btn"
                @click=${() => (this._confirmSyncLoad = true)}
                ?disabled=${busy}
                title="Load backup from HA server sync file"
              >
                ☁️ Sync Load
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerImportCSV}
                ?disabled=${busy}
                title="Import wines from a CSV file"
              >
                ${this._importing ? "Importing…" : "📄 Import"}
              </button>
              <button
                class="inv-btn"
                @click=${this._backupJSON}
                ?disabled=${busy}
                title="Download full cellar backup as JSON"
              >
                ${this._backingUp ? "Saving…" : "💾 Backup"}
              </button>
              <button
                class="inv-btn"
                @click=${this._triggerRestore}
                ?disabled=${busy}
                title="Restore cellar from a JSON backup"
              >
                ${this._restoring ? "Restoring…" : "🔄 Restore"}
              </button>
              <button
                class="inv-btn inv-btn-primary"
                @click=${this._exportCSV}
                ?disabled=${busy}
              >
                📥 Export
              </button>
            </div>
            ${this._statusMsg
              ? html`<div class="inv-status">${this._statusMsg}</div>`
              : nothing}
          </div>

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

          <!-- Sync Load Confirmation Overlay -->
          ${this._confirmSyncLoad
            ? html`
                <div class="inv-confirm-overlay" @click=${() => (this._confirmSyncLoad = false)}>
                  <div class="inv-confirm-box" @click=${(e: Event) => e.stopPropagation()}>
                    <h3>☁️ Load from Server?</h3>
                    <p>
                      This will <strong>replace</strong> all your current cellar data with the server sync file.
                      This action cannot be undone.
                    </p>
                    <div class="inv-confirm-btns">
                      <button class="inv-confirm-cancel" @click=${() => (this._confirmSyncLoad = false)}>
                        Cancel
                      </button>
                      <button class="inv-confirm-go" @click=${this._syncLoad}>
                        Load Now
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
