import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Cabinet, Wine, StorageRow, StorageRowType, STORAGE_ROW_TYPE_LABELS, BOX_SIZES } from "../models";
import { sharedStyles } from "../styles";

type Mode = "list" | "add" | "edit" | "delete-confirm";

@customElement("rack-settings-dialog")
export class RackSettingsDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) cabinets: Cabinet[] = [];
  @property({ attribute: false }) wines: Wine[] = [];

  @state() private _mode: Mode = "list";
  @state() private _editCabinet: Partial<Cabinet> = {};
  @state() private _editStorageRows: StorageRow[] = [];
  @state() private _deleteCabinet: Cabinet | null = null;
  @state() private _loading = false;
  @state() private _error = "";

  static styles = [
    sharedStyles,
    css`
      .rack-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .rack-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        transition: background 0.2s;
      }

      .rack-item:hover {
        background: var(--wc-hover);
      }

      .rack-info {
        flex: 1;
        min-width: 0;
      }

      .rack-name {
        font-weight: 600;
        font-size: 0.95em;
      }

      .rack-meta {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        margin-top: 2px;
      }

      .rack-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .small-btn {
        background: transparent;
        border: 1px solid var(--wc-border);
        border-radius: 6px;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        transition: all 0.2s;
      }

      .small-btn:hover {
        background: var(--wc-hover);
      }

      .small-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }

      .small-btn.danger {
        color: #c62828;
        border-color: rgba(198, 40, 40, 0.3);
      }

      .small-btn.danger:hover {
        background: rgba(198, 40, 40, 0.08);
      }

      .warning-msg {
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.3);
        border-radius: 8px;
        padding: 10px;
        font-size: 0.85em;
        color: #e65100;
        margin-top: 12px;
      }

      .delete-info {
        font-size: 0.95em;
        margin: 12px 0;
        line-height: 1.5;
      }

      .delete-count {
        color: #c62828;
        font-weight: 600;
      }

      .add-rack-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--wc-border);
        border-radius: 10px;
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s;
        width: 100%;
      }

      .add-rack-btn:hover {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      /* Grid editor */
      .grid-editor {
        margin-top: 12px;
      }

      .grid-editor-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 12px;
      }

      /* Stepper controls for cols/depth */
      .stepper-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .stepper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        overflow: hidden;
      }

      .stepper-label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .stepper-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .stepper-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.1em;
        font-weight: 600;
        color: var(--wc-text-secondary);
        transition: all 0.15s;
        flex-shrink: 0;
      }

      .stepper-btn:hover:not(:disabled) {
        background: rgba(114, 47, 55, 0.1);
        color: var(--wc-primary);
      }

      .stepper-btn:disabled {
        opacity: 0.25;
        cursor: default;
      }

      .stepper-value {
        flex: 1;
        text-align: center;
        font-size: 0.9em;
        font-weight: 600;
        color: var(--wc-text);
        padding: 6px 0;
        min-width: 40px;
      }

      /* Visual grid preview */
      .grid-preview {
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
        overflow-x: auto;
      }

      .grid-preview-row {
        display: flex;
        gap: 3px;
        margin-bottom: 3px;
        align-items: center;
      }

      .grid-preview-row:last-child {
        margin-bottom: 0;
      }

      .grid-preview-label {
        width: 28px;
        font-size: 0.65em;
        font-weight: 600;
        color: var(--wc-text-secondary);
        text-align: center;
        flex-shrink: 0;
      }

      .grid-preview-cell {
        width: 20px;
        height: 16px;
        border-radius: 3px;
        background: rgba(114, 47, 55, 0.15);
        border: 1px solid rgba(114, 47, 55, 0.25);
        flex-shrink: 0;
      }

      .grid-preview-row.storage .grid-preview-cell {
        background: rgba(139, 105, 20, 0.15);
        border-color: rgba(139, 105, 20, 0.3);
      }

      .grid-preview-storage-label {
        font-size: 0.6em;
        color: #8b6914;
        font-weight: 600;
        white-space: nowrap;
        padding-left: 4px;
      }

      .grid-preview-row.storage .grid-preview-cell {
        width: unset;
        flex: 1;
        max-width: none;
      }

      /* Row list */
      .row-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--wc-border);
        border-radius: 8px;
        padding: 6px;
      }

      .row-entry {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        border-radius: 6px;
        font-size: 0.8em;
        transition: background 0.15s;
      }

      .row-entry:hover {
        background: var(--wc-hover);
      }

      .row-entry.storage {
        background: rgba(139, 105, 20, 0.1);
        border: 1px solid rgba(139, 105, 20, 0.3);
      }

      .row-entry .row-num {
        width: 28px;
        font-weight: 600;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .row-type-select {
        padding: 2px 4px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
      }

      .row-name-input {
        width: 80px;
        padding: 2px 6px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        flex-shrink: 1;
        min-width: 60px;
      }

      .row-cap-select {
        padding: 2px 4px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.8em;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
      }

      .row-cap-stepper {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .stepper-btn-sm {
        width: 20px;
        height: 20px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        background: var(--wc-bg);
        color: var(--wc-text);
        cursor: pointer;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      .stepper-btn-sm:hover {
        background: var(--wc-hover);
      }

      .stepper-val-sm {
        font-size: 0.8em;
        font-weight: 600;
        min-width: 22px;
        text-align: center;
      }

      .row-type-info {
        flex: 1;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }

      .row-entry input[type="text"] {
        width: 100px;
        padding: 2px 6px;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        font-size: 0.85em;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .row-controls {
        display: flex;
        gap: 6px;
        margin-top: 6px;
      }

      .row-ctrl-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 0;
        border: 1px dashed var(--wc-border);
        border-radius: 6px;
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.8em;
        transition: all 0.15s;
      }

      .row-ctrl-btn:hover:not(:disabled) {
        border-color: var(--wc-primary);
        color: var(--wc-primary);
        background: rgba(114, 47, 55, 0.05);
      }

      .row-ctrl-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }

      .row-ctrl-btn.danger:hover:not(:disabled) {
        border-color: #c62828;
        color: #c62828;
        background: rgba(198, 40, 40, 0.05);
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("open") && this.open) {
      this._mode = "list";
      this._error = "";
    }
  }

  private _close() {
    this._mode = "list";
    this._error = "";
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _notifyUpdate() {
    this.dispatchEvent(
      new CustomEvent("racks-updated", { bubbles: true, composed: true })
    );
  }

  private _winesInCabinet(cabinetId: string): number {
    return this.wines.filter((w) => w.cabinet_id === cabinetId).length;
  }

  private _winesOutOfBounds(
    cabinetId: string,
    newRows: number,
    newCols: number
  ): number {
    return this.wines.filter(
      (w) =>
        w.cabinet_id === cabinetId &&
        w.row != null &&
        w.col != null &&
        (w.row >= newRows || w.col >= newCols)
    ).length;
  }

  private _startAdd() {
    this._mode = "add";
    this._error = "";
    this._editCabinet = {
      name: "",
      rows: 1,
      cols: 8,
      depth: 1,
      has_bottom_zone: false,
      bottom_zone_name: "",
      orientation: "vertical",
    };
    this._editStorageRows = [];
  }

  private _startEdit(cabinet: Cabinet) {
    this._mode = "edit";
    this._error = "";
    this._editCabinet = {
      ...cabinet,
      orientation: cabinet.orientation || "vertical",
    };
    // Initialize storage rows from cabinet data, ensuring boxes arrays exist
    this._editStorageRows = (cabinet.storage_rows || []).map((sr) => {
      if (sr.type === "box" && !sr.boxes) {
        return { ...sr, boxes: [sr.capacity || 12] };
      }
      return { ...sr };
    });
  }

  private _startDelete(cabinet: Cabinet) {
    this._mode = "delete-confirm";
    this._error = "";
    this._deleteCabinet = cabinet;
  }

  private _setRowType(row: number, type: "slots" | StorageRowType) {
    if (type === "slots") {
      // Remove from storage rows
      this._editStorageRows = this._editStorageRows.filter((sr) => sr.row !== row);
    } else {
      const existing = this._editStorageRows.find((sr) => sr.row === row);
      const isBox = type === "box";
      const defaultCapacity = isBox ? 12 : 20;
      const newRow: StorageRow = {
        row,
        name: existing?.name || STORAGE_ROW_TYPE_LABELS[type],
        type,
        capacity: defaultCapacity,
        ...(isBox ? { boxes: [12] } : {}),
      };
      if (existing) {
        this._editStorageRows = this._editStorageRows.map((sr) =>
          sr.row === row ? newRow : sr
        );
      } else {
        this._editStorageRows = [...this._editStorageRows, newRow];
      }
    }
  }

  private _updateStorageRowName(row: number, name: string) {
    this._editStorageRows = this._editStorageRows.map((sr) =>
      sr.row === row ? { ...sr, name } : sr
    );
  }

  private _updateStorageRowCapacity(row: number, capacity: number) {
    this._editStorageRows = this._editStorageRows.map((sr) =>
      sr.row === row ? { ...sr, capacity } : sr
    );
  }

  private _updateBoxCount(row: number, count: number) {
    this._editStorageRows = this._editStorageRows.map((sr) => {
      if (sr.row !== row || sr.type !== "box") return sr;
      const boxes = [...(sr.boxes || [12])];
      while (boxes.length < count) boxes.push(12);
      while (boxes.length > count) boxes.pop();
      const capacity = boxes.reduce((sum, s) => sum + s, 0);
      return { ...sr, boxes, capacity };
    });
  }

  private _updateBoxSize(row: number, boxIndex: number, size: number) {
    this._editStorageRows = this._editStorageRows.map((sr) => {
      if (sr.row !== row || sr.type !== "box") return sr;
      const boxes = [...(sr.boxes || [12])];
      boxes[boxIndex] = size;
      const capacity = boxes.reduce((sum, s) => sum + s, 0);
      return { ...sr, boxes, capacity };
    });
  }

  private _isStorageRow(row: number): boolean {
    return this._editStorageRows.some((sr) => sr.row === row);
  }

  private _getStorageRow(row: number): StorageRow | undefined {
    return this._editStorageRows.find((sr) => sr.row === row);
  }

  private _addRow() {
    const current = this._editCabinet.rows || 1;
    if (current >= 20) return;
    this._editCabinet = { ...this._editCabinet, rows: current + 1 };
  }

  private _removeRow() {
    const current = this._editCabinet.rows || 1;
    if (current <= 1) return;
    const newRows = current - 1;
    // Remove storage row if last row was storage
    this._editStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);
    this._editCabinet = { ...this._editCabinet, rows: newRows };
  }

  private _addCol() {
    const current = this._editCabinet.cols || 1;
    if (current >= 20) return;
    this._editCabinet = { ...this._editCabinet, cols: current + 1 };
  }

  private _removeCol() {
    const current = this._editCabinet.cols || 1;
    if (current <= 1) return;
    this._editCabinet = { ...this._editCabinet, cols: current - 1 };
  }

  private _addDepth() {
    const current = (this._editCabinet as any).depth || 1;
    if (current >= 6) return;
    this._editCabinet = { ...this._editCabinet, depth: current + 1 };
  }

  private _removeDepth() {
    const current = (this._editCabinet as any).depth || 1;
    if (current <= 1) return;
    this._editCabinet = { ...this._editCabinet, depth: current - 1 };
  }

  private async _saveAdd() {
    this._loading = true;
    this._error = "";
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_cabinet",
        cabinet: {
          name: this._editCabinet.name || "New Rack",
          rows: this._editCabinet.rows || 1,
          cols: this._editCabinet.cols || 8,
          depth: this._editCabinet.depth || 1,
          has_bottom_zone: false,
          bottom_zone_name: "",
          storage_rows: this._editStorageRows,
          order: this.cabinets.length,
          orientation: this._editCabinet.orientation || "vertical",
        },
      });
      this._notifyUpdate();
      this._mode = "list";
    } catch {
      this._error = "Failed to add rack.";
    }
    this._loading = false;
  }

  private async _saveEdit() {
    this._loading = true;
    this._error = "";
    try {
      const cabinetId = this._editCabinet.id!;
      const newRows = this._editCabinet.rows || 1;
      const newCols = this._editCabinet.cols || 8;

      // Filter out storage rows beyond the new row count
      const validStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);

      await this.hass.callWS({
        type: "wine_cellar/update_cabinet",
        cabinet_id: cabinetId,
        updates: {
          name: this._editCabinet.name,
          rows: newRows,
          cols: newCols,
          depth: this._editCabinet.depth || 1,
          has_bottom_zone: false,
          bottom_zone_name: "",
          storage_rows: validStorageRows,
          orientation: this._editCabinet.orientation || "vertical",
        },
      });

      // Unassign wines that are out of bounds or on rows that became storage
      const outOfBounds = this.wines.filter(
        (w) =>
          w.cabinet_id === cabinetId &&
          w.row != null &&
          w.col != null &&
          (w.row >= newRows || w.col >= newCols || validStorageRows.some((sr) => sr.row === w.row))
      );
      for (const wine of outOfBounds) {
        await this.hass.callWS({
          type: "wine_cellar/update_wine",
          wine_id: wine.id,
          updates: { cabinet_id: "", row: null, col: null, zone: "" },
        });
      }

      this._notifyUpdate();
      this._mode = "list";
    } catch {
      this._error = "Failed to update rack.";
    }
    this._loading = false;
  }

  private async _confirmDelete() {
    if (!this._deleteCabinet) return;
    this._loading = true;
    this._error = "";
    try {
      await this.hass.callWS({
        type: "wine_cellar/remove_cabinet",
        cabinet_id: this._deleteCabinet.id,
      });
      this._notifyUpdate();
      this._mode = "list";
      this._deleteCabinet = null;
    } catch {
      this._error = "Failed to delete rack.";
    }
    this._loading = false;
  }

  private async _moveUp(cabinet: Cabinet) {
    const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === cabinet.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    try {
      await Promise.all([
        this.hass.callWS({
          type: "wine_cellar/update_cabinet",
          cabinet_id: cabinet.id,
          updates: { order: prev.order },
        }),
        this.hass.callWS({
          type: "wine_cellar/update_cabinet",
          cabinet_id: prev.id,
          updates: { order: cabinet.order },
        }),
      ]);
      this._notifyUpdate();
    } catch {
      this._error = "Failed to reorder racks.";
    }
  }

  private async _moveDown(cabinet: Cabinet) {
    const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === cabinet.id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    try {
      await Promise.all([
        this.hass.callWS({
          type: "wine_cellar/update_cabinet",
          cabinet_id: cabinet.id,
          updates: { order: next.order },
        }),
        this.hass.callWS({
          type: "wine_cellar/update_cabinet",
          cabinet_id: next.id,
          updates: { order: cabinet.order },
        }),
      ]);
      this._notifyUpdate();
    } catch {
      this._error = "Failed to reorder racks.";
    }
  }

  private _renderList() {
    const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
    return html`
      <div class="dialog-body">
        <div class="rack-list">
          ${sorted.map(
            (cab, idx) => {
              const storageCount = (cab.storage_rows || []).length;
              const gridRows = cab.rows - storageCount;
              return html`
                <div class="rack-item">
                  <div class="rack-info">
                    <div class="rack-name">${cab.name}</div>
                    <div class="rack-meta">
                      ${cab.rows} rows × ${cab.cols} cols${(cab.depth || 1) > 1 ? ` × ${cab.depth} deep` : ""}
                      · ${this._winesInCabinet(cab.id)} bottles
                      ${storageCount > 0 ? ` · ${storageCount} storage row${storageCount > 1 ? "s" : ""}` : ""}
                      ${cab.orientation === "horizontal" ? " · ↔ Horizontal" : ""}
                      ${cab.has_bottom_zone ? " · + bottom zone" : ""}
                    </div>
                  </div>
                  <div class="rack-actions">
                    <button
                      class="small-btn"
                      @click=${() => this._moveUp(cab)}
                      ?disabled=${idx === 0}
                      title="Move up"
                    >↑</button>
                    <button
                      class="small-btn"
                      @click=${() => this._moveDown(cab)}
                      ?disabled=${idx === sorted.length - 1}
                      title="Move down"
                    >↓</button>
                    <button
                      class="small-btn"
                      @click=${() => this._startEdit(cab)}
                    >Edit</button>
                    <button
                      class="small-btn danger"
                      @click=${() => this._startDelete(cab)}
                    >Del</button>
                  </div>
                </div>
              `;
            }
          )}

          <button class="add-rack-btn" @click=${this._startAdd}>
            + Add Rack
          </button>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${this._close}>Close</button>
      </div>
    `;
  }

  private _renderForm() {
    const isEdit = this._mode === "edit";
    const numRows = this._editCabinet.rows || 1;
    const numCols = this._editCabinet.cols || 8;
    const numDepth = (this._editCabinet as any).depth || 1;

    // Calculate out-of-bounds warning for edits
    let oobCount = 0;
    if (isEdit && this._editCabinet.id) {
      const orig = this.cabinets.find((c) => c.id === this._editCabinet.id);
      if (orig) {
        const newRows = this._editCabinet.rows || orig.rows;
        const newCols = this._editCabinet.cols || orig.cols;
        if (newRows < orig.rows || newCols < orig.cols) {
          oobCount = this._winesOutOfBounds(
            this._editCabinet.id!,
            newRows,
            newCols
          );
        }
      }
    }

    return html`
      <div class="dialog-body">
        <div class="form-group">
          <label>Rack Name</label>
          <input
            type="text"
            .value=${this._editCabinet.name || ""}
            @input=${(e: InputEvent) =>
              (this._editCabinet = {
                ...this._editCabinet,
                name: (e.target as HTMLInputElement).value,
              })}
          />
        </div>

        <!-- Grid Editor -->
        <div class="grid-editor">
          <div class="grid-editor-title">Grid Layout</div>

          <!-- Stepper controls -->
          <div class="stepper-row">
            <div class="stepper-wrap">
              <div class="stepper-label">Rows</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeRow} ?disabled=${numRows <= 1}>−</button>
                <span class="stepper-value">${numRows}</span>
                <button class="stepper-btn" @click=${this._addRow} ?disabled=${numRows >= 20}>+</button>
              </div>
            </div>
            <div class="stepper-wrap">
              <div class="stepper-label">Columns</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeCol} ?disabled=${numCols <= 1}>−</button>
                <span class="stepper-value">${numCols}</span>
                <button class="stepper-btn" @click=${this._addCol} ?disabled=${numCols >= 20}>+</button>
              </div>
            </div>
            <div class="stepper-wrap">
              <div class="stepper-label">Depth</div>
              <div class="stepper">
                <button class="stepper-btn" @click=${this._removeDepth} ?disabled=${numDepth <= 1}>−</button>
                <span class="stepper-value">${numDepth}</span>
                <button class="stepper-btn" @click=${this._addDepth} ?disabled=${numDepth >= 6}>+</button>
              </div>
            </div>
          </div>

          <!-- Orientation toggle -->
          <div style="margin-bottom:12px;">
            <div class="stepper-label">Orientation</div>
            <div style="display:flex;gap:4px;">
              <button
                class="small-btn"
                style="${this._editCabinet.orientation !== 'horizontal' ? 'background:var(--wc-primary);color:white;border-color:var(--wc-primary);' : ''}"
                @click=${() => this._editCabinet = { ...this._editCabinet, orientation: 'vertical' as const }}
              >↕ Vertical</button>
              <button
                class="small-btn"
                style="${this._editCabinet.orientation === 'horizontal' ? 'background:var(--wc-primary);color:white;border-color:var(--wc-primary);' : ''}"
                @click=${() => this._editCabinet = { ...this._editCabinet, orientation: 'horizontal' as const }}
              >↔ Horizontal</button>
            </div>
          </div>

          <!-- Visual grid preview -->
          <div class="grid-preview">
            ${this._editCabinet.orientation === "horizontal"
              ? html`
                  <!-- Horizontal: transpose grid (cols become visual rows) -->
                  ${(() => {
                    const gridRows: number[] = [];
                    const storageRowNums: number[] = [];
                    for (let r = 0; r < numRows; r++) {
                      if (this._isStorageRow(r)) storageRowNums.push(r);
                      else gridRows.push(r);
                    }
                    const gridCols = Math.min(numCols, 15);
                    return html`
                      ${Array.from({ length: gridCols }, (_, col) => html`
                        <div class="grid-preview-row">
                          <span class="grid-preview-label">C${col + 1}</span>
                          ${gridRows.map(() => html`<div class="grid-preview-cell"></div>`)}
                          ${gridRows.length > 15
                            ? html`<span style="font-size:0.65em;color:var(--wc-text-secondary)">+${gridRows.length - 15}</span>`
                            : nothing}
                        </div>
                      `)}
                      ${numCols > 15
                        ? html`<div style="font-size:0.6em;color:var(--wc-text-secondary);text-align:center;padding:2px;">+${numCols - 15} more columns</div>`
                        : nothing}
                      ${storageRowNums.map((row) => {
                        const sr = this._getStorageRow(row);
                        const typeIcon = sr?.type === "box" ? "📦" : "◇";
                        return html`
                          <div class="grid-preview-row storage">
                            <span class="grid-preview-label">R${row + 1}</span>
                            <div class="grid-preview-cell"></div>
                            <span class="grid-preview-storage-label">${typeIcon} ${sr?.name || "Storage"}</span>
                          </div>
                        `;
                      })}
                    `;
                  })()}
                `
              : html`
                  <!-- Vertical: standard grid -->
                  ${Array.from({ length: numRows }, (_, row) => {
                    const isStorage = this._isStorageRow(row);
                    const sr = this._getStorageRow(row);
                    const typeIcon = sr?.type === "box" ? "📦" : "◇";
                    return html`
                      <div class="grid-preview-row ${isStorage ? "storage" : ""}">
                        <span class="grid-preview-label">R${row + 1}</span>
                        ${isStorage
                          ? html`<div class="grid-preview-cell"></div><span class="grid-preview-storage-label">${typeIcon} ${sr?.name || "Storage"}</span>`
                          : Array.from({ length: Math.min(numCols, 15) }, () =>
                              html`<div class="grid-preview-cell"></div>`
                            )}
                        ${!isStorage && numCols > 15
                          ? html`<span style="font-size:0.65em;color:var(--wc-text-secondary)">+${numCols - 15}</span>`
                          : nothing}
                      </div>
                    `;
                  })}
                `
            }
          </div>

          <!-- Row list with type selectors -->
          <div class="row-list">
            ${Array.from({ length: numRows }, (_, row) => {
              const isStorage = this._isStorageRow(row);
              const sr = this._getStorageRow(row);
              const currentType = sr?.type || "slots";
              return html`
                <div class="row-entry ${isStorage ? "storage" : ""}">
                  <span class="row-num">R${row + 1}</span>
                  <select
                    class="row-type-select"
                    @change=${(e: Event) => {
                      const val = (e.target as HTMLSelectElement).value;
                      this._setRowType(row, val as "slots" | StorageRowType);
                    }}
                    @click=${(e: Event) => e.stopPropagation()}
                  >
                    <option value="slots" ?selected=${!isStorage}>Slots</option>
                    <option value="bulk" ?selected=${currentType === "bulk"}>Bulk Bin</option>
                    <option value="box" ?selected=${currentType === "box"}>Wine Box</option>
                  </select>
                  ${isStorage
                    ? html`
                        <input
                          type="text"
                          class="row-name-input"
                          .value=${sr?.name || "Storage"}
                          @input=${(e: InputEvent) =>
                            this._updateStorageRowName(row, (e.target as HTMLInputElement).value)}
                          @click=${(e: Event) => e.stopPropagation()}
                          placeholder="Zone name"
                        />
                        ${sr?.type === "box"
                          ? html`
                              <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                                <div class="row-cap-stepper">
                                  <button class="stepper-btn-sm" @click=${(e: Event) => { e.stopPropagation(); this._updateBoxCount(row, Math.max(1, (sr?.boxes || [12]).length - 1)); }}>−</button>
                                  <span class="stepper-val-sm">${(sr?.boxes || [12]).length}</span>
                                  <button class="stepper-btn-sm" @click=${(e: Event) => { e.stopPropagation(); this._updateBoxCount(row, Math.min(10, (sr?.boxes || [12]).length + 1)); }}>+</button>
                                </div>
                                ${(sr?.boxes || [12]).map((boxSize: number, bi: number) => html`
                                  <select
                                    class="row-cap-select"
                                    @change=${(e: Event) =>
                                      this._updateBoxSize(row, bi, parseInt((e.target as HTMLSelectElement).value))}
                                    @click=${(e: Event) => e.stopPropagation()}
                                  >
                                    ${BOX_SIZES.map((s) => html`<option value=${s} ?selected=${boxSize === s}>${s}-pk</option>`)}
                                  </select>
                                `)}
                                <span style="font-size:0.7em;color:var(--wc-text-secondary);">= ${sr?.capacity || 12}</span>
                              </div>
                            `
                          : html`
                              <div class="row-cap-stepper">
                                <button class="stepper-btn-sm" @click=${(e: Event) => { e.stopPropagation(); this._updateStorageRowCapacity(row, Math.max(1, (sr?.capacity || 20) - 1)); }}>−</button>
                                <span class="stepper-val-sm">${sr?.capacity || 20}</span>
                                <button class="stepper-btn-sm" @click=${(e: Event) => { e.stopPropagation(); this._updateStorageRowCapacity(row, Math.min(100, (sr?.capacity || 20) + 1)); }}>+</button>
                              </div>
                            `}
                      `
                    : html`<span class="row-type-info">${numCols} col${numCols !== 1 ? "s" : ""}${numDepth > 1 ? ` × ${numDepth} deep` : ""}</span>`}
                </div>
              `;
            })}
          </div>
          <!-- Use the Rows stepper above to add/remove rows -->
        </div>

        ${oobCount > 0
          ? html`
              <div class="warning-msg">
                Shrinking will unassign ${oobCount} wine${oobCount > 1 ? "s" : ""} that are outside the new grid bounds.
              </div>
            `
          : nothing}

        ${this._error
          ? html`<div class="error-msg" style="color:#ef5350;margin-top:8px">${this._error}</div>`
          : nothing}
      </div>

      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => (this._mode = "list")}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click=${isEdit ? this._saveEdit : this._saveAdd}
          ?disabled=${this._loading}
        >
          ${this._loading ? "Saving..." : "Save"}
        </button>
      </div>
    `;
  }

  private _renderDeleteConfirm() {
    if (!this._deleteCabinet) return nothing;
    const count = this._winesInCabinet(this._deleteCabinet.id);

    return html`
      <div class="dialog-body">
        <div class="delete-info">
          Are you sure you want to delete
          <strong>"${this._deleteCabinet.name}"</strong>?
          ${count > 0
            ? html`<br /><span class="delete-count"
                >${count} wine${count > 1 ? "s" : ""} will be unassigned.</span
              >`
            : nothing}
        </div>
        ${this._error
          ? html`<div style="color:#ef5350;font-size:0.85em">${this._error}</div>`
          : nothing}
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" @click=${() => (this._mode = "list")}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          style="background:#c62828"
          @click=${this._confirmDelete}
          ?disabled=${this._loading}
        >
          ${this._loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    const titles: Record<Mode, string> = {
      list: "Manage Racks",
      add: "Add Rack",
      edit: "Edit Rack",
      "delete-confirm": "Delete Rack?",
    };

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">${titles[this._mode]}</div>
          ${this._mode === "list" ? this._renderList() : nothing}
          ${this._mode === "add" || this._mode === "edit"
            ? this._renderForm()
            : nothing}
          ${this._mode === "delete-confirm"
            ? this._renderDeleteConfirm()
            : nothing}
        </div>
      </div>
    `;
  }
}
