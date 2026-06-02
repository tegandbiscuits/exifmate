import { zodResolver } from '@hookform/resolvers/zod';
import { defaultExifData, ExifData } from '@metadata-handler/exifdata';
import { mockIPC } from '@tauri-apps/api/mocks';
import { load } from '@tauri-apps/plugin-store';
import { render, screen, waitFor } from '@testing-library/react';
import maplibregl from 'maplibre-gl';
import { act, type ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { SWRConfig } from 'swr';
import type { Mock } from 'vitest';
import LocationMap from '../LocationMap';

vi.mock('@tauri-apps/api/menu');
vi.mock('@tauri-apps/plugin-store');
vi.mock('maplibre-gl', () => {
  const MapCtor = vi.fn(function (this: unknown, options: unknown) {
    Object.assign(this as object, {
      options,
      on: vi.fn().mockReturnThis(),
      off: vi.fn(),
      setCenter: vi.fn(),
      getCenter: vi.fn(),
      getZoom: vi.fn(),
      remove: vi.fn(),
    });
  });
  const MarkerCtor = vi.fn(function (this: unknown, options: unknown = {}) {
    Object.assign(this as object, {
      options,
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
    });
  });
  return {
    default: { Map: MapCtor, Marker: MarkerCtor },
    Map: MapCtor,
    Marker: MarkerCtor,
  };
});

interface MockedMap {
  options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
  };
  on: Mock;
  off: Mock;
  setCenter: Mock;
  getCenter: Mock;
  getZoom: Mock;
  remove: Mock;
}

function getMap() {
  return vi.mocked(maplibregl.Map).mock.instances[0] as unknown as MockedMap;
}

function getMarker() {
  return vi.mocked(maplibregl.Marker).mock.instances[0];
}

function getHandler(
  map: MockedMap,
  event: string,
): ((payload: unknown) => void) | undefined {
  const call = map.on.mock.calls.find(([e]) => e === event);
  // biome-ignore lint/style/noNonNullAssertion: tests should fail loudly
  return call![1];
}

interface FormHandle {
  setValue: ReturnType<typeof useForm>['setValue'];
  reset: ReturnType<typeof useForm>['reset'];
}

const formHandleRef: { current: FormHandle | null } = { current: null };

function TestContainer({
  disabled = false,
  children,
}: {
  disabled?: boolean;
  children?: ReactNode;
}) {
  const form = useForm({
    resolver: zodResolver(ExifData),
    defaultValues: defaultExifData,
    disabled,
  });
  formHandleRef.current = { setValue: form.setValue, reset: form.reset };

  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <FormProvider {...form}>
        <LocationMap />
        {children}
      </FormProvider>
    </SWRConfig>
  );
}

function makeStore(initial?: Record<string, unknown>) {
  const data = new Map<string, unknown>(Object.entries(initial ?? {}));
  return data as unknown as Awaited<ReturnType<typeof load>>;
}

async function waitForMapWired() {
  await waitFor(() => {
    const map = getMap();
    expect(map).toBeTruthy();
    expect(map.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(map.on).toHaveBeenCalledWith('idle', expect.any(Function));
    expect(getMarker()).toBeTruthy();
  });
}

describe('LocationMap', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
    formHandleRef.current = null;
  });

  it('renders the loading skeleton while the initial location is loading', () => {
    vi.mocked(load).mockReturnValueOnce(new Promise(() => {}));
    render(<TestContainer />);
    expect(screen.getByLabelText('Loading Map')).toBeVisible();
    expect(getMap()).toBeUndefined();
  });

  it('falls back to the default location when state.json has no initialLoc', async () => {
    vi.mocked(load).mockResolvedValueOnce(makeStore());
    render(<TestContainer />);
    await waitForMapWired();
    expect(getMap().options.center).toEqual([0, 0]);
    expect(getMap().options.zoom).toBe(0);
  });

  it('initially centers and zooms to the last saved location', async () => {
    vi.mocked(load).mockResolvedValueOnce(
      makeStore({ initialLoc: { lat: 51.5, lng: -0.12, zoom: 10 } }),
    );
    render(<TestContainer />);
    await waitForMapWired();
    expect(getMap().options.center).toEqual([-0.12, 51.5]);
    expect(getMap().options.zoom).toBe(10);
  });

  describe('marker placement', () => {
    beforeEach(() => {
      vi.mocked(load).mockResolvedValueOnce(makeStore());
    });

    async function renderAndWaitForMap() {
      render(<TestContainer />);
      await waitForMapWired();
    }

    it('places the pin at the form value when both coords are set', async () => {
      await renderAndWaitForMap();
      await act(async () => {
        formHandleRef.current?.setValue('GPSLatitude', 40);
        formHandleRef.current?.setValue('GPSLongitude', -74);
      });
      await waitFor(() => {
        expect(getMarker().setLngLat).toHaveBeenCalledWith([-74, 40]);
        expect(getMarker().addTo).toHaveBeenCalled();
      });
    });

    it('updates the pin when the lat/lng change', async () => {
      await renderAndWaitForMap();
      await act(async () => {
        formHandleRef.current?.setValue('GPSLatitude', 40);
        formHandleRef.current?.setValue('GPSLongitude', -74);
      });
      await waitFor(() =>
        expect(getMarker().setLngLat).toHaveBeenLastCalledWith([-74, 40]),
      );

      await act(async () => {
        formHandleRef.current?.setValue('GPSLatitude', 41);
      });
      await waitFor(() =>
        expect(getMarker().setLngLat).toHaveBeenLastCalledWith([-74, 41]),
      );
    });

    it('does not place the pin when a non-number is entered', async () => {
      await renderAndWaitForMap();
      await act(async () => {
        formHandleRef.current?.setValue(
          'GPSLatitude',
          'some garbage' as unknown as number,
          { shouldValidate: true },
        );
        formHandleRef.current?.setValue('GPSLongitude', -74, {
          shouldValidate: true,
        });
      });
      expect(getMarker()).toBeTruthy();
      expect(getMarker().addTo).not.toHaveBeenCalled();
    });

    it('does not place the pin when neither coord is set', async () => {
      await renderAndWaitForMap();
      expect(getMarker()).toBeTruthy();
      expect(getMarker().addTo).not.toHaveBeenCalled();
    });

    it('does not place the pin when only one coord is set', async () => {
      await renderAndWaitForMap();
      await act(async () => {
        formHandleRef.current?.setValue('GPSLatitude', 40);
      });
      expect(getMarker()).toBeTruthy();
      expect(getMarker().addTo).not.toHaveBeenCalled();
    });
  });

  describe('when the map is clicked', () => {
    beforeEach(() => {
      vi.mocked(load).mockResolvedValueOnce(makeStore());
    });

    async function renderAndFireClick(lngLat: { lat: number; lng: number }) {
      render(<TestContainer />);
      await waitForMapWired();
      const map = getMap();
      const click = getHandler(map, 'click');
      await act(async () => {
        click?.({ lngLat });
      });
      return map;
    }

    it('updates the location inputs', async () => {
      function ValueProbe() {
        const { watch } = useFormContext<ExifData>();
        const lat = watch('GPSLatitude');
        const lon = watch('GPSLongitude');
        return (
          <>
            <span data-testid="lat">{String(lat)}</span>
            <span data-testid="lon">{String(lon)}</span>
          </>
        );
      }

      render(
        <TestContainer>
          <ValueProbe />
        </TestContainer>,
      );
      await waitForMapWired();

      const click = getHandler(getMap(), 'click');
      await act(async () => {
        click?.({ lngLat: { lat: 12.34, lng: 56.78 } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('lat').textContent).toBe('12.34');
        expect(screen.getByTestId('lon').textContent).toBe('56.78');
      });
    });

    it('dirties the form and triggers validation', async () => {
      function StateProbe() {
        const {
          formState: { isDirty, isValid },
        } = useFormContext<ExifData>();
        return (
          <>
            <span data-testid="dirty">{String(isDirty)}</span>
            <span data-testid="valid">{String(isValid)}</span>
          </>
        );
      }

      render(
        <TestContainer>
          <StateProbe />
        </TestContainer>,
      );
      await waitForMapWired();
      expect(screen.getByTestId('dirty').textContent).toBe('false');

      const click = getHandler(getMap(), 'click');
      await act(async () => {
        click?.({ lngLat: { lat: 12.34, lng: 56.78 } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('dirty').textContent).toBe('true');
        expect(screen.getByTestId('valid').textContent).toBe('true');
      });
    });

    it('moves the pin to the clicked location', async () => {
      await renderAndFireClick({ lat: 9, lng: 8 });
      await waitFor(() => {
        expect(getMarker().setLngLat).toHaveBeenLastCalledWith([8, 9]);
        expect(getMarker().addTo).toHaveBeenCalled();
      });
    });

    describe('when the form is disabled', () => {
      it('does nothing on click', async () => {
        render(<TestContainer disabled />);
        await waitForMapWired();

        const click = getHandler(getMap(), 'click');
        await act(async () => {
          click?.({ lngLat: { lat: 9, lng: 8 } });
        });

        expect(getMarker()).toBeTruthy();
        expect(getMarker().addTo).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the map idles', () => {
    it('persists the centered location and zoom to the app state', async () => {
      const store = makeStore({
        initialLoc: { lat: 51.5, lng: -0.12, zoom: 10 },
      });
      vi.mocked(load).mockResolvedValue(store);

      render(<TestContainer />);
      await waitForMapWired();
      const map = getMap();

      map.getCenter.mockReturnValueOnce({ lat: 1, lng: 2 });
      map.getZoom.mockReturnValueOnce(5);

      const idle = getHandler(map, 'idle');
      await act(async () => {
        idle?.({ target: map });
      });

      await waitFor(() => {
        expect(store.get('initialLoc')).toEqual({
          lat: 1,
          lng: 2,
          zoom: 5,
        });
      });
    });

    it('does not throw when the save fails', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let callCount = 0;
      vi.mocked(load).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return makeStore();
        }
        throw new Error('disk full');
      });

      render(<TestContainer />);
      await waitForMapWired();
      const map = getMap();
      const idle = getHandler(map, 'idle');

      expect(() => idle?.({ target: map })).not.toThrow();

      await waitFor(() => expect(errorSpy).toHaveBeenCalled());
      errorSpy.mockRestore();
    });
  });
});
