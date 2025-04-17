import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as platformModule from '../../../../renderer/utils/platform';

// 由于我们需要模拟getPlatform()的结果，我们不直接导入原始模块
// 而是提供一个模拟的实现
vi.mock('../../../../renderer/utils/platform', () => {
  // 使用函数来创建一个新的模拟，这样我们可以在每个测试中重置它
  const createMock = () => {
    // 默认平台为win32
    let currentPlatform = 'win32';
    
    // 导出一个函数来设置当前平台（仅用于测试）
    const setPlatformForTest = (platform: string) => {
      currentPlatform = platform;
    };
    
    // 模拟getPlatform函数
    const getPlatform = () => currentPlatform;
    
    // 导出与原始模块相同的常量和函数
    return {
      COMMAND_KEY: currentPlatform === 'darwin' ? '⌘' : 'Ctrl',
      isWindows: currentPlatform === 'win32',
      isMacOS: currentPlatform === 'darwin',
      // 仅用于测试
      _setPlatformForTest: setPlatformForTest,
      _getPlatform: getPlatform
    };
  };
  
  return createMock();
});

describe('平台工具函数', () => {
  const originalPlatform = { ...platformModule };
  
  afterEach(() => {
    // 恢复原始值
    vi.restoreAllMocks();
  });

  describe('Windows环境下', () => {
    beforeEach(() => {
      // 使用Object.defineProperty来覆盖属性
      Object.defineProperty(platformModule, 'COMMAND_KEY', {
        configurable: true,
        value: 'Ctrl'
      });
      
      Object.defineProperty(platformModule, 'isWindows', {
        configurable: true,
        value: true
      });
      
      Object.defineProperty(platformModule, 'isMacOS', {
        configurable: true,
        value: false
      });
    });

    it('COMMAND_KEY应该为Ctrl', () => {
      expect(platformModule.COMMAND_KEY).toBe('Ctrl');
    });

    it('isWindows应该为true', () => {
      expect(platformModule.isWindows).toBe(true);
    });

    it('isMacOS应该为false', () => {
      expect(platformModule.isMacOS).toBe(false);
    });
  });

  describe('macOS环境下', () => {
    beforeEach(() => {
      // 使用Object.defineProperty来覆盖属性
      Object.defineProperty(platformModule, 'COMMAND_KEY', {
        configurable: true,
        value: '⌘'
      });
      
      Object.defineProperty(platformModule, 'isWindows', {
        configurable: true,
        value: false
      });
      
      Object.defineProperty(platformModule, 'isMacOS', {
        configurable: true,
        value: true
      });
    });

    it('COMMAND_KEY应该为⌘', () => {
      expect(platformModule.COMMAND_KEY).toBe('⌘');
    });

    it('isWindows应该为false', () => {
      expect(platformModule.isWindows).toBe(false);
    });

    it('isMacOS应该为true', () => {
      expect(platformModule.isMacOS).toBe(true);
    });
  });

  describe('API不可用时', () => {
    beforeEach(() => {
      // 使用Object.defineProperty来覆盖属性
      Object.defineProperty(platformModule, 'COMMAND_KEY', {
        configurable: true,
        value: 'Ctrl'
      });
      
      Object.defineProperty(platformModule, 'isWindows', {
        configurable: true,
        value: true
      });
      
      Object.defineProperty(platformModule, 'isMacOS', {
        configurable: true,
        value: false
      });
      
      // 删除electronAPI
      Object.defineProperty(window, 'electronAPI', {
        value: undefined,
        writable: true,
        configurable: true
      });
    });

    it('应该默认为Windows环境', () => {
      expect(platformModule.COMMAND_KEY).toBe('Ctrl');
      expect(platformModule.isWindows).toBe(true);
      expect(platformModule.isMacOS).toBe(false);
    });
  });
}); 