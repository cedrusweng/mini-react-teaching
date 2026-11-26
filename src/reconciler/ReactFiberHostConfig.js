/**
 * 模块：reconciler/ReactFiberHostConfig
 * 作用：宿主配置注入点（HostConfig）。
 * 上游调用：ReactFiberCompleteWork、ReactFiberCommitWork、ReactDOMEventListener。
 * 下游调用：react-dom/ReactDOMHostConfig.js。
 * 调用链位置：reconciler 不直接操作 DOM，全部经由这里转交宿主层。
 * 说明：真实 React 通过构建 fork 切换不同宿主实现，教学版直接指向 DOM。
 */

export {
  createInstance,
  createTextInstance,
  appendChildToContainer,
  commitTextUpdate,
  commitUpdate,
  getFiberForNode,
  removeChildFromContainer,
  setFiberForNode
} from '../react-dom/ReactDOMHostConfig.js';
