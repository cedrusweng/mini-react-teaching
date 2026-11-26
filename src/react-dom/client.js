/**
 * 模块：react-dom/client
 * 作用：react-dom/client 包入口，只做重导出。
 * 上游调用：demo/main.js 的 createRoot。
 * 下游调用：react-dom/ReactDOMRoot.js。
 * 调用链位置：用户代码通过该入口拿到 Root API。
 */

export { createRoot } from './ReactDOMRoot.js';
