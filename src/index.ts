import { app, remote } from 'electron';
import * as path from 'path';

export interface IExecuteInRendererTask {
  readonly renderScript: string;
  readonly renderScriptExport: string;
  readonly renderScriptArgs: any[];
}

export class ExecuteInRenderer {
  public static getWindowHash(...tasks: IExecuteInRendererTask[]): string {
    // simplify to arrays to save space
    const obj = tasks.map(t => [
      // also make all paths relative to the app base
      path.relative(this.getAppPath(), t.renderScript),
      t.renderScriptExport,
      t.renderScriptArgs
    ]);

    return encodeURIComponent(JSON.stringify(obj));
  }

  public static preload() {
    const hash = window.location.hash.slice(1);
    const toRun = JSON.parse(decodeURIComponent(hash)) as [string, string, any[]][] || [];

    for (let [scriptPath, scriptExport, args] of toRun) {
      scriptPath = path.resolve(this.getAppPath(), scriptPath);
      const loadedModule = require(scriptPath);
      const method = loadedModule[scriptExport];
      method.apply(undefined, args);
    }
  }

  private static getAppPath() {
    const a = process.type === 'renderer' ? remote.app : app;
    // this is required due to:
    // https://github.com/electron-userland/electron-forge/issues/346
    return a.getAppPath().replace(/^(.*)\\node_modules.*default_app\.asar$/, '$1');
  }
}
