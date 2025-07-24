export const IPC = {
  WORK_DIR: {
    GET: 'workDir.get',
    SET: 'workDir.set',
  },
  DOCUMENTS: {
    FETCH_ALL: 'documents.fetchAll',
    FETCH: 'documents.fetch',
    CREATE: 'documents.create',
    SAVE: 'documents.save',
    DELETE: 'documents.delete',
  },
  CHAT: {
    STREAM_START: "chat.stream.start",
    STREAM_CHUNK: "chat.stream.chunk",
    STREAM_END: "chat.stream.end",
  }
}
