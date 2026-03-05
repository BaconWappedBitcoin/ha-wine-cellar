import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Cabinet, Wine } from "../models";
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

      .zone-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
        font-size: 0.9em;
      }

      .zone-toggle input[type="checkbox"] {
        width: auto;
        margin: 0;
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
      has_bottom_zone: false,
      bottom_zone_name: "Box Storage",
    };
  }

  private _startEdit(cabinet: Cabinet) {
    this._mode = "edit";
    this._error = "";
    this._editCabinet = { ...cabinet };
  }

  private _startDelete(cabinet: Cabinet) {
    this._mode = "delete-confirm";
    this._error = "";
    this._deleteCabinet = cabinet;
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
          has_bottom_zone: this._editCabinet.has_bottom_zone || false,
          bottom_zone_name: this._editCabinet.bottom_zone_name || "Box Storage",
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

      await this.hass.callWS({
        type: "wine_cellar/update_cabinet",
        cabinet_id: cabinetId,
        updates: {
          name: this._editCabinet.name,
          rows: newRows,
          cols: newCols,
          has_bottom_zone: this._editCabinet.has_bottom_zone,
          bottom_zone_name: this._editCabinet.bottom_zone_name,
        },
      });

      // Unassign wines that are out of bounds
      const outOfBounds = this.wines.filter(
        (w) =>
          w.cabinet_id === cabinetId &&
          w.row != null &&
          w.col != null &&
          (w.row >= newRows || w.col >= newCols)
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
            (cab, idx) => html`
              <div class="rack-item">
                <div class="rack-info">
                  <div class="rack-name">${cab.name}</div>
                  <div class="rack-meta">
                    ${cab.rows} × ${cab.cols} (${cab.rows * cab.cols} slots)
                    · ${this._winesInCabinet(cab.id)} bottles
                    ${cab.has_bottom_zone ? " · + zone" : ""}
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
            `
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
    const title = isEdit ? "Edit Rack" : "Add Rack";

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
              @input=${(e: InputEvent) =>
                (this._editCabinet = {
                  ...this._editCabinet,
                  rows: parseInt((e.target as HTMLInputElement).value) || 1,
                })}
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
        </div>

        <div class="zone-toggle">
          <input
            type="checkbox"
            id="zone-check"
            .checked=${this._editCabinet.has_bottom_zone || false}
            @change=${(e: Event) =>
              (this._editCabinet = {
                ...this._editCabinet,
                has_bottom_zone: (e.target as HTMLInputElement).checked,
              })}
          />
          <label for="zone-check">Has bottom zone (box storage)</label>
        </div>

        ${this._editCabinet.has_bottom_zone
          ? html`
              <div class="form-group">
                <label>Zone Name</label>
                <input
                  type="text"
                  .value=${this._editCabinet.bottom_zone_name || "Box Storage"}
                  @input=${(e: InputEvent) =>
                    (this._editCabinet = {
                      ...this._editCabinet,
                      bottom_zone_name: (e.target as HTMLInputElement).value,
                    })}
                />
              </div>
            `
          : nothing}

        ${oobCount > 0
          ? html`
              <div class="warning-msg">
                ⚠️ Shrinking will unassign ${oobCount} wine${oobCount > 1 ? "s" : ""} that are outside the new grid bounds.
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
