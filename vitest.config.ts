import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // 切换到 jsdom
    setupFiles: './tests/setup.ts',
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/dist-electron/**', 
      '**/tests/e2e/**', // 明确排除E2E测试目录
      '**/*.spec.ts', // 排除所有Playwright测试文件
    ],
    include: [
      'tests/unit/**/*.test.ts', // 包含新的测试目录
      'tests/unit/**/*.test.tsx',
    ],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'tests/unit/coverage', 
      all: true,
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
      include: ['renderer/**', 'electron/**', 'tests/unit/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 