import { WorkspaceLayout } from '../components/layout/WorkspaceLayout';
import { GraphPlaceholder } from '../features/graph/GraphPlaceholder';
import { InspectorPlaceholder } from '../features/inspector/InspectorPlaceholder';
import { ScreensSidebar } from '../features/sidebar/components/ScreensSidebar';
import { selectSelectedScreen } from '../features/workspace/selectors';
import { useLoadScreensOnMount, useWorkspace } from '../features/workspace/use-workspace';

export function WorkspacePage() {
  useLoadScreensOnMount();

  return (
    <WorkspaceLayout
      graph={<GraphPlaceholder />}
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
  const selectedScreen = selectSelectedScreen(state.document, state.selectedScreenId);

  if (state.loadState === 'loading' || state.loadState === 'idle') {
    return <span>Loading screens.json...</span>;
  }
  if (state.loadState === 'error') {
    return <span className="text-accent-danger">screens.json could not be loaded</span>;
  }
  if (total === 0) {
    return <span>No screens defined</span>;
  }
  return (
    <span className="flex w-full items-center gap-3 truncate">
      <span>{total} screens</span>
      <span aria-hidden="true">·</span>
      <span>{orphans} orphan</span>
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
