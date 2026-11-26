/**
 * 模块：reconciler/ReactFiberBeginWork
 * 作用：render 阶段。执行函数组件、协调子节点，并标记 EffectTag。
 * 上游调用：ReactFiberWorkLoop.performUnitOfWork。
 * 下游调用：ReactFiberHooks.renderWithHooks、ReactFiber.createWorkInProgress。
 * 调用链位置：workLoop → beginWork → reconcileChildren → completeWork。
 */

import { FunctionComponent, HostComponent, HostRoot, PLACEMENT, UPDATE, DELETION } from './ReactWorkTags.js';
import { createFiberFromElement, createWorkInProgress } from './ReactFiber.js';
import { isReactElement, createTextElement } from '../react/ReactElement.js';
import { renderWithHooks, resetHooks } from './ReactFiberHooks.js';

/**
 * 把原始子节点转成 Element，保证后续 reconcile 只处理一种形状。
 */
function normalizeChild(child) {
  return isReactElement(child) ? child : createTextElement(child);
}

/**
 * 按索引比较新旧子节点：type/key 相同则复用，否则新建并标记删除。
 * 输出的 child/sibling/deletions/effectTag 会被 completeWork 与 commitWork 使用。
 */
function reconcileChildren(workInProgress, children) {
  const childElements = (Array.isArray(children) ? children.flat(Infinity) : [children])
    .filter((child) => child !== null && child !== undefined && typeof child !== 'boolean')
    .map(normalizeChild);
  let previousFiber = null;
  let oldFiber = workInProgress.alternate === null ? null : workInProgress.alternate.child;

  for (let index = 0; index < childElements.length; index += 1) {
    const element = childElements[index];
    let newFiber;
    if (oldFiber !== null && oldFiber.type === element.type && oldFiber.key === element.key) {
      newFiber = createWorkInProgress(oldFiber, element.props, workInProgress);
      newFiber.effectTag = UPDATE;
    } else {
      newFiber = createFiberFromElement(element, workInProgress);
      newFiber.effectTag = PLACEMENT;
      if (oldFiber !== null) {
        oldFiber.effectTag = DELETION;
        workInProgress.deletions.push(oldFiber);
      }
    }

    if (previousFiber === null) {
      workInProgress.child = newFiber;
    } else {
      previousFiber.sibling = newFiber;
    }
    previousFiber = newFiber;
    if (oldFiber !== null) {
      oldFiber = oldFiber.sibling;
    }
  }

  // 新 children 比旧 children 短时，剩余的旧 Fiber 全部标记删除。
  while (oldFiber !== null) {
    oldFiber.effectTag = DELETION;
    workInProgress.deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

/**
 * 根据 Fiber.tag 分派：
 * - HostRoot/HostComponent：只协调 children；
 * - FunctionComponent：先执行组件拿到 children，再协调；
 * - HostText：没有子节点，直接返回。
 */
export function beginWork(workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      reconcileChildren(workInProgress, workInProgress.pendingProps.children);
      return;
    case FunctionComponent: {
      // 执行组件前注入 dispatcher，执行后清理，useState 才能工作。
      renderWithHooks(workInProgress);
      const children = workInProgress.type(workInProgress.pendingProps);
      resetHooks();
      reconcileChildren(workInProgress, children);
      return;
    }
    case HostComponent:
      reconcileChildren(workInProgress, workInProgress.pendingProps.children);
      return;
    default:
      return;
  }
}
