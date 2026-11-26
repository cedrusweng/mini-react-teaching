/**
 * 模块：reconciler/ReactWorkTags
 * 作用：定义 Fiber tag 与 EffectTag 常量，消除魔法值。
 * 上游调用：ReactFiber、ReactFiberBeginWork、ReactFiberCompleteWork、ReactFiberCommitWork。
 * 下游影响：决定 beginWork 分支与 commit 阶段的 DOM 操作类型。
 * 调用链位置：贯穿 render 与 commit 的枚举字典。
 */

// Fiber tag：描述节点是函数组件、根节点还是宿主节点。
export const FunctionComponent = 0;
export const HostRoot = 1;
export const HostComponent = 2;
export const HostText = 3;

// EffectTag：描述 commit 阶段需要执行哪种副作用。
export const PLACEMENT = 'PLACEMENT';
export const UPDATE = 'UPDATE';
export const DELETION = 'DELETION';
