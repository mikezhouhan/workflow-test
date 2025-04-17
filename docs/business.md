# Interview Coder商业化代码分析

本文档总结了项目中与商业化相关的代码，这些代码在开源版本中被移除或修改。

## 用户认证与账户系统

### Supabase 认证集成

原始代码使用Supabase进行用户认证和账户管理，但在开源版本中这些功能被移除：

1. **认证API被清空** (`renderer/lib/supabase.ts`)
   - 原始文件包含与Supabase交互的真实实现
   - 现在被替换为返回模拟数据的空方法
   - 移除了Google登录功能

2. **认证相关的类型定义**
   - `renderer/types/global.d.ts` 包含 `__AUTH_TOKEN__` 全局变量
   - `renderer/env.d.ts` 和 `renderer/types/electron.d.ts` 中包含认证相关接口

3. **电子主进程中的认证处理**
   - `electron/main.ts` 中移除了认证回调处理：
     ```typescript
     // Auth callback removed as we no longer use Supabase authentication
     ```
   - 移除了协议处理中的认证相关代码
   - 注释表明"no longer using auth callbacks"（不再使用认证回调）

### 登录页面

订阅页面 (`renderer/_pages/SubscribePage.tsx`) 表明原始应用包含:
- 用户登录系统
- 账户管理功能
- 登出功能

## 订阅与支付系统

### 订阅页面和逻辑

`renderer/_pages/SubscribePage.tsx` 包含以下商业化功能：
- 显示订阅页面，价格为$60/月
- 处理用户订阅事件 (`handleSubscribe`)
- 用户注销功能 (`handleSignOut`)

### 订阅门户

电子API接口中定义了订阅相关功能：
- `openSubscriptionPortal` - 打开订阅支付页面
- `onSubscriptionPortalClosed` - 订阅门户关闭时的回调
- `onSubscriptionUpdated` - 订阅更新时的回调

### 功能比较

README.md文件中包含了付费版与开源版的功能比较：

| 功能 | 付费工具 | 开源版本 |
|---------|------------------------|----------------------------------------|
| 价格 | $60/月订阅 | 免费 (只需支付API使用费) |
| 认证系统 | 需要 | 无 (简化) |
| 支付处理 | 需要 | 无 (使用自己的API密钥) |
| 隐私 | 服务器处理 | 100%本地处理 |

## 积分系统

原始应用采用了基于积分的使用限制系统：

1. **积分管理API**
   - `decrementCredits()` - 减少用户积分
   - `setInitialCredits(credits: number)` - 设置初始积分
   - `onCreditsUpdated(callback)` - 积分更新时的回调
   - `onOutOfCredits(callback)` - 积分用尽时的回调

2. **积分显示**
   - 多个组件中显示用户当前积分
   - 在 `App.tsx` 中，积分系统被绕过并设置为无限制：
     ```typescript
     // 设置无限积分
     const updateCredits = useCallback(() => {
       setCredits(999) // 此版本中没有积分限制
       window.__CREDITS__ = 999
     }, [])
     ```

3. **IPC处理程序**
   - `electron/ipcHandlers.ts` 中包含积分相关的处理程序
   - 原始实现可能与Supabase或其他服务同步积分情况

## 其他商业化功能

### API密钥验证

开源版本将付费API替换为需要用户提供自己的API密钥：
- `electron/ConfigHelper.ts` 包含API密钥配置和验证
- 支持OpenAI服务提供商
- 检查API密钥格式并进行验证

### 自动更新

应用包含自动更新功能：
- `startUpdate()` - 开始更新流程
- `installUpdate()` - 安装更新
- `onUpdateAvailable` 和 `onUpdateDownloaded` - 更新事件回调

## 商业化流程分析

基于代码分析，原始应用的商业化流程如下：

1. **用户注册/登录**
   - 通过Supabase进行账户管理
   - 支持Google OAuth登录

2. **订阅流程**
   - 新用户被引导至订阅页面
   - 订阅价格为$60/月
   - 完成支付后获得服务访问权

3. **积分系统**
   - 用户操作消耗积分
   - 积分可能与订阅等级相关联
   - 积分耗尽时触发相应提示

4. **功能限制**
   - 非订阅用户无法访问主要功能
   - `SubscribedApp` 组件仅对订阅用户显示

## 开源版本的修改

开源版本对商业化代码进行了以下修改：

1. **移除认证依赖**
   - 清空 `supabase.ts` 文件
   - 保留接口结构但返回空数据
   - 移除电子主进程中的认证回调处理

2. **绕过积分限制**
   - 设置固定的高积分值 (999)
   - 移除积分检查逻辑

3. **替换API集成**
   - 要求用户提供自己的OpenAI API密钥
   - 添加API密钥验证和配置

4. **界面修改**
   - 用API密钥配置界面替代登录/注册界面
   - 移除订阅相关提示和限制 