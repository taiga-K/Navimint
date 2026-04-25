import type { FlowPoint } from './graph-types';

const DEFAULT_CORNER_RADIUS = 12;

export function buildRoundedPolylinePath(
  points: readonly FlowPoint[],
  radius = DEFAULT_CORNER_RADIUS,
): string | null {
  if (points.length < 2) {
    return null;
  }
  if (points.length === 2) {
    const [start, end] = points;
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const [start, ...rest] = points;
  const commands = [`M ${start.x} ${start.y}`];

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const before = moveToward(current, previous, radius);
    const after = moveToward(current, next, radius);
    commands.push(`L ${before.x} ${before.y}`);
    commands.push(`Q ${current.x} ${current.y} ${after.x} ${after.y}`);
  }

  const end = rest[rest.length - 1];
  commands.push(`L ${end.x} ${end.y}`);
  return commands.join(' ');
}

function moveToward(from: FlowPoint, to: FlowPoint, maxDistance: number): FlowPoint {
  const segmentLength = distance(from, to);
  if (segmentLength === 0) {
    return from;
  }
  const distanceToMove = Math.min(maxDistance, segmentLength / 2);
  const ratio = distanceToMove / segmentLength;
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function distance(a: FlowPoint, b: FlowPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
