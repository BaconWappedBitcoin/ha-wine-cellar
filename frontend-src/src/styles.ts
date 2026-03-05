import { css } from "lit";

export const sharedStyles = css`
  :host {
    --wc-primary: #722f37;
    --wc-primary-light: #9a4a54;
    --wc-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --wc-text: var(--primary-text-color, #212121);
    --wc-text-secondary: var(--secondary-text-color, #727272);
    --wc-border: var(--divider-color, #e0e0e0);
    --wc-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.1));
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
    background: rgba(114, 47, 55, 0.08);
  }

  .tab.active {
    background: var(--wc-primary);
    color: #fff;
    border-color: var(--wc-primary);
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
    color: var(--wc-primary);
    border: 1px solid var(--wc-primary);
  }

  .btn-outline:hover {
    background: rgba(114, 47, 55, 0.08);
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
    background: rgba(0, 0, 0, 0.06);
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
  }
`;
