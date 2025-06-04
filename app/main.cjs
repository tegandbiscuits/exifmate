const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  protocol,
  net,
} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const url = require('node:url');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg'];

async function getImages() {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (canceled) {
    return;
  }
  
  const directory = filePaths[0]

  const files = await fs.readdir(directory);
  const imageList = files.reduce((prev, filename) => {
    const ext = path.extname(filename).toLowerCase();

    if (IMAGE_EXTENSIONS.includes(ext)) {
      const url = new URL('exifmate://');
      url.pathname = path.join(directory, filename);

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
}


protocol.registerSchemesAsPrivileged([
  { scheme: 'exifmate', privileges: { bypassCSP: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
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
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+O',
          click: openDirectory,
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

  win.loadURL('http://localhost:5173')
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  protocol.handle('exifmate', (request) => {
    const encodedPath = request.url.slice('exifmate://'.length);
    const filePath = url.pathToFileURL(decodeURI(encodedPath)).toString();
    return net.fetch(filePath);
  });

  createWindow();
});
