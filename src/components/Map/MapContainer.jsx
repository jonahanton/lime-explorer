import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  DEFAULT_CENTRE,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
} from '../../constants/map.js';
import RideArcLayer from './RideArcLayer.jsx';
import GlowParticle from './GlowParticle.jsx';
import styles from './MapContainer.module.css';

export default function MapContainer({
  rides,
  progress,
  animStatus,
  hoveredRide,
  onRideHover,
  onRideClick,
}) {
  return (
    <div className={styles.mapWrapper}>
      <LeafletMap
        center={DEFAULT_CENTRE}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        attributionControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <RideArcLayer
          rides={rides}
          progress={progress}
          animStatus={animStatus}
          hoveredRide={hoveredRide}
          onRideHover={onRideHover}
          onRideClick={onRideClick}
        />
        <GlowParticle
          rides={rides}
          progress={progress}
          animStatus={animStatus}
        />
      </LeafletMap>
    </div>
  );
}
