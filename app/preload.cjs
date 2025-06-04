const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onOpenDirectory: (callback) => {
    ipcRenderer.on('open-directory', (_event, imagePaths) => callback(imagePaths));
  },
});
