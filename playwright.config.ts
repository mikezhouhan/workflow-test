import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // 重要：必须限制为单个worker，多个worker会导致Electron实例之间的资源冲突
  // 包括：端口冲突、单例锁争用、屏幕截图错乱等问题
  // 请勿修改此设置，即使在CI环境中也应保持为1
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  outputDir: path.join(__dirname, 'tests/e2e/test-results'),
  snapshotDir: path.join(__dirname, 'tests/e2e/screenshots/snapshots'),
  preserveOutput: 'failures-only',
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.spec\.ts/,
      use: {
        contextOptions: {
          acceptDownloads: true,
        },
        launchOptions: {
          slowMo: 100,
        },
      },
    },
  ],
  expect: {
    timeout: 10000,
  },
};

export default config;