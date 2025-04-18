# 端到端测试 (E2E Tests)

本目录包含应用程序的所有端到端测试，使用 Playwright 框架对 Electron 应用进行自动化测试。

## 目录结构

```
tests/e2e/
├── README.md                # 本文件
├── app.spec.ts              # 应用基本功能测试
├── workflow.spec.ts         # 用户工作流程测试
├── electronApp.ts           # Electron 应用测试工具函数
├── pages/                   # 页面对象模式实现
│   └── HomePage.ts          # 主页页面对象
├── fixtures/                # 测试数据和模拟
├── specs/                   # 其他特定功能测试
├── utils/                   # 测试工具函数
├── screenshots/             # 截图存储目录
│   ├── artifacts/           # 正常测试截图
│   ├── failures/            # 测试失败时的截图
│   ├── snapshots/           # Playwright 快照比对
│   └── videos/              # 测试视频录制
└── test-results/            # Playwright 测试结果
```

## 命名约定

- 测试文件: `*.spec.ts`
- 页面对象: `pages/Name.ts`
- 工具函数: `utils/name.ts`
- 截图格式: `[日期时间]-[描述].png`

## 重要配置说明

### Worker 限制

E2E 测试**必须**限制为单个 worker（在 `playwright.config.ts` 中设置 `workers: 1`）。这是由于：

1. **单例应用限制** - Electron 应用通常设计为单例模式，多个实例会导致锁争用
2. **资源冲突** - 多个 Electron 实例可能争用相同的端口、文件等资源
3. **屏幕截图混乱** - 多个测试同时运行会导致截图捕获错误的窗口状态
4. **性能问题** - 多个 Electron 实例同时运行会消耗大量系统资源，影响测试稳定性

即使在 CI 环境中，也应保持此限制。虽然这会使测试执行较慢，但可确保测试结果的可靠性和稳定性。

## 截图策略

我们的截图策略遵循以下原则：

1. **正常截图** - 保存在 `screenshots/artifacts/` 目录中，包含时间戳和描述性名称
2. **失败截图** - 保存在 `screenshots/failures/` 目录中，自动捕获测试失败时的状态
3. **快照比对** - 保存在 `screenshots/snapshots/` 目录中，用于视觉回归测试

## 运行测试

```bash
# 运行所有 E2E 测试
npm run e2e

# 使用 UI 模式运行测试
npm run e2e:ui

# 查看测试报告
npm run e2e:report

# 清理测试截图和结果
npm run e2e:clean
```

## 当前测试进展

### 实现的测试

目前已经实现了以下端到端测试：

1. **应用基本功能测试** (`app.spec.ts`)
   - 测试应用启动和标题显示
   - 测试主界面元素存在

2. **用户工作流程测试** (`workflow.spec.ts`)
   - 测试基本面试流程
   - 测试面试准备和进行页面

### 当前挑战

目前端到端测试遇到了一些挑战：

1. **应用窗口启动问题**
   - 错误：`electronApplication.firstWindow: Timeout 30000ms exceeded while waiting for event "window"`
   - 可能原因：应用启动配置问题或窗口创建延迟
   - 解决方向：调整应用启动参数和等待策略

2. **测试数据目录管理**
   - 已创建临时测试数据目录，但需要更好的清理机制
   - 需要确保测试之间的数据隔离

3. **测试稳定性问题**
   - 测试在不同环境下的稳定性差异
   - 需要改进等待策略和错误恢复机制

### 下一步计划

1. **解决窗口启动问题**
   - 调整 `electronApp.ts` 中的启动参数
   - 增加窗口创建的超时时间
   - 添加更详细的日志输出以追踪问题

2. **实现截图功能测试**
   - 完成 `screenshot.spec.ts` 测试文件
   - 测试截图按钮和快捷键功能
   - 验证截图保存和预览

3. **改进页面对象模式**
   - 完善 `pages/` 目录中的页面对象
   - 将常用交互封装为可复用方法
   - 添加状态检测和等待方法

## 最佳实践

1. **使用页面对象模式** - 将页面交互封装在页面对象中，避免测试代码重复
2. **独立测试** - 每个测试应该是独立的，不依赖于其他测试的结果
3. **错误处理** - 添加适当的错误处理和超时设置，使测试更加稳健
4. **描述性命名** - 使用清晰、描述性的名称命名测试、截图和函数
5. **最小化断言** - 在 E2E 测试中，尽量减少断言数量，聚焦于主要流程
6. **单一职责** - 每个测试应专注于验证单一功能或用户流程
7. **添加重试机制** - 对于不稳定的测试，添加适当的重试机制
8. **捕获详细日志** - 在测试失败时收集足够的信息以帮助调试