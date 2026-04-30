import { type BrowserWindow, dialog, type OpenDialogOptions } from 'electron';

/**
 * Show the native folder picker. Resolves to the absolute path of the chosen
 * directory, or `null` when the user cancels.
 *
 * On macOS the dialog is presented as a window-modal sheet when a parent
 * window is supplied, matching the platform convention for "Open" dialogs.
 */
export async function showOpenProjectDialog(
  window: BrowserWindow | null,
): Promise<string | null> {
  const options: OpenDialogOptions = {
    title: 'Open project folder',
    buttonLabel: 'Open',
    properties: ['openDirectory', 'createDirectory'],
  };

  const result =
    window === null
      ? await dialog.showOpenDialog(options)
      : await dialog.showOpenDialog(window, options);

  if (result.canceled) {
    return null;
  }
  const [first] = result.filePaths;
  return first ?? null;
}
