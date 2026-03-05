import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Cabinet, Wine, StorageRow, WINE_TYPE_COLORS, WineType } from "../models";
import { sharedStyles } from "../styles";

@customElement("cabinet-grid")
export class CabinetGrid extends LitElement {
  @property({ attribute: false }) cabinet!: Cabinet;
  @property({ attribute: false }) wines: Wine[] = [];

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
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 11px;
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

  private _getWineAt(row: number, col: number): Wine | undefined {
    return this.wines.find(
      (w) =>
        w.cabinet_id === this.cabinet.id && w.row === row && w.col === col
    );
  }

  private _getStorageRowSet(): Set<number> {
    const rows = (this.cabinet as any).storage_rows as StorageRow[] | undefined;
    return new Set((rows || []).map((sr) => sr.row));
  }

  private _getStorageRowName(row: number): string {
    const rows = (this.cabinet as any).storage_rows as StorageRow[] | undefined;
    const sr = (rows || []).find((s) => s.row === row);
    return sr?.name || "Storage";
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

  private _onCellClick(row: number, col: number, wine?: Wine) {
    this.dispatchEvent(
      new CustomEvent("cell-click", {
        detail: {
          cabinet: this.cabinet,
          row,
          col,
          wine,
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

  private _renderStorageZone(row: number) {
    const zoneName = this._getStorageRowName(row);
    const zoneId = `storage-${row}`;
    const wines = this._getStorageRowWines(row);
    return html`
      <div class="bottom-zone" @click=${() => this._onZoneClick(undefined, zoneId)}>
        <div class="bottom-zone-label">${zoneName}</div>
        ${wines.map(
          (wine) => html`
            <div
              class="zone-bottle"
              style="background: ${WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red}"
              @click=${(e: Event) => {
                e.stopPropagation();
                this._onZoneClick(wine, zoneId);
              }}
              title="${wine.name}"
            >
              ${(wine.vintage || "NV").toString().slice(-2)}
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderGridRow(row: number, cols: number) {
    return html`
      <div class="row">
        ${Array.from({ length: cols }, (_, col) => {
          const wine = this._getWineAt(row, col);
          const bgColor = wine
            ? WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red
            : "transparent";
          const disp = wine?.disposition || "";
          const dispClass = disp === "D" ? "drink" : disp === "H" ? "hold" : disp === "P" ? "past" : "";
          const ratingDisplay = wine?.rating ? wine.rating.toFixed(1) : "";
          // Brighter ring color for type visibility
          const ringColor = wine ? this._brightenColor(bgColor) : "";
          return html`
            <div
              class="cell ${wine ? "filled" : "empty"}"
              style=${wine ? `background: ${bgColor}; --bottle-type-color: ${ringColor}` : ""}
              @click=${() => this._onCellClick(row, col, wine)}
              title=${wine ? `${wine.name} (${wine.vintage || "NV"})${wine.rating ? ` ★${wine.rating}` : ""}` : `Empty - Row ${row + 1}, Col ${col + 1}`}
            >
              ${wine
                ? html`
                    ${wine.image_url ? html`<img class="wine-thumb" src="${wine.image_url}" alt="" />` : nothing}
                    <span class="bottle-label">${wine.vintage || "NV"}</span>
                    ${dispClass ? html`<span class="disposition ${dispClass}">${disp}</span>` : nothing}
                    ${ratingDisplay ? html`<span class="rating-badge">★${ratingDisplay}</span>` : nothing}
                  `
                : nothing}
            </div>
          `;
        })}
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
          )}
        </div>
        ${this.cabinet.has_bottom_zone
          ? html`
              <div class="bottom-zone" @click=${() => this._onZoneClick()}>
                <div class="bottom-zone-label">
                  ${this.cabinet.bottom_zone_name}
                </div>
                ${this._getBottomZoneWines().map(
                  (wine) => html`
                    <div
                      class="zone-bottle"
                      style="background: ${WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._onZoneClick(wine);
                      }}
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
