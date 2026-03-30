import { useState, useEffect } from 'react';
import { haversineKm } from '../../utils/geo.js';
import styles from './RideTooltip.module.css';

export default function RideTooltip({ ride }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (!ride) return null;

  const distance = haversineKm(
    ride.startLat,
    ride.startLng,
    ride.endLat,
    ride.endLng,
  );

  const dateStr = ride.startTime
    ? ride.startTime.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  return (
    <div className={styles.tooltip} style={{ left: pos.x, top: pos.y }}>
      <div className={styles.row}>
        <span className={styles.label}>Date</span>
        <span className={styles.value}>{dateStr}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Distance</span>
        <span className={styles.value}>{distance.toFixed(1)} km</span>
      </div>
      {ride.cost != null && (
        <div className={styles.row}>
          <span className={styles.label}>Cost</span>
          <span className={styles.value}>£{ride.cost.toFixed(2)}</span>
        </div>
      )}
      {ride.duration != null && (
        <div className={styles.row}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{Math.round(ride.duration)} min</span>
        </div>
      )}
    </div>
  );
}
