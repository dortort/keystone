import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  panelRatio: number
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setPanelRatio: (ratio: number) => void
  setActiveModal: (modal: string | null) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  panelRatio: 0.5,
  activeModal: null,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPanelRatio: (ratio) => set({ panelRatio: ratio }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setTheme: (theme) => set({ theme }),
}))
