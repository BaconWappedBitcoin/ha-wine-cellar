import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Cabinet, Wine, StorageRow, WINE_TYPE_COLORS, WineType } from "../models";
import { sharedStyles } from "../styles";

@customElement("cabinet-grid")
export class CabinetGrid extends LitElement {
  @property({ attribute: false }) cabinet!: Cabinet;
  @property({ attribute: false }) wines: Wine[] = [];

  @state() private _dragOverCell: string | null = null;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .cabinet {
        background: linear-gradient(135deg, #8b6914 0%, #c4973b 50%, #8b6914 100%);
        border-radius: 12px;
        padding: 8px;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3),
          0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .cabinet-name {
        text-align: center;
        color: #f5e6ca;
        font-size: 0.8em;
        font-weight: 600;
        padding: 4px 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .grid-inner {
        background: linear-gradient(180deg, #1a1a3a 0%, #0d0d2b 100%);
        border-radius: 8px;
        padding: 6px;
        position: relative;
        overflow: hidden;
      }

      /* Blue LED glow effect */
      .grid-inner::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          ellipse at center,
          rgba(50, 100, 255, 0.15) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      .row {
        display: flex;
        gap: 2px;
        margin-bottom: 2px;
        position: relative;
      }

      /* Scalloped shelf appearance */
      .row::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #6b5010 0%, #a07828 50%, #6b5010 100%);
        border-radius: 0 0 2px 2px;
      }

      .cell {
        flex: 1;
        aspect-ratio: 1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        min-width: 0;
        z-index: 1;
        container-type: inline-size;
      }

      .cell.empty {
        background: rgba(255, 255, 255, 0.05);
        border: 1px dashed rgba(255, 255, 255, 0.15);
      }

      .cell.empty:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .cell.filled {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 0 8px rgba(50, 100, 255, 0.15);
        border: 2px solid var(--bottle-type-color, rgba(255, 255, 255, 0.1));
        overflow: hidden;
      }

      .cell .wine-thumb {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      .cell.filled:hover {
        transform: scale(1.15);
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5),
          0 0 16px rgba(50, 100, 255, 0.3);
      }

      .cell .bottle-label {
        position: absolute;
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 6px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 40px;
        display: none;
        pointer-events: none;
      }

      .cell.filled:hover .bottle-label {
        display: block;
      }

      .cell .disposition {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 65%;
        height: 65%;
        border-radius: 50%;
        font-size: clamp(7px, 30cqi, 14px);
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        z-index: 2;
        pointer-events: none;
        line-height: 1;
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }

      .cell .disposition.drink {
        background: #2e7d32;
      }

      .cell .disposition.hold {
        background: #1565c0;
      }

      .cell .disposition.past {
        background: #c62828;
      }

      .cell .rating-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        font-size: 6px;
        font-weight: 700;
        color: #fff;
        background: rgba(0,0,0,0.6);
        border-radius: 4px;
        padding: 1px 3px;
        z-index: 2;
        pointer-events: none;
        line-height: 1;
        display: none;
      }

      .cell.filled:hover .rating-badge {
        display: block;
      }

      .cell .depth-badge {
        position: absolute;
        top: -2px;
        left: -2px;
        font-size: 7px;
        font-weight: 700;
        color: #fff;
        background: rgba(30, 136, 229, 0.85);
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        pointer-events: none;
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }

      .depth-dots {
        position: absolute;
        bottom: 16%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 3px;
        z-index: 3;
        pointer-events: none;
      }

      .depth-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.6);
      }

      .depth-dot.empty {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .bottom-zone {
        margin-top: 8px;
        background: linear-gradient(135deg, #6b5010 0%, #8b6914 100%);
        border-radius: 6px;
        padding: 8px;
        min-height: 40px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }

      .bottom-zone-label {
        font-size: 0.65em;
        color: rgba(255, 255, 255, 0.6);
        width: 100%;
        text-align: center;
      }

      .zone-bottle {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s;
      }

      .zone-bottle:hover {
        transform: scale(1.1);
      }

      /* Drag and drop */
      .cell.drag-source {
        opacity: 0.35;
        transform: scale(0.9);
      }

      .cell.drag-over {
        box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.8);
        transform: scale(1.1);
        background: rgba(66, 165, 245, 0.15) !important;
        z-index: 10;
      }

      .cell[draggable="true"] {
        cursor: grab;
      }

      .cell[draggable="true"]:active {
        cursor: grabbing;
      }

      .zone-bottle.drag-over {
        box-shadow: 0 0 0 2px rgba(66, 165, 245, 0.8);
        transform: scale(1.15);
      }

      .bottom-zone.drag-over {
        box-shadow: inset 0 0 0 2px rgba(66, 165, 245, 0.8);
        background: rgba(66, 165, 245, 0.1);
      }

      .zone-count {
        font-weight: 400;
        opacity: 0.7;
        margin-left: 4px;
      }

      .zone-fill-dots {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
      }

      .zone-fill-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
      }

      .zone-fill-dot.empty {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .zone-box-row {
        cursor: pointer;
        padding: 4px 8px;
        min-height: 0;
      }

      .zone-box-row:hover {
        background: linear-gradient(135deg, #7a5a12 0%, #9a7820 100%);
      }

      .zone-box-grid {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        justify-content: center;
        padding: 2px 8px;
      }

      .zone-box-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
      }

      .zone-box-shape {
        width: 56px;
        height: 36px;
        position: relative;
      }

      .zone-box-shape .box-lid {
        position: absolute;
        top: 0;
        left: -2px;
        right: -2px;
        height: 28%;
        background: linear-gradient(180deg, #a08040 0%, #7a6020 100%);
        border-radius: 2px 2px 0 0;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-bottom: none;
      }

      .zone-box-shape .box-body {
        position: absolute;
        top: 28%;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, #8b6914 0%, #6b5010 100%);
        border-radius: 0 0 2px 2px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .zone-box-shape .box-count {
        font-size: 0.7em;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
        line-height: 1;
      }

      .zone-box-item.has-wine .box-count {
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .zone-box-size {
        font-size: 0.55em;
        color: rgba(255, 255, 255, 0.5);
      }

      /* Phone: tighter spacing, smaller elements */
      @media (max-width: 599px) {
        .cabinet {
          padding: 6px;
          border-radius: 10px;
        }
        .cabinet-name {
          font-size: 0.75em;
          padding: 3px 0;
        }
        .grid-inner {
          padding: 4px;
        }
        .row {
          gap: 1px;
          margin-bottom: 1px;
        }
        .row::after {
          height: 2px;
        }
        .cell .bottle-label {
          font-size: 5px;
          max-width: 30px;
        }
        .bottom-zone {
          margin-top: 6px;
          padding: 6px;
          gap: 4px;
          min-height: 32px;
        }
        .bottom-zone-label {
          font-size: 0.6em;
        }
        .zone-bottle {
          width: 22px;
          height: 22px;
          font-size: 7px;
        }
      }

      /* Tablet: moderate sizing */
      @media (min-width: 600px) and (max-width: 1023px) {
        .cabinet {
          padding: 6px;
        }
        .grid-inner {
          padding: 5px;
        }
        .row {
          gap: 2px;
          margin-bottom: 1px;
        }
      }
    `,
  ];

  private _getWinesAt(row: number, col: number): Wine[] {
    return this.wines.filter(
      (w) =>
        w.cabinet_id === this.cabinet.id && w.row === row && w.col === col
    );
  }

  private _getStorageRowSet(): Set<number> {
    const rows = (this.cabinet as any).storage_rows as StorageRow[] | undefined;
    return new Set((rows || []).map((sr) => sr.row));
  }

  private _getStorageRowConfig(row: number): StorageRow | undefined {
    const rows = (this.cabinet as any).storage_rows as StorageRow[] | undefined;
    return (rows || []).find((s) => s.row === row);
  }

  private _getStorageRowName(row: number): string {
    return this._getStorageRowConfig(row)?.name || "Storage";
  }

  private _getBottomZoneWines(): Wine[] {
    return this.wines.filter(
      (w) => w.cabinet_id === this.cabinet.id && w.zone === "bottom"
    );
  }

  private _getStorageRowWines(row: number): Wine[] {
    return this.wines.filter(
      (w) => w.cabinet_id === this.cabinet.id && w.zone === `storage-${row}`
    );
  }

  private _onCellClick(row: number, col: number, wine?: Wine, wineCount = 0, cabinetDepth = 1, wines: Wine[] = []) {
    this.dispatchEvent(
      new CustomEvent("cell-click", {
        detail: {
          cabinet: this.cabinet,
          row,
          col,
          wine,
          wines,
          wineCount,
          cabinetDepth,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onZoneClick(wine?: Wine, zone = "bottom") {
    this.dispatchEvent(
      new CustomEvent("zone-click", {
        detail: {
          cabinet: this.cabinet,
          zone,
          wine,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onZoneContainerClick(zone: string, storageRow: StorageRow) {
    this.dispatchEvent(
      new CustomEvent("zone-container-click", {
        detail: {
          cabinet: this.cabinet,
          zone,
          storageRow,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _brightenColor(hex: string): string {
    // Make wine type colors brighter for the ring border
    const brightMap: Record<string, string> = {
      "#722F37": "#c44d58",  // red → brighter red
      "#F5E6CA": "#fff8e8",  // white → bright cream
      "#E8A0BF": "#f5c0d8",  // rosé → brighter pink
      "#D4E09B": "#e8f0b8",  // sparkling → brighter green
      "#DAA520": "#f0c040",  // dessert → brighter gold
    };
    return brightMap[hex] || hex;
  }

  // --- Long press (mobile move) ---

  private _longPressTimer: number | null = null;

  private _onTouchStart(wine: Wine) {
    this._longPressTimer = window.setTimeout(() => {
      this._longPressTimer = null;
      this.dispatchEvent(new CustomEvent("wine-longpress", {
        detail: { wine, cabinet: this.cabinet },
        bubbles: true,
        composed: true,
      }));
    }, 500);
  }

  private _onTouchEnd() {
    if (this._longPressTimer !== null) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  private _onTouchMove() {
    if (this._longPressTimer !== null) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  // --- Drag and drop ---

  private _onDragStart(e: DragEvent, wine: Wine, row?: number, col?: number, zone?: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({
      wineId: wine.id,
      cabinetId: this.cabinet.id,
      row: row ?? null,
      col: col ?? null,
      zone: zone || "",
    }));
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("drag-source");
  }

  private _onDragEnd(e: DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove("drag-source");
    this._dragOverCell = null;
  }

  private _onDragOver(e: DragEvent, key: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    this._dragOverCell = key;
  }

  private _onDragLeave(_e: DragEvent) {
    this._dragOverCell = null;
  }

  private _onDrop(e: DragEvent, targetRow?: number, targetCol?: number, targetZone?: string) {
    e.preventDefault();
    this._dragOverCell = null;
    if (!e.dataTransfer) return;
    try {
      const source = JSON.parse(e.dataTransfer.getData("text/plain"));
      this.dispatchEvent(new CustomEvent("wine-drop", {
        detail: {
          wineId: source.wineId,
          sourceCabinetId: source.cabinetId,
          sourceRow: source.row,
          sourceCol: source.col,
          sourceZone: source.zone,
          targetCabinetId: this.cabinet.id,
          targetRow: targetRow ?? null,
          targetCol: targetCol ?? null,
          targetZone: targetZone || "",
        },
        bubbles: true,
        composed: true,
      }));
    } catch { /* ignore bad data */ }
  }

  private _renderStorageZone(row: number) {
    const sr = this._getStorageRowConfig(row);
    const zoneName = sr?.name || "Storage";
    const zoneType = sr?.type || "bulk";
    const capacity = sr?.capacity || 20;
    const zoneId = `storage-${row}`;
    const wines = this._getStorageRowWines(row);
    const zoneKey = `zone-${zoneId}`;
    const isDragOver = this._dragOverCell === zoneKey;

    if (zoneType === "box") {
      return this._renderBoxZone(zoneId, zoneKey, zoneName, capacity, wines, isDragOver, sr!);
    }
    // Default: bulk
    return this._renderBulkZone(zoneId, zoneKey, zoneName, capacity, wines, isDragOver, sr!);
  }

  private _renderBulkZone(zoneId: string, zoneKey: string, name: string, capacity: number, wines: Wine[], isDragOver: boolean, sr: StorageRow) {
    return html`
      <div class="bottom-zone ${isDragOver ? "drag-over" : ""}"
        @click=${() => sr ? this._onZoneContainerClick(zoneId, sr) : this._onZoneClick(undefined, zoneId)}
        @dragover=${(e: DragEvent) => this._onDragOver(e, zoneKey)}
        @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
        @drop=${(e: DragEvent) => this._onDrop(e, undefined, undefined, zoneId)}>
        <div class="bottom-zone-label">◇ ${name} <span class="zone-count">${wines.length}/${capacity}</span></div>
        ${wines.map(
          (wine) => html`
            <div
              class="zone-bottle"
              style="background: ${WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red}"
              draggable="true"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._onZoneClick(wine, zoneId);
              }}
              @dragstart=${(e: DragEvent) => { e.stopPropagation(); this._onDragStart(e, wine, undefined, undefined, zoneId); }}
              @dragend=${(e: DragEvent) => this._onDragEnd(e)}
              title="${wine.name}"
            >
              ${(wine.vintage || "NV").toString().slice(-2)}
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderBoxZone(zoneId: string, zoneKey: string, name: string, capacity: number, wines: Wine[], isDragOver: boolean, sr: StorageRow) {
    const boxes = sr.boxes || [capacity];
    let offset = 0;
    const boxSegments = boxes.map((boxSize) => {
      const start = offset;
      offset += boxSize;
      const boxWines = wines.filter((w) => {
        const d = w.depth || 0;
        return d >= start && d < start + boxSize;
      });
      return { size: boxSize, start, wineCount: boxWines.length };
    });

    return html`
      <div class="bottom-zone zone-box-row ${isDragOver ? "drag-over" : ""}"
        @click=${() => this._onZoneContainerClick(zoneId, sr)}
        @dragover=${(e: DragEvent) => this._onDragOver(e, zoneKey)}
        @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
        @drop=${(e: DragEvent) => this._onDrop(e, undefined, undefined, zoneId)}>
        <div class="bottom-zone-label">📦 ${name} <span class="zone-count">${wines.length}/${capacity}</span></div>
        <div class="zone-box-grid">
          ${boxSegments.map((seg) => html`
            <div class="zone-box-item ${seg.wineCount > 0 ? "has-wine" : ""}">
              <div class="zone-box-shape">
                <div class="box-lid"></div>
                <div class="box-body"><span class="box-count">${seg.wineCount}/${seg.size}</span></div>
              </div>
              <div class="zone-box-size">${seg.size}-pk</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private _renderGridRow(row: number, cols: number) {
    const cabinetDepth = (this.cabinet as any).depth || 1;
    return html`
      <div class="row">
        ${Array.from({ length: cols }, (_, col) => {
          const wines = this._getWinesAt(row, col);
          const wineCount = wines.length;
          const frontWine = wines.length > 0
            ? wines.sort((a, b) => (a.depth || 0) - (b.depth || 0))[0]
            : undefined;
          const bgColor = frontWine
            ? WINE_TYPE_COLORS[frontWine.type as WineType] || WINE_TYPE_COLORS.red
            : "transparent";
          const disp = frontWine?.disposition || "";
          const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
          const ratingDisplay = frontWine?.rating ? frontWine.rating.toFixed(1) : "";
          const ringColor = frontWine ? this._brightenColor(bgColor) : "";
          const cellKey = `${row}-${col}`;
          const isDragOver = this._dragOverCell === cellKey;
          return html`
            <div
              class="cell ${frontWine ? "filled" : "empty"} ${isDragOver ? "drag-over" : ""}"
              style=${frontWine ? `background: ${bgColor}; --bottle-type-color: ${ringColor}` : ""}
              draggable=${frontWine ? "true" : "false"}
              @click=${() => this._onCellClick(row, col, frontWine, wineCount, cabinetDepth, wines)}
              @touchstart=${frontWine ? () => this._onTouchStart(frontWine) : nothing}
              @touchend=${frontWine ? () => this._onTouchEnd() : nothing}
              @touchmove=${frontWine ? () => this._onTouchMove() : nothing}
              @dragstart=${frontWine ? (e: DragEvent) => this._onDragStart(e, frontWine, row, col) : nothing}
              @dragend=${frontWine ? (e: DragEvent) => this._onDragEnd(e) : nothing}
              @dragover=${(e: DragEvent) => this._onDragOver(e, cellKey)}
              @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
              @drop=${(e: DragEvent) => this._onDrop(e, row, col)}
              title=${frontWine
                ? `${frontWine.name} (${frontWine.vintage || "NV"})${frontWine.rating ? ` ★${frontWine.rating}` : ""}${wineCount > 1 ? ` [${wineCount}/${cabinetDepth} deep]` : ""}`
                : `Empty - Row ${row + 1}, Col ${col + 1}`}
            >
              ${frontWine
                ? html`
                    ${frontWine.image_url ? html`<img class="wine-thumb" src="${frontWine.image_url}" alt="" />` : nothing}
                    <span class="bottle-label">${frontWine.vintage || "NV"}</span>
                    ${dispClass ? html`<span class="disposition ${dispClass}">${disp}</span>` : nothing}
                    ${ratingDisplay ? html`<span class="rating-badge">★${ratingDisplay}</span>` : nothing}
                    ${wineCount > 1 ? html`<span class="depth-badge">${wineCount}</span>` : nothing}
                    ${cabinetDepth >= 2
                      ? html`
                          <span class="depth-dots">
                            ${Array.from({ length: cabinetDepth }, (_, d) => {
                              const wineAtDepth = wines.find((w) => (w.depth || 0) === d);
                              const dotColor = wineAtDepth
                                ? WINE_TYPE_COLORS[wineAtDepth.type as WineType] || WINE_TYPE_COLORS.red
                                : "";
                              return html`<span
                                class="depth-dot ${wineAtDepth ? "" : "empty"}"
                                style=${wineAtDepth ? `background: ${dotColor}` : ""}
                              ></span>`;
                            })}
                          </span>
                        `
                      : nothing}
                  `
                : cabinetDepth >= 2 && wineCount === 0
                  ? html`
                      <span class="depth-dots">
                        ${Array.from({ length: cabinetDepth }, () =>
                          html`<span class="depth-dot empty"></span>`
                        )}
                      </span>
                    `
                  : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCell(row: number, col: number) {
    const cabinetDepth = (this.cabinet as any).depth || 1;
    const wines = this._getWinesAt(row, col);
    const wineCount = wines.length;
    const frontWine = wines.length > 0
      ? wines.sort((a, b) => (a.depth || 0) - (b.depth || 0))[0]
      : undefined;
    const bgColor = frontWine
      ? WINE_TYPE_COLORS[frontWine.type as WineType] || WINE_TYPE_COLORS.red
      : "transparent";
    const disp = frontWine?.disposition || "";
    const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
    const ratingDisplay = frontWine?.rating ? frontWine.rating.toFixed(1) : "";
    const ringColor = frontWine ? this._brightenColor(bgColor) : "";
    const cellKey = `${row}-${col}`;
    const isDragOver = this._dragOverCell === cellKey;
    return html`
      <div
        class="cell ${frontWine ? "filled" : "empty"} ${isDragOver ? "drag-over" : ""}"
        style=${frontWine ? `background: ${bgColor}; --bottle-type-color: ${ringColor}` : ""}
        draggable=${frontWine ? "true" : "false"}
        @click=${() => this._onCellClick(row, col, frontWine, wineCount, cabinetDepth, wines)}
        @touchstart=${frontWine ? () => this._onTouchStart(frontWine) : nothing}
        @touchend=${frontWine ? () => this._onTouchEnd() : nothing}
        @touchmove=${frontWine ? () => this._onTouchMove() : nothing}
        @dragstart=${frontWine ? (e: DragEvent) => this._onDragStart(e, frontWine, row, col) : nothing}
        @dragend=${frontWine ? (e: DragEvent) => this._onDragEnd(e) : nothing}
        @dragover=${(e: DragEvent) => this._onDragOver(e, cellKey)}
        @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
        @drop=${(e: DragEvent) => this._onDrop(e, row, col)}
        title=${frontWine
          ? `${frontWine.name} (${frontWine.vintage || "NV"})${frontWine.rating ? ` ★${frontWine.rating}` : ""}${wineCount > 1 ? ` [${wineCount}/${cabinetDepth} deep]` : ""}`
          : `Empty - Row ${row + 1}, Col ${col + 1}`}
      >
        ${frontWine
          ? html`
              ${frontWine.image_url ? html`<img class="wine-thumb" src="${frontWine.image_url}" alt="" />` : nothing}
              <span class="bottle-label">${frontWine.vintage || "NV"}</span>
              ${dispClass ? html`<span class="disposition ${dispClass}">${disp}</span>` : nothing}
              ${ratingDisplay ? html`<span class="rating-badge">★${ratingDisplay}</span>` : nothing}
              ${wineCount > 1 ? html`<span class="depth-badge">${wineCount}</span>` : nothing}
              ${cabinetDepth >= 2
                ? html`
                    <span class="depth-dots">
                      ${Array.from({ length: cabinetDepth }, (_, d) => {
                        const wineAtDepth = wines.find((w) => (w.depth || 0) === d);
                        const dotColor = wineAtDepth
                          ? WINE_TYPE_COLORS[wineAtDepth.type as WineType] || WINE_TYPE_COLORS.red
                          : "";
                        return html`<span
                          class="depth-dot ${wineAtDepth ? "" : "empty"}"
                          style=${wineAtDepth ? `background: ${dotColor}` : ""}
                        ></span>`;
                      })}
                    </span>
                  `
                : nothing}
            `
          : cabinetDepth >= 2 && wineCount === 0
            ? html`
                <span class="depth-dots">
                  ${Array.from({ length: cabinetDepth }, () =>
                    html`<span class="depth-dot empty"></span>`
                  )}
                </span>
              `
            : nothing}
      </div>
    `;
  }

  render() {
    const { rows, cols } = this.cabinet;
    const storageRows = this._getStorageRowSet();

    return html`
      <div class="cabinet">
        <div class="cabinet-name">${this.cabinet.name}</div>
        <div class="grid-inner">
          ${Array.from({ length: rows }, (_, row) =>
              storageRows.has(row)
                ? this._renderStorageZone(row)
                : this._renderGridRow(row, cols)
            )
          }
        </div>
        ${this.cabinet.has_bottom_zone
          ? html`
              <div class="bottom-zone ${this._dragOverCell === "zone-bottom" ? "drag-over" : ""}"
                @click=${() => this._onZoneClick()}
                @dragover=${(e: DragEvent) => this._onDragOver(e, "zone-bottom")}
                @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
                @drop=${(e: DragEvent) => this._onDrop(e, undefined, undefined, "bottom")}>
                <div class="bottom-zone-label">
                  ${this.cabinet.bottom_zone_name}
                </div>
                ${this._getBottomZoneWines().map(
                  (wine) => html`
                    <div
                      class="zone-bottle"
                      style="background: ${WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red}"
                      draggable="true"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._onZoneClick(wine);
                      }}
                      @dragstart=${(e: DragEvent) => { e.stopPropagation(); this._onDragStart(e, wine, undefined, undefined, "bottom"); }}
                      @dragend=${(e: DragEvent) => this._onDragEnd(e)}
                      title="${wine.name}"
                    >
                      ${(wine.vintage || "NV").toString().slice(-2)}
                    </div>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
