// Define all methods directly in the exported interface
export interface ElectronAPI {
  // --- Config ---
  getApiKey: () => Promise<string | null>
  setApiKey: (apiKey: string | null) => Promise<void>
  getProgrammingLanguage: () => Promise<string>
  setProgrammingLanguage: (language: string) => Promise<void>
  getAutoLaunch: () => Promise<boolean>
  setAutoLaunch: (autoLaunch: boolean) => Promise<void>
  getAutoUpdate: () => Promise<boolean>
  setAutoUpdate: (autoUpdate: boolean) => Promise<void>
  getShortcut: () => Promise<string>
  setShortcut: (shortcut: string) => Promise<void>
  getScreenshotQuality: () => Promise<'good' | 'better' | 'best'>
  setScreenshotQuality: (quality: 'good' | 'better' | 'best') => Promise<void>
  getScreenshotFormat: () => Promise<'png' | 'jpeg'>
  setScreenshotFormat: (format: 'png' | 'jpeg') => Promise<void>
  getScreenshotSavePath: () => Promise<string>
  setScreenshotSavePath: (path: string) => Promise<void>
  getDevTools: () => Promise<boolean>
  setDevTools: (enable: boolean) => Promise<void>
  resetConfig: () => Promise<void>
  // Update getConfig to reflect the actual structure used in mocks/app
  getConfig: () => Promise<{
    interfaceLanguage: string;
    apiKey: string | null; // Allow null based on setup mock
    apiProvider: 'openai'; // Only allow OpenAI
    models: {
      extractionModel: string;
      solutionModel: string;
      debuggingModel: string;
    };
    programmingLanguage: string;
    opacity: number;
    autoLaunch: boolean;
    autoUpdate: boolean;
    shortcut: string;
    screenshotQuality: 'good' | 'better' | 'best';
    screenshotFormat: 'png' | 'jpeg';
    screenshotSavePath: string;
    devTools: boolean;
  }>
  updateConfig: (config: { apiKey?: string; model?: string }) => Promise<boolean> // Keep if still used
  checkApiKey: () => Promise<boolean> // Keep if still used
  validateApiKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }> // Keep if still used
  readTranslationFile: (lang: string) => Promise<string>; // Add missing i18n helper

  // --- IPC ---
  on: (channel: string, listener: (...args: any[]) => void) => () => void // Add 'on' method
  removeListener: (channel: string, listener: (...args: any[]) => void) => void
  invoke: <T>(channel: string, ...args: any[]) => Promise<T> // Add 'invoke'
  send: (channel: string, ...args: any[]) => void // Add 'send'

  // --- App Info ---
  getAppVersion: () => Promise<string>
  isDev: () => Promise<boolean> // Add 'isDev'
  platform: string // Add 'platform' (assuming it's directly available)
  getPlatform: () => string // Keep if still used

  // --- Updater ---
  checkForUpdates: () => void // Add 'checkForUpdates'
  onUpdateAvailable: (callback: (info: any) => void) => () => void
  onUpdateDownloaded: (callback: (info: any) => void) => () => void
  quitAndInstall: () => void // Add 'quitAndInstall'
  startUpdate: () => Promise<{ success: boolean; error?: string }> // Keep if used
  installUpdate: () => void // Keep if used

  // --- Other ---
  openExternal: (url: string) => void
  openLink: (url: string) => void // Keep if used
  openDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }> // Add 'openDialog'
  showItemInFolder: (path: string) => void // Add 'showItemInFolder'
  getCursorPosition: () => Promise<{ x: number; y: number }> // Add 'getCursorPosition'
  takeScreenshot: () => Promise<string> // Add 'takeScreenshot'
  processImage: (options: { imagePath: string; prompt: string }) => Promise<{ solution: string; originalImage: string }> // Add 'processImage'
  getSolutions: () => Promise<any[]> // Add 'getSolutions'
  deleteSolution: (id: string) => Promise<void> // Add 'deleteSolution'
  copyToClipboard: (text: string) => void // Add 'copyToClipboard'
  getScreenshots: () => Promise<{ success: boolean; previews?: Array<{ path: string; preview: string }> | null; error?: string }> // Keep if used
  deleteScreenshot: (path: string) => Promise<{ success: boolean; error?: string }> // Keep if used
  registerShortcut: (shortcut: string) => Promise<boolean> // Add 'registerShortcut'
  unregisterShortcut: (shortcut: string) => Promise<boolean> // Add 'unregisterShortcut'
  relaunchApp: () => void // Add 'relaunchApp'
  quitApp: () => void // Add 'quitApp'
  toggleDevTools: () => void // Add 'toggleDevTools'
  getUserId: () => Promise<string> // Add 'getUserId'
  trackEvent: (eventName: string, properties?: Record<string, any>) => void // Add 'trackEvent'

  // --- Original/Potentially Deprecated ---
  openSubscriptionPortal: (authData: { id: string; email: string }) => Promise<{ success: boolean; error?: string }>
  updateContentDimensions: (dimensions: { width: number; height: number }) => Promise<void>
  clearStore: () => Promise<{ success: boolean; error?: string }>
  onScreenshotTaken: (callback: (data: { path: string; preview: string }) => void) => () => void
  onResetView: (callback: () => void) => () => void
  onSolutionStart: (callback: () => void) => () => void
  onDebugStart: (callback: () => void) => () => void
  onDebugSuccess: (callback: (data: any) => void) => () => void
  onSolutionError: (callback: (error: string) => void) => () => void
  onProcessingNoScreenshots: (callback: () => void) => () => void
  onProblemExtracted: (callback: (data: any) => void) => () => void
  onSolutionSuccess: (callback: (data: any) => void) => () => void
  onUnauthorized: (callback: () => void) => () => void
  onDebugError: (callback: (error: string) => void) => () => void
  toggleMainWindow: () => Promise<{ success: boolean; error?: string }>
  triggerScreenshot: () => Promise<{ success: boolean; error?: string }>
  triggerProcessScreenshots: () => Promise<{ success: boolean; error?: string }>
  triggerReset: () => Promise<{ success: boolean; error?: string }>
  triggerMoveLeft: () => Promise<{ success: boolean; error?: string }>
  triggerMoveRight: () => Promise<{ success: boolean; error?: string }>
  triggerMoveUp: () => Promise<{ success: boolean; error?: string }>
  triggerMoveDown: () => Promise<{ success: boolean; error?: string }>
  onSubscriptionUpdated: (callback: () => void) => () => void
  onSubscriptionPortalClosed: (callback: () => void) => () => void
  decrementCredits: () => Promise<void>
  setInitialCredits: (credits: number) => Promise<void>
  onCreditsUpdated: (callback: (credits: number) => void) => () => void
  onOutOfCredits: (callback: () => void) => () => void
  openSettingsPortal: () => Promise<void>
  onShowSettings: (callback: () => void) => () => void; // Add missing listener
  onApiKeyInvalid: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: {
      ipcRenderer: {
        on: (channel: string, func: (...args: any[]) => void) => void
        removeListener: (
          channel: string,
          func: (...args: any[]) => void
        ) => void
      }
    }
    __CREDITS__: number
    __LANGUAGE__: string
    __IS_INITIALIZED__: boolean
    __AUTH_TOKEN__?: string | null
  }
}
