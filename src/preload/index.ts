import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import type { NavimintBridge } from '../shared/preload/api';
import type { LoadScreensResult } from '../shared/types';

/*
 * The renderer runs this file with `sandbox: true`, so the polyfilled
 * `require()` only resolves the whitelisted modules (`electron`, `events`,
 * `timers`, `url`). Importing relative TypeScript modules at runtime would
 * throw before `contextBridge.exposeInMainWorld` is called and leave
 * `window.navimint` undefined. The constants below are kept inline and MUST
 * stay in sync with `src/shared/preload/api.ts` and `src/shared/types/ipc.ts`.
 */
const NAVIMINT_BRIDGE_KEY = 'navimint';
const IPC_CHANNELS = {
  loadScreensDocument: 'navimint:screens:load',
  getProjectRoot: 'navimint:project:get-root',
  openProjectDialog: 'navimint:project:open-dialog',
  projectRootChanged: 'navimint:project:root-changed',
} as const;

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
