interface KeystoneIPC {
  onAIChunk: (callback: (data: { threadId: string; chunk: string; agentId?: string }) => void) => unknown
  onAIDone: (callback: (data: { threadId: string; messageId: string | null }) => void) => unknown
  removeAIListeners: () => void
  selectDirectory: () => Promise<string | null>
}

interface Window {
  keystoneIPC: KeystoneIPC
}
