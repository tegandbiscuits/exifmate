import electron from 'electron';

export interface DirectoryInfo {
  directory: string;
  imageList: {
    filename: string;
    url: string;
  }[];
}

const electronAPI = {
  onOpenDirectory: (callback: (dirInfo: DirectoryInfo) => void) => {
    electron.ipcRenderer.on('open-directory', (_event, dirInfo) => callback(dirInfo));
  },
};

export type ElectronAPI = typeof electronAPI;

electron.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
