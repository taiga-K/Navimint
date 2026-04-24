import type { NavimintBridge } from '@shared/preload/api';
import type { LoadScreensResult } from '@shared/types';

/**
 * When the renderer runs in a normal browser (Vite only), Electron preload is
 * absent and `window.navimint` is undefined. A stub keeps the app renderable
 * and surfaces the same "no project" state as the real bridge with no root.
 */
const BROWSER_DEV_STUB: NavimintBridge = {
  getProjectRoot: () => Promise.resolve(null),
  loadScreensDocument: (): Promise<LoadScreensResult> =>
    Promise.resolve({
      ok: false,
      reason: 'no-project-root',
      message: 'Open this app via Electron to load a project folder.',
      filePath: null,
    }),
  openProjectDialog: () => Promise.resolve(null),
  onProjectRootChanged: () => () => {},
};

/**
 * Resolves the IPC bridge from preload, or a no-op implementation when not in Electron.
 */
export function getNavimintBridge(): NavimintBridge {
  if (typeof window === 'undefined') {
    return BROWSER_DEV_STUB;
  }
  const w = window as Window & { navimint?: NavimintBridge };
  return w.navimint ?? BROWSER_DEV_STUB;
}
