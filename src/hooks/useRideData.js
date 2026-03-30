import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseRides } from '../utils/rideParser.js';

export default function useRideData() {
  const [rides, setRides] = useState([]);
  const [isDemo, setIsDemo] = useState(true);
  const [warnings, setWarnings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});

  // Auto-load demo data on mount
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}example.json`)
      .then((res) => res.json())
      .then((json) => {
        const result = parseRides(json);
        setRides(result.rides);
        setWarnings(result.warnings);
        setFieldMapping(result.fieldMapping);
        setIsDemo(true);
      })
      .catch((err) => {
        console.error('Failed to load demo data:', err);
      });
  }, []);

  const loadUserData = useCallback((json, error) => {
    if (error || !json) {
      setWarnings([error || 'Unknown error loading file.']);
      return;
    }

    const result = parseRides(json);
    setRides(result.rides);
    setWarnings(result.warnings);
    setFieldMapping(result.fieldMapping);
    setIsDemo(false);
    setSelectedMonth(null);
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set();
    for (const ride of rides) {
      if (ride.startTime) {
        const key = `${ride.startTime.getFullYear()}-${String(ride.startTime.getMonth() + 1).padStart(2, '0')}`;
        months.add(key);
      }
    }
    return Array.from(months).sort();
  }, [rides]);

  const filteredRides = useMemo(() => {
    if (!selectedMonth) return rides;
    return rides.filter((ride) => {
      if (!ride.startTime) return false;
      const key = `${ride.startTime.getFullYear()}-${String(ride.startTime.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [rides, selectedMonth]);

  return {
    rides: filteredRides,
    allRides: rides,
    isDemo,
    warnings,
    fieldMapping,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    loadUserData,
  };
}
