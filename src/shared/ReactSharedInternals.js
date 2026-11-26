/**
 * 模块：shared/ReactSharedInternals
 * 作用：在 react 公共 API 与 reconciler 实现之间传递内部状态。
 * 上游写入：reconciler/ReactFiberHooks.js 在渲染时写入 ReactCurrentDispatcher。
 * 上游读取：react/ReactHooks.js 通过它找到当前 dispatcher。
 * 下游调用：useState → dispatcher.useState → mountState/updateState。
 * 调用链位置：Hooks 从“公开 API”进入“Fiber 实现”的桥。
 */

export const ReactSharedInternals = {
  // 由 renderWithHooks 注入；useState 读取后转发调用。
  ReactCurrentDispatcher: { current: null },

  // 批量更新标记的占位，对应真实 React 的 batchedUpdates。
  ReactCurrentBatchConfig: { transition: 0 },

  // 当前正在渲染的组件占位，便于调试与扩展。
  ReactCurrentOwner: { current: null }
};
