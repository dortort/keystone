import { useSettingsStore } from '../stores/settingsStore'
import { APP_VERSION } from '@shared/constants'

export function StatusBar() {
  const activeProvider = useSettingsStore((s) => s.activeProvider)

  return (
    <footer className="flex h-6 items-center justify-between border-t border-gray-200 px-4 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400" role="contentinfo">
      <span>Keystone v{APP_VERSION}</span>
      <span>
        {activeProvider ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
            AI: {activeProvider}
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">No AI provider configured</span>
        )}
      </span>
    </footer>
  )
}
