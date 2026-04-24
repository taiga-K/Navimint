import type { ScreenDefinition } from '@shared/types';
import type { KeyboardEvent } from 'react';

import { cn } from '../../../lib/cn';

export interface ScreenListItemProps {
  screen: ScreenDefinition;
  selected: boolean;
  onSelect: (screenId: string) => void;
}

export function ScreenListItem({ screen, selected, onSelect }: ScreenListItemProps) {
  const handleClick = () => {
    onSelect(screen.id);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    onSelect(screen.id);
  };

  return (
    <li
      aria-selected={selected}
      className={cn(
        'group flex h-9 cursor-pointer items-center gap-2 border-l-2 px-3 text-sm',
        'transition-colors duration-[120ms]',
        selected
          ? 'border-accent-primary bg-selected text-text-primary'
          : 'border-transparent text-text-secondary hover:bg-elevated',
        'focus:outline-none focus-visible:bg-elevated focus-visible:text-text-primary',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      tabIndex={selected ? 0 : -1}
    >
      <ColorChip color={screen.color} />
      <span className="min-w-0 flex-1 truncate font-medium">{screen.name}</span>
      <code
        className={cn(
          'shrink-0 font-mono text-xs',
          selected ? 'text-accent-primary' : 'text-text-muted',
        )}
      >
        {screen.route}
      </code>
    </li>
  );
}

function ColorChip({ color }: { color: string | undefined }) {
  const fallback = 'var(--color-text-muted)';
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? fallback }}
    />
  );
}
