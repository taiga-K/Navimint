import type { ScreenDefinition, ScreenTransition } from '@shared/types';
import type { Edge, Node } from '@xyflow/react';

export const SCREEN_NODE_WIDTH = 196;
export const SCREEN_NODE_HEIGHT = 58;

export interface GraphTransition {
  id: string;
  from: string;
  to: string;
  trigger: string | undefined;
  condition: string | undefined;
}

export interface GraphScreenNode {
  id: string;
  screen: ScreenDefinition;
  isOrphan: boolean;
}

export interface GraphEdgeGroup {
  id: string;
  from: string;
  to: string;
  transitions: GraphTransition[];
  isSelfLoop: boolean;
}

export interface ScreenGraphModel {
  nodes: GraphScreenNode[];
  edgeGroups: GraphEdgeGroup[];
}

export interface FlowPoint {
  x: number;
  y: number;
}

export type EdgeRelation = 'incoming' | 'outgoing' | 'self' | 'unrelated';

export interface ScreenNodeData extends Record<string, unknown> {
  screen: ScreenDefinition;
  isOrphan: boolean;
  selected: boolean;
}

export interface TransitionEdgeData extends Record<string, unknown> {
  sourceScreenId: string;
  targetScreenId: string;
  transitions: GraphTransition[];
  isSelfLoop: boolean;
  routePoints: FlowPoint[];
  relation: EdgeRelation;
  highlighted: boolean;
  muted: boolean;
}

export type ScreenFlowNode = Node<ScreenNodeData> & { data: ScreenNodeData };
export type TransitionFlowEdge = Edge<TransitionEdgeData> & { data: TransitionEdgeData };

export interface LayoutedGraphElements {
  nodes: ScreenFlowNode[];
  edges: TransitionFlowEdge[];
}

export type TransitionInput = Pick<ScreenTransition, 'from' | 'to' | 'trigger' | 'condition'>;
