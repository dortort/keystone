import { create } from 'zustand'
import type { ProviderType, OAuthFlowStatus, AuthMethod } from '@shared/types'
import { trpc } from '../lib/trpc'

interface OAuthProviderStatus {
  connected: boolean
  email: string | null
  authMethod: AuthMethod
}

interface SettingsState {
  activeProvider: ProviderType | null
  apiKeys: Record<ProviderType, string>
  oauthStatus: Record<ProviderType, OAuthProviderStatus>
  oauthFlowStatus: OAuthFlowStatus
  loaded: boolean
  setActiveProvider: (provider: ProviderType | null) => void
  setApiKey: (provider: ProviderType, key: string) => void
  loadSettings: () => Promise<void>
  startOAuthFlow: (provider: ProviderType) => Promise<void>
  disconnectOAuth: (provider: ProviderType) => Promise<void>
  updateOAuthFlowStatus: (status: OAuthFlowStatus) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  activeProvider: null,
  apiKeys: { openai: '', anthropic: '', google: '' },
  oauthStatus: {
    openai: { connected: false, email: null, authMethod: 'apiKey' },
    anthropic: { connected: false, email: null, authMethod: 'apiKey' },
    google: { connected: false, email: null, authMethod: 'apiKey' },
  },
  oauthFlowStatus: { state: 'idle' },
  loaded: false,

  setActiveProvider: async (provider) => {
    set({ activeProvider: provider })
    if (provider) {
      await trpc.settings.setActiveProvider.mutate({ provider })
    }
  },

  setApiKey: async (provider, key) => {
    set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } }))

    // Persist the API key
    await trpc.settings.setApiKey.mutate({ provider, apiKey: key })

    // Also configure the provider manager in-memory for immediate use
    if (key) {
      await trpc.ai.configureProvider.mutate({ type: provider, apiKey: key, authMethod: 'apiKey' })
    }
  },

  startOAuthFlow: async (provider) => {
    set({ oauthFlowStatus: { state: 'pending', provider } })
    try {
      const result = await trpc.oauth.startFlow.mutate({ provider })
      set((state) => ({
        oauthFlowStatus: { state: 'success', provider, email: result.email },
        oauthStatus: {
          ...state.oauthStatus,
          [provider]: { connected: true, email: result.email ?? null, authMethod: 'oauth' as AuthMethod },
        },
        activeProvider: provider,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth flow failed'
      set({ oauthFlowStatus: { state: 'error', provider, error: message } })
    }
  },

  disconnectOAuth: async (provider) => {
    await trpc.oauth.disconnect.mutate({ provider })
    set((state) => ({
      oauthStatus: {
        ...state.oauthStatus,
        [provider]: { connected: false, email: null, authMethod: 'apiKey' as AuthMethod },
      },
      oauthFlowStatus: { state: 'idle' },
    }))
  },

  updateOAuthFlowStatus: (status) => {
    set({ oauthFlowStatus: status })
    if (status.state === 'success' && 'provider' in status) {
      set((state) => ({
        oauthStatus: {
          ...state.oauthStatus,
          [status.provider]: {
            connected: true,
            email: status.email ?? null,
            authMethod: 'oauth' as AuthMethod,
          },
        },
      }))
    }
  },

  loadSettings: async () => {
    if (get().loaded) return

    try {
      const settings = await trpc.settings.getSettings.query()
      const apiKeys: Record<ProviderType, string> = { openai: '', anthropic: '', google: '' }

      // Load API keys for configured providers
      for (const provider of settings.configuredProviders) {
        const result = await trpc.settings.getApiKey.query({ provider })
        if (result.apiKey) {
          apiKeys[provider as ProviderType] = result.apiKey
        }
      }

      // Load OAuth status for each provider
      const oauthStatus: Record<ProviderType, OAuthProviderStatus> = {
        openai: { connected: false, email: null, authMethod: 'apiKey' },
        anthropic: { connected: false, email: null, authMethod: 'apiKey' },
        google: { connected: false, email: null, authMethod: 'apiKey' },
      }

      for (const provider of ['openai', 'anthropic', 'google'] as ProviderType[]) {
        try {
          const status = await trpc.oauth.getStatus.query({ provider })
          oauthStatus[provider] = {
            connected: status.connected,
            email: status.email,
            authMethod: status.authMethod as AuthMethod,
          }
        } catch {
          // OAuth status query failed, keep defaults
        }
      }

      set({
        activeProvider: settings.activeProvider as ProviderType | null,
        apiKeys,
        oauthStatus,
        loaded: true,
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  },
}))
