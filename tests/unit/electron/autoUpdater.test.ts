import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWindow, ipcMain, app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { initAutoUpdater } from '../../../electron/autoUpdater';

// 添加类型定义
interface UpdateCheckResult {
  updateInfo: { version: string };
  isUpdateAvailable: boolean;
  versionInfo: any;
}

// 模拟依赖
vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([{
      webContents: {
        send: vi.fn()
      }
    }])
  },
  app: {
    isPackaged: true,
    getVersion: vi.fn().mockReturnValue('1.0.0')
  },
  ipcMain: {
    handle: vi.fn()
  }
}));

// 修改 autoUpdater 模拟，确保 Promise 返回值
vi.mock('electron-updater', () => {
  // 创建模拟 checkForUpdates 函数
  const mockCheckForUpdates = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      updateInfo: { 
        version: '1.0.1',
        files: [],
        path: 'test',
        sha512: 'test',
        releaseDate: new Date().toISOString()
      },
      isUpdateAvailable: true,
      versionInfo: { version: '1.0.1' }
    });
  });
  
  // 创建模拟事件监听器对象
  const eventCallbacks = {};
  const mockOn = vi.fn().mockImplementation((event, callback) => {
    eventCallbacks[event] = callback;
    return autoUpdaterMock; // 返回模拟对象以支持链式调用
  });
  
  // 创建模拟自动更新器对象
  const autoUpdaterMock = {
    checkForUpdates: mockCheckForUpdates,
    on: mockOn,
    logger: null,
    autoDownload: false,
    autoInstallOnAppQuit: false,
    allowDowngrade: false,
    allowPrerelease: false,
    downloadUpdate: vi.fn().mockResolvedValue(undefined),
    quitAndInstall: vi.fn(),
    // 添加触发事件的辅助方法（供测试使用）
    __triggerEvent: (event, ...args) => {
      if (eventCallbacks[event]) {
        eventCallbacks[event](...args);
      }
    }
  };
  
  return {
    autoUpdater: autoUpdaterMock
  };
});

vi.mock('electron-log', () => ({
  default: {
    transports: {
      file: { level: null }
    },
    info: vi.fn(),
    error: vi.fn()
  }
}));

// 模拟环境变量
const originalEnv = { ...process.env };

describe('autoUpdater模块', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
    process.env.GH_TOKEN = 'test-token';
    
    // 重新设置 app.isPackaged 为 true，确保测试一致性
    const mockedApp = app as unknown as { isPackaged: boolean };
    mockedApp.isPackaged = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('应初始化自动更新器并设置正确的事件处理程序', () => {
    // 简单地使用 any 绕过类型检查，确保返回Promise
    vi.spyOn(autoUpdater, 'checkForUpdates').mockImplementation(() => {
      return Promise.resolve({
        updateInfo: { version: '1.0.1' },
        isUpdateAvailable: true,
        versionInfo: { version: '1.0.1' }
      }) as any;
    });
    
    // 初始化更新器
    initAutoUpdater();
    
    // 验证事件处理程序已设置
    expect(autoUpdater.on).toHaveBeenCalledWith('checking-for-update', expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith('update-available', expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith('update-not-available', expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith('download-progress', expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
    expect(autoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('应设置自动更新器选项', () => {
    // 确保返回Promise对象
    vi.spyOn(autoUpdater, 'checkForUpdates').mockImplementation(() => {
      return Promise.resolve({
        updateInfo: { version: '1.0.1' },
        isUpdateAvailable: true,
        versionInfo: { version: '1.0.1' }
      }) as any;
    });
    
    initAutoUpdater();
    
    // 验证自动更新器选项设置
    expect(autoUpdater.autoDownload).toBe(true);
    expect(autoUpdater.autoInstallOnAppQuit).toBe(true);
    expect(autoUpdater.allowDowngrade).toBe(true);
    expect(autoUpdater.allowPrerelease).toBe(true);
  });

  it('应在非打包环境中跳过更新检查', () => {
    // 修改 app.isPackaged 为 false
    const mockedApp = app as unknown as { isPackaged: boolean };
    mockedApp.isPackaged = false;
    
    initAutoUpdater();
    
    // 验证未调用检查更新
    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('应在没有GH_TOKEN时跳过更新', () => {
    // 移除 GH_TOKEN
    delete process.env.GH_TOKEN;
    
    initAutoUpdater();
    
    // 验证未调用检查更新
    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('应设置IPC处理程序以响应渲染进程消息', () => {
    // 修改 app.isPackaged 为 true 以确保 IPC 处理程序被设置
    const mockedApp = app as unknown as { isPackaged: boolean };
    mockedApp.isPackaged = true;
    
    // 确保返回Promise对象
    vi.spyOn(autoUpdater, 'checkForUpdates').mockImplementation(() => {
      return Promise.resolve({
        updateInfo: { version: '1.0.1' },
        isUpdateAvailable: true,
        versionInfo: { version: '1.0.1' }
      }) as any;
    });
    
    initAutoUpdater();
    
    // 验证IPC处理程序已设置
    expect(ipcMain.handle).toHaveBeenCalledWith('start-update', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('install-update', expect.any(Function));
  });

  it('应调用checkForUpdates', async () => {
    // 使用明确的模拟函数，返回Promise对象
    const mockCheckForUpdates = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        updateInfo: { version: '1.0.1' },
        isUpdateAvailable: true,
        versionInfo: { version: '1.0.1' }
      });
    });
    
    vi.spyOn(autoUpdater, 'checkForUpdates').mockImplementation(mockCheckForUpdates);
    
    // 模拟 setInterval
    const originalSetInterval = global.setInterval;
    global.setInterval = vi.fn() as any;
    
    // 初始化更新器
    initAutoUpdater();
    
    // 检查是否进行了初始检查
    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
    
    // 验证是否设置了间隔
    expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 60 * 60 * 1000);
    
    // 恢复原始 setInterval
    global.setInterval = originalSetInterval;
  });
}); 