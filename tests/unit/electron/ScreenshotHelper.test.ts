import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScreenshotHelper } from "../../../electron/ScreenshotHelper";
// We will import the mocked modules after the vi.mock calls
// --- 统一模拟定义在顶部 ---
// Mock fs with default implementations
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  unlink: vi.fn(),
  promises: {
    readFile: vi.fn(),
    unlink: vi.fn(),
    writeFile: vi.fn(), // Add other promise methods if needed
  },
  // Add default export if needed by the code under test
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    unlink: vi.fn(),
    promises: {
      readFile: vi.fn(),
      unlink: vi.fn(),
      writeFile: vi.fn(),
    },
  }
}));
// Mock path with default implementations
vi.mock("node:path", () => ({
  join: vi.fn(),
  dirname: vi.fn(),
  basename: vi.fn(),
  // Add default export if needed
  default: {
    join: vi.fn(),
    dirname: vi.fn(),
    basename: vi.fn(),
  }
}));
// Mock electron app, specifically getPath to handle different path types
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => {
      if (name === 'userData') return '/mock/userData';
      if (name === 'temp') return '/mock/temp'; // Handle 'temp' path request
      return `/mock/${name}`; // Default mock path for other types
    }),
    // Add other app properties if needed by other tests
  },
  // Add other electron modules if needed
}));
vi.mock("uuid", () => ({ v4: vi.fn().mockReturnValue("mock-uuid") }));
vi.mock("child_process", () => {
  const mockCp = { execFile: vi.fn() };
  return { ...mockCp, default: mockCp };
});
// 提供 default 导出
vi.mock("util", () => {
  const mockUtil = { promisify: vi.fn().mockReturnValue(vi.fn().mockResolvedValue(null)) };
  return { ...mockUtil, default: mockUtil };
});
vi.mock("screenshot-desktop", () => ({ default: vi.fn().mockResolvedValue(Buffer.from("fake-screenshot-data")) }));
// --- End Top-Level Mocks ---

// --- Import Mocked Modules (using default imports) ---
import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron'; // Import specific mocked parts
// --- End Imports ---

describe("ScreenshotHelper", () => {
  let screenshotHelper;
  // No need for separate spy variables, access via vi.mocked(fs).existsSync etc.

  beforeEach(() => {
    // Clear call history but keep mock implementations from vi.mock
    vi.clearAllMocks();

    // Configure default mock behaviors for fs using vi.mocked
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fake-file-data"));
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);
    // Mock fs.unlink used in clearQueues (async)
    vi.mocked(fs.unlink).mockImplementation((_path, callback) => callback(null));
    // Mock fs.promises used in getImagePreview and deleteScreenshot
    vi.mocked(fs.promises.readFile).mockResolvedValue(Buffer.from("test image data")); // Correct data for preview test
    vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

    // Configure default mock behaviors for path using vi.mocked
    vi.mocked(path.join).mockImplementation((...args) => args.join('/')); // Simple join for testing paths
    vi.mocked(path.dirname).mockReturnValue('/mock/dirname');
    vi.mocked(path.basename).mockImplementation((p) => typeof p === 'string' ? p.split('/').pop() ?? '' : '');

    // Configure default mock behaviors for electron app
    // Remove this line - the vi.mock factory now handles different path types
    // vi.mocked(app.getPath).mockReturnValue("/mock/userData");

    // Create a new instance for each test AFTER mocks are configured
    screenshotHelper = new ScreenshotHelper();
  });

  it('应正确初始化并检查/创建目录', () => {
    // 验证目录初始化
    // Check calls on the mocked path module
    expect(vi.mocked(path.join)).toHaveBeenCalledWith('/mock/userData', 'screenshots');
    expect(vi.mocked(path.join)).toHaveBeenCalledWith('/mock/userData', 'extra_screenshots');
    // Correct the expected path for the temp directory
    expect(vi.mocked(path.join)).toHaveBeenCalledWith('/mock/temp', 'interview-coder-screenshots');

    // 验证检查目录存在
    expect(vi.mocked(fs.existsSync)).toHaveBeenCalled();
  });

  it('应创建不存在的目录', () => {
    // 模拟目录不存在
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // 创建新的ScreenshotHelper实例
    new ScreenshotHelper();

    // 验证创建了目录
    expect(vi.mocked(fs.mkdirSync)).toHaveBeenCalled();
  });

  it('应正确清理截图目录', () => {
    // 模拟目录中有文件
    vi.mocked(fs.readdirSync).mockReturnValue(['screenshot1.png', 'screenshot2.png'] as any); // Cast if needed

    // 调用私有方法
    (screenshotHelper as any).cleanScreenshotDirectories();

    // 验证读取了目录
    expect(vi.mocked(fs.readdirSync)).toHaveBeenCalled();

    // 验证删除了文件
    expect(vi.mocked(fs.unlinkSync)).toHaveBeenCalled();
  });

  it('应正确清理队列', () => {
    // 模拟队列中有文件
    (screenshotHelper as any).screenshotQueue = ['/path/to/screenshot1.png'];
    (screenshotHelper as any).extraScreenshotQueue = ['/path/to/extra1.png'];

    // 调用clearQueues方法
    screenshotHelper.clearQueues();

    // 验证删除了文件
    // clearQueues uses fs.unlink (async callback version)
    expect(vi.mocked(fs.unlink)).toHaveBeenCalled();

    // 验证队列被清空
    expect((screenshotHelper as any).screenshotQueue).toEqual([]);
    expect((screenshotHelper as any).extraScreenshotQueue).toEqual([]);
  });

  it("应该能够获取和设置视图", () => {
    // 验证默认视图是 queue
    expect(screenshotHelper.getView()).toBe("queue");

    // 设置为 gallery （因为默认已经是 queue，我们换一个值测试 setView）
    screenshotHelper.setView("gallery");
    expect(screenshotHelper.getView()).toBe("gallery");

    // 再次设置为 queue
    screenshotHelper.setView("queue");
    expect(screenshotHelper.getView()).toBe("queue");
  });

  it('应能获取截图队列', () => {
    // 模拟队列中有文件
    (screenshotHelper as any).screenshotQueue = ['/path/to/screenshot1.png', '/path/to/screenshot2.png'];

    // 获取队列
    const queue = screenshotHelper.getScreenshotQueue();

    // 验证返回了正确的队列
    expect(queue).toEqual(['/path/to/screenshot1.png', '/path/to/screenshot2.png']);
  });

  it('应能获取额外截图队列', () => {
    // 模拟额外队列中有文件
    (screenshotHelper as any).extraScreenshotQueue = ['/path/to/extra1.png', '/path/to/extra2.png'];

    // 获取额外队列
    const extraQueue = screenshotHelper.getExtraScreenshotQueue();

    // 验证返回了正确的队列
    expect(extraQueue).toEqual(['/path/to/extra1.png', '/path/to/extra2.png']);
  });

  it('应能获取图片预览', async () => {
    // 模拟文件存在
    vi.mocked(fs.existsSync).mockReturnValue(true); // Ensure existsSync is true for this test

    // 模拟读取文件
    // No need to spy again, beforeEach sets up fs.promises.readFile
    // const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from('test image data'));

    // 获取图片预览
    const preview = await screenshotHelper.getImagePreview('/path/to/image.png');

    // 验证返回了正确的预览数据
    // Base64 of 'test image data' is 'dGVzdCBpbWFnZSBkYXRh'
    expect(preview).toBe('data:image/png;base64,dGVzdCBpbWFnZSBkYXRh');

    // 恢复原始实现
    // readFileSpy.mockRestore(); // No longer needed
  });

  it('应能删除截图', async () => {
    // 模拟文件存在
    vi.mocked(fs.existsSync).mockReturnValue(true); // Ensure existsSync is true for this test

    // 模拟队列中有文件
    (screenshotHelper as any).screenshotQueue = ['/path/to/screenshot1.png', '/path/to/screenshot2.png'];

    // 删除截图
    const result = await screenshotHelper.deleteScreenshot('/path/to/screenshot1.png');

    // 验证删除成功
    expect(result.success).toBe(true);

    // 验证从队列中移除了文件
    expect((screenshotHelper as any).screenshotQueue).toEqual(['/path/to/screenshot2.png']);
  });

  it('应能清理额外截图队列', () => {
    // 模拟额外队列中有文件
    (screenshotHelper as any).extraScreenshotQueue = ['/path/to/extra1.png', '/path/to/extra2.png'];

    // 清理额外队列
    screenshotHelper.clearExtraScreenshotQueue();

    // 验证队列被清空
    expect((screenshotHelper as any).extraScreenshotQueue).toEqual([]);
  });
});