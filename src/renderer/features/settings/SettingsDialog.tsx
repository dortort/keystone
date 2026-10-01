import { useEffect, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUIStore } from '../../stores/uiStore'
import { ProviderCard } from './ProviderCard'
import type { ProviderType } from '@shared/types'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const providers: Array<{ type: ProviderType; name: string; placeholder: string }> = [
  { type: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { type: 'anthropic', name: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { type: 'google', name: 'Google (Gemini)', placeholder: 'AI...' },
]

const themeOptions = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { apiKeys, activeProvider, setApiKey, setActiveProvider, loadSettings } = useSettingsStore()
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open, loadSettings])

  // Listen for OAuth status updates from main process
  useEffect(() => {
    if (!open) return

    window.keystoneIPC.onOAuthStatus((data) => {
      useSettingsStore.getState().updateOAuthFlowStatus(data as any)
    })

    return () => {
      window.keystoneIPC.removeOAuthListeners()
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <div className="space-y-5">
        {/* Theme selector */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Appearance</h3>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  theme === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                }`}
                aria-pressed={theme === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">AI Providers</h3>
          <div className="space-y-2">
            {providers.map((p) => (
              <ProviderCard
                key={p.type}
                type={p.type}
                name={p.name}
                isActive={activeProvider === p.type}
                onSelect={() => setActiveProvider(p.type)}
              />
            ))}
          </div>
        </div>

        {/* Collapsible Advanced section for API keys */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-expanded={showAdvanced}
          >
            <svg
              className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Advanced: Use API Keys
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              {providers.map((p) => (
                <div key={p.type}>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    {p.name}
                  </label>
                  <Input
                    type="password"
                    value={apiKeys[p.type]}
                    onChange={(e) => setApiKey(p.type, e.target.value)}
                    placeholder={p.placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Dialog>
  )
}
