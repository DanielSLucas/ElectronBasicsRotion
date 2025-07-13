import { join as joinPath, dirname } from 'path';
import { ChildProcess, spawn } from 'child_process';

import appRootDir from 'app-root-dir';

import { getPlatform } from './get_platform';

const EXEC_PATH = (process.env.name === 'production') ?
  joinPath(dirname(appRootDir.get()), 'bin'):
  joinPath(appRootDir.get(), 'resources', getPlatform());

const MODELS_PATH = joinPath(appRootDir.get(), 'resources', 'models');

// model = "Qwen3-8B-Q4_K_M.gguf"
// embeddingModel = "Qwen3-Embedding-0.6B-Q8_0.gguf"

export class LlmServer {
  private _model: string;
  private _port: string;
  private server?: ChildProcess

  constructor(model: string, port: string) {
    this._model = model;
    this._port = port;
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
      this._port
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