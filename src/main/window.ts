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
      sandbox: true,
    },
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  return window;
}
