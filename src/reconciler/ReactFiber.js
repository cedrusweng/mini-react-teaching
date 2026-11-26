/**
 * 模块：reconciler/ReactFiber
 * 作用：定义 Fiber 数据结构与双缓冲节点创建逻辑。
 * 上游调用：ReactFiberRoot、ReactFiberWorkLoop、ReactFiberBeginWork。
 * 下游调用：ReactFiberCommitWork 读取 child/sibling/return/stateNode 执行提交。
 * 调用链位置：Element → Fiber → DOM 的载体。
 */

import { FunctionComponent, HostComponent, HostText, HostRoot } from './ReactWorkTags.js';
import { REACT_TEXT_ELEMENT_TYPE } from '../shared/ReactSymbols.js';

/**
 * 根据 Element.type 推断 Fiber tag。
 * 函数类型对应组件；文本符号对应文本节点；其余按宿主标签处理。
 */
function inferTag(type) {
  if (typeof type === 'function') return FunctionComponent;
  if (type === REACT_TEXT_ELEMENT_TYPE) return HostText;
  return HostComponent;
}

/**
 * 创建一个 Fiber 节点。
 * tag/type/key：描述节点对应什么组件。
 * return/child/sibling：构成 Fiber 树，事件冒泡与 commit 都依赖它。
 * stateNode/alternate：宿主实例与双缓冲的另一棵树节点。
 * memoizedState/effectTag/deletions：Hooks 状态与副作用记录。
 */
export function createFiber(tag, type, key, pendingProps, returnFiber, stateNode = null) {
  return {
    tag,
    type,
    key,
    pendingProps,
    memoizedProps: pendingProps,
    return: returnFiber,
    child: null,
    sibling: null,
    stateNode,
    alternate: null,
    memoizedState: null,
    effectTag: null,
    deletions: []
  };
}

/**
 * 把 Element 转为 Fiber，供 beginWork 的 reconcileChildren 调用。
 */
export function createFiberFromElement(element, returnFiber) {
  return createFiber(inferTag(element.type), element.type, element.key, element.props, returnFiber);
}

/**
 * 文本子节点也拥有独立 Fiber，commit 时通过 HostConfig 创建文本节点。
 */
export function createFiberFromText(content, returnFiber) {
  return createFiber(HostText, REACT_TEXT_ELEMENT_TYPE, null, { content: String(content) }, returnFiber);
}

/**
 * 创建 HostRoot Fiber，它的 stateNode 会被设置为 FiberRoot。
 */
export function createHostRootFiber() {
  const hostRootFiber = createFiber(HostRoot, null, null, { children: null }, null);
  return hostRootFiber
}

/**
 * 双缓冲核心：优先复用 alternate，复用时保留宿主实例与 Hooks 链。
 * 调用方：ReactFiberWorkLoop.renderRootSync、ReactFiberBeginWork.reconcileChildren。
 */
export function createWorkInProgress(current, pendingProps = current.pendingProps, returnFiber = current.return) {

  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, current.type, current.key, pendingProps, returnFiber, current.stateNode);

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.type = current.type;
    workInProgress.key = current.key;
    workInProgress.return = returnFiber;
    workInProgress.stateNode = current.stateNode;
    workInProgress.pendingProps = pendingProps;
  }

  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.child = null;
  workInProgress.sibling = null;
  workInProgress.effectTag = null;
  workInProgress.deletions = [];
  return workInProgress;
}
