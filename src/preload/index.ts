import { exposeElectronTRPC } from 'electron-trpc/main'
import { contextBridge, ipcRenderer } from 'electron'

process.once('loaded', () => {
  exposeElectronTRPC()

  contextBridge.exposeInMainWorld('keystoneIPC', {
    onAIChunk: (callback: (data: { threadId: string; chunk: string; agentId?: string }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { threadId: string; chunk: string; agentId?: string }) =>
        callback(data)
      ipcRenderer.on('ai:chunk', handler)
      return handler
    },
    onAIDone: (callback: (data: { threadId: string; messageId: string | null }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { threadId: string; messageId: string | null }) =>
        callback(data)
      ipcRenderer.on('ai:done', handler)
      return handler
    },
    removeAIListeners: () => {
      ipcRenderer.removeAllListeners('ai:chunk')
      ipcRenderer.removeAllListeners('ai:done')
    },
    selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    onOAuthStatus: (callback: (data: { state: string; provider?: string; email?: string; error?: string }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: { state: string; provider?: string; email?: string; error?: string }) =>
        callback(data)
      ipcRenderer.on('oauth:status', handler)
      return handler
    },
    removeOAuthListeners: () => {
      ipcRenderer.removeAllListeners('oauth:status')
    },
  })
})
