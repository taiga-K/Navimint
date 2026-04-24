import path from 'node:path';

import { app, BrowserWindow } from 'electron';

import { registerScreensIpc } from './ipc/screens';
import { createMainWindow } from './window';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

/** Resolved from `NAVIMINT_PROJECT_ROOT`, falling back to `process.cwd()`. */
function resolveProjectRoot(): string | null {
  const fromEnv = process.env.NAVIMINT_PROJECT_ROOT;
  if (fromEnv && fromEnv.length > 0) {
    return path.resolve(fromEnv);
  }
  return process.cwd();
}

async function loadRenderer(window: BrowserWindow): Promise<void> {
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5173';
    await window.loadURL(devServerUrl);
    return;
  }
  await window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

async function bootstrap(): Promise<void> {
  registerScreensIpc({ getProjectRoot: resolveProjectRoot });
  mainWindow = createMainWindow();
  await loadRenderer(mainWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  void (async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await bootstrap();
    }
  })();
});

void app.whenReady().then(() => bootstrap());
