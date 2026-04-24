import type {
  ScreenDefinition,
  WorkspaceLoadFailure,
  WorkspaceLoadState,
} from '@shared/types';
import { type ReactNode, useCallback, useMemo } from 'react';

import { useOpenProjectFolder, useWorkspace } from '../../workspace/use-workspace';
import { ScreenSection } from './ScreenSection';
import { ScreensSearchInput } from './ScreensSearchInput';

const ROUTES_SECTION = 'Routes';
const ORPHAN_SECTION = 'Orphan';

export function ScreensSidebar() {
  const { state, derived, dispatch } = useWorkspace();
  const openProjectFolder = useOpenProjectFolder();

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
      <SidebarHeader projectRoot={state.projectRoot} onOpenFolder={openProjectFolder}>
        <ScreensSearchInput onChange={handleSearchChange} value={state.searchQuery} />
      </SidebarHeader>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <SidebarBody
          connectedScreens={connectedScreens}
          loadFailure={state.loadFailure}
          loadState={state.loadState}
          onOpenFolder={openProjectFolder}
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

interface SidebarHeaderProps {
  children: ReactNode;
  projectRoot: string | null;
  onOpenFolder: () => void;
}

function SidebarHeader({ children, projectRoot, onOpenFolder }: SidebarHeaderProps) {
  return (
    <header className="flex flex-col gap-2 border-b border-border-strong px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold uppercase tracking-wider text-text-muted">
          Screens
        </span>
        <button
          aria-label="Open project folder"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-elevated text-text-secondary transition-colors duration-[120ms] hover:border-accent-primary hover:text-text-primary focus:outline-none focus-visible:shadow-focus"
          onClick={onOpenFolder}
          title="Open Folder (⌘O)"
          type="button"
        >
          <FolderOpenIcon />
        </button>
      </div>
      {projectRoot === null ? null : (
        <code className="truncate font-mono text-xs text-text-muted" title={projectRoot}>
          {projectRoot}
        </code>
      )}
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
  loadFailure: WorkspaceLoadFailure | null;
  onOpenFolder: () => void;
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
  loadFailure,
  onOpenFolder,
  onSelect,
}: SidebarBodyProps) {
  if (loadState === 'loading' || loadState === 'idle') {
    return <p className="px-3 py-6 text-sm text-text-muted">Loading screens...</p>;
  }

  if (loadState === 'error') {
    return <ErrorState failure={loadFailure} onOpenFolder={onOpenFolder} />;
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

interface ErrorStateProps {
  failure: WorkspaceLoadFailure | null;
  onOpenFolder: () => void;
}

function ErrorState({ failure, onOpenFolder }: ErrorStateProps) {
  const reason = failure?.reason;
  const isMissingProject = reason === 'no-project-root';
  const isMissingFile = reason === 'file-not-found';
  const tone = isMissingProject || isMissingFile ? 'text-text-muted' : 'text-accent-danger';

  return (
    <div className="flex flex-col gap-3 px-3 py-6">
      <p className={`text-sm ${tone}`}>{describeFailure(failure)}</p>
      {isMissingProject || isMissingFile ? (
        <button
          className="self-start cursor-pointer rounded-md border border-border-strong bg-elevated px-3 py-1.5 text-xs text-text-secondary transition-colors duration-[120ms] hover:border-accent-primary hover:text-text-primary focus:outline-none focus-visible:shadow-focus"
          onClick={onOpenFolder}
          type="button"
        >
          Open Folder...
        </button>
      ) : null}
    </div>
  );
}

function describeFailure(failure: WorkspaceLoadFailure | null): string {
  if (failure === null) {
    return 'Failed to load screens.json.';
  }
  switch (failure.reason) {
    case 'no-project-root':
      return 'No project folder is open. Use File > Open Folder (⌘O) to choose one.';
    case 'file-not-found':
      return 'screens.json was not found in the selected project root.';
    case 'invalid-json':
      return 'screens.json is not valid JSON.';
    case 'invalid-shape':
      return `screens.json has an unexpected shape: ${failure.message}`;
    case 'unexpected-error':
      return `Failed to load screens.json: ${failure.message}`;
    default: {
      const exhaustiveCheck: never = failure.reason;
      return `Unknown error: ${String(exhaustiveCheck)}`;
    }
  }
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

function FolderOpenIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
      />
    </svg>
  );
}
