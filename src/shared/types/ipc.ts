export type Document = {
  id: string;
  title: string;
  content?: string;
}

// RESQUEST
export type SaveDocumentRequest = Document

export type FetchDocumentRequest = {
  id: string;
}

export type DeleteDocumentRequest = {
  id: string;
}

// RESPONSE
export type FetchAllDocumentsResponse = {
  data: Document[];
}

export type FetchDocumentResponse = {
  data: Document;
}

export type CreateDocumentResponse = {
  data: Document;
}
