/* eslint-disable no-unused-vars */
export enum FType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

export type FBase = {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FFile = FBase & {
  type: FType.FILE
}

export type FFolder = FBase & {
  type: FType.FOLDER;
  content: FEntry[];
}

export type FEntry = FFile | FFolder

export type Document = {
  id: string;
  name: string;
  content: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

// RESQUEST
export type SaveDocumentRequest = Pick<Document, 'id' | 'name' | 'content'>

export type FetchDocumentRequest = {
  id: string;
}

export type DeleteDocumentRequest = {
  id: string;
}

// RESPONSE
export type FetchAllDocumentsResponse = {
  data: FEntry[];
}

export type FetchDocumentResponse = {
  data: Document;
}

export type CreateDocumentResponse = {
  data: FFile;
}
