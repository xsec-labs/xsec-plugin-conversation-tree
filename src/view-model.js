export function emptyContent(state, graph) {
  if (state.loading) return ["正在读取对话树", "正在从当前会话读取真实 Provider 消息树。", false];
  if (state.source.availability === "unsupported") {
    return ["当前 Provider 不支持对话树", state.context.session?.tree_capability?.reason ?? "宿主明确报告该会话不支持消息树快照。", false];
  }
  if (state.source.availability === "missing_session") return ["当前未绑定会话", "打开或选择一个会话后可读取对话树。", false];
  if (graph && !graph.messages.length) return ["当前对话树没有消息节点", "宿主返回了一个有效的空对话树快照。", false];
  if (graph && !graph.visible.length) return ["当前范围没有可见节点", "可调整范围或开启“显示 Agent 消息”查看其他节点。", false];
  return ["尚未缓存对话树", "加载完整树是显式操作，可能恢复当前会话的本地运行时。", true];
}
