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
import { 
  createDocument,
  deleteDocument,
  flattenFiles,
  getDirContent,
  getFileContent,
  updateDocument 
} from './file_handling'

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
