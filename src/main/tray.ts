import { app, BrowserWindow, Menu, Tray } from 'electron'

import { resolve } from 'node:path'

export function createTray(window: BrowserWindow) {
  app.whenReady().then(() => {
    const tray = new Tray(
      resolve(__dirname, '..', '..', 'resources', 'rotionTemplate.png'),
    )

    const menu = Menu.buildFromTemplate([
      { label: 'Rotion', enabled: false },
      { type: 'separator' },
      {
        label: 'Criar novo documento',
        click: () => {
          window.webContents.send('new-document')
          window.show()
        },
      },
      { type: 'separator' },
      { label: 'Documentos recentes', enabled: false },
      {
        label: 'Discover',
        accelerator: 'CommandOrControl+1',
        acceleratorWorksWhenHidden: false,
      },
      {
        label: 'Ignite',
        accelerator: 'CommandOrControl+2',
        acceleratorWorksWhenHidden: false,
      },
      {
        label: 'Rocketseat',
        accelerator: 'CommandOrControl+3',
        acceleratorWorksWhenHidden: false,
      },
      { type: 'separator' },
      { label: 'Sair', role: 'quit' },
    ])

    tray.setContextMenu(menu)
  })
}
