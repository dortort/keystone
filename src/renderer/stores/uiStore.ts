import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

interface UIState {
  sidebarOpen: boolean
  panelRatio: number
  activeModal: string | null
  theme: Theme
  toggleSidebar: () => void
  setPanelRatio: (ratio: number) => void
  setActiveModal: (modal: string | null) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  panelRatio: 0.5,
  activeModal: null,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPanelRatio: (ratio) => set({ panelRatio: ratio }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))

// Apply initial theme on load
applyTheme(useUIStore.getState().theme)

// Listen for system theme changes when using 'system' mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const currentTheme = useUIStore.getState().theme
  if (currentTheme === 'system') {
    applyTheme('system')
  }
})
