import { app, BrowserWindow } from 'electron'
import { createIPCHandler } from 'electron-trpc/main'
import { createWindow } from './window'
import { appRouter } from './ipc/router'
import { createContext } from './ipc/context'

app.whenReady().then(() => {
  const win = createWindow()

  createIPCHandler({
    router: appRouter,
    windows: [win],
    createContext,
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow()
      createIPCHandler({
        router: appRouter,
        windows: [newWin],
        createContext,
      })
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
