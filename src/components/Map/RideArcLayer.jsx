import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { getBezierPath } from '../../utils/bezier.js';
import { getRideColour } from '../../utils/colour.js';
import {
  ARC_LINE_WIDTH,
  ARC_GLOW_WIDTH,
  IDLE_ARC_OPACITY,
  ACTIVE_ARC_OPACITY,
  FADED_ARC_OPACITY,
} from '../../constants/animation.js';
import { COLOURS } from '../../constants/theme.js';

const HIT_THRESHOLD_PX = 10;

export default function RideArcLayer({
  rides,
  progress,
  animStatus,
  hoveredRide,
  onRideHover,
  onRideClick,
}) {
  const map = useMap();
  const canvasRef = useRef(null);
  const pathCacheRef = useRef(new Map());
  const [drawVersion, setDrawVersion] = useState(0);

  // Cache bezier paths keyed by ride identity
  const getPath = useCallback((ride) => {
    const key = `${ride.startLat},${ride.startLng},${ride.endLat},${ride.endLng}`;
    let path = pathCacheRef.current.get(key);
    if (!path) {
      path = getBezierPath(
        [ride.startLat, ride.startLng],
        [ride.endLat, ride.endLng],
      );
      pathCacheRef.current.set(key, path);
    }
    return path;
  }, []);

  // Invalidate cache when rides change
  useEffect(() => {
    pathCacheRef.current.clear();
  }, [rides]);

  // Create canvas overlay
  useEffect(() => {
    const container = map.getPane('overlayPane');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'default';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map]);

  // Redraw on map move/zoom — bump version to trigger render effect
  useEffect(() => {
    const bump = () => setDrawVersion((v) => v + 1);
    map.on('move', bump);
    map.on('zoom', bump);
    map.on('resize', bump);
    return () => {
      map.off('move', bump);
      map.off('zoom', bump);
      map.off('resize', bump);
    };
  }, [map]);

  // Hit detection handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e) => {
      if (!rides.length) return;
      const rect = canvas.getBoundingClientRect();
      const hit = findHitRide(e.clientX - rect.left, e.clientY - rect.top);
      onRideHover?.(hit);
    };

    const handleClick = (e) => {
      if (!rides.length) return;
      const rect = canvas.getBoundingClientRect();
      const hit = findHitRide(e.clientX - rect.left, e.clientY - rect.top);
      onRideClick?.(hit);
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClick);
    };
  });

  function findHitRide(px, py) {
    const isAnimating = animStatus === 'playing' || animStatus === 'paused';
    const visibleCount = isAnimating
      ? Math.ceil(progress * rides.length)
      : rides.length;

    for (let i = visibleCount - 1; i >= 0; i--) {
      const ride = rides[i];
      const path = getPath(ride);

      for (const [lat, lng] of path) {
        const point = map.latLngToContainerPoint([lat, lng]);
        const dx = point.x - px;
        const dy = point.y - py;
        if (dx * dx + dy * dy < HIT_THRESHOLD_PX * HIT_THRESHOLD_PX) {
          return ride;
        }
      }
    }
    return null;
  }

  // Main render — redraws on any prop change or map movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rides.length) return;

    const size = map.getSize();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size.x * ratio;
    canvas.height = size.y * ratio;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;

    const panePos = map.getPane('overlayPane')._leaflet_pos || { x: 0, y: 0 };
    canvas.style.transform = `translate(${-panePos.x}px, ${-panePos.y}px)`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, size.x, size.y);

    const isAnimating = animStatus === 'playing' || animStatus === 'paused';
    const visibleCount = isAnimating
      ? Math.ceil(progress * rides.length)
      : rides.length;
    const currentIdx = isAnimating
      ? Math.min(Math.floor(progress * rides.length), rides.length - 1)
      : -1;
    const rideLocalProgress = isAnimating
      ? (progress * rides.length) % 1
      : 1;

    const timeRange =
      rides.length > 1
        ? rides[rides.length - 1].startTime - rides[0].startTime
        : 1;

    for (let i = 0; i < visibleCount; i++) {
      const ride = rides[i];
      const normTime =
        timeRange > 0 && ride.startTime
          ? (ride.startTime - rides[0].startTime) / timeRange
          : i / rides.length;

      const colour = getRideColour(normTime);
      const isHovered = hoveredRide && hoveredRide.rideId === ride.rideId;
      const isCurrent = i === currentIdx;

      let opacity;
      if (isHovered) {
        opacity = ACTIVE_ARC_OPACITY;
      } else if (isAnimating && !isCurrent) {
        opacity = FADED_ARC_OPACITY;
      } else {
        opacity = IDLE_ARC_OPACITY;
      }

      const path = getPath(ride);
      const endStep =
        isCurrent && isAnimating
          ? Math.floor(rideLocalProgress * (path.length - 1))
          : path.length - 1;

      const pixelPath = [];
      for (let j = 0; j <= endStep; j++) {
        const pt = map.latLngToContainerPoint([path[j][0], path[j][1]]);
        pixelPath.push([pt.x + panePos.x, pt.y + panePos.y]);
      }

      if (pixelPath.length < 2) continue;

      // Glow pass
      ctx.save();
      ctx.globalAlpha = opacity * 0.4;
      ctx.strokeStyle = isHovered ? COLOURS.accent : colour;
      ctx.lineWidth = isHovered ? ARC_GLOW_WIDTH + 4 : ARC_GLOW_WIDTH;
      ctx.shadowColor = isHovered ? COLOURS.accentGlow : colour;
      ctx.shadowBlur = isHovered ? 16 : 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pixelPath[0][0], pixelPath[0][1]);
      for (let j = 1; j < pixelPath.length; j++) {
        ctx.lineTo(pixelPath[j][0], pixelPath[j][1]);
      }
      ctx.stroke();
      ctx.restore();

      // Crisp pass
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = isHovered ? COLOURS.accent : colour;
      ctx.lineWidth = isHovered ? ARC_LINE_WIDTH + 1 : ARC_LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pixelPath[0][0], pixelPath[0][1]);
      for (let j = 1; j < pixelPath.length; j++) {
        ctx.lineTo(pixelPath[j][0], pixelPath[j][1]);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [rides, progress, animStatus, hoveredRide, drawVersion, map, getPath]);

  return null;
}
