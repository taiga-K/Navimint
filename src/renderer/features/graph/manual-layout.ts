import type { FlowPoint, LayoutedGraphElements } from './graph-types';

const STORAGE_KEY_PREFIX = 'navimint:graph-layout:v1';
const STORAGE_SCHEMA_VERSION = 1;
const HASH_OFFSET = 0x811c9dc5;
const HASH_PRIME = 0x01000193;
const HASH_RADIX = 36;
const MAX_POSITION_ABS_VALUE = 1_000_000;
const MAX_SCREEN_ID_LENGTH = 512;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export type ManualNodePositions = Record<string, FlowPoint>;

export interface GraphLayoutStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface StoredManualLayout {
  version: number;
  nodes: ManualNodePositions;
}

export function applyManualLayoutPositions(
  elements: LayoutedGraphElements,
  positions: ManualNodePositions,
): LayoutedGraphElements {
  const manuallyPositionedNodeIds = new Set<string>();
  const nodes = elements.nodes.map((node) => {
    const position = positions[node.id];
    if (!isValidPoint(position)) {
      return node;
    }
    manuallyPositionedNodeIds.add(node.id);
    return {
      ...node,
      position: { ...position },
    };
  });

  if (manuallyPositionedNodeIds.size === 0) {
    return { nodes, edges: elements.edges };
  }

  return {
    nodes,
    edges: elements.edges.map((edge) => {
      if (!manuallyPositionedNodeIds.has(edge.source) && !manuallyPositionedNodeIds.has(edge.target)) {
        return edge;
      }
      return {
        ...edge,
        data: {
          ...edge.data,
          routePoints: [],
        },
      };
    }),
  };
}

export function readManualLayoutPositions(
  scope: string | null,
  storage: GraphLayoutStorage | null,
): ManualNodePositions {
  const key = getManualLayoutStorageKey(scope);
  if (key === null || storage === null) {
    return createEmptyPositions();
  }

  try {
    const rawValue = storage.getItem(key);
    if (rawValue === null) {
      return createEmptyPositions();
    }
    return parseManualLayout(rawValue);
  } catch {
    return createEmptyPositions();
  }
}

export function writeManualLayoutPositions(
  scope: string | null,
  storage: GraphLayoutStorage | null,
  positions: ManualNodePositions,
): void {
  const key = getManualLayoutStorageKey(scope);
  if (key === null || storage === null) {
    return;
  }

  const sanitizedPositions = sanitizePositions(positions);
  const snapshot: StoredManualLayout = {
    version: STORAGE_SCHEMA_VERSION,
    nodes: sanitizedPositions,
  };

  try {
    storage.setItem(key, JSON.stringify(snapshot));
  } catch {
    return;
  }
}

export function clearManualLayoutPositions(
  scope: string | null,
  storage: GraphLayoutStorage | null,
): void {
  const key = getManualLayoutStorageKey(scope);
  if (key === null || storage === null) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    return;
  }
}

export function hasManualLayoutPositions(positions: ManualNodePositions): boolean {
  return Object.keys(positions).length > 0;
}

export function getManualLayoutStorageKey(scope: string | null): string | null {
  const normalizedScope = scope?.trim();
  if (normalizedScope === undefined || normalizedScope.length === 0) {
    return null;
  }
  return `${STORAGE_KEY_PREFIX}:${hashString(normalizedScope)}`;
}

export function createEmptyPositions(): ManualNodePositions {
  return Object.create(null) as ManualNodePositions;
}

export function upsertManualLayoutPositions(
  current: ManualNodePositions,
  nodes: readonly { id: string; position: FlowPoint }[],
): ManualNodePositions {
  let next = current;
  for (const node of nodes) {
    if (!isSafeNodeId(node.id) || !isValidPoint(node.position)) {
      continue;
    }
    if (next === current) {
      next = { ...current };
    }
    next[node.id] = { x: node.position.x, y: node.position.y };
  }
  return next;
}

function parseManualLayout(rawValue: string): ManualNodePositions {
  const parsed: unknown = JSON.parse(rawValue);
  if (!isObjectRecord(parsed)) {
    return createEmptyPositions();
  }
  if (parsed.version !== STORAGE_SCHEMA_VERSION || !isObjectRecord(parsed.nodes)) {
    return createEmptyPositions();
  }
  return sanitizePositions(parsed.nodes);
}

function sanitizePositions(value: Record<string, unknown>): ManualNodePositions {
  const result = createEmptyPositions();
  for (const [id, position] of Object.entries(value)) {
    if (!isSafeNodeId(id) || !isObjectRecord(position)) {
      continue;
    }
    const point = { x: position.x, y: position.y };
    if (!isValidPoint(point)) {
      continue;
    }
    result[id] = { x: point.x, y: point.y };
  }
  return result;
}

function isSafeNodeId(id: string): boolean {
  return id.length > 0 && id.length <= MAX_SCREEN_ID_LENGTH && !BLOCKED_KEYS.has(id);
}

function isValidPoint(value: unknown): value is FlowPoint {
  if (!isObjectRecord(value)) {
    return false;
  }
  return isValidCoordinate(value.x) && isValidCoordinate(value.y);
}

function isValidCoordinate(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.abs(value) <= MAX_POSITION_ABS_VALUE
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hashString(value: string): string {
  let hash = HASH_OFFSET;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, HASH_PRIME);
  }
  return (hash >>> 0).toString(HASH_RADIX);
}
