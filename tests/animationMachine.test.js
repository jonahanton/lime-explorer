import { describe, it, expect } from 'vitest';
import { animationReducer, INITIAL_STATE } from '../src/state/animationMachine.js';

describe('animationReducer', () => {
  it('starts in idle state with progress 0', () => {
    expect(INITIAL_STATE).toEqual({ status: 'idle', progress: 0 });
  });

  it('transitions idle → playing on play', () => {
    const state = animationReducer(INITIAL_STATE, { type: 'play' });
    expect(state.status).toBe('playing');
    expect(state.progress).toBe(0);
  });

  it('transitions playing → paused on pause', () => {
    const state = animationReducer(
      { status: 'playing', progress: 0.5 },
      { type: 'pause' },
    );
    expect(state.status).toBe('paused');
    expect(state.progress).toBe(0.5);
  });

  it('transitions paused → playing on play (resume)', () => {
    const state = animationReducer(
      { status: 'paused', progress: 0.5 },
      { type: 'play' },
    );
    expect(state.status).toBe('playing');
    expect(state.progress).toBe(0.5);
  });

  it('updates progress on tick', () => {
    const state = animationReducer(
      { status: 'playing', progress: 0.3 },
      { type: 'tick', delta: 0.1 },
    );
    expect(state.status).toBe('playing');
    expect(state.progress).toBeCloseTo(0.4);
  });

  it('auto-resets to idle when progress reaches 1', () => {
    const state = animationReducer(
      { status: 'playing', progress: 0.95 },
      { type: 'tick', delta: 0.1 },
    );
    expect(state.status).toBe('idle');
    expect(state.progress).toBe(1);
  });

  it('ignores tick when not playing', () => {
    const state = animationReducer(
      { status: 'paused', progress: 0.5 },
      { type: 'tick', delta: 0.1 },
    );
    expect(state.progress).toBe(0.5);
  });

  it('scrub sets progress and pauses if playing', () => {
    const state = animationReducer(
      { status: 'playing', progress: 0.3 },
      { type: 'scrub', to: 0.7 },
    );
    expect(state.status).toBe('paused');
    expect(state.progress).toBe(0.7);
  });

  it('scrub clamps to [0, 1]', () => {
    const over = animationReducer(INITIAL_STATE, { type: 'scrub', to: 1.5 });
    expect(over.progress).toBe(1);

    const under = animationReducer(INITIAL_STATE, { type: 'scrub', to: -0.5 });
    expect(under.progress).toBe(0);
  });

  it('reset returns to initial state', () => {
    const state = animationReducer(
      { status: 'playing', progress: 0.8 },
      { type: 'reset' },
    );
    expect(state).toEqual(INITIAL_STATE);
  });
});
