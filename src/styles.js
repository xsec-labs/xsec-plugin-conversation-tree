import { themeStyles } from "./theme.js";

export const STYLES = `${themeStyles}
html,body,[data-xsec-plugin-root]{width:100%;height:100%}
body{overflow:hidden;background:var(--ui-surface);color:var(--ui-text)}
.ct-root{display:flex;width:100%;height:100%;min-width:0;flex-direction:column;overflow:auto;background:var(--ui-surface);color:var(--ui-text)}
.ct-root>:not(.ct-toolbar){margin:0 12px}
.ct-root>:not(.ct-toolbar):not([hidden])~:not([hidden]){margin-top:10px}
.ct-root>.ct-toolbar+*{margin-top:12px}
.ct-root>:last-child{margin-bottom:12px}

/* 面板头：标题在左、状态和操作在右，滚动时留在顶部。 */
.ct-toolbar{position:sticky;top:0;z-index:4;display:flex;align-items:center;gap:8px;height:52px;flex:0 0 auto;padding:0 8px 0 12px;border-bottom:1px solid var(--ui-hairline);background:var(--ui-surface)}
.ct-title{display:flex;flex:1;min-width:0;align-items:center;gap:6px}
.ct-title strong{overflow:hidden;font-size:14px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.ct-title-info{display:grid;place-items:center;flex:0 0 auto;color:var(--ui-faint);cursor:help}
.ct-badge{display:inline-flex;height:22px;align-items:center;padding:0 8px;border-radius:999px;background:var(--ui-subtle);color:var(--ui-muted);font-size:12px;font-weight:600;white-space:nowrap}
.ct-badge.is-ready,.ct-badge.is-cached{background:var(--ui-success-soft);color:var(--ui-success)}
.ct-badge.is-error,.ct-badge.is-unsupported{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ct-badge.is-requires_restore{background:var(--ui-warning-soft);color:var(--ui-warning)}
.ct-action.is-primary{background:var(--ui-accent);color:var(--ui-on-accent)}
.ct-action.is-primary:hover:not(:disabled){background:var(--ui-accent-hover)}

/* 筛选：搜索、范围分段、Agent 节点开关。 */
.ct-filters{display:grid;min-width:0;grid-template-columns:minmax(0,1fr) auto;gap:8px}
.ct-search-field{position:relative;display:block;min-width:0}
.ct-search-field svg{position:absolute;top:50%;left:10px;transform:translateY(-50%);color:var(--ui-faint);pointer-events:none}
.ct-search{width:100%;height:32px;padding:0 10px 0 32px;border:1px solid transparent;border-radius:var(--ui-radius);outline:0;background:var(--ui-subtle);color:var(--ui-text);transition:border-color .12s var(--ui-ease),background-color .12s var(--ui-ease)}
.ct-search::placeholder{color:var(--ui-faint)}
.ct-search:focus{border-color:var(--ui-accent-text);background:var(--ui-surface)}
.ct-search:disabled{opacity:.5}
.ct-segments{display:flex;gap:2px;padding:2px;border-radius:var(--ui-radius);background:var(--ui-subtle)}
.ct-segments button{min-width:56px;height:28px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--ui-muted);font-weight:500;cursor:pointer;transition:background-color .12s var(--ui-ease),color .12s var(--ui-ease)}
.ct-segments button:hover:not(:disabled){color:var(--ui-text)}
.ct-segments button[aria-pressed="true"]{background:var(--ui-surface);color:var(--ui-text);box-shadow:0 1px 2px rgb(0 0 0 / 14%),0 0 0 1px var(--ui-hairline)}
.ct-role-filter{display:flex;width:max-content;align-items:center;gap:8px;color:var(--ui-text);cursor:pointer}
.ct-role-filter input{display:grid;width:16px;height:16px;flex:0 0 auto;margin:0;place-items:center;border:1.5px solid var(--ui-muted);border-radius:4px;background:transparent;appearance:none;-webkit-appearance:none;cursor:inherit;transition:background-color .12s var(--ui-ease),border-color .12s var(--ui-ease)}
.ct-role-filter input:checked{border-color:var(--ui-accent);background:var(--ui-accent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5l3 3 6-6.5'/%3E%3C/svg%3E") center / 12px no-repeat}
.ct-role-filter input:disabled{opacity:.5}
.ct-role-filter:has(input:disabled){color:var(--ui-faint);cursor:not-allowed}
.ct-summary{color:var(--ui-faint);font-size:12px;font-variant-numeric:tabular-nums}
.ct-summary[hidden]{display:none}
button:disabled{cursor:not-allowed;opacity:.45}

.ct-notice{padding:8px 10px;border-radius:var(--ui-radius);background:var(--ui-warning-soft);color:var(--ui-warning);line-height:1.5;overflow-wrap:anywhere}
.ct-notice.is-error{background:var(--ui-danger-soft);color:var(--ui-danger)}
.ct-notice[hidden]{display:none}
.ct-empty{display:grid;min-height:240px;place-content:center;justify-items:center;gap:8px;padding:32px 24px;text-align:center}
.ct-empty-mark{display:grid;width:40px;height:40px;place-items:center;margin-bottom:4px;border-radius:var(--ui-radius-panel);background:var(--ui-subtle);color:var(--ui-muted)}
.ct-empty strong{font-size:14px;font-weight:600}
.ct-empty span{max-width:320px;color:var(--ui-muted);line-height:1.55}
.ct-empty .ct-action{margin-top:8px}
.ct-empty[hidden],.ct-empty .ct-action[hidden]{display:none}

/* 画布：点阵底，节点是卡片，当前路径用强调色连线。 */
.ct-canvas{position:relative;height:clamp(220px,48vh,520px);min-height:220px;flex:0 0 auto;overflow:hidden;overscroll-behavior:contain;border:1px solid var(--ui-hairline);border-radius:var(--ui-radius-panel);outline:none;background-color:var(--ui-canvas);background-image:radial-gradient(circle,color-mix(in srgb,var(--ui-muted) 26%,transparent) 1px,transparent 1px);background-size:16px 16px;cursor:grab;touch-action:none;user-select:none}
.ct-canvas[hidden]{display:none}
.ct-canvas.is-dragging{cursor:grabbing}
.ct-canvas:focus-visible{border-color:var(--ui-accent-text)}
.ct-stage{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}
.ct-links{position:absolute;inset:0;overflow:visible;pointer-events:none}
.ct-links path{fill:none;stroke:var(--ui-border);stroke-linecap:round;stroke-width:1.5;vector-effect:non-scaling-stroke}
.ct-links path.is-active{stroke:var(--ui-accent);stroke-width:2}
.ct-node{position:absolute;top:0;left:0;display:grid;width:166px;height:66px;grid-template-rows:16px minmax(0,1fr) 14px;gap:1px;overflow:hidden;padding:7px 10px;border:1px solid var(--ui-border);border-radius:var(--ui-radius);background:var(--ui-surface);box-shadow:0 1px 2px rgb(0 0 0 / 6%);color:var(--ui-muted);cursor:pointer;text-align:left;transform-origin:0 0;transition:border-color .12s var(--ui-ease),box-shadow .12s var(--ui-ease),opacity .12s var(--ui-ease)}
.ct-node:disabled{opacity:1}
.ct-node:hover{border-color:var(--ui-muted)}
.ct-node:focus-visible{outline:2px solid var(--ui-accent-text);outline-offset:1px}
.ct-node.is-active{border-color:color-mix(in srgb,var(--ui-accent) 55%,var(--ui-border))}
.ct-node.is-selected{border-color:var(--ui-accent);box-shadow:0 0 0 3px var(--ui-accent-soft),0 4px 12px rgb(0 0 0 / 10%)}
.ct-node.is-dimmed{opacity:.28}
.ct-node-meta{display:flex;align-items:center;gap:5px;color:var(--ui-muted);font-size:10px;font-weight:500;line-height:14px}
.ct-node-meta::before{content:"";width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:var(--ui-faint)}
.ct-node.role-user .ct-node-meta::before{background:var(--ui-accent)}
.ct-node-meta i{margin-left:auto;padding:0 6px;border-radius:999px;background:var(--ui-accent-soft);color:var(--ui-accent-text);font-style:normal}
.ct-node strong{overflow:hidden;color:var(--ui-text);font-size:11.5px;font-weight:600;line-height:16px;text-overflow:ellipsis;white-space:nowrap}
.ct-node small{color:var(--ui-faint);font-size:10px;font-variant-numeric:tabular-nums;line-height:13px}
.ct-zoom{position:absolute;z-index:2;right:8px;bottom:8px;display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--ui-hairline);border-radius:var(--ui-radius);background:var(--ui-surface);box-shadow:var(--ui-shadow);touch-action:manipulation}
.ct-zoom button{display:grid;min-width:26px;height:26px;place-items:center;padding:0 6px;border:0;border-radius:6px;background:transparent;color:var(--ui-muted);font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer}
.ct-zoom button:hover:not(:disabled){background:var(--ui-hover);color:var(--ui-text)}

/* 检查器：选中节点的卡片。 */
.ct-inspector{display:grid;min-width:0;gap:10px;padding:12px;border:1px solid var(--ui-hairline);border-radius:var(--ui-radius-panel);background:var(--ui-surface)}
.ct-inspector[hidden]{display:none}
.ct-inspector header{display:flex;min-width:0;align-items:center;justify-content:space-between;gap:8px}
.ct-tags{display:flex;min-width:0;flex-wrap:wrap;gap:6px}
.ct-tag{display:inline-flex;height:22px;align-items:center;padding:0 8px;border-radius:999px;background:var(--ui-subtle);color:var(--ui-muted);font-size:12px;font-weight:600}
.ct-tag.is-current{background:var(--ui-accent-soft);color:var(--ui-accent-text)}
.ct-preview{max-height:8em;margin:0;overflow:auto;color:var(--ui-text);line-height:1.6;overflow-wrap:anywhere;white-space:pre-wrap}
.ct-facts,.ct-context dl{display:grid;min-width:0;grid-template-columns:minmax(56px,max-content) minmax(0,1fr);gap:6px 16px;margin:0}
.ct-facts dt,.ct-context dt{color:var(--ui-muted)}
.ct-facts dd,.ct-context dd{min-width:0;margin:0;overflow:hidden;color:var(--ui-text);font-variant-numeric:tabular-nums;text-overflow:ellipsis;white-space:nowrap}
.ct-facts dd[title]{font:13px/1.55 var(--ui-mono)}
.ct-context-toggle{display:flex;width:100%;align-items:center;gap:6px;padding:10px 0 0;border:0;border-top:1px solid var(--ui-hairline);background:transparent;color:var(--ui-text);font-weight:600;text-align:left;cursor:pointer}
.ct-context-toggle svg{color:var(--ui-muted);transition:transform .12s var(--ui-ease)}
.ct-context-toggle[aria-expanded="true"] svg{transform:rotate(90deg)}
.ct-context{display:grid;min-width:0;gap:10px;padding:12px;border-radius:var(--ui-radius);background:var(--ui-subtle)}
.ct-context[hidden]{display:none}
.ct-context .ct-tag{background:var(--ui-surface)}
.ct-pills{display:flex;min-width:0;flex-wrap:wrap;align-items:center;gap:6px}
.ct-pills strong{margin-right:4px;color:var(--ui-muted);font-weight:400}
.ct-context-note{color:var(--ui-faint);font-size:12px;line-height:1.5}
@media(max-width:360px){.ct-filters{grid-template-columns:1fr}.ct-segments button{flex:1}.ct-inspector header{align-items:flex-start;flex-direction:column}}
@media(max-height:420px){.ct-canvas{height:220px}}
@media(prefers-reduced-motion:reduce){.ct-stage{will-change:auto}}
`;

export function installStyles() {
  if (document.getElementById("xsec-conversation-tree-styles")) return;
  const style = document.createElement("style");
  style.id = "xsec-conversation-tree-styles";
  style.textContent = STYLES;
  document.head.append(style);
}
