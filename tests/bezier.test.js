import { describe, it, expect } from 'vitest';
import { getBezierPoint, getBezierPath } from '../src/utils/bezier.js';

describe('getBezierPoint', () => {
  const start = [51.54, -0.14];
  const end = [51.53, -0.12];

  it('returns start at t=0', () => {
    const [lat, lng] = getBezierPoint(start, end, 0);
    expect(lat).toBeCloseTo(start[0], 4);
    expect(lng).toBeCloseTo(start[1], 4);
  });

  it('returns end at t=1', () => {
    const [lat, lng] = getBezierPoint(start, end, 1);
    expect(lat).toBeCloseTo(end[0], 4);
    expect(lng).toBeCloseTo(end[1], 4);
  });

  it('returns a point between start and end at t=0.5', () => {
    const [lat, lng] = getBezierPoint(start, end, 0.5);
    expect(lat).toBeGreaterThan(Math.min(start[0], end[0]) - 0.01);
    expect(lat).toBeLessThan(Math.max(start[0], end[0]) + 0.01);
    expect(lng).toBeGreaterThan(Math.min(start[1], end[1]) - 0.01);
    expect(lng).toBeLessThan(Math.max(start[1], end[1]) + 0.01);
  });
});

describe('getBezierPath', () => {
  const start = [51.54, -0.14];
  const end = [51.53, -0.12];

  it('returns the correct number of points', () => {
    const path = getBezierPath(start, end, 16);
    expect(path).toHaveLength(17);
  });

  it('starts at start and ends at end', () => {
    const path = getBezierPath(start, end, 8);
    expect(path[0][0]).toBeCloseTo(start[0], 4);
    expect(path[0][1]).toBeCloseTo(start[1], 4);
    expect(path[path.length - 1][0]).toBeCloseTo(end[0], 4);
    expect(path[path.length - 1][1]).toBeCloseTo(end[1], 4);
  });
});
