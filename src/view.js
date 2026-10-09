import { NODE_HEIGHT, NODE_WIDTH, matchesQuery } from "./core.js";
import { button, element, formatTime, shortText, svgElement } from "./elements.js";
import { renderSurface } from "./ui.js";
export { emptyContent } from "./view-model.js";
const MIN_STAGE_WIDTH=520, MIN_STAGE_HEIGHT=360, CURVE_MINIMUM=20;
const setHidden=(node,hidden)=>{node.hidden=hidden;};

function linkPath(item, parent) {
  const startX = parent.x + NODE_WIDTH / 2;
  const startY = parent.y + NODE_HEIGHT;
  const endX = item.x + NODE_WIDTH / 2;
  const endY = item.y;
  const middle = startY + Math.max(CURVE_MINIMUM, (endY - startY) / 2);
  return `M ${startX} ${startY} C ${startX} ${middle}, ${endX} ${middle}, ${endX} ${endY}`;
}

function renderLinks(graph, width, height) {
  const svg = svgElement("svg", { class: "ct-links", width, height, "aria-hidden": "true" });
  for (const item of graph.positioned) {
    const parentId = graph.layout.parentById.get(item.message.entryId);
    const parent = parentId ? graph.positions.get(parentId) : null;
    if (!parent) continue;
    const path = svgElement("path", { d: linkPath(item, parent) });
    if (graph.activeIds.has(item.message.entryId) && graph.activeIds.has(parentId)) path.classList.add("is-active");
    svg.append(path);
  }
  return svg;
}

function nodeClass(item, graph, state) {
  const classes = ["ct-node", `role-${item.message.role}`];
  if (graph.activeIds.has(item.message.entryId)) classes.push("is-active");
  if (graph.selectedId === item.message.entryId) classes.push("is-selected");
  if (!matchesQuery(item.message, state.query)) classes.push("is-dimmed");
  return classes.join(" ");
}

function renderNode({ item, graph, state, actions }) {
  const node = button(nodeClass(item, graph, state));
  node.disabled = !state.context.visible;
  node.dataset.entryId = item.message.entryId;
  node.setAttribute("role", "treeitem");
  node.setAttribute("aria-selected", String(graph.selectedId === item.message.entryId));
  node.setAttribute("aria-level", String(graph.depths.get(item.message.entryId)));
  if (item.message.entryId === graph.leafId) node.setAttribute("aria-current", "true");
  node.tabIndex = graph.selectedId === item.message.entryId ? 0 : -1;
  node.style.transform = `translate(${item.x}px, ${item.y}px)`;
  node.title = item.message.text || item.message.thought || "空消息";
  const meta = element("span", "ct-node-meta");
  meta.append(document.createTextNode(item.message.role === "user" ? "用户" : "Agent"));
  if (item.message.entryId === graph.leafId) meta.append(element("i", "", "当前"));
  node.append(meta, element("strong", "", shortText(item.message.text || item.message.thought)), element("small", "", formatTime(item.message.timestamp)));
  node.addEventListener("click", () => actions.select(item.message.entryId));
  node.addEventListener("keydown", (event) => actions.key(event, item.message.entryId));
  return node;
}

export function applyTransform(controls, state) {
  if (controls.lastView && controls.renderedScale !== state.view.scale) renderSurface(controls.lastView);
  controls.stage.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.scale})`;
}

function renderGraph({ controls, state, graph, actions }) {
  controls.stage.replaceChildren();
  if (!graph?.visible.length) {
    setHidden(controls.canvas, true);
    return;
  }
  setHidden(controls.canvas, false);
  const width = Math.max(graph.layout.width, MIN_STAGE_WIDTH);
  const height = Math.max(graph.layout.height, MIN_STAGE_HEIGHT);
  controls.stage.style.width = `${width}px`;
  controls.stage.style.height = `${height}px`;
  controls.stage.append(renderLinks(graph, width, height));
  for (const item of graph.positioned) controls.stage.append(renderNode({ item, graph, state, actions }));
  applyTransform(controls, state);
}


export function renderView(view) { renderSurface(view); renderGraph(view); }
export function renderFatal(controls,message,state,actions) { renderSurface({controls,state,actions,graph:null,selected:null,fatal:message}); controls.stage.replaceChildren(); }
