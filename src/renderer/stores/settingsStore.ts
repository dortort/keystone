import { create } from 'zustand'
import type { ProviderType } from '@shared/types'
import { trpc } from '../lib/trpc'

interface SettingsState {
  activeProvider: ProviderType | null
  apiKeys: Record<ProviderType, string>
  loaded: boolean
  setActiveProvider: (provider: ProviderType | null) => void
  setApiKey: (provider: ProviderType, key: string) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  activeProvider: null,
  apiKeys: { openai: '', anthropic: '', google: '' },
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
      await trpc.ai.configureProvider.mutate({ type: provider, apiKey: key })
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

      set({
        activeProvider: settings.activeProvider as ProviderType | null,
        apiKeys,
        loaded: true
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
}))
