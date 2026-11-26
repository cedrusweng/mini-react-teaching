/**
 * 模块：react/index
 * 作用：react 包的公共 API 聚合出口。
 * 上游调用：demo/main.js 等使用方。
 * 下游调用：ReactElement、ReactHooks、shared/ReactSharedInternals。
 * 调用链位置：用户代码通过它拿到 createElement 与 useState。
 */

export { createElement, ReactElement, isReactElement, createTextElement } from './ReactElement.js';
export { useState } from './ReactHooks.js';
export { ReactSharedInternals } from '../shared/ReactSharedInternals.js';
