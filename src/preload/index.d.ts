import type { ElectronTRPC } from 'electron-trpc/main'

declare global {
  interface Window {
    electronTRPC: ElectronTRPC
  }
}
