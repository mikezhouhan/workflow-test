import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendToMain, listenToMain, sendToMainAndListen } from '../../../../renderer/utils/ipc';

describe('IPC通信', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 确保window.electron已被模拟
    if (!window.electron) {
      Object.defineProperty(window, 'electron', {
        value: {
          ipcRenderer: {
            invoke: vi.fn(),
            send: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn()
          }
        },
        writable: true
      });
    }
  });

  it('sendToMain应该调用ipcRenderer.invoke', async () => {
    const mockResponse = { success: true, data: 'test-data' };
    window.electron.ipcRenderer.invoke = vi.fn().mockResolvedValue(mockResponse);

    const result = await sendToMain('test-channel', { id: 123 });

    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
      'test-channel',
      { id: 123 }
    );
    expect(result).toEqual(mockResponse);
  });

  it('listenToMain应该添加事件监听器', () => {
    const callback = vi.fn();
    const cleanup = listenToMain('test-event', callback);

    expect(window.electron.ipcRenderer.on).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function)
    );

    // 模拟事件触发
    const handler = (window.electron.ipcRenderer.on as any).mock.calls[0][1];
    handler({}, 'triggered-data');

    // 验证回调被调用
    expect(callback).toHaveBeenCalledWith('triggered-data');

    // 测试清理函数
    cleanup();

    expect(window.electron.ipcRenderer.removeListener).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function)
    );
  });

  it('sendToMainAndListen应该发送消息并等待响应', async () => {
    // 设置模拟
    window.electron.ipcRenderer.send = vi.fn();
    const listenSpy = vi.spyOn(window.electron.ipcRenderer, 'on');

    // 创建一个Promise来模拟异步响应
    const responsePromise = sendToMainAndListen('send-channel', 'response-channel', { data: 'test' });

    // 验证消息已发送
    expect(window.electron.ipcRenderer.send).toHaveBeenCalledWith('send-channel', { data: 'test' });

    // 验证监听器已设置
    expect(listenSpy).toHaveBeenCalledWith('response-channel', expect.any(Function));

    // 获取监听器回调
    const callback = listenSpy.mock.calls[0][1];

    // 触发响应
    (callback as any)({}, { result: 'success' });

    // 等待Promise解析
    const result = await responsePromise;

    // 验证结果
    expect(result).toEqual({ result: 'success' });
  });

  it('在错误情况下应处理错误', async () => {
    const mockError = new Error('IPC错误');
    window.electron.ipcRenderer.invoke = vi.fn().mockRejectedValue(mockError);

    // 测试错误处理
    try {
      await sendToMain('error-channel');
      // 如果没有抛出错误，测试应该失败
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe(mockError);
    }
  });

  it('当IPC不可用时应抛出错误', async () => {
    // 临时删除window.electron
    const originalElectron = window.electron;
    Object.defineProperty(window, 'electron', { value: undefined });

    // 测试sendToMain
    try {
      await sendToMain('test-channel');
      expect(true).toBe(false); // 应该不会执行到这里
    } catch (error) {
      expect((error as Error).message).toBe('IPC renderer not available');
    }

    // 测试listenToMain
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cleanup = listenToMain('test-channel', () => {});

    expect(consoleSpy).toHaveBeenCalledWith('IPC renderer not available');
    expect(typeof cleanup).toBe('function');

    // 恢复window.electron
    Object.defineProperty(window, 'electron', { value: originalElectron });
    consoleSpy.mockRestore();
  });
});