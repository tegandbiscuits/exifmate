import { rem } from '@mantine/core';
import { MapContainer, TileLayer } from 'react-leaflet';
import LocationMarker from './Locationmarker';

interface MapProps {
  latitude?: number;
  longitude?: number;
  disabled?: boolean;
  onPositionChange: (position: [lat: number, lon: number]) => void;
}

function MapField({
  latitude,
  longitude,
  onPositionChange,
  disabled,
}: MapProps) {
  return (
    <MapContainer
      center={[latitude ?? 0, longitude ?? 0]}
      zoom={13}
      style={{ height: rem(200) }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {latitude !== undefined && longitude !== undefined && (
        <LocationMarker
          position={[latitude, longitude]}
          setPosition={(position) => {
            if (!disabled) {
              onPositionChange(position);
            }
          }}
        />
      )}
    </MapContainer>
  );
}

export default MapField;
