import { createController } from "./controller.js";
import { ConversationTreeSnapshotReceiver } from "./snapshot-stream.js";
import tokenStyles from "@xsec/design-tokens/styles.css";
import componentStyles from "@xsec/ui-react/styles.css";
import { setSharedStyles } from "./styles.js";
setSharedStyles(tokenStyles + componentStyles);
export {
  activeLeafId,
  activePath,
  focusPath,
  layoutTree,
  matchesQuery,
  nodeDepths,
  panView,
  parentMap,
  preferredSelection,
  treePath,
  validateTree,
  visibleMessages,
  zoomView,
} from "./core.js";
export { graphModel, orderedNodeIds, queryMatches } from "./model.js";
export { parseContext, navigationBlock } from "./context.js";
export { canStartRead, isRequestCurrent, readResponsePatch } from "./controller-state.js";
export { createController } from "./controller.js";
export { ConversationTreeSnapshotReceiver } from "./snapshot-stream.js";

export function activate(host) {
  async function readTree() { return host.request("xsec.conversation-tree.read", {}); }
  async function navigateTree(request) { return host.request("xsec.conversation-tree.navigate", request); }
  const controller = createController(host, { readTree, navigateTree });
  const snapshots = new ConversationTreeSnapshotReceiver();
  const snapshotSubscription = host.onData("xsec.conversation-tree.snapshot", (payload) => {
    try {
      const snapshot = snapshots.accept(payload);
      if (snapshot) controller.updateSnapshot(snapshot);
    } catch (error) {
      console.error("conversation-tree.snapshot.failed", { message: error instanceof Error ? error.message : String(error) });
      controller.snapshotFailed(error);
    }
  });
  return {
    mount(root, context) { return controller.mount(root, context); },
    update(context) { return controller.update(context); },
    async dispose() { snapshotSubscription.dispose(); await controller.dispose(); },
  };
}
