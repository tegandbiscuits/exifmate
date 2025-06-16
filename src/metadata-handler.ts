import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, TagsObject, writeMetadata } from '@vshirole/exiftool';
import { isMobile } from './util';

export async function readMetadata(filename: string, path: string) {
  const binary = await readFile(path);
  const readResult = await parseMetadata(
    { name: filename, data: binary },
    {
      args: ['-json', '-n'],
      transform: (data) => JSON.parse(data),
    },
  );
  
  return readResult.data[0];
}

export async function updateMetadata(filename: string, path: string, newData: TagsObject) {
  const binary = await readFile(path);
  // const readResult = await parseMetadata(
  //   ,
  //   {
  //     args: ['-json', '-n'],
  //     transform: (data) => JSON.parse(data),
  //   },
  // );

  const writeResult = await writeMetadata(
    { name: filename, data: binary },
    { tags: newData },
  );
  
  if (!writeResult.success) {
    throw new Error(`Failed to set metadata: ${writeResult.error}`);
  }
  
  if (isMobile()) {
    await writeFile(filename, writeResult.data, { baseDir: BaseDirectory.Document });
  } else {
    writeFile(path, writeResult.data);
  }
}
