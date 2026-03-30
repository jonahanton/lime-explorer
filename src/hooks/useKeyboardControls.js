import { useEffect } from 'react';
import { SCRUB_STEP } from '../constants/animation.js';

export default function useKeyboardControls({
  status,
  progress,
  play,
  pause,
  reset,
  scrubTo,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when focus is on an interactive element
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (status === 'playing') pause();
          else play();
          break;

        case 'ArrowRight':
          e.preventDefault();
          scrubTo(Math.min(1, progress + SCRUB_STEP));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          scrubTo(Math.max(0, progress - SCRUB_STEP));
          break;

        case 'Escape':
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, progress, play, pause, reset, scrubTo]);
}
