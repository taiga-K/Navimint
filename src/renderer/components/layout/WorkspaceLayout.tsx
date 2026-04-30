import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { useWorkspaceColumnWidths } from './use-workspace-column-widths';

export interface WorkspaceLayoutProps {
  sidebar: ReactNode;
  graph: ReactNode;
  inspector: ReactNode;
  status?: ReactNode;
  className?: string;
}

const PANEL_CONTAINER =
  'flex h-full min-h-0 flex-col overflow-hidden border-border-strong bg-panel';

const GUTTER_BASE =
  'w-1.5 shrink-0 cursor-col-resize touch-none select-none border-l border-border-strong bg-app hover:bg-selected/50';

function gutterClass(active: boolean): string {
  return cn(GUTTER_BASE, active && 'border-accent-primary bg-selected');
}

export function WorkspaceLayout({
  sidebar,
  graph,
  inspector,
  status,
  className,
}: WorkspaceLayoutProps) {
  const {
    mainRef,
    leftWidthPx,
    rightWidthPx,
    onLeftGutterPointerDown,
    onRightGutterPointerDown,
    activeResize,
  } = useWorkspaceColumnWidths();

  return (
    <div className={cn('flex h-full w-full flex-col bg-app text-text-primary', className)}>
      <main ref={mainRef} className="flex min-h-0 min-w-0 flex-1">
        <aside
          aria-label="Screens sidebar"
          className={cn(PANEL_CONTAINER, 'shrink-0')}
          style={{ width: leftWidthPx, flex: '0 0 auto' }}
        >
          {sidebar}
        </aside>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left column"
          onPointerDown={onLeftGutterPointerDown}
          className={gutterClass(activeResize === 'left')}
        />
        <section
          aria-label="Screen flow graph"
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-app"
        >
          {graph}
        </section>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize right column"
          onPointerDown={onRightGutterPointerDown}
          className={gutterClass(activeResize === 'right')}
        />
        <aside
          aria-label="Screen inspector"
          className={cn(PANEL_CONTAINER, 'shrink-0')}
          style={{ width: rightWidthPx, flex: '0 0 auto' }}
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
