import { useMapEvent } from 'react-leaflet';
import { Marker } from 'react-leaflet';

interface Props {
  position: [number, number];
  setPosition: (position: Props['position']) => void;
}

function LocationMarker({ position, setPosition }: Props) {
  useMapEvent('click', (e) => {
    setPosition([e.latlng.lat, e.latlng.lng]);
  });

  return <Marker position={position} />;
}

export default LocationMarker;
