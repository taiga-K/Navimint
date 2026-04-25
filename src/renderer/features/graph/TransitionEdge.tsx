import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';

import { buildRoundedPolylinePath } from './edge-path';
import type { TransitionFlowEdge } from './graph-types';

export function TransitionEdge({
  data,
  id,
  markerEnd,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<TransitionFlowEdge>) {
  const fallbackPath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });
  const routePath = buildRoundedPolylinePath(data.routePoints);
  const path = routePath ?? fallbackPath[0];
  const stroke = getStrokeColor(data);
  const strokeWidth = data.highlighted ? 2.25 : 1.5;

  return (
    <BaseEdge
      id={id}
      markerEnd={markerEnd}
      path={path}
      style={{
        stroke,
        strokeOpacity: data.muted ? 0.22 : 0.82,
        strokeWidth,
      }}
    />
  );
}

function getStrokeColor(data: TransitionFlowEdge['data']): string {
  if (data.highlighted) {
    return 'var(--color-accent-primary)';
  }
  if (data.isSelfLoop) {
    return 'var(--color-accent-warning)';
  }
  return 'var(--color-border-strong)';
}
