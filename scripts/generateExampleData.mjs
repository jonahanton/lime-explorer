/**
 * Generates ~280 synthetic London Lime rides for demo purposes.
 * Run: node scripts/generateExampleData.mjs
 */

import { writeFileSync } from 'fs';

const LOCATIONS = {
  home: { lat: 51.5391, lng: -0.1426, label: 'Camden' },
  work: { lat: 51.532, lng: -0.124, label: "King's Cross" },
  gym: { lat: 51.5195, lng: -0.1392, label: 'Fitzrovia' },
  brunch: { lat: 51.5445, lng: -0.103, label: 'Islington' },
  park: { lat: 51.5353, lng: -0.1534, label: "Regent's Park" },
  pub: { lat: 51.5255, lng: -0.118, label: 'Bloomsbury' },
};

const WEEKDAY_ROUTES = [
  ['home', 'work'],
  ['work', 'home'],
  ['home', 'gym'],
  ['gym', 'home'],
  ['work', 'gym'],
  ['gym', 'work'],
];

const WEEKEND_ROUTES = [
  ['home', 'brunch'],
  ['brunch', 'home'],
  ['home', 'park'],
  ['park', 'home'],
  ['home', 'pub'],
  ['pub', 'home'],
];

// Box-Muller transform for Gaussian noise
function gaussianRandom(mean = 0, std = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function jitter(coord, sigma = 0.002) {
  return coord + gaussianRandom(0, sigma);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateRide(date, fromKey, toKey, id) {
  const from = LOCATIONS[fromKey];
  const to = LOCATIONS[toKey];

  const startLat = jitter(from.lat);
  const startLng = jitter(from.lng);
  const endLat = jitter(to.lat);
  const endLng = jitter(to.lng);

  const distanceKm = haversineKm(startLat, startLng, endLat, endLng);
  const durationMinutes = Math.max(3, distanceKm * 4 + gaussianRandom(0, 1.5));
  const cost = Math.max(1.0, distanceKm * 1.2 + gaussianRandom(0.3, 0.3));

  const startTime = new Date(date);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  return {
    ride_id: `RIDE-${id.toString().padStart(4, '0')}`,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    start_lat: parseFloat(startLat.toFixed(6)),
    start_lng: parseFloat(startLng.toFixed(6)),
    end_lat: parseFloat(endLat.toFixed(6)),
    end_lng: parseFloat(endLng.toFixed(6)),
    distance_km: parseFloat(distanceKm.toFixed(2)),
    duration_minutes: parseFloat(durationMinutes.toFixed(1)),
    cost: parseFloat(cost.toFixed(2)),
    currency: 'GBP',
  };
}

function getTimeOfDay(routeFrom, routeTo) {
  // Commute times
  if (
    (routeFrom === 'home' && routeTo === 'work') ||
    (routeFrom === 'home' && routeTo === 'gym' && Math.random() > 0.5)
  ) {
    return { hour: randomInt(7, 9), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'work' && routeTo === 'home') {
    return { hour: randomInt(17, 19), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'gym' && routeTo === 'home') {
    return { hour: randomInt(19, 21), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'work' && routeTo === 'gym') {
    return { hour: randomInt(17, 18), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'gym' && routeTo === 'work') {
    return { hour: randomInt(7, 8), minute: randomInt(0, 59) };
  }
  // Weekend
  if (routeFrom === 'home' && routeTo === 'brunch') {
    return { hour: randomInt(10, 12), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'home' && routeTo === 'park') {
    return { hour: randomInt(14, 16), minute: randomInt(0, 59) };
  }
  if (routeFrom === 'home' && routeTo === 'pub') {
    return { hour: randomInt(18, 20), minute: randomInt(0, 59) };
  }
  // Return trips
  return { hour: randomInt(12, 21), minute: randomInt(0, 59) };
}

// Generate rides over 8 months
const startDate = new Date('2025-03-01');
const endDate = new Date('2025-10-31');
const rides = [];
let rideId = 1;

for (
  let d = new Date(startDate);
  d <= endDate;
  d.setDate(d.getDate() + 1)
) {
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Skip some days randomly (not every day is a ride day)
  if (Math.random() < 0.3) continue;

  const routes = isWeekend ? WEEKEND_ROUTES : WEEKDAY_ROUTES;

  // 1-3 rides per active day
  const numRides = isWeekend ? randomInt(1, 2) : randomInt(1, 3);
  const usedRoutes = new Set();

  for (let i = 0; i < numRides; i++) {
    let route;
    do {
      route = routes[randomInt(0, routes.length - 1)];
    } while (usedRoutes.has(`${route[0]}-${route[1]}`));
    usedRoutes.add(`${route[0]}-${route[1]}`);

    const time = getTimeOfDay(route[0], route[1]);
    const rideDate = new Date(d);
    rideDate.setHours(time.hour, time.minute, randomInt(0, 59));

    rides.push(generateRide(rideDate, route[0], route[1], rideId++));
  }
}

rides.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

writeFileSync(
  'public/example.json',
  JSON.stringify(rides, null, 2),
);

console.info(`Generated ${rides.length} rides → public/example.json`);
