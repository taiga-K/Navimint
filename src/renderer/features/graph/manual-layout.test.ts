import { describe, expect, it } from 'vitest';

import type { LayoutedGraphElements } from './graph-types';
import {
  applyManualLayoutPositions,
  clearManualLayoutPositions,
  createEmptyPositions,
  getManualLayoutStorageKey,
  readManualLayoutPositions,
  upsertManualLayoutPositions,
  writeManualLayoutPositions,
} from './manual-layout';

describe('manual layout storage', () => {
  it('persists sanitized node positions under a hashed project key', () => {
    const storage = new MemoryStorage();
    const scope = '/Users/example/project';
    const key = getManualLayoutStorageKey(scope);

    writeManualLayoutPositions(scope, storage, {
      login: { x: 120, y: 240 },
      '__proto__': { x: 1, y: 2 },
      huge: { x: 9_999_999, y: 0 },
    });

    expect(key).not.toBeNull();
    expect(key).not.toContain(scope);
    expect(readManualLayoutPositions(scope, storage)).toEqual({
      login: { x: 120, y: 240 },
    });
  });

  it('clears saved positions without throwing', () => {
    const storage = new MemoryStorage();
    writeManualLayoutPositions('project', storage, {
      dashboard: { x: 10, y: 20 },
    });

    clearManualLayoutPositions('project', storage);

    expect(readManualLayoutPositions('project', storage)).toEqual({});
  });

  it('ignores malformed stored JSON', () => {
    const storage = new MemoryStorage();
    const key = getManualLayoutStorageKey('project');
    if (key !== null) {
      storage.setItem(key, '{not json');
    }

    expect(readManualLayoutPositions('project', storage)).toEqual({});
  });
});

describe('applyManualLayoutPositions', () => {
  it('overrides matching node positions and disables stale ELK routes for connected edges', () => {
    const elements: LayoutedGraphElements = {
      nodes: [
        makeNode('login', 0, 0),
        makeNode('dashboard', 100, 100),
        makeNode('settings', 200, 200),
      ],
      edges: [
        makeEdge('login-dashboard', 'login', 'dashboard'),
        makeEdge('settings-settings', 'settings', 'settings'),
      ],
    };

    const positioned = applyManualLayoutPositions(elements, {
      login: { x: 320, y: 480 },
    });

    expect(positioned.nodes.find((node) => node.id === 'login')?.position).toEqual({
      x: 320,
      y: 480,
    });
    expect(positioned.edges.find((edge) => edge.id === 'login-dashboard')?.data.routePoints).toEqual([]);
    expect(positioned.edges.find((edge) => edge.id === 'settings-settings')?.data.routePoints).toHaveLength(2);
  });

  it('upserts final drag positions into a copy', () => {
    const current = createEmptyPositions();
    const next = upsertManualLayoutPositions(current, [
      { id: 'profile', position: { x: 12, y: 34 } },
    ]);

    expect(next).not.toBe(current);
    expect(next.profile).toEqual({ x: 12, y: 34 });
  });
});

function makeNode(id: string, x: number, y: number): LayoutedGraphElements['nodes'][number] {
  return {
    id,
    position: { x, y },
    data: {
      screen: { id, name: id, route: `/${id}` },
      isOrphan: false,
      selected: false,
    },
  };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
): LayoutedGraphElements['edges'][number] {
  return {
    id,
    source,
    target,
    data: {
      sourceScreenId: source,
      targetScreenId: target,
      transitions: [],
      isSelfLoop: source === target,
      routePoints: [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      relation: 'unrelated',
      highlighted: false,
      muted: false,
    },
  };
}

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}
