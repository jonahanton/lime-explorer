import styles from './PlaybackControls.module.css';

export default function PlaybackControls({
  status,
  progress,
  onPlay,
  onPause,
  onReset,
  onScrub,
}) {
  const isPlaying = status === 'playing';
  const canReset = status !== 'idle' || progress > 0;

  const handleToggle = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleScrub = (e) => {
    onScrub(parseFloat(e.target.value));
  };

  return (
    <div className={styles.controls}>
      <button
        className={styles.playButton}
        onClick={handleToggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        type="button"
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="3.5" height="10" rx="0.5" />
            <rect x="7.5" y="1" width="3.5" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2.5 1.5v9l8-4.5z" />
          </svg>
        )}
      </button>
      <input
        className={styles.slider}
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={progress}
        onChange={handleScrub}
        aria-label="Timeline"
      />
      {canReset && (
        <button
          className={styles.resetButton}
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      )}
    </div>
  );
}
