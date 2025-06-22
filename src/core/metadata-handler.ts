import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, writeMetadata } from '@vshirole/exiftool';
import { type ExifData, exifData } from './types';
import { isMobile } from './util';

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
