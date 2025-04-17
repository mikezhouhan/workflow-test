import React, { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "../../contexts/toast"
import { Screenshot } from "../../types/screenshots"
import { supabase } from "../../lib/supabase"
import CommandBar, { TooltipItem } from "../shared/CommandBar" // Import CommandBar and TooltipItem
import { COMMAND_KEY } from "../../utils/platform"

export interface SolutionCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  isProcessing: boolean
  screenshots?: Screenshot[] // Keep for context if needed, though CommandBar doesn't directly use it
  extraScreenshots?: Screenshot[] // Used to determine button visibility/text
  credits: number
  currentProgrammingLanguage: string
  setProgrammingLanguage: (language: string) => void
}

// Keep handleSignOut logic here or move it if used elsewhere
const handleSignOut = async () => {
  try {
    // Clear any local storage or electron-specific data first
    localStorage.clear()
    sessionStorage.clear()

    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Consider adding a success toast or reload logic if needed
  } catch (err) {
    console.error("Error signing out:", err)
    throw err // 让CommandBar处理错误提示
  }
}

const SolutionCommands: React.FC<SolutionCommandsProps> = ({
  onTooltipVisibilityChange,
  isProcessing,
  extraScreenshots = [],
  credits,
  currentProgrammingLanguage,
  setProgrammingLanguage
}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // Define command handlers using useCallback for potential performance optimization
  const handleToggleWindow = useCallback(async () => {
    const result = await window.electronAPI.toggleMainWindow()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToToggleWindow'))
    }
  }, [t])

  const handleScreenshot = useCallback(async () => {
    const result = await window.electronAPI.triggerScreenshot()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToTakeScreenshot'))
    }
  }, [t])

  const handleProcess = useCallback(async () => {
    const result = await window.electronAPI.triggerProcessScreenshots()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToProcessScreenshots'))
    }
  }, [t])

  const handleReset = useCallback(async () => {
    const result = await window.electronAPI.triggerReset()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToReset'))
    }
  }, [t])

  // Define Tooltip Items
  const tooltipItems: TooltipItem[] = useMemo(() => [
    {
      id: 'toggle-window',
      title: t('shortcuts.toggle_window'),
      description: t('shortcuts.toggle_window_description'),
      keys: ['B'],
      onClick: handleToggleWindow,
      isVisible: true,
    },
    {
      id: 'screenshot',
      title: t('shortcuts.take_screenshot_title'),
      description: t('shortcuts.take_screenshot_tooltip_description'),
      keys: ['H'],
      onClick: handleScreenshot,
      isVisible: !isProcessing,
    },
    {
      id: 'debug',
      title: t('shortcuts.debug.title'),
      description: t('shortcuts.debug.description'),
      keys: ['↵'],
      onClick: handleProcess,
      isVisible: !isProcessing && extraScreenshots.length > 0,
    },
    {
      id: 'start-over',
      title: t('shortcuts.startOver.title'),
      description: t('shortcuts.startOver.description'),
      keys: ['R'],
      onClick: handleReset,
      isVisible: true,
    },
  ], [t, isProcessing, extraScreenshots.length, handleToggleWindow, handleScreenshot, handleProcess, handleReset])

  return (
    <CommandBar
      onTooltipVisibilityChange={onTooltipVisibilityChange}
      credits={credits}
      currentProgrammingLanguage={currentProgrammingLanguage}
      setProgrammingLanguage={setProgrammingLanguage}
      onSignOut={handleSignOut} // Pass the sign out handler

      // Command Button Props
      showToggleWindowButton={true} // Always show
      onToggleWindow={handleToggleWindow}
      // toggleWindowButtonKeys default ['B']

      showScreenshotButton={!isProcessing} // Show only if not processing
      onScreenshot={handleScreenshot}
      screenshotButtonText={
        extraScreenshots.length === 0
          ? t('button.screenshot.initialTitle')
          : t('button.screenshot.subsequentTitle')
      }
      // screenshotButtonKeys default ['H']

      showProcessButton={!isProcessing && extraScreenshots.length > 0} // Show only if not processing and have screenshots
      onProcess={handleProcess}
      processButtonText={t('button.debug.title')} // Text is 'Debug' in this context
      // processButtonKeys default ['↵']
      // isProcessButtonDisabled default false

      showResetButton={true} // Always show 'Start Over'
      onReset={handleReset}
      resetButtonText={t('button.startOver.title')}
      resetButtonKeys={['R']} // Explicitly set keys for 'Start Over'
      // isResetButtonDisabled default false

      // Tooltip Specific Props
      tooltipItems={tooltipItems}
      showLanguageSwitcher={true} // Show language switcher in this context
    />
  )
}

export default React.memo(SolutionCommands)
