export type Document = {
  id: string;
  title: string;
  content: string;
}

export type FetchAllDocumentsResponse = {
  data: Document[]
}
