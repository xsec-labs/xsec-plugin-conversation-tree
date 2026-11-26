import {
  activeLeafId,
  activePath,
  layoutTree,
  matchesQuery,
  nodeDepths,
  parentMap,
  preferredSelection,
  treePath,
  visibleMessages,
} from "./core.js";
import { inspectorContextResult, navigationBlock } from "./context.js";

export function graphModel(state) {
  if (!state.tree) return null;
  const messages = state.tree.messages;
  const leafId = activeLeafId(messages, state.tree.activeLeafId);
  const active = activePath(messages, leafId);
  const activeIds = new Set(active.map((message) => message.entryId));
  const scoped = state.mode === "active" ? messages.filter((message) => activeIds.has(message.entryId)) : messages;
  const visible = visibleMessages(scoped, state.showAgentMessages);
  const visibleIds = new Set(visible.map((message) => message.entryId));
  const selectedId = state.selectedId && visibleIds.has(state.selectedId)
    ? state.selectedId
    : preferredSelection(messages, visible, leafId);
  const layout = layoutTree(visible);
  const depths = nodeDepths(visible, layout.parentById);
  const positioned = visible.flatMap((message) => {
    const point = layout.positions.get(message.entryId);
    return point ? [{ message, ...point }] : [];
  });
  const positions = new Map(positioned.map((item) => [item.message.entryId, item]));
  return { messages, leafId, active, activeIds, visible, selectedId, layout, depths, positioned, positions };
}

function isNewerMessage(candidate, current) {
  if (!current) return true;
  return candidate.timestamp > current.timestamp
    || (candidate.timestamp === current.timestamp && candidate.entryId.localeCompare(current.entryId) > 0);
}

// The host only navigates "exact" and only to Agent messages. A user message
// stands for its branch, so it resolves to the newest Agent reply anywhere in
// its subtree (matching the host's latest-descendant ordering by timestamp/id).
export function navigationTarget(messages, selected, activeIds) {
  if (selected.role === "assistant") {
    return { targetEntryId: selected.entryId, current: false, block: null };
  }
  if (activeIds.has(selected.entryId)) return { targetEntryId: null, current: true, block: null };
  const parents = parentMap(messages);
  const children = new Map();
  for (const message of messages) {
    const parent = parents.get(message.entryId);
    if (!parent) continue;
    let siblings = children.get(parent);
    if (!siblings) {
      siblings = [];
      children.set(parent, siblings);
    }
    siblings.push(message);
  }
  let target = null;
  const stack = [selected];
  while (stack.length) {
    const current = stack.pop();
    if (current.role === "assistant" && isNewerMessage(current, target)) target = current;
    const next = children.get(current.entryId);
    if (next) {
      for (const child of next) stack.push(child);
    }
  }
  if (!target) return { targetEntryId: null, current: false, block: "该用户消息还没有 Agent 回复，无法切换到此分支" };
  return { targetEntryId: target.entryId, current: false, block: null };
}

export function selectedModel(state, graph) {
  if (!graph?.selectedId) return null;
  const selected = graph.messages.find((message) => message.entryId === graph.selectedId);
  if (!selected) throw new Error(`conversation_tree_selection_missing: ${graph.selectedId}`);
  const path = treePath(graph.messages, selected.entryId);
  return {
    selected,
    path,
    target: navigationTarget(graph.messages, selected, graph.activeIds),
    inspector: inspectorContextResult(state.context.session, path),
    navigationBlock: navigationBlock(state.context, state.tree, state.treeHash),
  };
}

export function orderedNodeIds(graph) {
  return [...graph.positioned]
    .sort((left, right) => left.y - right.y || left.x - right.x || left.message.entryId.localeCompare(right.message.entryId))
    .map((item) => item.message.entryId);
}

export function queryMatches(graph, query) {
  return new Map(graph.visible.map((message) => [message.entryId, matchesQuery(message, query)]));
}
