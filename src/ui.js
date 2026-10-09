import { createElement as h, Fragment, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Badge, Checkbox, ControlButton, ControlIconButton, ControlThemeProvider, EmptyState, ErrorState, Field, Input, PageHeader } from "@xsec/ui-react";
import { ChevronDown, ChevronRight, Minus, Plus, RefreshCw } from "lucide-react";
import { canReadTree } from "./context.js";
import { displayValue, formatTime } from "./elements.js";
import { emptyContent } from "./view-model.js";
import { MAX_SCALE, MIN_SCALE } from "./core.js";

function Facts({ fields }) {
  return h("dl", { className: "ct-facts" }, fields.map(([label, value]) => h(Fragment, { key: label },
    h("dt", null, label), h("dd", null, value))));
}

function KnownContext({ inspector }) {
  if (inspector.status === "error") return h(ErrorState, { title: "读取节点上下文失败", description: inspector.message });
  const value = inspector.value;
  return h("div", { className: "ct-context" },
    h(Facts, { fields: [["模型", displayValue(value.model)], ["模式", displayValue(value.mode)], ["Thinking", displayValue(value.thinking)],
      ["已知字符", value.characters.toLocaleString("zh-CN")], ["Token", value.tokens ?? "未提供"]] }),
    value.references.length ? h("div", { className: "ct-tags" }, h("span", null, "引用"), value.references.map((name, index) => h(Badge, { key: index }, name))) : null,
    value.commands.length ? h("p", null, `可用命令：${value.commands.join("、")}`) : null,
    h("p", { className: "ct-muted" }, "这里只展示 xSec 已记录的消息、配置与引用；Provider 内部隐藏上下文可能不在其中。"));
}

function Inspector({ state, graph, selected, actions }) {
  if (!selected) return null;
  const current = selected.selected.entryId === graph.leafId;
  const blocked = selected.navigationBlock;
  return h("article", { className: "ct-inspector", "aria-label": "节点详情" },
    h("header", null, h("div", { className: "ct-tags" }, h(Badge, null, selected.selected.role === "user" ? "用户" : "Agent"),
      current ? h(Badge, { tone: "success" }, "当前分支") : null),
      h(ControlButton, { disabled: current || Boolean(blocked) || state.loading || state.navigating || Boolean(state.themeError), loading: state.navigating,
        title: current ? "该节点已是当前分支" : blocked ?? "精确切换到所选分支", onClick: () => actions.navigate(selected.selected.entryId) }, current ? "当前分支" : "切换到此分支")),
    blocked && !current ? h("p", { className: "ct-muted" }, blocked) : null,
    h("p", { className: "ct-preview" }, selected.selected.text || selected.selected.thought || "（空消息）"),
    h(Facts, { fields: [["路径", `${selected.path.length} 个消息节点`], ["时间", formatTime(selected.selected.timestamp, true)], ["节点", selected.selected.entryId]] }),
    h(ControlButton, { variant: "ghost", className: "ct-context-toggle", disabled: !state.context.visible, "aria-expanded": state.contextExpanded,
      "aria-controls": "ct-known-context", onClick: actions.context }, h(state.contextExpanded ? ChevronDown : ChevronRight, { size: 16, "aria-hidden": true }), "已知上下文"),
    h("div", { id: "ct-known-context", hidden: !state.contextExpanded }, h(KnownContext, { inspector: selected.inspector })));
}

function Surface({ controls, state, graph, selected, actions, fatal }) {
  const available = state.context.visible && !state.themeError;
  const readDisabled = state.loading || state.navigating || !canReadTree(state.context) || !available;
  const message = fatal || state.error || state.themeError || state.notice || (state.context.truncated
    ? "宿主上下文已截断；可浏览已读取内容，分支切换保持禁用。"
    : state.tree && !state.treeHash ? "缺少宿主发布的权威树摘要；当前仅可浏览。" : null);
  const [title, detail, canLoad] = emptyContent(state, graph);
  useLayoutEffect(() => {
    const canvas = controls.canvas;
    let { width, height } = canvas.getBoundingClientRect();
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const changed = bounds.width !== width || bounds.height !== height;
      ({ width, height } = bounds);
      if (changed && !controls.shell.inert) actions.reset();
    });
    resize.observe(canvas);
    canvas.addEventListener("wheel", actions.wheel, { passive: false });
    return () => {
      resize.disconnect();
      canvas.removeEventListener("wheel", actions.wheel);
    };
  }, [controls, actions]);
  return h(ControlThemeProvider, { settings: controls.settings, className: "ct-theme" },
    h("section", { className: "ct-root", "aria-label": "对话树", ref: node => { controls.shell = node; } },
      h(PageHeader, { title: "对话树", description: "真实 Provider 消息树", actions: h("div", { className: "ct-toolbar-actions" },
        h(Badge, { tone: state.source.availability === "cached" || state.source.availability === "ready" ? "success" : "neutral" }, state.source.label),
        h(ControlIconButton, { label: "读取对话树", title: "显式读取当前会话的完整对话树", loading: state.loading, disabled: readDisabled, onClick: actions.load }, h(RefreshCw, { size: 16, "aria-hidden": true }))) }),
      h("div", { className: "ct-filters" }, h(Field, { label: "搜索节点", id: "ct-search" }, props => h(Input, { ...props, type: "search", placeholder: "搜索正文和思考内容", value: state.query,
        disabled: !graph || !available, onChange: event => actions.query(event.target.value) })),
        h("div", { className: "ct-segments", role: "group", "aria-label": "对话树范围" }, [ ["all", "全部"], ["active", "当前路径"] ].map(([mode, label]) =>
          h(ControlButton, { key: mode, variant: state.mode === mode ? "primary" : "secondary", "aria-pressed": state.mode === mode, disabled: !graph || !available, onClick: () => actions.mode(mode) }, label)))),
      h(Checkbox, { label: "显示 Agent 节点", checked: state.showAgentMessages, disabled: !graph || !available, onCheckedChange: value => actions.agents(value) }),
      message ? (fatal || state.error || state.themeError ? h(ErrorState, { title: "对话树操作失败", description: message }) : h("p", { className: "ct-notice", role: "status" }, message)) : null,
      graph ? h("p", { className: "ct-summary", role: "status" }, `${graph.visible.length} 个可见节点 · 全树 ${graph.messages.length} 个节点`) : null,
      !fatal && !graph?.visible.length ? h(EmptyState, { title, description: detail, action: canLoad ? h(ControlButton, { disabled: readDisabled, loading: state.loading, onClick: actions.load }, "加载完整对话树") : null }) : null,
      h("div", { className: "ct-canvas", role: "tree", "aria-label": "对话节点", tabIndex: -1, hidden: Boolean(fatal) || !graph?.visible.length,
        ref: node => { controls.canvas = node; }, onPointerDown: actions.pointerDown, onPointerMove: actions.pointerMove, onPointerUp: actions.pointerUp, onPointerCancel: actions.pointerUp },
        h("div", { className: "ct-stage", ref: node => { controls.stage = node; } }),
        h("div", { className: "ct-zoom", "data-tree-control": "" },
          h(ControlIconButton, { label: "缩小对话树", disabled: state.view.scale <= MIN_SCALE || !available, ref: node => { controls.minus = node; }, onClick: () => actions.zoom(-0.1) }, h(Minus, { size: 16, "aria-hidden": true })),
          h(ControlButton, { variant: "ghost", "aria-label": "定位当前路径", disabled: !available, ref: node => { controls.reset = node; }, onClick: actions.reset }, `${Math.round(state.view.scale * 100)}%`),
          h(ControlIconButton, { label: "放大对话树", disabled: state.view.scale >= MAX_SCALE || !available, ref: node => { controls.plus = node; }, onClick: () => actions.zoom(0.1) }, h(Plus, { size: 16, "aria-hidden": true })))),
      !fatal && selected ? h(Inspector, { state, graph, selected, actions }) : null));
}

export function createShell(root, actions) {
  return { reactRoot: createRoot(root), actions, settings: null, lastView: null };
}

export function renderSurface(view) {
  const { controls } = view;
  controls.lastView = view;
  flushSync(() => controls.reactRoot.render(h(Surface, view)));
  controls.renderedScale = view.state.view.scale;
  controls.shell.inert = !view.state.context.visible || Boolean(view.state.themeError);
}
