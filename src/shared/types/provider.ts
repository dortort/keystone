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

export type AuthMethod = 'apiKey' | 'oauth'

export interface OAuthTokens {
  accessToken: string // For OpenAI: this is the exchanged API key
  refreshToken?: string
  idToken?: string // Original ID token, used for OpenAI token exchange
  expiresAt: number // Unix timestamp in ms
  accountId?: string // e.g. OpenAI chatgpt-account-id
  email?: string
}

export type OAuthFlowStatus =
  | { state: 'idle' }
  | { state: 'pending'; provider: ProviderType }
  | { state: 'success'; provider: ProviderType; email?: string }
  | { state: 'error'; provider: ProviderType; error: string }

export interface ProviderConfigApiKey {
  type: ProviderType
  authMethod: 'apiKey'
  apiKey: string
  model?: string
}

export interface ProviderConfigOAuth {
  type: ProviderType
  authMethod: 'oauth'
  oauthToken: string
  accountId?: string
  model?: string
}

export type ProviderConfig = ProviderConfigApiKey | ProviderConfigOAuth

// Backward-compatible: accept legacy shape too
export interface LegacyProviderConfig {
  type: ProviderType
  apiKey: string
  model?: string
}
