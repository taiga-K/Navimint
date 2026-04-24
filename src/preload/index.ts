import { contextBridge, ipcRenderer } from 'electron';

import { NAVIMINT_BRIDGE_KEY, type NavimintBridge } from '../shared/preload/api';
import { IPC_CHANNELS, type LoadScreensResult } from '../shared/types';

const bridge: NavimintBridge = {
  loadScreensDocument: (): Promise<LoadScreensResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.loadScreensDocument) as Promise<LoadScreensResult>,
};

contextBridge.exposeInMainWorld(NAVIMINT_BRIDGE_KEY, bridge);
