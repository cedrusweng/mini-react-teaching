# Mini React 教学版

一个零依赖、可直接在浏览器运行的极简 React 模型，用来说明 React 源码中核心模块的职责与调用关系。

## 运行

```bash
npm start
# 打开 http://localhost:5173
```

## 目录与职责

```text
src/
  shared/       元素类型标签、Feature Flags、跨包共享的内部状态
  react/        对外 API：createElement、jsx、useState
  react-dom/    宿主层：createRoot、事件系统、DOM 操作
  reconciler/   Fiber 协调：workLoop、beginWork、completeWork、commitWork
  scheduler/    任务队列与微任务调度
  demo/         演示入口与页面样式
```

## 调用关系

`createElement / jsx` → `ReactElement` → `createRoot` → `createContainer` → `createFiberRoot` → `updateContainer` → `scheduleUpdateOnFiber` → `Scheduler` → `workLoop` → `beginWork / completeWork` → `commitRoot` → `HostConfig` → DOM。

点击事件经过 `ReactDOMEventListener` 找到对应 Fiber，执行 `onClick`；回调中的 `setState` 走 `dispatchSetState` → `scheduleUpdateOnFiber`，回到同一条更新链。

## 设计文档

- [协调器技术设计文档（HTML）](协调器设计.html) — 内嵌上下文图、用例图、时序图、流程图与算法
- [协调器技术设计文档（Markdown）](docs/requirements/REQ-20261125-001-协调器设计/技术设计文档.md) — 可评审的源文档
- [协调器动画演示](reconciler-animation.html) — 分步观察 workLoop、beginWork、completeWork 与 commitRoot
