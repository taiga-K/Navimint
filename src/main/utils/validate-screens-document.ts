import {
  type ScreenDefinition,
  SCREENS_DOCUMENT_VERSION,
  type ScreensDocument,
  type ScreensProject,
  type ScreenTransition,
} from '../../shared/types';
import { isPlainObject } from './value-guards';

export class ScreensDocumentShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScreensDocumentShapeError';
  }
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new ScreensDocumentShapeError(`Expected "${field}" to be a string`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ScreensDocumentShapeError(`Expected "${field}" to be a string when present`);
  }
  return value;
}

function validateProject(value: unknown): ScreensProject {
  if (!isPlainObject(value)) {
    throw new ScreensDocumentShapeError('Expected "project" to be an object');
  }
  return {
    name: expectString(value.name, 'project.name'),
    baseURL: expectString(value.baseURL, 'project.baseURL'),
  };
}

function validateScreen(value: unknown, index: number): ScreenDefinition {
  if (!isPlainObject(value)) {
    throw new ScreensDocumentShapeError(`Expected "screens[${index}]" to be an object`);
  }
  return {
    id: expectString(value.id, `screens[${index}].id`),
    name: expectString(value.name, `screens[${index}].name`),
    route: expectString(value.route, `screens[${index}].route`),
    description: optionalString(value.description, `screens[${index}].description`),
    color: optionalString(value.color, `screens[${index}].color`),
  };
}

function validateTransition(value: unknown, index: number): ScreenTransition {
  if (!isPlainObject(value)) {
    throw new ScreensDocumentShapeError(`Expected "transitions[${index}]" to be an object`);
  }
  return {
    from: expectString(value.from, `transitions[${index}].from`),
    to: expectString(value.to, `transitions[${index}].to`),
    trigger: optionalString(value.trigger, `transitions[${index}].trigger`),
    condition: optionalString(value.condition, `transitions[${index}].condition`),
  };
}

function ensureUniqueIds(screens: readonly ScreenDefinition[]): void {
  const seen = new Set<string>();
  for (const screen of screens) {
    if (seen.has(screen.id)) {
      throw new ScreensDocumentShapeError(`Duplicate "screens[].id": ${screen.id}`);
    }
    seen.add(screen.id);
  }
}

function dropDanglingTransitions(
  screens: readonly ScreenDefinition[],
  transitions: readonly ScreenTransition[],
): ScreenTransition[] {
  const knownIds = new Set(screens.map((screen) => screen.id));
  return transitions.filter(
    (transition) => knownIds.has(transition.from) && knownIds.has(transition.to),
  );
}

/**
 * Coerce a parsed JSON value into a `ScreensDocument`. Transitions referencing
 * unknown screens are dropped per `docs/screens-json.md`.
 */
export function validateScreensDocument(value: unknown): ScreensDocument {
  if (!isPlainObject(value)) {
    throw new ScreensDocumentShapeError('Expected the document root to be an object');
  }

  const version = expectString(value.version, 'version');
  if (version !== SCREENS_DOCUMENT_VERSION) {
    throw new ScreensDocumentShapeError(
      `Unsupported "version": expected "${SCREENS_DOCUMENT_VERSION}", got "${version}"`,
    );
  }

  const project = validateProject(value.project);

  if (!Array.isArray(value.screens)) {
    throw new ScreensDocumentShapeError('Expected "screens" to be an array');
  }
  const screens = value.screens.map((entry, index) => validateScreen(entry, index));
  ensureUniqueIds(screens);

  if (!Array.isArray(value.transitions)) {
    throw new ScreensDocumentShapeError('Expected "transitions" to be an array');
  }
  const rawTransitions = value.transitions.map((entry, index) => validateTransition(entry, index));
  const transitions = dropDanglingTransitions(screens, rawTransitions);

  return {
    version: SCREENS_DOCUMENT_VERSION,
    project,
    screens,
    transitions,
  };
}
