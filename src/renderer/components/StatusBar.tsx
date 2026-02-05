import { useSettingsStore } from '../stores/settingsStore'
import { APP_VERSION } from '@shared/constants'

export function StatusBar() {
  const activeProvider = useSettingsStore((s) => s.activeProvider)

  return (
    <footer className="flex h-6 items-center justify-between border-t border-gray-200 px-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <span>Keystone v{APP_VERSION}</span>
      <span>
        {activeProvider ? (
          <>AI: {activeProvider}</>
        ) : (
          <span className="text-amber-500">No AI provider configured</span>
        )}
      </span>
    </footer>
  )
}
