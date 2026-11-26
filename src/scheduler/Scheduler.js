/**
 * 模块：scheduler/Scheduler
 * 作用：维护任务队列，并用微任务驱动回调执行，模拟时间切片入口。
 * 上游调用：reconciler/ReactFiberWorkLoop.scheduleUpdateOnFiber。
 * 下游调用：flushWork → flushScheduledRoots → renderRootSync/commitRoot。
 * 调用链位置：从“有更新”到“开始渲染”的异步桥梁。
 */

const taskQueue = [];
let isHostCallbackScheduled = false;

/**
 * 确保同一轮只注册一次 host callback，避免重复调度。
 * 真实 React 使用 MessageChannel/setImmediate，这里用 queueMicrotask 简化。
 */
function scheduleHostCallback() {
  if (isHostCallbackScheduled) return;
  isHostCallbackScheduled = true;
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(flushWork);
  } else {
    Promise.resolve().then(flushWork);
  }
}

/**
 * 依次取出任务执行；任务内部会完成 render + commit。
 */
function flushWork() {
  isHostCallbackScheduled = false;
  while (taskQueue.length > 0) {
    const task = taskQueue.shift();
    task();
  }
}

/**
 * 对外入口：把 callback 入队并请求调度。
 * 返回值是队列长度，仅用于教学观察；真实 Scheduler 返回任务对象。
 */
export function unstable_scheduleCallback(callback) {
  taskQueue.push(callback);
  scheduleHostCallback();
  return taskQueue.length;
}

export const scheduleCallback = unstable_scheduleCallback;
