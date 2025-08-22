import { app, BrowserWindow } from 'electron'
import { resolve } from 'node:path'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import './ipc'
import './app/store'
import { LlmServer } from './services/llm'
import { vectorStore } from './services/rag'
import { getDocuments } from './services/file_handling'
import { store } from './app/store'
import { createWindow } from './app/window'

const server = new LlmServer({ model: "Qwen3-8B-Q4_K_M.gguf", port: "9099" })
const embeddingServer = new LlmServer({ 
  model: "Qwen3-Embedding-0.6B-Q8_0.gguf", 
  port: "9098",
  additionalArgs: ["--embedding", "--pooling", "mean"]
})

if (process.platform === 'darwin') {
  app.dock?.setIcon(resolve(__dirname, 'icon.png'))
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  server.start()
  embeddingServer.start()
  
  console.time("Vector store started")
  setTimeout(() => {
    console.log("Starting vector store")
    getDocuments(store.get("workDir"))
      .then(docs => vectorStore.start(docs))
      .then(() => console.timeEnd("Vector store started"))
      .catch((err) => console.log("Failed to start vector store\n", err))
  }, 15000)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    server.stop()
    embeddingServer.stop()
    vectorStore.stop()
    app.quit()
  }
})
