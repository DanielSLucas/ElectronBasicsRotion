import { BrowserWindow, dialog, ipcMain } from 'electron'

import { IPC } from '@shared/constants/ipc'
import {
  CreateDocumentResponse,
  DeleteDocumentRequest,
  FetchAllDocumentsResponse,
  FetchDocumentRequest,
  FetchDocumentResponse,
  SaveDocumentRequest,
} from '@shared/types/ipc'
import { store } from '../app/store'
import {
  createDocument,
  deleteDocument,
  flattenFiles,
  getDirContent,
  getFileContent,
  getDocuments,
  updateDocument,
  filterByFileTypes,
} from '../services/file_handling'
import { vectorStore } from '../services/rag'
import { llm } from '../services/llm'

ipcMain.handle(
  IPC.WORK_DIR.GET,
  async (): Promise<string> => {
    return store.get('workDir')
  },
)

ipcMain.handle(
  IPC.WORK_DIR.SET,
  async (): Promise<string> => {
    const folder = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    const folderPath = folder?.filePaths?.[0] || ''

    if (folderPath) {
      store.set('workDir', folderPath)
    }

    return folderPath
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.FETCH_ALL,
  async (): Promise<FetchAllDocumentsResponse> => {
    const workDir = store.get('workDir')
    // const allowedFileExtensions = store.get('allowedFileExtensions')
    const allowedFileExtensions = ["md", "txt"]

    const documents = await getDirContent(workDir);
    const filtered = filterByFileTypes(documents, allowedFileExtensions)

    return {
      data: filtered,
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.FETCH,
  async (_, { id }: FetchDocumentRequest): Promise<FetchDocumentResponse | null> => {
    const workDir = store.get('workDir')
    const dirContent = await getDirContent(workDir);

    const files = flattenFiles(dirContent);
    const file = files.find(f => f.id === id)

    if (!file) {
      dialog.showErrorBox("NOT FOUND", "File not found")
      return null;
    }

    const fileContent = await getFileContent(file.path)

    return {
      data: {
        ...file,
        name: file.name.split(".")[0],
        content: fileContent
      },
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.CREATE,
  async (): Promise<CreateDocumentResponse> => {
    const workDir = store.get('workDir')
    const dirContent = await getDirContent(workDir);

    const untitledFiles = flattenFiles(dirContent)
      .filter(f => f.name.split(".")[0].toLowerCase() === "untitled")

    const doc = await createDocument(workDir, `Untitled ${untitledFiles.length + 1}`)

    vectorStore.addDocs([{ ...doc, content: "" }]);

    return {
      data: doc,
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.SAVE,
  async (_, { id, name, content }: SaveDocumentRequest): Promise<void> => {
    const workDir = store.get('workDir')
    const dirContent = await getDirContent(workDir)
    const files = flattenFiles(dirContent)
    const file = files.find(f => f.id === id)

    if (!file) {
      dialog.showErrorBox("NOT FOUND", "File not found")
      return
    }

    const doc = await updateDocument(file.path, name, content)

    vectorStore.updateDocEmbeddings({ ...doc, content })
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.DELETE,
  async (_, { id }: DeleteDocumentRequest): Promise<void> => {
    const workDir = store.get('workDir')
    const dirContent = await getDirContent(workDir)
    const files = flattenFiles(dirContent)
    const file = files.find(f => f.id === id)

    if (!file) {
      dialog.showErrorBox("NOT FOUND", "File not found")
      return
    }

    await deleteDocument(file.path)

    await vectorStore.deleteDoc(id)
  },
)

export function createChatHandler(window: BrowserWindow) {
  ipcMain.handle(
    IPC.CHAT.STREAM_START,
    async (_, messages: {role: string; content: string}[]): Promise<void> => {
      const lastMessage = messages.pop()!

      const workDir = store.get('workDir')
      const files = await getDocuments(workDir);

      vectorStore.addDocs(files);
      const relatedDocs = await vectorStore.similaritySearch(lastMessage.content)
      const context = relatedDocs.map(doc => JSON.stringify(doc))

      const stream = await llm.stream([
        ...messages,
        { ...lastMessage, content: `${lastMessage.content}\n---\nRelatedDocs: ${context}` }
      ])

      for await (const chunk of stream) {
        window.webContents.send(IPC.CHAT.STREAM_CHUNK, chunk.content)
      }

      window.webContents.send(IPC.CHAT.STREAM_END)
    }
  )
}

