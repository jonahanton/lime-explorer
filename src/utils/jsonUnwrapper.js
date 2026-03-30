const WRAPPER_KEYS = [
  'rides',
  'trips',
  'data',
  'journeys',
  'results',
  'records',
  'items',
  'entries',
];

/**
 * Extracts the ride array from potentially nested JSON.
 * Handles: bare arrays, single-level wrappers, double-nested wrappers.
 */
export function unwrapJson(raw) {
  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === 'object') {
    // Single-level: { rides: [...] }
    for (const key of WRAPPER_KEYS) {
      if (Array.isArray(raw[key])) return raw[key];
    }

    // Double-nested: { data: { rides: [...] } }
    for (const outerKey of WRAPPER_KEYS) {
      const inner = raw[outerKey];
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        for (const innerKey of WRAPPER_KEYS) {
          if (Array.isArray(inner[innerKey])) return inner[innerKey];
        }
      }
    }

    // Fallback: first array-valued property at top level
    for (const value of Object.values(raw)) {
      if (Array.isArray(value)) return value;
    }
  }

  return [];
}
