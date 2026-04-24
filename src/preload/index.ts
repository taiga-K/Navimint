import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import type { NavimintBridge } from '../shared/preload/api';
import { IPC_CHANNELS, type LoadScreensResult } from '../shared/types';

/*
 * The renderer runs this file with `sandbox: true`, so the polyfilled
 * `require()` only resolves the whitelisted modules (`electron`, `events`,
 * `timers`, `url`). Values imported from `../shared/...` compile to relative
 * `require()` calls against emitted JS under `dist/`, so IPC channel strings
 * stay aligned with main via `IPC_CHANNELS` in `src/shared/types/ipc.ts`.
 */
const NAVIMINT_BRIDGE_KEY = 'navimint';

const bridge: NavimintBridge = {
  loadScreensDocument: (): Promise<LoadScreensResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.loadScreensDocument) as Promise<LoadScreensResult>,
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
