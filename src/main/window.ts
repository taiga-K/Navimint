import path from 'node:path';

import { BrowserWindow } from 'electron';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    show: false,
    backgroundColor: '#121212',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      /**
       * Electron's sandboxed preload can only `require` a whitelisted set of
       * built-in modules — not our compiled `../shared/...` chunks. The preload
       * would fail before `contextBridge.exposeInMainWorld`, so `window.navimint`
       * stayed undefined. Disabling the renderer sandbox keeps full preload
       * `require` while the renderer still has no Node (nodeIntegration: false).
       * @see https://www.electronjs.org/docs/latest/tutorial/sandbox#preload-scripts
       */
      sandbox: false,
    },
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  return window;
}
