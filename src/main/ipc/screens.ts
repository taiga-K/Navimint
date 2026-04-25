import { ipcMain } from 'electron';

import {
  IPC_CHANNELS,
  type LoadScreensResult,
  type SavePreviewBaseUrlResult,
} from '../../shared/types';
import { readScreensDocument } from '../utils/read-screens-document';
import { savePreviewBaseUrl } from '../utils/save-preview-base-url';

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

  ipcMain.handle(
    IPC_CHANNELS.savePreviewBaseUrl,
    async (_event, baseUrl: unknown): Promise<SavePreviewBaseUrlResult> => {
      if (typeof baseUrl !== 'string') {
        return {
          ok: false,
          reason: 'invalid-base-url',
          message: 'Base URL must be a string.',
          filePath: null,
        };
      }

      const projectRoot = options.getProjectRoot();
      return savePreviewBaseUrl({ projectRoot, baseUrl });
    },
  );
}
