# Interview Coder项目结构

## 项目概述
这是一个基于Electron的桌面应用程序，用于帮助用户在面试过程中通过截图和AI处理来解决编程问题。

## 目录结构

### electron/ - Electron主进程代码
Electron的主进程代码，负责处理底层功能如窗口管理、截图处理等。

#### main.ts
主进程入口文件，负责初始化应用程序、创建窗口和设置IPC通信。

**主要函数：**
- `initializeHelpers()` - 初始化各种帮助类
- `createWindow()` - 创建主应用窗口
- `handleWindowMove()` - 处理窗口移动事件
- `handleWindowResize()` - 处理窗口调整大小事件
- `handleWindowClosed()` - 处理窗口关闭事件
- `hideMainWindow()` - 隐藏主窗口
- `showMainWindow()` - 显示主窗口
- `toggleMainWindow()` - 切换主窗口的显示状态
- `moveWindowHorizontal()` - 水平移动窗口
- `moveWindowVertical()` - 垂直移动窗口
- `setWindowDimensions()` - 设置窗口尺寸
- `loadEnvVariables()` - 加载环境变量
- `initializeApp()` - 初始化应用程序
- 各种getter和setter函数用于状态管理

#### ProcessingHelper.ts
截图处理和AI处理的核心类，负责与OpenAI API通信。

**主要函数：**
- `ProcessingHelper.constructor()` - 初始化处理帮助程序
- `ProcessingHelper.initializeAIClient()` - 初始化AI客户端
- `ProcessingHelper.waitForInitialization()` - 等待应用初始化
- `ProcessingHelper.getCredits()` - 获取用户积分
- `ProcessingHelper.getLanguage()` - 获取编程语言设置
- `ProcessingHelper.processScreenshots()` - 处理截图的主函数
- `ProcessingHelper.processScreenshotsHelper()` - 处理截图的辅助函数
- `ProcessingHelper.generateSolutionsHelper()` - 生成解决方案的辅助函数
- `ProcessingHelper.processExtraScreenshotsHelper()` - 处理额外截图的辅助函数
- `ProcessingHelper.cancelOngoingRequests()` - 取消正在进行的请求

#### ScreenshotHelper.ts
处理截图相关功能的辅助类。

**主要函数：**
- 截图捕获和管理相关函数

#### ConfigHelper.ts
配置管理辅助类，负责存储和检索用户配置。

**主要函数：**
- 加载、更新和验证配置的函数

#### ipcHandlers.ts
管理渲染进程与主进程之间的IPC通信。

**主要函数：**
- `initializeIpcHandlers()` - 初始化IPC处理程序，包括：
  - 配置处理程序
  - 积分处理程序
  - 截图队列处理程序
  - 窗口尺寸处理程序
  - 截图管理处理程序
  - 外部URL处理程序
  - 窗口管理处理程序

#### shortcuts.ts
管理全局键盘快捷键。

**主要函数：**
- 注册和处理全局快捷键的函数

#### preload.ts
预加载脚本，为渲染进程提供安全的API。

**主要函数：**
- 暴露安全API给渲染进程的函数

#### autoUpdater.ts
管理应用程序自动更新。

**主要函数：**
- 自动更新检测和安装的函数

#### store.ts
持久化数据存储。

**主要函数：**
- 数据存储和检索的函数

### renderer/ - 前端代码
React前端应用代码，负责用户界面。

#### App.tsx
前端应用的主入口组件。

**主要函数：**
- React组件和路由定义

#### _pages/ - 页面组件
包含应用的主要页面。

- **Debug.tsx** - 调试页面，用于调试问题解决方案
- **Queue.tsx** - 队列页面，显示和管理截图队列
- **Solutions.tsx** - 解决方案页面，显示AI生成的解决方案
- **SubscribePage.tsx** - 订阅页面
- **SubscribedApp.tsx** - 已订阅用户的应用入口

#### components/ - UI组件
包含可重用的UI组件。

##### ui/ - 基础UI组件
- **button.tsx** - 按钮组件
- **card.tsx** - 卡片组件
- **dialog.tsx** - 对话框组件
- **input.tsx** - 输入组件
- **toast.tsx** - 提示组件

##### shared/ - 共享组件
共享使用的组件。

##### Header/ - 头部组件
应用头部导航组件。

##### Queue/ - 队列相关组件
用于显示和管理截图队列的组件。

##### Settings/ - 设置相关组件
用于管理应用设置的组件。

##### Solutions/ - 解决方案相关组件
用于显示和管理解决方案的组件。

#### contexts/ - React上下文
- **toast.tsx** - 提示上下文，用于管理应用内提示

#### lib/ - 工具库
包含各种工具函数和库。

#### utils/ - 实用工具
包含各种实用工具函数。

#### types/ - 类型定义
TypeScript类型定义文件。

### 其他文件

#### vite.config.ts
Vite构建配置。

#### tailwind.config.js
Tailwind CSS配置。

#### package.json
项目依赖和脚本配置。

#### tsconfig.json
TypeScript配置。 