import React, { useState, useEffect, useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { ProgrammingLanguageSelector } from "./ProgrammingLanguageSelector"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { COMMAND_KEY } from "../../utils/platform"
import { useToast } from "../../contexts/toast"
import { debounce } from "lodash"

export interface TooltipItem {
  id: string;
  title: string;
  description: string;
  keys: string[];
  onClick: () => Promise<void>;
  isVisible?: boolean;
  isDisabled?: boolean;
}

export interface CommandBarProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void;
  credits: number;
  currentProgrammingLanguage: string;
  setProgrammingLanguage: (language: string) => void;
  onSignOut: () => Promise<void>;

  // Command Button Props
  showToggleWindowButton?: boolean;
  onToggleWindow: () => Promise<void>;
  toggleWindowButtonKeys?: string[]; // e.g., ['B']

  showScreenshotButton?: boolean;
  onScreenshot: () => Promise<void>;
  screenshotButtonText: string;
  screenshotButtonKeys?: string[]; // e.g., ['H']

  showProcessButton?: boolean;
  onProcess: () => Promise<void>;
  processButtonText: string;
  isProcessButtonDisabled?: boolean;
  processButtonKeys?: string[]; // e.g., ['↵']

  showResetButton?: boolean; // Can be Reset or Delete Last
  onReset: () => Promise<void>;
  resetButtonText: string;
  isResetButtonDisabled?: boolean;
  resetButtonKeys?: string[]; // e.g., ['R'] or ['L']

  // Tooltip Specific Props
  tooltipItems: TooltipItem[];
  showLanguageSwitcher?: boolean;
}

const CommandBar: React.FC<CommandBarProps> = ({
  onTooltipVisibilityChange,
  credits,
  currentProgrammingLanguage,
  setProgrammingLanguage,
  onSignOut,
  showToggleWindowButton = true,
  onToggleWindow,
  toggleWindowButtonKeys = ['B'],
  showScreenshotButton = true,
  onScreenshot,
  screenshotButtonText,
  screenshotButtonKeys = ['H'],
  showProcessButton = true,
  onProcess,
  processButtonText,
  isProcessButtonDisabled = false,
  processButtonKeys = ['↵'],
  showResetButton = true,
  onReset,
  resetButtonText,
  isResetButtonDisabled = false,
  resetButtonKeys = ['R'],
  tooltipItems,
  showLanguageSwitcher = false,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isShortcutsVisible, setIsShortcutsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const settingsIconRef = useRef<HTMLDivElement>(null); // Ref for the settings icon trigger
  const commandBarRef = useRef<HTMLDivElement>(null); // Ref for the entire command bar container
  const shortcutsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { showToast } = useToast();

  // State for dynamic tooltip position and style
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    transition: 'opacity 0.15s ease-in-out, transform 0.15s ease-in-out',
    transform: 'translateY(-4px)',
    zIndex: 100,
    width: '20rem',
  });

  const calculateTooltipPosition = useCallback(() => {
    if (!tooltipRef.current || !commandBarRef.current) {
      return null;
    }

    const commandBarRect = commandBarRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;

    // 计算最佳位置
    const positions = {
      right: {
        top: commandBarRect.top,
        left: commandBarRect.right + margin,
      },
      left: {
        top: commandBarRect.top,
        left: commandBarRect.left - tooltipRect.width - margin,
      },
      bottom: {
        top: commandBarRect.bottom + margin,
        left: commandBarRect.left,
      },
    };

    // 检查每个位置的可行性
    const isValidPosition = (pos: typeof positions.right) => {
      return (
        pos.left >= margin &&
        pos.left + tooltipRect.width <= viewportWidth - margin &&
        pos.top >= margin &&
        pos.top + tooltipRect.height <= viewportHeight - margin
      );
    };

    // 选择最佳位置
    let bestPosition = positions.right;
    if (isValidPosition(positions.right)) {
      bestPosition = positions.right;
    } else if (isValidPosition(positions.left)) {
      bestPosition = positions.left;
    } else {
      bestPosition = positions.bottom;
      // 确保不超出视窗
      bestPosition.left = Math.max(margin, Math.min(
        bestPosition.left,
        viewportWidth - tooltipRect.width - margin
      ));
    }

    return {
      ...tooltipStyle,
      top: `${bestPosition.top}px`,
      left: `${bestPosition.left}px`,
      opacity: 1,
      pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
      transform: 'translateY(0)',
    } as React.CSSProperties;
  }, []); // 移除 tooltipStyle 依赖，打破循环

  // Effect to handle tooltip visibility and positioning
  useEffect(() => {
    let tooltipHeight = 0;
    let animationFrame: number;

    if (isTooltipVisible) {
      animationFrame = requestAnimationFrame(() => {
        const newStyle = calculateTooltipPosition();
        if (newStyle) {
          setTooltipStyle(newStyle);
          tooltipHeight = tooltipRef.current?.getBoundingClientRect().height ?? 0;
          onTooltipVisibilityChange(true, tooltipHeight + 10);
        }
      });
    } else {
      setTooltipStyle(prev => ({
        ...prev,
        opacity: 0,
        pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
        transform: 'translateY(-4px)',
      }));
      onTooltipVisibilityChange(false, 0);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        settingsIconRef.current &&
        !settingsIconRef.current.contains(event.target as Node)
      ) {
        setIsTooltipVisible(false);
      }
    };

    const handleResize = debounce(() => {
      if (isTooltipVisible) {
        const newStyle = calculateTooltipPosition();
        if (newStyle) {
          setTooltipStyle(newStyle);
        }
      }
    }, 100);

    if (isTooltipVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [isTooltipVisible, calculateTooltipPosition, onTooltipVisibilityChange]);

  // Toggle tooltip visibility on settings icon click
  const handleSettingsClick = useCallback(() => {
    setIsTooltipVisible((prev) => !prev);
  }, []);

  // 处理快捷键按钮点击
  const handleShortcutsClick = useCallback(() => {
    setIsShortcutsVisible((prev) => !prev);
  }, []);

  // 点击外部时关闭快捷键列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shortcutsRef.current &&
        !shortcutsRef.current.contains(event.target as Node) &&
        !document.querySelector('[data-testid="shortcuts-button"]')?.contains(event.target as Node)
      ) {
        setIsShortcutsVisible(false);
      }
    };

    if (isShortcutsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShortcutsVisible]);

  const renderCommandButton = (
    isVisible: boolean | undefined,
    onClick: () => Promise<void>,
    text: string,
    keys: string[] | undefined,
    isDisabled: boolean | undefined,
    testId?: string
  ) => {
    if (!isVisible) return null;

    const handleClick = async () => {
      if (isDisabled) return;
      try {
        await onClick();
      } catch (error: any) {
        console.error(`Error executing command (${text}):`, error);
        const errorMessage = error?.message || `Failed to execute ${text.toLowerCase()}`;
        const translatedErrorMessage = t(errorMessage);
        const finalErrorMessage = (typeof translatedErrorMessage !== 'string' || translatedErrorMessage === errorMessage) ? errorMessage : translatedErrorMessage;
        showToast(t('toast.error'), finalErrorMessage, "error");
      }
    };

    return (
      <div
        className={`flex items-center gap-2 cursor-pointer rounded px-3 py-1.5 hover:bg-white/10 transition-colors ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        data-testid={testId}
      >
        <span className="text-[11px] leading-none whitespace-nowrap">{text}</span>
        {keys && keys.length > 0 && (
          <div className="flex gap-1">
            <button className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
              {COMMAND_KEY}
            </button>
            {keys.map((key) => (
              <button key={key} className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                {key}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTooltipItem = (item: TooltipItem) => {
    if (item.isVisible === false) return null; // Explicitly check for false

    const handleClick = async () => {
        if (item.isDisabled) return;
        try {
            await item.onClick();
            setIsTooltipVisible(false); // Close tooltip after action
        } catch (error: any) {
            console.error(`Error executing tooltip command (${item.title}):`, error);
            const errorMessage = error?.message || `Failed to execute ${item.title.toLowerCase()}`;
            const translatedErrorMessage = t(errorMessage);
            const finalErrorMessage = (typeof translatedErrorMessage !== 'string' || translatedErrorMessage === errorMessage) ? errorMessage : translatedErrorMessage;
            showToast(t('toast.error'), finalErrorMessage, "error");
        }
    };


    return (
      <div
        key={item.id}
        className={`cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors ${
          item.isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        data-testid={`tooltip-item-${item.id}`}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{item.title}</span>
          <div className="flex gap-1 flex-shrink-0">
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
              {COMMAND_KEY}
            </span>
            {item.keys.map((key) => (
              <span key={key} className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                {key}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
          {item.description}
        </p>
      </div>
    );
  };

  return (
    // Add ref to the outermost container
    <div ref={commandBarRef} className="pt-2 w-fit">
      {/* This inner div contains the visible buttons */}
      <div className="text-xs text-white/90 backdrop-blur-md bg-black/60 rounded-lg py-2 px-4 flex items-center justify-center gap-4">
        {renderCommandButton(showToggleWindowButton, onToggleWindow, t('button.toggleWindow.title'), toggleWindowButtonKeys, false, 'toggle-window-button')}
        {renderCommandButton(showScreenshotButton, onScreenshot, screenshotButtonText, screenshotButtonKeys, false, 'screenshot-button')}
        {renderCommandButton(showProcessButton, onProcess, processButtonText, processButtonKeys, isProcessButtonDisabled, 'process-button')}
        {renderCommandButton(showResetButton, onReset, resetButtonText, resetButtonKeys, isResetButtonDisabled, 'reset-button')}

        {/* 快捷键按钮 */}
        <div
          onClick={handleShortcutsClick}
          className="flex items-center gap-2 cursor-pointer rounded px-3 py-1.5 hover:bg-white/10 transition-colors"
          data-testid="shortcuts-button"
        >
          <span className="text-[11px] leading-none whitespace-nowrap">{t('shortcuts.title')}</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 flex items-center justify-center text-white/70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <rect x="6" y="8" width="3" height="3" />
                <rect x="11" y="8" width="3" height="3" />
                <rect x="16" y="8" width="3" height="3" />
                <rect x="6" y="13" width="3" height="3" />
                <rect x="11" y="13" width="3" height="3" />
                <rect x="16" y="13" width="3" height="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* 快捷键列表弹窗 */}
        {isShortcutsVisible && (
          <div
            ref={shortcutsRef}
            className="absolute mt-2 p-3 text-xs bg-black/90 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg z-50"
            style={{
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 10000
            }}
            data-testid="shortcuts-dropdown"
          >
            <h3 className="font-medium whitespace-nowrap mb-2">
              {t('shortcuts.title')}
            </h3>
            <div className="bg-black/40 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-white/80">{t('shortcuts.toggle_visibility')}</div>
                <div className="text-white font-mono">Ctrl+B / Cmd+B</div>
                
                <div className="text-white/80">{t('shortcuts.capture_screenshot')}</div>
                <div className="text-white font-mono">Ctrl+H / Cmd+H</div>
                
                <div className="text-white/80">{t('shortcuts.process_screenshots')}</div>
                <div className="text-white font-mono">Ctrl+Enter / Cmd+Enter</div>
                
                <div className="text-white/80">{t('shortcuts.delete_last')}</div>
                <div className="text-white font-mono">Ctrl+L / Cmd+L</div>
                
                <div className="text-white/80">{t('shortcuts.reset_view')}</div>
                <div className="text-white font-mono">Ctrl+R / Cmd+R</div>
                
                <div className="text-white/80">{t('shortcuts.quit_app')}</div>
                <div className="text-white font-mono">Ctrl+Q / Cmd+Q</div>
                
                <div className="text-white/80">{t('shortcuts.move_window')}</div>
                <div className="text-white font-mono">Ctrl+Arrow Keys</div>
                
                <div className="text-white/80">{t('shortcuts.decrease_opacity')}</div>
                <div className="text-white font-mono">Ctrl+[ / Cmd+[</div>
                
                <div className="text-white/80">{t('shortcuts.increase_opacity')}</div>
                <div className="text-white font-mono">Ctrl+] / Cmd+]</div>
                
                <div className="text-white/80">{t('shortcuts.zoom_out')}</div>
                <div className="text-white font-mono">Ctrl+- / Cmd+-</div>
                
                <div className="text-white/80">{t('shortcuts.reset_zoom')}</div>
                <div className="text-white font-mono">Ctrl+0 / Cmd+0</div>
                
                <div className="text-white/80">{t('shortcuts.zoom_in')}</div>
                <div className="text-white font-mono">Ctrl+= / Cmd+=</div>
              </div>
            </div>
          </div>
        )}

        {/* Separator */}
        {(showToggleWindowButton || showScreenshotButton || showProcessButton || showResetButton) && (
          <div className="mx-2 h-4 w-px bg-white/20" />
        )}

        {/* Settings Icon Trigger */}
        <div
          ref={settingsIconRef} // Assign ref to the trigger
          onClick={handleSettingsClick} // Use onClick handler
          className="relative inline-block cursor-pointer" // Keep relative for potential icon badges, add cursor-pointer
          data-testid="settings-tooltip-trigger"
        >
          {/* Gear icon */}
          <div className="w-4 h-4 flex items-center justify-center text-white/70 hover:text-white/90 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tooltip Content - Rendered outside the main bar flow, positioned fixed */}
      <div
        ref={tooltipRef}
        style={tooltipStyle} // Apply dynamic style for position and visibility
        data-testid="settings-tooltip-content"
      >
        <div className="p-3 text-xs bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg">
          <div className="space-y-4">
            <h3 className="font-medium whitespace-nowrap">
              {t('shortcuts.title')}
            </h3>
            <div className="space-y-3">
              {tooltipItems.map(renderTooltipItem)}
            </div>

            {/* Separator and Settings/Log Out */}
            <div className="pt-3 mt-3 border-t border-white/10">
              <ProgrammingLanguageSelector
                currentProgrammingLanguage={currentProgrammingLanguage}
                setProgrammingLanguage={setProgrammingLanguage}
              />

              {/* Interface Language Switcher (Conditional) */}
              {showLanguageSwitcher && (
                <div className="mb-3 px-2 space-y-1">
                  <div className="flex items-center justify-between text-[13px] font-medium text-white/90 mb-1">
                    <span>{t('settings.language')}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-md p-2">
                    <LanguageSwitcher variant="minimal" className="w-full" />
                  </div>
                </div>
              )}

              {/* API Key Settings */}
              <div className="mb-3 px-2 space-y-1">
                <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
                  <span>{t('settings.ApiSettings.title')}</span>
                  <button
                    className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[11px]"
                    onClick={() => window.electronAPI.openSettingsPortal()}
                  >
                    {t('settings.ApiSettings.button')}
                  </button>
                </div>
              </div>

              <button
                onClick={async () => { // Wrap signout to close tooltip
                  try {
                    await onSignOut();
                    setIsTooltipVisible(false);
                  } catch (error) {
                     console.error("Sign out error:", error);
                     // Toast is likely handled within onSignOut or its caller
                  }
                }}
                className="flex items-center gap-2 text-[11px] text-red-400 hover:text-red-300 transition-colors w-full"
                data-testid="sign-out-button"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                {t('settings.logout.title')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandBar