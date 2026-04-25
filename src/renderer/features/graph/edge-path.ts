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

export function getPathMidpoint(points: readonly FlowPoint[]): FlowPoint | null {
  if (points.length === 0) {
    return null;
  }
  if (points.length === 1) {
    return points[0];
  }

  const totalLength = getPathLength(points);
  if (totalLength === 0) {
    return points[0];
  }

  const midpointDistance = totalLength / 2;
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const segmentLength = distance(previous, current);
    if (travelled + segmentLength >= midpointDistance) {
      const ratio = (midpointDistance - travelled) / segmentLength;
      return {
        x: previous.x + (current.x - previous.x) * ratio,
        y: previous.y + (current.y - previous.y) * ratio,
      };
    }
    travelled += segmentLength;
  }

  return points[points.length - 1];
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

function getPathLength(points: readonly FlowPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index]);
  }
  return total;
}

function distance(a: FlowPoint, b: FlowPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
