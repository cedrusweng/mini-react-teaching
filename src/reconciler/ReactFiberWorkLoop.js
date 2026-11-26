/**
 * 模块：reconciler/ReactFiberWorkLoop
 * 作用：更新调度中枢。聚合待更新 root，驱动 render 与 commit。
 * 上游调用：ReactFiberHooks.dispatchSetState、ReactFiberReconciler.updateContainer。
 * 下游调用：Scheduler.scheduleCallback、beginWork、completeWork、commitRoot。
 * 调用链位置：scheduleUpdateOnFiber → workLoop → render → commit。
 */

import { createWorkInProgress } from './ReactFiber.js';
import { beginWork } from './ReactFiberBeginWork.js';
import { completeWork } from './ReactFiberCompleteWork.js';
import { commitRoot } from './ReactFiberCommitWork.js';
import { scheduleCallback } from '../scheduler/Scheduler.js';

const rootsToSchedule = new Set();
let isScheduled = false;

/**
 * 统一更新入口：只记录 root，不立即渲染。
 * 同一轮多次 setState 会因为 Set 去重而只触发一次渲染，这就是批处理效果。
 */
export function scheduleUpdateOnFiber(root, fiber) {
  rootsToSchedule.add(root);
  if (!isScheduled) {
    isScheduled = true;
    scheduleCallback(flushScheduledRoots);
  }
}

/**
 * 事件系统用它包裹用户回调；当前实现直接执行，
 * 真正的批量效果由上面的 rootsToSchedule 去重完成。
 */
export function batchedUpdates(callback) {
  callback();
}

/**
 * Scheduler 回调：取出所有待更新 root，逐个 render + commit。
 */
function flushScheduledRoots() {
  isScheduled = false;
  const roots = Array.from(rootsToSchedule);
  rootsToSchedule.clear();
  for (const root of roots) {
    const finishedWork = renderRootSync(root);
    commitRoot(root, finishedWork);
  }
}

/**
 * 同步渲染整棵树：先构建 workInProgress 副本，再遍历到没有剩余工作。
 * 返回值 finishedWork 会交给 commitRoot。
 */
function renderRootSync(root) {
  const current = root.current;
  const workInProgress = createWorkInProgress(current, current.pendingProps, null);
  let nextUnitOfWork = workInProgress;
  while (nextUnitOfWork !== null) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  return workInProgress;
}

/**
 * 单个工作单元：
 * - 有 child：继续向下 beginWork；
 * - 无 child：向上 completeWork，并寻找 sibling；
 * - 回到根且无 sibling：本轮渲染结束。
 */
function performUnitOfWork(fiber) {
  beginWork(fiber);
  if (fiber.child !== null) {
    return fiber.child;
  }
  let completedFiber = fiber;
  while (completedFiber !== null) {
    completeWork(completedFiber);
    if (completedFiber.sibling !== null) {
      return completedFiber.sibling;
    }
    completedFiber = completedFiber.return;
  }
  return null;
}
