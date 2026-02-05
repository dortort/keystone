import type { ProviderType, ProviderConfig } from '@shared/types/provider'
import { BaseLLMClient } from './BaseLLMClient'
import { AnthropicAdapter } from './AnthropicAdapter'
import { OpenAIAdapter } from './OpenAIAdapter'
import { GoogleAdapter } from './GoogleAdapter'

export class ProviderManager {
  private providers: Map<ProviderType, BaseLLMClient> = new Map()
  private activeProvider: ProviderType | null = null

  configure(config: ProviderConfig): void {
    let client: BaseLLMClient

    switch (config.type) {
      case 'anthropic':
        client = new AnthropicAdapter(config.apiKey)
        break
      case 'openai':
        client = new OpenAIAdapter(config.apiKey)
        break
      case 'google':
        client = new GoogleAdapter(config.apiKey)
        break
      default:
        throw new Error(`Unknown provider: ${config.type}`)
    }

    this.providers.set(config.type, client)
    if (!this.activeProvider) {
      this.activeProvider = config.type
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
}
