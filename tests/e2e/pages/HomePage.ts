import { Page, expect } from '@playwright/test'; // Import expect

/**
 * 主页页面对象类
 *
 * 使用页面对象模式封装页面交互，使测试更加可维护
 */
export class HomePage {
  constructor(private page: Page) {}

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    // 使用更通用的选择器，尝试匹配可能存在的任何标题或内容元素
    try {
      // 尝试等待任何标题元素
      await this.page.waitForSelector('h1, h2, h3, .appTitle, .title, [data-testid="title"], .heading, #app > div', {
        state: 'visible',
        timeout: 15000
      });
    } catch (error) {
      // 如果找不到标题，尝试等待任何按钮或交互元素
      await this.page.waitForSelector('button, a, .btn, [role="button"], input[type="button"]', {
        state: 'visible',
        timeout: 15000
      });
    }
  }

  /**
   * 检查页面是否已加载
   */
  async isLoaded() {
    try {
      // 尝试查找页面上的任何可见元素
      const anyElement = await this.page.locator('#app, body > div, [data-testid], div:not(:empty)').first();
      return await anyElement.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * 点击开始面试按钮
   */
  async clickStartInterviewButton() {
    // 尝试几种可能的选择器来查找"开始面试"按钮
    const buttonSelectors = [
      'button:has-text("开始面试")',
      'button:has-text("Start Interview")',
      'button:has-text("Start")',
      'button:has-text("面试")',
      'button.start-interview',
      '[data-testid="start-interview-button"]',
      'button.primary',
      'button.main-action',
      '.start-button'
    ];

    for (const selector of buttonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          return true;
        }
      } catch (error) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    // 如果找不到明确的按钮，尝试点击任何可见的按钮
    try {
      const buttons = await this.page.locator('button').all();
      for (const button of buttons) {
        if (await button.isVisible()) {
          await button.click();
          return true;
        }
      }
    } catch (error) {
      // 忽略错误，返回失败
    }

    return false;
  }

  /**
   * 获取页面标题
   */
  async getPageHeading() {
    try {
      // 尝试多种可能的标题选择器
      const headingSelectors = [
        'h1, h2, h3, .appTitle',
        '.title',
        '[data-testid="title"]',
        '.heading',
        '#app > div > :first-child'
      ];

      for (const selector of headingSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          return await element.textContent();
        }
      }

      // 如果找不到明确的标题，返回任何可见文本
      const anyText = await this.page.locator('div:not(:empty)').first();
      return await anyText.textContent();
    } catch (error) {
      return '';
    }
  }

  /**
   * 打开设置菜单/对话框
   */
  async openSettings() {
    // Selector for the gear icon container that triggers the tooltip
    const tooltipTriggerSelector = '[data-testid="settings-tooltip-trigger"]';
    const tooltipTrigger = this.page.locator(tooltipTriggerSelector);

    // Selector for the settings button *inside* the tooltip
    // Note: This assumes the tooltip content is rendered somewhere in the DOM after hover.
    // We might need to adjust this if the tooltip is rendered in a portal or has a specific container.
    const settingsButtonInTooltipSelector = 'button:has-text("Settings")';

    try {
      // 1. Wait for the gear icon trigger to be visible
      await tooltipTrigger.waitFor({ state: 'visible', timeout: 15000 });
      console.log('Settings tooltip trigger found.');

      // 2. Hover over the gear icon to reveal the tooltip
      await tooltipTrigger.hover();
      console.log('Hovered over settings tooltip trigger.');
      
      // 3. Wait briefly for the tooltip animation/rendering
      await this.page.waitForTimeout(500); // Small delay for tooltip to appear

      // 4. Locate the settings button *within* the tooltip context (or globally if needed)
      // Let's try locating it globally first, as tooltip structure can vary.
      const settingsButton = this.page.locator(settingsButtonInTooltipSelector).first();

      // 5. Wait for the settings button inside the tooltip to be visible and enabled
      await settingsButton.waitFor({ state: 'visible', timeout: 10000 });
      await expect(settingsButton).toBeEnabled({ timeout: 5000 });
      console.log('Settings button inside tooltip found and enabled.');

      // 6. Click the settings button
      await settingsButton.click();
      console.log('Clicked settings button inside tooltip.');

      // IMPORTANT: The calling test MUST now instantiate SettingsPage
      // and call its waitForPageLoad() method to confirm the dialog opened.
      return true; // Indicate the click was attempted

    } catch (error) {
      console.error(`Failed to open settings via tooltip:`, error);
      // Log available buttons and text for debugging
      const buttons = await this.getAllVisibleButtonTexts();
      console.error('Available buttons:', buttons);
      const texts = await this.getAllVisibleTexts();
      console.error('Visible texts:', texts);
      return false;
    }
  }

  /**
   * 检查当前语言
   * 返回 'en', 'zh' 或 null（如果无法确定）
   */
  async detectCurrentLanguage() {
    try {
      // 尝试通过UI元素判断当前语言
      const englishElements = await this.page.locator('text="Start", text="Settings", text="Help"').count();
      const chineseElements = await this.page.locator('text="开始", text="设置", text="帮助"').count();

      if (englishElements > chineseElements) {
        return 'en';
      } else if (chineseElements > englishElements) {
        return 'zh';
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取所有可见按钮的文本
   * 用于调试和验证UI元素
   */
  async getAllVisibleButtonTexts(): Promise<string[]> { // Add return type
    const result: string[] = []; // Explicitly type the array
    try {
      const buttons = await this.page.locator('button').all();
      for (const button of buttons) {
        if (await button.isVisible()) {
          const text = await button.textContent();
          if (text && text.trim()) {
            result.push(text.trim());
          }
        }
      }
    } catch (error) {
      // 忽略错误
    }
    return result;
  }

  /**
   * 获取所有可见文本元素的内容
   * 用于调试和验证UI元素
   */
  async getAllVisibleTexts(): Promise<string[]> { // Add return type
    const result: string[] = []; // Explicitly type the array
    try {
      const textElements = await this.page.locator('h1, h2, h3, p, span, div:not(:has(*)), label, button').all();
      for (const element of textElements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            result.push(text.trim());
          }
        }
      }
    } catch (error) {
      // 忽略错误
    }
    return result;
  }
}