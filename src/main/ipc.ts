import { dialog, ipcMain } from 'electron'
import { IPC } from '@shared/constants/ipc'
import {
  CreateDocumentResponse,
  DeleteDocumentRequest,
  FetchAllDocumentsResponse,
  FetchDocumentRequest,
  FetchDocumentResponse,
  SaveDocumentRequest,
} from '@shared/types/ipc'
import { store } from './store'
import { randomUUID } from 'node:crypto'
import { getDirContent } from './file_handling'

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

    return {
      data: await getDirContent(workDir),
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.FETCH,
  async (_, { id }: FetchDocumentRequest): Promise<FetchDocumentResponse> => {
    const document = store.get(`documents.${id}`)

    return {
      data: document,
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.CREATE,
  async (): Promise<CreateDocumentResponse> => {
    const doc = {
      id: randomUUID(),
      title: 'Untitled',
    }

    store.set(`documents.${doc.id}`, doc)

    return {
      data: doc,
    }
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.SAVE,
  async (_, { id, title, content }: SaveDocumentRequest): Promise<void> => {
    store.set(`documents.${id}`, {
      id, title, content,
    })
  },
)

ipcMain.handle(
  IPC.DOCUMENTS.DELETE,
  async (_, { id }: DeleteDocumentRequest): Promise<void> => {
    store.delete(`documents.${id}`)
  },
)
