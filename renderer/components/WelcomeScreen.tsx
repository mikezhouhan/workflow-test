import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface WelcomeScreenProps {
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenSettings }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // 确保翻译已加载后再显示内容
  useEffect(() => {
    const checkTranslations = async () => {
      if (i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'translation')) {
        setIsLoading(false);
      } else {
        // 如果翻译资源尚未加载，等待一段时间再检查
        const timeout = setTimeout(() => {
          if (i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'translation')) {
            setIsLoading(false);
          } else {
            // 如果依然未加载，强制设置为不加载状态以显示内容
            console.warn('Translation resources not fully loaded, displaying content anyway');
            setIsLoading(false);
          }
        }, 1500);
        
        return () => clearTimeout(timeout);
      }
    };
    
    checkTranslations();
  }, [i18n]);

  // 显示加载状态
  if (isLoading) {
    // 获取当前浏览器语言作为回退选项
    const browserLang = navigator.language;
    const isZhCN = browserLang.startsWith('zh');
    
    // 由于i18n可能还没有完全加载，我们需要手动处理文本
    const loadingText = isZhCN ? "正在加载..." : "Loading...";
    
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
          <p className="text-white/70">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center p-6 relative"> {/* 添加 relative */}
      {/* 移除右上角的语言切换器，统一在设置中管理 */}
      <div className="max-w-md w-full bg-black border border-white/10 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>{t('app.title')}</span>
          <span className="text-sm font-normal px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md">Unlocked Edition</span>
        </h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-3">{t('welcome.title')}</h2>
          <p className="text-white/70 text-sm mb-4">
            {t('welcome.subtitle')}
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
            <h3 className="text-white/90 font-medium mb-2">{t('shortcuts.title')}</h3>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.toggle_visibility')}</span>
                <span className="text-white/90">Ctrl+B / Cmd+B</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.capture_screenshot')}</span>
                <span className="text-white/90">Ctrl+H / Cmd+H</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.delete_last')}</span>
                <span className="text-white/90">Ctrl+L / Cmd+L</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.process_screenshots')}</span>
                <span className="text-white/90">Ctrl+Enter / Cmd+Enter</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.reset_view')}</span>
                <span className="text-white/90">Ctrl+R / Cmd+R</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">{t('shortcuts.quit_app')}</span>
                <span className="text-white/90">Ctrl+Q / Cmd+Q</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-white/90 font-medium mb-2">{t('welcome.start')}</h3>
          <p className="text-white/70 text-sm mb-3">
            {t('settings.api_key_required')}
          </p>
          <Button 
            className="w-full px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            onClick={onOpenSettings}
          >
            {t('header.settings')}
          </Button>
        </div>
        
        <div className="text-white/40 text-xs text-center">
          {t('shortcuts.capture_screenshot')} (Ctrl+H / Cmd+H)
        </div>
      </div>
    </div>
  );
};