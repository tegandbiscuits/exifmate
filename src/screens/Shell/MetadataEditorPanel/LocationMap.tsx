import { Skeleton } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import type { ExifData } from '@metadata-handler/exifdata';
import { reportError } from '@platform/error-reporter';
import { FOCUS_ON_LOCATION_EVENT } from '@platform/menus/tools-menu';
import { load } from '@tauri-apps/plugin-store';
import maplibregl, { type Map as MaplibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useFormContext } from 'react-hook-form';
import { MdLocationPin } from 'react-icons/md';
import useSWR from 'swr';
import { z } from 'zod';

const Loc = z.object({
  lat: z.number(),
  lng: z.number(),
  zoom: z.number(),
});

type Loc = z.infer<typeof Loc>;

const DEFAULT_LOC: Loc = { lat: 0, lng: 0, zoom: 0 } as const;
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';
const INITIAL_LOC_KEY = 'initialLoc';
const SWR_KEY = 'locationMap.initialLoc';

async function loadInitialLoc(): Promise<Loc> {
  try {
    const store = await load('state.json');
    const raw = await store.get(INITIAL_LOC_KEY);
    const parsed = await Loc.safeParseAsync(raw);
    return parsed.success ? parsed.data : DEFAULT_LOC;
  } catch (err) {
    reportError('Failed to load map state', err, true);
    return DEFAULT_LOC;
  }
}

function LocationPin({ map }: { map: MaplibreMap }) {
  const { watch, getFieldState } = useFormContext<ExifData>();
  const lat = watch('GPSLatitude');
  const lon = watch('GPSLongitude');
  const latInvalid = getFieldState('GPSLatitude').invalid;
  const lonInvalid = getFieldState('GPSLongitude').invalid;
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    const element = document.createElement('div');
    element.innerHTML = renderToStaticMarkup(
      <MdLocationPin color="red" size={36} />,
    );
    const marker = new maplibregl.Marker({ element });
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }

    const hasCoords =
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lon);

    if (hasCoords && !latInvalid && !lonInvalid) {
      marker.setLngLat([lon, lat]).addTo(map);
    } else {
      marker.remove();
    }
  }, [lat, lon, latInvalid, lonInvalid, map]);

  return null;
}

function MapView({ initialLoc }: { initialLoc: Loc }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLocRef = useRef(initialLoc);
  const [map, setMap] = useState<MaplibreMap | null>(null);
  const {
    setValue,
    getValues,
    formState: { disabled },
  } = useFormContext<ExifData>();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [initialLocRef.current.lng, initialLocRef.current.lat],
      zoom: initialLocRef.current.zoom,
    });
    setMap(instance);
    return () => {
      instance.remove();
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }
    const onClick = (e: { lngLat: { lat: number; lng: number } }) => {
      if (disabled) {
        return;
      }
      setValue('GPSLatitude', e.lngLat.lat, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('GPSLongitude', e.lngLat.lng, {
        shouldDirty: true,
        shouldValidate: true,
      });
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, disabled, setValue]);

  useEffect(() => {
    if (!map) {
      return;
    }
    const onIdle = (e: { target: MaplibreMap }) => {
      load('state.json')
        .then((store) => {
          const newInitialLoc: Loc = {
            ...e.target.getCenter(),
            zoom: e.target.getZoom(),
          };
          return store.set(INITIAL_LOC_KEY, newInitialLoc);
        })
        .catch((err) => {
          reportError('Failed to save initial map location', err, true);
        });
    };
    map.on('idle', onIdle);
    return () => {
      map.off('idle', onIdle);
    };
  }, [map]);

  useTauriListener(FOCUS_ON_LOCATION_EVENT, () => {
    if (!map) {
      return;
    }
    const [lat, lon] = getValues(['GPSLatitude', 'GPSLongitude']);
    if (typeof lat === 'number' && typeof lon === 'number') {
      map.setCenter([lon, lat]);
    }
  });

  return (
    <>
      <div ref={containerRef} className="h-full w-full" />
      {map && <LocationPin map={map} />}
    </>
  );
}

function LocationMap() {
  const { data, isLoading } = useSWR(SWR_KEY, loadInitialLoc, {
    revalidateOnFocus: false,
  });

  if (isLoading || !data) {
    return (
      <Skeleton aria-label="Loading Map" className="h-full w-full rounded-md" />
    );
  }

  return <MapView initialLoc={data} />;
}

export default LocationMap;
