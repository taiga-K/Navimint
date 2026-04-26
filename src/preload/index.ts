import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import { NAVIMINT_BRIDGE_KEY, type NavimintBridge } from '../shared/preload/api';
import {
  type AnalyzeUiResult,
  type CursorApiKeyOperationResult,
  type CursorApiKeyStatusResult,
  IPC_CHANNELS,
  type LoadScreensResult,
  type SavePreviewBaseUrlResult,
} from '../shared/types';

/*
 * `BrowserWindow` uses `sandbox: false` so this preload can `require()` the
 * compiled `../shared/...` modules. Sandboxed preloads may not load arbitrary
 * CommonJS chunks (Electron doc: preload splitting needs a bundler).
 * Channel strings stay aligned with main via `IPC_CHANNELS` in `src/shared/types/ipc.ts`.
 */

const bridge: NavimintBridge = {
  loadScreensDocument: (): Promise<LoadScreensResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.loadScreensDocument) as Promise<LoadScreensResult>,
  analyzeUi: (): Promise<AnalyzeUiResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.analyzeUi) as Promise<AnalyzeUiResult>,
  openSettingsWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.openSettingsWindow) as Promise<void>,
  getCursorApiKeyStatus: (): Promise<CursorApiKeyStatusResult> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.getCursorApiKeyStatus,
    ) as Promise<CursorApiKeyStatusResult>,
  saveCursorApiKey: (apiKey): Promise<CursorApiKeyOperationResult> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.saveCursorApiKey,
      apiKey,
    ) as Promise<CursorApiKeyOperationResult>,
  deleteCursorApiKey: (): Promise<CursorApiKeyOperationResult> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.deleteCursorApiKey,
    ) as Promise<CursorApiKeyOperationResult>,
  savePreviewBaseUrl: (baseUrl): Promise<SavePreviewBaseUrlResult> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.savePreviewBaseUrl,
      baseUrl,
    ) as Promise<SavePreviewBaseUrlResult>,
  getProjectRoot: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.getProjectRoot) as Promise<string | null>,
  openProjectDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.openProjectDialog) as Promise<string | null>,
  onProjectRootChanged: (callback) => {
    const listener = (_event: IpcRendererEvent, projectRoot: string | null): void => {
      callback(projectRoot);
    };
    ipcRenderer.on(IPC_CHANNELS.projectRootChanged, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.projectRootChanged, listener);
    };
  },
};

contextBridge.exposeInMainWorld(NAVIMINT_BRIDGE_KEY, bridge);
