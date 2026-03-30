import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { getBezierPoint } from '../../utils/bezier.js';
import { PARTICLE_RADIUS, GLOW_RADIUS } from '../../constants/animation.js';
import { COLOURS } from '../../constants/theme.js';

export default function GlowParticle({ rides, progress, animStatus }) {
  const map = useMap();
  const dotRef = useRef(null);

  useEffect(() => {
    if (!dotRef.current) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.width = `${PARTICLE_RADIUS * 2}px`;
      dot.style.height = `${PARTICLE_RADIUS * 2}px`;
      dot.style.borderRadius = '50%';
      dot.style.background = COLOURS.accentBright;
      dot.style.boxShadow = [
        `0 0 ${GLOW_RADIUS / 2}px ${COLOURS.accentGlow}`,
        `0 0 ${GLOW_RADIUS}px ${COLOURS.accentGlow}`,
        `0 0 ${GLOW_RADIUS * 2}px ${COLOURS.accentBright}`,
      ].join(', ');
      dot.style.pointerEvents = 'none';
      dot.style.zIndex = '1000';
      dot.style.display = 'none';
      dot.style.transform = 'translate(-50%, -50%)';

      map.getContainer().appendChild(dot);
      dotRef.current = dot;
    }

    return () => {
      if (dotRef.current?.parentNode) {
        dotRef.current.parentNode.removeChild(dotRef.current);
        dotRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot || !rides.length) return;

    if (animStatus !== 'playing') {
      dot.style.display = 'none';
      return;
    }

    const currentIdx = Math.min(
      Math.floor(progress * rides.length),
      rides.length - 1,
    );
    const localT = (progress * rides.length) % 1;
    const ride = rides[currentIdx];

    if (!ride) {
      dot.style.display = 'none';
      return;
    }

    const [lat, lng] = getBezierPoint(
      [ride.startLat, ride.startLng],
      [ride.endLat, ride.endLng],
      localT,
    );

    const point = map.latLngToContainerPoint([lat, lng]);
    dot.style.display = 'block';
    dot.style.left = `${point.x}px`;
    dot.style.top = `${point.y}px`;
  });

  return null;
}
