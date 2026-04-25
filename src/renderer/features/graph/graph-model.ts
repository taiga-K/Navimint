import type { ScreenDefinition } from '@shared/types';

import { buildEdgeGroups } from './edge-groups';
import type { GraphScreenNode, ScreenGraphModel, TransitionInput } from './graph-types';

export function buildScreenGraphModel(
  screens: readonly ScreenDefinition[],
  transitions: readonly TransitionInput[],
): ScreenGraphModel {
  const edgeGroups = buildEdgeGroups(screens, transitions);
  const connectedScreenIds = collectConnectedScreenIds(edgeGroups);
  const nodes = screens.map<GraphScreenNode>((screen) => ({
    id: screen.id,
    screen,
    isOrphan: !connectedScreenIds.has(screen.id),
  }));

  return { nodes, edgeGroups };
}

function collectConnectedScreenIds(edgeGroups: readonly { from: string; to: string }[]): Set<string> {
  const result = new Set<string>();
  for (const group of edgeGroups) {
    result.add(group.from);
    result.add(group.to);
  }
  return result;
}
