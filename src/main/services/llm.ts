import { join as joinPath, dirname } from 'node:path';
import { ChildProcess, spawn } from 'node:child_process';
import { ChatOpenAI } from '@langchain/openai';

import appRootDir from 'app-root-dir';

import { getPlatform } from '../utils/get_platform';

export const llm = new ChatOpenAI({
  modelName: "default",
  apiKey: 'fake-key',
  configuration: {
    baseURL: "http://localhost:9099/v1",
  },
});

const EXEC_PATH = (process.env.name === 'production') ?
  joinPath(dirname(appRootDir.get()), 'bin'):
  joinPath(appRootDir.get(), 'resources', getPlatform());

const MODELS_PATH = joinPath(appRootDir.get(), 'resources', 'models');

export type LlmServerConstructorParams = {
  model: string;
  port: string;
  additionalArgs?: string[];
}

export class LlmServer {
  private _model: string;
  private _port: string;
  private _additionalArgs: string[];
  private server?: ChildProcess

  constructor({ model, port, additionalArgs = [] }:LlmServerConstructorParams ) {
    this._model = model;
    this._port = port;
    this._additionalArgs = additionalArgs;
  }

  public start() {
    const { execPath, args } = this.buildExecCmd();
    this.server = spawn(execPath, args);
  }

  private buildExecCmd() {
    const execPath = joinPath(EXEC_PATH, 'llama-server.exe');
    const args = [
      '-m',
      joinPath(MODELS_PATH, this._model),
      '--port',
      this._port,
      ...this._additionalArgs
    ];
    return { execPath, args };
  }

  public stop() {
    if (this.server) {
      this.server.kill()
    }
  }

  get model() {
    return this._model
  }
}