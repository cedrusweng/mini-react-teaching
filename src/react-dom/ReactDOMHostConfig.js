/**
 * 模块：react-dom/ReactDOMHostConfig
 * 作用：宿主层实现。提供真实 DOM 操作，并维护 DOM 节点到 Fiber 的映射。
 * 上游调用：reconciler/ReactFiberHostConfig（由 completeWork/commitWork 间接使用）。
 * 下游调用：浏览器 DOM API；事件系统通过 getFiberForNode 反查 Fiber。
 * 调用链位置：commitWork → HostConfig → DOM；click → getFiberForNode。
 */

const fiberByNode = new WeakMap();

/**
 * commitWork 在提交每个宿主节点时写入映射。
 */
export function setFiberForNode(node, fiber) {
  fiberByNode.set(node, fiber);
}

/**
 * 事件系统从原生事件目标反查 Fiber，再沿 return 向上寻找 onClick。
 */
export function getFiberForNode(node) {
  return fiberByNode.get(node) || null;
}

/**
 * 把 props 写成 DOM 属性。
 * children 与 onClick 不写进 DOM：前者由 Fiber 树处理，后者由事件系统处理。
 */
function applyProperties(node, props) {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'onClick' || value === null || value === undefined) {
      continue;
    }
    if (key === 'className') {
      node.setAttribute('class', value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value);
    } else {
      node.setAttribute(key, String(value));
    }
  }
}

/**
 * completeWork 调用：创建元素节点并写入初始属性。
 */
export function createInstance(type, props) {
  const node = document.createElement(type);
  applyProperties(node, props);
  return node;
}

/**
 * completeWork 调用：创建文本节点。
 */
export function createTextInstance(content) {
  return document.createTextNode(String(content));
}

/**
 * commitWork 调用：把新节点挂到容器。
 */
export function appendChildToContainer(container, child) {
  container.appendChild(child);
}

/**
 * commitDeletion 调用：从容器移除节点。
 */
export function removeChildFromContainer(container, child) {
  container.removeChild(child);
}

/**
 * commitWork 调用：更新已复用元素节点的属性。
 */
export function commitUpdate(instance, nextProps) {
  applyProperties(instance, nextProps);
}

/**
 * commitWork 调用：仅在文本变化时更新 nodeValue。
 */
export function commitTextUpdate(textInstance, oldText, newText) {
  if (oldText !== newText) {
    textInstance.nodeValue = String(newText);
  }
}
