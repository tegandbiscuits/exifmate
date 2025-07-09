import nodeFs from 'node:fs/promises';
import type { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { fs } from 'memfs';
import { readMetadata, updateMetadata } from '../metadata-handler';
import type { ImageInfo } from '../types';
import { ImageOne, ImageTwo } from './fake-images';

vi.mock(import('@tauri-apps/plugin-fs'), async (importOriginal) => {
  const { fs } = await import('memfs');
  const mod = await importOriginal();

  const mockReadFile = vi.fn<typeof readFile>(async (path) => {
    const data = await fs.promises.readFile(path);
    if (data instanceof Buffer) {
      return new Uint8Array(data);
    }

    throw new Error('File not opened as a buffer');
  });

  const mockWriteFile = vi.fn<typeof writeFile>(async (path, data) => {
    // @ts-expect-error
    await fs.promises.writeFile(path, data);
  });

  return {
    ...mod,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  };
});

vi.mock(import('../util'), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    isMobile: vi.fn().mockReturnValue(false),
  };
});

vi.stubGlobal('fetch', async (url: string) => {
  if (url.includes('zeroperl-1.0.0.wasm')) {
    const zeroperl = await nodeFs.readFile('./vendor/zeroperl-1.0.0.wasm');
    if (zeroperl instanceof Buffer) {
      return new Response(zeroperl, {
        headers: { 'Content-Type': 'application/wasm' },
      });
    }
  }

  throw `Unhandled url called: ${url}`;
});

describe('readMetadata', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);
  });

  test.each([
    {
      file: 'image-one.jpg',
      expectedData: {
        Make: 'Test',
        Model: 'Test Model',
        CreateDate: '2025-06-23 11:00:00',
      },
    },
    {
      file: 'image-two.jpg',
      expectedData: {
        Make: 'Test',
        CreateDate: '2025-06-23 12:00:00',
      },
    },
  ])('can read the metadata from an image', async ({ file, expectedData }) => {
    const exif = await readMetadata([
      { path: `/${file}`, filename: file, assetUrl: '' },
    ]);

    expect(exif).toEqual(expectedData);
  });

  describe('when reading multiple images', () => {
    it('aggregates the common metadata of images', async () => {
      const exif = await readMetadata([
        { path: '/image-one.jpg', filename: 'image-one', assetUrl: '' },
        { path: '/image-two.jpg', filename: 'image-two', assetUrl: '' },
      ]);

      // undefined is treated as different
      expect(exif).toEqual({ Make: 'Test' });
    });
  });

  describe('when exiftool was unsuccessful', () => {
    it('can notify of that', async () => {
      await expect(async () => {
        await readMetadata([
          { path: '/image-one.jpg', filename: '', assetUrl: '' },
        ]);
      }).rejects.toThrowError('Failed to read exif data for /image-one.jpg');
    });
  });

  describe('when there is warnings from reading images', () => {
    it.todo('can notify of warnings parsing images');
  });

  describe('when there is invalid metadata', () => {
    it.todo('warns the user instead of erroring');
  });
});

describe('updateMetadata', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);
  });

  it('updates the metadata for the given images', async () => {
    const images: ImageInfo[] = [
      { path: '/image-one.jpg', filename: 'one', assetUrl: '' },
      { path: '/image-two.jpg', filename: 'two', assetUrl: '' },
    ];
    await updateMetadata(images, { FNumber: '2' });

    const exif = await readMetadata(images);
    expect(exif).toEqual(
      expect.objectContaining({ FNumber: '2', Make: 'Test' }),
    );
  });

  describe('when an image fails to save', () => {
    it.todo('indicates the error');
  });

  describe('when there is a warning', () => {
    it.todo('warns of the warning')
  });

  describe('when GPSLatitude or GPSLongitude is set', () => {
    it.todo('updates the respective ref');
  });
});
