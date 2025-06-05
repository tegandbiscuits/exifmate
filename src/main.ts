import {
  BrowserWindow,
  Menu,
  app,
  dialog,
  net,
  protocol,
} from 'electron';
import { DirectoryInfo } from './preload';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg'];

const getImages = async (): Promise<DirectoryInfo | null> => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (canceled) {
    return null;
  }
  
  const [directory] = filePaths;

  const files = await fs.readdir(directory);
  const imageList = files.reduce((prev: DirectoryInfo['imageList'], filename) => {
    const ext = path.extname(filename).toLowerCase();

    if (IMAGE_EXTENSIONS.includes(ext)) {
      const fileURL = new URL('exifmate://');
      fileURL.pathname = path.join(directory, filename);
      
      return prev.concat({
        filename,
        url: url.toString(),
      });
    }

    return prev;
  }, []);
  
  return {
    directory,
    imageList,
  };
};

const createWindow = () => {
  const win = new BrowserWindow({
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    width: 1200,
  });
  
  const openDirectory = async () => {
    const info = await getImages();
    win.webContents.send('open-directory', info);
  };

  const menu = Menu.buildFromTemplate([
    {
      role: 'appMenu',
    },
    {
      role: 'fileMenu',
      submenu: [
        {
          accelerator: 'CmdOrCtrl+O',
          click: openDirectory,
          label: 'Open Folder',
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        { label: '' },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
  
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // win.loadURL('http://localhost:5173')
  win.webContents.openDevTools();
};

protocol.registerSchemesAsPrivileged([
  { privileges: { bypassCSP: true }, scheme: 'exifmate' },
]);

app.whenReady().then(() => {
  protocol.handle('exifmate', (request) => {
    const encodedPath = request.url.slice('exifmate://'.length);
    const filePath = url.pathToFileURL(decodeURI(encodedPath)).toString();
    return net.fetch(filePath);
  });

  createWindow();
});
