import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";

@customElement("label-camera")
export class LabelCamera extends LitElement {
  @property({ type: Boolean }) active = false;

  @state() private _stream: MediaStream | null = null;
  @state() private _error = "";
  @state() private _captured = false;
  @state() private _capturedImage = "";

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .camera-container {
        position: relative;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        aspect-ratio: 3 / 4;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .captured-preview {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        display: block;
        border-radius: 12px;
        object-fit: contain;
        max-height: 300px;
      }

      .capture-btn-area {
        display: flex;
        justify-content: center;
        padding: 12px 0;
      }

      .capture-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 4px solid var(--wc-primary, #722f37);
        background: transparent;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
      }

      .capture-btn::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border-radius: 50%;
        background: var(--wc-primary, #722f37);
        transition: all 0.15s;
      }

      .capture-btn:hover::after {
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
      }

      .capture-btn:active::after {
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
      }

      .fallback-area {
        text-align: center;
        padding: 8px 0;
      }

      .file-input-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid var(--wc-border);
        background: transparent;
        color: var(--wc-text-secondary);
        cursor: pointer;
        font-size: 0.85em;
        transition: all 0.2s;
      }

      .file-input-label:hover {
        background: rgba(114, 47, 55, 0.08);
      }

      input[type="file"] {
        display: none;
      }

      .error-message {
        padding: 16px;
        text-align: center;
        color: #ef5350;
        font-size: 0.9em;
      }

      .actions-row {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding: 8px 0;
      }

      .hint {
        text-align: center;
        padding: 4px 0 8px;
        font-size: 0.8em;
        color: var(--wc-text-secondary);
      }
    `,
  ];

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("active")) {
      if (this.active && !this._captured) {
        this._startCamera();
      } else if (!this.active) {
        this._stopCamera();
        this._captured = false;
        this._capturedImage = "";
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopCamera();
  }

  private async _startCamera() {
    this._error = "";
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 960 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 3 / 4 },
        },
        audio: false,
      });
      await this.updateComplete;
      const video = this.renderRoot.querySelector("video") as HTMLVideoElement;
      if (video && this._stream) {
        video.srcObject = this._stream;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        this._error = "Camera access denied. Use the upload button below instead.";
      } else {
        this._error = "Could not access camera. Use the upload button below instead.";
      }
    }
  }

  private _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }
  }

  private async _capture() {
    const video = this.renderRoot.querySelector("video") as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const maxDim = 1024;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      const scale = maxDim / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1];

    this._stopCamera();
    this._captured = true;
    this._capturedImage = dataUrl;

    this.dispatchEvent(
      new CustomEvent("photo-captured", {
        detail: { image: base64 },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Resize if needed
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1024;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const resizedBase64 = resizedDataUrl.split(",")[1];

        this._stopCamera();
        this._captured = true;
        this._capturedImage = resizedDataUrl;

        this.dispatchEvent(
          new CustomEvent("photo-captured", {
            detail: { image: resizedBase64 },
            bubbles: true,
            composed: true,
          })
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  retake() {
    this._captured = false;
    this._capturedImage = "";
    this._startCamera();
  }

  render() {
    if (!this.active) return nothing;

    if (this._captured) {
      return html`
        <img class="captured-preview" src=${this._capturedImage} alt="Captured label" />
      `;
    }

    return html`
      ${this._error
        ? html`<div class="error-message">${this._error}</div>`
        : html`
            <div class="camera-container">
              <video autoplay playsinline muted></video>
            </div>
            <div class="capture-btn-area">
              <button class="capture-btn" @click=${this._capture} title="Take photo"></button>
            </div>
            <div class="hint">Point the camera at the wine label</div>
          `}

      <div class="fallback-area">
        <label class="file-input-label">
          📁 Upload from gallery
          <input type="file" accept="image/*" capture="environment" @change=${this._onFileSelected} />
        </label>
      </div>
    `;
  }
}
