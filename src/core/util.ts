import { type } from '@tauri-apps/plugin-os';
import type { ExifData } from './types';

export function isMobile() {
  return type() === 'ios';
}

export function aggregateExif(items: ExifData[]): ExifData {
  const result: ExifData = {};

  if (items.length === 0) {
    return result;
  }

  const allKeys = new Set<keyof ExifData>();

  for (const item of items) {
    for (const key in item) {
      allKeys.add(key as keyof ExifData);
    }
  }

  for (const key of allKeys) {
    const commonValue = items[0][key];

    const allValuesAreSame = items.every((item) => {
      const currentValue = item[key];
      return currentValue === commonValue;
    });

    if (allValuesAreSame) {
      (result as Record<keyof ExifData, unknown>)[key] = commonValue;
    }
  }

  return result;
}
