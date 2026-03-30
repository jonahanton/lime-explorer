import { ARC_CURVATURE, ARC_STEPS } from '../constants/animation.js';

/**
 * Computes a control point for a quadratic bezier arc between two coordinates.
 * The control point is offset perpendicular to the midpoint.
 */
function getControlPoint(start, end, curvature = ARC_CURVATURE) {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;

  const dLat = end[0] - start[0];
  const dLng = end[1] - start[1];
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);

  // Perpendicular offset, scaled by distance and curvature
  const offset = dist * curvature;
  return [midLat + dLng * offset, midLng - dLat * offset];
}

/**
 * Returns a point along the quadratic bezier at parameter t (0..1).
 */
export function getBezierPoint(start, end, t, curvature = ARC_CURVATURE) {
  const cp = getControlPoint(start, end, curvature);
  const u = 1 - t;

  return [
    u * u * start[0] + 2 * u * t * cp[0] + t * t * end[0],
    u * u * start[1] + 2 * u * t * cp[1] + t * t * end[1],
  ];
}

/**
 * Returns an array of [lat, lng] points tracing the full bezier arc.
 */
export function getBezierPath(start, end, steps = ARC_STEPS, curvature = ARC_CURVATURE) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    points.push(getBezierPoint(start, end, i / steps, curvature));
  }
  return points;
}
