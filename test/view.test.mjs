import assert from "node:assert/strict";
import test from "node:test";
import { emptyContent, summaryText } from "../src/view.js";

const state = {
  loading: false,
  source: { availability: "ready" },
  context: { session: null },
};

test("empty tree and filtered tree expose explicit empty states", () => {
  assert.match(emptyContent(state, { messages: [], visible: [] })[0], /没有消息节点/);
  assert.match(emptyContent(state, { messages: [{}], visible: [] })[0], /没有可见节点/);
});

test("unbound workspaces expose a no-session state", () => {
  const unbound = { ...state, source: { availability: "missing_session" } };
  const [title, , canLoad] = emptyContent(unbound, null);
  assert.match(title, /未绑定会话/);
  assert.equal(canLoad, false);
});

test("summary separates what is shown from the whole tree", () => {
  const messages = [{ role: "user" }, { role: "assistant" }, { role: "assistant" }, { role: "user" }];
  const users = messages.filter((item) => item.role === "user");
  assert.equal(
    summaryText({ mode: "all" }, { messages, visible: users }),
    "全部显示 2 个节点（用户 2）· 全树共 4 个节点（用户 2 · Agent 2）",
  );
  assert.equal(
    summaryText({ mode: "active" }, { messages, visible: messages }),
    "当前路径显示 4 个节点（用户 2 · Agent 2）· 全树共 4 个节点（用户 2 · Agent 2）",
  );
});
