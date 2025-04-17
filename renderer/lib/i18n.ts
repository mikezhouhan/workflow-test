import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import path from 'path';

// 不要在生产环境中使用下面的翻译对象，这里只是示例
// 实际使用时应从本地文件或后端加载翻译
const resources = {
  en: {
    translation: {
      // 通用UI元素
      'app.title': 'Interview Coder',
      'app.welcome': 'Welcome to Interview Coder',
      'button.cancel': 'Cancel',
      'button.confirm': 'Confirm',
      'button.save': 'Save',
      'toast.success': 'Success',
      'toast.error': 'Error',
      
      // 设置
      'settings.title': 'Settings',
      'settings.api_key': 'OpenAI API Key',
      'settings.language': 'Language',
      'settings.language.english': 'English',
      'settings.language.chinese': 'Chinese',
      'settings.model': 'AI Model',
      
      // 队列
      'queue.title': 'Screenshot Queue',
      'queue.empty': 'No screenshots in queue',
      'queue.processing': 'Processing screenshots...',
      
      // 解决方案
      'solution.title': 'Solution',
      'solution.complexity': 'Time & Space Complexity',
      'solution.approach': 'Approach',
      'solution.code': 'Code Solution',
      
      // 调试
      'debug.title': 'Debug',
      'debug.analyze': 'Analyze Code',
      'debug.issues': 'Issues Found',
      'debug.suggestions': 'Suggestions',
      
      // 错误消息
      'error.api_key_invalid': 'Your OpenAI API key appears to be invalid',
      'error.processing_failed': 'Failed to process screenshots',
    }
  },
  'zh-CN': {
    translation: {
      // 通用UI元素
      'app.title': '面试编码助手',
      'app.welcome': '欢迎使用面试编码助手',
      'button.cancel': '取消',
      'button.confirm': '确认',
      'button.save': '保存',
      'toast.success': '成功',
      'toast.error': '错误',
      
      // 设置
      'settings.title': '设置',
      'settings.api_key': 'OpenAI API密钥',
      'settings.language': '语言',
      'settings.language.english': '英文',
      'settings.language.chinese': '中文',
      'settings.model': 'AI模型',
      
      // 队列
      'queue.title': '截图队列',
      'queue.empty': '队列中没有截图',
      'queue.processing': '正在处理截图...',
      
      // 解决方案
      'solution.title': '解决方案',
      'solution.complexity': '时间与空间复杂度',
      'solution.approach': '解题思路',
      'solution.code': '代码解决方案',
      
      // 调试
      'debug.title': '调试',
      'debug.analyze': '分析代码',
      'debug.issues': '发现的问题',
      'debug.suggestions': '改进建议',
      
      // 错误消息
      'error.api_key_invalid': '您的OpenAI API密钥似乎无效',
      'error.processing_failed': '处理截图失败',
    }
  }
};

// 示例默认翻译（应急使用）
const fallbackResources = {
  en: {
    translation: {
      // 通用UI元素
      'app.title': 'Interview Coding Assistant',
      'app.welcome': 'Welcome to Interview Coding Assistant',
      'app.initializing': 'Initializing...',
      'app.please_wait': 'Please wait while the application sets up',
      'app.version': 'Version',
      
      // 按钮
      'button.cancel': 'Cancel',
      'button.confirm': 'Confirm',
      'button.save': 'Save',
      'button.apply': 'Apply',
      'button.close': 'Close',
      'button.back': 'Back',
      'button.next': 'Next',
      'button.delete': 'Delete',
      'button.add': 'Add',
      'button.analyze': 'Analyze',
      'button.process': 'Process',
      'button.copy': 'Copy',
      'button.reset': 'Reset',
      'button.logout': 'Logout',
      
      // 通知
      'toast.success': 'Success',
      'toast.error': 'Error',
      'toast.warning': 'Warning',
      'toast.info': 'Info',
      
      // 设置
      'settings.title': 'Settings',
      'settings.api_key': 'OpenAI API Key',
      'settings.api_key_saved': 'API key saved successfully',
      'settings.api_key_save_failed': 'Failed to save API key',
      'settings.api_key_required': 'Please enter your OpenAI API key to continue',
      'settings.enter_api_key': 'Enter API Key',
      'settings.language': 'Language',
      'settings.language_english': 'English',
      'settings.language_chinese': 'Chinese',
      'settings.model': 'AI Model',
      'settings.extraction_model': 'Extraction Model',
      'settings.solution_model': 'Solution Model',
      'settings.debugging_model': 'Debugging Model',
      'settings.programming_language': 'Programming Language',
      'settings.opacity': 'Window Opacity',
      'settings.save_settings': 'Save Settings',
      'settings.api_provider': 'API Provider',
      'settings.using_openai_models': 'Using OpenAI Models (gpt-4o, gpt-4o-mini)',
      'settings.using_gemini_models': 'Using Gemini Models (gemini-1.5-pro, gemini-2.0-flash)',
      'settings.openai_api_key': 'OpenAI API Key',
      'settings.gemini_api_key': 'Gemini API Key',
      'settings.enter_gemini_key': 'Enter your Gemini API Key',
      'settings.current': 'Current',
      'settings.api_key_storage_notice': 'Your API keys are stored locally only and are not sent to any servers other than the services used for API requests',
      'settings.no_api_key': 'Don\'t have an API key?',
      'settings.create_openai_account': 'Create an account at',
      'settings.create_google_account': 'Create an account at',
      'settings.go_to': 'Go to',
      'settings.api_keys_section': 'API Keys section',
      'settings.create_paste_key': 'Create a new key and paste it here',
      'settings.interface_language_description': 'Select the display language for the application interface',
      'settings.ai_model_selection': 'AI Model Selection',
      'settings.select_models_description': 'Select which models to use for each processing stage',
      'settings.extractionModel_title': 'Problem Extraction',
      'settings.extractionModel_description': 'Model used to analyze screenshots and extract problem details',
      'settings.solutionModel_title': 'Solution Generation',
      'settings.solutionModel_description': 'Model used to generate coding solutions',
      'settings.debuggingModel_title': 'Debugging',
      'settings.debuggingModel_description': 'Model used to debug and improve solutions',
      'settings.model_description_gpt_4o': 'Best overall performance for problem extraction',
      'settings.model_description_gpt_4o_mini': 'Faster, more economical option',
      'settings.model_description_gemini_1_5_pro': 'Strong overall performance for coding tasks',
      'settings.model_description_gemini_2_0_flash': 'Faster, more economical option',
      'settings.logged_out': 'Successfully logged out',
      'settings.logout_failed': 'Failed to logout',
      
      // 队列
      'queue.title': 'Screenshot Queue',
      'queue.empty': 'No screenshots in queue',
      'queue.processing': 'Processing screenshots...',
      'queue.add_more': 'Add more screenshots',
      'queue.clear': 'Clear queue',
      'queue.capture': 'Capture Screen',
      
      // 解决方案
      'solution.title': 'Solution',
      'solution.complexity': 'Time & Space Complexity',
      'solution.approach': 'Approach',
      'solution.code': 'Code Solution',
      'solution.generating': 'Generating solution...',
      'solution.no_solution': 'No solution yet. Process screenshots to generate one.',
      
      // 调试
      'debug.title': 'Debug',
      'debug.analyze': 'Analyze Code',
      'debug.issues': 'Issues Found',
      'debug.suggestions': 'Suggestions',
      'debug.optimized': 'Optimized Code',
      'debug.no_code': 'No code to debug. Capture code screenshots first.',
      
      // 错误消息
      'error.api_key_invalid': 'Your OpenAI API key appears to be invalid',
      'error.api_key_details': 'Please check your key and try again',
      'error.processing_failed': 'Failed to process screenshot',
      'error.screenshot_failed': 'Failed to capture screenshot',
      'error.network_error': 'A network error occurred',
      'error.unknown_error': 'An unknown error occurred',
      
      // 标题栏
      'header.queue': 'Queue',
      'header.solution': 'Solution',
      'header.debug': 'Debug',
      'header.settings': 'Settings',
      
      // 快捷键
      'shortcuts.title': 'Keyboard Shortcuts',
      'shortcuts.toggle_visibility': 'Toggle Visibility',
      'shortcuts.capture_screenshot': 'Capture Screenshot',
      'shortcuts.process_screenshots': 'Process Screenshots',
      'shortcuts.delete_last': 'Delete Last Screenshot',
      'shortcuts.show_settings': 'Show Settings',
      'shortcuts.reset_view': 'Reset View',
      'shortcuts.quit_app': 'Quit App',
      'shortcuts.move_window': 'Move Window',
      'shortcuts.decrease_opacity': 'Decrease Opacity',
      'shortcuts.increase_opacity': 'Increase Opacity',
      'shortcuts.zoom_out': 'Zoom Out',
      'shortcuts.reset_zoom': 'Reset Zoom',
      'shortcuts.zoom_in': 'Zoom In',
      
      // 欢迎屏幕
      'welcome.title': 'Welcome to Interview Coding Assistant',
      'welcome.subtitle': 'Your AI-powered coding interview assistant',
      'welcome.start': 'Get Started',
      'welcome.hide_welcome': 'Don\'t show again'
    }
  },
  'zh-CN': {
    translation: {
      'app.title': '面试编程助手',
      'app.welcome': '欢迎使用面试编程助手',
      'app.initializing': '初始化中...',
      'app.please_wait': '请稍候，应用程序正在设置',
      'app.version': '版本',
      
      // 按钮
      'button.cancel': '取消',
      'button.confirm': '确认',
      'button.save': '保存',
      'button.apply': '应用',
      'button.close': '关闭',
      'button.back': '返回',
      'button.next': '下一步',
      'button.delete': '删除',
      'button.add': '添加',
      'button.analyze': '分析',
      'button.process': '处理',
      'button.copy': '复制',
      'button.reset': '重置',
      'button.logout': '退出登录',
      
      // 通知
      'toast.success': '成功',
      'toast.error': '错误',
      'toast.warning': '警告',
      'toast.info': '信息',
      
      // 设置
      'settings.title': '设置',
      'settings.api_key': 'OpenAI API 密钥',
      'settings.api_key_saved': 'API 密钥保存成功',
      'settings.api_key_save_failed': '保存 API 密钥失败',
      'settings.api_key_required': '请输入您的 OpenAI API 密钥以继续',
      'settings.enter_api_key': '输入 API 密钥',
      'settings.language': '语言',
      'settings.language_english': '英文',
      'settings.language_chinese': '中文',
      'settings.model': 'AI 模型',
      'settings.extraction_model': '提取模型',
      'settings.solution_model': '解决方案模型',
      'settings.debugging_model': '调试模型',
      'settings.programming_language': '编程语言',
      'settings.opacity': '窗口透明度',
      'settings.save_settings': '保存设置',
      'settings.api_provider': 'API 提供商',
      'settings.using_openai_models': '使用 OpenAI 模型 (gpt-4o, gpt-4o-mini)',
      'settings.using_gemini_models': '使用 Gemini 模型 (gemini-1.5-pro, gemini-2.0-flash)',
      'settings.openai_api_key': 'OpenAI API 密钥',
      'settings.gemini_api_key': 'Gemini API 密钥',
      'settings.enter_gemini_key': '输入您的 Gemini API 密钥',
      'settings.current': '当前',
      'settings.api_key_storage_notice': '您的 API 密钥仅存储在本地，不会发送到任何服务器，除了用于 API 请求的服务',
      'settings.no_api_key': '没有 API 密钥？',
      'settings.create_openai_account': '在此创建账户',
      'settings.create_google_account': '在此创建账户',
      'settings.go_to': '前往',
      'settings.api_keys_section': 'API 密钥部分',
      'settings.create_paste_key': '创建新密钥并粘贴到此处',
      'settings.interface_language_description': '选择应用程序界面的显示语言',
      'settings.ai_model_selection': 'AI 模型选择',
      'settings.select_models_description': '选择用于每个处理阶段的模型',
      'settings.extractionModel_title': '问题提取',
      'settings.extractionModel_description': '用于分析截图和提取问题详情的模型',
      'settings.solutionModel_title': '解决方案生成',
      'settings.solutionModel_description': '用于生成编码解决方案的模型',
      'settings.debuggingModel_title': '调试',
      'settings.debuggingModel_description': '用于调试和改进解决方案的模型',
      'settings.model_description_gpt_4o': '问题提取的最佳整体性能',
      'settings.model_description_gpt_4o_mini': '更快、更经济的选择',
      'settings.model_description_gemini_1_5_pro': '编码任务的强大整体性能',
      'settings.model_description_gemini_2_0_flash': '更快、更经济的选择',
      'settings.logged_out': '成功退出登录',
      'settings.logout_failed': '退出登录失败',
      
      // 队列
      'queue.title': '截图队列',
      'queue.empty': '队列中没有截图',
      'queue.processing': '正在处理截图...',
      'queue.add_more': '添加更多截图',
      'queue.clear': '清空队列',
      'queue.capture': '捕获屏幕',
      
      // 解决方案
      'solution.title': '解决方案',
      'solution.complexity': '时间与空间复杂度',
      'solution.approach': '解题思路',
      'solution.code': '代码解决方案',
      'solution.generating': '正在生成解决方案...',
      'solution.no_solution': '还没有解决方案。处理截图以生成一个。',
      
      // 调试
      'debug.title': '调试',
      'debug.analyze': '分析代码',
      'debug.issues': '发现的问题',
      'debug.suggestions': '建议',
      'debug.optimized': '优化后的代码',
      'debug.no_code': '没有代码可调试。先捕获代码截图。',
      
      // 错误消息
      'error.api_key_invalid': '您的 OpenAI API 密钥似乎无效',
      'error.api_key_details': '请检查您的密钥并重试',
      'error.processing_failed': '处理截图失败',
      'error.screenshot_failed': '截图捕获失败',
      'error.network_error': '发生网络错误',
      'error.unknown_error': '发生未知错误',
      
      // 标题栏
      'header.queue': '队列',
      'header.solution': '解决方案',
      'header.debug': '调试',
      'header.settings': '设置',
      
      // 快捷键
      'shortcuts.title': '键盘快捷键',
      'shortcuts.toggle_visibility': '切换可见性',
      'shortcuts.capture_screenshot': '捕获截图',
      'shortcuts.process_screenshots': '处理截图',
      'shortcuts.delete_last': '删除最后一个截图',
      'shortcuts.show_settings': '显示设置',
      'shortcuts.reset_view': '重置视图',
      'shortcuts.quit_app': '退出应用',
      'shortcuts.move_window': '移动窗口',
      'shortcuts.decrease_opacity': '降低透明度',
      'shortcuts.increase_opacity': '增加透明度',
      'shortcuts.zoom_out': '缩小',
      'shortcuts.reset_zoom': '重置缩放',
      'shortcuts.zoom_in': '放大',
      
      // 欢迎屏幕
      'welcome.title': '欢迎使用面试编程助手',
      'welcome.subtitle': '您的AI驱动的编程面试助手',
      'welcome.start': '开始使用',
      'welcome.hide_welcome': '不再显示'
    }
  }
};

i18n
  // 加载翻译文件的后端
  .use(Backend)
  // 语言检测功能
  .use(LanguageDetector)
  // 把i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React已经安全地处理了转义
    },
    
    // 加载翻译文件的路径
    backend: {
      // Electron环境中的文件加载策略
      loadPath: (lng: string, ns: string) => {
        // 检查是否在Electron环境中
        if (typeof window !== 'undefined' && window.electronAPI) {
          console.log(`Loading translations for ${lng} in ${window.electronAPI.isDev() ? 'development' : 'production'} mode`);
          
          if (window.electronAPI.isDev()) {
            // 开发环境使用正确的路径（添加前导斜杠）
            return `/locales/${lng}/${ns}.json`;
          } else {
            // 生产环境使用相对路径
            // 在file://协议下，使用相对路径比绝对路径更可靠
            return `./locales/${lng}/${ns}.json`;
          }
        } else {
          // 非Electron环境（如浏览器）使用相对路径
          return `/locales/${lng}/${ns}.json`;
        }
      },
      // 禁用多语言加载，一次只加载一种语言
      allowMultiLoading: false,
      // 设置获取失败时的重试次数
      retries: 3,
      // 加载请求超时时间（毫秒）
      requestOptions: {
        timeout: 5000
      },
      // 加载完成回调
      onLoad: (data: any) => {
        console.log('Translation data loaded successfully');
      }
    },
    
    // fallbackLng: 'en' 会处理加载失败的情况，无需在此处指定 resources
    // resources: fallbackResources, // 移除此行，让 backend 负责加载
    
    // 尝试从localStorage中加载语言设置
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // 使用简单的命名空间
    ns: ['translation'],
    defaultNS: 'translation',
    
    // 如果翻译键不存在，显示键名而不是空白
    returnEmptyString: false,
    returnNull: false,
    
    // 启用翻译缺失检测（仅在开发模式下）
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] 缺失翻译: ${lng}:${ns}:${key}`);
      }
    }
  });

// 为了保持应用程序与Electron主进程的同步，如果electronAPI可用
// 需要在语言变更时通知Electron主进程
i18n.on('languageChanged', async (lng) => {
  if (window.electronAPI && window.electronAPI.updateConfig) {
    try {
      await window.electronAPI.updateConfig({ interfaceLanguage: lng });
      console.log(`Language updated to ${lng} in main process`);
    } catch (error) {
      console.error('Failed to update language in main process:', error);
    }
  }
});

// 调试：检查翻译文件是否正确加载
i18n.on('loaded', (loaded) => {
  console.log('i18n resources loaded:', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`i18n resource loading failed for ${lng}:${ns}:`, msg);
});

// 尝试手动加载翻译文件（仅在初始化后未加载时）
export const forceLoadTranslations = async () => {
  try {
    // 获取当前界面语言（注意：从localStorage中获取interfaceLanguage而不是language）
    let currentLanguage = i18n.language || 'en';
    
    // 检查localStorage中的interfaceLanguage
    try {
      const storedInterfaceLanguage = localStorage.getItem('i18nextLng');
      if (storedInterfaceLanguage && (storedInterfaceLanguage === 'en' || storedInterfaceLanguage === 'zh-CN')) {
        currentLanguage = storedInterfaceLanguage;
      }
    } catch (e) {
      console.error('无法从localStorage获取界面语言设置', e);
    }
    
    console.log(`尝试手动加载 ${currentLanguage} 翻译文件...`);
    
    // 在Electron环境中
    if (typeof window !== 'undefined' && window.electronAPI) {
      let translationJson;
      
      try {
        // 移除开发环境下的 fetch 调用，统一尝试 readTranslationFile
        // if (window.electronAPI.isDev()) {
        //   // 开发环境使用fetch
        //   // const translationData = await window.fetch(`/locales/${currentLanguage}/translation.json`);
        //   // translationJson = await translationData.json();
        // } else {
          // 生产环境
          try {
            // 首先尝试使用Electron IPC读取
            translationJson = await window.electronAPI.readTranslationFile(currentLanguage);
            
            // 如果IPC方法失败，尝试直接用相对路径fetch
            if (!translationJson) {
              const isProduction = window.location.protocol === 'file:';
              const basePath = isProduction ? './locales' : '/locales';
              const translationData = await window.fetch(`${basePath}/${currentLanguage}/translation.json`);
              translationJson = await translationData.json();
              console.log(`通过相对路径成功加载${currentLanguage}翻译`);
            }
          } catch (error) {
            console.error('Electron方法和备用方法都失败:', error);
            throw error; // 继续向外部抛出错误
          }
        // } // 移除对应的 else 结束括号
        
        if (translationJson) {
          // 添加到i18n实例
          i18n.addResourceBundle(currentLanguage, 'translation', translationJson, true, true);
          console.log(`成功手动加载 ${currentLanguage} 翻译`);
        }
      } catch (electronError) {
        console.error(`通过Electron加载翻译失败:`, electronError);
        
        // 回退到备用方法：使用相对路径
        try {
          const translationData = await window.fetch(`/locales/${currentLanguage}/translation.json`);
          const translations = await translationData.json();
          i18n.addResourceBundle(currentLanguage, 'translation', translations, true, true);
          console.log(`通过备用方法加载 ${currentLanguage} 翻译成功`);
        } catch (backupError) {
          console.error(`备用加载方法也失败:`, backupError);
          // 使用内置的fallbackResources
          console.log(`使用内置的备用翻译`);
        }
      }
    } else {
      // 浏览器环境，使用fetch
      try {
        const translationData = await window.fetch(`/locales/${currentLanguage}/translation.json`);
        const translations = await translationData.json();
        i18n.addResourceBundle(currentLanguage, 'translation', translations, true, true);
        console.log(`在浏览器环境中加载 ${currentLanguage} 翻译成功`);
      } catch (error) {
        console.error('浏览器环境加载翻译失败:', error);
      }
    }
  } catch (error) {
    console.error('手动加载翻译文件时发生错误:', error);
  }
};

// 定期尝试加载翻译文件（最多3次）
let loadAttempts = 0;
const maxLoadAttempts = 3;

const attemptLoad = () => {
  if (loadAttempts < maxLoadAttempts) {
    loadAttempts++;
    console.log(`尝试加载翻译文件 (尝试 ${loadAttempts}/${maxLoadAttempts})...`);
    forceLoadTranslations();
    
    // 检查是否已成功加载翻译
    setTimeout(() => {
      const currentLanguage = i18n.language || 'en';
      const hasResources = i18n.hasResourceBundle(currentLanguage, 'translation');
      if (!hasResources) {
        console.log(`翻译资源尚未加载，再次尝试...`);
        attemptLoad();
      } else {
        console.log(`翻译资源已成功加载!`);
      }
    }, 1000);
  } else {
    console.log(`达到最大尝试次数 (${maxLoadAttempts})，使用备用翻译资源`);
  }
};

// 首次尝试加载
setTimeout(attemptLoad, 1000);

// 导出配置好的i18n实例供应用使用
export default i18n; 