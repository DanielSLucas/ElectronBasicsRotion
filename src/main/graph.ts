import { Annotation, StateGraph } from '@langchain/langgraph'
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

import { store } from "./store";
import { flattenFiles, getDirContent, getFileContent } from "./file_handling";

const llm = new ChatOpenAI({
  modelName: "default",
  apiKey: 'fake-key',
  configuration: {
    baseURL: "http://localhost:9099/v1",
  },
});

const embeddings = new OpenAIEmbeddings({
  modelName: "default",
  apiKey: "fake-key",
  configuration: {
    baseURL: "http://localhost:9098/v1",
  },
});

const vectorStore = new MemoryVectorStore(embeddings);

const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 200,
  chunkOverlap: 0,
});

export async function createGraph() {
  const workDir = store.get('workDir')
  const files = flattenFiles(await getDirContent(workDir))

  const documents = (await Promise.all(files.map(async (f) => {
    const fContent = await getFileContent(f.path)
    const mdDocs = await mdSplitter.createDocuments([fContent]);
    return mdDocs.map(doc =>({ ...doc, metadata: { ...f, ...doc.metadata } }))
  }))).flat()

  await vectorStore.addDocuments(documents)

  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore.similaritySearch(state.question)
    return { context: retrievedDocs };
  };


  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = state.context.map(doc => doc.pageContent).join("\n");
    const messages = await promptTemplate.invoke({ question: state.question, context: docsContent });
    const response = await llm.invoke(messages);
    return { answer: response.content };
  };
  
  const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();

  return graph
}
