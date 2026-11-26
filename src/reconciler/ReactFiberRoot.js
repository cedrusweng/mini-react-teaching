/**
 * 模块：reconciler/ReactFiberRoot
 * 作用：创建 FiberRoot，把容器 DOM 与当前 Fiber 树关联起来。
 * 上游调用：ReactFiberReconciler.createContainer。
 * 下游调用：ReactFiberWorkLoop 按 root 聚合待调度更新。
 * 调用链位置：createRoot → createContainer → createFiberRoot。
 */

import { createHostRootFiber } from './ReactFiber.js';

/**
 * root 保存 containerInfo；HostRoot Fiber 的 stateNode 指回 root。
 * 这样从任意子 Fiber 沿 return 向上都能找到 root，供 Hooks 调度使用。
 */
export function createFiberRoot(containerInfo) {
  const root = { containerInfo, current: null, finishedWork: null };
  const hostRootFiber = createHostRootFiber();
  hostRootFiber.stateNode = root;
  root.current = hostRootFiber;
  return root;
}
