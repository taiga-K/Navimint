import { ipcMain } from 'electron';

import {
  type CursorApiKeyOperationResult,
  type CursorApiKeyStatusResult,
  IPC_CHANNELS,
} from '../../shared/types';
import {
  deleteStoredCursorApiKey,
  getCursorApiKeyStatus,
  saveCursorApiKey,
} from '../credentials/cursor-api-key';
import { errorMessage } from '../utils/value-guards';

const MAX_API_KEY_LENGTH = 4096;

export interface SettingsIpcOptions {
  openSettingsWindow: () => void;
}

let registered = false;

export function registerSettingsIpc(options: SettingsIpcOptions): void {
  if (registered) {
    return;
  }
  registered = true;

  ipcMain.handle(IPC_CHANNELS.openSettingsWindow, (): void => {
    options.openSettingsWindow();
  });

  ipcMain.handle(
    IPC_CHANNELS.getCursorApiKeyStatus,
    async (): Promise<CursorApiKeyStatusResult> => {
      try {
        return { ok: true, status: await getCursorApiKeyStatus() };
      } catch (error) {
        return { ok: false, message: errorMessage(error) };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.saveCursorApiKey,
    async (_event, apiKey: unknown): Promise<CursorApiKeyOperationResult> => {
      if (typeof apiKey !== 'string') {
        return { ok: false, message: 'Cursor API key must be a string.' };
      }

      const trimmed = apiKey.trim();
      if (trimmed.length === 0) {
        return { ok: false, message: 'Cursor API key is required.' };
      }
      if (trimmed.length > MAX_API_KEY_LENGTH) {
        return { ok: false, message: 'Cursor API key is too long.' };
      }

      try {
        return { ok: true, status: await saveCursorApiKey(trimmed) };
      } catch (error) {
        return { ok: false, message: errorMessage(error) };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.deleteCursorApiKey,
    async (): Promise<CursorApiKeyOperationResult> => {
      try {
        return { ok: true, status: await deleteStoredCursorApiKey() };
      } catch (error) {
        return { ok: false, message: errorMessage(error) };
      }
    },
  );
}
