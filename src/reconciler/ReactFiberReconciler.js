/**
 * 模块：reconciler/ReactFiberReconciler
 * 作用：reconciler 对宿主层暴露的适配门面。
 * 上游调用：react-dom/ReactDOMRoot.js。
 * 下游调用：ReactFiberRoot.createFiberRoot、ReactFiberWorkLoop.scheduleUpdateOnFiber。
 * 调用链位置：createRoot → createContainer；root.render → updateContainer。
 */

import { createFiberRoot } from './ReactFiberRoot.js';
import { scheduleUpdateOnFiber, batchedUpdates } from './ReactFiberWorkLoop.js';

/**
 * 创建 root：把宿主容器交给 FiberRoot 管理。
 */
export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo);
}

/**
 * 更新 root：把新 Element 放到 HostRoot.pendingProps，
 * 后续由 workLoop 在渲染阶段读取它并协调子节点。
 */
export function updateContainer(element, root) {
  root.current.pendingProps = { children: element };
  scheduleUpdateOnFiber(root, root.current);
}

// 事件系统通过该重导出使用批处理入口。
export { batchedUpdates };
