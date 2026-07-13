const { app, BrowserWindow, ipcMain, net, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');

let mainWindow;
const ICON_PATH = path.join(__dirname, 'src', 'assets', 'images', 'icon.png');
const API_BASE = 'https://vexcenter1.vercel.app/api';

function doRequest(method, endpoint, data) {
  return new Promise((resolve) => {
    const url = API_BASE + '/' + endpoint;
    const req = net.request({ method: method.toUpperCase(), url, headers: { 'Content-Type': 'application/json' } });
    const timer = setTimeout(() => { req.destroy(); resolve({ success: false, error: 'Timeout' }); }, 10000);
    req.on('response', (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => {
        clearTimeout(timer);
        try { resolve(JSON.parse(b)); } catch { resolve({ success: false, error: 'Invalid JSON' }); }
      });
    });
    req.on('error', (e) => { clearTimeout(timer); resolve({ success: false, error: e.message }); });
    if (data && method !== 'get') req.write(JSON.stringify(data));
    req.end();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 720, minWidth: 1024, minHeight: 600,
    title: 'VexCenter', icon: ICON_PATH, frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, webSecurity: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => { if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize(); });
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('api:get', async (_, ep) => doRequest('GET', ep));
ipcMain.handle('api:post', async (_, ep, d) => doRequest('POST', ep, d));
ipcMain.handle('api:put', async (_, ep, d) => doRequest('PUT', ep, d));
ipcMain.handle('api:delete', async (_, ep) => doRequest('DELETE', ep));

ipcMain.handle('game:launch', async (_, id, exe) => {
  try { if (!fs.existsSync(exe)) return { success: false, error: 'File not found' }; exec('"'+exe+'"', (e) => e && console.error(e)); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
});
ipcMain.handle('game:select-install-path', async () => { const r = await dialog.showOpenDialog(mainWindow, {properties:['openDirectory']}); return r.canceled ? {canceled:true} : {path: r.filePaths[0]}; });
ipcMain.handle('game:select-executable', async () => { const r = await dialog.showOpenDialog(mainWindow, {properties:['openFile'], filters:[{name:'Wykonywalne', extensions:['exe','bat','cmd','lnk']},{name:'Wszystkie', extensions:['*']}]}); return r.canceled ? {canceled:true} : {path: r.filePaths[0]}; });
ipcMain.handle('shell:open-external', async (_, url) => { if (url.startsWith('http')) shell.openExternal(url); });

ipcMain.handle('game:download', async (event, url, destDir) => {
  return new Promise((resolve) => {
    try {
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const filename = path.basename(url.split('?')[0]) || 'game.zip';
      const filepath = path.join(destDir, filename);

      const protocol = url.startsWith('https') ? https : http;
      protocol.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          protocol.get(res.headers.location, (res2) => downloadStream(res2, filepath, destDir, resolve));
          return;
        }
        downloadStream(res, filepath, destDir, resolve);
      }).on('error', (e) => resolve({ success: false, error: e.message }));
    } catch (e) { resolve({ success: false, error: e.message }); }
  });
});

function downloadStream(res, filepath, destDir, resolve) {
  const total = parseInt(res.headers['content-length'] || '0', 10);
  let downloaded = 0;
  const file = fs.createWriteStream(filepath);
  res.pipe(file);
  res.on('data', (chunk) => {
    downloaded += chunk.length;
    if (total > 0 && mainWindow) {
      const pct = Math.round((downloaded / total) * 100);
      mainWindow.webContents.send('download:progress', pct);
    }
  });
  file.on('finish', () => {
    file.close();
    resolve({ success: true, path: filepath });
  });
  file.on('error', (e) => { fs.unlink(filepath, () => {}); resolve({ success: false, error: e.message }); });
}

ipcMain.handle('game:extract', async (_, zipPath, destDir) => {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, true);
    const files = [];
    function walk(dir) {
      fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full);
        else files.push(full);
      });
    }
    walk(destDir);
    return { success: true, files, extractedDir: destDir };
  } catch (e) { return { success: false, error: e.message }; }
});
