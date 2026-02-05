export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface UsageStatus {
  provider: string
  tier: string
  remainingQuota?: number
  resetTime?: string
}

export type ProviderType = 'openai' | 'anthropic' | 'google'

export interface ProviderConfig {
  type: ProviderType
  apiKey: string
  model?: string
}
