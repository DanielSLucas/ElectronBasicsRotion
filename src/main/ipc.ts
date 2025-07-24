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
  async (_, { id, name: title, content }: SaveDocumentRequest): Promise<void> => {
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

export function createChatHandler(window: BrowserWindow) {
  ipcMain.handle(
    IPC.CHAT.STREAM_START,
    async (_, messages: {role: string; content: string}[]): Promise<void> => {
      const res = await fetch('http://localhost:9099/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stream: true,
          messages,
          model: 'default'
        })
      });
      
      const decoder = new TextDecoder('utf-8');
      const readable = res.body!.getReader()

      while (true) {
        const { done, value } = await readable!.read();
        if (done) break;

        const data = decoder.decode(value).match(/^data:\s(.+)/);
        const dataObj = JSON.parse(data![1]);
        const newSlice = dataObj.choices[0].delta.content;

        if (!newSlice) continue;
        
        window.webContents.send(IPC.CHAT.STREAM_CHUNK, newSlice)
      }

      window.webContents.send(IPC.CHAT.STREAM_END)
    }
  )
}