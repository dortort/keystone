import { app, safeStorage } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

interface SettingsData {
  activeProvider: string | null
  apiKeys: Record<string, string> // stored as base64-encoded encrypted strings
}

export class SettingsService {
  private settingsPath: string
  private settings: SettingsData
  private encryptionAvailable: boolean

  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json')
    this.encryptionAvailable = safeStorage.isEncryptionAvailable()

    if (!this.encryptionAvailable) {
      console.warn('Electron safeStorage encryption not available - falling back to plaintext storage')
    }

    this.settings = this.loadSettings()
  }

  private loadSettings(): SettingsData {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }

    return {
      activeProvider: null,
      apiKeys: {}
    }
  }

  private saveSettings(): void {
    try {
      const dir = path.dirname(this.settingsPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  getApiKey(provider: string): string | null {
    const encrypted = this.settings.apiKeys[provider]
    if (!encrypted) return null

    try {
      if (this.encryptionAvailable) {
        const buffer = Buffer.from(encrypted, 'base64')
        return safeStorage.decryptString(buffer)
      } else {
        // Plaintext fallback
        return encrypted
      }
    } catch (error) {
      console.error(`Failed to decrypt API key for ${provider}:`, error)
      return null
    }
  }

  setApiKey(provider: string, key: string): void {
    try {
      if (this.encryptionAvailable) {
        const encrypted = safeStorage.encryptString(key)
        this.settings.apiKeys[provider] = encrypted.toString('base64')
      } else {
        // Plaintext fallback
        this.settings.apiKeys[provider] = key
      }
      this.saveSettings()
    } catch (error) {
      console.error(`Failed to encrypt and save API key for ${provider}:`, error)
      throw error
    }
  }

  deleteApiKey(provider: string): void {
    delete this.settings.apiKeys[provider]
    this.saveSettings()
  }

  getActiveProvider(): string | null {
    return this.settings.activeProvider
  }

  setActiveProvider(provider: string): void {
    this.settings.activeProvider = provider
    this.saveSettings()
  }

  getConfiguredProviders(): string[] {
    return Object.keys(this.settings.apiKeys)
  }

  hasApiKey(provider: string): boolean {
    return !!this.settings.apiKeys[provider]
  }
}
