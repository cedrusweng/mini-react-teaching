/**
 * 模块：scheduler/index
 * 作用：scheduler 包入口，只做重导出。
 * 上游调用：reconciler/ReactFiberWorkLoop.js。
 * 下游调用：scheduler/Scheduler.js。
 * 调用链位置：reconciler 通过该入口请求异步调度。
 */

export { unstable_scheduleCallback, scheduleCallback } from './Scheduler.js';
