import type { ProviderType, ProviderConfig, LegacyProviderConfig } from '@shared/types/provider'
import { BaseLLMClient } from './BaseLLMClient'
import { AnthropicAdapter } from './AnthropicAdapter'
import { OpenAIAdapter } from './OpenAIAdapter'
import { GoogleAdapter } from './GoogleAdapter'

export class ProviderManager {
  private providers: Map<ProviderType, BaseLLMClient> = new Map()
  private activeProvider: ProviderType | null = null

  configure(config: ProviderConfig | LegacyProviderConfig): void {
    let client: BaseLLMClient

    // Normalize: legacy configs lack authMethod field
    const authMethod = 'authMethod' in config ? config.authMethod : 'apiKey'

    switch (config.type) {
      case 'anthropic':
        // Anthropic only supports API keys
        if (authMethod === 'oauth') {
          throw new Error('Anthropic does not support OAuth authentication')
        }
        client = new AnthropicAdapter('apiKey' in config ? config.apiKey : '')
        break
      case 'openai':
        if (authMethod === 'oauth' && 'oauthToken' in config) {
          client = new OpenAIAdapter({ oauthToken: config.oauthToken, accountId: config.accountId })
        } else {
          client = new OpenAIAdapter('apiKey' in config ? config.apiKey : '')
        }
        break
      case 'google':
        if (authMethod === 'oauth' && 'oauthToken' in config) {
          client = new GoogleAdapter({ oauthToken: config.oauthToken })
        } else {
          client = new GoogleAdapter('apiKey' in config ? config.apiKey : '')
        }
        break
      default:
        throw new Error(`Unknown provider: ${(config as any).type}`)
    }

    this.providers.set(config.type, client)
    if (!this.activeProvider) {
      this.activeProvider = config.type
    }
  }

  updateOAuthToken(provider: ProviderType, token: string, accountId?: string): void {
    const client = this.providers.get(provider)
    if (!client) return

    if (provider === 'openai' && client instanceof OpenAIAdapter) {
      client.updateOAuthToken(token, accountId)
    } else if (provider === 'google' && client instanceof GoogleAdapter) {
      client.updateOAuthToken(token)
    }
  }

  setActive(type: ProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Provider ${type} not configured`)
    }
    this.activeProvider = type
  }

  getActive(): BaseLLMClient {
    if (!this.activeProvider) {
      throw new Error('No AI provider configured. Please set up an API key in Settings.')
    }
    const client = this.providers.get(this.activeProvider)
    if (!client) {
      throw new Error(`Provider ${this.activeProvider} not found`)
    }
    return client
  }

  getActiveType(): ProviderType | null {
    return this.activeProvider
  }

  isConfigured(): boolean {
    return this.providers.size > 0
  }

  getConfiguredProviders(): ProviderType[] {
    return Array.from(this.providers.keys())
  }

  removeProvider(type: ProviderType): void {
    this.providers.delete(type)
    if (this.activeProvider === type) {
      const remaining = Array.from(this.providers.keys())
      this.activeProvider = remaining.length > 0 ? remaining[0] : null
    }
  }
}
