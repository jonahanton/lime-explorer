import { useReducer, useRef, useEffect, useCallback } from 'react';
import { animationReducer, INITIAL_STATE } from '../state/animationMachine.js';
import { TOTAL_PLAYBACK_MS } from '../constants/animation.js';

export default function useAnimationLoop() {
  const [state, dispatch] = useReducer(animationReducer, INITIAL_STATE);
  const rafRef = useRef(null);
  const prevTimeRef = useRef(null);

  useEffect(() => {
    if (state.status !== 'playing') {
      prevTimeRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (timestamp) => {
      if (prevTimeRef.current != null) {
        const elapsed = timestamp - prevTimeRef.current;
        // Cap delta to prevent jumps after tab suspension
        const capped = Math.min(elapsed, 100);
        dispatch({ type: 'tick', delta: capped / TOTAL_PLAYBACK_MS });
      }
      prevTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.status]);

  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const scrubTo = useCallback(
    (t) => dispatch({ type: 'scrub', to: t }),
    [],
  );

  return {
    status: state.status,
    progress: state.progress,
    play,
    pause,
    reset,
    scrubTo,
  };
}
