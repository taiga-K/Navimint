import type { ScreensDocument } from './screens';

export type LoadScreensFailureReason =
  | 'no-project-root'
  | 'file-not-found'
  | 'invalid-json'
  | 'invalid-shape'
  | 'unexpected-error';

export interface LoadScreensSuccess {
  ok: true;
  document: ScreensDocument;
  filePath: string;
}

export interface LoadScreensFailure {
  ok: false;
  reason: LoadScreensFailureReason;
  message: string;
  filePath: string | null;
}

export type LoadScreensResult = LoadScreensSuccess | LoadScreensFailure;

export const IPC_CHANNELS = {
  loadScreensDocument: 'navimint:screens:load',
  getProjectRoot: 'navimint:project:get-root',
  openProjectDialog: 'navimint:project:open-dialog',
  /** Push event from main: emitted whenever the active project root changes. */
  projectRootChanged: 'navimint:project:root-changed',
} as const;
