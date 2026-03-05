import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { sharedStyles } from "../styles";

@customElement("barcode-scanner")
export class BarcodeScanner extends LitElement {
  @property({ type: Boolean }) active = false;

  @state() private _error = "";
  @state() private _scanning = false;

  private _scanner: Html5Qrcode | null = null;
  private _containerId = "barcode-reader-" + Math.random().toString(36).slice(2, 8);

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .scanner-container {
        position: relative;
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
        aspect-ratio: 4/3;
      }

      .scanner-container div {
        border-radius: 12px;
      }

      .scan-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10;
      }

      .scan-line {
        position: absolute;
        left: 10%;
        right: 10%;
        height: 2px;
        background: rgba(255, 50, 50, 0.8);
        box-shadow: 0 0 8px rgba(255, 50, 50, 0.5);
        animation: scanMove 2s ease-in-out infinite;
      }

      @keyframes scanMove {
        0%, 100% { top: 20%; }
        50% { top: 80%; }
      }

      .scan-corners {
        position: absolute;
        top: 15%;
        left: 15%;
        right: 15%;
        bottom: 15%;
        border: 2px solid rgba(255, 255, 255, 0.6);
        border-radius: 8px;
      }

      .error-message {
        padding: 16px;
        text-align: center;
        color: #ef5350;
        font-size: 0.9em;
      }

      .hint {
        text-align: center;
        padding: 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("active")) {
      if (this.active) {
        this._startScanning();
      } else {
        this._stopScanning();
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopScanning();
  }

  private async _startScanning() {
    if (this._scanning) return;
    this._error = "";

    // Wait for render
    await this.updateComplete;
    await new Promise((r) => setTimeout(r, 100));

    const container = this.renderRoot.querySelector(`#${this._containerId}`);
    if (!container) return;

    try {
      this._scanner = new Html5Qrcode(this._containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
        verbose: false,
      });

      await this._scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 4 / 3,
        },
        (decodedText) => {
          this._onDetected(decodedText);
        },
        () => {
          // Scan failure (no code found) - ignore
        }
      );

      this._scanning = true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        this._error =
          "Camera access denied. Please allow camera access in your browser or app settings.";
      } else if (msg.includes("NotFound") || msg.includes("no camera")) {
        this._error = "No camera found on this device.";
      } else {
        this._error = `Camera error: ${msg}`;
      }
      this.dispatchEvent(
        new CustomEvent("scanner-error", {
          detail: { error: this._error },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private async _stopScanning() {
    if (this._scanner) {
      try {
        if (this._scanning) {
          await this._scanner.stop();
        }
        this._scanner.clear();
      } catch {
        // Ignore cleanup errors
      }
      this._scanner = null;
    }
    this._scanning = false;
  }

  private _onDetected(barcode: string) {
    // Stop scanning after detection
    this._stopScanning();
    this.dispatchEvent(
      new CustomEvent("barcode-detected", {
        detail: { barcode },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.active) return nothing;

    return html`
      ${this._error
        ? html`<div class="error-message">${this._error}</div>`
        : html`
            <div class="scanner-container">
              <div id=${this._containerId}></div>
              <div class="scan-overlay">
                <div class="scan-corners"></div>
                <div class="scan-line"></div>
              </div>
            </div>
            <div class="hint">Point the camera at the barcode on the bottle</div>
          `}
    `;
  }
}
