import { type } from '@tauri-apps/plugin-os';
import djs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import z from 'zod/v4';

djs.extend(utc);
djs.extend(customParseFormat);

export const dayjs = djs;
export const EXIF_DATE_FORMAT = 'YYYY:MM:DD HH:mm:ss';

export const datetime = z
  .string()
  .transform((val) => {
    let digits = '';

    for (let i = 0; i < val.length; i++) {
      const char = val[i];
      const parsed = Number.parseInt(char, 10);
      if (!Number.isNaN(parsed)) {
        digits += char;
      }
    }

    return dayjs.utc(digits);
  })
  .refine((d) => d.isValid(), { error: 'Invalid date format' })
  .transform((d) => d.format(EXIF_DATE_FORMAT));

export function isMobile() {
  return type() === 'ios';
}
