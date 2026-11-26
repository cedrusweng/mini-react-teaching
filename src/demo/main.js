/**
 * 模块：demo/main
 * 作用：教学演示入口，串起 react、react-dom、reconciler、scheduler、shared。
 * 上游调用：浏览器加载 index.html 后执行本模块。
 * 下游调用：react.createElement、react.useState、react-dom.createRoot。
 * 调用链位置：
 *   createElement → ReactElement → createRoot → updateContainer → scheduleUpdateOnFiber
 *   → Scheduler → beginWork/completeWork → commitRoot → HostConfig → DOM。
 */

import { createElement, useState } from '../react/index.js';
import { createRoot } from '../react-dom/client.js';

/**
 * 示例组件：
 * - useState 由 react/ReactHooks 转发到 reconciler/ReactFiberHooks；
 * - 返回的 Element 树会在 beginWork 阶段被协调成 Fiber 树；
 * - onClick 里的 setCount 会触发完整更新链，而不是直接改 DOM。
 */
function Counter({ title }) {
  const [count, setCount] = useState(0);
  return createElement(
    'div',
    { className: 'card' },
    createElement('h2', null, `Mini React · ${title}`),
    createElement('p', null, `当前计数：${count}`),
    createElement('button', { onClick: () => setCount((value) => value + 1) }, '点我 +1'),
    createElement(
      'ul',
      null,
      // key 帮助 reconcileChildren 按索引复用同类型子节点。
      Array.from({ length: count }, (_, index) => createElement('li', { key: index }, `列表项 ${index + 1}`))
    )
  );
}

// 挂载：createRoot 建立 FiberRoot 并注册事件，render 触发第一轮调度。
createRoot(document.getElementById('root')).render(createElement(Counter, { title: '模块关系演示' }));
