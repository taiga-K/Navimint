import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface WorkspaceLayoutProps {
  sidebar: ReactNode;
  graph: ReactNode;
  inspector: ReactNode;
  status?: ReactNode;
  className?: string;
}

const PANEL_CONTAINER =
  'flex h-full min-h-0 flex-col overflow-hidden border-border-strong bg-panel';

export function WorkspaceLayout({
  sidebar,
  graph,
  inspector,
  status,
  className,
}: WorkspaceLayoutProps) {
  return (
    <div className={cn('flex h-dvh w-dvw flex-col bg-app text-text-primary', className)}>
      <main className="flex min-h-0 flex-1">
        <aside
          aria-label="Screens sidebar"
          className={cn(PANEL_CONTAINER, 'w-[272px] shrink-0 border-r')}
        >
          {sidebar}
        </aside>
        <section
          aria-label="Screen flow graph"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-app"
        >
          {graph}
        </section>
        <aside
          aria-label="Screen inspector"
          className={cn(PANEL_CONTAINER, 'w-[360px] shrink-0 border-l')}
        >
          {inspector}
        </aside>
      </main>
      {status === undefined ? null : (
        <footer className="flex h-6 shrink-0 items-center border-t border-border-strong bg-panel-muted px-3 text-xs text-text-muted">
          {status}
        </footer>
      )}
    </div>
  );
}
