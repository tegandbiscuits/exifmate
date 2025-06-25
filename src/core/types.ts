import { z } from 'zod/v4';
import dayjs from './dayjs';

// For some reason the `-dateFormat` flag wasn't getting respected
const exifdatetime = z
  .string()
  .transform((val) => dayjs.utc(val, 'YYYY:MM:DD HH:mm:ss'))
  .refine((d) => d.isValid(), { error: 'Invalid date format' })
  .transform((d) => d.format('YYYY-MM-DD HH:mm:ss'));

export interface ImageInfo {
  filename: string;
  assetUrl: string;
  path: string;
}

// need to think about how to handle if an enum gains an option
// specifically how to futureproof without needing to update if i stop maintaining
export const exifData = z.object({
  Artist: z.string().optional(),
  ImageDescription: z.string().optional(),
  Copyright: z.string().optional(),
  Software: z.string().or(z.number()).optional(),
  // UserComment: z.string(), // undef
  DateTimeOriginal: exifdatetime.optional(),
  CreateDate: exifdatetime.optional().meta({
    realTag: 'DateTimeDigitized',
  }),
  ModifyDate: exifdatetime.optional(),
  Make: z.string().optional(),
  Model: z.string().optional(),
  SerialNumber: z.string().optional().meta({
    realTag: 'BodySerialNumber',
  }),
  ISO: z.coerce.number().optional(),
  FNumber: z.coerce.string().optional(),
  // ShutterSpeed: z.number().optional(), // doesn't seem to want value at end // TODO: need to not save this
  FocalLength: z.string().optional(),
  FocalLengthIn35mmFormat: z.string().optional().meta({
    realTag: 'FocalLengthIn35mmFilm',
  }), // todo: is this able to be determined from focal length?
  ExposureCompensation: z.coerce.number().optional().meta({
    realTag: 'ExposureBiasValue',
  }),
  Flash: z
    .enum([
      'No Flash',
      'Fired',
      'Fired, Return not detected',
      'Fired, Return detected',
      'On, Did not fire',
      'On, Fired',
      'On, Return not detected',
      'On, Return detected',
      'Off, Did not fire',
      'Off, Did not fire, Return not detected',
      'Auto, Did not fire',
      'Auto, Fired',
      'Auto, Fired, Return not detected',
      'Auto, Fired, Return detected',
      'No flash function',
      'Off, No flash function',
      'Fired, Red-eye reduction',
      'Fired, Red-eye reduction, Return not detected',
      'Fired, Red-eye reduction, Return detected',
      'On, Red-eye reduction',
      'On, Red-eye reduction, Return not detected',
      'On, Red-eye reduction, Return detected',
      'Off, Red-eye reduction',
      'Auto, Did not fire, Red-eye reduction',
      'Auto, Fired, Red-eye reduction',
      'Auto, Fired, Red-eye reduction, Return not detected',
      'Auto, Fired, Red-eye reduction, Return detected',
    ])
    .optional(),
  // ColorSpace: z.string(),
  MaxApertureValue: z.coerce.number().optional(),
  ExposureMode: z.enum(['Auto', 'Manual', 'Auto bracket']).optional(),
  ExposureProgram: z
    .enum([
      'Not Defined',
      'Manual',
      'Program AE',
      'Aperture-priority AE',
      'Shutter speed priority AE',
      'Creative (Slow speed)',
      'Action (High speed)',
      'Portrait',
      'Landscape',
      'Bulb', // should I note this is non-standard?
    ])
    .optional(),
  ExposureTime: z.string().or(z.number()).optional(),
  MeteringMode: z
    .enum([
      'Unknown',
      'Average',
      'Center-weighted average',
      'Spot',
      'Multi-spot',
      'Multi-segment',
      'Partial',
      'Other',
    ])
    .optional(),
  WhiteBalance: z.enum(['Auto', 'Manual']).optional(),
  Saturation: z.enum(['Normal', 'Low', 'High']).optional(),
  Sharpness: z.enum(['Normal', 'Soft', 'Hard']).optional(),
  LensMake: z.string().optional(),
  LensModel: z.string().optional(),
  Lens: z.string().optional(),
  LensSerialNumber: z.string().optional(),
  Orientation: z
    .enum([
      'Horizontal (normal)',
      'Mirror horizontal',
      'Rotate 180',
      'Mirror vertical',
      'Mirror horizontal and rotate 270 CW',
      'Rotate 90 CW',
      'Mirror horizontal and rotate 90 CW',
      'Rotate 270 CW',
    ])
    .optional(),
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
