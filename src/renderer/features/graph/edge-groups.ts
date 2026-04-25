import type { ScreenDefinition } from '@shared/types';

import { FNV1A_HASH_RADIX, FNV1A_OFFSET, fnv1aUpdate } from './fnv1a-string';
import type { GraphEdgeGroup, TransitionInput } from './graph-types';

const GROUP_DELIMITER = '\u001f';

export function stableGraphId(prefix: string, parts: readonly string[]): string {
  return `${prefix}:${hashParts(parts)}`;
}

export function buildEdgeGroups(
  screens: readonly ScreenDefinition[],
  transitions: readonly TransitionInput[],
): GraphEdgeGroup[] {
  const validScreenIds = new Set(screens.map((screen) => screen.id));
  const groups = new Map<string, GraphEdgeGroup>();
  const transitionOccurrenceBySignature = new Map<string, number>();

  transitions.forEach((transition) => {
    if (!validScreenIds.has(transition.from) || !validScreenIds.has(transition.to)) {
      return;
    }

    const groupId = stableGraphId('edge', [transition.from, transition.to]);
    const group = getOrCreateGroup(groups, groupId, transition.from, transition.to);
    const transitionId = buildTransitionId(transition, transitionOccurrenceBySignature);
    group.transitions.push({
      id: transitionId,
      from: transition.from,
      to: transition.to,
      trigger: transition.trigger,
      condition: transition.condition,
    });
  });

  return Array.from(groups.values());
}

function getOrCreateGroup(
  groups: Map<string, GraphEdgeGroup>,
  id: string,
  from: string,
  to: string,
): GraphEdgeGroup {
  const existing = groups.get(id);
  if (existing !== undefined) {
    return existing;
  }

  const group: GraphEdgeGroup = {
    id,
    from,
    to,
    transitions: [],
    isSelfLoop: from === to,
  };
  groups.set(id, group);
  return group;
}

function buildTransitionId(
  transition: TransitionInput,
  occurrenceBySignature: Map<string, number>,
): string {
  const signature = [
    transition.from,
    transition.to,
    transition.trigger ?? '',
    transition.condition ?? '',
  ];
  const signatureKey = signature.join(GROUP_DELIMITER);
  const occurrence = occurrenceBySignature.get(signatureKey) ?? 0;
  occurrenceBySignature.set(signatureKey, occurrence + 1);

  return stableGraphId('transition', [
    ...signature,
    String(occurrence),
  ]);
}

function hashParts(parts: readonly string[]): string {
  let hash = FNV1A_OFFSET;
  for (const part of parts) {
    hash = fnv1aUpdate(hash, part);
    hash = fnv1aUpdate(hash, GROUP_DELIMITER);
  }
  return (hash >>> 0).toString(FNV1A_HASH_RADIX);
}
