// ConfigHelper.ts
import fs from "node:fs"
import path from "node:path"
import { app } from "electron"
import { EventEmitter } from "events"
import { OpenAI } from "openai"

export interface Config { // Add export keyword
  apiKey: string;
  apiProvider: string; // Allow different providers like 'openai', 'gemini', etc.
  extractionModel: string;
  solutionModel: string;
  debuggingModel: string;
  programmingLanguage: string; // Programming language
  interfaceLanguage: string; // UI language for i18n
  opacity: number;
}

export class ConfigHelper extends EventEmitter {
  private configPath: string;
  private defaultConfig: Config = {
    apiKey: "", // API Key needs to be set by the user
    apiProvider: "openai", // Default to OpenAI
    extractionModel: "gemini-2.0-flash", // Default model
    solutionModel: "gemini-2.0-flash",
    debuggingModel: "gemini-2.0-flash",
    programmingLanguage: "python", // Default programming language
    interfaceLanguage: "en", // Default UI language (English)
    opacity: 1.0
  };

  constructor() {
    super();
    // Determine the config path based on environment
    const isTestEnv = process.env.NODE_ENV === 'test';
    const testTmpDir = process.env.ELECTRON_TEST_TMPDIR;

    if (isTestEnv && testTmpDir) {
      // Use the temporary directory specified for tests
      this.configPath = path.join(testTmpDir, 'config.json');
      console.log('Using test config path:', this.configPath);
    } else {
      // Use the app's user data directory for normal operation
      try {
        this.configPath = path.join(app.getPath('userData'), 'config.json');
        console.log('Using standard config path:', this.configPath);
      } catch (err) {
        console.warn('Could not access user data path, using fallback path');
        // Fallback to current working directory if userData is inaccessible
        this.configPath = path.join(process.cwd(), 'config.json');
      }
    }
    
    // Ensure the initial config file exists
    this.ensureConfigExists();
  }

  /**
   * Ensure config file exists
   */
  private ensureConfigExists(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.saveConfig(this.defaultConfig);
      }
    } catch (err) {
      console.error("Error ensuring config exists:", err);
    }
  }

  /**
   * Validate and sanitize model selection to ensure only allowed models are used
   */
  private sanitizeModelSelection(model: string, provider: string): string {
    // Removed validation logic as per requirement. Directly return the model from config.
    // Provider parameter is kept for signature compatibility but not used for validation.
    return model;
  }

  /**
   * Validate and sanitize interface language
   */
  private sanitizeInterfaceLanguage(language: string): string {
    const supportedLanguages = ['en', 'zh-CN'];
    if (!supportedLanguages.includes(language)) {
      console.warn(`Unsupported interface language: ${language}. Using default: en`);
      return 'en';
    }
    return language;
  }

  public loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Ensure apiProvider is a valid value
        // Ensure apiProvider is always "openai"
        // Removed apiProvider validation/forcing logic as per requirement.
        // The application should now attempt to use the provider specified in the config.
        
        // Sanitize model selections to ensure only allowed models are used
        if (config.extractionModel) {
          config.extractionModel = this.sanitizeModelSelection(config.extractionModel, config.apiProvider);
        }
        if (config.solutionModel) {
          config.solutionModel = this.sanitizeModelSelection(config.solutionModel, config.apiProvider);
        }
        if (config.debuggingModel) {
          config.debuggingModel = this.sanitizeModelSelection(config.debuggingModel, config.apiProvider);
        }
        
        // Sanitize interface language
        if (config.interfaceLanguage) {
          config.interfaceLanguage = this.sanitizeInterfaceLanguage(config.interfaceLanguage);
        }
        
        return {
          ...this.defaultConfig,
          ...config
        };
      }
      
      // If no config exists, create a default one
      this.saveConfig(this.defaultConfig);
      return this.defaultConfig;
    } catch (err) {
      console.error("Error loading config:", err);
      return this.defaultConfig;
    }
  }

  /**
   * Save configuration to disk
   */
  public saveConfig(config: Config): void {
    try {
      // Ensure the directory exists
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      // Write the config file
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (err) {
      console.error("Error saving config:", err);
    }
  }

  /**
   * Update specific configuration values
   */
  public updateConfig(updates: Partial<Config>): Config {
    console.log('ConfigHelper.updateConfig: Received updates:', updates); // 添加日志
    try {
      const currentConfig = this.loadConfig();
      // Allow any provider from updates or current config. Type needs to be adjusted.
      let provider: string = updates.apiProvider || currentConfig.apiProvider;

      // TODO: Re-evaluate auto-detection logic if multiple providers are officially supported.
      // For now, rely on the 'provider' variable derived from updates or current config.
      // console.log('ConfigHelper.updateConfig: Provider determined as:', provider); // Optional logging

      // Ensure the local 'provider' variable reflects any explicit update
      if (updates.apiProvider) {
         provider = updates.apiProvider;
      }
      
      // If provider is changing, reset models to the default for that provider
      // Provider change logic is no longer needed as only OpenAI is supported.
      // We can remove this block entirely or keep it simplified.
      // Let's remove it for cleanliness.
      
      // Sanitize model selections in the updates
      if (updates.extractionModel) {
        updates.extractionModel = this.sanitizeModelSelection(updates.extractionModel, provider);
      }
      if (updates.solutionModel) {
        updates.solutionModel = this.sanitizeModelSelection(updates.solutionModel, provider);
      }
      if (updates.debuggingModel) {
        updates.debuggingModel = this.sanitizeModelSelection(updates.debuggingModel, provider);
      }
      
      // Sanitize interface language if present
      if (updates.interfaceLanguage) {
        updates.interfaceLanguage = this.sanitizeInterfaceLanguage(updates.interfaceLanguage);
      }
      
      // Create a copy to modify, ensuring we only update fields present in 'updates'
      const newConfig = { ...currentConfig };
      
      // Iterate over the keys in the updates object and apply them if they exist
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const typedKey = key as keyof Config;
          const value = updates[typedKey]; // Get the value once

          if (value !== undefined) { // Check if the value is actually provided
            switch (typedKey) {
              case 'apiKey':
                newConfig.apiKey = value as string; // Assuming apiKey is string
                break;
              case 'apiProvider':
                // Allow updating apiProvider to the value provided in 'updates'
                // TODO: Add validation here if specific providers need to be checked
                newConfig.apiProvider = value as string; // Assuming apiProvider is string
                console.log(`ConfigHelper.updateConfig: Updated apiProvider to: ${newConfig.apiProvider}`); // Log update
                break;
              case 'extractionModel':
                newConfig.extractionModel = this.sanitizeModelSelection(value as string, provider);
                break;
              case 'solutionModel':
                newConfig.solutionModel = this.sanitizeModelSelection(value as string, provider);
                break;
              case 'debuggingModel':
                newConfig.debuggingModel = this.sanitizeModelSelection(value as string, provider);
                break;
              case 'programmingLanguage':
                newConfig.programmingLanguage = value as string; // Assuming programmingLanguage is string
                break;
              case 'interfaceLanguage':
                newConfig.interfaceLanguage = this.sanitizeInterfaceLanguage(value as string);
                break;
              case 'opacity':
                // Ensure opacity is a number and within bounds if needed, though setOpacity handles this later
                if (typeof value === 'number') {
                  newConfig.opacity = Math.min(1.0, Math.max(0.1, value));
                } else {
                   console.warn(`Ignoring non-numeric opacity update: ${value}`);
                }
                break;
              default:
                // Optional: Log if an unexpected key appears in updates
                console.warn(`Received unexpected config key in update: ${typedKey}`);
                break;
            }
          }
        }
      }
      
      console.log('ConfigHelper.updateConfig: Final config before save:', newConfig); // 添加日志
      this.saveConfig(newConfig);
      
      // Only emit update event for changes other than opacity
      // This prevents re-initializing the AI client when only opacity changes
      if (updates.apiKey !== undefined || updates.apiProvider !== undefined ||
          updates.extractionModel !== undefined || updates.solutionModel !== undefined ||
          updates.debuggingModel !== undefined || updates.programmingLanguage !== undefined ||
          updates.interfaceLanguage !== undefined) {
        console.log(`[ConfigHelper] Emitting 'config-updated' with provider: ${newConfig.apiProvider}`); // 添加日志确认事件触发
        this.emit('config-updated', newConfig);
      }
      
      return newConfig;
    } catch (error) {
      console.error('Error updating config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Check if the API key is configured
   */
  public hasApiKey(): boolean {
    const config = this.loadConfig();
    return !!config.apiKey && config.apiKey.trim().length > 0;
  }
  
  /**
   * Validate the API key format
   */
  public isValidApiKeyFormat(apiKey: string, provider?: "openai"): boolean {
    // If provider is not specified, attempt to auto-detect
    // Provider must be openai or undefined (which defaults to openai check)
    if (provider && provider !== "openai") {
       console.warn(`isValidApiKeyFormat called with unsupported provider: ${provider}`);
       return false;
    }
    // If provider is undefined or 'openai', proceed with OpenAI check
    
    if (provider === "openai") {
      // Basic format validation for OpenAI API keys
      return /^sk-[a-zA-Z0-9]{32,}$/.test(apiKey.trim());
    }
    // Only OpenAI format check remains
    return false; // Should not be reached if provider is openai
  }
  
  /**
   * Get the stored opacity value
   */
  public getOpacity(): number {
    const config = this.loadConfig();
    return config.opacity !== undefined ? config.opacity : 1.0;
  }

  /**
   * Set the window opacity value
   */
  public setOpacity(opacity: number): void {
    // Ensure opacity is between 0.1 and 1.0
    const validOpacity = Math.min(1.0, Math.max(0.1, opacity));
    this.updateConfig({ opacity: validOpacity });
  }
  
  /**
   * Get the preferred programming language
   */
  public getProgrammingLanguage(): string {
    const config = this.loadConfig();
    return config.programmingLanguage || "python";
  }
  
  /**
   * Set the preferred programming language
   */
  public setProgrammingLanguage(programmingLanguage: string): void {
    this.updateConfig({ programmingLanguage });
  }
  
  /**
   * Get the interface language (for i18n)
   */
  public getInterfaceLanguage(): string {
    const config = this.loadConfig();
    // If interfaceLanguage is not set, try to detect system language
    if (!config.interfaceLanguage) {
      const locale = app.getLocale();
      if (locale.startsWith('zh')) {
        return 'zh-CN';
      }
      return 'en';
    }
    return config.interfaceLanguage;
  }
  
  /**
   * Set the interface language (for i18n)
   */
  public setInterfaceLanguage(interfaceLanguage: string): void {
    this.updateConfig({ interfaceLanguage: this.sanitizeInterfaceLanguage(interfaceLanguage) });
  }

  /**
   * Test API key with the selected provider
   */
  public async testApiKey(apiKey: string, provider?: "openai"): Promise<{valid: boolean, error?: string}> {
    // Auto-detect provider based on key format if not specified
    // Provider must be openai or undefined (which defaults to openai test)
    if (provider && provider !== "openai") {
       console.warn(`testApiKey called with unsupported provider: ${provider}`);
       return { valid: false, error: `Unsupported API provider: ${provider}` };
    }
    
    // Always test OpenAI key now
    console.log("Testing OpenAI API key format");
    return this.testOpenAIKey(apiKey);
    
    return { valid: false, error: "Unknown API provider" };
  }
  
  /**
   * Test OpenAI API key
   */
  private async testOpenAIKey(apiKey: string): Promise<{valid: boolean, error?: string}> {
    try {
      const openai = new OpenAI({ apiKey });
      // Make a simple API call to test the key
      await openai.models.list();
      return { valid: true };
    } catch (error: any) {
      console.error('OpenAI API key test failed:', error);
      
      // Determine the specific error type for better error messages
      let errorMessage = 'Unknown error validating OpenAI API key';
      
      if (error.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenAI key and try again.';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Your OpenAI API key has reached its request limit or has insufficient quota.';
      } else if (error.status === 500) {
        errorMessage = 'OpenAI server error. Please try again later.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      return { valid: false, error: errorMessage };
    }
  }
  
  /**
   * Get the path to the config file
   */
  public getConfigPath(): string {
    return this.configPath;
  }
}

// Export a singleton instance
export const configHelper = new ConfigHelper();