import type { LoadScreensResult } from '../types';

/**
 * API surface the preload script exposes to the renderer through
 * `contextBridge`. Methods stay JSON-serialisable since they cross IPC.
 */
export interface NavimintBridge {
  loadScreensDocument(): Promise<LoadScreensResult>;
  /** Returns the project root currently held by the main process. */
  getProjectRoot(): Promise<string | null>;
  /**
   * Opens the native folder picker. Resolves to the selected absolute path on
   * confirmation, or `null` when the dialog is cancelled.
   */
  openProjectDialog(): Promise<string | null>;
  /** Subscribes to project root changes pushed from the main process. */
  onProjectRootChanged(callback: (projectRoot: string | null) => void): () => void;
}

export const NAVIMINT_BRIDGE_KEY = 'navimint';
