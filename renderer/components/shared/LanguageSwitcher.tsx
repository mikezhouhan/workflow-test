import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n, LANGUAGES } from '../../contexts/i18n';
import { Button } from '../ui/button';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'full';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'full',
  className = ''
}) => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useI18n();

  // 简化的语言切换器，只有图标或短名
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {Object.values(LANGUAGES).map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`min-w-10 h-8 px-2.5 rounded-md flex items-center justify-center transition-all duration-200 text-sm
              ${language === lang.code 
                ? 'bg-white/20 text-white' 
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'
              }
            `}
            aria-label={t(`settings.language_${lang.code === 'en' ? 'english' : 'chinese'}`)}
            title={t(`settings.language_${lang.code === 'en' ? 'english' : 'chinese'}`)}
          >
            <span className="mr-1">{lang.code === 'en' ? '🇺🇸' : '🇨🇳'}</span>
            <span className="text-xs">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  // 完整的语言切换器，带有语言名称
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-white/80">
        {t('settings.language')}
      </label>
      <div className="flex items-center space-x-2">
        {Object.values(LANGUAGES).map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`py-1.5 px-3 rounded-md flex items-center justify-center transition-all duration-200
              ${language === lang.code 
                ? 'bg-white/20 text-white font-medium' 
                : 'bg-transparent text-white/60 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="mr-2">{lang.code === 'en' ? '🇺🇸' : '🇨🇳'}</span>
            <span>{t(`settings.language_${lang.code === 'en' ? 'english' : 'chinese'}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 