import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'

interface ShortcutHandlers {
  onNewThread?: () => void
  onOpenSettings?: () => void
  onNewProject?: () => void
}

export function useKeyboardShortcuts({ onNewThread, onOpenSettings, onNewProject }: ShortcutHandlers) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl+B: Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Cmd/Ctrl+N: New thread
      if (mod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        onNewThread?.()
      }

      // Cmd/Ctrl+Shift+N: New project
      if (mod && e.key === 'N' && e.shiftKey) {
        e.preventDefault()
        onNewProject?.()
      }

      // Cmd/Ctrl+,: Open settings
      if (mod && e.key === ',') {
        e.preventDefault()
        onOpenSettings?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar, onNewThread, onOpenSettings, onNewProject])
}
