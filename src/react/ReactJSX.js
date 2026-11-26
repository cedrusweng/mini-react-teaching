/**
 * 模块：react/ReactJSX
 * 作用：实现自动 JSX runtime，让编译器生成的 jsx/jsxs 调用落到 createElement。
 * 上游调用：编译后的 JSX 代码（jsx-runtime.js 负责导出）。
 * 下游调用：react/ReactElement.createElement。
 * 调用链位置：jsx/jsxs → createElement → ReactElement。
 */

import { createElement } from './ReactElement.js';
import { REACT_FRAGMENT_TYPE } from '../shared/ReactSymbols.js';

/**
 * 把 JSX 的 config 参数拆成 props 与 children，再交给 createElement。
 * 说明：key 由编译器通过第三个参数传入，这里回填到 props.key。
 */
function createJsxElement(type, config, maybeKey) {
  const props = { ...config };
  if (maybeKey !== undefined && maybeKey !== null) {
    props.key = maybeKey;
  }
  const children = props.children;
  delete props.children;
  return createElement(type, props, children);
}

export const jsx = createJsxElement;
export const jsxs = createJsxElement;
export const jsxDEV = createJsxElement;

// Fragment 只是一个类型标签，由 shared/ReactSymbols 提供。
export const Fragment = REACT_FRAGMENT_TYPE;
