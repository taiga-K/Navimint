import type {
  EdgeRelation,
  LayoutedGraphElements,
  TransitionEdgeData,
} from './graph-types';

export function applyGraphSelection(
  elements: LayoutedGraphElements,
  selectedScreenId: string | null,
): LayoutedGraphElements {
  return {
    nodes: elements.nodes.map((node) => {
      const selected = selectedScreenId === node.id;
      return {
        ...node,
        selected,
        data: { ...node.data, selected },
      };
    }),
    edges: elements.edges.map((edge) => {
      const relation = getEdgeRelation(edge.data, selectedScreenId);
      const highlighted = relation !== 'unrelated';
      const muted = selectedScreenId !== null && relation === 'unrelated';
      return {
        ...edge,
        animated: highlighted,
        className: highlighted ? `transition-edge transition-edge--${relation}` : 'transition-edge',
        selected: highlighted,
        data: {
          ...edge.data,
          relation,
          highlighted,
          muted,
        },
      };
    }),
  };
}

export function getEdgeRelation(
  edge: Pick<TransitionEdgeData, 'sourceScreenId' | 'targetScreenId'>,
  selectedScreenId: string | null,
): EdgeRelation {
  if (selectedScreenId === null) {
    return 'unrelated';
  }
  const isSource = edge.sourceScreenId === selectedScreenId;
  const isTarget = edge.targetScreenId === selectedScreenId;
  if (isSource && isTarget) {
    return 'self';
  }
  if (isSource) {
    return 'outgoing';
  }
  if (isTarget) {
    return 'incoming';
  }
  return 'unrelated';
}
