import { describe, it, expect } from 'vitest';
import { getRideColour } from '../src/utils/colour.js';

describe('getRideColour', () => {
  it('returns a hex colour string', () => {
    const colour = getRideColour(0.5);
    expect(colour).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns green-ish at t=0 (oldest)', () => {
    const hex = getRideColour(0);
    // Should be close to #00e676
    expect(hex.toLowerCase()).toBe('#00e676');
  });

  it('returns blue-ish at t=1 (newest)', () => {
    const hex = getRideColour(1);
    // Should be close to #2979ff
    expect(hex.toLowerCase()).toBe('#2979ff');
  });

  it('returns a teal-ish colour at t=0.5 (middle)', () => {
    const hex = getRideColour(0.5);
    // Should be close to #00bcd4
    expect(hex.toLowerCase()).toBe('#00bcd4');
  });

  it('clamps values outside 0-1', () => {
    expect(getRideColour(-0.5)).toBe(getRideColour(0));
    expect(getRideColour(1.5)).toBe(getRideColour(1));
  });
});
