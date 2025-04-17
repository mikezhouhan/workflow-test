import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { OpenAI } from 'openai'; // Import OpenAI for mocking constructor

// Mock ConfigHelper *before* importing ProcessingHelper
vi.mock('../../../electron/ConfigHelper', () => ({
  configHelper: {
    loadConfig: vi.fn().mockReturnValue({
      apiKey: 'test-key',
      apiProvider: 'openai', // Changed to openai
      extractionModel: 'gpt-4o-mini', // Changed to openai model
      solutionModel: 'gpt-4o-mini', // Changed to openai model
      debuggingModel: 'gpt-4o-mini', // Changed to openai model
      programmingLanguage: 'python',
      opacity: 1.0,
      interfaceLanguage: 'en' // Add missing field
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
    hasApiKey: vi.fn().mockReturnValue(true),
    testApiKey: vi.fn().mockResolvedValue({ valid: true })
  }
}));

// Now import ProcessingHelper and the mocked configHelper
import { ProcessingHelper } from '../../../electron/ProcessingHelper';
import { configHelper as mockConfigHelper } from '../../../electron/ConfigHelper';
// 模拟依赖
// Mock axios and provide a default implementation for post
vi.mock('axios', () => ({
  default: { // Assuming axios is used as default import or require('axios')
    post: vi.fn().mockResolvedValue({ // Mock for OpenAI structure
      data: {
        choices: [{
          message: {
            content: '{"problem_statement": "Mock Problem", "constraints": "Mock Constraints", "example_input": "Mock Input", "example_output": "Mock Output"}'
          },
          finish_reason: 'stop'
        }]
      }
    }),
    isCancel: vi.fn().mockReturnValue(false), // Mock isCancel if needed
    // Add other axios methods if they are used and need mocking
  },
  post: vi.fn().mockResolvedValue({ // Mock for OpenAI structure if used as import { post }
      data: {
        choices: [{
          message: {
            content: '{"problem_statement": "Mock Problem", "constraints": "Mock Constraints", "example_input": "Mock Input", "example_output": "Mock Output"}'
          },
          finish_reason: 'stop'
        }]
      }
  }),
  isCancel: vi.fn().mockReturnValue(false),
}));
// Mock OpenAI constructor *before* importing ProcessingHelper
vi.mock('openai', () => {
  // Keep track of the mock constructor to assert calls
  const mockConstructor = vi.fn();
  // Return the mocked class structure
  return {
    OpenAI: mockConstructor
  };
});
// Use importOriginal to properly mock 'node:fs' with a default export
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('node:fs'); // Cast to get types
  return {
    ...actual, // Keep original exports
    default: { // Mock the default export
      ...actual, // Include original default methods if any (like promises)
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue(Buffer.from('file content')),
      // Ensure promises are also included if needed, or mock them here
      promises: {
        ...actual.promises, // Keep original promise methods
        readFile: vi.fn().mockResolvedValue(Buffer.from('file content')),
        writeFile: vi.fn().mockResolvedValue(undefined),
        unlink: vi.fn().mockResolvedValue(undefined)
      }
    },
    // Also mock top-level exports if used directly (like fs.promises.readFile)
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue(Buffer.from('file content')),
    promises: {
       ...actual.promises,
       readFile: vi.fn().mockResolvedValue(Buffer.from('file content')),
       writeFile: vi.fn().mockResolvedValue(undefined),
       unlink: vi.fn().mockResolvedValue(undefined)
    }
  };
});

// Duplicate mock definition removed. The one at the top (lines 4-21) is used.

// 模拟electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn().mockImplementation(() => ({
    webContents: {
      send: vi.fn(),
      executeJavaScript: vi.fn().mockResolvedValue(true)
    },
    isDestroyed: vi.fn().mockReturnValue(false)
  })),
  dialog: {
    showMessageBox: vi.fn().mockResolvedValue({ response: 0 })
  },
  app: {
    getPath: vi.fn(() => '/mock/path')
  }
}));

describe('ProcessingHelper', () => {
  let processingHelper: ProcessingHelper;
  let mockDeps: any;

  beforeEach(() => {
    // Clear call history before each test
    vi.clearAllMocks();
    // Reset OpenAI mock constructor calls before each test
    vi.mocked(OpenAI).mockClear();

    // Explicitly set the default return value for loadConfig before each test
    // This ensures tests don't interfere with each other's config state
    vi.mocked(mockConfigHelper.loadConfig).mockReturnValue({
      apiKey: 'test-key',
      apiProvider: 'openai', // Changed to openai
      extractionModel: 'gpt-4o-mini', // Changed to openai model
      solutionModel: 'gpt-4o-mini', // Changed to openai model
      debuggingModel: 'gpt-4o-mini', // Changed to openai model
      programmingLanguage: 'python',
      opacity: 1.0,
      interfaceLanguage: 'en' // Add missing field
    });
    // Also ensure hasApiKey returns true by default
    vi.mocked(mockConfigHelper.hasApiKey).mockReturnValue(true);

    // 模拟ScreenshotHelper
    const mockScreenshotHelper = {
      getView: vi.fn().mockReturnValue('queue'),
      setView: vi.fn(),
      getScreenshotQueue: vi.fn().mockReturnValue(['/path/to/screenshot.png']),
      getExtraScreenshotQueue: vi.fn().mockReturnValue([]),
      clearQueues: vi.fn(),
      getImagePreview: vi.fn().mockResolvedValue('data:image/png;base64,test'),
      deleteScreenshot: vi.fn().mockResolvedValue({ success: true })
    };

    // 模拟依赖对象
    mockDeps = {
      getScreenshotHelper: vi.fn().mockReturnValue(mockScreenshotHelper),
      getMainWindow: vi.fn().mockReturnValue({
        webContents: {
          send: vi.fn(),
          executeJavaScript: vi.fn().mockResolvedValue(true)
        },
        isDestroyed: vi.fn().mockReturnValue(false)
      }),
      getView: vi.fn().mockReturnValue('queue'),
      setView: vi.fn(),
      getProblemInfo: vi.fn().mockReturnValue(null),
      setProblemInfo: vi.fn(),
      getScreenshotQueue: vi.fn().mockReturnValue(['/path/to/screenshot.png']),
      getExtraScreenshotQueue: vi.fn().mockReturnValue([]),
      clearQueues: vi.fn(),
      takeScreenshot: vi.fn().mockResolvedValue('/path/to/new-screenshot.png'),
      getImagePreview: vi.fn().mockResolvedValue('data:image/png;base64,test'),
      deleteScreenshot: vi.fn().mockResolvedValue({ success: true }),
      setHasDebugged: vi.fn(),
      getHasDebugged: vi.fn().mockReturnValue(false),
      PROCESSING_EVENTS: {
        UNAUTHORIZED: 'processing-unauthorized',
        NO_SCREENSHOTS: 'processing-no-screenshots',
        OUT_OF_CREDITS: 'out-of-credits',
        API_KEY_INVALID: 'api-key-invalid',
        INITIAL_START: 'initial-start',
        PROBLEM_EXTRACTED: 'problem-extracted',
        SOLUTION_SUCCESS: 'solution-success',
        INITIAL_SOLUTION_ERROR: 'solution-error',
        DEBUG_START: 'debug-start',
        DEBUG_SUCCESS: 'debug-success',
        DEBUG_ERROR: 'debug-error'
      }
    };

    // 创建实例
    processingHelper = new ProcessingHelper(mockDeps);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应创建与依赖对象的正确引用', () => {
    expect((processingHelper as any).deps).toBe(mockDeps);
  });

  it('waitForInitialization应等待初始化完成', async () => {
    const mainWindow = mockDeps.getMainWindow();
    await (processingHelper as any).waitForInitialization(mainWindow);
    expect(mainWindow.webContents.executeJavaScript).toHaveBeenCalled();
  });

  it('processScreenshots在没有截图时应发送NO_SCREENSHOTS事件', async () => {
    // 模拟空队列
    mockDeps.getScreenshotHelper().getScreenshotQueue.mockReturnValueOnce([]);

    await processingHelper.processScreenshots();

    // 验证发送了NO_SCREENSHOTS事件
    expect(mockDeps.getMainWindow().webContents.send).toHaveBeenCalledWith(
      mockDeps.PROCESSING_EVENTS.NO_SCREENSHOTS
    );
  });

  it('processScreenshots在没有API密钥时应发送API_KEY_INVALID事件', async () => {
    // 1. Mock loadConfig to return config without API key
    vi.mocked(mockConfigHelper.loadConfig).mockReturnValue({
      apiKey: '', // Simulate no API key
      apiProvider: 'openai', // Changed to openai
      extractionModel: 'gpt-4o-mini', // Changed to openai model
      solutionModel: 'gpt-4o-mini', // Changed to openai model
      debuggingModel: 'gpt-4o-mini', // Changed to openai model
      programmingLanguage: 'python',
      opacity: 1.0,
      interfaceLanguage: 'en' // Add missing field
    });

    // 2. Create a *new* ProcessingHelper instance AFTER setting the mock.
    //    This ensures its constructor uses the mocked config.
    const helperWithNoKey = new ProcessingHelper(mockDeps);

    // 3. Mock getScreenshotQueue for this specific instance/test
    mockDeps.getScreenshotHelper().getScreenshotQueue.mockReturnValueOnce(['/path/to/screenshot.png']); // Ensure queue is not empty

    // 4. Call processScreenshots on the new instance
    await helperWithNoKey.processScreenshots();

    // 5. Verify the API_KEY_INVALID event was sent
    expect(mockDeps.getMainWindow().webContents.send).toHaveBeenCalledWith(
      mockDeps.PROCESSING_EVENTS.API_KEY_INVALID
    );

    // 6. No need to restore mock here, clearAllMocks in afterEach handles call history.
    //    The top-level mock provides the default implementation for subsequent tests.
    // vi.mocked(mockConfigHelper.loadConfig).mockRestore();
  });

  it('cancelOngoingRequests应取消所有进行中的请求', () => {
    // 模拟AbortController
    const mockAbort = vi.fn();
    (processingHelper as any).currentProcessingAbortController = { abort: mockAbort };
    (processingHelper as any).currentExtraProcessingAbortController = { abort: mockAbort };

    processingHelper.cancelOngoingRequests();

    // 验证调用了abort方法
    expect(mockAbort).toHaveBeenCalledTimes(2);

    // 验证重置了状态
    expect(mockDeps.setHasDebugged).toHaveBeenCalledWith(false);
    expect(mockDeps.setProblemInfo).toHaveBeenCalledWith(null);
  });

  it('getCredits应返回信用额度', async () => {
    const getCreditsMethod = (processingHelper as any).getCredits;
    const credits = await getCreditsMethod.call(processingHelper);
    expect(credits).toBe(999); // 默认返回999
  });

  it('应在solutions视图中处理额外的截图', async () => {
    // 模拟solutions视图
    mockDeps.getView.mockReturnValueOnce('solutions');

    // 模拟有额外截图
    mockDeps.getScreenshotHelper().getExtraScreenshotQueue.mockReturnValueOnce(['/path/to/extra.png']);

    // 模拟有问题信息
    mockDeps.getProblemInfo.mockReturnValueOnce({
      problem_statement: 'Test problem',
      constraints: 'Test constraints',
      example_input: 'Test input',
      example_output: 'Test output'
    });

    await processingHelper.processScreenshots();

    // 验证发送了DEBUG_START事件
    expect(mockDeps.getMainWindow().webContents.send).toHaveBeenCalledWith(
      mockDeps.PROCESSING_EVENTS.DEBUG_START
    );
  });

  it('应使用环境变量中的 OPENAI_BASE_URL 初始化 OpenAI 客户端', () => {
    const customBaseUrl = 'http://localhost:1234/v1';
    vi.stubGlobal('process', { ...process, env: { ...process.env, OPENAI_BASE_URL: customBaseUrl } });

    // Re-initialize or create a new instance to trigger initializeAIClient with the stubbed env
    new ProcessingHelper(mockDeps);

    expect(OpenAI).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'test-key',
      baseURL: customBaseUrl, // Verify custom URL is used
      timeout: 60000,
      maxRetries: 2
    }));

    vi.unstubAllGlobals(); // Clean up global stub
  });

  it('当 OPENAI_BASE_URL 未设置时，应使用默认 Base URL 初始化 OpenAI 客户端', () => {
    // Ensure OPENAI_BASE_URL is not set in process.env for this test
    const envWithoutBaseUrl = { ...process.env };
    delete envWithoutBaseUrl.OPENAI_BASE_URL;
    vi.stubGlobal('process', { ...process, env: envWithoutBaseUrl });

    // Re-initialize or create a new instance
    new ProcessingHelper(mockDeps);

    expect(OpenAI).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1', // Verify default URL is used
      timeout: 60000,
      maxRetries: 2
    }));

    vi.unstubAllGlobals(); // Clean up global stub
  });
});