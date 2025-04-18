# PRD: CodeInterviewAssist

## 1. Product overview
### 1.1 Document title and version
   - PRD: CodeInterviewAssist
   - Version: 1.0.0

### 1.2 Product summary
   CodeInterviewAssist 是一款免费、开源的 AI 驱动编程面试准备工具。该工具提供了类似付费编程面试平台的核心功能，但以免费、开源的形式呈现。用户可以使用自己的 OpenAI API 密钥，获得高级功能如 AI 驱动的问题分析、解决方案生成和调试辅助 - 所有这些都在本地计算机上运行。

   该应用程序具有 99% 的隐形窗口功能，能够绕过大多数屏幕捕获方法，使其成为面试准备的理想工具。它使用 OpenAI 的 API 处理截图并提供详细的编码问题分析和解决方案。

## 2. Goals
### 2.1 Business goals
   - 提供免费、开源的编程面试准备工具
   - 降低优质面试准备工具的准入门槛
   - 建立一个由社区驱动的平台，允许用户根据自己的需求定制和扩展功能
   - 为编程面试提供高质量的 AI 辅助，无需昂贵的订阅费

### 2.2 User goals
   - 获得高质量的编程面试问题分析和解决方案
   - 在面试实践中使用不被检测到的辅助工具
   - 使用 AI 辅助调试自己的代码
   - 获得算法复杂度分析，提高对解决方案效率的理解
   - 根据个人需求自定义工具

### 2.3 Non-goals
   - 不提供完整的付费商业服务或全面的用户支持
   - 不内置语音支持（需通过社区贡献添加）
   - 不追求财务收益或商业化
   - 不提供所有可能的编程语言支持（专注于主流语言）
   - 不提供内置的认证系统（用户使用自己的 API 密钥）

## 3. User personas
### 3.1 Key user types
   - 正在准备技术面试的求职者
   - 计算机科学/编程专业的学生
   - 需要提高算法解题能力的开发者
   - 想要练习编程问题的自学者
   - 不能承担付费面试准备工具费用的用户

### 3.2 Basic persona details
   - **技术面试求职者**：正在准备软件工程师职位面试的专业人士，需要隐形辅助工具
   - **CS 学生**：学习数据结构和算法的学生，需要实时反馈和详细解释
   - **经济预算有限的开发者**：无法承担昂贵面试准备平台费用的程序员，寻找经济实惠的替代方案
   - **自学者**：通过解决实际编程问题来提高技能的自学者，需要高质量分析和解决方案
   - **开源贡献者**：希望扩展工具功能的开发者

### 3.3 Role-based access
   - **所有用户**：可以使用所有功能，包括截图捕获、AI 分析、解决方案生成和调试
   - **开发者**：可以通过修改代码库来自定义应用程序，添加新功能，或集成其他 AI 模型

## 4. Functional requirements
   - **基础功能** (Priority: High)
     - 提供不被检测到的隐形窗口
     - 支持通过全局快捷键控制应用程序
     - 能够调整窗口不透明度、位置和大小
   - **截图功能** (Priority: High)
     - 捕获编程问题的文本和代码
     - 管理截图队列
     - 删除最后捕获的截图
   - **AI 分析** (Priority: High)
     - 使用 OpenAI API 分析截图内容
     - 提取问题要求
     - 生成问题分析
   - **解决方案生成** (Priority: High)
     - 生成详细的代码解决方案
     - 提供解决方案的思路说明
     - 分析时间和空间复杂度
   - **代码调试** (Priority: Medium)
     - 分析用户代码中的错误
     - 提供改进建议
     - 优化现有解决方案
   - **AI 模型选择** (Priority: Medium)
     - 支持选择不同的 OpenAI 模型 (GPT-4o, GPT-4o-mini)
     - 为不同处理阶段提供不同模型选项
   - **多语言支持** (Priority: Medium)
     - 支持多种编程语言
   - **窗口管理** (Priority: Medium)
     - 调整窗口大小
     - 移动窗口位置
     - 更改窗口不透明度
     - 缩放窗口内容

## 5. User experience
### 5.1. Entry points & first-time user flow
   - 用户下载并安装应用程序
   - 首次启动时，窗口默认隐形，用户使用 Ctrl+B/Cmd+B 切换可见性
   - 应用程序提示用户输入 OpenAI API 密钥
   - 用户完成设置后，系统显示欢迎界面和快捷键指南
   - 用户可以调整 AI 模型设置和首选编程语言

### 5.2. Core experience
   - **捕获问题**：用户面对一个编程问题，使用 Ctrl+H/Cmd+H 截取问题
     - 大小适中的截图提示，清晰指导用户如何捕获问题的不同部分
   - **处理信息**：按下 Ctrl+Enter/Cmd+Enter 分析截图
     - 用户界面显示处理进度和状态更新，保持用户了解情况
   - **查看解决方案**：系统生成解决方案，并显示详细分析
     - 清晰分离的区域展示问题陈述、代码解决方案、时间/空间复杂度
   - **调试代码**：用户可以截取自己的代码/错误消息进行调试
     - 系统提供结构化反馈，指出问题和改进方案

### 5.3. Advanced features & edge cases
   - 应用程序对多次截图进行智能处理，处理跨多个页面/屏幕的问题
   - 当 API 密钥失效或额度不足时的错误处理和通知
   - 处理不同窗口管理软件的兼容性问题
   - 在截图内容不清晰时提供反馈和建议
   - 允许用户切换解决方案和调试视图以管理复杂工作流程

### 5.4. UI/UX highlights
   - 极简主义界面，专注于内容
   - 暗色主题设计，减少在屏幕共享环境中的可见性
   - 可调整透明度的窗口，适应不同使用场景
   - 清晰的视觉反馈，指示应用程序状态
   - 易于访问的快捷键控制所有主要功能

## 6. Narrative
李明是一名即将毕业的计算机科学专业学生，正在准备技术面试。由于经济原因，他无法支付市场上流行的编程面试准备平台的订阅费用。他发现了 CodeInterviewAssist，这款开源工具让他只需支付最低限度的 API 使用费用，就能获得专业级的面试准备体验。当他参加模拟面试时，他可以使用隐形窗口功能捕获问题，获取 AI 分析和最佳解决方案，极大提高了他的学习效率和面试成功率。

## 7. Success metrics
### 7.1. User-centric metrics
   - 用户在一个会话中成功解决的问题数量
   - 截图到解决方案生成的平均时间
   - 用户调试功能使用频率
   - 用户提交的问题解决率
   - 用户对生成解决方案的采纳率

### 7.2. Business metrics
   - GitHub 项目获得的星标数量
   - 社区贡献和分支数量
   - 月活跃用户数（通过匿名使用统计）
   - 跨不同操作系统的活跃安装数
   - 项目文档和支持资源的访问量

### 7.3. Technical metrics
   - 应用程序启动时间
   - 截图处理性能
   - API 请求成功率
   - 在不同设备上的兼容性和稳定性
   - 系统资源使用情况（内存、CPU）

## 8. Technical considerations
### 8.1. Integration points
   - OpenAI API 集成（GPT-4o 和 GPT-4o-mini）
   - 操作系统截图 API
   - 全局快捷键系统
   - 窗口管理系统
   - 可能的其他 AI 模型 API（通过社区扩展）

### 8.2. Data storage & privacy
   - 用户 API 密钥存储在本地配置中
   - 截图临时存储在本地，不上传到远程服务器
   - 仅将必要信息发送到 OpenAI API 进行处理
   - 使用 Electron Store 安全存储配置
   - 不收集用户使用数据或个人信息

### 8.3. Scalability & performance
   - 优化大型截图处理
   - 确保在较慢设备上的性能
   - 限制 API 请求大小和频率以控制成本
   - 轻量级安装包和资源利用
   - 缓存结果以减少 API 请求次数

### 8.4. Potential challenges
   - OpenAI API 价格或政策变化
   - 在不同面试平台中的检测机制变化
   - 保持与最新 AI 模型的兼容性
   - 处理图像中复杂代码格式的挑战
   - 针对不同编程语言的解决方案准确性

## 9. Milestones & sequencing
### 9.1. Project estimate
   - Medium: 2-3 个月从概念到稳定版本

### 9.2. Team size & composition
   - 小型团队: 1-3 人
     - 1 名主要开发者
     - 1-2 名社区贡献者
     - 偶尔的设计和文档贡献者

### 9.3. Suggested phases
   - **Phase 1**: 核心功能开发（4 周）
     - 基础应用程序框架
     - 隐形窗口实现
     - 截图功能
     - OpenAI API 集成
   - **Phase 2**: 增强功能和 UI 改进（4 周）
     - 解决方案生成
     - 调试功能
     - UI/UX 改进
     - 多语言支持
   - **Phase 3**: 优化、测试和文档（4 周）
     - 性能优化
     - 跨平台测试
     - 完善文档
     - 社区反馈收集和改进

## 10. User stories
### 10.1. 设置应用程序
   - **ID**: US-001
   - **Description**: 作为用户，我想要设置应用程序并提供我的 OpenAI API 密钥，以便开始使用面试辅助功能。
   - **Acceptance criteria**:
     - 用户可以启动应用程序并访问设置面板
     - 用户可以输入并保存 OpenAI API 密钥
     - 系统验证 API 密钥有效性
     - 用户可以选择首选的代码语言
     - 用户可以为不同处理阶段选择 AI 模型

### 10.2. 截取编程问题
   - **ID**: US-002
   - **Description**: 作为用户，我想要截取编程问题的文本和代码，以便 AI 可以分析问题。
   - **Acceptance criteria**:
     - 用户可以使用全局快捷键（Ctrl+H/Cmd+H）捕获屏幕截图
     - 截图被添加到队列中（最多 2 张）
     - 用户可以查看已捕获的截图
     - 用户可以使用全局快捷键（Ctrl+L/Cmd+L）删除最后一张截图
     - 系统提供截图已添加的视觉反馈

### 10.3. 处理编程问题
   - **ID**: US-003
   - **Description**: 作为用户，我想要处理已捕获的截图，以便获得问题分析和解决方案。
   - **Acceptance criteria**:
     - 用户可以使用全局快捷键（Ctrl+Enter/Cmd+Enter）开始处理
     - 系统显示处理状态指示器
     - AI 提取问题内容和要求
     - 系统在处理完成后自动切换到解决方案视图
     - 处理错误时系统提供清晰反馈

### 10.4. 查看解决方案
   - **ID**: US-004
   - **Description**: 作为用户，我想要查看生成的解决方案，以便理解如何解决编程问题。
   - **Acceptance criteria**:
     - 系统显示格式化的问题陈述
     - 系统显示带有语法高亮的代码解决方案
     - 系统显示解决方案的思路说明
     - 系统显示时间和空间复杂度分析
     - 用户可以复制解决方案代码

### 10.5. 调试代码
   - **ID**: US-005
   - **Description**: 作为用户，我想要上传我的代码和错误信息进行调试，以便获得改进建议。
   - **Acceptance criteria**:
     - 用户可以截图自己的代码/错误消息
     - 用户可以启动调试分析过程
     - 系统识别代码中的问题和错误
     - 系统提供具体的修复和改进建议
     - 系统提供优化的代码版本

### 10.6. 管理窗口可见性
   - **ID**: US-006
   - **Description**: 作为用户，我想要控制应用程序窗口的可见性，以便在面试环境中隐藏辅助工具。
   - **Acceptance criteria**:
     - 用户可以使用全局快捷键（Ctrl+B/Cmd+B）切换窗口可见性
     - 隐形模式在大多数屏幕共享软件中不可见
     - 用户可以使用全局快捷键移动窗口位置
     - 用户可以调整窗口不透明度
     - 用户可以缩放窗口内容

### 10.7. 重置和开始新问题
   - **ID**: US-007
   - **Description**: 作为用户，我想要清除当前问题并开始新问题，以便连续分析多个面试问题。
   - **Acceptance criteria**:
     - 用户可以使用全局快捷键（Ctrl+R/Cmd+R）重置应用程序状态
     - 系统清除当前截图和解决方案
     - 系统返回到截图队列视图
     - 用户数据和设置保持不变
     - 系统为新问题准备就绪

### 10.8. 自定义编程语言
   - **ID**: US-008
   - **Description**: 作为用户，我想要选择编程语言，以便得到针对特定语言的解决方案。
   - **Acceptance criteria**:
     - 用户可以从支持的语言列表中选择
     - 系统记住用户的语言选择
     - 生成的解决方案使用所选语言
     - 语法高亮正确应用于所选语言
     - 语言选择在会话间保持

### 10.9. 更新 API 设置
   - **ID**: US-009
   - **Description**: 作为用户，我想要更新我的 API 设置和模型选择，以便优化性能和成本。
   - **Acceptance criteria**:
     - 用户可以随时访问设置面板
     - 用户可以更改 API 密钥
     - 用户可以为不同处理阶段选择不同 AI 模型
     - 系统验证并保存新设置
     - 系统应用新设置而无需重启应用程序

### 10.10. 复制生成的代码
   - **ID**: US-010
   - **Description**: 作为用户，我想要复制生成的代码解决方案，以便在我的编辑器中使用。
   - **Acceptance criteria**:
     - 每个代码块有明显的复制按钮
     - 点击复制按钮将代码复制到剪贴板
     - 系统提供复制成功的视觉反馈
     - 复制不包含不必要的格式或注释
     - 复制功能适用于所有代码部分（解决方案和调试）

## 11. 待实现功能
以下是可能添加到 CodeInterviewAssist 的功能增强：

### 11.1. 重要性高的功能
- **语音识别集成**
  - 集成 OpenAI Whisper 或其他语音识别 API，支持语音输入问题
  - 允许用户通过语音命令控制应用程序
  - 为听力障碍用户提供辅助功能

- **实时代码协作**
  - 添加多用户协作功能，允许用户与导师或同学一起解决问题
  - 实现实时代码共享和注释
  - 添加语音/视频通话集成用于讨论

- **本地 LLM 支持**
  - 添加离线 LLM 支持，如通过 llama.cpp 运行的模型
  - 实现完全离线工作流程，无需互联网连接
  - 支持自托管和完全私有化部署

### 11.2. 重要性中等的功能
- **代码执行环境**
  - 内置轻量级代码执行环境，测试生成的解决方案
  - 支持常见编程语言的测试用例运行
  - 提供运行时性能分析

- **问题库和进度跟踪**
  - 创建常见编程问题库，按难度和类型分类
  - 实现用户进度跟踪和推荐系统
  - 添加学习路径和技能提升建议

- **面试模拟模式**
  - 计时模式，模拟真实面试时间限制
  - 模拟面试官问题和跟进问题
  - 提供面试反馈和改进建议

### 11.3. 提升用户体验的功能
- **UI 主题和定制**
  - 添加多种 UI 主题选项
  - 允许用户自定义界面布局
  - 支持键盘快捷键定制

- **扩展的模型支持**
  - 添加对 Claude、Deepseek 等其他 LLM 的支持
  - 实现模型性能比较功能
  - 添加特定领域优化的提示模板

- **社区功能**
  - 添加解决方案共享平台
  - 实现用户贡献的提示和模板库
  - 建立问题和解决方案评分系统

### 11.4. 技术增强
- **优化的截图处理**
  - 改进图像预处理以提高文本识别质量
  - 添加自动区域检测算法
  - 支持更多屏幕布局和格式

- **高级隐形模式**
  - 开发更高级的窗口隐藏技术
  - 实现与最新屏幕共享软件的兼容性
  - 添加动态自适应隐形技术

- **性能优化**
  - 实现更高效的 API 请求管理
  - 添加智能缓存系统减少 API 调用
  - 优化应用程序启动时间和内存使用 