// ipcHandlers.ts

import { ipcMain, shell, dialog } from "electron"
import { randomBytes } from "crypto"
import { IIpcHandlerDeps } from "./main"
import { configHelper } from "./ConfigHelper"

export function initializeIpcHandlers(deps: IIpcHandlerDeps): void {
  console.log("Initializing IPC handlers")

  // Configuration handlers
  ipcMain.handle("get-config", () => {
    return configHelper.loadConfig();
  })

  ipcMain.handle("update-config", (_event, updates) => {
    const config = configHelper.loadConfig();
    const configPath = configHelper.getConfigPath();
    
    // 打印API key保存位置和类型
    console.log('API Key Storage Location:', configPath);
    console.log('API Provider Type:', updates.apiProvider || config.apiProvider);
    console.log('IPC Handler: Received config update:', updates);
    
    return configHelper.updateConfig(updates);
  })

  ipcMain.handle("check-api-key", () => {
    return configHelper.hasApiKey();
  })
  
  ipcMain.handle("validate-api-key", async (_event, apiKey) => {
    // First check the format
    if (!configHelper.isValidApiKeyFormat(apiKey)) {
      return { 
        valid: false, 
        error: "Invalid API key format. OpenAI API keys start with 'sk-'" 
      };
    }
    
    // Then test the API key with OpenAI
    const result = await configHelper.testApiKey(apiKey);
    return result;
  })

  // 界面语言相关处理程序
  ipcMain.handle("get-interface-language", () => {
    return configHelper.getInterfaceLanguage();
  })

  ipcMain.handle("set-interface-language", (_event, language: string) => {
    return configHelper.setInterfaceLanguage(language);
  })
  
  // Programming language handlers
  ipcMain.handle("get-programming-language", () => {
    return configHelper.getProgrammingLanguage();
  })

  ipcMain.handle("set-programming-language", (_event, language: string) => {
    return configHelper.setProgrammingLanguage(language);
  })

  // 添加获取应用路径的处理程序
  ipcMain.handle("get-app-path", () => {
    const { app } = require('electron');
    return app.getAppPath();
  })

  // 添加读取翻译文件的处理程序
  ipcMain.handle("read-translation-file", async (_event, language: string) => {
    try {
      const { app } = require('electron');
      const fs = require('fs').promises;
      const path = require('path');
      
      // 确保语言是合法的界面语言
      if (language !== 'en' && language !== 'zh-CN') {
        console.error(`尝试加载非法的界面语言: ${language}，回退到英文`);
        language = 'en'; // 回退到英文
      }
      
      // 确定基础路径：开发环境使用项目根目录，生产环境使用资源目录
      const isPackaged = app.isPackaged;
      const basePath = isPackaged ? process.resourcesPath : app.getAppPath();
      console.log(`应用基础路径 (${isPackaged ? '生产' : '开发'}): ${basePath}`);
      
      // 确定 locales 目录相对于基础路径的位置
      // 开发环境: public/locales
      // 生产环境: dist/locales (因为 build 脚本会 cp -r public/locales dist/)
      const localesRelativePath = isPackaged ? 'dist/locales' : 'public/locales';
      
      // 构建目标翻译文件路径
      const targetPath = path.join(basePath, localesRelativePath, language, 'translation.json');
      
      // 检查目标目录是否存在 (可选的调试日志)
      try {
        const localesDir = path.dirname(targetPath);
        const localesDirExists = await fs.access(localesDir).then(() => true).catch(() => false);
        console.log(`目标 locales 目录 (${localesDir}) 是否存在: ${localesDirExists}`);
      } catch (err) {
        // 忽略检查错误，继续尝试读取文件
      }

      // 主要尝试目标路径，并保留用户数据目录作为备用
      const possiblePaths = [
        targetPath,
        path.join(app.getPath('userData'), 'locales', language, 'translation.json') // 应用数据目录作为备用
      ];
      
      let translationData = null;
      let successPath = null;
      
      // 尝试从多个路径读取
      for (const filePath of possiblePaths) {
        try {
          console.log(`尝试从以下路径读取翻译: ${filePath}`);
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          console.log(`文件是否存在: ${exists}`);
          
          if (exists) {
            const data = await fs.readFile(filePath, 'utf8');
            translationData = JSON.parse(data);
            successPath = filePath;
            break;
          } else {
            console.log(`从 ${filePath} 读取失败: 文件不存在`);
          }
        } catch (err) {
          console.log(`从 ${filePath} 读取失败: ${err.message}`);
        }
      }
      
      if (translationData) {
        console.log(`成功从 ${successPath} 读取翻译文件`);
        return translationData;
      } else {
        console.error(`无法找到语言 ${language} 的翻译文件`);
        
        // 紧急解决方案：如果找不到翻译文件，则返回默认的翻译对象
        console.log(`返回内存中的默认${language}翻译数据`);
        const fallbackData: Record<string, Record<string, string>> = {
          en: {
            'app.title': 'Interview Coding Assistant',
            'settings.title': 'Settings',
            'settings.api_key': 'API Key',
            'settings.language': 'Language',
            'settings.model': 'Model',
            'button.save': 'Save'
          },
          'zh-CN': {
            'app.title': '面试编程助手',
            'settings.title': '设置',
            'settings.api_key': 'API密钥',
            'settings.language': '语言',
            'settings.model': '模型',
            'button.save': '保存'
          }
        };
        
        return fallbackData[language] || fallbackData.en;
      }
    } catch (error) {
      console.error(`读取翻译文件时出错:`, error);
      return null;
    }
  })

  // Credits handlers
  ipcMain.handle("set-initial-credits", async (_event, credits: number) => {
    const mainWindow = deps.getMainWindow()
    if (!mainWindow) return

    try {
      // Set the credits in a way that ensures atomicity
      await mainWindow.webContents.executeJavaScript(
        `window.__CREDITS__ = ${credits}`
      )
      mainWindow.webContents.send("credits-updated", credits)
    } catch (error) {
      console.error("Error setting initial credits:", error)
      throw error
    }
  })

  ipcMain.handle("decrement-credits", async () => {
    const mainWindow = deps.getMainWindow()
    if (!mainWindow) return

    try {
      const currentCredits = await mainWindow.webContents.executeJavaScript(
        "window.__CREDITS__"
      )
      if (currentCredits > 0) {
        const newCredits = currentCredits - 1
        await mainWindow.webContents.executeJavaScript(
          `window.__CREDITS__ = ${newCredits}`
        )
        mainWindow.webContents.send("credits-updated", newCredits)
      }
    } catch (error) {
      console.error("Error decrementing credits:", error)
    }
  })

  // Screenshot queue handlers
  ipcMain.handle("get-screenshot-queue", () => {
    return deps.getScreenshotQueue()
  })

  ipcMain.handle("get-extra-screenshot-queue", () => {
    return deps.getExtraScreenshotQueue()
  })

  ipcMain.handle("delete-screenshot", async (event, path: string) => {
    return deps.deleteScreenshot(path)
  })

  ipcMain.handle("get-image-preview", async (event, path: string) => {
    return deps.getImagePreview(path)
  })

  // Screenshot processing handlers
  ipcMain.handle("process-screenshots", async () => {
    // Check for API key before processing
    if (!configHelper.hasApiKey()) {
      const mainWindow = deps.getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send(deps.PROCESSING_EVENTS.API_KEY_INVALID);
      }
      return;
    }
    
    await deps.processingHelper?.processScreenshots()
  })

  // Window dimension handlers
  ipcMain.handle(
    "update-content-dimensions",
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        deps.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle(
    "set-window-dimensions",
    (event, width: number, height: number) => {
      deps.setWindowDimensions(width, height)
    }
  )

  // Screenshot management handlers
  ipcMain.handle("get-screenshots", async () => {
    try {
      let previews = []
      const currentView = deps.getView()

      if (currentView === "queue") {
        const queue = deps.getScreenshotQueue()
        previews = await Promise.all(
          queue.map(async (path) => ({
            path,
            preview: await deps.getImagePreview(path)
          }))
        )
      } else {
        const extraQueue = deps.getExtraScreenshotQueue()
        previews = await Promise.all(
          extraQueue.map(async (path) => ({
            path,
            preview: await deps.getImagePreview(path)
          }))
        )
      }

      return previews
    } catch (error) {
      console.error("Error getting screenshots:", error)
      throw error
    }
  })

  // Screenshot trigger handlers
  ipcMain.handle("trigger-screenshot", async () => {
    const mainWindow = deps.getMainWindow()
    if (mainWindow) {
      try {
        const screenshotPath = await deps.takeScreenshot()
        const preview = await deps.getImagePreview(screenshotPath)
        mainWindow.webContents.send("screenshot-taken", {
          path: screenshotPath,
          preview
        })
        return { success: true }
      } catch (error) {
        console.error("Error triggering screenshot:", error)
        return { error: "Failed to trigger screenshot" }
      }
    }
    return { error: "No main window available" }
  })

  ipcMain.handle("take-screenshot", async () => {
    try {
      const screenshotPath = await deps.takeScreenshot()
      const preview = await deps.getImagePreview(screenshotPath)
      return { path: screenshotPath, preview }
    } catch (error) {
      console.error("Error taking screenshot:", error)
      return { error: "Failed to take screenshot" }
    }
  })

  // Auth-related handlers removed

  ipcMain.handle("open-external-url", (event, url: string) => {
    shell.openExternal(url)
  })
  
  // Open external URL handler
  ipcMain.handle("openLink", (event, url: string) => {
    try {
      console.log(`Opening external URL: ${url}`);
      shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error(`Error opening URL ${url}:`, error);
      return { success: false, error: `Failed to open URL: ${error}` };
    }
  })

  // Settings portal handler
  ipcMain.handle("open-settings-portal", () => {
    const mainWindow = deps.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send("show-settings-dialog");
      return { success: true };
    }
    return { success: false, error: "Main window not available" };
  })

  // Window management handlers
  ipcMain.handle("toggle-window", () => {
    try {
      deps.toggleMainWindow()
      return { success: true }
    } catch (error) {
      console.error("Error toggling window:", error)
      return { error: "Failed to toggle window" }
    }
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      deps.clearQueues()
      return { success: true }
    } catch (error) {
      console.error("Error resetting queues:", error)
      return { error: "Failed to reset queues" }
    }
  })

  // Process screenshot handlers
  ipcMain.handle("trigger-process-screenshots", async () => {
    try {
      // Check for API key before processing
      if (!configHelper.hasApiKey()) {
        const mainWindow = deps.getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send(deps.PROCESSING_EVENTS.API_KEY_INVALID);
        }
        return { success: false, error: "API key required" };
      }
      
      await deps.processingHelper?.processScreenshots()
      return { success: true }
    } catch (error) {
      console.error("Error processing screenshots:", error)
      return { error: "Failed to process screenshots" }
    }
  })

  // Reset handlers
  ipcMain.handle("trigger-reset", () => {
    try {
      // First cancel any ongoing requests
      deps.processingHelper?.cancelOngoingRequests()

      // Clear all queues immediately
      deps.clearQueues()

      // Reset view to queue
      deps.setView("queue")

      // Get main window and send reset events
      const mainWindow = deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Send reset events in sequence
        mainWindow.webContents.send("reset-view")
        mainWindow.webContents.send("reset")
      }

      return { success: true }
    } catch (error) {
      console.error("Error triggering reset:", error)
      return { error: "Failed to trigger reset" }
    }
  })

  // Window movement handlers
  ipcMain.handle("trigger-move-left", () => {
    try {
      deps.moveWindowLeft()
      return { success: true }
    } catch (error) {
      console.error("Error moving window left:", error)
      return { error: "Failed to move window left" }
    }
  })

  ipcMain.handle("trigger-move-right", () => {
    try {
      deps.moveWindowRight()
      return { success: true }
    } catch (error) {
      console.error("Error moving window right:", error)
      return { error: "Failed to move window right" }
    }
  })

  ipcMain.handle("trigger-move-up", () => {
    try {
      deps.moveWindowUp()
      return { success: true }
    } catch (error) {
      console.error("Error moving window up:", error)
      return { error: "Failed to move window up" }
    }
  })

  ipcMain.handle("trigger-move-down", () => {
    try {
      deps.moveWindowDown()
      return { success: true }
    } catch (error) {
      console.error("Error moving window down:", error)
      return { error: "Failed to move window down" }
    }
  })
  
  // Delete last screenshot handler
  ipcMain.handle("delete-last-screenshot", async () => {
    try {
      const queue = deps.getView() === "queue" 
        ? deps.getScreenshotQueue() 
        : deps.getExtraScreenshotQueue()
      
      if (queue.length === 0) {
        return { success: false, error: "errors.noScreenshotsToDelete" } // Return key instead of string
      }
      
      // Get the last screenshot in the queue
      const lastScreenshot = queue[queue.length - 1]
      
      // Delete it
      const result = await deps.deleteScreenshot(lastScreenshot)
      
      // Notify the renderer about the change
      const mainWindow = deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("screenshot-deleted", { path: lastScreenshot })
      }
      
      return result
    } catch (error) {
      console.error("Error deleting last screenshot:", error)
      return { success: false, error: "Failed to delete last screenshot" }
    }
  })
}
