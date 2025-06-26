import { app, Menu, Tray } from 'electron'

import { resolve } from 'node:path'

app.whenReady().then(() => {
  const tray = new Tray(
    resolve(__dirname, '..', '..', 'resources', 'rotionTemplate.png'),
  )

  const menu = Menu.buildFromTemplate([
    { label: 'Rotion' },
  ])

  tray.setContextMenu(menu)
})
