/**
 * 模块：react/jsx-runtime
 * 作用：jsx-runtime 包入口，只做重导出，不含逻辑。
 * 上游调用：编译后的 JSX 代码自动 import { jsx, jsxs } from 'react/jsx-runtime'。
 * 下游调用：react/ReactJSX.js。
 * 调用链位置：JSX 编译产物进入教学版运行时的第一站。
 */

export { jsx, jsxs, jsxDEV, Fragment } from './ReactJSX.js';
