import type { ElectronTRPC } from 'electron-trpc/main'

interface KeystoneIPC {
  onAIChunk: (callback: (data: { threadId: string; chunk: string; agentId?: string }) => void) => unknown
  onAIDone: (callback: (data: { threadId: string; messageId: string | null }) => void) => unknown
  removeAIListeners: () => void
  selectDirectory: () => Promise<string | null>
  onOAuthStatus: (callback: (data: { state: string; provider?: string; email?: string; error?: string }) => void) => unknown
  removeOAuthListeners: () => void
}

declare global {
  interface Window {
    electronTRPC: ElectronTRPC
    keystoneIPC: KeystoneIPC
  }
}
