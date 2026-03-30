import { useMemo } from 'react';
import { haversineKm } from '../../utils/geo.js';
import styles from './StatsBar.module.css';

const fmtNumber = (n) =>
  new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(n);

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(n);

export default function StatsBar({ rides }) {
  const stats = useMemo(() => {
    const totalRides = rides.length;
    let totalKm = 0;
    let totalCost = 0;

    for (const ride of rides) {
      totalKm += haversineKm(
        ride.startLat,
        ride.startLng,
        ride.endLat,
        ride.endLng,
      );
      if (ride.cost != null) totalCost += ride.cost;
    }

    const avgCost = totalRides > 0 ? totalCost / totalRides : 0;

    return { totalRides, totalKm, totalCost, avgCost };
  }, [rides]);

  return (
    <div className={styles.statsBar}>
      <div className={styles.stat}>
        <span className={styles.statValue}>{fmtNumber(stats.totalRides)}</span>
        <span className={styles.statLabel}>rides</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{fmtNumber(stats.totalKm)} km</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{fmtCurrency(stats.totalCost)}</span>
        <span className={styles.statLabel}>spent</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{fmtCurrency(stats.avgCost)}</span>
        <span className={styles.statLabel}>avg</span>
      </div>
    </div>
  );
}
