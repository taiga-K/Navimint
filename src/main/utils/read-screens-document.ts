import { promises as fs } from 'node:fs';
import path from 'node:path';

import { SCREENS_JSON_FILENAME } from '../../shared/constants';
import type { LoadScreensResult } from '../../shared/types';
import {
  ScreensDocumentShapeError,
  validateScreensDocument,
} from './validate-screens-document';

export interface ReadScreensDocumentOptions {
  projectRoot: string | null;
}

/**
 * Read `<projectRoot>/screens.json`. Documented failures resolve as
 * `{ ok: false }` so callers can render empty/error states without try/catch.
 */
export async function readScreensDocument(
  options: ReadScreensDocumentOptions,
): Promise<LoadScreensResult> {
  const { projectRoot } = options;

  if (projectRoot === null || projectRoot.length === 0) {
    return {
      ok: false,
      reason: 'no-project-root',
      message: 'No project root is configured',
      filePath: null,
    };
  }

  const filePath = path.join(projectRoot, SCREENS_JSON_FILENAME);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return {
        ok: false,
        reason: 'file-not-found',
        message: `${SCREENS_JSON_FILENAME} was not found in the project root`,
        filePath,
      };
    }
    return {
      ok: false,
      reason: 'unexpected-error',
      message: errorMessage(error),
      filePath,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      reason: 'invalid-json',
      message: `Failed to parse ${SCREENS_JSON_FILENAME}: ${errorMessage(error)}`,
      filePath,
    };
  }

  try {
    const document = validateScreensDocument(parsed);
    return { ok: true, document, filePath };
  } catch (error) {
    if (error instanceof ScreensDocumentShapeError) {
      return {
        ok: false,
        reason: 'invalid-shape',
        message: error.message,
        filePath,
      };
    }
    return {
      ok: false,
      reason: 'unexpected-error',
      message: errorMessage(error),
      filePath,
    };
  }
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === 'string';
}

function errorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }
  return String(value);
}
