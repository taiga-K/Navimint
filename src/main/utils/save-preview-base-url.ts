import { promises as fs } from 'node:fs';
import path from 'node:path';

import { SCREENS_JSON_FILENAME } from '../../shared/constants';
import type { SavePreviewBaseUrlResult } from '../../shared/types';
import { parseHttpUrl } from '../../shared/utils/preview-url';
import {
  ScreensDocumentShapeError,
  validateScreensDocument,
} from './validate-screens-document';

export interface SavePreviewBaseUrlOptions {
  projectRoot: string | null;
  baseUrl: string;
}

export async function savePreviewBaseUrl(
  options: SavePreviewBaseUrlOptions,
): Promise<SavePreviewBaseUrlResult> {
  const parsedBaseUrl = parseHttpUrl(options.baseUrl, 'Base URL');
  if (!parsedBaseUrl.ok) {
    return {
      ok: false,
      reason: 'invalid-base-url',
      message: parsedBaseUrl.message,
      filePath: null,
    };
  }

  if (options.projectRoot === null || options.projectRoot.length === 0) {
    return {
      ok: false,
      reason: 'no-project-root',
      message: 'No project root is configured',
      filePath: null,
    };
  }

  const filePath = path.join(options.projectRoot, SCREENS_JSON_FILENAME);
  const readResult = await readJsonFile(filePath);
  if (!readResult.ok) {
    return readResult;
  }

  try {
    validateScreensDocument(readResult.value);
  } catch (error) {
    return documentShapeFailure(error, filePath);
  }

  if (!isPlainObject(readResult.value) || !isPlainObject(readResult.value.project)) {
    return {
      ok: false,
      reason: 'invalid-shape',
      message: 'Expected "project" to be an object',
      filePath,
    };
  }

  const nextValue = {
    ...readResult.value,
    project: {
      ...readResult.value.project,
      baseURL: parsedBaseUrl.href,
    },
  };

  let nextDocument;
  try {
    nextDocument = validateScreensDocument(nextValue);
  } catch (error) {
    return documentShapeFailure(error, filePath);
  }

  try {
    await fs.writeFile(filePath, `${JSON.stringify(nextValue, null, 2)}\n`, 'utf8');
  } catch (error) {
    return {
      ok: false,
      reason: 'unexpected-error',
      message: errorMessage(error),
      filePath,
    };
  }

  return {
    ok: true,
    document: nextDocument,
    filePath,
  };
}

type ReadJsonResult =
  | { ok: true; value: unknown }
  | {
      ok: false;
      reason: 'file-not-found' | 'invalid-json' | 'unexpected-error';
      message: string;
      filePath: string;
    };

async function readJsonFile(filePath: string): Promise<ReadJsonResult> {
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

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch (error) {
    return {
      ok: false,
      reason: 'invalid-json',
      message: `Failed to parse ${SCREENS_JSON_FILENAME}: ${errorMessage(error)}`,
      filePath,
    };
  }
}

function documentShapeFailure(error: unknown, filePath: string): SavePreviewBaseUrlResult {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
