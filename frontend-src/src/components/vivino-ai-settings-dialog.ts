import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "../styles";

@customElement("vivino-ai-settings-dialog")
export class VivinoAiSettingsDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean }) aiFallbackAlways = false;
  @property({ type: String }) metadataLanguage = "en";
  @property({ attribute: false }) supportedLanguages: string[] = ["en", "fr", "de"];
  @property({ type: String }) metadataCurrency = "USD";
  @property({ attribute: false }) supportedCurrencies: string[] = ["USD", "EUR", "GBP", "CHF", "AUD"];

  static styles = [
    sharedStyles,
    css`
      .settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--wc-border);
        font-size: 0.85em;
      }

      .settings-row:last-of-type {
        border-bottom: none;
      }

      .settings-label {
        color: var(--wc-text);
      }

      .pill-group {
        display: flex;
        gap: 4px;
      }

      .pill {
        padding: 3px 10px;
        border-radius: 12px;
        border: 1px solid var(--wc-border);
        cursor: pointer;
        background: transparent;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .pill.active {
        background: var(--wc-primary-text);
        color: #fff;
        border-color: var(--wc-primary-text);
      }

      .fallback-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: var(--wc-text);
      }

      .info-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--wc-border);
      }

      .info-title {
        margin: 0 0 12px;
        font-size: 0.95em;
        color: var(--wc-text);
      }

      .info-block {
        margin-bottom: 16px;
      }

      .info-block-title {
        font-weight: 600;
        font-size: 0.85em;
        color: var(--wc-text);
        margin-bottom: 6px;
      }

      .info-block ul {
        margin: 0;
        padding-left: 20px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
        line-height: 1.7;
      }

      .info-note {
        margin: 0;
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        font-style: italic;
      }
    `,
  ];

  private _close() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _setFallback(value: boolean) {
    this.dispatchEvent(new CustomEvent("set-ai-fallback-always", { detail: { value } }));
  }

  private _setLanguage(lang: string) {
    this.dispatchEvent(new CustomEvent("set-metadata-language", { detail: { value: lang } }));
  }

  private _setCurrency(currency: string) {
    this.dispatchEvent(new CustomEvent("set-metadata-currency", { detail: { value: currency } }));
  }

  render() {
    if (!this.open) return nothing;

    return html`
      <div class="dialog-overlay" @click=${this._close}>
        <div class="dialog" style="max-width:420px;padding:20px 24px" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-top-bar" style="justify-content:space-between;padding:0 0 8px">
            <span style="font-weight:600;color:var(--wc-text)">Vivino / AI Settings</span>
            <button class="icon-btn close-btn" title="Close" @click=${this._close}>✕</button>
          </div>

          <div class="settings-row">
            <label class="fallback-label">
              <input
                type="checkbox"
                .checked=${this.aiFallbackAlways}
                @change=${(e: Event) => this._setFallback((e.target as HTMLInputElement).checked)}
              />
              Always try AI when Vivino finds no match
            </label>
          </div>

          <div class="settings-row">
            <span class="settings-label">Vivino/AI language</span>
            <div class="pill-group">
              ${this.supportedLanguages.map((lang) => html`
                <button
                  class="pill ${this.metadataLanguage === lang ? "active" : ""}"
                  @click=${() => this._setLanguage(lang)}
                >${lang.toUpperCase()}</button>
              `)}
            </div>
          </div>

          <div class="settings-row">
            <span class="settings-label">Currency</span>
            <div class="pill-group">
              ${this.supportedCurrencies.map((cur) => html`
                <button
                  class="pill ${this.metadataCurrency === cur ? "active" : ""}"
                  @click=${() => this._setCurrency(cur)}
                >${cur}</button>
              `)}
            </div>
          </div>

          <div class="info-section">
            <h3 class="info-title">🍇 Vivino vs 🤖 AI — What Each Provides</h3>

            <div class="info-block">
              <div class="info-block-title">🍇 Vivino provides:</div>
              <ul>
                <li>Bottle photo</li>
                <li>Community rating (★) and number of ratings</li>
                <li>Market price</li>
                <li>Food pairings</li>
                <li>Alcohol %</li>
                <li>Grape variety, region, country, type (when found)</li>
              </ul>
            </div>

            <div class="info-block">
              <div class="info-block-title">🤖 AI provides:</div>
              <ul>
                <li>Estimated price (only fills in when Vivino has none)</li>
                <li>Tasting description</li>
                <li>Critic scores (Wine Spectator, Robert Parker, Jeb Dunnuck, Antonio Galloni)</li>
                <li>Drink Now / Hold / Past Peak + drinking window</li>
                <li>Grape variety, region, country, type — only when scanning a label photo, not on a refresh</li>
              </ul>
            </div>

            <p class="info-note">
              AI never provides a photo, a Vivino community rating, or food pairings — when Vivino can't find a confident match, AI fills in what it can (mainly price, description, and critic scores), not everything Vivino would have.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}
