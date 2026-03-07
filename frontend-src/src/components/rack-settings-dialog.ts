import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Cabinet, Wine, StorageRow } from "../models";
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
        background: rgba(0, 0, 0, 0.03);
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
        background: rgba(0, 0, 0, 0.06);
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

      /* Row layout editor */
      .row-layout {
        margin-top: 12px;
      }

      .row-layout-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 8px;
      }

      .row-layout-hint {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .row-layout-list {
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
        background: rgba(0, 0, 0, 0.04);
      }

      .row-entry.storage {
        background: rgba(139, 105, 20, 0.1);
        border: 1px solid rgba(139, 105, 20, 0.3);
      }

      .row-entry .row-num {
        width: 32px;
        font-weight: 600;
        color: var(--wc-text-secondary);
        font-size: 0.85em;
      }

      .row-entry .row-type {
        flex: 1;
        font-size: 0.85em;
      }

      .row-entry .row-type.is-storage {
        color: #8b6914;
        font-weight: 600;
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

      .row-entry .toggle-btn {
        background: transparent;
        border: 1px solid var(--wc-border);
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 0.75em;
        cursor: pointer;
        color: var(--wc-text-secondary);
        transition: all 0.15s;
        white-space: nowrap;
      }

      .row-entry .toggle-btn:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .row-entry.storage .toggle-btn {
        color: #8b6914;
        border-color: rgba(139, 105, 20, 0.4);
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
      rows: 8,
      cols: 8,
      depth: 1,
      has_bottom_zone: false,
      bottom_zone_name: "",
    };
    this._editStorageRows = [];
  }

  private _startEdit(cabinet: Cabinet) {
    this._mode = "edit";
    this._error = "";
    this._editCabinet = { ...cabinet };
    // Initialize storage rows from cabinet data
    this._editStorageRows = [...(cabinet.storage_rows || [])];
  }

  private _startDelete(cabinet: Cabinet) {
    this._mode = "delete-confirm";
    this._error = "";
    this._deleteCabinet = cabinet;
  }

  private _toggleStorageRow(row: number) {
    const existing = this._editStorageRows.find((sr) => sr.row === row);
    if (existing) {
      this._editStorageRows = this._editStorageRows.filter((sr) => sr.row !== row);
    } else {
      this._editStorageRows = [...this._editStorageRows, { row, name: "Storage" }];
    }
  }

  private _updateStorageRowName(row: number, name: string) {
    this._editStorageRows = this._editStorageRows.map((sr) =>
      sr.row === row ? { ...sr, name } : sr
    );
  }

  private _isStorageRow(row: number): boolean {
    return this._editStorageRows.some((sr) => sr.row === row);
  }

  private async _saveAdd() {
    this._loading = true;
    this._error = "";
    try {
      await this.hass.callWS({
        type: "wine_cellar/add_cabinet",
        cabinet: {
          name: this._editCabinet.name || "New Rack",
          rows: this._editCabinet.rows || 8,
          cols: this._editCabinet.cols || 8,
          depth: this._editCabinet.depth || 1,
          has_bottom_zone: false,
          bottom_zone_name: "",
          storage_rows: this._editStorageRows,
          order: this.cabinets.length,
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
      const newRows = this._editCabinet.rows || 8;
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
  }

  private async _moveDown(cabinet: Cabinet) {
    const sorted = [...this.cabinets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === cabinet.id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
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
    const numRows = this._editCabinet.rows || 8;

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

        <div class="form-row">
          <div class="form-group">
            <label>Rows</label>
            <input
              type="number"
              min="1"
              max="20"
              .value=${(this._editCabinet.rows || 8).toString()}
              @input=${(e: InputEvent) => {
                const newRows = parseInt((e.target as HTMLInputElement).value) || 1;
                this._editCabinet = { ...this._editCabinet, rows: newRows };
                // Remove storage rows that are beyond the new row count
                this._editStorageRows = this._editStorageRows.filter((sr) => sr.row < newRows);
              }}
            />
          </div>
          <div class="form-group">
            <label>Columns</label>
            <input
              type="number"
              min="1"
              max="20"
              .value=${(this._editCabinet.cols || 8).toString()}
              @input=${(e: InputEvent) =>
                (this._editCabinet = {
                  ...this._editCabinet,
                  cols: parseInt((e.target as HTMLInputElement).value) || 1,
                })}
            />
          </div>
          <div class="form-group">
            <label>Depth</label>
            <select
              .value=${((this._editCabinet as any).depth || 1).toString()}
              @change=${(e: Event) =>
                (this._editCabinet = {
                  ...this._editCabinet,
                  depth: parseInt((e.target as HTMLSelectElement).value) || 1,
                })}
              style="padding: 8px; border: 1px solid var(--wc-border); border-radius: 8px; background: var(--wc-bg); color: var(--wc-text); font-size: 1em;"
            >
              <option value="1">1 deep</option>
              <option value="2">2 deep</option>
              <option value="3">3 deep</option>
            </select>
          </div>
        </div>

        <!-- Row layout editor -->
        <div class="row-layout">
          <div class="row-layout-title">Row Layout</div>
          <div class="row-layout-hint">Tap a row to toggle between bottle slots and storage zone</div>
          <div class="row-layout-list">
            ${Array.from({ length: numRows }, (_, row) => {
              const isStorage = this._isStorageRow(row);
              const sr = this._editStorageRows.find((s) => s.row === row);
              return html`
                <div class="row-entry ${isStorage ? "storage" : ""}">
                  <span class="row-num">R${row + 1}</span>
                  <span class="row-type ${isStorage ? "is-storage" : ""}">
                    ${isStorage ? "Storage" : `${this._editCabinet.cols || 8} slots`}
                  </span>
                  ${isStorage
                    ? html`
                        <input
                          type="text"
                          .value=${sr?.name || "Storage"}
                          @input=${(e: InputEvent) =>
                            this._updateStorageRowName(row, (e.target as HTMLInputElement).value)}
                          @click=${(e: Event) => e.stopPropagation()}
                          placeholder="Zone name"
                        />
                      `
                    : nothing}
                  <button
                    class="toggle-btn"
                    @click=${() => this._toggleStorageRow(row)}
                  >
                    ${isStorage ? "→ Slots" : "→ Storage"}
                  </button>
                </div>
              `;
            })}
          </div>
        </div>

        ${oobCount > 0
          ? html`
              <div class="warning-msg">
                Shrinking will unassign ${oobCount} wine${oobCount > 1 ? "s" : ""} that are outside the new grid bounds.
              </div>
            `
          : nothing}

        ${this._error
          ? html`<div class="error-msg" style="color:#c62828;margin-top:8px">${this._error}</div>`
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
          ? html`<div style="color:#c62828;font-size:0.85em">${this._error}</div>`
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
