import { describe, it, expect } from 'vitest';
import { unwrapJson } from '../src/utils/jsonUnwrapper.js';

describe('unwrapJson', () => {
  it('returns a bare array as-is', () => {
    const data = [{ a: 1 }, { a: 2 }];
    expect(unwrapJson(data)).toEqual(data);
  });

  it('unwraps { rides: [...] }', () => {
    const inner = [{ id: 1 }];
    expect(unwrapJson({ rides: inner })).toEqual(inner);
  });

  it('unwraps { trips: [...] }', () => {
    const inner = [{ id: 1 }];
    expect(unwrapJson({ trips: inner })).toEqual(inner);
  });

  it('unwraps { data: [...] }', () => {
    const inner = [{ id: 1 }];
    expect(unwrapJson({ data: inner })).toEqual(inner);
  });

  it('unwraps double-nested { data: { rides: [...] } }', () => {
    const inner = [{ id: 1 }];
    expect(unwrapJson({ data: { rides: inner } })).toEqual(inner);
  });

  it('falls back to first array-valued property', () => {
    const inner = [{ id: 1 }];
    expect(unwrapJson({ custom_key: inner })).toEqual(inner);
  });

  it('returns empty array for non-object input', () => {
    expect(unwrapJson(null)).toEqual([]);
    expect(unwrapJson('string')).toEqual([]);
    expect(unwrapJson(42)).toEqual([]);
  });

  it('returns empty array for object with no arrays', () => {
    expect(unwrapJson({ foo: 'bar', baz: 42 })).toEqual([]);
  });
});
