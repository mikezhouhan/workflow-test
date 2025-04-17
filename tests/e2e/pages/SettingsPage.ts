import { Page } from '@playwright/test';

/**
 * 设置页面对象类
 * 
 * 封装与设置页面的交互
 */
export class SettingsPage {
  constructor(private page: Page) {}

  /**
   * 等待设置页面加载完成
   */
  async waitForPageLoad() {
    try {
      // 尝试等待设置页面的标题或内容
      await this.page.waitForSelector(
        'h1:has-text("Settings"), h2:has-text("Settings"), ' + 
        'h1:has-text("设置"), h2:has-text("设置"), ' + 
        '.settings-title, [data-testid="settings-title"], ' +
        '.settings-container, [data-testid="settings-container"]', 
        { state: 'visible', timeout: 15000 }
      );
    } catch (error) {
      // 如果找不到特定元素，尝试等待任何可能的设置相关元素
      await this.page.waitForSelector(
        'form, .form, .settings, #settings, ' +
        'select, input[type="text"], input[type="password"], ' +
        '.dropdown, .select, .language-select',
        { state: 'visible', timeout: 15000 }
      );
    }
  }

  /**
   * 检查设置页面是否已加载
   */
  async isLoaded() {
    try {
      // 尝试查找设置页面上的任何可见元素
      const settingsElement = await this.page.locator(
        '.settings, #settings, [data-testid="settings"], ' +
        'form, .form, .settings-container, ' +
        'h1:has-text("Settings"), h2:has-text("Settings"), ' +
        'h1:has-text("设置"), h2:has-text("设置")'
      ).first();
      
      return await settingsElement.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * 打开设置页面/对话框
   */
  async openSettings() {
    // 尝试几种可能的方式打开设置
    const settingsSelectors = [
      'button:has-text("Settings")',
      'button:has-text("设置")',
      '[data-testid="settings-button"]',
      '.settings-button',
      'button.settings',
      'button[aria-label="Settings"]',
      'button[aria-label="设置"]',
      'button svg[data-icon="cog"]',
      'button svg[data-icon="settings"]',
      'button i.settings-icon',
      'button i.fa-cog',
      'button i.fa-gear'
    ];

    for (const selector of settingsSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          // 等待设置页面/对话框出现
          await this.waitForPageLoad();
          return true;
        }
      } catch (error) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    // 如果找不到明确的设置按钮，尝试查找任何可能的菜单按钮
    try {
      const menuSelectors = [
        'button.menu',
        'button[aria-label="Menu"]',
        'button[aria-label="菜单"]',
        'button svg[data-icon="menu"]',
        'button i.fa-bars',
        '.menu-button',
        '[data-testid="menu-button"]'
      ];

      for (const selector of menuSelectors) {
        const menuButton = this.page.locator(selector).first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          
          // 等待菜单出现，然后点击设置选项
          const settingsOptions = [
            'a:has-text("Settings")',
            'a:has-text("设置")',
            'li:has-text("Settings")',
            'li:has-text("设置")',
            '[data-testid="settings-option"]',
            '.settings-option'
          ];
          
          for (const optionSelector of settingsOptions) {
            const option = this.page.locator(optionSelector).first();
            if (await option.isVisible()) {
              await option.click();
              await this.waitForPageLoad();
              return true;
            }
          }
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return false;
  }

  /**
   * 切换语言
   * @param language 'en' 或 'zh'
   */
  async switchLanguage(language: 'en' | 'zh') {
    // 尝试查找语言选择器
    const languageSelectors = [
      'select[name="language"]',
      'select.language-select',
      '[data-testid="language-select"]',
      'select:has-option(English)',
      'select:has-option(中文)',
      '.language-dropdown',
      '.language-selector'
    ];

    for (const selector of languageSelectors) {
      try {
        const languageSelect = this.page.locator(selector).first();
        if (await languageSelect.isVisible()) {
          // 根据指定的语言选择相应的选项
          if (language === 'en') {
            await languageSelect.selectOption({ label: 'English' });
          } else {
            await languageSelect.selectOption({ label: '中文' });
          }
          
          // 等待一下，让语言切换生效
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    // 如果找不到下拉选择器，尝试查找语言切换按钮
    const languageButtonSelectors = [
      'button:has-text("English")',
      'button:has-text("中文")',
      '[data-testid="language-en-button"]',
      '[data-testid="language-zh-button"]',
      '.language-button-en',
      '.language-button-zh',
      'button.language-en',
      'button.language-zh'
    ];

    for (const selector of languageButtonSelectors) {
      try {
        // 根据当前要切换的语言选择相应的按钮
        const buttonSelector = language === 'en' 
          ? languageButtonSelectors.filter(s => s.includes('en'))
          : languageButtonSelectors.filter(s => s.includes('zh'));
        
        for (const btnSelector of buttonSelector) {
          const button = this.page.locator(btnSelector).first();
          if (await button.isVisible()) {
            await button.click();
            await this.page.waitForTimeout(1000);
            return true;
          }
        }
      } catch (error) {
        // 忽略错误
      }
    }

    return false;
  }

  /**
   * 获取当前语言
   * 返回 'en', 'zh' 或 null（如果无法确定）
   */
  async getCurrentLanguage() {
    try {
      // 尝试通过UI元素判断当前语言
      const englishElements = await this.page.locator('text="Settings", text="Language", text="API Key", button:has-text("Save")').count();
      const chineseElements = await this.page.locator('text="设置", text="语言", text="API密钥", button:has-text("保存")').count();
      
      if (englishElements > chineseElements) {
        return 'en';
      } else if (chineseElements > englishElements) {
        return 'zh';
      }
      
      // 如果通过文本无法确定，尝试查找语言选择器的当前值
      const languageSelect = this.page.locator('select[name="language"], .language-select, [data-testid="language-select"]').first();
      if (await languageSelect.isVisible()) {
        const value = await languageSelect.inputValue();
        if (value.includes('en')) return 'en';
        if (value.includes('zh')) return 'zh';
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 保存设置
   */
  async saveSettings() {
    // 尝试查找保存按钮
    const saveButtonSelectors = [
      'button:has-text("Save")',
      'button:has-text("保存")',
      '[data-testid="save-settings-button"]',
      '.save-button',
      'button[type="submit"]',
      'button.primary',
      'button.save'
    ];

    for (const selector of saveButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          // 等待保存操作完成
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    return false;
  }

  /**
   * 关闭设置页面/对话框
   */
  async closeSettings() {
    // 尝试查找关闭按钮
    const closeButtonSelectors = [
      'button:has-text("Close")',
      'button:has-text("关闭")',
      'button:has-text("Cancel")',
      'button:has-text("取消")',
      '[data-testid="close-settings-button"]',
      '.close-button',
      'button.close',
      'button[aria-label="Close"]',
      'button[aria-label="关闭"]',
      'button svg[data-icon="close"]',
      'button svg[data-icon="times"]',
      'button i.fa-times',
      'button i.fa-close'
    ];

    for (const selector of closeButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          // 等待对话框关闭
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    // 如果找不到关闭按钮，尝试点击对话框外部区域
    try {
      // 点击页面的空白区域
      await this.page.mouse.click(10, 10);
      await this.page.waitForTimeout(1000);
      
      // 检查设置页面是否已关闭
      const stillVisible = await this.isLoaded();
      if (!stillVisible) {
        return true;
      }
    } catch (error) {
      // 忽略错误
    }

    return false;
  }
}
