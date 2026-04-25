import type { ScreenDefinition } from '@shared/types';

import { selectSelectedScreen } from '../workspace/selectors';
import { useWorkspace } from '../workspace/use-workspace';
import { ColorChip, DetailBlock, InspectorSection } from './InspectorSection';
import { PreviewSection } from './PreviewSection';
import { TransitionsSection } from './TransitionsSection';

export function InspectorPlaceholder() {
  const { state, derived, dispatch } = useWorkspace();
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

  const baseUrl = state.previewBaseUrl ?? state.document?.project.baseURL ?? '';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ScreenHeader screen={screen} />
      <DetailsSection screen={screen} />
      <TransitionsSection
        inboundTransitions={derived.inboundByScreenId[screen.id] ?? []}
        outboundTransitions={derived.outboundByScreenId[screen.id] ?? []}
        screenById={derived.screenById}
      />
      <PreviewSection
        baseUrl={baseUrl}
        onBaseUrlSaved={(nextBaseUrl) => {
          dispatch({ type: 'preview-base-url-updated', baseUrl: nextBaseUrl });
        }}
        route={screen.route}
        screenName={screen.name}
      />
    </div>
  );
}

function ScreenHeader({ screen }: { screen: ScreenDefinition }) {
  return (
    <header className="border-b border-border-strong px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Selected screen
      </p>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <ColorChip color={screen.color} />
        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-text-primary">
          {screen.name}
        </h2>
      </div>
    </header>
  );
}

function DetailsSection({ screen }: { screen: ScreenDefinition }) {
  return (
    <InspectorSection className="shrink-0" title="Details">
      <DetailBlock label="Name" value={screen.name} />
      <DetailBlock label="Route" mono value={screen.route} />
      <DetailBlock
        label="Description"
        muted={screen.description === undefined}
        value={screen.description ?? 'No description'}
        valueClassName="max-h-24 overflow-y-auto pr-1"
      />
    </InspectorSection>
  );
}
