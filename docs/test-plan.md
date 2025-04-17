# Electron项目测试方案实施文档

## 1. 项目测试架构概述

```
项目根目录
├── renderer/             # 前端源代码
│   └── __tests__/        # 前端单元测试
├── electron/             # 主进程代码
│   └── __tests__/        # 主进程单元测试
├── tests/
│   ├── unit/             # 通用单元测试
│   └── e2e/              # E2E测试
├── vitest.config.ts      # Vitest配置
└── playwright.config.ts  # Playwright配置
```

## 2. 单元测试实施方案

### 2.1 安装依赖

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom happy-dom
```

### 2.2 配置文件

创建 `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom', // 或 'jsdom'
    setupFiles: './tests/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/dist-electron/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

创建 `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟Electron环境
vi.mock('electron', () => ({
  ipcRenderer: {
    on: vi.fn(),
    once: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn().mockResolvedValue({}),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

// 模拟electron-store
vi.mock('electron-store', () => {
  const storeMock = {
    get: vi.fn(),
    set: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  };
  return { default: vi.fn(() => storeMock) };
});

// 模拟screenshot-desktop
vi.mock('screenshot-desktop', () => ({
  default: vi.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
}));
```

更新 `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

### 2.3 测试React组件

创建 `renderer/components/__tests__/YourComponent.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('渲染正确的内容', () => {
    render(<YourComponent title="测试标题" />);
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });

  it('点击按钮触发正确的操作', async () => {
    const handleClick = vi.fn();
    render(<YourComponent onAction={handleClick} />);

    const button = screen.getByRole('button', { name: /执行/i });
    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2.4 测试工具函数

创建 `renderer/utils/__tests__/helpers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime, parseCode } from '../helpers';

describe('辅助函数', () => {
  describe('formatTime', () => {
    it('正确格式化时间', () => {
      expect(formatTime(1000)).toBe('1s');
      expect(formatTime(60000)).toBe('1m');
      expect(formatTime(3661000)).toBe('1h 1m 1s');
    });
  });

  describe('parseCode', () => {
    it('正确解析代码段', () => {
      const result = parseCode('```js\nconst x = 1;\n```');
      expect(result).toEqual({
        language: 'js',
        code: 'const x = 1;'
      });
    });
  });
});
```

### 2.5 测试主进程代码

创建 `electron/__tests__/ConfigHelper.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigHelper } from '../ConfigHelper';
import Store from 'electron-store';

vi.mock('electron-store');

describe('ConfigHelper', () => {
  let configHelper;
  let mockStore;

  beforeEach(() => {
    // 清除所有模拟调用
    vi.clearAllMocks();

    mockStore = new Store();
    configHelper = new ConfigHelper();
    // 通过原型注入方式模拟属性
    Object.defineProperty(configHelper, 'store', {
      value: mockStore,
      writable: true
    });
  });

  it('getConfig应该返回配置值', () => {
    mockStore.get.mockReturnValue('test-value');
    const result = configHelper.getConfig('test-key');
    expect(mockStore.get).toHaveBeenCalledWith('test-key', undefined);
    expect(result).toBe('test-value');
  });

  it('setConfig应该设置配置值', () => {
    configHelper.setConfig('test-key', 'new-value');
    expect(mockStore.set).toHaveBeenCalledWith('test-key', 'new-value');
  });
});
```

### 2.6 测试IPC通信

创建 `renderer/utils/__tests__/ipc.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendToMain, listenToMain } from '../ipc';

// Electron的ipcRenderer已在setup.ts中模拟

describe('IPC通信', () => {
  const { ipcRenderer } = window.electron;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sendToMain应该调用ipcRenderer.invoke', async () => {
    const mockResponse = { success: true };
    ipcRenderer.invoke.mockResolvedValue(mockResponse);

    const result = await sendToMain('channel-name', { data: 'test' });

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('channel-name', { data: 'test' });
    expect(result).toEqual(mockResponse);
  });

  it('listenToMain应该添加和移除事件监听器', () => {
    const callback = vi.fn();
    const cleanup = listenToMain('event-name', callback);

    expect(ipcRenderer.on).toHaveBeenCalledWith('event-name', expect.any(Function));

    // 触发清理函数
    cleanup();

    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      'event-name',
      expect.any(Function)
    );
  });
});
```

## 3. E2E测试实施方案

### 3.1 安装依赖

```bash
npm install --save-dev @playwright/test playwright
```

### 3.2 配置文件

创建 `playwright.config.ts`:

```typescript
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.spec\.ts/,
      use: {
        // Electron特有配置
      },
    },
  ],
};

export default config;
```

创建 `tests/e2e/electronApp.ts` 用于启动Electron应用:

```typescript
import { _electron as electron } from 'playwright';
import type { ElectronApplication } from '@playwright/test';
import path from 'path';

export async function launchElectronApp(): Promise<ElectronApplication> {
  // 确保先构建应用
  const electronApp = await electron.launch({
    args: [path.join(__dirname, '../../dist-electron/main.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  // 等待应用加载完成
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  return electronApp;
}
```

更新 `package.json`:

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

### 3.3 基本E2E测试

创建 `tests/e2e/app.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { launchElectronApp } from './electronApp';
import type { ElectronApplication } from '@playwright/test';

test.describe('应用基本功能', () => {
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    electronApp = await launchElectronApp();
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('应用成功启动并显示正确标题', async () => {
    const window = await electronApp.firstWindow();
    const title = await window.title();
    expect(title).toBe('Interview Coder');
  });

  test('主界面包含预期元素', async () => {
    const window = await electronApp.firstWindow();

    // 验证页面主要元素存在
    await expect(window.locator('h1:has-text("Interview Coder")')).toBeVisible();
    await expect(window.locator('button:has-text("开始面试")')).toBeVisible();
  });
});
```

### 3.4 功能流程测试

创建 `tests/e2e/workflow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { launchElectronApp } from './electronApp';
import type { ElectronApplication } from '@playwright/test';

test.describe('用户流程测试', () => {
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    electronApp = await launchElectronApp();
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('完成基本面试流程', async () => {
    const window = await electronApp.firstWindow();

    // 1. 点击开始面试按钮
    await window.click('button:has-text("开始面试")');

    // 2. 等待面试准备页面加载
    await expect(window.locator('h2:has-text("准备面试")')).toBeVisible();

    // 3. 选择面试类型
    await window.click('button:has-text("算法题")');

    // 4. 填写面试信息
    await window.fill('input[name="position"]', '前端开发工程师');

    // 5. 开始面试
    await window.click('button:has-text("开始")');

    // 6. 验证面试页面已加载
    await expect(window.locator('div:has-text("面试进行中")')).toBeVisible();

    // 7. 验证计时器开始工作
    const timerText = await window.locator('.timer').textContent();
    expect(timerText).not.toBe('00:00:00');
  });
});
```

### 3.5 截图测试

创建 `tests/e2e/screenshot.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { launchElectronApp } from './electronApp';
import type { ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('截图功能测试', () => {
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    electronApp = await launchElectronApp();
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('触发截图功能', async () => {
    const window = await electronApp.firstWindow();

    // 模拟点击截图按钮或触发截图快捷键
    await window.click('button.screenshot-btn');

    // 等待截图完成的提示
    await expect(window.locator('div:has-text("截图已保存")')).toBeVisible({ timeout: 5000 });

    // 验证截图相关UI反馈
    await expect(window.locator('.screenshot-preview')).toBeVisible();
  });
});
```

## 4. 高级测试案例

### 4.1 测试状态管理和数据流

创建 `renderer/contexts/__tests__/AppContext.test.tsx`:

```typescript
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';

// 创建一个测试组件来使用context
const TestConsumer = () => {
  const { state, dispatch } = useAppContext();

  return (
    <div>
      <div data-testid="status">{state.status}</div>
      <button
        onClick={() => dispatch({ type: 'SET_STATUS', payload: 'active' })}
      >
        激活
      </button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('提供默认状态', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('正确处理状态更新', async () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await act(async () => {
      screen.getByRole('button', { name: '激活' }).click();
    });

    expect(screen.getByTestId('status').textContent).toBe('active');
  });
});
```

### 4.2 测试主进程与渲染进程通信

创建 `tests/unit/ipc-integration.test.ts`:

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendToMainAndWait } from '../../renderer/utils/ipc';

// 需要在vitest.config.ts中配置dom测试环境

describe('IPC集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 重新模拟ipcRenderer
    window.electron = {
      ipcRenderer: {
        invoke: vi.fn(),
        send: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        removeListener: vi.fn()
      }
    };
  });

  it('sendToMainAndWait应该发送请求并等待响应', async () => {
    const mockResponse = { success: true, data: 'response data' };
    window.electron.ipcRenderer.invoke.mockResolvedValue(mockResponse);

    const result = await sendToMainAndWait('test-channel', { id: 123 });

    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
      'test-channel',
      { id: 123 }
    );
    expect(result).toEqual(mockResponse);
  });
});
```

### 4.3 测试Electron主进程

创建 `electron/__tests__/ipcHandlers.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleScreenshot } from '../ipcHandlers';
import { captureScreenshot } from '../ScreenshotHelper';

// 模拟ScreenshotHelper
vi.mock('../ScreenshotHelper', () => ({
  captureScreenshot: vi.fn().mockResolvedValue({
    path: '/fake/path/screenshot.png',
    data: Buffer.from('fake-image-data')
  })
}));

describe('IPC处理程序', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleScreenshot应该捕获屏幕并返回结果', async () => {
    const event = {};
    const result = await handleScreenshot(event);

    expect(captureScreenshot).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      path: '/fake/path/screenshot.png',
      data: expect.any(Buffer)
    });
  });
});
```

## 5. CI/CD集成

### 5.1 GitHub Actions配置

创建 `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16.x]

    steps:
    - uses: actions/checkout@v3

    - name: 设置Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: 安装依赖
      run: npm ci

    - name: 运行单元测试
      run: npm test

    - name: 上传单元测试覆盖率报告
      uses: actions/upload-artifact@v3
      with:
        name: 单元测试覆盖率-${{ matrix.os }}
        path: coverage/

    - name: 安装Playwright浏览器
      run: npx playwright install --with-deps chromium

    - name: 构建应用
      run: npm run build

    - name: 运行E2E测试
      run: npm run test:e2e

    - name: 上传E2E测试报告
      uses: actions/upload-artifact@v3
      with:
        name: e2e-测试报告-${{ matrix.os }}
        path: playwright-report/
      if: always()
```

## 6. 最佳实践与建议

### 6.1 测试目录结构

```
tests/
├── unit/              # 通用单元测试
│   ├── common/        # 通用工具测试
│   ├── main/          # 主进程测试
│   └── renderer/      # 渲染进程测试
├── e2e/               # E2E测试
│   ├── fixtures/      # 测试数据
│   ├── utils/         # 测试工具函数
│   └── specs/         # 测试规范
└── setup/             # 测试配置文件
```

### 6.2 测试数据管理

创建 `tests/fixtures/mockData.ts`:

```typescript
export const mockUser = {
  id: '1',
  name: '测试用户',
  email: 'test@example.com'
};

export const mockInterviewData = {
  id: '123',
  title: '前端开发面试',
  questions: [
    {
      id: 'q1',
      text: '请解释React的虚拟DOM原理',
      expectedAnswer: '虚拟DOM是React的核心概念...'
    },
    {
      id: 'q2',
      text: '什么是闭包?',
      expectedAnswer: '闭包是指有权访问另一个函数作用域中变量的函数...'
    }
  ]
};
```

### 6.3 提高测试可维护性

创建 `tests/e2e/pages/HomePage.ts`:

```typescript
// 页面对象模式
import { Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async navigateTo() {
    // 在E2E测试中，可能需要通过UI操作回到主页
    await this.page.click('a:has-text("主页")');
  }

  async startInterview() {
    await this.page.click('button:has-text("开始面试")');
  }

  async selectInterviewType(type: 'technical' | 'algorithm' | 'behavioral') {
    const typeMap = {
      technical: '技术面试',
      algorithm: '算法面试',
      behavioral: '行为面试'
    };

    await this.page.click(`button:has-text("${typeMap[type]}")`);
  }

  async isLoaded() {
    return await this.page.locator('h1:has-text("Interview Coder")').isVisible();
  }
}
```

## 7. 实施计划

### 第一阶段：基础设置与单元测试

1. 安装单元测试依赖
2. 配置Vitest
3. 编写基础React组件测试
4. 编写工具函数测试
5. 编写状态管理测试

### 第二阶段：主进程测试

1. 模拟Electron环境
2. 测试ConfigHelper
3. 测试IPC通信处理程序
4. 测试截图功能

### 第三阶段：E2E测试

1. 安装Playwright
2. 配置Electron应用启动
3. 编写基本UI测试
4. 编写用户流程测试

### 第四阶段：集成与优化

1. 配置GitHub Actions工作流
2. 优化测试结构与共享代码
3. 实现测试报告生成
4. 配置测试覆盖率阈值

## 8. 总结

本方案提供了一个完整的Electron应用测试架构，覆盖了:
- 使用Vitest进行单元测试
- 使用Playwright进行E2E测试
- 测试Electron特有的主进程和渲染进程交互
- 实现高效的测试结构和最佳实践

通过实施这套测试方案，可以确保应用质量，加速开发迭代，降低引入bug的风险。

## 9. 当前测试开发进展

### 9.1 已完成的测试模块

#### 9.1.1 主进程模块测试

1. **ConfigHelper测试**
   - 已实现配置文件存在性检查
   - 已实现配置加载和保存功能测试
   - 已实现模拟Store实例测试
   - 已实现API密钥验证和提供商自动识别测试
   - 已测试配置更新事件
   - 已测试辅助方法（getOpacity, setOpacity, getLanguage, setLanguage）
   - 已测试事件处理机制

2. **autoUpdater测试**
   - 已实现自动更新器初始化测试
   - 已验证更新检查流程和事件处理
   - 已测试不同环境下的更新行为（打包和非打包环境）
   - 已验证IPC处理程序设置

3. **ScreenshotHelper测试**
   - 已实现视图管理功能测试（gallery/queue）
   - 已实现截图队列管理测试
   - 已实现额外截图队列管理测试
   - 已实现截图删除功能测试
   - 已实现队列清理功能测试
   - 部分测试仍存在文件系统模拟相关问题

4. **ProcessingHelper测试**
   - 已实现基本初始化测试
   - 已测试等待初始化功能
   - 已测试请求取消功能
   - 已测试信用额度获取功能
   - 部分测试仍存在配置加载相关问题

5. **ipcHandlers测试**
   - 已实现配置处理程序测试
   - 已实现截图处理程序测试
   - 已实现窗口管理处理程序测试
   - 已实现外部链接处理程序测试
   - 已实现截图触发处理程序测试
   - 已实现重置处理程序测试
   - 已实现窗口移动处理程序测试

6. **shortcuts测试**
   - 已实现全局快捷键注册测试
   - 已实现截图快捷键测试
   - 已实现处理快捷键测试
   - 已实现重置快捷键测试
   - 已实现窗口切换快捷键测试
   - 已实现窗口移动快捷键测试
   - 部分测试仍存在快捷键处理程序模拟问题

#### 9.1.2 渲染进程模块测试

1. **工具函数测试**
   - 已实现平台工具函数测试
   - 已实现UI工具函数测试
   - 已实现IPC通信测试

2. **React组件测试**
   - 已实现App组件测试
   - 已测试组件加载状态
   - 已测试条件渲染逻辑
   - 已测试事件监听器清理

### 9.2 测试覆盖率情况

当前测试覆盖率已显著提高，主要模块的测试覆盖情况如下：

1. **主进程模块**
   - ConfigHelper: ~90%
   - autoUpdater: ~85%
   - ipcHandlers: ~80%
   - ScreenshotHelper: ~70%
   - ProcessingHelper: ~60%
   - shortcuts: ~70%

2. **渲染进程模块**
   - 工具函数: ~85%
   - React组件: ~70%

### 9.3 测试过程中的挑战与解决方案

#### 9.3.1 模块模拟挑战

1. **Electron模块模拟**
   - 挑战：Electron模块在测试环境中不可用
   - 解决方案：使用vi.mock()创建模拟实现
   - 示例：
     ```typescript
     vi.mock('electron', () => ({
       app: {
         getPath: vi.fn().mockReturnValue("/mock/userData"),
         on: vi.fn(),
         quit: vi.fn()
       },
       dialog: {
         showMessageBox: vi.fn().mockResolvedValue({ response: 0 })
       }
     }));
     ```

2. **默认导出模拟问题**
   - 挑战：模拟包含默认导出的模块（如child_process, path等）
   - 解决方案：在mock实现中提供default属性
   - 示例：
     ```typescript
     vi.mock("node:fs", () => ({
       default: {
         existsSync: vi.fn().mockReturnValue(true),
         readFileSync: vi.fn().mockReturnValue(Buffer.from('test')),
         promises: {
           readFile: vi.fn().mockResolvedValue(Buffer.from('test')),
           writeFile: vi.fn().mockResolvedValue(undefined),
           unlink: vi.fn().mockResolvedValue(undefined)
         },
         unlink: vi.fn().mockImplementation((path, callback) => callback(null))
       }
     }));
     ```

3. **模拟模块提升问题**
   - 挑战：Vitest中vi.mock调用被提升到文件顶部，导致引用顺序问题
   - 解决方案：使用vi.spyOn替代直接mock模块
   - 示例：
     ```typescript
     const fsActual = await import('node:fs');
     const existsSyncSpy = vi.spyOn(fsActual, 'existsSync').mockReturnValue(true);
     const mkdirSyncSpy = vi.spyOn(fsActual, 'mkdirSync').mockImplementation(() => undefined);
     ```

4. **快捷键处理程序模拟**
   - 挑战：全局快捷键注册和处理程序测试
   - 解决方案：模拟globalShortcut模块并添加自定义方法获取处理程序
   - 示例：
     ```typescript
     const handlers = {};
     vi.mock('electron', () => ({
       globalShortcut: {
         register: vi.fn((accelerator, handler) => {
           handlers[accelerator] = handler;
           return true;
         }),
         unregister: vi.fn(),
         unregisterAll: vi.fn(),
         _getHandler: (accelerator) => handlers[accelerator]
       }
     }));
     ```

#### 9.3.2 进行中的测试改进

1. **简化测试实现**
   - 采用直接模拟global对象的方式简化测试
   - 专注于测试核心功能而非周边依赖
   - 使用更具体的模拟数据提高测试可靠性

2. **改进模块隔离**
   - 为每个测试模块创建独立的模拟环境
   - 避免测试间的依赖干扰
   - 在beforeEach中重置所有模拟状态

3. **模块独立测试**
   - 将大型模块分解为独立的功能点测试
   - 减少测试复杂度和维护成本
   - 使用更精确的断言提高测试质量

### 9.4 端到端测试进展

目前端到端测试遇到了一些挑战：

1. **应用窗口启动问题**
   - 挑战：测试中无法正确获取应用窗口
   - 错误：`electronApplication.firstWindow: Timeout 30000ms exceeded while waiting for event "window"`
   - 可能原因：应用启动配置问题或窗口创建延迟

2. **测试环境配置**
   - 已创建基本的应用功能测试
   - 已设置测试数据目录和应用启动配置
   - 需要解决窗口加载和初始化问题

### 9.5 下一步测试计划

1. **单元测试改进**
   - 修复ProcessingHelper测试中的配置加载问题
   - 改进ScreenshotHelper中的文件系统模拟
   - 优化shortcuts测试中的快捷键处理程序模拟

2. **端到端测试修复**
   - 解决应用窗口启动和加载问题
   - 调整测试超时设置和等待策略
   - 实现更可靠的应用状态检测

3. **测试覆盖率提升**
   - 为未覆盖的代码路径添加测试
   - 实现边缘情况和错误处理测试
   - 添加更多集成测试场景

4. **自动化测试流程**
   - 配置GitHub Actions工作流
   - 实现测试报告生成和分析
   - 设置测试覆盖率阈值和质量门禁