import { describe, it, expect } from 'vitest';
import { parseRides } from '../src/utils/rideParser.js';

const validRide = {
  start_lat: 51.5391,
  start_lng: -0.1426,
  end_lat: 51.532,
  end_lng: -0.124,
  start_time: '2025-06-15T08:30:00Z',
  cost: 2.5,
  distance: 1.2,
};

describe('parseRides', () => {
  it('parses a bare array of rides', () => {
    const { rides, warnings } = parseRides([validRide]);
    expect(rides).toHaveLength(1);
    expect(rides[0].startLat).toBe(51.5391);
    expect(rides[0].cost).toBe(2.5);
    expect(warnings.length).toBeLessThanOrEqual(1);
  });

  it('parses wrapped { rides: [...] }', () => {
    const { rides } = parseRides({ rides: [validRide, validRide] });
    expect(rides).toHaveLength(2);
  });

  it('skips rides with invalid coordinates', () => {
    const bad = { ...validRide, start_lat: 999 };
    const { rides, warnings } = parseRides([validRide, bad]);
    expect(rides).toHaveLength(1);
    expect(warnings.some((w) => w.includes('Skipped'))).toBe(true);
  });

  it('sorts rides by timestamp', () => {
    const early = { ...validRide, start_time: '2025-01-01T00:00:00Z' };
    const late = { ...validRide, start_time: '2025-12-01T00:00:00Z' };
    const { rides } = parseRides([late, early]);
    expect(rides[0].startTime < rides[1].startTime).toBe(true);
  });

  it('returns warnings for empty data', () => {
    const { rides, warnings } = parseRides({});
    expect(rides).toHaveLength(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('returns warnings for missing coordinate fields', () => {
    const { rides, warnings } = parseRides([{ name: 'test', value: 42 }]);
    expect(rides).toHaveLength(0);
    expect(warnings.some((w) => w.includes('coordinate') || w.includes('required'))).toBe(
      true,
    );
  });
});
