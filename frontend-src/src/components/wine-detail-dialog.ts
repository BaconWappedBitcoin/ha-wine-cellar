import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Wine, TastingNotes, WINE_TYPE_LABELS, WINE_TYPE_COLORS, WineType } from "../models";
import { sharedStyles } from "../styles";
import "./star-rating";

@customElement("wine-detail-dialog")
export class WineDetailDialog extends LitElement {
  @property({ attribute: false }) wine: Wine | null = null;
  @property({ attribute: false }) hass: any;
  @property({ type: Boolean }) open = false;

  @state() private _editing = false;
  @state() private _userRating: number = 0;
  @state() private _tastingNotes: TastingNotes = { aroma: "", taste: "", finish: "", overall: "" };
  @state() private _saving = false;
  @state() private _refreshing = false;

  static styles = [
    sharedStyles,
    css`
      .wine-header {
        display: flex;
        gap: 16px;
        padding: 20px;
      }

      .wine-image {
        width: 90px;
        height: 130px;
        border-radius: 8px;
        object-fit: cover;
        background: #f0f0f0;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .wine-image-placeholder {
        width: 90px;
        height: 130px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        flex-shrink: 0;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .wine-title {
        flex: 1;
        min-width: 0;
      }

      .wine-name {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--wc-text);
        margin-bottom: 4px;
      }

      .wine-winery {
        font-size: 0.9em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .wine-type-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75em;
        font-weight: 600;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .wine-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
        font-size: 0.9em;
      }

      .rating-star {
        color: #f5a623;
      }

      .drink-by-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        font-size: 0.9em;
        font-weight: 500;
      }

      .drink-by-banner.drink {
        background: rgba(46, 125, 50, 0.12);
        color: #2e7d32;
      }

      .drink-by-banner.hold {
        background: rgba(21, 101, 192, 0.12);
        color: #1565c0;
      }

      .drink-by-banner.past {
        background: rgba(198, 40, 40, 0.12);
        color: #c62828;
      }

      .wine-description {
        padding: 0 20px 12px;
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        line-height: 1.4;
        font-style: italic;
      }

      .info-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 20px 12px;
      }

      .info-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 0.75em;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--wc-border);
        color: var(--wc-text-secondary);
      }

      .info-chip-icon {
        font-size: 1.1em;
      }

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 0 20px 16px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
      }

      .detail-label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }

      .detail-value {
        font-size: 0.95em;
        color: var(--wc-text);
        font-weight: 500;
      }

      .wine-notes {
        padding: 0 20px 16px;
      }

      .wine-notes-text {
        font-size: 0.9em;
        color: var(--wc-text-secondary);
        font-style: italic;
        background: rgba(0, 0, 0, 0.03);
        padding: 10px;
        border-radius: 8px;
      }

      /* Rating & Tasting Notes section */
      .section {
        padding: 0 20px 16px;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .section-title {
        font-size: 0.85em;
        font-weight: 600;
        color: var(--wc-text);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .edit-toggle {
        background: none;
        border: none;
        color: var(--wc-primary, #6d4c41);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .edit-toggle:hover {
        background: rgba(109, 76, 65, 0.1);
      }

      .rating-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .rating-label {
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        min-width: 70px;
      }

      .no-rating {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        font-style: italic;
      }

      .tasting-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .tasting-field {
        display: flex;
        flex-direction: column;
      }

      .tasting-field.full-width {
        grid-column: 1 / -1;
      }

      .tasting-field label {
        font-size: 0.75em;
        color: var(--wc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .tasting-field textarea {
        font-family: inherit;
        font-size: 0.85em;
        padding: 8px;
        border: 1px solid var(--wc-border, #e0e0e0);
        border-radius: 8px;
        resize: vertical;
        min-height: 50px;
        background: var(--wc-bg);
        color: var(--wc-text);
      }

      .tasting-field textarea:focus {
        outline: none;
        border-color: var(--wc-primary, #6d4c41);
      }

      .tasting-value {
        font-size: 0.85em;
        color: var(--wc-text);
        background: rgba(0, 0, 0, 0.03);
        padding: 8px;
        border-radius: 8px;
        min-height: 20px;
      }

      .divider {
        height: 1px;
        background: var(--wc-border, #e0e0e0);
        margin: 0 20px 16px;
      }

      .actions {
        display: flex;
        gap: 8px;
        padding: 12px 20px 20px;
        border-top: 1px solid var(--wc-border);
      }

      @media (max-width: 599px) {
        .tasting-grid {
          grid-template-columns: 1fr;
        }
        .tasting-field.full-width {
          grid-column: 1;
        }
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("wine") && this.wine) {
      this._userRating = this.wine.user_rating ?? 0;
      this._tastingNotes = this.wine.tasting_notes
        ? { ...this.wine.tasting_notes }
        : { aroma: "", taste: "", finish: "", overall: "" };
      this._editing = false;
    }
  }

  private _close() {
    this.open = false;
    this._editing = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _onRemove() {
    if (this.wine) {
      this.dispatchEvent(
        new CustomEvent("remove-wine", {
          detail: { wine_id: this.wine.id },
          bubbles: true,
          composed: true,
        })
      );
      this._close();
    }
  }

  private _onMove() {
    if (this.wine) {
      this.dispatchEvent(
        new CustomEvent("move-wine", {
          detail: { wine: this.wine },
          bubbles: true,
          composed: true,
        })
      );
      this._close();
    }
  }

  private _onCopy() {
    if (this.wine) {
      this.dispatchEvent(
        new CustomEvent("copy-wine", {
          detail: { wine: this.wine },
          bubbles: true,
          composed: true,
        })
      );
      this._close();
    }
  }

  private _onRatingChange(e: CustomEvent) {
    this._userRating = e.detail.value;
  }

  private _onTastingChange(field: keyof TastingNotes, e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    this._tastingNotes = { ...this._tastingNotes, [field]: value };
  }

  private async _save() {
    if (!this.wine || !this.hass) return;
    this._saving = true;
    try {
      const updates: Record<string, any> = {
        user_rating: this._userRating || null,
        tasting_notes: this._hasTastingNotes() ? this._tastingNotes : null,
      };
      await this.hass.callWS({
        type: "wine_cellar/update_wine",
        wine_id: this.wine.id,
        updates,
      });
      // Update local wine object
      this.wine = { ...this.wine, ...updates };
      this._editing = false;
      this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
    } catch (err) {
      console.error("Failed to save rating/notes", err);
    }
    this._saving = false;
  }

  private async _refreshFromVivino() {
    if (!this.wine || !this.hass) return;
    this._refreshing = true;
    try {
      const resp = await this.hass.callWS({
        type: "wine_cellar/refresh_wine",
        wine_id: this.wine.id,
      });
      if (resp.error) {
        alert(resp.error);
      } else if (resp.wine) {
        this.wine = { ...this.wine, ...resp.wine };
        this.dispatchEvent(new CustomEvent("wine-updated", { bubbles: true, composed: true }));
      }
    } catch (err) {
      console.error("Vivino refresh failed", err);
    }
    this._refreshing = false;
  }

  private _hasTastingNotes(): boolean {
    const n = this._tastingNotes;
    return !!(n.aroma || n.taste || n.finish || n.overall);
  }

  render() {
    if (!this.open || !this.wine) return nothing;

    const wine = this.wine;
    const typeColor = WINE_TYPE_COLORS[wine.type as WineType] || WINE_TYPE_COLORS.red;
    const typeLabel = WINE_TYPE_LABELS[wine.type as WineType] || wine.type;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="wine-header">
            ${wine.image_url
              ? html`<img class="wine-image" src="${wine.image_url}" alt="${wine.name}" />`
              : html`
                  <div class="wine-image-placeholder" style="background: ${typeColor}">
                    🍷
                  </div>
                `}
            <div class="wine-title">
              <div class="wine-name">${wine.name}</div>
              <div class="wine-winery">${wine.winery}</div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                <span class="wine-type-badge" style="background: ${typeColor}">
                  ${typeLabel}
                </span>
                ${wine.disposition
                  ? html`<span class="wine-type-badge" style="background: ${
                      wine.disposition === "D" ? "#2e7d32" :
                      wine.disposition === "H" ? "#1565c0" :
                      wine.disposition === "P" ? "#c62828" : "#666"
                    }">${
                      wine.disposition === "D" ? "Drink Now" :
                      wine.disposition === "H" ? "Hold" :
                      wine.disposition === "P" ? "Past Peak" : wine.disposition
                    }</span>`
                  : nothing}
              </div>
              ${wine.rating
                ? html`
                    <div class="wine-rating">
                      <span class="rating-star">★</span>
                      ${wine.rating.toFixed(1)}
                      <span style="font-size:0.8em;color:var(--wc-text-secondary)">
                        Vivino${wine.ratings_count ? ` (${wine.ratings_count.toLocaleString()} ratings)` : ""}
                      </span>
                    </div>
                  `
                : nothing}
            </div>
          </div>

          <!-- Drink by banner for disposition wines -->
          ${wine.disposition && wine.drink_by
            ? html`
                <div class="drink-by-banner ${wine.disposition === 'D' ? 'drink' : wine.disposition === 'H' ? 'hold' : wine.disposition === 'P' ? 'past' : ''}">
                  ${wine.disposition === "D" ? "Ready to drink" : wine.disposition === "H" ? "Hold until" : "Past peak since"}
                  ${wine.drink_by}
                </div>
              `
            : wine.disposition === "H" && !wine.drink_by
              ? html`<div class="drink-by-banner hold">Hold — no drink date set</div>`
              : nothing}

          <!-- Description -->
          ${wine.description
            ? html`<div class="wine-description">${wine.description}</div>`
            : nothing}

          <!-- Info chips (food, alcohol, etc.) -->
          ${wine.food_pairings || wine.alcohol
            ? html`
                <div class="info-chips">
                  ${wine.alcohol
                    ? html`<span class="info-chip"><span class="info-chip-icon">%</span> ${wine.alcohol}</span>`
                    : nothing}
                  ${wine.food_pairings
                    ? wine.food_pairings.split(", ").map(
                        (food: string) => html`<span class="info-chip">${food}</span>`
                      )
                    : nothing}
                </div>
              `
            : nothing}

          <div class="details-grid">
            ${wine.vintage
              ? html`<div class="detail-item"><span class="detail-label">Vintage</span><span class="detail-value">${wine.vintage}</span></div>`
              : nothing}
            ${wine.region
              ? html`<div class="detail-item"><span class="detail-label">Region</span><span class="detail-value">${wine.region}</span></div>`
              : nothing}
            ${wine.country
              ? html`<div class="detail-item"><span class="detail-label">Country</span><span class="detail-value">${wine.country}</span></div>`
              : nothing}
            ${wine.grape_variety
              ? html`<div class="detail-item"><span class="detail-label">Grape</span><span class="detail-value">${wine.grape_variety}</span></div>`
              : nothing}
            ${wine.price
              ? html`<div class="detail-item"><span class="detail-label">Price</span><span class="detail-value">$${wine.price.toFixed(2)}</span></div>`
              : nothing}
            ${wine.purchase_date
              ? html`<div class="detail-item"><span class="detail-label">Purchased</span><span class="detail-value">${wine.purchase_date}</span></div>`
              : nothing}
            ${wine.drink_by
              ? html`<div class="detail-item"><span class="detail-label">Drink By</span><span class="detail-value">${wine.drink_by}</span></div>`
              : nothing}
            ${wine.barcode
              ? html`<div class="detail-item"><span class="detail-label">Barcode</span><span class="detail-value">${wine.barcode}</span></div>`
              : nothing}
          </div>

          ${wine.notes
            ? html`
                <div class="wine-notes">
                  <div class="detail-label" style="margin-bottom: 4px">Notes</div>
                  <div class="wine-notes-text">${wine.notes}</div>
                </div>
              `
            : nothing}

          <div class="divider"></div>

          <!-- My Rating section -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">My Rating</span>
              <button class="edit-toggle" @click=${() => (this._editing = !this._editing)}>
                ${this._editing ? "Cancel" : "Edit"}
              </button>
            </div>
            <div class="rating-row">
              <star-rating
                .value=${this._userRating}
                .readonly=${!this._editing}
                .size=${28}
                @rating-change=${this._onRatingChange}
              ></star-rating>
              ${!this._editing && this._userRating === 0
                ? html`<span class="no-rating">Not rated</span>`
                : nothing}
            </div>
          </div>

          <!-- Tasting Notes section -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">Tasting Notes</span>
            </div>
            ${this._editing
              ? html`
                  <div class="tasting-grid">
                    <div class="tasting-field">
                      <label>Aroma</label>
                      <textarea
                        .value=${this._tastingNotes.aroma}
                        placeholder="Berries, oak, vanilla..."
                        @input=${(e: Event) => this._onTastingChange("aroma", e)}
                      ></textarea>
                    </div>
                    <div class="tasting-field">
                      <label>Taste</label>
                      <textarea
                        .value=${this._tastingNotes.taste}
                        placeholder="Full-bodied, tannic..."
                        @input=${(e: Event) => this._onTastingChange("taste", e)}
                      ></textarea>
                    </div>
                    <div class="tasting-field">
                      <label>Finish</label>
                      <textarea
                        .value=${this._tastingNotes.finish}
                        placeholder="Long, smooth..."
                        @input=${(e: Event) => this._onTastingChange("finish", e)}
                      ></textarea>
                    </div>
                    <div class="tasting-field">
                      <label>Overall</label>
                      <textarea
                        .value=${this._tastingNotes.overall}
                        placeholder="Overall impression..."
                        @input=${(e: Event) => this._onTastingChange("overall", e)}
                      ></textarea>
                    </div>
                  </div>
                  <div style="margin-top: 12px; text-align: right">
                    <button
                      class="btn btn-primary"
                      ?disabled=${this._saving}
                      @click=${this._save}
                    >
                      ${this._saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                `
              : this._hasTastingNotes()
                ? html`
                    <div class="tasting-grid">
                      ${this._tastingNotes.aroma
                        ? html`<div class="tasting-field"><label>Aroma</label><div class="tasting-value">${this._tastingNotes.aroma}</div></div>`
                        : nothing}
                      ${this._tastingNotes.taste
                        ? html`<div class="tasting-field"><label>Taste</label><div class="tasting-value">${this._tastingNotes.taste}</div></div>`
                        : nothing}
                      ${this._tastingNotes.finish
                        ? html`<div class="tasting-field"><label>Finish</label><div class="tasting-value">${this._tastingNotes.finish}</div></div>`
                        : nothing}
                      ${this._tastingNotes.overall
                        ? html`<div class="tasting-field full-width"><label>Overall</label><div class="tasting-value">${this._tastingNotes.overall}</div></div>`
                        : nothing}
                    </div>
                  `
                : html`<div class="no-rating">No tasting notes yet. Tap Edit to add your thoughts.</div>`
            }
          </div>

          <div class="actions">
            <button
              class="btn btn-outline"
              style="color: #7b1fa2; border-color: #7b1fa2"
              ?disabled=${this._refreshing}
              @click=${this._refreshFromVivino}
            >
              ${this._refreshing ? "Scanning..." : "🍇 Vivino"}
            </button>
            <button class="btn btn-outline" @click=${this._onCopy}>
              📋 Copy
            </button>
            <button class="btn btn-outline" @click=${this._onMove}>
              ↔ Move
            </button>
            <button
              class="btn btn-outline"
              style="color: #c62828; border-color: #c62828"
              @click=${this._onRemove}
            >
              ✕ Remove
            </button>
            <span style="flex:1"></span>
            <button class="btn btn-primary" @click=${this._close}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
