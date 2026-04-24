import type { ScreenDefinition, WorkspaceLoadState } from '@shared/types';
import { type ReactNode, useCallback, useMemo } from 'react';

import { useWorkspace } from '../../workspace/use-workspace';
import { ScreenSection } from './ScreenSection';
import { ScreensSearchInput } from './ScreensSearchInput';

const ROUTES_SECTION = 'Routes';
const ORPHAN_SECTION = 'Orphan';

export function ScreensSidebar() {
  const { state, derived, dispatch } = useWorkspace();

  const handleSearchChange = useCallback(
    (next: string) => {
      dispatch({ type: 'search-query-changed', query: next });
    },
    [dispatch],
  );
  const handleSelectScreen = useCallback(
    (screenId: string) => {
      dispatch({ type: 'screen-selected', screenId });
    },
    [dispatch],
  );

  const connectedScreens = useMemo(
    () => mapToScreens(derived.filteredConnectedScreenIds, derived.screenById),
    [derived.filteredConnectedScreenIds, derived.screenById],
  );
  const orphanScreens = useMemo(
    () => mapToScreens(derived.filteredOrphanScreenIds, derived.screenById),
    [derived.filteredOrphanScreenIds, derived.screenById],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarHeader>
        <ScreensSearchInput onChange={handleSearchChange} value={state.searchQuery} />
      </SidebarHeader>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <SidebarBody
          connectedScreens={connectedScreens}
          loadState={state.loadState}
          onSelect={handleSelectScreen}
          orphanScreens={orphanScreens}
          searchQuery={state.searchQuery}
          selectedScreenId={state.selectedScreenId}
          totalConnected={derived.connectedScreenIds.length}
          totalOrphans={derived.orphanScreenIds.length}
          totalScreens={state.document?.screens.length ?? 0}
        />
      </div>
      <SidebarFooter
        loadState={state.loadState}
        totalScreens={state.document?.screens.length ?? 0}
        visibleScreens={connectedScreens.length + orphanScreens.length}
      />
    </div>
  );
}

function SidebarHeader({ children }: { children: ReactNode }) {
  return (
    <header className="flex flex-col gap-2 border-b border-border-strong px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Screens
        </span>
      </div>
      {children}
    </header>
  );
}

interface SidebarBodyProps {
  connectedScreens: ScreenDefinition[];
  orphanScreens: ScreenDefinition[];
  totalConnected: number;
  totalOrphans: number;
  totalScreens: number;
  selectedScreenId: string | null;
  searchQuery: string;
  loadState: WorkspaceLoadState;
  onSelect: (screenId: string) => void;
}

function SidebarBody({
  connectedScreens,
  orphanScreens,
  totalConnected,
  totalOrphans,
  totalScreens,
  selectedScreenId,
  searchQuery,
  loadState,
  onSelect,
}: SidebarBodyProps) {
  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <p className="px-3 py-6 text-sm text-text-muted">Loading screens...</p>
    );
  }

  if (loadState === 'error') {
    return (
      <p className="px-3 py-6 text-sm text-accent-danger">
        Failed to load screens.json. Check the project root and try again.
      </p>
    );
  }

  if (totalScreens === 0) {
    return (
      <p className="px-3 py-6 text-sm text-text-muted">
        screens.json is empty. Run analysis to populate this list.
      </p>
    );
  }

  const noMatches =
    searchQuery.trim().length > 0 &&
    connectedScreens.length === 0 &&
    orphanScreens.length === 0;
  if (noMatches) {
    return (
      <p className="px-3 py-6 text-sm text-text-muted">
        No screens match &ldquo;{searchQuery}&rdquo;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-3">
      <ScreenSection
        emptyLabel="No matches in routes."
        onSelect={onSelect}
        screens={connectedScreens}
        selectedScreenId={selectedScreenId}
        title={ROUTES_SECTION}
        totalCount={totalConnected}
      />
      <ScreenSection
        emptyLabel="No matches in orphan screens."
        onSelect={onSelect}
        screens={orphanScreens}
        selectedScreenId={selectedScreenId}
        title={ORPHAN_SECTION}
        totalCount={totalOrphans}
      />
    </div>
  );
}

interface SidebarFooterProps {
  loadState: WorkspaceLoadState;
  totalScreens: number;
  visibleScreens: number;
}

function SidebarFooter({ loadState, totalScreens, visibleScreens }: SidebarFooterProps) {
  if (loadState !== 'ready') {
    return null;
  }
  return (
    <footer className="border-t border-border-strong px-3 py-2 text-xs text-text-muted">
      {visibleScreens === totalScreens
        ? `${totalScreens} ${pluralise(totalScreens, 'screen', 'screens')}`
        : `${visibleScreens} of ${totalScreens} ${pluralise(totalScreens, 'screen', 'screens')}`}
    </footer>
  );
}

function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function mapToScreens(
  ids: readonly string[],
  index: Record<string, ScreenDefinition>,
): ScreenDefinition[] {
  const result: ScreenDefinition[] = [];
  for (const id of ids) {
    const screen = index[id];
    if (screen !== undefined) {
      result.push(screen);
    }
  }
  return result;
}
