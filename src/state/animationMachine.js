export const INITIAL_STATE = { status: 'idle', progress: 0 };

export function animationReducer(state, action) {
  switch (action.type) {
    case 'play':
      if (state.status === 'idle')
        return { status: 'playing', progress: 0 };
      if (state.status === 'paused')
        return { ...state, status: 'playing' };
      return state;

    case 'pause':
      if (state.status === 'playing')
        return { ...state, status: 'paused' };
      return state;

    case 'tick': {
      if (state.status !== 'playing') return state;
      const next = state.progress + action.delta;
      if (next >= 1) return { status: 'idle', progress: 1 };
      return { ...state, progress: next };
    }

    case 'scrub':
      return {
        ...state,
        status: state.status === 'playing' ? 'paused' : state.status,
        progress: Math.max(0, Math.min(1, action.to)),
      };

    case 'reset':
      return INITIAL_STATE;

    default:
      return state;
  }
}
