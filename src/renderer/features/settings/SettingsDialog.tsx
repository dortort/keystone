import { useEffect } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ProviderType } from '@shared/types'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const providers: Array<{ type: ProviderType; name: string; placeholder: string }> = [
  { type: 'anthropic', name: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { type: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { type: 'google', name: 'Google (Gemini)', placeholder: 'AI...' },
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { apiKeys, activeProvider, setApiKey, setActiveProvider, loadSettings } = useSettingsStore()

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open, loadSettings])

  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold">AI Provider</h3>
          <div className="space-y-3">
            {providers.map((p) => (
              <div key={p.type} className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="provider"
                    checked={activeProvider === p.type}
                    onChange={() => setActiveProvider(p.type)}
                    className="text-indigo-600"
                  />
                  <label className="text-sm font-medium">{p.name}</label>
                </div>
                <Input
                  type="password"
                  value={apiKeys[p.type]}
                  onChange={(e) => setApiKey(p.type, e.target.value)}
                  placeholder={p.placeholder}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Dialog>
  )
}
