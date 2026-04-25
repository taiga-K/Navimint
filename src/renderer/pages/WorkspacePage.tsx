import { WorkspaceLayout } from '../components/layout/WorkspaceLayout';
import { ScreenFlowGraph } from '../features/graph/ScreenFlowGraph';
import { InspectorPlaceholder } from '../features/inspector/InspectorPlaceholder';
import { ScreensSidebar } from '../features/sidebar/components/ScreensSidebar';
import { selectSelectedScreen } from '../features/workspace/selectors';
import { useWorkspace, useWorkspaceSync } from '../features/workspace/use-workspace';

export function WorkspacePage() {
  useWorkspaceSync();

  return (
    <WorkspaceLayout
      graph={<ScreenFlowGraph />}
      inspector={<InspectorPlaceholder />}
      sidebar={<ScreensSidebar />}
      status={<StatusBar />}
    />
  );
}

function StatusBar() {
  const { state, derived } = useWorkspace();
  const total = state.document?.screens.length ?? 0;
  const orphans = derived.orphanScreenIds.length;
  const selectedScreen = selectSelectedScreen(derived.screenById, state.selectedScreenId);
  const projectLabel = state.document?.project.name ?? state.projectRoot;

  if (state.loadState === 'loading' || state.loadState === 'idle') {
    return <span className="truncate">Loading screens.json...</span>;
  }
  if (state.loadState === 'error') {
    if (state.loadFailure?.reason === 'no-project-root') {
      return <span className="truncate">No project folder open. Use File &gt; Open Folder.</span>;
    }
    return <span className="truncate text-accent-danger">screens.json could not be loaded</span>;
  }
  if (total === 0) {
    return <span className="truncate">No screens defined</span>;
  }
  return (
    <span className="flex w-full items-center gap-3 truncate">
      {projectLabel === null ? null : (
        <>
          <span className="truncate text-text-primary">{projectLabel}</span>
          <span aria-hidden="true">·</span>
        </>
      )}
      <span>{total} screens</span>
      <span aria-hidden="true">·</span>
      <span>
        {orphans} {orphans === 1 ? 'orphan' : 'orphans'}
      </span>
      {selectedScreen === null ? null : (
        <>
          <span aria-hidden="true">·</span>
          <span className="truncate">
            Selected:&nbsp;
            <span className="text-text-primary">{selectedScreen.name}</span>
          </span>
        </>
      )}
    </span>
  );
}
