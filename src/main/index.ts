import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, resolve } from 'node:path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerRoute } from '../lib/electron-router-dom'

import icon from '../../resources/icon.png'
import './ipc'
import './store'
import { createTray } from './tray'
import { createShortcuts } from './shortcuts'
import { LlmServer } from './llm'
import { createChatHandler } from './ipc'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1120,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#17141f',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      x: 20, y: 20,
    },
    ...(process.platform === 'linux'
      ? { icon }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  })

  createTray(mainWindow)
  createShortcuts(mainWindow)
  createChatHandler(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  registerRoute({
    id: 'main',
    browserWindow: mainWindow,
    htmlFile: join(__dirname, '../renderer/index.html'),
  })
}

if (process.platform === 'darwin') {
  app.dock?.setIcon(resolve(__dirname, 'icon.png'))
}

const server = new LlmServer("Qwen3-8B-Q4_K_M.gguf", "9099")

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  server.start()  

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    server.stop()
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
