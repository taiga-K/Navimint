import type { ScreenDefinition } from '@shared/types';

import { ScreenListItem } from './ScreenListItem';

export interface ScreenSectionProps {
  title: string;
  screens: readonly ScreenDefinition[];
  totalCount: number;
  emptyLabel: string;
  selectedScreenId: string | null;
  onSelect: (screenId: string) => void;
}

export function ScreenSection({
  title,
  screens,
  totalCount,
  emptyLabel,
  selectedScreenId,
  onSelect,
}: ScreenSectionProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <section aria-labelledby={`section-${title.toLowerCase()}`} className="flex flex-col gap-1">
      <header className="flex items-center justify-between px-3 pt-2 pb-1">
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-text-muted"
          id={`section-${title.toLowerCase()}`}
        >
          {title}
        </h3>
        <span className="font-mono text-xs text-text-muted">{totalCount}</span>
      </header>
      {screens.length === 0 ? (
        <p className="px-3 pb-2 text-xs text-text-muted">{emptyLabel}</p>
      ) : (
        <ul aria-label={`${title} screens`} className="flex flex-col" role="listbox">
          {screens.map((screen) => (
            <ScreenListItem
              key={screen.id}
              onSelect={onSelect}
              screen={screen}
              selected={selectedScreenId === screen.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
