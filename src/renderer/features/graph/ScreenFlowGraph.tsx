import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  type EdgeTypes,
  type NodeChange,
  type NodeMouseHandler,
  type NodeTypes,
  type OnNodeDrag,
  type OnNodesChange,
  ReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '../../lib/cn';
import { useWorkspace } from '../workspace/use-workspace';
import { layoutScreenGraph } from './elk-layout';
import { buildScreenGraphModel } from './graph-model';
import { applyGraphSelection } from './graph-selection';
import type { LayoutedGraphElements, ScreenFlowNode } from './graph-types';
import {
  applyManualLayoutPositions,
  clearManualLayoutPositions,
  createEmptyPositions,
  hasManualLayoutPositions,
  readManualLayoutPositions,
  upsertManualLayoutPositions,
  writeManualLayoutPositions,
} from './manual-layout';
import { ScreenNode } from './ScreenNode';
import { TransitionEdge } from './TransitionEdge';

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
};

const edgeTypes: EdgeTypes = {
  transition: TransitionEdge,
};

type GraphLayoutState =
  | { status: 'idle'; elements: null; error: null }
  | { status: 'layouting'; elements: LayoutedGraphElements | null; error: null }
  | { status: 'ready'; elements: LayoutedGraphElements; error: null }
  | { status: 'error'; elements: null; error: string };

const INITIAL_LAYOUT_STATE: GraphLayoutState = {
  status: 'idle',
  elements: null,
  error: null,
};

export function ScreenFlowGraph() {
  const { state, dispatch } = useWorkspace();
  const layoutSeqRef = useRef(0);
  const [layoutState, setLayoutState] = useState<GraphLayoutState>(INITIAL_LAYOUT_STATE);
  const [manualPositions, setManualPositions] = useState(createEmptyPositions);
  const [flowElements, setFlowElements] = useState<LayoutedGraphElements | null>(null);

  const model = useMemo(() => {
    if (state.document === null) {
      return null;
    }
    return buildScreenGraphModel(state.document.screens, state.document.transitions);
  }, [state.document]);

  const layoutStorageScope = useMemo(() => {
    if (state.document === null) {
      return null;
    }
    return state.projectRoot ?? state.document.project.name;
  }, [state.document, state.projectRoot]);

  useEffect(() => {
    setManualPositions(readManualLayoutPositions(layoutStorageScope, getLocalStorage()));
  }, [layoutStorageScope]);

  useEffect(() => {
    if (model === null) {
      layoutSeqRef.current += 1;
      setLayoutState(INITIAL_LAYOUT_STATE);
      return;
    }

    const seq = layoutSeqRef.current + 1;
    layoutSeqRef.current = seq;
    const graphModel = model;
    setLayoutState((current) => ({
      status: 'layouting',
      elements: current.elements,
      error: null,
    }));

    async function runLayout(): Promise<void> {
      try {
        const elements = await layoutScreenGraph(graphModel);
        if (layoutSeqRef.current !== seq) {
          return;
        }
        setLayoutState({ status: 'ready', elements, error: null });
      } catch (error) {
        if (layoutSeqRef.current !== seq) {
          return;
        }
        setLayoutState({
          status: 'error',
          elements: null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    void runLayout();
  }, [model]);

  const selectedElements = useMemo(() => {
    if (layoutState.elements === null) {
      return null;
    }
    const positionedElements = applyManualLayoutPositions(layoutState.elements, manualPositions);
    return applyGraphSelection(positionedElements, state.selectedScreenId);
  }, [layoutState.elements, manualPositions, state.selectedScreenId]);

  useEffect(() => {
    setFlowElements(selectedElements);
  }, [selectedElements]);

  const renderedElements = flowElements ?? selectedElements;
  const hasManualLayout = hasManualLayoutPositions(manualPositions);

  const handleNodeClick = useCallback<NodeMouseHandler<ScreenFlowNode>>(
    (_event, node) => {
      dispatch({ type: 'screen-selected', screenId: node.id });
    },
    [dispatch],
  );

  const handlePaneClick = useCallback(() => {
    dispatch({ type: 'screen-selected', screenId: null });
  }, [dispatch]);

  const handleNodesChange = useCallback<OnNodesChange<ScreenFlowNode>>((changes) => {
    setFlowElements((current) => {
      const sourceElements = current ?? selectedElements;
      if (sourceElements === null) {
        return current;
      }
      return applyDragChanges(sourceElements, changes);
    });
  }, [selectedElements]);

  const handleNodeDragStop = useCallback<OnNodeDrag<ScreenFlowNode>>(
    (_event, node, nodes) => {
      const movedNodes = nodes.length > 0 ? nodes : [node];
      setManualPositions((current) => {
        const next = upsertManualLayoutPositions(current, movedNodes);
        writeManualLayoutPositions(layoutStorageScope, getLocalStorage(), next);
        return next;
      });
    },
    [layoutStorageScope],
  );

  const handleAutoLayout = useCallback(() => {
    clearManualLayoutPositions(layoutStorageScope, getLocalStorage());
    setManualPositions(createEmptyPositions());
  }, [layoutStorageScope]);

  if (state.loadState === 'idle' || state.loadState === 'loading') {
    return <GraphMessage title="Loading screens..." />;
  }
  if (state.loadState === 'error') {
    return (
      <GraphMessage
        tone="danger"
        title="Graph unavailable"
        message="screens.json could not be loaded."
      />
    );
  }
  if (state.document === null || state.document.screens.length === 0) {
    return (
      <GraphMessage
        title="No screens to graph"
        message="Open a project with screens.json data to inspect screen transitions."
      />
    );
  }
  if (layoutState.status === 'error') {
    return (
      <GraphMessage
        tone="danger"
        title="Graph layout failed"
        message={layoutState.error}
      />
    );
  }
  if (renderedElements === null) {
    return <GraphMessage title="Preparing graph..." />;
  }

  return (
    <div className="relative h-full min-h-0 w-full bg-app">
      <ReactFlow
        colorMode="dark"
        edgeTypes={edgeTypes}
        edges={renderedElements.edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        maxZoom={1.6}
        minZoom={0.2}
        nodes={renderedElements.nodes}
        nodesConnectable={false}
        nodesDraggable
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onNodesChange={handleNodesChange}
        onPaneClick={handlePaneClick}
        onlyRenderVisibleElements
        panOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--color-border-subtle)"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
      <GraphSummary
        edgeCount={renderedElements.edges.length}
        isLayouting={layoutState.status === 'layouting'}
        screenCount={renderedElements.nodes.length}
      />
      <GraphActions
        disabled={!hasManualLayout}
        onAutoLayout={handleAutoLayout}
      />
    </div>
  );
}

interface GraphSummaryProps {
  screenCount: number;
  edgeCount: number;
  isLayouting: boolean;
}

function GraphSummary({
  edgeCount,
  isLayouting,
  screenCount,
}: GraphSummaryProps) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border-subtle bg-panel/95 px-3 py-2 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="font-semibold uppercase tracking-wider text-text-secondary">
          Screen Flow
        </span>
        <span aria-hidden="true">·</span>
        <span>{screenCount} screens</span>
        <span aria-hidden="true">·</span>
        <span>{edgeCount} routes</span>
        {isLayouting ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Updating layout...</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface GraphActionsProps {
  disabled: boolean;
  onAutoLayout: () => void;
}

function GraphActions({ disabled, onAutoLayout }: GraphActionsProps) {
  return (
    <div className="absolute right-3 top-3">
      <button
        className="cursor-pointer rounded-md border border-border-strong bg-panel px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-soft transition-colors duration-[160ms] hover:border-accent-primary hover:bg-elevated hover:text-text-primary focus:outline-none focus-visible:shadow-focus disabled:cursor-default disabled:opacity-45 disabled:hover:border-border-strong disabled:hover:bg-panel disabled:hover:text-text-secondary"
        disabled={disabled}
        onClick={onAutoLayout}
        type="button"
      >
        Auto layout
      </button>
    </div>
  );
}

function applyDragChanges(
  elements: LayoutedGraphElements,
  changes: NodeChange<ScreenFlowNode>[],
): LayoutedGraphElements {
  const movedNodeIds = collectMovedNodeIds(changes);
  return {
    nodes: applyNodeChanges(changes, elements.nodes),
    edges:
      movedNodeIds.size === 0
        ? elements.edges
        : elements.edges.map((edge) => clearRouteForMovedNodeEdge(edge, movedNodeIds)),
  };
}

function collectMovedNodeIds(changes: NodeChange<ScreenFlowNode>[]): Set<string> {
  const ids = new Set<string>();
  for (const change of changes) {
    if (change.type === 'position' && change.position !== undefined) {
      ids.add(change.id);
    }
  }
  return ids;
}

function clearRouteForMovedNodeEdge(
  edge: LayoutedGraphElements['edges'][number],
  movedNodeIds: Set<string>,
): LayoutedGraphElements['edges'][number] {
  if (!movedNodeIds.has(edge.source) && !movedNodeIds.has(edge.target)) {
    return edge;
  }
  return {
    ...edge,
    data: {
      ...edge.data,
      routePoints: [],
    },
  };
}

interface GraphMessageProps {
  title: string;
  message?: string;
  tone?: 'neutral' | 'danger';
}

function GraphMessage({ title, message, tone = 'neutral' }: GraphMessageProps) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-sm rounded-lg border border-border-subtle bg-panel px-4 py-3 text-center shadow-soft">
        <p
          className={cn(
            'text-sm font-semibold',
            tone === 'danger' ? 'text-accent-danger' : 'text-text-primary',
          )}
        >
          {title}
        </p>
        {message === undefined ? null : (
          <p className="mt-1 text-xs text-text-muted">{message}</p>
        )}
      </div>
    </div>
  );
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
