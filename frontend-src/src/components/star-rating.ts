import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("star-rating")
export class StarRating extends LitElement {
  @property({ type: Number }) value = 0;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Number }) size = 24;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .star {
      cursor: pointer;
      position: relative;
      user-select: none;
      transition: transform 0.15s;
    }

    .star:hover {
      transform: scale(1.2);
    }

    .star.readonly {
      cursor: default;
    }

    .star.readonly:hover {
      transform: none;
    }

    .star svg {
      display: block;
    }

    .rating-text {
      margin-left: 6px;
      font-size: 0.9em;
      font-weight: 600;
      color: var(--wc-text, #212121);
    }
  `;

  private _onClick(starIndex: number, e: MouseEvent) {
    if (this.readonly) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    const newValue = half ? starIndex + 0.5 : starIndex + 1;

    // Toggle off if clicking same value
    const finalValue = newValue === this.value ? 0 : newValue;

    this.dispatchEvent(
      new CustomEvent("rating-change", {
        detail: { value: finalValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderStar(index: number) {
    const fill = this.value - index;
    const s = this.size;

    let starSvg;
    if (fill >= 1) {
      // Full star
      starSvg = html`
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <path fill="#f5a623" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
    } else if (fill >= 0.5) {
      // Half star
      starSvg = html`
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-${index}">
              <stop offset="50%" stop-color="#f5a623"/>
              <stop offset="50%" stop-color="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half-${index})" stroke="#f5a623" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
    } else {
      // Empty star
      starSvg = html`
        <svg width=${s} height=${s} viewBox="0 0 24 24">
          <path fill="none" stroke="#ccc" stroke-width="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `;
    }

    return html`
      <span
        class="star ${this.readonly ? "readonly" : ""}"
        @click=${(e: MouseEvent) => this._onClick(index, e)}
      >
        ${starSvg}
      </span>
    `;
  }

  render() {
    return html`
      ${[0, 1, 2, 3, 4].map((i) => this._renderStar(i))}
      ${this.value > 0
        ? html`<span class="rating-text">${this.value.toFixed(1)}</span>`
        : ""}
    `;
  }
}
