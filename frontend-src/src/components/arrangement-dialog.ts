import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Cabinet, Wine } from "../models";
import { sharedStyles } from "../styles";
import { Finding, FindingKind, Move, analyzeArrangement } from "../utils/arrange";
import { placementIn } from "../utils/location";

const SECTIONS: { kind: FindingKind; title: string; blurb: string }[] = [
  {
    kind: "consolidate",
    title: "Scattered",
    blurb: "Bottles of one wine sitting in several places.",
  },
  {
    kind: "outlier",
    title: "Odd ones out",
    blurb: "Bins that are almost entirely one kind of wine, with a stray or two.",
  },
  {
    kind: "buried",
    title: "Hard to reach",
    blurb: "Bottles due soon, stuck behind ones you meant to keep.",
  },
];

// The arrangement report. Deliberately a place you visit rarely — after
// scanning a cellar in, mostly — and leave empty once the moves are done.
//
// Every move is applied only when the user says it happened. The database
// follows the bottles, never the other way around: renumbering a rack the
// moment a suggestion is generated would make every later "where is it"
// a lie.
@customElement("arrangement-dialog")
export class ArrangementDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) wines: Wine[] = [];
  @property({ attribute: false }) cabinets: Cabinet[] = [];
  @property({ attribute: false }) dismissed: string[] = [];

  @state() private _busy = "";
  @state() private _error = "";

  static styles = [
    sharedStyles,
    css`
      .arr-intro {
        font-size: 0.85em;
        color: var(--wc-text-secondary);
        margin-bottom: 14px;
      }

      .arr-section {
        margin-bottom: 18px;
      }

      .arr-section-title {
        font-weight: 600;
        font-size: 0.9em;
        margin-bottom: 2px;
      }

      .arr-section-blurb {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-bottom: 8px;
      }

      .arr-finding {
        border: 1px solid var(--wc-border);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }

      .arr-title {
        font-weight: 600;
        font-size: 0.88em;
      }

      .arr-detail {
        font-size: 0.78em;
        color: var(--wc-text-secondary);
        margin-top: 3px;
      }

      .arr-moves {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .arr-move {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78em;
        flex-wrap: wrap;
      }

      .arr-move-where {
        color: var(--wc-text-secondary);
      }

      .arr-move-arrow {
        opacity: 0.6;
      }

      .arr-actions {
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .arr-empty {
        text-align: center;
        padding: 28px 12px;
        color: var(--wc-text-secondary);
        font-size: 0.9em;
      }

      .arr-error {
        color: #c62828;
        font-size: 0.8em;
        margin-top: 8px;
      }
    `,
  ];

  private get _findings(): Finding[] {
    return analyzeArrangement(this.wines, this.cabinets, this.dismissed);
  }

  // Apply every move in a finding, then tell the card to reload. Moves are
  // sequential on purpose: each one consumes a slot the next one might have
  // been aiming at.
  private async _applyMoves(finding: Finding) {
    this._busy = finding.id;
    this._error = "";
    try {
      let known = [...this.wines];
      for (const move of finding.moves) {
        const cabinet = this.cabinets.find((c) => c.id === move.to.cabinetId);
        // Re-derive the landing slot per move rather than trusting the depth
        // the analysis saw: earlier moves in this same batch have taken slots
        // since, and the cellar may have changed under us.
        const patch = placementIn(
          move.to,
          cabinet,
          known.filter((w) => w.id !== move.wine.id)
        );
        if (!patch) {
          this._error = `${move.toLabel} filled up before the move could be recorded.`;
          break;
        }
        await this.hass.callWS({
          type: "wine_cellar/move_wine",
          wine_id: move.wine.id,
          cabinet_id: patch.cabinet_id,
          row: patch.row ?? undefined,
          col: patch.col ?? undefined,
          zone: patch.zone,
          depth: patch.depth,
        });
        known = known.map((w) => (w.id === move.wine.id ? { ...w, ...patch } : w));
      }
      this.dispatchEvent(new CustomEvent("moves-applied", { bubbles: true, composed: true }));
    } catch (err: any) {
      this._error = `Could not record the move: ${err?.message || err}`;
    } finally {
      this._busy = "";
    }
  }

  private _dismiss(finding: Finding) {
    this.dispatchEvent(
      new CustomEvent("dismiss-finding", {
        detail: { id: finding.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderMove(move: Move) {
    return html`
      <div class="arr-move">
        <span>${move.wine.name || "Bottle"}${move.wine.vintage ? ` ${move.wine.vintage}` : ""}</span>
        <span class="arr-move-where">${move.fromLabel}</span>
        <span class="arr-move-arrow">→</span>
        <span class="arr-move-where">${move.toLabel}</span>
      </div>
    `;
  }

  private _renderFinding(finding: Finding) {
    const busy = this._busy === finding.id;
    return html`
      <div class="arr-finding">
        <div class="arr-title">${finding.title}</div>
        <div class="arr-detail">${finding.detail}</div>
        ${finding.moves.length
          ? html`<div class="arr-moves">${finding.moves.map((m) => this._renderMove(m))}</div>`
          : nothing}
        <div class="arr-actions">
          ${finding.moves.length
            ? html`
                <button class="btn btn-primary" ?disabled=${busy} @click=${() => this._applyMoves(finding)}>
                  ${busy
                    ? "Recording..."
                    : finding.moves.length === 1
                      ? "I moved it"
                      : `I moved all ${finding.moves.length}`}
                </button>
              `
            : nothing}
          <button class="btn btn-outline" ?disabled=${busy} @click=${() => this._dismiss(finding)}>
            ${finding.moves.length ? "Leave it as it is" : "Noted"}
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;
    const findings = this._findings;

    return html`
      <div class="dialog-overlay" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>
        <div class="dialog" style="max-width:620px" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">🧹 Arrangement</div>

          <div class="dialog-body">
            ${findings.length === 0
              ? html`
                  <div class="arr-empty">
                    Nothing worth moving. Your cellar agrees with itself.
                  </div>
                `
              : html`
                  <div class="arr-intro">
                    Read from where your bottles already are — there are no rules to
                    configure. Tick a move once you have actually made it; nothing is
                    recorded before that.
                  </div>
                  ${SECTIONS.map((section) => {
                    const inSection = findings.filter((f) => f.kind === section.kind);
                    if (!inSection.length) return nothing;
                    return html`
                      <div class="arr-section">
                        <div class="arr-section-title">${section.title}</div>
                        <div class="arr-section-blurb">${section.blurb}</div>
                        ${inSection.map((f) => this._renderFinding(f))}
                      </div>
                    `;
                  })}
                `}
            ${this._error ? html`<div class="arr-error">${this._error}</div>` : nothing}
          </div>

          <div class="dialog-footer">
            <button class="btn btn-outline" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
