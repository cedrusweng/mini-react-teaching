/**
 * 模块：shared/ReactSymbols
 * 作用：定义跨包复用的元素类型标签，作为 React Element 的 $$typeof 标识。
 * 上游调用：react/ReactElement.js、react/ReactJSX.js、reconciler/ReactFiber.js。
 * 下游影响：reconciler 读取 element.type 后推断 Fiber 的 tag。
 * 调用链位置：元素创建与 Fiber 分类的共同基础，不直接产生 DOM。
 */

// createElement / jsx 产出的普通元素统一带这个标识。
export const REACT_ELEMENT_TYPE = Symbol.for('react.element');

// 原始子节点被包装成文本元素，避免 reconciler 处理字符串或数字。
export const REACT_TEXT_ELEMENT_TYPE = Symbol.for('react.text');

// Fragment 是一种不对应宿主节点的特殊类型。
export const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
