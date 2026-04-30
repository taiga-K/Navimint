import type { ChangeEvent } from 'react';

import { cn } from '../../../lib/cn';

export interface ScreensSearchInputProps {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}

export function ScreensSearchInput({ value, onChange, className }: ScreensSearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  const handleClear = () => {
    if (value.length === 0) {
      return;
    }
    onChange('');
  };

  return (
    <div
      className={cn(
        'group relative flex h-9 items-center gap-2 rounded-md border border-border-strong bg-elevated px-3',
        'focus-within:border-accent-primary focus-within:shadow-focus',
        'transition-colors duration-[120ms]',
        className,
      )}
    >
      <SearchIcon />
      <input
        aria-label="Search screens"
        className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        onChange={handleChange}
        placeholder="Search by name, route, or description"
        type="search"
        value={value}
      />
      {value.length > 0 ? (
        <button
          aria-label="Clear search"
          className={cn(
            'cursor-pointer rounded-sm text-text-muted transition-colors duration-[120ms]',
            'hover:text-text-primary focus-visible:text-text-primary focus:outline-none',
          )}
          onClick={handleClear}
          type="button"
        >
          <ClearIcon />
        </button>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
