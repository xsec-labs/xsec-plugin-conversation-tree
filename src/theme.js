// 与 XSEC Desktop 同一套设计 token。Desktop 把当前主题写成 --xsec-<name> 变量（window-background、
// content-surface、bg-subtle、bg-hover、text-primary、text-secondary、text-accent、border-default、
// status-error、status-success、status-warning、radius-md、radius-lg）；宿主没有提供时用下面的默认值，
// 默认值取自 Desktop 的亮、暗两套 token，并跟随系统外观。
export const themeStyles = `
:root {
  --d-canvas: #f7f7f8; --d-surface: #ffffff; --d-subtle: #f0f0f2; --d-hover: #eaeaed;
  --d-text: #18181b; --d-muted: #62626b; --d-border: #dcdce1; --d-accent: #0169cc;
  --d-danger: #b42318; --d-success: #187344; --d-warning: #8a5700;
}
@media (prefers-color-scheme: dark) {
  :root {
    --d-canvas: #111113; --d-surface: #19191c; --d-subtle: #232327; --d-hover: #2d2d33;
    --d-text: #f4f4f5; --d-muted: #a1a1aa; --d-border: #35353c; --d-accent: #0169cc;
    --d-danger: #ff938a; --d-success: #7ad6a0; --d-warning: #e9bd70;
  }
}
:root {
  --ui-canvas: var(--xsec-window-background, var(--d-canvas));
  --ui-surface: var(--xsec-content-surface, var(--d-surface));
  --ui-subtle: var(--xsec-bg-subtle, var(--d-subtle));
  --ui-hover: var(--xsec-bg-hover, var(--d-hover));
  --ui-text: var(--xsec-text-primary, var(--d-text));
  --ui-muted: var(--xsec-text-secondary, var(--d-muted));
  --ui-border: var(--xsec-border-default, var(--d-border));
  --ui-accent: var(--xsec-text-accent, var(--d-accent));
  --ui-on-accent: #ffffff;
  --ui-danger: var(--xsec-status-error, var(--d-danger));
  --ui-success: var(--xsec-status-success, var(--d-success));
  --ui-warning: var(--xsec-status-warning, var(--d-warning));
  --ui-radius: var(--xsec-radius-md, 8px);
  --ui-radius-panel: var(--xsec-radius-lg, 12px);
  /* 由上面几项推出：强调色当文字用时向正文色靠拢，亮暗两套底上都读得清；淡底用于选中和高亮。 */
  --ui-accent-text: color-mix(in srgb, var(--ui-accent) 64%, var(--ui-text));
  --ui-accent-soft: color-mix(in srgb, var(--ui-accent) 14%, transparent);
  --ui-accent-hover: color-mix(in srgb, var(--ui-accent) 88%, var(--ui-text));
  --ui-faint: color-mix(in srgb, var(--ui-muted) 72%, var(--ui-surface));
  --ui-hairline: color-mix(in srgb, var(--ui-text) 10%, transparent);
  --ui-danger-soft: color-mix(in srgb, var(--ui-danger) 12%, transparent);
  --ui-success-soft: color-mix(in srgb, var(--ui-success) 14%, transparent);
  --ui-warning-soft: color-mix(in srgb, var(--ui-warning) 16%, transparent);
  --ui-shadow: 0 8px 24px rgb(0 0 0 / 12%), 0 1px 2px rgb(0 0 0 / 8%);
  --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
  --ui-mono: ui-monospace, "SF Mono", "Cascadia Mono", Consolas, "Liberation Mono", monospace;
  --ui-ease: cubic-bezier(.2, 0, 0, 1);
  background: var(--ui-surface);
  color: var(--ui-text);
  font: 14px/1.45 var(--ui-font);
  -webkit-font-smoothing: antialiased;
}
*, *::before, *::after { box-sizing: border-box; }
html, body, [data-xsec-plugin-root] { min-width: 0; min-height: 100%; margin: 0; }
button, textarea, input { font: inherit; color: inherit; }
button { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline: 2px solid var(--ui-accent-text); outline-offset: 1px; }
::selection { background: color-mix(in srgb, var(--ui-accent) 28%, transparent); }
* { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--ui-muted) 40%, transparent) transparent; }

/* 按钮：默认灰底，主操作强调色实心，图标按钮透明底。高度 32，与 Desktop 的紧凑密度一致。 */
.ui-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 12px; border: 0; border-radius: var(--ui-radius);
  background: var(--ui-subtle); color: var(--ui-text); font-weight: 500; white-space: nowrap; cursor: pointer;
  transition: background-color .12s var(--ui-ease), color .12s var(--ui-ease), opacity .12s var(--ui-ease);
}
.ui-button:hover:not(:disabled) { background: var(--ui-hover); }
.ui-button:active:not(:disabled) { background: color-mix(in srgb, var(--ui-hover) 80%, var(--ui-text)); }
.ui-button:disabled { cursor: not-allowed; opacity: .45; }
.ui-button.is-primary { background: var(--ui-accent); color: var(--ui-on-accent); }
.ui-button.is-primary:hover:not(:disabled) { background: var(--ui-accent-hover); }
.ui-button.is-ghost { background: transparent; color: var(--ui-muted); }
.ui-button.is-ghost:hover:not(:disabled) { background: var(--ui-hover); color: var(--ui-text); }
.ui-button.is-icon { width: 32px; padding: 0; }
.ui-button[aria-busy="true"] svg { animation: ui-spin .9s linear infinite; }
.ui-button svg { flex: 0 0 auto; }

/* 提示条只用于错误；成功的确认用底部的状态气泡。 */
.ui-notice {
  display: flex; align-items: flex-start; gap: 8px; margin: 8px 12px 0; padding: 8px 12px;
  border-radius: var(--ui-radius); background: var(--ui-danger-soft); color: var(--ui-danger); overflow-wrap: anywhere;
}
.ui-notice svg { flex: 0 0 auto; margin-top: 2px; }
.ui-notice span { flex: 1; min-width: 0; }
.ui-notice .ui-button { height: 26px; padding: 0 8px; font-size: 12px; margin: -2px 0; background: transparent; color: inherit; box-shadow: inset 0 0 0 1px currentColor; }
.ui-toast {
  position: fixed; left: 50%; bottom: 16px; z-index: 5; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px; max-width: calc(100% - 32px); padding: 7px 12px 7px 10px;
  border: 1px solid var(--ui-hairline); border-radius: 999px; background: var(--ui-surface); color: var(--ui-text);
  box-shadow: var(--ui-shadow); animation: ui-rise .2s var(--ui-ease);
}
.ui-toast svg { flex: 0 0 auto; color: var(--ui-success); }
.ui-toast span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ui-empty { display: grid; justify-items: center; align-content: center; gap: 10px; min-height: 220px; padding: 32px 24px; color: var(--ui-muted); text-align: center; }
.ui-empty-mark { display: grid; width: 40px; height: 40px; place-items: center; border-radius: var(--ui-radius-panel); background: var(--ui-subtle); color: var(--ui-muted); }
.ui-empty strong { color: var(--ui-text); font-size: 14px; font-weight: 600; }
.ui-empty.is-error .ui-empty-mark { background: var(--ui-danger-soft); color: var(--ui-danger); }
.ui-empty p { max-width: 320px; margin: 0; overflow-wrap: anywhere; }

.ui-skeleton { display: grid; gap: 10px; padding: 12px 16px; }
.ui-skeleton span {
  display: block; height: 14px; border-radius: 4px;
  background: linear-gradient(90deg, var(--ui-subtle) 25%, var(--ui-hover) 50%, var(--ui-subtle) 75%) 0 0 / 200% 100%;
  animation: ui-shimmer 1.4s linear infinite;
}
.ui-skeleton span:nth-child(3n + 1) { width: 62%; }
.ui-skeleton span:nth-child(3n + 2) { width: 84%; }
.ui-skeleton span:nth-child(3n) { width: 46%; }

@keyframes ui-spin { to { transform: rotate(360deg); } }
@keyframes ui-shimmer { to { background-position: -200% 0; } }
@keyframes ui-rise { from { opacity: 0; transform: translate(-50%, 6px); } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;
