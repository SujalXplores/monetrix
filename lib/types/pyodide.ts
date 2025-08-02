export interface PyodideInterface {
  runPythonAsync(code: string): Promise<any>;
  loadPackage(packages: string | string[]): Promise<void>;
  globals: any;
  version: string;
}

export interface LoadPyodideOptions {
  indexURL?: string;
  packageCacheDir?: string;
  lockFileURL?: string;
}

declare global {
  function loadPyodide(options?: LoadPyodideOptions): Promise<PyodideInterface>;
}
