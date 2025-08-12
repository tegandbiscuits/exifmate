import type {
  readFile as ReadFile,
  writeFile as WriteFile,
} from '@tauri-apps/plugin-fs';
import { fs } from 'memfs';
import { vi } from 'vitest';

export const readFile = vi.fn<typeof ReadFile>(async (path) => {
  const data = await fs.promises.readFile(path);
  if (data instanceof Buffer) {
    return new Uint8Array(data);
  }

  throw new Error('File not opened as a buffer');
});

export const writeFile = vi.fn<typeof WriteFile>(async (path, data) => {
  // @ts-expect-error
  await fs.promises.writeFile(path, data);
});
