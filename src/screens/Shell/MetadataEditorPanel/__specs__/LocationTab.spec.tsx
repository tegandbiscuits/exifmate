import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { mockIPC } from '@tauri-apps/api/mocks';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import LocationTab from '../LocationTab';

vi.mock('@tauri-apps/api/menu');
vi.mock('../LocationMap', () => ({
  default: () => null,
}));

function TestContainer() {
  const form = useForm({
    resolver: zodResolver(ExifData),
  });

  return (
    <FormProvider {...form}>
      <LocationTab />
    </FormProvider>
  );
}

describe('LocationTab', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  it('has location inputs', () => {
    render(<TestContainer />);
    expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
    expect(screen.getByLabelText('GPSLongitude')).toBeVisible();
  });
});
