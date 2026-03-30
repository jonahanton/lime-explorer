import { unwrapJson } from './jsonUnwrapper.js';
import { matchFields } from './fieldMatcher.js';
import { isValidCoord } from './geo.js';

function coerceNumber(val) {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return Number.isNaN(parsed) ? null : parsed;
}

function coerceDate(val) {
  if (val instanceof Date) return val;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normaliseRide(raw, mapping) {
  const get = (canonical) => {
    const sourceKey = Object.keys(mapping).find((k) => mapping[k] === canonical);
    return sourceKey ? raw[sourceKey] : undefined;
  };

  const startLat = coerceNumber(get('startLat'));
  const startLng = coerceNumber(get('startLng'));
  const endLat = coerceNumber(get('endLat'));
  const endLng = coerceNumber(get('endLng'));
  const startTime = coerceDate(get('startTime'));
  const endTime = coerceDate(get('endTime'));
  const cost = coerceNumber(get('cost'));
  const distance = coerceNumber(get('distance'));
  const duration = coerceNumber(get('duration'));
  const currency = get('currency') || '£';
  const rideId = get('rideId') || null;

  return {
    startLat,
    startLng,
    endLat,
    endLng,
    startTime,
    endTime,
    cost,
    distance,
    duration,
    currency,
    rideId,
  };
}

/**
 * Full parsing pipeline: unwrap → match → normalise → validate → sort.
 * Returns { rides, warnings, fieldMapping }.
 */
export function parseRides(rawJson) {
  const warnings = [];
  const array = unwrapJson(rawJson);

  if (!array.length) {
    warnings.push('No ride data found in the uploaded file.');
    return { rides: [], warnings, fieldMapping: {} };
  }

  const sampleFields = Object.keys(array[0]);
  const { mapping, unmatched } = matchFields(sampleFields);

  if (!mapping || !Object.values(mapping).includes('startLat')) {
    warnings.push(
      'Could not identify coordinate fields. Expected fields like start_lat, end_lat, etc.',
    );
    return { rides: [], warnings, fieldMapping: mapping };
  }

  const requiredCanonicals = ['startLat', 'startLng', 'endLat', 'endLng'];
  const missingRequired = requiredCanonicals.filter(
    (c) => !Object.values(mapping).includes(c),
  );

  if (missingRequired.length) {
    warnings.push(`Missing required fields: ${missingRequired.join(', ')}`);
    return { rides: [], warnings, fieldMapping: mapping };
  }

  if (unmatched.length) {
    warnings.push(`Unrecognised fields ignored: ${unmatched.join(', ')}`);
  }

  const rides = [];
  let skipped = 0;

  for (const raw of array) {
    const ride = normaliseRide(raw, mapping);

    if (
      !isValidCoord(ride.startLat, ride.startLng) ||
      !isValidCoord(ride.endLat, ride.endLng)
    ) {
      skipped++;
      continue;
    }

    rides.push(ride);
  }

  if (skipped > 0) {
    warnings.push(`Skipped ${skipped} rides with invalid coordinates.`);
  }

  rides.sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime - b.startTime;
    return 0;
  });

  return { rides, warnings, fieldMapping: mapping };
}
