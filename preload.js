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
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    onStatus: (cb) => ipcRenderer.on('update:status', (_, msg) => cb(msg)),
    onAvailable: (cb) => ipcRenderer.on('update:available', (_, info) => cb(info)),
    onProgress: (cb) => ipcRenderer.on('update:progress', (_, pct) => cb(pct)),
    onDownloaded: (cb) => ipcRenderer.on('update:downloaded', () => cb()),
    onError: (cb) => ipcRenderer.on('update:error', (_, msg) => cb(msg)),
  },
  steam: {
    scan: () => ipcRenderer.invoke('steam:scan'),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  },
  onDownloadProgress: (cb) => ipcRenderer.on('download:progress', (_, pct) => cb(pct)),
  appVersion: '1.6.3',
  platform: process.platform,
});
