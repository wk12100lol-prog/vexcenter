const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('VexCenter', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
  api: {
    get: (endpoint) => ipcRenderer.invoke('api:get', endpoint),
    post: (endpoint, data) => ipcRenderer.invoke('api:post', endpoint, data),
    put: (endpoint, data) => ipcRenderer.invoke('api:put', endpoint, data),
    delete: (endpoint) => ipcRenderer.invoke('api:delete', endpoint),
  },
  game: {
    launch: (gameId, exePath) => ipcRenderer.invoke('game:launch', gameId, exePath),
    selectInstallPath: () => ipcRenderer.invoke('game:select-install-path'),
    selectExecutable: () => ipcRenderer.invoke('game:select-executable'),
    download: (url, destDir) => ipcRenderer.invoke('game:download', url, destDir),
    extract: (zipPath, destDir) => ipcRenderer.invoke('game:extract', zipPath, destDir),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  },
  onDownloadProgress: (cb) => ipcRenderer.on('download:progress', (_, pct) => cb(pct)),
  platform: process.platform,
});
