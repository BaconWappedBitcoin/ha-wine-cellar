import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";

@customElement("wine-search-bar")
export class WineSearchBar extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: String }) filter = "all";

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .search-container {
        display: flex;
        gap: 8px;
        padding: 0 16px 8px;
        align-items: center;
      }

      .search-input-wrapper {
        flex: 1;
        position: relative;
      }

      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--wc-text-secondary);
        font-size: 0.9em;
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 8px 12px 8px 32px;
        border: 1px solid var(--wc-border);
        border-radius: 20px;
        font-size: 0.9em;
        background: var(--wc-bg);
        color: var(--wc-text);
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      input:focus {
        border-color: var(--wc-primary);
        outline: none;
      }

      .filter-chips {
        display: flex;
        gap: 4px;
      }

      .chip {
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

      .chip:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      .chip.active {
        background: var(--wc-primary);
        color: #fff;
        border-color: var(--wc-primary);
      }
    `,
  ];

  private _onInput(e: InputEvent) {
    const value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent("search-change", {
        detail: { query: value, filter: this.filter },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onFilterChange(filter: string) {
    this.filter = filter;
    const input = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent("search-change", {
        detail: { query: input?.value || "", filter },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const filters = [
      { id: "all", label: "All" },
      { id: "red", label: "Red" },
      { id: "white", label: "White" },
      { id: "rosé", label: "Rosé" },
      { id: "sparkling", label: "Sparkling" },
      { id: "dessert", label: "Dessert" },
    ];

    return html`
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search wines..."
            .value=${this.value}
            @input=${this._onInput}
          />
        </div>
        <div class="filter-chips">
          ${filters.map(
            (f) => html`
              <button
                class="chip ${this.filter === f.id ? "active" : ""}"
                @click=${() => this._onFilterChange(f.id)}
              >
                ${f.label}
              </button>
            `
          )}
        </div>
      </div>
    `;
  }
}
