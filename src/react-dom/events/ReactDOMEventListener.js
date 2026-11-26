/**
 * 模块：react-dom/events/ReactDOMEventListener
 * 作用：事件委托入口。只在根节点监听一次，再从原生事件反查 Fiber 找到回调。
 * 上游调用：react-dom/ReactDOMRoot.createRoot（注册监听）。
 * 下游调用：ReactDOMHostConfig.getFiberForNode → batchedUpdates → onClick。
 * 调用链位置：click → Fiber.onClick → setState → scheduleUpdateOnFiber。
 */

import { batchedUpdates } from '../../reconciler/ReactFiberReconciler.js';
import { getFiberForNode } from '../ReactDOMHostConfig.js';

/**
 * 在宿主容器上注册原生 click 监听。
 * 教学版只演示 click；真实 React 会按插件注册多种事件。
 */
export function listenToAllSupportedEvents(container) {
  container.addEventListener('click', dispatchEvent);
}

/**
 * 事件分发：
 * 1) 通过 DOM → Fiber 映射找到事件目标对应的 Fiber；
 * 2) 沿 return 链向上冒泡，模拟 React 的合成事件冒泡；
 * 3) 找到 onClick 后用 batchedUpdates 包裹执行。
 */
function dispatchEvent(nativeEvent) {
  let fiber = getFiberForNode(nativeEvent.target);
  while (fiber !== null) {
    const onClick = fiber.pendingProps && fiber.pendingProps.onClick;
    if (typeof onClick === 'function') {
      batchedUpdates(() => onClick(nativeEvent));
      return;
    }
    fiber = fiber.return;
  }
}
