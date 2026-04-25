import { type ReactNode, useState } from 'react';

import { cn } from '../../lib/cn';

interface InspectorSectionProps {
  title: string;
  count?: number;
  className?: string;
  collapsedClassName?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function InspectorSection({
  title,
  count,
  className,
  collapsedClassName,
  collapsible = false,
  defaultOpen = true,
  children,
}: InspectorSectionProps) {
  if (!collapsible) {
    return (
      <SectionFrame className={className}>
        <SectionHeader count={count} title={title} />
        {children}
      </SectionFrame>
    );
  }

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionClassName = isOpen ? className : (collapsedClassName ?? 'shrink-0');

  return (
    <SectionFrame className={sectionClassName}>
      <div className="flex items-center justify-between gap-3">
        <button
          aria-expanded={isOpen}
          className="flex min-w-0 cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted transition-colors duration-[120ms] hover:text-text-secondary focus:outline-none focus-visible:shadow-focus"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <ChevronIcon open={isOpen} />
          <span className="truncate">{title}</span>
        </button>
        {count === undefined ? null : (
          <span className="font-mono text-xs text-text-muted">{count}</span>
        )}
      </div>
      {isOpen ? children : null}
    </SectionFrame>
  );
}

function SectionFrame({ className, children }: { className: string | undefined; children: ReactNode }) {
  return (
    <section className={cn('flex flex-col gap-3 border-b border-border-strong px-4 py-4', className)}>
      {children}
    </section>
  );
}

function SectionHeader({ title, count }: { title: string; count: number | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      {count === undefined ? null : (
        <span className="font-mono text-xs text-text-muted">{count}</span>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('size-3 shrink-0 transition-transform duration-[120ms]', open && 'rotate-90')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 16 16"
    >
      <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
