import { shell, BrowserWindow } from 'electron'
import { join } from 'node:path'

import { createTray } from './tray'
import { createShortcuts } from './shortcuts'
import { createChatHandler } from '../ipc'
import { registerRoute } from '~/src/lib/electron-router-dom'

import icon from '../../../resources/icon.png'

export function createWindow(): void {
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