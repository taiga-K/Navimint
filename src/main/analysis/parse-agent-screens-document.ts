import type { ScreensDocument } from '../../shared/types';
import {
  ScreensDocumentShapeError,
  validateScreensDocument,
} from '../utils/validate-screens-document';
import { errorMessage } from '../utils/value-guards';

export class AgentScreensDocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentScreensDocumentParseError';
  }
}

export function parseAgentScreensDocument(raw: string): ScreensDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw.trim()));
  } catch (error) {
    throw new AgentScreensDocumentParseError(
      `Failed to parse Cursor agent output as JSON: ${errorMessage(error)}`,
    );
  }

  try {
    return validateScreensDocument(parsed);
  } catch (error) {
    if (error instanceof ScreensDocumentShapeError) {
      throw new AgentScreensDocumentParseError(error.message);
    }
    throw error;
  }
}

function stripJsonFence(raw: string): string {
  const match = /^```(?:json)?\s*\n(?<json>[\s\S]*?)\n```$/u.exec(raw);
  return match?.groups?.json.trim() ?? raw;
}
