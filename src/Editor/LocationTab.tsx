import { Fieldset, Stack, rem } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import type { ExifData } from '../core/metadata-handler';
import ExifInput from './ExifInput';

const LONDON_LOC = [51.5, 0] as const;

function LocationTab() {
  const {
    setValue,
    getValues,
    watch,
    formState: { disabled },
  } = useFormContext<ExifData>();
  const [initialLat, initialLon] = getValues(['GPSLatitude', 'GPSLongitude']);

  return (
    <div>
      <MapGL
        initialViewState={{
          latitude: initialLat,
          longitude: initialLon,
          zoom: 12,
        }}
        style={{ height: rem(200) }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        onLoad={(m) => {
          m.target.setCenter({
            lat: initialLat ?? LONDON_LOC[0],
            lon: initialLon ?? LONDON_LOC[1],
          });
        }}
        onClick={({ lngLat: { lat, lng } }) => {
          if (!disabled) {
            setValue('GPSLatitude', lat);
            setValue('GPSLongitude', lng);
          }
        }}
      >
        <Marker
          latitude={watch('GPSLatitude') ?? 0}
          longitude={watch('GPSLongitude') ?? 0}
          anchor="bottom"
        >
          <IconMapPinFilled />
        </Marker>
      </MapGL>

      <Fieldset legend="GPS">
        <Stack gap="xs">
          <ExifInput tagName="GPSLatitude" />
          <ExifInput tagName="GPSLongitude" />
        </Stack>
      </Fieldset>
    </div>
  );
}

export default LocationTab;
