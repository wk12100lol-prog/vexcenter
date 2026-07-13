const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Installer', {
  check: () => ipcRenderer.invoke('install:check'),
  download: (url) => ipcRenderer.invoke('install:download', url),
  selectDir: () => ipcRenderer.invoke('install:select-dir'),
  extract: (zipPath, targetDir) => ipcRenderer.invoke('install:extract', zipPath, targetDir),
  createShortcut: (exePath) => ipcRenderer.invoke('install:create-shortcut', exePath),
  runApp: (appPath) => ipcRenderer.invoke('install:run-app', appPath),
  close: () => ipcRenderer.invoke('window:close'),
  onProgress: (cb) => ipcRenderer.on('install:progress', (_, pct) => cb(pct)),
});
