import { create } from 'zustand'
import type { ProviderType } from '@shared/types'

interface SettingsState {
  activeProvider: ProviderType | null
  apiKeys: Record<ProviderType, string>
  setActiveProvider: (provider: ProviderType | null) => void
  setApiKey: (provider: ProviderType, key: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeProvider: null,
  apiKeys: { openai: '', anthropic: '', google: '' },
  setActiveProvider: (provider) => set({ activeProvider: provider }),
  setApiKey: (provider, key) =>
    set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
}))
