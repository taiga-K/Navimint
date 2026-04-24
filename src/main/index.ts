import path from 'node:path';

import { app, BrowserWindow } from 'electron';

import { IPC_CHANNELS } from '../shared/types';
import { showOpenProjectDialog } from './dialogs/open-project-dialog';
import { registerProjectIpc } from './ipc/project';
import { registerScreensIpc } from './ipc/screens';
import { installAppMenu } from './menu';
import { getProjectRoot, onProjectRootChanged, setProjectRoot } from './project-root';
import { createMainWindow } from './window';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

async function loadRenderer(window: BrowserWindow): Promise<void> {
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5173';
    await window.loadURL(devServerUrl);
    return;
  }
  await window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

async function handleOpenProject(): Promise<void> {
  const next = await showOpenProjectDialog(mainWindow);
  if (next !== null) {
    setProjectRoot(next);
  }
}

function broadcastProjectRoot(projectRoot: string | null): void {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_CHANNELS.projectRootChanged, projectRoot);
  }
}

async function bootstrap(): Promise<void> {
  registerScreensIpc({ getProjectRoot });
  registerProjectIpc();
  installAppMenu({
    onOpenProject: () => {
      void handleOpenProject();
    },
  });
  onProjectRootChanged(broadcastProjectRoot);
  const win = createMainWindow();
  mainWindow = win;
  win.once('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });
  await loadRenderer(win);
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
