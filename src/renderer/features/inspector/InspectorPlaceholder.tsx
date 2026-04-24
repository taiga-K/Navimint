import { selectSelectedScreen } from '../workspace/selectors';
import { useWorkspace } from '../workspace/use-workspace';

export function InspectorPlaceholder() {
  const { state, derived } = useWorkspace();
  const screen = selectSelectedScreen(derived.screenById, state.selectedScreenId);

  if (screen === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-text-secondary">No screen selected</p>
        <p className="text-xs text-text-muted">
          Pick a screen from the sidebar to inspect its details, transitions, and preview.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-4">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wider text-text-muted">Selected screen</p>
        <h2 className="text-lg font-semibold text-text-primary">{screen.name}</h2>
        <code className="font-mono text-xs text-text-muted">{screen.route}</code>
      </header>
      {screen.description === undefined ? null : (
        <p className="text-sm leading-relaxed text-text-secondary">{screen.description}</p>
      )}
      <p className="rounded-md border border-border-subtle bg-panel-muted px-3 py-2 text-xs text-text-muted">
        Inspector placeholder. Details, Transitions, and Preview will be implemented next.
      </p>
    </div>
  );
}
