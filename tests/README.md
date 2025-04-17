# 测试目录 (Tests Directory)

本目录包含应用程序的所有测试代码和测试配置。

## 目录结构

```
tests/
├── README.md       # 本文件
├── e2e/            # 端到端测试
├── unit/           # 单元测试
├── setup/          # 测试设置工具和配置
├── setup.ts        # 全局测试设置
└── global.d.ts     # 测试全局类型定义
```

## 测试策略

我们的测试策略分为以下几个层次：

1. **单元测试 (Unit Tests)**
   - 位置: `tests/unit/`
   - 工具: Vitest
   - 目的: 验证独立组件和函数的正确性
   - 范围: 小型、独立、快速执行的测试

2. **端到端测试 (E2E Tests)**
   - 位置: `tests/e2e/`
   - 工具: Playwright
   - 目的: 验证完整的用户流程和应用行为
   - 范围: 覆盖真实用户场景的大型测试
   - **重要**: E2E测试必须使用单个worker运行，详见 `e2e/README.md`

## 测试文件命名约定

- 单元测试文件: `*.test.ts` 或 `*.test.tsx`
- 端到端测试文件: `*.spec.ts`
- 测试辅助工具: `*Helper.ts` 或 `*Utils.ts`

## 运行测试

```bash
# 运行单元测试
npm test

# 运行端到端测试
npm run e2e

# 查看完整测试命令
grep "test\|e2e" package.json
```

## 重要注意事项

### E2E测试的Worker限制

Electron应用的E2E测试**必须**限制为单个worker（已在 `playwright.config.ts` 中设置）。

这是因为Electron应用通常:
1. 使用单例模式，防止多个实例同时运行
2. 使用固定端口进行进程间通信
3. 访问相同的系统资源，如配置文件

尝试并行运行多个Electron实例会导致资源冲突和不可预测的测试失败。

## 测试最佳实践

1. **保持测试独立** - 测试不应相互依赖
2. **合适的测试粒度** - 单元测试针对小功能点，E2E测试针对用户流程
3. **清晰的测试描述** - 使用描述性的测试名称
4. **模拟外部依赖** - 在单元测试中模拟外部系统
5. **避免测试实现细节** - 专注于测试公共API和用户可见行为

## 测试资源

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices) 