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

const server = new LlmServer({ model: "Qwen3-8B-Q4_K_M.gguf", port: "9099" })
const embeddingServer = new LlmServer({ 
  model: "Qwen3-Embedding-0.6B-Q8_0.gguf", 
  port: "9098",
  additionalArgs: ["--embedding", "--pooling", "mean"]
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  server.start()
  embeddingServer.start()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    server.stop()
    embeddingServer.stop()
    app.quit()
  }
})
