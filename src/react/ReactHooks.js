/**
 * 模块：react/ReactHooks
 * 作用：Hooks 的公开门面，只负责找到当前 dispatcher 并转发调用。
 * 上游调用：用户函数组件，例如 demo/main.js 的 Counter。
 * 下游调用：ReactSharedInternals.ReactCurrentDispatcher.current，
 *           该 dispatcher 由 reconciler/ReactFiberHooks.js 在渲染时注入。
 * 调用链位置：useState → dispatcher.useState → mountState/updateState。
 */

import { ReactSharedInternals } from '../shared/ReactSharedInternals.js';

/**
 * 从共享内部对象读取当前 dispatcher。
 * 若为空，说明当前不在函数组件渲染期间，直接抛错。
 */
function resolveDispatcher() {
  const dispatcher = ReactSharedInternals.ReactCurrentDispatcher.current;
  if (dispatcher === null) {
    throw new Error('Hook 只能在函数组件渲染期间调用');
  }
  return dispatcher;
}

/**
 * useState 本身不保存状态，只把调用委托给 reconciler。
 * 真正的状态读取与更新入队发生在 ReactFiberHooks 中。
 */
export function useState(initialState) {
  return resolveDispatcher().useState(initialState);
}
