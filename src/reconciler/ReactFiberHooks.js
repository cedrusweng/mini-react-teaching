/**
 * 模块：reconciler/ReactFiberHooks
 * 作用：Hooks 的真实实现，负责状态存储、更新队列与重新调度。
 * 上游调用：ReactFiberBeginWork.renderWithHooks（渲染函数组件时）。
 * 下游调用：shared/ReactSharedInternals 注入 dispatcher；
 *           ReactFiberWorkLoop.scheduleUpdateOnFiber 发起更新。
 * 调用链位置：useState → dispatcher → mountState/updateState → dispatchSetState。
 */

import { ReactSharedInternals } from '../shared/ReactSharedInternals.js';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop.js';

let currentlyRenderingFiber = null;
let workInProgressHook = null;

// 首次挂载与更新使用不同实现，由 renderWithHooks 切换。
const HooksDispatcherOnMount = { useState: mountState };
const HooksDispatcherOnUpdate = { useState: updateState };

/**
 * 渲染函数组件前调用：记录当前 Fiber，并注入对应 dispatcher。
 * 判断依据是 workInProgress.alternate 是否存在。
 */
export function renderWithHooks(workInProgress) {
  currentlyRenderingFiber = workInProgress;
  workInProgressHook = null;
  ReactSharedInternals.ReactCurrentDispatcher.current =
    workInProgress.alternate === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
}

/**
 * 组件渲染结束后清理 dispatcher，避免组件外误用 Hooks。
 */
export function resetHooks() {
  ReactSharedInternals.ReactCurrentDispatcher.current = null;
  currentlyRenderingFiber = null;
  workInProgressHook = null;
}

/**
 * 挂载阶段：创建 Hook 节点并串成链表，挂到 Fiber.memoizedState。
 */
function mountWorkInProgressHook() {
  const hook = { memoizedState: null, queue: null, next: null };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = hook;
  } else {
    workInProgressHook.next = hook;
  }
  workInProgressHook = hook;
  return hook;
}

/**
 * 更新阶段：按 Hook 调用顺序复用上一次的 state 与 queue。
 */
function updateWorkInProgressHook() {
  const currentFiber = currentlyRenderingFiber.alternate;
  const currentHook = workInProgressHook === null ? currentFiber.memoizedState : workInProgressHook.next;
  const hook = { memoizedState: currentHook.memoizedState, queue: currentHook.queue, next: null };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = hook;
  } else {
    workInProgressHook.next = hook;
  }
  workInProgressHook = hook;
  return hook;
}

/**
 * mountState：创建更新队列，并把 dispatchSetState 绑定到当前 Fiber 与 queue。
 * 返回的 dispatch 就是用户代码拿到的 setCount。
 */
function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = typeof initialState === 'function' ? initialState() : initialState;
  const queue = { pending: [], dispatch: null };
  hook.queue = queue;
  queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, queue.dispatch];
}

/**
 * updateState：消费 queue.pending 中的 action，算出新 state 并清空队列。
 * 注意这里只计算状态，不碰 DOM。
 */
function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  let nextState = hook.memoizedState;
  for (const action of queue.pending) {
    nextState = typeof action === 'function' ? action(nextState) : action;
  }
  queue.pending.length = 0;
  hook.memoizedState = nextState;
  return [nextState, queue.dispatch];
}

/**
 * 沿 Fiber.return 一直向上找到 HostRoot，其 stateNode 就是 FiberRoot。
 * Hooks 自身不持有 root，因此需要这条回溯链。
 */
function getRootFromFiber(fiber) {
  let node = fiber;
  while (node.return !== null) {
    node = node.return;
  }
  return node.stateNode;
}

/**
 * setState 的最终落点：先入队，再通知 WorkLoop 调度整棵 root。
 * 调用链：setCount → dispatchSetState → scheduleUpdateOnFiber。
 */
function dispatchSetState(fiber, queue, action) {
  queue.pending.push(action);
  scheduleUpdateOnFiber(getRootFromFiber(fiber), fiber);
}
