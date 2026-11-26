/**
 * 模块：react/ReactElement
 * 作用：把 JSX/createElement 的入参规范化为统一的 React Element 对象。
 * 上游调用：react/index.js、react/ReactJSX.js。
 * 下游调用：reconciler/ReactFiberBeginWork.js 读取 type/key/props 创建 Fiber。
 * 调用链位置：createElement 或 jsx → ReactElement → Fiber。
 */

import { REACT_ELEMENT_TYPE, REACT_TEXT_ELEMENT_TYPE } from '../shared/ReactSymbols.js';

/**
 * 元素工厂：给对象打上 $$typeof，标记它是合法 React Element。
 * 调用方：createElement、createTextElement。
 */
export function ReactElement(type, key, props) {
  return { $$typeof: REACT_ELEMENT_TYPE, type, key, props, _owner: null };
}

/**
 * 判定一个值是否由本模块创建，供子节点规范化使用。
 * 调用方：createElement、ReactFiberBeginWork.normalizeChild。
 */
export function isReactElement(value) {
  return typeof value === 'object' && value !== null && value.$$typeof === REACT_ELEMENT_TYPE;
}

/**
 * 把字符串/数字子节点包装成文本元素，避免 reconciler 处理原始值。
 * 调用方：createElement、ReactFiberBeginWork.normalizeChild。
 */
export function createTextElement(content) {
  return ReactElement(REACT_TEXT_ELEMENT_TYPE, null, { content: String(content) });
}

/**
 * 经典 createElement 入口，也是 JSX 编译产物调用的函数。
 * 步骤：1) key/ref 不进入 props；2) 拍平并规范化 children；
 *       3) 交给 ReactElement 生成最终元素。
 */
export function createElement(type, config, ...children) {
  const props = {};
  if (config !== null && config !== undefined) {
    for (const key of Object.keys(config)) {
      // key/ref 是 React 元信息，不应作为宿主属性传递。
      if (key !== 'key' && key !== 'ref') {
        props[key] = config[key];
      }
    }
  }

  const normalizedChildren = children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && typeof child !== 'boolean')
    // 数组与原始值统一转换为 Element，reconciler 只需处理一种形状。
    .map((child) => (isReactElement(child) ? child : createTextElement(child)));

  // 单个子节点直接赋值，多个子节点保持数组。
  if (normalizedChildren.length === 1) {
    props.children = normalizedChildren[0];
  } else if (normalizedChildren.length > 1) {
    props.children = normalizedChildren;
  }

  const key = config && config.key !== undefined && config.key !== null ? String(config.key) : null;
  return ReactElement(type, key, props);
}
