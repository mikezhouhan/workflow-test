import '@testing-library/jest-dom';
import { vi } from 'vitest';
import i18n from '../renderer/lib/i18n'; // Import the i18n instance
// Define minimal fallback resources directly in setup
const fallbackResourcesForTest = {
  en: { translation: { 'app.title': 'Test Title', 'error.api_key_invalid': 'API Key Invalid (Test)' } },
  'zh-CN': { translation: { 'app.title': '测试标题', 'error.api_key_invalid': 'API密钥无效（测试）' } }
};
import { initReactI18next } from 'react-i18next';

// 创建一个可导出的模拟取消订阅函数
export const mockUnsubscribe = vi.fn();

// Globally mock fetch to prevent any network requests during tests
vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({}), // Mock JSON response
  text: async () => '{}',  // Mock text response
} as Response); // Cast to Response type

// Force i18n initialization with fallback resources for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // Default language for tests
    fallbackLng: 'en',
    resources: fallbackResourcesForTest, // Use locally defined resources
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    backend: undefined, // Ensure no backend is used
    detection: undefined, // Ensure no detection is used
  });

// Removed setTimeout/clearTimeout mocks

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

// Keep i18next-http-backend mock as a safety measure
vi.mock('i18next-http-backend', () => {
  const MockBackend = {
    type: 'backend',
    init: vi.fn(),
    read: vi.fn((_language: string, _namespace: string, callback: (error: null, data: any) => void) => {
      callback(null, {}); // Return empty object immediately
    }),
    create: vi.fn(),
  };
  return { default: MockBackend };
});

// 模拟 window.electronAPI 对象 (替换旧的 window.electron 模拟)
Object.defineProperty(window, 'electronAPI', {
  value: {
    // --- Config ---
    getApiKey: vi.fn().mockResolvedValue(null), // 默认没有API Key
    setApiKey: vi.fn().mockResolvedValue(undefined),
    checkApiKey: vi.fn().mockResolvedValue(true), // Add mock for checking API key status
    getLanguage: vi.fn().mockResolvedValue('en'),
    setLanguage: vi.fn().mockResolvedValue(undefined),
    getAutoLaunch: vi.fn().mockResolvedValue(false),
    setAutoLaunch: vi.fn().mockResolvedValue(undefined),
    getAutoUpdate: vi.fn().mockResolvedValue(true),
    setAutoUpdate: vi.fn().mockResolvedValue(undefined),
    getShortcut: vi.fn().mockResolvedValue(''),
    setShortcut: vi.fn().mockResolvedValue(undefined),
    getScreenshotQuality: vi.fn().mockResolvedValue('good'),
    setScreenshotQuality: vi.fn().mockResolvedValue(undefined),
    getScreenshotFormat: vi.fn().mockResolvedValue('png'),
    setScreenshotFormat: vi.fn().mockResolvedValue(undefined),
    getScreenshotSavePath: vi.fn().mockResolvedValue(''),
    setScreenshotSavePath: vi.fn().mockResolvedValue(undefined),
    getDevTools: vi.fn().mockResolvedValue(false),
    setDevTools: vi.fn().mockResolvedValue(undefined),
    resetConfig: vi.fn().mockResolvedValue(undefined),
    getConfig: vi.fn().mockResolvedValue({ // Add mock for getting config
      interfaceLanguage: 'en',
      apiKey: null,
      // Add other default config values if needed by tests
      apiProvider: 'openai', // Default provider changed to openai
      models: {
        extractionModel: 'gpt-4o-mini', // Changed to openai model
        solutionModel: 'gpt-4o-mini', // Changed to openai model
        debuggingModel: 'gpt-4o-mini', // Changed to openai model
      },
      programmingLanguage: 'python',
      opacity: 1,
      autoLaunch: false,
      autoUpdate: true,
      shortcut: '',
      screenshotQuality: 'good',
      screenshotFormat: 'png',
      screenshotSavePath: '',
      devTools: false,
    }),

    // --- IPC ---
    // 通用 on/removeListener，确保 on 返回可追踪的取消订阅函数
    on: vi.fn((_channel, _listener) => mockUnsubscribe),
    removeListener: vi.fn(),
    invoke: vi.fn().mockResolvedValue({}),
    send: vi.fn(),

    // --- App Info ---
    getAppVersion: vi.fn().mockResolvedValue('0.0.0-test'),
    isDev: vi.fn().mockReturnValue(false), // 修复 isDev 错误
    platform: process.platform, // 使用实际的测试平台

    // --- Updater ---
    checkForUpdates: vi.fn(),
    // 特定的 on... 事件，确保返回相同的可追踪取消订阅函数
    onUpdateAvailable: vi.fn().mockReturnValue(mockUnsubscribe),
    onUpdateDownloaded: vi.fn().mockReturnValue(mockUnsubscribe),
    onShowSettings: vi.fn().mockReturnValue(mockUnsubscribe),
    onApiKeyInvalid: vi.fn().mockReturnValue(mockUnsubscribe),
    onSolutionSuccess: vi.fn().mockReturnValue(mockUnsubscribe),
    quitAndInstall: vi.fn(),

    // --- Other ---
    openExternal: vi.fn(),
    openDialog: vi.fn().mockResolvedValue({ canceled: true, filePaths: [] }),
    showItemInFolder: vi.fn(),
    getCursorPosition: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
    takeScreenshot: vi.fn().mockResolvedValue('mock-screenshot-id'),
    processImage: vi.fn().mockResolvedValue({ solution: 'mock solution', originalImage: 'base64...' }),
    getSolutions: vi.fn().mockResolvedValue([]),
    deleteSolution: vi.fn().mockResolvedValue(undefined),
    copyToClipboard: vi.fn(),
    getScreenshots: vi.fn().mockResolvedValue([]),
    deleteScreenshot: vi.fn().mockResolvedValue(undefined),
    registerShortcut: vi.fn().mockResolvedValue(true),
    unregisterShortcut: vi.fn().mockResolvedValue(true),
    relaunchApp: vi.fn(),
    quitApp: vi.fn(),
    toggleDevTools: vi.fn(),
    getUserId: vi.fn().mockResolvedValue('test-user-id'),
    trackEvent: vi.fn(),
    readTranslationFile: vi.fn().mockResolvedValue('{}'), // Add mock for i18n
  },
  writable: true,
  configurable: true, // Allow redefinition in tests
});