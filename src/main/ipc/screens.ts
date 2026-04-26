import { ipcMain } from 'electron';

import {
  type AnalyzeUiResult,
  IPC_CHANNELS,
  type LoadScreensResult,
  type SavePreviewBaseUrlResult,
  type ScreensDocument,
} from '../../shared/types';
import {
  AgentScreensDocumentParseError,
  parseAgentScreensDocument,
} from '../analysis/parse-agent-screens-document';
import { runAnalyzeUi } from '../analysis/run-analyze-ui';
import { readScreensDocument } from '../utils/read-screens-document';
import { savePreviewBaseUrl } from '../utils/save-preview-base-url';
import { errorMessage } from '../utils/value-guards';
import { writeScreensDocument } from '../utils/write-screens-document';

const DEFAULT_ANALYZE_BASE_URL = 'http://localhost:5173';

export interface ScreensIpcOptions {
  /** Returns the active project root, or `null` when none is open. */
  getProjectRoot: () => string | null;
}

let registered = false;

/** Idempotent: subsequent calls do not re-register the handlers. */
export function registerScreensIpc(options: ScreensIpcOptions): void {
  if (registered) {
    return;
  }
  registered = true;

  ipcMain.handle(IPC_CHANNELS.loadScreensDocument, async (): Promise<LoadScreensResult> => {
    const projectRoot = options.getProjectRoot();
    return readScreensDocument({ projectRoot });
  });

  ipcMain.handle(IPC_CHANNELS.analyzeUi, async (): Promise<AnalyzeUiResult> => {
    const projectRoot = options.getProjectRoot();
    return analyzeUi({ projectRoot });
  });

  ipcMain.handle(
    IPC_CHANNELS.savePreviewBaseUrl,
    async (_event, baseUrl: unknown): Promise<SavePreviewBaseUrlResult> => {
      if (typeof baseUrl !== 'string') {
        return {
          ok: false,
          reason: 'invalid-base-url',
          message: 'Base URL must be a string.',
          filePath: null,
        };
      }

      const projectRoot = options.getProjectRoot();
      return savePreviewBaseUrl({ projectRoot, baseUrl });
    },
  );
}

async function analyzeUi(options: { projectRoot: string | null }): Promise<AnalyzeUiResult> {
  if (options.projectRoot === null || options.projectRoot.length === 0) {
    return {
      ok: false,
      reason: 'no-project-root',
      message: 'No project root is configured',
      filePath: null,
    };
  }

  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (apiKey === undefined || apiKey.length === 0) {
    return {
      ok: false,
      reason: 'missing-api-key',
      message: 'CURSOR_API_KEY is not configured.',
      filePath: null,
    };
  }

  let rawDocument: string;
  try {
    rawDocument = await runAnalyzeUi({
      projectRoot: options.projectRoot,
      baseURL: await resolveAnalyzeBaseUrl(options.projectRoot),
      apiKey,
    });
  } catch (error) {
    return {
      ok: false,
      reason: 'agent-failed',
      message: errorMessage(error),
      filePath: null,
    };
  }

  let document: ScreensDocument;
  try {
    document = parseAgentScreensDocument(rawDocument);
  } catch (error) {
    const isAgentOutputError = error instanceof AgentScreensDocumentParseError;
    return {
      ok: false,
      reason: isAgentOutputError ? 'invalid-agent-output' : 'unexpected-error',
      message: errorMessage(error),
      filePath: null,
    };
  }

  try {
    const filePath = await writeScreensDocument({
      projectRoot: options.projectRoot,
      document,
    });
    return {
      ok: true,
      document,
      filePath,
    };
  } catch (error) {
    return {
      ok: false,
      reason: 'unexpected-error',
      message: errorMessage(error),
      filePath: null,
    };
  }
}

async function resolveAnalyzeBaseUrl(projectRoot: string): Promise<string> {
  const currentDocument = await readScreensDocument({ projectRoot });
  if (currentDocument.ok) {
    return currentDocument.document.project.baseURL;
  }

  const fromEnv = process.env.NAVIMINT_PREVIEW_BASE_URL?.trim();
  return fromEnv === undefined || fromEnv.length === 0
    ? DEFAULT_ANALYZE_BASE_URL
    : fromEnv;
}
