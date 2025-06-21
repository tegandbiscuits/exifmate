import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, writeMetadata } from '@vshirole/exiftool';
import { z } from 'zod/v4';
import { datetime, isMobile } from './util';

// need to think about how to handle if an enum gains an option
// specifically how to futureproof without needing to update if i stop maintaining
export const exifData = z.object({
  Artist: z.string().optional(),
  ImageDescription: z.string().optional(),
  Copyright: z.string().optional(),
  Software: z.string().or(z.number()).optional(),
  // UserComment: z.string(), // undef
  DateTimeOriginal: datetime.optional().meta({ inputType: 'datetime' }),
  CreateDate: datetime.meta({
    realTag: 'DateTimeDigitized',
    inputType: 'datetime',
  }),
  ModifyDate: datetime.optional().meta({ inputType: 'datetime' }),
  Make: z.string().optional(),
  Model: z.string().optional(),
  SerialNumber: z.string().optional().meta({
    realTag: 'BodySerialNumber',
  }),
  ISO: z.coerce.number().optional(),
  FNumber: z.coerce.number().optional(),
  // ShutterSpeed: z.number().optional(), // doesn't seem to want value at end // TODO: need to not save this
  FocalLength: z.coerce.number().optional(),
  FocalLengthIn35mmFormat: z.coerce.number().optional().meta({
    realTag: 'FocalLengthIn35mmFilm',
  }), // todo: is this able to be determined from focal length?
  ExposureCompensation: z.coerce.number().optional().meta({
    realTag: 'ExposureBiasValue',
  }),
  Flash: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        'No Flash': 0,
        Fired: 1,
        'Fired, Return not detected': 5,
        'Fired, Return detected': 7,
        'On, Did not fire': 8,
        'On, Fired': 9,
        'On, Return not detected': 13,
        'On, Return detected': 15,
        'Off, Did not fire': 16,
        'Off, Did not fire, Return not detected': 20,
        'Auto, Did not fire': 24,
        'Auto, Fired': 25,
        'Auto, Fired, Return not detected': 29,
        'Auto, Fired, Return detected': 31,
        'No flash function': 32,
        'Off, No flash function': 48,
        'Fired, Red-eye reduction': 65,
        'Fired, Red-eye reduction, Return not detected': 69,
        'Fired, Red-eye reduction, Return detected': 71,
        'On, Red-eye reduction': 73,
        'On, Red-eye reduction, Return not detected': 77,
        'On, Red-eye reduction, Return detected': 79,
        'Off, Red-eye reduction': 80,
        'Auto, Did not fire, Red-eye reduction': 88,
        'Auto, Fired, Red-eye reduction': 89,
        'Auto, Fired, Red-eye reduction, Return not detected': 93,
        'Auto, Fired, Red-eye reduction, Return detected': 95,
      },
    }),
  // ColorSpace: z.string(),
  MaxApertureValue: z.coerce.number().optional(),
  ExposureMode: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        Auto: 0,
        Manual: 1,
        'Auto bracket': 2,
      },
    }),
  ExposureProgram: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        'Not Defined': 0,
        Manual: 1,
        'Program AE': 2,
        'Aperture-priority AE': 3,
        'Shutter speed priority AE': 4,
        'Creative (Slow speed)': 5,
        'Action (High speed)': 6,
        Portrait: 7,
        Landscape: 8,
        Bulb: 9, // should I note this is non-standard?
      },
    }),
  ExposureTime: z.coerce.number().optional(),
  MeteringMode: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        Unknown: 0,
        Average: 1,
        'Center-weighted average': 2,
        Spot: 3,
        'Multi-spot': 4,
        'Multi-segment': 5,
        Partial: 6,
        Other: 255,
      },
    }),
  WhiteBalance: z.coerce
    .number()
    .optional()
    .meta({
      // this feels like there should be more options
      options: {
        Auto: 0,
        Manual: 1,
      },
    }),
  Saturation: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        Normal: 0,
        Low: 1,
        High: 2,
      },
    }),
  Sharpness: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        Normal: 0,
        Soft: 1,
        Hard: 2,
      },
    }),
  LensMake: z.string().optional(),
  LensModel: z.string().optional(),
  Lens: z.string().optional(),
  LensSerialNumber: z.string().optional(),
  Orientation: z.coerce
    .number()
    .optional()
    .meta({
      options: {
        'Horizontal (normal)': 1,
        'Mirror horizontal': 2,
        'Rotate 180': 3,
        'Mirror vertical': 4,
        'Mirror horizontal and rotate 270 CW': 5,
        'Rotate 90 CW': 6,
        'Mirror horizontal and rotate 90 CW': 7,
        'Rotate 270 CW': 8,
      },
    }),
  ExifImageWidth: z.coerce
    .number()
    .optional()
    .meta({ realTag: 'PixelXDimension' }),
  ExifImageHeight: z.coerce
    .number()
    .optional()
    .meta({ realTag: 'PixelYDimension' }),
  XResolution: z.coerce.number().optional(),
  YResolution: z.coerce.number().optional(),
  GPSLatitude: z.coerce.number().optional(),
  GPSLongitude: z.coerce.number().optional(),
});

export type ExifData = z.infer<typeof exifData>;

export async function readMetadata(
  filename: string,
  path: string,
): Promise<ExifData> {
  const binary = await readFile(path);
  const readTags = exifData.keyof().options.map((tag) => `-${tag}`);

  const readResult = await parseMetadata(
    { name: filename, data: binary },
    {
      // might consider dropping -n to make dates and values be more enforced by exiftool
      args: [...readTags, '-json', '-n'],
      transform: (data) => JSON.parse(data),
    },
  );

  return exifData.parseAsync(readResult.data[0]);
}

// TODO: should consider making empty values be nulled
export async function updateMetadata(
  filename: string,
  path: string,
  newData: Partial<ExifData>,
) {
  const binary = await readFile(path);

  const writeResult = await writeMetadata(
    { name: filename, data: binary },
    { tags: newData, extraArgs: ['-n'] }, // TODO: probably should validate before trying to save
  );

  // @ts-expect-error
  if (writeResult.warnings) {
    // @ts-expect-error
    console.debug(writeResult.warnings);
  }

  if (!writeResult.success) {
    throw new Error(`Failed to set metadata: ${writeResult.error}`);
  }

  if (isMobile()) {
    await writeFile(filename, writeResult.data, {
      baseDir: BaseDirectory.Document,
    });
  } else {
    writeFile(path, writeResult.data);
  }
}
