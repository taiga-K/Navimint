import { describe, expect, it } from 'vitest';

import { applyGraphSelection, getEdgeRelation } from './graph-selection';
import type { ScreenFlowNode, TransitionFlowEdge } from './graph-types';

describe('getEdgeRelation', () => {
  it('classifies selected screen direction relative to an edge', () => {
    const edge = { sourceScreenId: 'projects', targetScreenId: 'detail' };

    expect(getEdgeRelation(edge, 'projects')).toBe('outgoing');
    expect(getEdgeRelation(edge, 'detail')).toBe('incoming');
    expect(getEdgeRelation(edge, 'settings')).toBe('unrelated');
    expect(getEdgeRelation({ sourceScreenId: 'settings', targetScreenId: 'settings' }, 'settings')).toBe(
      'self',
    );
  });
});

describe('applyGraphSelection', () => {
  it('highlights selected nodes and connected edges while muting unrelated edges', () => {
    const elements = {
      nodes: [
        makeNode('projects'),
        makeNode('detail'),
        makeNode('settings'),
      ],
      edges: [
        makeEdge('projects-detail', 'projects', 'detail'),
        makeEdge('settings-settings', 'settings', 'settings'),
      ],
    };

    const selected = applyGraphSelection(elements, 'projects');

    expect(selected.nodes.find((node) => node.id === 'projects')?.data.selected).toBe(true);
    expect(selected.edges.find((edge) => edge.id === 'projects-detail')?.data.highlighted).toBe(true);
    expect(selected.edges.find((edge) => edge.id === 'projects-detail')?.animated).toBe(true);
    expect(selected.edges.find((edge) => edge.id === 'projects-detail')?.className).toBe(
      'transition-edge transition-edge--outgoing',
    );
    expect(selected.edges.find((edge) => edge.id === 'settings-settings')?.data.muted).toBe(true);
    expect(selected.edges.find((edge) => edge.id === 'settings-settings')?.animated).toBe(false);
  });
});

function makeNode(id: string): ScreenFlowNode {
  return {
    id,
    position: { x: 0, y: 0 },
    data: {
      screen: { id, name: id, route: `/${id}` },
      isOrphan: false,
      selected: false,
    },
  };
}

function makeEdge(id: string, source: string, target: string): TransitionFlowEdge {
  return {
    id,
    source,
    target,
    data: {
      sourceScreenId: source,
      targetScreenId: target,
      transitions: [],
      isSelfLoop: source === target,
      routePoints: [],
      relation: 'unrelated',
      highlighted: false,
      muted: false,
    },
  };
}
