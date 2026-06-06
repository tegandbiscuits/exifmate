import { findImages } from '@platform/file-manager';
import { emit } from '@tauri-apps/api/event';
import { MenuItem, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { platform } from '@tauri-apps/plugin-os';

export const SAVE_METADATA_EVENT = 'editor:save-form';
export const REVEAL_IN_DIR_EVENT = 'file:reveal-in-dir';

let fileManager: string;
switch (platform()) {
  case 'macos':
    fileManager = 'Finder';
    break;
  case 'windows':
    fileManager = 'Explorer';
    break;
  default:
    fileManager = 'File Browser';
    break;
}
export const revealInDirLabel = `Reveal in ${fileManager}`;

export const revealInDirMenuItem = await MenuItem.new({
  text: revealInDirLabel,
  async action() {
    await emit(REVEAL_IN_DIR_EVENT);
  },
});

export const saveMenuItem = await MenuItem.new({
  text: 'Save',
  accelerator: 'CmdOrCtrl+s',
  enabled: false,
  async action() {
    await emit(SAVE_METADATA_EVENT);
  },
});

const FileMenu = await Submenu.new({
  text: 'File',
  items: [
    saveMenuItem,
    {
      text: 'Open...',
      accelerator: 'CmdOrCtrl+o',
      async action() {
        await findImages();
      },
    },
    await PredefinedMenuItem.new({ item: 'Separator' }),
    revealInDirMenuItem,
  ],
});

export default FileMenu;
