import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface InspectorSectionProps {
  title: string;
  count?: number;
  className?: string;
  children: ReactNode;
}

export function InspectorSection({
  title,
  count,
  className,
  children,
}: InspectorSectionProps) {
  return (
    <section className={cn('flex flex-col gap-3 border-b border-border-strong px-4 py-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
        {count === undefined ? null : (
          <span className="font-mono text-xs text-text-muted">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

interface DetailBlockProps {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
  valueClassName?: string;
}

export function DetailBlock({
  label,
  value,
  mono = false,
  muted = false,
  valueClassName,
}: DetailBlockProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span
        className={cn(
          'text-sm leading-relaxed',
          mono && 'font-mono text-xs',
          muted ? 'text-text-muted' : 'text-text-secondary',
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ColorChip({ color }: { color: string | undefined }) {
  const fallback = 'var(--color-text-muted)';
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? fallback }}
    />
  );
}
