import type { ScreenDefinition } from '@shared/types';

import { ScreenListItem } from './ScreenListItem';

/** Lowercase slug safe for HTML `id` / `aria-labelledby` (spaces and non-alphanumeric → hyphens). */
function sectionHeadingId(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\da-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = slug.length > 0 ? slug : 'untitled';
  return `section-${suffix}`;
}

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

  const headingId = sectionHeadingId(title);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1">
      <header className="flex items-center justify-between px-3 pt-2 pb-1">
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-text-muted"
          id={headingId}
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
