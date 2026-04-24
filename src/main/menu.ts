import { app, Menu, type MenuItemConstructorOptions } from 'electron';

export interface BuildAppMenuOptions {
  /** Invoked when the user selects "File > Open Folder...". */
  onOpenProject: () => void;
}

/**
 * Build the Navimint application menu.
 *
 * The macOS-only `appMenu` block is included automatically when running on
 * darwin so that About / Hide / Quit appear under the app name. The File menu
 * exposes the project picker and platform-appropriate Close / Quit entries.
 *
 * Reference: https://www.electronjs.org/ja/docs/latest/tutorial/application-menu
 */
export function buildAppMenu({ onOpenProject }: BuildAppMenuOptions): Menu {
  const isMac = process.platform === 'darwin';

  const macAppMenu: MenuItemConstructorOptions = {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  };

  const fileMenu: MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder...',
        accelerator: 'CmdOrCtrl+O',
        click: onOpenProject,
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [macAppMenu] : []),
    fileMenu,
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ];

  return Menu.buildFromTemplate(template);
}

/** Convenience helper that immediately installs the menu as the application menu. */
export function installAppMenu(options: BuildAppMenuOptions): void {
  Menu.setApplicationMenu(buildAppMenu(options));
}
