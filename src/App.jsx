import { useState } from 'react';
import useRideData from './hooks/useRideData.js';
import useAnimationLoop from './hooks/useAnimationLoop.js';
import useKeyboardControls from './hooks/useKeyboardControls.js';
import MapContainer from './components/Map/MapContainer.jsx';
import StatsBar from './components/Stats/StatsBar.jsx';
import PlaybackControls from './components/Controls/PlaybackControls.jsx';
import MonthFilter from './components/Controls/MonthFilter.jsx';
import DropZone from './components/Upload/DropZone.jsx';
import DemoBadge from './components/UI/DemoBadge.jsx';
import RideTooltip from './components/UI/RideTooltip.jsx';
import styles from './App.module.css';

export default function App() {
  const {
    rides,
    isDemo,
    warnings,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loadUserData,
  } = useRideData();

  const { status, progress, play, pause, reset, scrubTo } =
    useAnimationLoop();

  useKeyboardControls({ status, progress, play, pause, reset, scrubTo });

  const [hoveredRide, setHoveredRide] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);

  const handleRideClick = (ride) => {
    setSelectedRide((prev) =>
      prev?.rideId === ride?.rideId ? null : ride,
    );
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Lime Trail Explorer</h1>
          {isDemo && <DemoBadge />}
          {isDemo && (
            <span className={styles.onboardingHint}>
              Showing demo rides — upload your Lime GDPR export to see yours
            </span>
          )}
        </div>
        <div className={styles.headerRight}>
          <StatsBar rides={rides} />
          <MonthFilter
            months={availableMonths}
            selected={selectedMonth}
            onChange={setSelectedMonth}
          />
          <DropZone onFileLoaded={loadUserData} />
        </div>
      </header>
      {warnings.length > 0 && (
        <div className={styles.warnings}>
          {warnings.map((w, i) => (
            <p key={i} className={styles.warning}>{w}</p>
          ))}
        </div>
      )}
      <div className={styles.mapArea}>
        <MapContainer
          rides={rides}
          progress={progress}
          animStatus={status}
          hoveredRide={hoveredRide || selectedRide}
          onRideHover={setHoveredRide}
          onRideClick={handleRideClick}
        />
        <div className={styles.playbackBar}>
          <PlaybackControls
            status={status}
            progress={progress}
            onPlay={play}
            onPause={pause}
            onReset={reset}
            onScrub={scrubTo}
          />
        </div>
      </div>
      <RideTooltip ride={hoveredRide || selectedRide} />
    </div>
  );
}
