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
import { 
  createDocument, 
  deleteDocument, 
  flattenFiles, 
  getDirContent, 
  getFileContent, 
  getDocuments, 
  updateDocument 
} from './file_handling'
import { createGraph } from './rag'

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

    await updateDocument(file.path, name, content)
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

    deleteDocument(file.path)
  },
)

export function createChatHandler(window: BrowserWindow) {
  ipcMain.handle(
    IPC.CHAT.STREAM_START,
    async (_, messages: {role: string; content: string}[]): Promise<void> => {
      // const res = await fetch('http://localhost:9099/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     stream: true,
      //     messages,
      //     model: 'default'
      //   })
      // });
      
      // const decoder = new TextDecoder('utf-8');
      // const readable = res.body!.getReader()

      // while (true) {
      //   const { done, value } = await readable!.read();
      //   if (done) break;

      //   const data = decoder.decode(value);
      //   const lines = data.split(/^data:\s/m);

      //   for (const line of lines) {
      //     if (!line || line === "[DONE]\n\n") continue;

      //     const dataObj = JSON.parse(line);
      //     const newSlice = dataObj.choices[0].delta.content;

      //     if (!newSlice) continue;

      //     window.webContents.send(IPC.CHAT.STREAM_CHUNK, newSlice)
      //   }
      // }

      const graph = await createGraph()

      const stream = await graph.stream({ question: messages[messages.length-1].content })

      for await (const chunk of stream) {
        if (chunk?.generate?.answer) {
          window.webContents.send(IPC.CHAT.STREAM_CHUNK, chunk.generate.answer)
        }
      }

      window.webContents.send(IPC.CHAT.STREAM_END)
    }
  )
}

