import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/constants/ipc'
import {
  CreateDocumentResponse,
  DeleteDocumentRequest,
  FetchAllDocumentsResponse,
  FetchDocumentRequest,
  FetchDocumentResponse,
  SaveDocumentRequest,
} from '@shared/types/ipc'

declare global {
  export interface Window {
    api: typeof api
  }
}

// Custom APIs for renderer
const api = {
  getWorkDir(): Promise<string> {
    return ipcRenderer.invoke(IPC.WORK_DIR.GET)
  },
  setWorkDir(): Promise<string> {
    return ipcRenderer.invoke(IPC.WORK_DIR.SET)
  },
  fetchDocuments(): Promise<FetchAllDocumentsResponse> {
    return ipcRenderer.invoke(IPC.DOCUMENTS.FETCH_ALL)
  },
  fetchDocument(req: FetchDocumentRequest) : Promise<FetchDocumentResponse | null> {
    return ipcRenderer.invoke(IPC.DOCUMENTS.FETCH, req)
  },
  createDocument() : Promise<CreateDocumentResponse> {
    return ipcRenderer.invoke(IPC.DOCUMENTS.CREATE)
  },
  saveDocument(req: SaveDocumentRequest) : Promise<void> {
    return ipcRenderer.invoke(IPC.DOCUMENTS.SAVE, req)
  },
  deleteDocument(req: DeleteDocumentRequest) : Promise<void> {
    return ipcRenderer.invoke(IPC.DOCUMENTS.DELETE, req)
  },
  onNewDocumentRequest(callback: () => void) {
    ipcRenderer.on('new-document', callback)
    return () => {
      ipcRenderer.off('new-document', callback)
    }
  },
  startChatStream(messages: { role: string, content: string }[]) {
    return ipcRenderer.invoke(IPC.CHAT.STREAM_START, messages)
  },
  onChatStreamChunk(callback: (_: any, chunk: string) => void) {
    ipcRenderer.on(IPC.CHAT.STREAM_CHUNK, callback)
    return () => {
      ipcRenderer.off(IPC.CHAT.STREAM_CHUNK, callback)
    }
  },
  onChatStreamEnd(callback: () => void) {
    ipcRenderer.on(IPC.CHAT.STREAM_END, callback)
    return () => {
      ipcRenderer.off(IPC.CHAT.STREAM_END, callback)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
