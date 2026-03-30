const FIELD_SCHEMA = {
  startLat: [
    'start_lat',
    'origin_lat',
    'from_lat',
    'pickup_lat',
    'start_latitude',
    'origin_latitude',
  ],
  startLng: [
    'start_lng',
    'start_lon',
    'origin_lng',
    'from_lng',
    'pickup_lng',
    'pickup_lon',
    'start_longitude',
    'origin_longitude',
  ],
  endLat: [
    'end_lat',
    'dest_lat',
    'to_lat',
    'dropoff_lat',
    'destination_lat',
    'end_latitude',
    'destination_latitude',
  ],
  endLng: [
    'end_lng',
    'end_lon',
    'dest_lng',
    'to_lng',
    'dropoff_lng',
    'dropoff_lon',
    'destination_lng',
    'end_longitude',
    'destination_longitude',
  ],
  startTime: [
    'start_time',
    'started_at',
    'timestamp',
    'date',
    'datetime',
    'created_at',
    'time',
    'pickup_time',
  ],
  endTime: ['end_time', 'ended_at', 'completed_at', 'dropoff_time'],
  cost: [
    'cost',
    'price',
    'fare',
    'amount',
    'total',
    'charge',
    'total_cost',
    'total_price',
    'cost_local',
  ],
  currency: ['currency', 'currency_code'],
  distance: [
    'distance',
    'distance_km',
    'distance_m',
    'distance_metres',
    'km',
    'meters',
    'miles',
  ],
  duration: [
    'duration',
    'duration_seconds',
    'ride_duration',
    'trip_duration',
    'minutes',
    'time_minutes',
    'duration_minutes',
  ],
  rideId: ['ride_id', 'trip_id', 'id', 'journey_id'],
};

function normaliseKey(key) {
  return key.toLowerCase().replace(/[-_\s]/g, '');
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Matches source field names to canonical fields using three tiers:
 * 1. Exact match (after normalising case/separators)
 * 2. Starts-with match
 * 3. Levenshtein distance < 3
 *
 * Returns { mapping: { sourceField: canonicalField }, unmatched: string[] }
 */
export function matchFields(sourceFields) {
  const mapping = {};
  const matched = new Set();
  const normalisedSchema = {};

  for (const [canonical, aliases] of Object.entries(FIELD_SCHEMA)) {
    normalisedSchema[canonical] = aliases.map(normaliseKey);
  }

  // Tier 1: exact match
  for (const field of sourceFields) {
    const norm = normaliseKey(field);
    for (const [canonical, aliases] of Object.entries(normalisedSchema)) {
      if (matched.has(canonical)) continue;
      if (aliases.includes(norm)) {
        mapping[field] = canonical;
        matched.add(canonical);
        break;
      }
    }
  }

  // Tier 2: starts-with match
  for (const field of sourceFields) {
    if (mapping[field]) continue;
    const norm = normaliseKey(field);
    for (const [canonical, aliases] of Object.entries(normalisedSchema)) {
      if (matched.has(canonical)) continue;
      if (aliases.some((alias) => norm.startsWith(alias))) {
        mapping[field] = canonical;
        matched.add(canonical);
        break;
      }
    }
  }

  // Tier 3: Levenshtein distance < 3
  for (const field of sourceFields) {
    if (mapping[field]) continue;
    const norm = normaliseKey(field);
    let bestCanonical = null;
    let bestDistance = 3;

    for (const [canonical, aliases] of Object.entries(normalisedSchema)) {
      if (matched.has(canonical)) continue;
      for (const alias of aliases) {
        const dist = levenshtein(norm, alias);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestCanonical = canonical;
        }
      }
    }

    if (bestCanonical) {
      mapping[field] = bestCanonical;
      matched.add(bestCanonical);
    }
  }

  const unmatched = sourceFields.filter((f) => !mapping[f]);
  return { mapping, unmatched };
}

export { FIELD_SCHEMA };
