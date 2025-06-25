import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, writeMetadata } from '@vshirole/exiftool';
import { type ExifData, type ImageInfo, exifData } from './types';
import { aggregateExif, isMobile } from './util';

async function readImageMetadata({
  path,
  filename,
}: ImageInfo): Promise<ExifData> {
  const binary = await readFile(path);
  const readTags = exifData.keyof().options.map((tag) => `-${tag}`);

  const readResult = await parseMetadata(
    { name: filename, data: binary },
    {
      args: [...readTags, '-json', '-c', '%+.9f'],
      transform: (data) => JSON.parse(data),
    },
  );

  return exifData.parseAsync(readResult.data[0]);
}

export async function readMetadata(
  images: ImageInfo[],
): Promise<ExifData | null> {
  const reads: Promise<ExifData>[] = images.map((i) => readImageMetadata(i));
  const allMetadata = await Promise.all(reads);
  return aggregateExif(allMetadata);
}

// TODO: should consider making empty values be nulled
async function updateImageMetadata(
  { path, filename }: ImageInfo,
  newData: Partial<ExifData>,
) {
  const binary = await readFile(path);

  // TODO: need to update gps ref to handle south and east
  const writeResult = await writeMetadata(
    { name: filename, data: binary },
    { tags: newData }, // TODO: probably should validate before trying to save
  );

  // @ts-expect-error
  if (writeResult.warnings) {
    // @ts-expect-error
    console.debug(writeResult.warnings); // TODO: should notify for warnings too
  }

  if (!writeResult.success) {
    console.error('Save error:', writeResult.error);
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

// TODO: need to notify on partial failure (then use `allSettled`)
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  const updates: Promise<void>[] = images.map((i) =>
    updateImageMetadata(i, newData),
  );
  await Promise.all(updates);
}
