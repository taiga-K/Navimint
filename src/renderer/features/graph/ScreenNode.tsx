import { Handle, type NodeProps, Position } from '@xyflow/react';

import { cn } from '../../lib/cn';
import { screenFlowHandleIds } from './elk-layout';
import type { ScreenFlowNode } from './graph-types';

export function ScreenNode({ data }: NodeProps<ScreenFlowNode>) {
  return (
    <div
      className={cn(
        'group relative flex h-[58px] w-[196px] items-center gap-3 overflow-hidden rounded-md border bg-panel px-3 shadow-soft',
        'transition-colors duration-[160ms]',
        data.isOrphan ? 'border-dashed border-border-strong' : 'border-border-strong',
        data.selected
          ? 'border-accent-primary bg-selected shadow-focus'
          : 'hover:border-accent-primary/80 hover:bg-elevated',
      )}
    >
      <Handle
        className="opacity-0"
        id={screenFlowHandleIds.target}
        isConnectable={false}
        position={Position.Top}
        type="target"
      />
      <span
        aria-hidden="true"
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: data.screen.color ?? 'var(--color-accent-node)' }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-text-primary">
          {data.screen.name}
        </span>
        <code className="truncate font-mono text-xs text-text-muted">
          {data.screen.route}
        </code>
      </div>
      {data.isOrphan ? (
        <span className="shrink-0 rounded-sm border border-border-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Orphan
        </span>
      ) : null}
      <Handle
        className="opacity-0"
        id={screenFlowHandleIds.source}
        isConnectable={false}
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
