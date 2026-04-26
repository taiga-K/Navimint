import type { NavimintBridge } from '@shared/preload/api';
import type {
  AnalyzeUiResult,
  CursorApiKeyOperationResult,
  CursorApiKeyStatusResult,
  LoadScreensResult,
  SavePreviewBaseUrlResult,
} from '@shared/types';

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
  analyzeUi: (): Promise<AnalyzeUiResult> =>
    Promise.resolve({
      ok: false,
      reason: 'no-project-root',
      message: 'Open this app via Electron to analyze a project folder.',
      filePath: null,
    }),
  openSettingsWindow: () => Promise.resolve(),
  getCursorApiKeyStatus: (): Promise<CursorApiKeyStatusResult> =>
    Promise.resolve({
      ok: true,
      status: { configured: false, source: null },
    }),
  saveCursorApiKey: (): Promise<CursorApiKeyOperationResult> =>
    Promise.resolve({
      ok: false,
      message: 'Open this app via Electron to save a Cursor API key.',
    }),
  deleteCursorApiKey: (): Promise<CursorApiKeyOperationResult> =>
    Promise.resolve({
      ok: false,
      message: 'Open this app via Electron to delete a Cursor API key.',
    }),
  savePreviewBaseUrl: (): Promise<SavePreviewBaseUrlResult> =>
    Promise.resolve({
      ok: false,
      reason: 'no-project-root',
      message: 'Open this app via Electron to save screens.json.',
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
