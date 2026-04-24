import { ipcMain } from 'electron';

import { IPC_CHANNELS, type LoadScreensResult } from '../../shared/types';
import { readScreensDocument } from '../utils/read-screens-document';

export interface ScreensIpcOptions {
  /** Returns the active project root, or `null` when none is open. */
  getProjectRoot: () => string | null;
}

let registered = false;

/** Idempotent: subsequent calls do not re-register the handlers. */
export function registerScreensIpc(options: ScreensIpcOptions): void {
  if (registered) {
    return;
  }
  registered = true;

  ipcMain.handle(IPC_CHANNELS.loadScreensDocument, async (): Promise<LoadScreensResult> => {
    const projectRoot = options.getProjectRoot();
    return readScreensDocument({ projectRoot });
  });
}
