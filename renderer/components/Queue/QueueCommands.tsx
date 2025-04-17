import React, { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "../../contexts/toast"
import CommandBar, { TooltipItem } from "../shared/CommandBar" // Import CommandBar and TooltipItem
import { COMMAND_KEY } from "../../utils/platform"

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshotCount?: number
  credits: number
  currentProgrammingLanguage: string
  setProgrammingLanguage: (language: string) => void
}

const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  screenshotCount = 0,
  credits,
  currentProgrammingLanguage,
  setProgrammingLanguage
}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // Specific sign-out logic for QueueCommands (clears API key, reloads)
  const handleSignOut = useCallback(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await window.electronAPI.updateConfig({ apiKey: '' });
      showToast(t('toast.success'), t('toast.logoutSuccess'), 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error logging out:", err);
      throw err; // 让CommandBar处理错误提示
    }
  }, [showToast, t]);


  // Define command handlers
  const handleToggleWindow = useCallback(async () => {
    const result = await window.electronAPI.toggleMainWindow()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToToggleWindow'));
    }
  }, [t]);

  const handleScreenshot = useCallback(async () => {
    const result = await window.electronAPI.triggerScreenshot()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToTakeScreenshot'));
    }
  }, [t]);

  const handleProcess = useCallback(async () => {
    if (screenshotCount === 0) {
        // Optionally show a toast or just prevent action
        showToast(t('toast.info'), t('errors.noScreenshotsToProcess'), 'neutral');
        return; // Prevent processing if no screenshots
    }
    if (credits <= 0) {
        showToast(t('toast.warning'), t('errors.insufficientCredits'), 'neutral');
        return; // Prevent processing if no credits
    }
    const result = await window.electronAPI.triggerProcessScreenshots()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToProcessScreenshots'));
    }
  }, [screenshotCount, credits, showToast, t]);

  const handleDeleteLast = useCallback(async () => {
    if (screenshotCount === 0) {
        showToast(t('toast.info'), t('errors.noScreenshotsToDelete'), 'neutral');
        return; // Prevent deleting if no screenshots
    }
    const result = await window.electronAPI.deleteLastScreenshot()
    if (!result.success) {
      throw new Error(result.error || t('errors.failedToDeleteScreenshot'));
    }
     // Success toast is handled by the main process listener in App.tsx potentially
  }, [screenshotCount, showToast, t]);


  // Determine Screenshot Button Text based on count
  const getScreenshotButtonText = useCallback(() => {
    switch (screenshotCount) {
      case 0: return t('takeScreenshot.first');
      case 1: return t('takeScreenshot.second');
      case 2: return t('takeScreenshot.third');
      case 3: return t('takeScreenshot.fourth');
      case 4: return t('takeScreenshot.fifth');
      default: return t('takeScreenshot.nextReplace');
    }
  }, [screenshotCount, t]);

  // Define Tooltip Items specific to Queue
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
      description: t('shortcuts.take_screenshot_description'), // Generic description for queue
      keys: ['H'],
      onClick: handleScreenshot,
      isVisible: true,
    },
    {
      id: 'solve',
      title: t('shortcuts.solve_title'),
      description: screenshotCount > 0
        ? t('shortcuts.solve.description.hasScreenshots')
        : t('shortcuts.solve.description.noScreenshots'),
      keys: ['↵'],
      onClick: handleProcess,
      isVisible: true, // Always show, but disable if needed
      isDisabled: screenshotCount === 0 || credits <= 0,
    },
    {
      id: 'delete-last',
      title: t('shortcuts.deleteLastScreenshot.title'),
      description: screenshotCount > 0
        ? t('shortcuts.deleteLastScreenshot.description.hasScreenshots')
        : t('shortcuts.deleteLastScreenshot.description.noScreenshots'),
      keys: ['L'],
      onClick: handleDeleteLast,
      isVisible: true, // Always show, but disable if needed
      isDisabled: screenshotCount === 0,
    },
  ], [t, screenshotCount, credits, handleToggleWindow, handleScreenshot, handleProcess, handleDeleteLast]);

  return (
    <CommandBar
      onTooltipVisibilityChange={onTooltipVisibilityChange}
      credits={credits}
      currentProgrammingLanguage={currentProgrammingLanguage}
      setProgrammingLanguage={setProgrammingLanguage}
      onSignOut={handleSignOut} // Use the specific sign out handler

      // Command Button Props
      showToggleWindowButton={false} // Toggle window button is not shown directly in Queue view
      onToggleWindow={handleToggleWindow} // Still needed for tooltip item

      showScreenshotButton={true} // Always show screenshot button
      onScreenshot={handleScreenshot}
      screenshotButtonText={getScreenshotButtonText()}
      // screenshotButtonKeys default ['H']

      showProcessButton={screenshotCount > 0} // Show 'Solve' only if screenshots exist
      onProcess={handleProcess}
      processButtonText={t('button.solve')}
      isProcessButtonDisabled={credits <= 0} // Disable if no credits
      // processButtonKeys default ['↵']

      showResetButton={screenshotCount > 0} // Show 'Delete Last' only if screenshots exist
      onReset={handleDeleteLast} // Use handleDeleteLast for the reset/delete action
      resetButtonText={t('button.deleteLast')} // Text is 'Delete Last'
      isResetButtonDisabled={false} // Enabled if shown
      resetButtonKeys={['L']} // Keys are Cmd+L

      // Tooltip Specific Props
      tooltipItems={tooltipItems}
      showLanguageSwitcher={true} // Enable language switcher in Queue tooltip
    />
  )
}

export default React.memo(QueueCommands)
