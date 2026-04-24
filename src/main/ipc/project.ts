import { BrowserWindow, ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../shared/types';
import { showOpenProjectDialog } from '../dialogs/open-project-dialog';
import { getProjectRoot, setProjectRoot } from '../project-root';

let registered = false;

/**
 * Register IPC handlers that let the renderer query and change the active
 * project root. The handlers are idempotent so they can be safely called from
 * setups that re-bootstrap (e.g. on macOS reactivation).
 */
export function registerProjectIpc(): void {
  if (registered) {
    return;
  }
  registered = true;

  ipcMain.handle(IPC_CHANNELS.getProjectRoot, (): string | null => getProjectRoot());

  ipcMain.handle(IPC_CHANNELS.openProjectDialog, async (event): Promise<string | null> => {
    const requesterWindow = BrowserWindow.fromWebContents(event.sender);
    const next = await showOpenProjectDialog(requesterWindow);
    if (next !== null) {
      setProjectRoot(next);
    }
    return next;
  });
}
