import { selectSelectedScreen } from '../workspace/selectors';
import { useWorkspace } from '../workspace/use-workspace';

export function GraphPlaceholder() {
  const { state } = useWorkspace();
  const selectedScreen = selectSelectedScreen(state.document, state.selectedScreenId);

  return (
    <div className="flex h-full items-center justify-center px-6 text-sm text-text-muted">
      {selectedScreen === null ? (
        <span>Graph canvas placeholder. Select a screen to highlight it here.</span>
      ) : (
        <span>
          Selected screen:{' '}
          <span className="font-medium text-text-primary">{selectedScreen.name}</span>
        </span>
      )}
    </div>
  );
}
