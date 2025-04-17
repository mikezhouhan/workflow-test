import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; // 导入i18n配置

// 支持的语言列表
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  'zh-CN': { code: 'zh-CN', name: 'Chinese', nativeName: '中文' }
};

// 上下文类型定义
interface I18nContextType {
  language: string;
  languages: typeof LANGUAGES;
  changeLanguage: (lang: string) => Promise<void>;
}

// 创建上下文
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 上下文提供者组件
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  // 当i18n.language改变时更新状态
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  // 当组件挂载时，尝试从Electron获取语言设置
  useEffect(() => {
    const initLanguage = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getConfig) {
          const config = await window.electronAPI.getConfig();
          if (config && config.interfaceLanguage && config.interfaceLanguage !== i18n.language) {
            await i18n.changeLanguage(config.interfaceLanguage);
          }
        }
      } catch (error) {
        console.error('Failed to initialize language from config:', error);
      }
    };

    initLanguage();
  }, [i18n]);

  // 语言切换函数
  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      
      // i18n.ts已经配置了在语言改变时自动更新Electron的配置
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        languages: LANGUAGES,
        changeLanguage
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}; 