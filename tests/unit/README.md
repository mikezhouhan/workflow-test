# 单元测试 (Unit Tests)

本目录包含应用程序的所有单元测试，使用 Vitest 框架进行测试。

## 目录结构

```
tests/unit/
├── README.md                # 本文件
├── electron/                # 主进程相关测试
│   └── ConfigHelper.test.ts # 配置辅助类测试
├── src/                     # 渲染进程相关测试
│   └── utils/               # 实用工具函数测试
│       ├── ipc.test.ts      # IPC 通信测试
│       └── platform.test.ts # 平台工具测试
├── common/                  # 共享代码测试
├── main/                    # 主进程特定测试
└── renderer/                # 渲染进程特定测试
```

## 命名约定

- 测试文件: `*.test.ts` 或 `*.test.tsx`
- 模拟文件: `__mocks__/moduleName.ts`
- 测试工具: `test-utils.ts`

## 单元测试原则

1. **测试隔离** - 每个测试应该是完全独立的，不依赖于其他测试的状态
2. **模拟外部依赖** - 使用 `vi.mock()` 来模拟外部依赖，如文件系统、网络请求等
3. **单一责任** - 每个测试只测试一个功能点
4. **描述性命名** - 测试名称应清晰描述被测试的功能和预期结果

## 运行测试

```bash
# 运行所有单元测试
npm test

# 启动测试观察模式
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 使用UI界面运行测试
npm run test:ui
```

## 最佳实践

1. **使用 describe 和 it** - 组织测试为有逻辑的组
2. **使用 beforeEach/afterEach** - 设置和清理测试环境
3. **精确断言** - 断言应该精确，避免测试过多或过少
4. **测试边界条件** - 不只测试正常路径，还要测试边界和错误情况
5. **避免测试实现细节** - 关注组件/函数的行为，而不是实现细节 