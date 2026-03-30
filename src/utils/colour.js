import { COLOURS } from '../constants/theme.js';

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;

  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

function hslToHex(h, s, l) {
  const hue2rgb = (p, q, t) => {
    const t1 = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (t1 < 1 / 6) return p + (q - p) * 6 * t1;
    if (t1 < 1 / 2) return q;
    if (t1 < 2 / 3) return p + (q - p) * (2 / 3 - t1) * 6;
    return p;
  };

  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpHue(a, b, t) {
  // Take the shortest path around the hue circle
  let diff = b - a;
  if (diff > 0.5) diff -= 1;
  if (diff < -0.5) diff += 1;
  return ((a + diff * t) % 1 + 1) % 1;
}

const STOP_OLDEST = hexToHsl(COLOURS.trailOldest);
const STOP_MIDDLE = hexToHsl(COLOURS.trailMiddle);
const STOP_NEWEST = hexToHsl(COLOURS.trailNewest);

/**
 * Maps a normalised time value (0 = oldest, 1 = newest) to a hex colour
 * along the gradient: green → teal → blue.
 */
export function getRideColour(t) {
  const clamped = Math.max(0, Math.min(1, t));

  let h, s, l;
  if (clamped <= 0.5) {
    const local = clamped * 2;
    h = lerpHue(STOP_OLDEST[0], STOP_MIDDLE[0], local);
    s = lerp(STOP_OLDEST[1], STOP_MIDDLE[1], local);
    l = lerp(STOP_OLDEST[2], STOP_MIDDLE[2], local);
  } else {
    const local = (clamped - 0.5) * 2;
    h = lerpHue(STOP_MIDDLE[0], STOP_NEWEST[0], local);
    s = lerp(STOP_MIDDLE[1], STOP_NEWEST[1], local);
    l = lerp(STOP_MIDDLE[2], STOP_NEWEST[2], local);
  }

  return hslToHex(h, s, l);
}
