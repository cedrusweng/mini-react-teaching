/**
 * 模块：reconciler/ReactFiberCommitWork
 * 作用：commit 阶段。把 render 阶段产生的 EffectTag 转成真实 DOM 操作。
 * 上游调用：ReactFiberWorkLoop.flushScheduledRoots（render 完成后）。
 * 下游调用：reconciler/ReactFiberHostConfig → react-dom/ReactDOMHostConfig。
 * 调用链位置：commitRoot → commitWork → HostConfig → DOM。
 */

import { HostComponent, HostRoot, HostText, PLACEMENT, UPDATE } from './ReactWorkTags.js';
import {
  appendChildToContainer,
  commitTextUpdate,
  commitUpdate,
  getFiberForNode,
  removeChildFromContainer,
  setFiberForNode
} from './ReactFiberHostConfig.js';

/**
 * 从当前 Fiber 向上找最近的宿主父节点；HostRoot 表示容器本身。
 * 函数组件没有 DOM 实例，因此必须跳过。
 */
function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    if (parent.tag === HostComponent || parent.tag === HostRoot) {
      return parent;
    }
    parent = parent.return;
  }
  return null;
}

/**
 * 把宿主父 Fiber 解析成真实父 DOM 节点。
 */
function getParentNode(fiber, rootContainer) {
  const parentFiber = getHostParentFiber(fiber);
  if (parentFiber === null) return rootContainer;
  if (parentFiber.tag === HostRoot) return parentFiber.stateNode.containerInfo;
  return parentFiber.stateNode;
}

/**
 * 收集整棵 finishedWork 树里的删除标记，统一先删除再插入/更新。
 */
function collectDeletions(fiber, deletions) {
  for (const deletion of fiber.deletions) {
    deletions.push(deletion);
  }
  let child = fiber.child;
  while (child !== null) {
    collectDeletions(child, deletions);
    child = child.sibling;
  }
}

/**
 * 删除子树下的所有宿主节点；函数组件自身没有 DOM，因此继续向下找。
 */
function collectHostNodes(fiber, nodes) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    nodes.push(fiber.stateNode);
    return;
  }
  let child = fiber.child;
  while (child !== null) {
    collectHostNodes(child, nodes);
    child = child.sibling;
  }
}

/**
 * 执行删除：通过 HostConfig 从父 DOM 中移除节点。
 */
function commitDeletion(fiber, rootContainer) {
  const parentNode = getParentNode(fiber, rootContainer);
  const hostNodes = [];
  collectHostNodes(fiber, hostNodes);
  for (const node of hostNodes) {
    if (parentNode === rootContainer) {
      removeChildFromContainer(rootContainer, node);
    } else {
      parentNode.removeChild(node);
    }
  }
}

/**
 * 深度优先提交：
 * 1) 建立 DOM 节点 → Fiber 的映射，供事件系统反查；
 * 2) PLACEMENT 执行插入，UPDATE 执行属性/文本更新；
 * 3) 递归处理 child/sibling。
 */
function commitWork(fiber, rootContainer) {
  if (fiber.tag === HostComponent || fiber.tag === HostText) {
    const parentNode = getParentNode(fiber, rootContainer);
    setFiberForNode(fiber.stateNode, fiber);

    if (fiber.effectTag === PLACEMENT) {
      if (parentNode === rootContainer) {
        appendChildToContainer(rootContainer, fiber.stateNode);
      } else {
        parentNode.appendChild(fiber.stateNode);
      }
    } else if (fiber.effectTag === UPDATE) {
      if (fiber.tag === HostText) {
        commitTextUpdate(fiber.stateNode, fiber.alternate.pendingProps.content, fiber.pendingProps.content);
      } else {
        commitUpdate(fiber.stateNode, fiber.pendingProps);
      }
    }
  }

  let child = fiber.child;
  while (child !== null) {
    commitWork(child, rootContainer);
    child = child.sibling;
  }
}

/**
 * commit 总入口：先删、再插入/更新，最后切换 root.current 指向 finishedWork。
 * root.current 的切换标志着本轮更新正式完成。
 */
export function commitRoot(root, finishedWork) {
  const deletions = [];
  collectDeletions(finishedWork, deletions);
  for (const deletion of deletions) {
    commitDeletion(deletion, root.containerInfo);
  }
  commitWork(finishedWork.child, root.containerInfo);
  root.finishedWork = finishedWork;
  root.current = finishedWork;
}
