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
    const { filePaths, canceled } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (canceled) {
      return;
    }
    
    const files = await fs.readdir(filePaths[0]);
    const imagePaths = files.reduce((prev, filename) => {
      const ext = path.extname(filename).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(ext)) {
        const url = new URL('exifmate://');
        url.pathname = path.join(filePaths[0], filename);
        return prev.concat(url.toString());
        // return prev.concat(`exifmate://${path.join(filePaths[0], filename)}`);
      }
      
      return prev;
    }, []);

    win.webContents.send('open-directory', imagePaths);
  }

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
