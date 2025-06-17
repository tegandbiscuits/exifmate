import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, writeMetadata } from '@vshirole/exiftool';
import { z } from 'zod/v4';
import { isMobile } from './util';

// need to think about how to handle if an enum gains an option
// specifically how to futureproof without needing to update if i stop maintaining
export const exifData = z.object({
  Artist: z.string().optional(),
  ImageDescription: z.string().optional(),
  Copyright: z.string().optional(),
  Software: z.string().or(z.number()).optional(),
  // UserComment: z.string(), // undef
  DateTimeOriginal: z.string().optional(),
  CreateDate: z.string().meta({
    realTag: 'DateTimeDigitized',
  }),
  ModifyDate: z.string().optional(),
  Make: z.string().optional(),
  Model: z.string().optional(),
  SerialNumber: z.string().optional().meta({
    realTag: 'BodySerialNumber',
  }),
  ISO: z.number().optional(),
  FNumber: z.number().optional(),
  ShutterSpeedValue: z.number().optional(),
  FocalLength: z.number().optional(),
  FocalLengthIn35mmFormat: z.number().optional().meta({
    realTag: 'FocalLengthIn35mmFilm',
  }), // todo: is this able to be determined from focal length?
  ExposureCompensation: z.number().optional().meta({
    realTag: 'ExposureBiasValue',
  }),
  Flash: z
    .number()
    // .enum([
    //   'No Flash',
    //   'Fired',
    //   'Fired, Return not detected',
    //   'Fired, Return detected',
    //   'On, Did not fire',
    //   'On, Fired',
    //   'On, Return not detected',
    //   'On, Return detected',
    //   'Off, Did not fire',
    //   'Off, Did not fire, Return not detected',
    //   'Auto, Did not fire',
    //   'Auto, Fired',
    //   'Auto, Fired, Return not detected',
    //   'Auto, Fired, Return detected',
    //   'No flash function',
    //   'Off, No flash function',
    //   'Fired, Red-eye reduction',
    //   'Fired, Red-eye reduction, Return not detected',
    //   'Fired, Red-eye reduction, Return detected',
    //   'On, Red-eye reduction',
    //   'On, Red-eye reduction, Return not detected',
    //   'On, Red-eye reduction, Return detected',
    //   'Off, Red-eye reduction',
    //   'Auto, Did not fire, Red-eye reduction',
    //   'Auto, Fired, Red-eye reduction',
    //   'Auto, Fired, Red-eye reduction, Return not detected',
    //   'Auto, Fired, Red-eye reduction, Return detected',
    // ])
    .optional(),
  // ColorSpace: z.string(),
  MaxApertureValue: z.number().optional(),
  ExposureMode: z
    .number()
    // .enum(['Auto', 'Manual', 'Auto bracket'])
    .optional(),
  ExposureProgram: z
    .number()
    // .enum([
    //   'Not Defined',
    //   'Manual',
    //   'Program AE',
    //   'Aperture-priority AE',
    //   'Shutter speed priority AE',
    //   'Creative (Slow speed)',
    //   'Action (High speed)',
    //   'Portrait',
    //   'Landscape',
    //   'Bulb',
    // ])
    .optional(),
  MeteringMode: z
    .number()
    // .enum([
    //   'Unknown',
    //   'Average',
    //   'Center-weighted average',
    //   'Spot',
    //   'Multi-spot',
    //   'Multi-segment',
    //   'Partial',
    //   'Other',
    // ])
    .optional(),
  WhiteBalance: z
    .number()
    // .enum(['Auto', 'Manual']) // need to figure out if this is always true
    .optional(),
  Saturation: z
    .number()
    // .enum(['Normal', 'Low', 'High'])
    .optional(),
  Sharpness: z
    .number()
    // .enum(['Normal', 'Soft', 'Hard'])
    .optional(),
  LensMake: z.string().optional(),
  Lens: z.string().optional(),
  LensSerialNumber: z.string().optional(),
  Orientation: z
    .number()
    // .enum([
    //   'Horizontal (normal)',
    //   'Mirror horizontal',
    //   'Rotate 180',
    //   'Mirror vertical',
    //   'Mirror horizontal and rotate 270 CW',
    //   'Rotate 90 CW',
    //   'Mirror horizontal and rotate 90 CW',
    //   'Rotate 270 CW',
    // ])
    .optional(),
  ExifImageWidth: z.number().optional().meta({ realTag: 'PixelXDimension' }),
  ExifImageHeight: z.number().optional().meta({ realTag: 'PixelYDimension' }),
  XResolution: z.number().optional(),
  YResolution: z.number().optional(),
  GPSLatitude: z.number().optional(),
  GPSLongitude: z.number().optional(),
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
      args: [...readTags, '-json', '-n'],
      transform: (data) => JSON.parse(data),
    },
  );

  return exifData.parseAsync(readResult.data[0]);
}

export async function updateMetadata(
  filename: string,
  path: string,
  newData: Partial<ExifData>,
) {
  const binary = await readFile(path);

  const writeResult = await writeMetadata(
    { name: filename, data: binary },
    { tags: newData },
  );

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
