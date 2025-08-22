import { join } from "path";
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";

import AppRootDir from "app-root-dir";
import { Embeddings } from "@langchain/core/embeddings";
import { DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Document } from "../../shared/types/ipc";

const VEC_STORE_DIR = join(AppRootDir.get(), 'resources', 'db');

const embeddings = new OpenAIEmbeddings({
  modelName: "default",
  apiKey: "fake-key",
  configuration: {
    baseURL: "http://localhost:9098/v1",
  },
});

const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 500,
  chunkOverlap: 100,
});

class VectorStore {
  private _store?: FaissStore;
  private storeFName = 'docstore.json';

  constructor(
    private storePath: string, 
    private emb: Embeddings
  ) {}

  private get store(): FaissStore {
    if (!this._store) {
      throw new Error("Vector store has not been initialized. Please call start() before using the store.");
    }

    return this._store;
  }

  async start(docs: Document[]) {
    const storeFile = join(this.storePath, this.storeFName);
    if (!existsSync(storeFile)) {
      this._store = new FaissStore(this.emb, {});
      await this.addDocs(docs);
      return;
    }
    
    this._store = await FaissStore.load(this.storePath, this.emb)
    
    await this.syncDocumentEmbeddings(storeFile, docs);
  }

  private async syncDocumentEmbeddings(storeFile: string, docs: Document[]) {
    const storeFileStat = await stat(storeFile);

    const docsToUpdate = docs.filter(
      doc => new Date(doc.updatedAt).getTime() > storeFileStat.mtime.getTime()
    );

    this.updateDocsEmbeddings(docsToUpdate);
  }

  async stop() {
    return this.persist()
  }

  async addDocs(docs: Document[]) {
    const documents = (await Promise.all(docs.map(async (f) => {
      const mdDocs = await mdSplitter.createDocuments([f.content]);
      const { content, ...fileMetadata } = f;
      return mdDocs.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          ...fileMetadata
        }
      }))
    }))).flat()

    const ids = documents.map(() => crypto.randomUUID());

    const pageSize = 50;
    const pages = Math.ceil(documents.length / pageSize);

    for (let i = 0; i < pages; i++) {
      await this.store.addDocuments(
        documents.slice(i * pageSize, (i + 1) * pageSize),
        { ids: ids.slice(i * pageSize, (i + 1) * pageSize) }
      )
    }
    
    await this.persist()
  }

  async similaritySearch(question: string, n_results = 5): Promise<DocumentInterface[]> {
    return this.store.similaritySearch(question, n_results)
  }

  async listAll(): Promise<DocumentInterface[]> {
    const retriver = this.store.asRetriever();
    return retriver.invoke(" ");
  }

  private async persist() {
    return this.store.save(this.storePath)
  }

  async updateDocEmbeddings(doc: Document) {
    const retriver = this.store.asRetriever();
    const results = await retriver.invoke(" ");
    const docs = results.filter(d => d.metadata.id === doc.id)

    const ids = docs.map(d => d.id!)

    await this.store.delete({ ids })

    await this.addDocs([doc])
    
    await this.persist()
  }

  async updateDocsEmbeddings(docs: Document[]) {
    const docsIds = docs.map(d => d.id);
    const retriver = this.store.asRetriever();
    const results = await retriver.invoke(" ");

    const docsToDelete = results.filter(d => docsIds.includes(d.metadata.id))
    const storeIds = docsToDelete.map(d => d.id!)

    await this.store.delete({ ids: storeIds })

    await this.addDocs(docs)
    
    await this.persist()
  }

  async deleteDoc(docId: string) {
    const retriver = this.store.asRetriever();
    const results = await retriver.invoke(" ");

    const docsToDelete = results.filter(d => d.metadata.id === docId)
    const storeIds = docsToDelete.map(d => d.id!)

    await this.store.delete({ ids: storeIds })
  }
}

export const vectorStore = new VectorStore(VEC_STORE_DIR, embeddings);
