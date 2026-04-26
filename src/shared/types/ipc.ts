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

export type SavePreviewBaseUrlFailureReason = LoadScreensFailureReason | 'invalid-base-url';

export interface SavePreviewBaseUrlSuccess {
  ok: true;
  document: ScreensDocument;
  filePath: string;
}

export interface SavePreviewBaseUrlFailure {
  ok: false;
  reason: SavePreviewBaseUrlFailureReason;
  message: string;
  filePath: string | null;
}

export type SavePreviewBaseUrlResult =
  | SavePreviewBaseUrlSuccess
  | SavePreviewBaseUrlFailure;

export type AnalyzeUiFailureReason =
  | 'no-project-root'
  | 'missing-api-key'
  | 'agent-failed'
  | 'invalid-agent-output'
  | 'unexpected-error';

export interface AnalyzeUiSuccess {
  ok: true;
  document: ScreensDocument;
  filePath: string;
}

export interface AnalyzeUiFailure {
  ok: false;
  reason: AnalyzeUiFailureReason;
  message: string;
  filePath: string | null;
}

export type AnalyzeUiResult = AnalyzeUiSuccess | AnalyzeUiFailure;

export type CursorApiKeySource = 'keychain' | 'env' | null;

export interface CursorApiKeyStatus {
  configured: boolean;
  source: CursorApiKeySource;
}

export interface CursorApiKeyStatusSuccess {
  ok: true;
  status: CursorApiKeyStatus;
}

export interface CursorApiKeyOperationSuccess {
  ok: true;
  status: CursorApiKeyStatus;
}

export interface CursorApiKeyOperationFailure {
  ok: false;
  message: string;
}

export type CursorApiKeyStatusResult =
  | CursorApiKeyStatusSuccess
  | CursorApiKeyOperationFailure;

export type CursorApiKeyOperationResult =
  | CursorApiKeyOperationSuccess
  | CursorApiKeyOperationFailure;

export const IPC_CHANNELS = {
  loadScreensDocument: 'navimint:screens:load',
  savePreviewBaseUrl: 'navimint:screens:save-preview-base-url',
  analyzeUi: 'navimint:screens:analyze-ui',
  getCursorApiKeyStatus: 'navimint:settings:cursor-api-key-status',
  saveCursorApiKey: 'navimint:settings:save-cursor-api-key',
  deleteCursorApiKey: 'navimint:settings:delete-cursor-api-key',
  openSettingsWindow: 'navimint:settings:open-window',
  getProjectRoot: 'navimint:project:get-root',
  openProjectDialog: 'navimint:project:open-dialog',
  /** Push event from main: emitted whenever the active project root changes. */
  projectRootChanged: 'navimint:project:root-changed',
} as const;
