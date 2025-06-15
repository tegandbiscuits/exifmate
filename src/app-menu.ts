import { Menu, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";
import { findImages } from "./file-manager";

export async function createAppMenu() {
  const appMenu = await Submenu.new({
    text: 'exifmate',
    items: [
      await PredefinedMenuItem.new({ item: 'Hide' }),
      await PredefinedMenuItem.new({ item: 'HideOthers' }),
      await PredefinedMenuItem.new({ item: 'ShowAll' }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Quit' }),
    ],
  });
  
  const fileMenu = await Submenu.new({
    text: 'File',
    items: [
      {
        text: 'Open Folder...',
        accelerator: 'CmdOrCtrl+o',
        async action() {
          await findImages();
        },
      },
    ],
  });
  
  const menu = await Menu.new({
    items: [
      appMenu,
      fileMenu,
    ],
  });
  
  menu.setAsAppMenu();
}
