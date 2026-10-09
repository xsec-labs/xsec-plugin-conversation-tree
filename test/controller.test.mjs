import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConversationTreeController } from "../src/controller.js";
import { canReadTree, parseContext, sourceState } from "../src/context.js";
import { contextRevision } from "../src/controller-state.js";
import { context, message, tree } from "./fixtures.mjs";

const projection = tree([message("root", { active: true })], { activeLeafId: "root" });
const unsupportedContext = {
  visible: true,
  workspace: {
    session: {
      session_id: "session-1",
      tree_capability: { snapshot: false, navigate: false },
    },
  },
};

function stateFor(parsed, overrides = {}) {
  return {
    query: "", mode: "all", showAgentMessages: false, selectedId: null,
    context: parsed,
    tree: parsed.tree,
    treeHash: parsed.treeHash,
    source: sourceState(parsed),
    error: "old context error",
    notice: null,
    loading: true,
    navigating: false,
    loadedTree: false,
    navigationBaseHash: null,
    generation: 4,
    ...overrides,
  };
}

test("dispose is safe before mount completes", async () => {
  const controller = new ConversationTreeController({});
  await controller.dispose();
  assert.equal(controller.disposed, true);
});

test("navigation authority updates invalidate requests and clear recovered context errors", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), { loading: false, navigating: true });
  const fence = { generation: 4, sessionId: "session-1" };
  controller.updateContext(context(projection, { status: "running" }));
  assert.equal(controller.state.generation, 5);
  assert.equal(controller.state.navigating, false);
  assert.equal(controller.isCurrent(fence), false);
  assert.equal(controller.state.error, null);
});

test("equivalent context updates do not rerender the conversation tree", () => {
  const initial = context(projection);
  const equivalent = {
    workspace: initial.workspace,
    visible: true,
    kind: "workspace-tool",
  };
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(initial));
  controller.lastContextRevision = contextRevision(initial);
  const before = controller.state.context;
  const generation = controller.state.generation;
  controller.updateContext(equivalent);
  assert.equal(controller.state.context, before);
  assert.equal(controller.state.generation, generation);
  assert.equal(controller.state.error, "old context error");
});

test("failed navigation preserves the current viewport", async () => {
  const branching = tree([
    message("root", { active: true }),
    message("target", { parentId: "root" }),
  ], { activeLeafId: "root" });
  const directory = await mkdtemp(join(tmpdir(), "conversation-tree-navigation-"));
  const controller = new ConversationTreeController({}, { navigateTree: () => readFile(join(directory, "absent.json")) });
  controller.state = stateFor(parseContext(context(branching)), {
    loading: false,
    selectedId: "target",
    mode: "all",
    showAgentMessages: false,
    query: "", view: { x: 81, y: 62, scale: 0.7 },
  });
  const before = controller.state.view;
  try {
    await controller.navigate("target");
    assert.equal(controller.state.view, before);
    assert.equal(controller.state.navigating, false);
    assert.match(controller.state.error, /ENOENT/);
  } finally { await rm(directory, { recursive: true }); }
});

test("a real read failure preserves the current viewport and clears loading", async () => {
  const parsed = parseContext(context(projection));
  const directory = await mkdtemp(join(tmpdir(), "conversation-tree-read-"));
  const controller = new ConversationTreeController({}, { readTree: () => readFile(join(directory, "absent.json")) });
  controller.state = stateFor(parsed, { loading: false, view: { x: 81, y: 62, scale: 0.7 } });
  const before = controller.state.view;
  try {
    await controller.load();
    assert.equal(controller.state.view, before);
    assert.equal(controller.state.loading, false);
    assert.match(controller.state.error, /ENOENT/);
  } finally { await rm(directory, { recursive: true }); }
});

test("ready and busy result patches preserve the viewport until the renderer applies layout", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), { view: { x: 81, y: 62, scale: 0.7 } });
  const before = controller.state.view;
  controller.acceptReadResponse({ status: "busy" }, "hash-1");
  assert.equal(controller.state.view, before);
  assert.equal(controller.state.treeHash, null);
  controller.acceptReadResponse({ status: "ready", tree: projection }, "hash-1");
  assert.equal(controller.state.view, before);
  assert.equal(controller.state.tree.activeLeafId, "root");
  assert.equal(controller.state.navigationBaseHash, "hash-1");
});

test("new tree authority invalidates an in-flight request", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)));
  controller.updateContext(context(projection, { treeHash: "hash-2" }));
  assert.equal(controller.state.generation, 5);
  assert.equal(controller.state.loading, false);
});

test("valid no-tree recovery clears context errors", () => {
  const parsed = parseContext(unsupportedContext);
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parsed, { loading: false });
  controller.updateContext(unsupportedContext);
  assert.equal(controller.state.error, null);
  assert.equal(controller.state.tree, null);
});

test("unsupported snapshots cannot reach the host read boundary", async () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(unsupportedContext), { loading: false });
  await controller.load();
  assert.equal(controller.state.generation, 4);
  assert.equal(controller.state.loading, false);
});

test("an unbound workspace cannot reach the host read boundary", async () => {
  const parsed = parseContext({ visible: true, workspace: {} });
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parsed, { loading: false });
  assert.equal(canReadTree(parsed), false);
  await controller.load();
  assert.equal(controller.state.generation, 4);
  assert.equal(controller.state.loading, false);
});

test("an unbound workspace clears a previously loaded snapshot", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), { loadedTree: true, loading: false });
  controller.updateContext({ visible: true, workspace: {} });
  assert.equal(controller.state.tree, null);
  assert.equal(controller.state.loadedTree, false);
});

test("a truncated session switch clears the previous session tree", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), { loading: false, query: "session one" });
  const next = context({ ...projection, sessionId: "session-2" });
  next.truncated = true;
  delete next.workspace.session.conversation_tree;
  controller.updateContext(next);
  assert.equal(controller.state.context.sessionId, "session-2");
  assert.equal(controller.state.tree, null);
  assert.equal(controller.state.query, "");
});

test("a truncated update for the same session retains its browseable tree", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), { loading: false });
  const next = context(projection);
  next.truncated = true;
  delete next.workspace.session.conversation_tree;
  controller.updateContext(next);
  assert.equal(controller.state.tree.sessionId, "session-1");
  assert.equal(controller.state.treeHash, null);
});

test("a loaded tree remains until the projection hash advances", () => {
  const parsed = parseContext(context(projection));
  const returned = tree([
    message("root", { active: true }),
    message("leaf", { parentId: "root", active: true }),
  ], { activeLeafId: "leaf" });
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parsed, {
    tree: returned,
    treeHash: null,
    loadedTree: true,
    navigationBaseHash: "hash-1",
    loading: false,
  });
  controller.updateContext(context(projection));
  assert.equal(controller.state.tree.activeLeafId, "leaf");
  assert.equal(controller.state.loadedTree, true);
  assert.equal(controller.state.treeHash, null);
  controller.updateContext(context(projection, { treeHash: "hash-2" }));
  assert.equal(controller.state.tree.activeLeafId, "root");
  assert.equal(controller.state.loadedTree, false);
  assert.equal(controller.state.treeHash, "hash-2");
});

test("a ready read result retains the current projection hash", () => {
  const cached = context(projection);
  const returned = tree([
    message("root", { active: true }),
    message("leaf", { parentId: "root", active: true }),
  ], { activeLeafId: "leaf" });
  const controller = new ConversationTreeController({});
  const parsed = parseContext(cached);
  controller.state = stateFor(parsed, { loading: false });
  controller.lastContextRevision = contextRevision(cached);
  controller.acceptReadResponse({ status: "ready", tree: returned }, controller.state.treeHash);
  controller.updateContext(cached);
  assert.equal(controller.state.tree.activeLeafId, "leaf");
  assert.equal(controller.state.loadedTree, true);
  assert.equal(controller.state.navigationBaseHash, "hash-1");
  assert.equal(controller.state.treeHash, null);
});

test("repeated authoritative context is processed after a non-ready read result", () => {
  const cached = context(projection);
  const controller = new ConversationTreeController({});
  const parsed = parseContext(cached);
  controller.state = stateFor(parsed, { loading: false });
  controller.lastContextRevision = contextRevision(cached);
  controller.acceptReadResponse({ status: "busy" }, controller.state.treeHash);
  assert.equal(controller.state.treeHash, null);
  controller.updateContext(cached);
  assert.equal(controller.state.treeHash, "hash-1");
  assert.equal(controller.state.tree.activeLeafId, "root");
});

test("navigation results wait for a new authoritative hash", () => {
  const branching = tree([
    message("root", { active: true }),
    message("target", { parentId: "root" }),
  ], { activeLeafId: "root" });
  const navigated = tree([
    message("root", { active: true }),
    message("target", { parentId: "root", active: true }),
  ], { activeLeafId: "target" });
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(branching)), { loading: false });
  controller.acceptNavigation({ result: navigated }, "target", "hash-1");
  controller.updateContext(context(branching));
  assert.equal(controller.state.tree.activeLeafId, "target");
  assert.equal(controller.state.treeHash, null);
  controller.updateContext(context(navigated, { treeHash: "hash-2" }));
  assert.equal(controller.state.tree.activeLeafId, "target");
  assert.equal(controller.state.treeHash, "hash-2");
  assert.equal(controller.state.navigationBaseHash, null);
});

test("rebinding through an unbound workspace resets session filters", () => {
  const controller = new ConversationTreeController({});
  controller.state = stateFor(parseContext(context(projection)), {
    loading: false,
    query: "old query",
    mode: "active",
    showAgentMessages: true,
  });
  controller.updateContext({ visible: true, workspace: {} });
  controller.updateContext(context({ ...projection, sessionId: "session-2" }));
  assert.equal(controller.state.query, "");
  assert.equal(controller.state.mode, "all");
  assert.equal(controller.state.showAgentMessages, false);
});
