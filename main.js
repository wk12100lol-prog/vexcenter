const { app, BrowserWindow, ipcMain, net, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');
const { autoUpdater } = require('electron-updater');

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

app.whenReady().then(() => {
  createWindow();
  initAutoUpdater();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

function initAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update:status', 'Sprawdzanie aktualizacji...');
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update:available', info);
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update:status', 'Aplikacja jest aktualna');
  });

  autoUpdater.on('download-progress', (p) => {
    mainWindow?.webContents.send('update:progress', p.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update:downloaded');
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater]', err?.message || err);
    mainWindow?.webContents.send('update:error', err?.message || err);
  });

  setTimeout(() => {
    try { autoUpdater.checkForUpdates(); } catch {}
  }, 5000);
}

ipcMain.handle('update:check', async () => {
  try { await autoUpdater.checkForUpdates(); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('update:download', async () => {
  try { autoUpdater.downloadUpdate(); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('update:install', async () => {
  try { autoUpdater.quitAndInstall(); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
});

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
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    return await downloadWithHostHandler(url, destDir);
  } catch (e) { return { success: false, error: e.message }; }
});

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchPage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadWithHostHandler(url, destDir) {
  const host = new URL(url).hostname.toLowerCase();
  let targetUrl = url;

  if (host.includes('mediafire.com')) {
    const html = await fetchPage(url);
    const patterns = [
      /aria-label="Download file".*?href="(https:[^"]+)"/,
      /id="downloadButton".*?href="(https:[^"]+)"/,
      /href="(https:\/\/download[^"]+)"/,
      /"(https:\/\/[^"]*mediafire[^"]*download[^"]*)"/,
      /kno\.textContent\s*=\s*'([^']+)'/,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) { targetUrl = m[1].replace(/&amp;/g, '&'); break; }
    }
    if (targetUrl === url) return { success: false, error: 'Nie można znaleźć linku do pobrania z MediaFire. Strona może wymagać interakcji.' };
  } else if (host.includes('drive.google.com') || host.includes('googleusercontent.com')) {
    const fileId = url.match(/[-\w]{25,}/)?.[0];
    if (!fileId) return { success: false, error: 'Nieprawidłowy link Google Drive' };
    targetUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  } else if (host.includes('dropbox.com')) {
    targetUrl = url + (url.includes('?') ? '&' : '?') + 'dl=1';
  } else if (['bzzhr.to', 'buzzheavier.com', 'bzzhr.co', 'fuckingfast.net', 'fuckingfast.co'].some(d => host.includes(d))) {
    targetUrl = url.replace(/\/?$/, '/download');
    let dl = await directDownload(targetUrl, destDir);
    if (!dl.success) {
      const html = await fetchPage(url);
      const m = html.match(/href="([^"]+)"[^>]*download/i) || html.match(/"(https:\/\/[^"]+\/(file|d)\/[^"]+)"/);
      if (m) { targetUrl = m[1]; dl = await directDownload(targetUrl, destDir); }
    }
    return dl;
  } else if (host.includes('1fichier.com')) {
    const html = await fetchPage(url);
    const m = html.match(/href="(https:\/\/[^"]+1fichier[^"]+)"[^>]*>Download/);
    if (m) targetUrl = m[1];
  } else if (host.includes('uploaded.net') || host.includes('uploaded.to')) {
    const m = url.match(/file\/([a-zA-Z0-9]+)/);
    if (m) targetUrl = `https://uploaded.net/file/${m[1]}/download`;
  }

  return await directDownload(targetUrl, destDir);
}

async function directDownload(url, destDir) {
  return new Promise((resolve) => {
    try {
      const filename = path.basename(url.split('?')[0].split('#')[0]) || 'game.zip';
      const filepath = path.join(destDir, filename);
      const proto = url.startsWith('https') ? https : http;
      const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } };
      proto.get(url, opts, (res) => {
        let redir = 0;
        function handle(resp) {
          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location && redir < 5) {
            redir++;
            const redirectTo = resp.headers.location.startsWith('http') ? resp.headers.location : new URL(resp.headers.location, url).href;
            proto.get(redirectTo, opts, handle).on('error', (e) => resolve({ success: false, error: e.message }));
            return;
          }
          downloadStream(resp, filepath, resolve);
        }
        handle(res);
      }).on('error', (e) => resolve({ success: false, error: e.message }));
    } catch (e) { resolve({ success: false, error: e.message }); }
  });
}

function downloadStream(res, filepath, resolve) {
  const total = parseInt(res.headers['content-length'] || '0', 10);
  let downloaded = 0;
  const file = fs.createWriteStream(filepath);
  res.pipe(file);
  res.on('data', (chunk) => {
    downloaded += chunk.length;
    if (total > 0 && mainWindow) mainWindow.webContents.send('download:progress', Math.round((downloaded / total) * 100));
  });
  file.on('finish', () => { file.close(); resolve({ success: true, path: filepath }); });
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
