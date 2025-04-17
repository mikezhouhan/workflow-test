import { _electron as electron } from 'playwright';
import type { ElectronApplication } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// 确保截图目录存在
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const ARTIFACTS_DIR = path.join(SCREENSHOT_DIR, 'artifacts');
const FAILURES_DIR = path.join(SCREENSHOT_DIR, 'failures');

// 创建目录函数
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 确保所有需要的目录都存在
[SCREENSHOT_DIR, ARTIFACTS_DIR, FAILURES_DIR].forEach(ensureDirectoryExists);

/**
 * 启动Electron应用进行测试
 *
 * 这个函数会启动一个新的Electron应用实例进行E2E测试
 * 注意: 在运行测试前，需要先构建应用
 */
export async function launchElectronApp(): Promise<ElectronApplication> {
  console.log('启动Electron应用进行E2E测试...');

  // 构建主进程路径
  const mainPath = path.join(__dirname, '../../dist-electron/main.js');
  console.log(`使用主进程路径: ${mainPath}`);

  try {
    // 为每个测试会话生成唯一的应用名称，避免单例锁冲突
    const uniqueAppName = `test-app-${randomUUID().substring(0, 8)}`;
    console.log(`使用唯一应用名称: ${uniqueAppName}`);

    // 创建临时数据目录
    const tempDataDir = path.join(process.cwd(), '.temp-test-data', uniqueAppName);
    ensureDirectoryExists(tempDataDir);
    console.log(`创建临时数据目录: ${tempDataDir}`);

    // --- BEGIN INJECT DUMMY CONFIG ---
    // Write a dummy config file with an API key to bypass the WelcomeScreen
    const configPath = path.join(tempDataDir, 'config.json'); // Assuming electron-store uses config.json
    const dummyConfig = {
      apiKey: 'e2e-dummy-key-to-pass-check', // Provide a non-empty string
      programmingLanguage: 'python', // Default programming language for consistency
      interfaceLanguage: 'en', // Default interface language for consistency
      // Add other default config values if necessary
    };
    try {
      fs.writeFileSync(configPath, JSON.stringify(dummyConfig, null, 2));
      console.log(`写入虚拟配置文件到: ${configPath}`);
    } catch (writeError) {
      console.error(`写入虚拟配置文件失败: ${writeError.message}`);
      // Proceed anyway, but the test might still fail if config isn't read
    }
    // --- END INJECT DUMMY CONFIG ---

    // 启动Electron应用
    const electronApp = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // 禁用单例锁，防止多个实例冲突
        ELECTRON_NO_PROCESS_SINGLETON: '1',
        // 使用随机应用名称进一步避免冲突
        PLAYWRIGHT_TEST_APP_NAME: uniqueAppName,
        // 为每个测试实例使用不同的用户数据目录
        ELECTRON_TEST_TMPDIR: tempDataDir,
      },
      timeout: 60000, // 增加启动超时时间到60秒
    });

    console.log('Electron应用启动成功');

    // 等待应用初始化完成
    console.log('等待应用初始化...');

    // 添加额外的等待时间，确保应用完全初始化
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      console.log('获取应用窗口...');
      const window = await electronApp.firstWindow();
      console.log('已获取应用窗口');

      try {
        console.log('等待页面加载...');
        await window.waitForLoadState('domcontentloaded', { timeout: 30000 });
        console.log('页面加载完成');
      } catch (loadError) {
        console.log('等待页面加载状态时出错:', loadError.message);
        // 继续执行，不要因为加载状态问题中断测试
      }

      // 再次等待以确保UI完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (windowError) {
      console.log('获取窗口时出错:', windowError.message);
      // 尽管出错，仍然返回应用实例，让测试可以继续
    }

    return electronApp;
  } catch (error) {
    console.error('启动Electron应用时出错:', error);
    throw error;
  }
}

/**
 * 生成格式化的时间戳
 * 格式: YYYYMMDD-HHMMSS
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * 捕获屏幕截图并保存到组织好的目录中
 *
 * @param app Electron应用实例
 * @param name 截图标识名称
 * @param isFailure 是否为失败截图，如果是则保存到failures目录
 * @param fullPage 是否捕获全页面
 * @param timeout 截图超时时间（毫秒）
 */
export async function takeScreenshot(
  app: ElectronApplication,
  name: string,
  isFailure: boolean = false,
  fullPage: boolean = false,
  timeout: number = 10000
): Promise<void> {
  try {
    console.log(`尝试捕获截图: ${name}`);

    // 确定保存目录
    const dirPath = isFailure ? FAILURES_DIR : ARTIFACTS_DIR;
    ensureDirectoryExists(dirPath);

    // 生成文件名: timestamp-testname.png
    const timestamp = getTimestamp();
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
    const fileName = `${timestamp}-${sanitizedName}.png`;
    const filePath = path.join(dirPath, fileName);

    // 添加语言信息到截图中（如果可能）
    try {
      const window = await app.firstWindow();

      // 尝试检测当前语言
      await window.evaluate(() => {
        try {
          // 尝试在页面上添加一个临时标记，显示当前语言
          const langInfo = document.createElement('div');
          langInfo.style.position = 'fixed';
          langInfo.style.top = '10px';
          langInfo.style.right = '10px';
          langInfo.style.background = 'rgba(0,0,0,0.7)';
          langInfo.style.color = 'white';
          langInfo.style.padding = '5px 10px';
          langInfo.style.borderRadius = '4px';
          langInfo.style.fontSize = '12px';
          langInfo.style.zIndex = '9999';

          // 尝试获取当前语言
          const lang = document.documentElement.lang ||
                      localStorage.getItem('language') ||
                      (document.querySelector('html[lang]')?.getAttribute('lang')) ||
                      'unknown';

          langInfo.textContent = `Lang: ${lang}`;
          document.body.appendChild(langInfo);

          // 5秒后自动移除
          setTimeout(() => {
            try {
              document.body.removeChild(langInfo);
            } catch (e) {}
          }, 5000);

          return lang;
        } catch (e) {
          return null;
        }
      });

      // 等待一下，确保标记显示
      await new Promise(resolve => setTimeout(resolve, 200));

      // 保存截图
      await window.screenshot({
        path: filePath,
        fullPage,
        timeout
      });

      console.log(`截图已保存: ${path.relative(process.cwd(), filePath)}`);
    } catch (windowError) {
      console.error(`获取窗口或添加语言标记时出错:`, windowError.message);

      // 如果添加语言标记失败，仍然尝试正常捕获截图
      try {
        const window = await app.firstWindow();
        await window.screenshot({
          path: filePath,
          fullPage,
          timeout
        });
        console.log(`截图已保存(无语言标记): ${path.relative(process.cwd(), filePath)}`);
      } catch (fallbackError) {
        console.error(`备用截图方法也失败:`, fallbackError.message);
      }
    }
  } catch (error) {
    console.error(`捕获截图时出错 (${name}):`, error.message);
    // 不要因为截图失败而中断测试
  }
}

/**
 * 获取应用窗口的尺寸信息
 *
 * @param app Electron应用实例
 * @returns 窗口尺寸信息
 */
export async function getWindowSize(app: ElectronApplication): Promise<{ width: number; height: number }> {
  try {
    const window = await app.firstWindow();
    const boundingBox = await window.evaluate(() => {
      // Inside evaluate, we are in the browser context.
      // Access innerWidth/innerHeight directly from the global scope.
      return {
        width: innerWidth,
        height: innerHeight
      };
    });
    return boundingBox;
  } catch (error) {
    console.error('获取窗口尺寸失败:', error.message);
    return { width: 0, height: 0 };
  }
}