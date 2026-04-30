import { MarkerType, Position } from '@xyflow/react';
import ELK, {
  type ElkExtendedEdge,
  type ElkNode,
  type ElkPort,
  type LayoutOptions,
} from 'elkjs/lib/elk.bundled.js';

import type {
  FlowPoint,
  GraphScreenNode,
  LayoutedGraphElements,
  ScreenFlowNode,
  ScreenGraphModel,
} from './graph-types';
import {
  SCREEN_NODE_HEIGHT,
  SCREEN_NODE_WIDTH,
} from './graph-types';

const elk = new ELK();

const ROOT_ID = 'screen-flow-root';
const SOURCE_HANDLE_ID = 'source';
const TARGET_HANDLE_ID = 'target';
const SOURCE_PORT_SUFFIX = 'source';
const TARGET_PORT_SUFFIX = 'target';
const PORT_SIZE = 8;
const ORPHAN_LANE_GAP = 160;
const ORPHAN_VERTICAL_GAP = 24;
const FALLBACK_ORIGIN = 48;

const ELK_LAYOUT_OPTIONS: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.padding': '[top=48,left=48,bottom=48,right=48]',
  'elk.spacing.nodeNode': '72',
  'elk.layered.spacing.nodeNodeBetweenLayers': '112',
  'elk.layered.spacing.edgeNodeBetweenLayers': '48',
  'elk.layered.spacing.edgeEdgeBetweenLayers': '24',
  'elk.layered.cycleBreaking.strategy': 'GREEDY',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
};

export async function layoutScreenGraph(
  model: ScreenGraphModel,
): Promise<LayoutedGraphElements> {
  if (model.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const graph = toElkGraph(model);
  const layoutedGraph = await elk.layout(graph);
  return toFlowElements(model, layoutedGraph);
}

function toElkGraph(model: ScreenGraphModel): ElkNode {
  return {
    id: ROOT_ID,
    layoutOptions: ELK_LAYOUT_OPTIONS,
    children: model.nodes.map(toElkNode),
    edges: model.edgeGroups.map<ElkExtendedEdge>((group) => ({
      id: group.id,
      sources: [sourcePortId(group.from)],
      targets: [targetPortId(group.to)],
    })),
  };
}

function toElkNode(node: GraphScreenNode): ElkNode {
  return {
    id: node.id,
    width: SCREEN_NODE_WIDTH,
    height: SCREEN_NODE_HEIGHT,
    layoutOptions: {
      'elk.portConstraints': 'FIXED_SIDE',
    },
    ports: [
      toElkPort(targetPortId(node.id), 'NORTH'),
      toElkPort(sourcePortId(node.id), 'SOUTH'),
    ],
  };
}

function toElkPort(id: string, side: 'NORTH' | 'SOUTH'): ElkPort {
  return {
    id,
    width: PORT_SIZE,
    height: PORT_SIZE,
    layoutOptions: {
      'elk.port.side': side,
    },
  };
}

function toFlowElements(
  model: ScreenGraphModel,
  layoutedGraph: ElkNode,
): LayoutedGraphElements {
  const positionByNodeId = buildPositionByNodeId(layoutedGraph);
  const edgeRoutesById = buildEdgeRoutesById(layoutedGraph);
  const nodePositions = positionOrphanNodes(model.nodes, positionByNodeId);

  return {
    nodes: model.nodes.map((node) => toFlowNode(node, nodePositions.get(node.id))),
    edges: model.edgeGroups.map((group) => ({
      id: group.id,
      type: 'transition',
      source: group.from,
      target: group.to,
      sourceHandle: SOURCE_HANDLE_ID,
      targetHandle: TARGET_HANDLE_ID,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
      },
      data: {
        sourceScreenId: group.from,
        targetScreenId: group.to,
        transitions: group.transitions,
        isSelfLoop: group.isSelfLoop,
        routePoints: edgeRoutesById.get(group.id) ?? [],
        relation: 'unrelated',
        highlighted: false,
        muted: false,
      },
    })),
  };
}

function toFlowNode(
  node: GraphScreenNode,
  point: FlowPoint | undefined,
): ScreenFlowNode {
  return {
    id: node.id,
    type: 'screen',
    position: point ?? { x: FALLBACK_ORIGIN, y: FALLBACK_ORIGIN },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: {
      screen: node.screen,
      isOrphan: node.isOrphan,
      selected: false,
    },
  };
}

function buildPositionByNodeId(layoutedGraph: ElkNode): Map<string, FlowPoint> {
  const result = new Map<string, FlowPoint>();
  for (const node of layoutedGraph.children ?? []) {
    result.set(node.id, {
      x: node.x ?? FALLBACK_ORIGIN,
      y: node.y ?? FALLBACK_ORIGIN,
    });
  }
  return result;
}

function buildEdgeRoutesById(layoutedGraph: ElkNode): Map<string, FlowPoint[]> {
  const result = new Map<string, FlowPoint[]>();
  for (const edge of layoutedGraph.edges ?? []) {
    const section = edge.sections?.[0];
    if (section === undefined) {
      continue;
    }
    result.set(edge.id, [
      section.startPoint,
      ...(section.bendPoints ?? []),
      section.endPoint,
    ]);
  }
  return result;
}

function positionOrphanNodes(
  nodes: readonly GraphScreenNode[],
  positions: Map<string, FlowPoint>,
): Map<string, FlowPoint> {
  const result = new Map(positions);
  const orphanNodes = nodes.filter((node) => node.isOrphan);
  if (orphanNodes.length === 0) {
    return result;
  }

  const connectedPositions = nodes
    .filter((node) => !node.isOrphan)
    .map((node) => result.get(node.id))
    .filter((point): point is FlowPoint => point !== undefined);
  const maxConnectedX =
    connectedPositions.length === 0
      ? FALLBACK_ORIGIN
      : Math.max(...connectedPositions.map((point) => point.x));
  const minConnectedY =
    connectedPositions.length === 0
      ? FALLBACK_ORIGIN
      : Math.min(...connectedPositions.map((point) => point.y));
  const orphanX = maxConnectedX + SCREEN_NODE_WIDTH + ORPHAN_LANE_GAP;

  orphanNodes.forEach((node, index) => {
    result.set(node.id, {
      x: orphanX,
      y: minConnectedY + index * (SCREEN_NODE_HEIGHT + ORPHAN_VERTICAL_GAP),
    });
  });

  return result;
}

function sourcePortId(screenId: string): string {
  return `${screenId}:${SOURCE_PORT_SUFFIX}`;
}

function targetPortId(screenId: string): string {
  return `${screenId}:${TARGET_PORT_SUFFIX}`;
}

export const screenFlowHandleIds = {
  source: SOURCE_HANDLE_ID,
  target: TARGET_HANDLE_ID,
} as const;
