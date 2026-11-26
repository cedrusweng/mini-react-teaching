/**
 * 模块：react-dom/ReactDOMRoot
 * 作用：宿主层 Root API。把容器、reconciler 与事件系统串起来。
 * 上游调用：react-dom/client.createRoot → demo/main.js。
 * 下游调用：reconciler/ReactFiberReconciler、ReactDOMEventListener。
 * 调用链位置：createRoot → createContainer → listenToAllSupportedEvents。
 */

import { createContainer, updateContainer } from '../reconciler/ReactFiberReconciler.js';
import { listenToAllSupportedEvents } from './events/ReactDOMEventListener.js';

/**
 * 创建 root 并注册事件委托。
 * 返回的 render/unmount 是宿主层提供给用户的唯一操作面。
 */
export function createRoot(container) {
  const root = createContainer(container);
  listenToAllSupportedEvents(container);
  return {
    /**
     * 首次渲染与后续更新都走同一个 updateContainer 入口。
     * Element 由 react.createElement 产生，reconciler 负责把它变成 DOM。
     */
    render(element) {
      updateContainer(element, root);
    },

    /**
     * 卸载本质是渲染 null：协调阶段会把所有旧 Fiber 标记为 DELETION。
     */
    unmount() {
      updateContainer(null, root);
    },

    // 暴露内部 root，方便教学调试观察 FiberRoot 结构。
    _internalRoot: root
  };
}
