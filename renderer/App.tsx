import SubscribedApp from "./_pages/SubscribedApp"
import { UpdateNotification } from "./components/UpdateNotification"
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "./components/ui/toast"
import { ToastContext } from "./contexts/toast"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { SettingsDialog } from "./components/Settings/SettingsDialog"
// 导入i18n提供者
import { I18nProvider } from "./contexts/i18n"
// 导入翻译钩子
import { useTranslation } from "react-i18next"
// 导入语言选择器组件
import { LanguageSwitcher } from "./components/shared/LanguageSwitcher"
// 注意: 不需要在这里导入i18n实例，因为它已经在main.tsx中被导入

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: Infinity,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})

// 加载指示器组件
const LoadingIndicator = () => {
  // 获取当前浏览器语言作为回退选项
  const browserLang = navigator.language;
  const isZhCN = browserLang.startsWith('zh');
  
  // 由于i18n还没有加载完成，我们需要手动处理文本
  const loadingText = isZhCN ? "正在加载应用..." : "Loading application...";
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="text-white/70 text-sm">{loadingText}</p>
      </div>
    </div>
  );
};

// Root component that provides the QueryClient
function App() {
  // 使用翻译钩子
  const { t, i18n, ready } = useTranslation();
  
  const [toastState, setToastState] = useState({
    open: false,
    title: "",
    description: "",
    variant: "neutral" as "neutral" | "success" | "error"
  })
  const [credits, setCredits] = useState<number>(999) // Unlimited credits
  
  // 编程语言设置 (如Python, JavaScript等)
  const [currentProgrammingLanguage, setCurrentProgrammingLanguage] = useState<string>("python")
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  
  // 界面语言(i18n)相关状态
  const [isI18nReady, setIsI18nReady] = useState(false)
  
  // Note: Model selection is now handled via separate extraction/solution/debugging model settings

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 检查i18n是否已经准备好
  useEffect(() => {
    // 检查i18n是否已初始化 (i18n.language表示界面语言，如en, zh-CN)
    if (ready && i18n.isInitialized) {
      setIsI18nReady(true);
      console.log(`界面语言已就绪: ${i18n.language}`);
    } else {
      // 如果尚未准备好，等待一段时间再检查
      const timeoutId = setTimeout(() => {
        if (i18n.isInitialized) {
          setIsI18nReady(true);
          console.log(`界面语言已就绪(延迟): ${i18n.language}`);
        } else {
          console.warn('i18n初始化超时，强制设置为就绪状态');
          setIsI18nReady(true);
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [ready, i18n.isInitialized, i18n]);

  // Set unlimited credits
  const updateCredits = useCallback(() => {
    setCredits(999) // No credit limit in this version
    window.__CREDITS__ = 999
  }, [])

  // Helper function to safely update programming language (Python, JavaScript, etc.)
  // 注意: 这与界面语言(i18n.language)不同，界面语言是通过i18n.changeLanguage()更新
  const updateProgrammingLanguage = useCallback((newLanguage: string) => {
    console.log(`设置编程语言为: ${newLanguage}`);
    setCurrentProgrammingLanguage(newLanguage)
    window.__PROGRAMMING_LANGUAGE__ = newLanguage
  }, [])

  // Helper function to mark initialization complete
  const markInitialized = useCallback(() => {
    setIsInitialized(true)
    window.__IS_INITIALIZED__ = true
  }, [])

  // Show toast method
  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "neutral" | "success" | "error"
    ) => {
      setToastState({
        open: true,
        title,
        description,
        variant
      })
    },
    []
  )

  // Check for OpenAI API key and prompt if not found
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const hasKey = await window.electronAPI.checkApiKey()
        setHasApiKey(hasKey)
        
        // If no API key is found, show the settings dialog after a short delay
        if (!hasKey) {
          setTimeout(() => {
            setIsSettingsOpen(true)
          }, 1000)
        }
      } catch (error) {
        console.error("Failed to check API key:", error)
      }
    }
    
    if (isInitialized) {
      checkApiKey()
    }
  }, [isInitialized])

  // Initialize dropdown handler
  useEffect(() => {
    if (isInitialized) {
      // Process all types of dropdown elements with a shorter delay
      const timer = setTimeout(() => {
        // Find both native select elements and custom dropdowns
        const selectElements = document.querySelectorAll('select');
        const customDropdowns = document.querySelectorAll('.dropdown-trigger, [role="combobox"], button:has(.dropdown)');
        
        // Enable native selects
        selectElements.forEach(dropdown => {
          dropdown.disabled = false;
        });
        
        // Enable custom dropdowns by removing any disabled attributes
        customDropdowns.forEach(dropdown => {
          if (dropdown instanceof HTMLElement) {
            dropdown.removeAttribute('disabled');
            dropdown.setAttribute('aria-disabled', 'false');
          }
        });
        
        console.log(`Enabled ${selectElements.length} select elements and ${customDropdowns.length} custom dropdowns`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Listen for settings dialog open requests
  useEffect(() => {
    const unsubscribeSettings = window.electronAPI.onShowSettings(() => {
      console.log("Show settings dialog requested");
      setIsSettingsOpen(true);
    });
    
    return () => {
      unsubscribeSettings();
    };
  }, []);

  // Initialize basic app state
  useEffect(() => {
    // Load config and set values
    const initializeApp = async () => {
      try {
        // Set unlimited credits
        updateCredits()
        
        // Load config including language and model settings
        const config = await window.electronAPI.getConfig()
        
        // Load programming language preference
        if (config && config.programmingLanguage) {
          updateProgrammingLanguage(config.programmingLanguage)
        } else {
          updateProgrammingLanguage("python")
        }
        
        // Model settings are now managed through the settings dialog
        // and stored in config as extractionModel, solutionModel, and debuggingModel
        
        markInitialized()
      } catch (error) {
        console.error("Failed to initialize app:", error)
        // Fallback to defaults
        updateProgrammingLanguage("python")
        markInitialized()
      }
    }
    
    initializeApp()

    // Event listeners for process events
    const onApiKeyInvalid = () => {
      showToast(
        t('error.api_key_invalid'),
        t('error.api_key_details'),
        "error"
      )
      setApiKeyDialogOpen(true)
    }

    // Setup API key invalid listener
    window.electronAPI.onApiKeyInvalid(onApiKeyInvalid)

    // Define a no-op handler for solution success
    const unsubscribeSolutionSuccess = window.electronAPI.onSolutionSuccess(
      () => {
        console.log("Solution success - no credits deducted in this version")
        // No credit deduction in this version
      }
    )

    // Cleanup function
    return () => {
      window.electronAPI.removeListener("API_KEY_INVALID", onApiKeyInvalid)
      unsubscribeSolutionSuccess()
      window.__IS_INITIALIZED__ = false
      setIsInitialized(false)
    }
  }, [updateCredits, updateProgrammingLanguage, markInitialized, showToast, t]) // 添加t到依赖

  // API Key dialog management
  const handleOpenSettings = useCallback(() => {
    console.log('Opening settings dialog');
    setIsSettingsOpen(true);
  }, []);
  
  const handleCloseSettings = useCallback((open: boolean) => {
    console.log('Settings dialog state changed:', open);
    setIsSettingsOpen(open);
  }, []);

  const handleApiKeySave = useCallback(async (apiKey: string) => {
    try {
      await window.electronAPI.updateConfig({ apiKey })
      setHasApiKey(true)
      showToast(
        t('toast.success'),
        t('settings.api_key_saved'),
        "success"
      )
      
      // Reload app after a short delay to reinitialize with the new API key
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Failed to save API key:", error)
      showToast(
        t('toast.error'),
        t('settings.api_key_save_failed'),
        "error"
      )
    }
  }, [showToast, t]) // 添加t到依赖

  // 如果i18n尚未准备好，显示加载指示器
  if (!isI18nReady) {
    return <LoadingIndicator />;
  }

  // 正常渲染应用
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContext.Provider
          value={{
            showToast,
            toast: toastState,
            setToast: setToastState
          }}
        >
          <ToastProvider>
            {isInitialized ? (
              <SubscribedApp
                credits={credits}
                currentProgrammingLanguage={currentProgrammingLanguage}
                setProgrammingLanguage={updateProgrammingLanguage}
              />
            ) : (
              <WelcomeScreen onOpenSettings={() => setIsSettingsOpen(true)} />
            )}
            <SettingsDialog
              open={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              onApiKeySave={async (apiKey) => {
                try {
                  await window.electronAPI.updateConfig({ apiKey })
                  setHasApiKey(true)
                  markInitialized()
                  return Promise.resolve()
                } catch (error) {
                  console.error("Failed to save API key:", error)
                  return Promise.reject(error)
                }
              }}
            />
            <UpdateNotification />
            <ToastViewport />
            <Toast
              open={toastState.open}
              onOpenChange={(open) =>
                setToastState({ ...toastState, open })
              }
              variant={toastState.variant}
            >
              <ToastTitle>{toastState.title}</ToastTitle>
              <ToastDescription>
                {toastState.description}
              </ToastDescription>
            </Toast>
          </ToastProvider>
        </ToastContext.Provider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

export default App;