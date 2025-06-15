import { convertFileSrc } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';

const SUPPORTED_TYPES = /jpe?g$/i;

export interface ImageInfo {
  filename: string;
  assetUrl: string;
}

export async function findImages() {
  // TODO: this will need to change to be directory false on mobile
  // but maybe support mobile so this can return the same thing?
  const path = await open({ directory: true });
  if (!path) {
    return;
  }

  const dirEntry = await readDir(path);
  const relevantFiles = dirEntry.filter((e) => {
    if (e.isFile) {
      return SUPPORTED_TYPES.test(e.name);
    }

    return false;
  });
  const images: ImageInfo[] = relevantFiles.map((f) => {
    // idk if this is very cross platform
    const assetUrl = convertFileSrc(`${path}/${f.name}`);
    return {
      assetUrl,
      filename: f.name,
    };
  });

  await emit('files-selected', { images });
}
