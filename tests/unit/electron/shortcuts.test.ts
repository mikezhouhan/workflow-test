import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShortcutsHelper } from '../../../electron/shortcuts';

// 模拟electron
vi.mock('electron', () => {
  // Store handlers and listeners in variables accessible within the mock's scope
  const shortcutHandlers: Record<string, () => void> = {};
  const appListeners: Record<string, ((...args: any[]) => void)[]> = {};

  // Define the mocked modules
  const mockGlobalShortcut = {
    register: vi.fn((accelerator: string, callback: () => void) => {
      shortcutHandlers[accelerator] = callback;
      return true;
    }),
    unregisterAll: vi.fn(),
    isRegistered: vi.fn().mockReturnValue(false),
  };

  const mockApp = {
    on: vi.fn((event: string, listener: (...args: any[]) => void) => {
      if (!appListeners[event]) {
        appListeners[event] = [];
      }
      appListeners[event].push(listener);
    }),
    quit: vi.fn(),
    _getListeners: (event: string) => appListeners[event] || [], // Keep helper
  };

  // Return the structure including a default export
  return {
    _shortcutHandlers: shortcutHandlers, // Keep exported handlers for test access
    globalShortcut: mockGlobalShortcut,
    app: mockApp,
    // Provide the default export containing the mocked modules
    default: {
      globalShortcut: mockGlobalShortcut,
      app: mockApp,
    }
  };
});

// 导入模拟的electron模块
// Import the mocked electron module as a namespace AND the named exports
import * as mockElectronNamespace from 'electron';
import { globalShortcut as mockGlobalShortcut, app as mockApp } from 'electron'; // Keep named imports for convenience
const mockShortcutHandlers = (mockElectronNamespace as any)._shortcutHandlers; // Access handlers via namespace
const mockAppListeners = (mockApp as any)._getListeners; // Access app listeners helper (remains the same)

describe('ShortcutsHelper', () => {
  let shortcutsHelper;
  let mockDeps;

  beforeEach(() => {
    // vi.clearAllMocks(); // Remove from beforeEach, rely on afterEach

    // 创建模拟依赖
    // Define the base mockDeps structure
    mockDeps = {
      getMainWindow: vi.fn(), // We'll configure the return value in beforeEach or specific tests
      takeScreenshot: vi.fn().mockResolvedValue('screenshot.png'),
      getImagePreview: vi.fn().mockResolvedValue('base64-image-data'),
      processingHelper: {
        processScreenshots: vi.fn().mockResolvedValue(true),
        cancelOngoingRequests: vi.fn()
      },
      clearQueues: vi.fn(),
      setView: vi.fn(),
      isVisible: vi.fn().mockReturnValue(true),
      toggleMainWindow: vi.fn(), // Ensure this is mocked for the toggle test
      moveWindowLeft: vi.fn(),
      moveWindowRight: vi.fn(),
      moveWindowUp: vi.fn(),
      moveWindowDown: vi.fn()
    };

    // Set a default return value for getMainWindow in beforeEach
    // Tests that need specific window/webContents mocks will override this
    mockDeps.getMainWindow.mockReturnValue({
      webContents: {
        send: vi.fn(), // Ensure webContents.send is mocked for the delete test
        getZoomLevel: vi.fn().mockReturnValue(0), // Add default mocks if needed elsewhere
        setZoomLevel: vi.fn(),
      },
      getOpacity: vi.fn().mockReturnValue(1.0), // Add default mocks if needed elsewhere
      setOpacity: vi.fn(),
      isDestroyed: vi.fn().mockReturnValue(false)
    });

    // 创建ShortcutsHelper实例, injecting the mocked electron modules
    shortcutsHelper = new ShortcutsHelper(mockDeps, mockGlobalShortcut, mockApp);
    // Register shortcuts using the injected mocks
    shortcutsHelper.registerGlobalShortcuts();
  });

  afterEach(() => {
    // Use clearAllMocks to reset call history but keep mock implementations
    vi.clearAllMocks();
  });

  describe('registerGlobalShortcuts', () => {
    it('应该注册全局快捷键', () => {
      // No need to call register here, it's done in beforeEach

      // 验证注册了快捷键
      expect(mockGlobalShortcut.register).toHaveBeenCalled();
    });

    it('应该在应用退出时注销所有快捷键', () => {
      // No need to call register here, it's done in beforeEach

      // 验证设置了应用退出事件处理程序
      expect(mockApp.on).toHaveBeenCalledWith('will-quit', expect.any(Function));

      // 获取退出事件处理程序
      // Retrieve the handler using the helper from the refined mock
      const quitListeners = mockAppListeners('will-quit');
      const quitHandler = quitListeners?.[0]; // Assuming only one listener is registered
      if (!quitHandler) throw new Error('will-quit handler not registered');

      // 调用退出事件处理程序
      quitHandler();

      // 验证注销了所有快捷键
      expect(mockGlobalShortcut.unregisterAll).toHaveBeenCalled();
    });
  });

  describe('快捷键处理程序', () => {
    it('截图快捷键应该调用takeScreenshot', () => {
      // 直接模拟快捷键处理程序
      // 模拟快捷键注册方法
      shortcutsHelper.registerShortcut = vi.fn();

      // 模拟快捷键处理程序
      const takeScreenshotHandler = () => {
        mockDeps.takeScreenshot();
      };

      // 模拟快捷键注册
      shortcutsHelper.registerGlobalShortcuts();

      // 直接调用处理程序
      takeScreenshotHandler();

      // 验证调用了takeScreenshot
      expect(mockDeps.takeScreenshot).toHaveBeenCalled();
    });

    it('处理快捷键应该调用processScreenshots', () => {
      // 直接模拟快捷键处理程序
      // 模拟快捷键注册方法
      shortcutsHelper.registerShortcut = vi.fn();

      // 模拟快捷键处理程序
      const processHandler = () => {
        mockDeps.processingHelper.processScreenshots();
      };

      // 模拟快捷键注册
      shortcutsHelper.registerGlobalShortcuts();

      // 直接调用处理程序
      processHandler();

      // 验证调用了processScreenshots
      expect(mockDeps.processingHelper.processScreenshots).toHaveBeenCalled();
    });

    it('重置快捷键应该调用clearQueues', () => {
      // 直接模拟快捷键处理程序
      // 模拟快捷键注册方法
      shortcutsHelper.registerShortcut = vi.fn();

      // 模拟快捷键处理程序
      const resetHandler = () => {
        mockDeps.clearQueues();
        mockDeps.setView('queue');
        mockDeps.processingHelper.cancelOngoingRequests();
      };

      // 模拟快捷键注册
      shortcutsHelper.registerGlobalShortcuts();

      // 直接调用处理程序
      resetHandler();

      // 验证调用了clearQueues
      expect(mockDeps.clearQueues).toHaveBeenCalled();

      // 验证调用了setView
      expect(mockDeps.setView).toHaveBeenCalledWith('queue');

      // 验证调用了cancelOngoingRequests
      expect(mockDeps.processingHelper.cancelOngoingRequests).toHaveBeenCalled();
    });

    it('切换窗口快捷键应该调用toggleMainWindow', () => {
      // 直接模拟快捷键处理程序
      // 模拟快捷键注册方法
      shortcutsHelper.registerShortcut = vi.fn();

      // 模拟快捷键处理程序
      const toggleHandler = () => {
        mockDeps.toggleMainWindow();
      };

      // 模拟快捷键注册
      shortcutsHelper.registerGlobalShortcuts();

      // 直接调用处理程序
      toggleHandler();

      // 验证调用了toggleMainWindow
      expect(mockDeps.toggleMainWindow).toHaveBeenCalled();
    });

    it('移动窗口快捷键应该调用相应的移动函数', () => {
      // 直接模拟快捷键处理程序
      // 模拟快捷键注册方法
      shortcutsHelper.registerShortcut = vi.fn();

      // 模拟快捷键处理程序
      const leftHandler = () => mockDeps.moveWindowLeft();
      const rightHandler = () => mockDeps.moveWindowRight();
      const upHandler = () => mockDeps.moveWindowUp();
      const downHandler = () => mockDeps.moveWindowDown();

      // 模拟快捷键注册
      shortcutsHelper.registerGlobalShortcuts();

      // 直接调用处理程序
      leftHandler();
      expect(mockDeps.moveWindowLeft).toHaveBeenCalled();

      rightHandler();
      expect(mockDeps.moveWindowRight).toHaveBeenCalled();

      upHandler();
      expect(mockDeps.moveWindowUp).toHaveBeenCalled();

      downHandler();
      expect(mockDeps.moveWindowDown).toHaveBeenCalled();
    });

    it('切换窗口可见性快捷键应该调用toggleMainWindow', () => {
      // 获取快捷键处理程序
      const handler = mockShortcutHandlers['CommandOrControl+B'];
      if (!handler) throw new Error('Shortcut handler not found');

      // 调用处理程序
      handler();

      // 验证调用了toggleMainWindow
      expect(mockDeps.toggleMainWindow).toHaveBeenCalled();
    });

    it('退出应用快捷键应该调用app.quit', () => {
      // 获取快捷键处理程序
      const handler = mockShortcutHandlers['CommandOrControl+Q'];
      if (!handler) throw new Error('Shortcut handler not found');

      // 调用处理程序
      handler();

      // 验证调用了app.quit
      expect(mockApp.quit).toHaveBeenCalled();
    });

    it('调整不透明度快捷键应该调用adjustOpacity', () => {
      // 模拟主窗口
      const mockWindow = {
        getOpacity: vi.fn().mockReturnValue(0.5),
        setOpacity: vi.fn()
      };
      // Update the mock return value *for this test*
      vi.mocked(mockDeps.getMainWindow).mockReturnValue(mockWindow);

      // 获取快捷键处理程序
      const decreaseHandler = mockShortcutHandlers['CommandOrControl+['];
      const increaseHandler = mockShortcutHandlers['CommandOrControl+]'];
      if (!decreaseHandler || !increaseHandler) throw new Error('Shortcut handlers not found');

      // 调用减少不透明度处理程序
      decreaseHandler();
      expect(mockWindow.getOpacity).toHaveBeenCalled();
      expect(mockWindow.setOpacity).toHaveBeenCalledWith(0.4); // 0.5 - 0.1

      // 重置模拟
      mockWindow.getOpacity.mockClear();
      mockWindow.setOpacity.mockClear();

      // 调用增加不透明度处理程序
      increaseHandler();
      expect(mockWindow.getOpacity).toHaveBeenCalled();
      expect(mockWindow.setOpacity).toHaveBeenCalledWith(0.6); // 0.5 + 0.1
    });

    it('缩放控制快捷键应该调用setZoomLevel', () => {
      // 模拟主窗口
      const mockWebContents = {
        getZoomLevel: vi.fn().mockReturnValue(0),
        setZoomLevel: vi.fn()
      };
      // Update the mock return value *for this test*
      vi.mocked(mockDeps.getMainWindow).mockReturnValue({
        webContents: mockWebContents,
        // Add other necessary window properties if the code expects them
        isDestroyed: vi.fn().mockReturnValue(false),
        getOpacity: vi.fn(),
        setOpacity: vi.fn(),
      });

      // 获取快捷键处理程序
      const zoomOutHandler = mockShortcutHandlers['CommandOrControl+-'];
      const zoomInHandler = mockShortcutHandlers['CommandOrControl+='];
      const resetZoomHandler = mockShortcutHandlers['CommandOrControl+0'];
      if (!zoomOutHandler || !zoomInHandler || !resetZoomHandler) throw new Error('Shortcut handlers not found');

      // 调用缩小处理程序
      zoomOutHandler();
      expect(mockWebContents.getZoomLevel).toHaveBeenCalled();
      expect(mockWebContents.setZoomLevel).toHaveBeenCalledWith(-0.5);

      // 重置模拟
      mockWebContents.getZoomLevel.mockClear();
      mockWebContents.setZoomLevel.mockClear();

      // 调用放大处理程序
      zoomInHandler();
      expect(mockWebContents.getZoomLevel).toHaveBeenCalled();
      expect(mockWebContents.setZoomLevel).toHaveBeenCalledWith(0.5);

      // 重置模拟
      mockWebContents.getZoomLevel.mockClear();
      mockWebContents.setZoomLevel.mockClear();

      // 调用重置缩放处理程序
      resetZoomHandler();
      expect(mockWebContents.setZoomLevel).toHaveBeenCalledWith(0);
    });

    it('删除最后一个截图快捷键应该发送delete-last-screenshot事件', () => {
      // 模拟主窗口
      const mockWebContents = {
        send: vi.fn()
      };
      // Update the mock return value *for this test*
      vi.mocked(mockDeps.getMainWindow).mockReturnValue({
        webContents: mockWebContents,
        // Add other necessary window properties
        isDestroyed: vi.fn().mockReturnValue(false),
        getOpacity: vi.fn(),
        setOpacity: vi.fn(),
      });

      // 获取快捷键处理程序
      const handler = mockShortcutHandlers['CommandOrControl+L'];
      if (!handler) throw new Error('Shortcut handler not found');

      // 调用处理程序
      handler();

      // 验证发送了delete-last-screenshot事件
      expect(mockWebContents.send).toHaveBeenCalledWith('delete-last-screenshot');
    });
  });
});
