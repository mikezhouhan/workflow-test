// 导入主代码中的 ElectronAPI 类型
import type { ElectronAPI } from '../renderer/types/electron';

// 扩展全局 Window 接口
// 扩展全局 Window 接口
// 注意：renderer/types/electron.d.ts 已经定义了 electronAPI, electron, __CREDITS__ 等
// 这里我们只添加测试环境特有的或确保类型兼容
declare global {
  interface Window {
    // 确保 electronAPI 类型来自导入，覆盖或合并 renderer/types/electron.d.ts 中的定义
    electronAPI: ElectronAPI;

    // 如果其他测试确实需要一个与 renderer/types/electron.d.ts 中不同的 electron 定义，
    // 可以保留它，但最好保持一致。暂时注释掉以避免冲突。
    /*
    electron?: {
      ipcRenderer: {
        invoke: (channel: string, data?: any) => Promise<any>;
        send: (channel: string, data?: any) => void;
        on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        once: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeAllListeners?: (channel: string) => void;
      };
    };
    */

    // 同样，注释掉与 renderer/types/electron.d.ts 重复的声明
    // __CREDITS__?: number;
    // __LANGUAGE__?: string;
    // __IS_INITIALIZED__?: boolean;
    // __AUTH_TOKEN__?: string | null;
  }
}

// 声明vi全局变量，用于vitest
declare namespace Vi {
  export interface Assertion {
    toBeInTheDocument(): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveStyle(style: Record<string, any>): void;
    toHaveClass(className: string): void;
    toBeVisible(): void;
    toBeDisabled(): void;
    toBeChecked(): void;
    toHaveValue(value: any): void;
    toHaveTextContent(text: string | RegExp): void;
  }
} 