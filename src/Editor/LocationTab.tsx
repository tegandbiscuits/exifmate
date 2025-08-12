import { Fieldset, Group, Skeleton, Stack } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { load } from '@tauri-apps/plugin-store';
import type { MapLibreEvent } from 'maplibre-gl';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import { type ExifData, exifData } from '../core/types';
import ExifInput from './ExifInput';
import { mapContainerStyles } from './LocationTab.css';

interface Loc {
  lat: number;
  lng: number;
  zoom: number;
}
const LONDON_LOC: Loc = { lat: 51.5, lng: 0, zoom: 12 } as const;

function TheMap() {
  const [initialLoc, setInitialLoc] = useState<Loc | undefined>();
  const {
    setValue,
    watch,
    formState: { disabled },
  } = useFormContext<ExifData>();

  useEffect(() => {
    load('state.json')
      .then((store) => store.get<Loc>('initialLoc'))
      .then((savedInitialLoc) => {
        setInitialLoc(savedInitialLoc ?? LONDON_LOC);
      });
  }, []);

  const onMapIdle = useCallback((e: MapLibreEvent) => {
    load('state.json')
      .then((store) => {
        const newInitialLoc: Loc = {
          ...e.target.getCenter(),
          zoom: e.target.getZoom(),
        };
        return store.set('initialLoc', newInitialLoc);
      })
      .catch((err) => {
        console.error('Failed to save new initial map location:', err);
      });
  }, []);

  if (!initialLoc) {
    return <Skeleton height="100%" width="100%" title="Loading Map" />;
  }

  const getLoc = (part: 'GPSLatitude' | 'GPSLongitude'): number => {
    const val = watch(part);
    return exifData.shape[part].safeParse(val).data ?? 0;
  };

  return (
    <MapGL
      initialViewState={{
        latitude: initialLoc.lat,
        longitude: initialLoc.lng,
        zoom: initialLoc.zoom,
      }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      onLoad={(m) => {
        m.target.setCenter({
          lat: initialLoc.lat,
          lng: initialLoc.lng,
        });
        m.target.setZoom(initialLoc.zoom);
      }}
      onClick={({ lngLat: { lat, lng } }) => {
        if (!disabled) {
          setValue('GPSLatitude', lat);
          setValue('GPSLongitude', lng);
        }
      }}
      onIdle={onMapIdle}
    >
      <Marker
        latitude={getLoc('GPSLatitude')}
        longitude={getLoc('GPSLongitude')}
        anchor="bottom"
      >
        <IconMapPinFilled />
      </Marker>
    </MapGL>
  );
}

function LocationTab() {
  return (
    <Stack h="100%">
      <div className={mapContainerStyles}>
        <TheMap />
      </div>

      <Fieldset mt="lg" legend="GPS">
        <Group gap="xs">
          <ExifInput tagName="GPSLatitude" />
          <ExifInput tagName="GPSLongitude" />
        </Group>
      </Fieldset>
    </Stack>
  );
}

export default LocationTab;
