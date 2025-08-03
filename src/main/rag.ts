import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Document } from "../shared/types/ipc";

const embeddings = new OpenAIEmbeddings({
  modelName: "default",
  apiKey: "fake-key",
  configuration: {
    baseURL: "http://localhost:9098/v1",
  },
});

const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 1000,
  chunkOverlap: 100,
});

export async function similaritySearch(files: Document[], question: string) {
  const vectorStore = new MemoryVectorStore(embeddings);

  const documents = (await Promise.all(files.map(async (f) => {
    const mdDocs = await mdSplitter.createDocuments([f.content]);
    return mdDocs.map(doc =>({ ...doc, metadata: { ...f, ...doc.metadata } }))
  }))).flat()

  await vectorStore.addDocuments(documents)

  return vectorStore.similaritySearch(question)
}
