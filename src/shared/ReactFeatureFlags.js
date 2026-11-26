/**
 * 模块：shared/ReactFeatureFlags
 * 作用：集中管理特性开关；真实 React 由 shared/forks 在构建期替换实现。
 * 上游调用：本教学版主链路暂未读取，作为扩展点保留。
 * 下游影响：reconciler 或宿主层可据此切换行为，例如并发调度、事件委托。
 * 调用链位置：横切关注点，不参与单次更新的数据流。
 */

// 预留：控制是否走 Scheduler 的并发入口。
export const enableConcurrentScheduling = true;

// 预留：控制是否在根节点上注册委托事件。
export const enableEventDelegation = true;
