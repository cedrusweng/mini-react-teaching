/**
 * 模块：reconciler/ReactFiberCompleteWork
 * 作用：complete 阶段。自底向上为新宿主 Fiber 创建真实 DOM 实例。
 * 上游调用：ReactFiberWorkLoop.performUnitOfWork 在回溯时调用。
 * 下游调用：reconciler/ReactFiberHostConfig → react-dom/ReactDOMHostConfig。
 * 调用链位置：beginWork 之后、commitWork 之前。
 */

import { HostComponent, HostText } from './ReactWorkTags.js';
import { createInstance, createTextInstance } from './ReactFiberHostConfig.js';

/**
 * 只有 stateNode 为空的新节点才创建 DOM；复用节点保留旧实例，
 * 其内容变化留到 commit 阶段通过 commitUpdate/commitTextUpdate 处理。
 */
export function completeWork(workInProgress) {
  if (workInProgress.tag === HostText) {
    if (workInProgress.stateNode === null) {
      workInProgress.stateNode = createTextInstance(workInProgress.pendingProps.content);
    }
    return;
  }
  if (workInProgress.tag === HostComponent && workInProgress.stateNode === null) {
    workInProgress.stateNode = createInstance(workInProgress.type, workInProgress.pendingProps);
  }
}
