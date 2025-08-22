/* eslint-disable @typescript-eslint/no-explicit-any */
import Store from 'electron-store'
import { Document } from '../../shared/types/ipc'

type StoreType = {
  workDir: string;
  documents: Record<string, Document>;
}

export const store: any = new Store<StoreType>({
  defaults: {
    workDir: '',
    documents: {},
  },
})

// console.log(store.path) // caminho para o json que armazena os dados
