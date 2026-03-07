import { css } from "lit";

export const sharedStyles = css`
  :host {
    --wc-primary: #722f37;
    --wc-primary-light: #9a4a54;
    --wc-primary-text: #c48b91;
    --wc-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-text: var(--primary-text-color, #212121);
    --wc-text-secondary: var(--secondary-text-color, #727272);
    --wc-border: var(--divider-color, #e0e0e0);
    --wc-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.1));
    --wc-hover: rgba(128, 128, 128, 0.12);
    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
    color: var(--wc-text);
  }

  .card-content {
    padding: 16px;
  }

  .stats-bar {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    font-size: 0.85em;
    color: var(--wc-text-secondary);
  }

  .stats-bar .stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stats-bar .stat-value {
    font-weight: 600;
    color: var(--wc-text);
  }

  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 8px 16px;
    overflow-x: auto;
    border-bottom: 1px solid var(--wc-border);
  }

  .tab {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid var(--wc-border);
    background: transparent;
    color: var(--wc-text-secondary);
    cursor: pointer;
    white-space: nowrap;
    font-size: 0.85em;
    transition: all 0.2s;
  }

  .tab:hover {
    background: var(--wc-hover);
  }

  .tab.active {
    background: var(--wc-primary);
    color: #fff;
    border-color: var(--wc-primary);
  }

  .manage-racks-btn {
    margin-left: auto;
    border-color: transparent;
    color: var(--wc-primary-text);
    font-weight: 500;
    font-size: 0.8em;
    padding: 6px 12px;
  }

  .manage-racks-btn:hover {
    background: var(--wc-hover);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--wc-primary);
    color: #fff;
  }

  .btn-primary:hover {
    background: var(--wc-primary-light);
  }

  .btn-outline {
    background: transparent;
    color: var(--wc-text);
    border: 1px solid var(--wc-border);
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: var(--wc-text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    background: var(--wc-hover);
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s ease;
  }

  .dialog {
    background: var(--wc-bg);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    max-width: 500px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }

  .dialog-header {
    padding: 20px 20px 12px;
    font-size: 1.2em;
    font-weight: 500;
    border-bottom: 1px solid var(--wc-border);
  }

  .dialog-body {
    padding: 16px 20px;
  }

  .dialog-footer {
    padding: 12px 20px 20px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--wc-text-secondary);
    margin-bottom: 4px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--wc-border);
    border-radius: 8px;
    font-size: 0.95em;
    background: var(--wc-bg);
    color: var(--wc-text);
    box-sizing: border-box;
  }

  .form-group textarea {
    min-height: 60px;
    resize: vertical;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Phone: full-screen dialogs, compact forms */
  @media (max-width: 599px) {
    .dialog {
      width: 100%;
      max-width: 100%;
      max-height: 100vh;
      border-radius: 12px 12px 0 0;
      margin-top: auto;
    }
    .dialog-overlay {
      align-items: flex-end;
    }
    .dialog-header {
      padding: 16px 16px 10px;
      font-size: 1.1em;
    }
    .dialog-body {
      padding: 12px 16px;
    }
    .dialog-footer {
      padding: 10px 16px 16px;
    }
    .form-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .tab-bar {
      padding: 6px 12px;
      gap: 3px;
    }
    .tab {
      padding: 5px 12px;
      font-size: 0.8em;
    }
    .depth-panel {
      width: 100% !important;
      border-radius: 0 !important;
    }
  }

  /* --- Depth Side Panel --- */
  .depth-panel-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }

  .depth-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: var(--wc-bg);
    z-index: 100;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
  }

  .depth-panel.open {
    transform: translateX(0);
  }

  .depth-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--wc-border, #e0e0e0);
    flex-shrink: 0;
  }

  .depth-panel-title {
    font-weight: 600;
    font-size: 1em;
    color: var(--wc-text, #333);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .depth-panel-subtitle {
    font-size: 0.8em;
    font-weight: 400;
    color: var(--wc-text-secondary, #888);
  }

  .depth-panel-close {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--wc-text-secondary, #888);
  }

  .depth-panel-close:hover {
    background: var(--wc-hover);
  }

  .depth-panel-slots {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .depth-slot {
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .depth-slot:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .depth-slot-label {
    font-size: 0.7em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wc-text-secondary, #888);
    padding: 0 4px 4px;
  }

  .depth-slot-wine {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--wc-bg);
    border: 1px solid var(--wc-border);
    border-radius: 10px;
  }

  .depth-slot-thumb {
    width: 32px;
    height: 44px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .depth-slot-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .depth-slot-info {
    flex: 1;
    min-width: 0;
  }

  .depth-slot-name {
    font-weight: 600;
    font-size: 0.88em;
    color: var(--wc-text, #333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .depth-slot-meta {
    font-size: 0.78em;
    color: var(--wc-text-secondary, #888);
    margin-top: 2px;
  }

  .depth-slot-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 12px;
    border: 2px dashed var(--wc-border, #ddd);
    border-radius: 10px;
    color: var(--wc-text-secondary, #aaa);
    font-size: 0.85em;
  }

  .depth-slot.empty:hover .depth-slot-empty {
    border-color: var(--wc-primary-text);
    color: var(--wc-primary-text);
  }

  .depth-slot-plus {
    font-size: 1.3em;
    font-weight: 300;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--wc-hover);
  }

  .depth-slot.empty:hover .depth-slot-plus {
    background: rgba(196, 139, 145, 0.2);
  }
`;
