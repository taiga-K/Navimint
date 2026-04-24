import type {
  ScreenDefinition,
  ScreensDocument,
  ScreenTransition,
  WorkspaceDerived,
  WorkspaceState,
} from '@shared/types';

const EMPTY_DERIVED: WorkspaceDerived = {
  screenById: {},
  inboundByScreenId: {},
  outboundByScreenId: {},
  connectedScreenIds: [],
  orphanScreenIds: [],
  filteredConnectedScreenIds: [],
  filteredOrphanScreenIds: [],
};

/** Compute the full derived view in one pass; the provider memoises the result. */
export function deriveWorkspace(state: WorkspaceState): WorkspaceDerived {
  if (state.document === null) {
    return EMPTY_DERIVED;
  }

  const screenById = buildScreenById(state.document.screens);
  const { inbound, outbound } = buildTransitionIndex(state.document.transitions);
  const { connectedIds, orphanIds } = classifyScreens(state.document.screens, inbound, outbound);
  const matchedIds = filterScreens(state.document.screens, state.searchQuery);

  return {
    screenById,
    inboundByScreenId: inbound,
    outboundByScreenId: outbound,
    connectedScreenIds: connectedIds,
    orphanScreenIds: orphanIds,
    filteredConnectedScreenIds: connectedIds.filter((id) => matchedIds.has(id)),
    filteredOrphanScreenIds: orphanIds.filter((id) => matchedIds.has(id)),
  };
}

export function selectSelectedScreen(
  document: ScreensDocument | null,
  selectedScreenId: string | null,
): ScreenDefinition | null {
  if (document === null || selectedScreenId === null) {
    return null;
  }
  return document.screens.find((screen) => screen.id === selectedScreenId) ?? null;
}

function buildScreenById(screens: readonly ScreenDefinition[]): Record<string, ScreenDefinition> {
  const result: Record<string, ScreenDefinition> = {};
  for (const screen of screens) {
    result[screen.id] = screen;
  }
  return result;
}

interface TransitionIndex {
  inbound: Record<string, ScreenTransition[]>;
  outbound: Record<string, ScreenTransition[]>;
}

function buildTransitionIndex(transitions: readonly ScreenTransition[]): TransitionIndex {
  const inbound: Record<string, ScreenTransition[]> = {};
  const outbound: Record<string, ScreenTransition[]> = {};
  for (const transition of transitions) {
    pushInto(inbound, transition.to, transition);
    pushInto(outbound, transition.from, transition);
  }
  return { inbound, outbound };
}

function pushInto(
  target: Record<string, ScreenTransition[]>,
  key: string,
  value: ScreenTransition,
): void {
  const bucket = target[key];
  if (bucket === undefined) {
    target[key] = [value];
    return;
  }
  bucket.push(value);
}

interface ClassifiedScreens {
  connectedIds: string[];
  orphanIds: string[];
}

function classifyScreens(
  screens: readonly ScreenDefinition[],
  inbound: Record<string, ScreenTransition[]>,
  outbound: Record<string, ScreenTransition[]>,
): ClassifiedScreens {
  const connectedIds: string[] = [];
  const orphanIds: string[] = [];
  for (const screen of screens) {
    const hasInbound = (inbound[screen.id]?.length ?? 0) > 0;
    const hasOutbound = (outbound[screen.id]?.length ?? 0) > 0;
    if (hasInbound || hasOutbound) {
      connectedIds.push(screen.id);
    } else {
      orphanIds.push(screen.id);
    }
  }
  return { connectedIds, orphanIds };
}

function filterScreens(
  screens: readonly ScreenDefinition[],
  query: string,
): Set<string> {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return new Set(screens.map((screen) => screen.id));
  }
  const matches = new Set<string>();
  for (const screen of screens) {
    if (matchesQuery(screen, trimmed)) {
      matches.add(screen.id);
    }
  }
  return matches;
}

function matchesQuery(screen: ScreenDefinition, normalisedQuery: string): boolean {
  if (screen.name.toLowerCase().includes(normalisedQuery)) {
    return true;
  }
  if (screen.route.toLowerCase().includes(normalisedQuery)) {
    return true;
  }
  if (screen.description !== undefined && screen.description.toLowerCase().includes(normalisedQuery)) {
    return true;
  }
  return false;
}
