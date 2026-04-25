import type { ScreenDefinition, ScreenTransition } from '@shared/types';

import { InspectorSection } from './InspectorSection';

interface TransitionsSectionProps {
  inboundTransitions: readonly ScreenTransition[];
  outboundTransitions: readonly ScreenTransition[];
  screenById: Record<string, ScreenDefinition>;
}

export function TransitionsSection({
  inboundTransitions,
  outboundTransitions,
  screenById,
}: TransitionsSectionProps) {
  const total = inboundTransitions.length + outboundTransitions.length;

  return (
    <InspectorSection count={total} title="Transitions">
      <TransitionGroup
        direction="inbound"
        screenById={screenById}
        title="Inbound transitions"
        transitions={inboundTransitions}
      />
      <TransitionGroup
        direction="outbound"
        screenById={screenById}
        title="Outbound transitions"
        transitions={outboundTransitions}
      />
    </InspectorSection>
  );
}

interface TransitionGroupProps {
  title: string;
  direction: 'inbound' | 'outbound';
  transitions: readonly ScreenTransition[];
  screenById: Record<string, ScreenDefinition>;
}

function TransitionGroup({ title, direction, transitions, screenById }: TransitionGroupProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <span className="font-mono text-sm text-text-secondary">{transitions.length}</span>
      </div>
      {transitions.length === 0 ? (
        <p className="text-xs text-text-muted">No transitions</p>
      ) : (
        <ul className="flex flex-col border-t border-border-subtle" role="list">
          {transitions.map((transition, index) => (
            <TransitionRow
              direction={direction}
              key={`${transition.from}:${transition.to}:${index}`}
              screenById={screenById}
              transition={transition}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface TransitionRowProps {
  direction: 'inbound' | 'outbound';
  transition: ScreenTransition;
  screenById: Record<string, ScreenDefinition>;
}

function TransitionRow({ direction, transition, screenById }: TransitionRowProps) {
  const relatedScreenId = direction === 'inbound' ? transition.from : transition.to;
  const relatedScreen = screenById[relatedScreenId];
  const route = relatedScreen?.route ?? relatedScreenId;
  const name = relatedScreen?.name ?? relatedScreenId;

  return (
    <li className="flex flex-col gap-1 border-b border-border-subtle py-2 last:border-b-0">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-text-secondary">{name}</span>
        <code className="shrink-0 truncate font-mono text-xs text-text-muted">{route}</code>
      </div>
      <p className="truncate text-xs text-text-muted">{formatTransitionLabel(transition)}</p>
    </li>
  );
}

function formatTransitionLabel(transition: ScreenTransition): string {
  const trigger = transition.trigger ?? 'No trigger';
  if (transition.condition === undefined) {
    return trigger;
  }
  return `${trigger} - ${transition.condition}`;
}
