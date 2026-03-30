import { describe, it, expect } from 'vitest';
import { matchFields } from '../src/utils/fieldMatcher.js';

describe('matchFields', () => {
  it('matches exact canonical names', () => {
    const fields = ['start_lat', 'start_lng', 'end_lat', 'end_lng', 'cost'];
    const { mapping } = matchFields(fields);
    expect(mapping['start_lat']).toBe('startLat');
    expect(mapping['start_lng']).toBe('startLng');
    expect(mapping['end_lat']).toBe('endLat');
    expect(mapping['end_lng']).toBe('endLng');
    expect(mapping['cost']).toBe('cost');
  });

  it('matches case-insensitively', () => {
    const { mapping } = matchFields(['Start_Lat', 'START_LNG', 'End_Lat', 'End_Lng']);
    expect(mapping['Start_Lat']).toBe('startLat');
    expect(mapping['START_LNG']).toBe('startLng');
  });

  it('matches alternative field names', () => {
    const { mapping } = matchFields([
      'origin_lat',
      'origin_lng',
      'dest_lat',
      'dest_lng',
      'fare',
    ]);
    expect(mapping['origin_lat']).toBe('startLat');
    expect(mapping['origin_lng']).toBe('startLng');
    expect(mapping['dest_lat']).toBe('endLat');
    expect(mapping['dest_lng']).toBe('endLng');
    expect(mapping['fare']).toBe('cost');
  });

  it('matches pickup/dropoff variants', () => {
    const { mapping } = matchFields([
      'pickup_lat',
      'pickup_lon',
      'dropoff_lat',
      'dropoff_lon',
    ]);
    expect(mapping['pickup_lat']).toBe('startLat');
    expect(mapping['pickup_lon']).toBe('startLng');
    expect(mapping['dropoff_lat']).toBe('endLat');
    expect(mapping['dropoff_lon']).toBe('endLng');
  });

  it('reports unmatched fields', () => {
    const { unmatched } = matchFields([
      'start_lat',
      'start_lng',
      'end_lat',
      'end_lng',
      'random_field',
      'another_unknown',
    ]);
    expect(unmatched).toContain('random_field');
    expect(unmatched).toContain('another_unknown');
  });

  it('handles fields with no separators', () => {
    const { mapping } = matchFields(['startlat', 'startlng', 'endlat', 'endlng']);
    expect(mapping['startlat']).toBe('startLat');
    expect(mapping['startlng']).toBe('startLng');
  });
});
