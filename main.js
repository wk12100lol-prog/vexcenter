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
  try {
    if (!fs.existsSync(exe)) return { success: false, error: 'File not found' };
    if (id) doRequest('post', 'games/' + id + '/play');
    exec('"'+exe+'"', (e) => e && console.error(e));
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});
ipcMain.handle('game:select-install-path', async () => { const r = await dialog.showOpenDialog(mainWindow, {properties:['openDirectory']}); return r.canceled ? {canceled:true} : {path: r.filePaths[0]}; });
ipcMain.handle('game:select-executable', async () => { const r = await dialog.showOpenDialog(mainWindow, {properties:['openFile'], filters:[{name:'Wykonywalne', extensions:['exe','bat','cmd','lnk']},{name:'Wszystkie', extensions:['*']}]}); return r.canceled ? {canceled:true} : {path: r.filePaths[0]}; });
ipcMain.handle('shell:open-external', async (_, url) => { if (url.startsWith('http')) shell.openExternal(url); });

/* === STEAM SCAN === */
ipcMain.handle('steam:scan', async () => {
  const results = [];
  const commonPaths = [
    'C:\\Program Files (x86)\\Steam',
    'C:\\Program Files\\Steam',
  ];
  const scanned = new Set();

  for (const basePath of commonPaths) {
    const steamApps = path.join(basePath, 'steamapps');
    if (!fs.existsSync(steamApps)) continue;

    // Read libraryfolders.vdf for additional libraries
    const lfPath = path.join(steamApps, 'libraryfolders.vdf');
    const extraLibs = [];
    if (fs.existsSync(lfPath)) {
      const vdf = fs.readFileSync(lfPath, 'utf8');
      const matches = vdf.match(/"path"\s+"([^"]+)"/g);
      if (matches) {
        matches.forEach(m => {
          const p = m.match(/"path"\s+"([^"]+)"/)?.[1];
          if (p && p !== basePath) extraLibs.push(p);
        });
      }
    }

    const allLibs = [basePath, ...extraLibs];
    for (const lib of allLibs) {
      const libSteamApps = path.join(lib, 'steamapps');
      if (!fs.existsSync(libSteamApps) || scanned.has(libSteamApps)) continue;
      scanned.add(libSteamApps);

      const commonDir = path.join(libSteamApps, 'common');

      // Read ACF files
      let files;
      try { files = fs.readdirSync(libSteamApps); } catch { continue; }

      for (const file of files) {
        if (!file.startsWith('appmanifest_') || !file.endsWith('.acf')) continue;
        const acfPath = path.join(libSteamApps, file);
        try {
          const acf = fs.readFileSync(acfPath, 'utf8');
          const appid = file.match(/appmanifest_(\d+)\.acf/)?.[1];
          const name = acf.match(/"name"\s+"([^"]+)"/)?.[1];
          const installdir = acf.match(/"installdir"\s+"([^"]+)"/)?.[1];
          if (!name || !appid) continue;

          let exePath = '';
          if (installdir) {
            const gameDir = path.join(commonDir, installdir);
            if (fs.existsSync(gameDir)) {
              // Look for .exe files
              try {
                const gameFiles = fs.readdirSync(gameDir);
                const exeFiles = gameFiles.filter(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('unins'));
                if (exeFiles.length > 0) {
                  // Prefer the one matching the game name, else first exe
                  const best = exeFiles.find(f => f.toLowerCase().includes(name.toLowerCase())) || exeFiles[0];
                  exePath = path.join(gameDir, best);
                }
              } catch {}
            }
          }

          results.push({ steam_id: parseInt(appid), title: name, exe: exePath });
        } catch {}
      }
    }
  }

  return { games: results };
});

const DOWNLOADS_FILE = path.join(app.getPath('userData'), 'downloads.json');
let downloadsStore = {};
try { if (fs.existsSync(DOWNLOADS_FILE)) downloadsStore = JSON.parse(fs.readFileSync(DOWNLOADS_FILE, 'utf8')); } catch {}
function saveDownloads() { try { fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(downloadsStore, null, 2)); } catch {} }
function sendDownloadsUpdate() { if (mainWindow) mainWindow.webContents.send('downloads:update', downloadsStore); }
const activeRequests = {};

function downloadStream(res, filepath, resolve, downloadId) {
  const total = parseInt(res.headers['content-length'] || '0', 10);
  const file = fs.createWriteStream(filepath, { flags: 'a' });
  if (downloadsStore[downloadId]) downloadsStore[downloadId].totalSize = total;
  res.pipe(file);
  res.on('data', (chunk) => {
    if (downloadsStore[downloadId]) {
      downloadsStore[downloadId].downloadedBytes = (downloadsStore[downloadId].downloadedBytes || 0) + chunk.length;
      const ts = downloadsStore[downloadId].totalSize || 1;
      downloadsStore[downloadId].progress = Math.min(99, Math.round((downloadsStore[downloadId].downloadedBytes / ts) * 100));
    }
  });
  res.on('end', () => { if (downloadsStore[downloadId]) { downloadsStore[downloadId].progress = 100; downloadsStore[downloadId].state = 'completed'; saveDownloads(); sendDownloadsUpdate(); } });
  file.on('finish', () => { file.close(); resolve({ success: true, path: filepath }); });
  file.on('error', (e) => { fs.unlink(filepath, () => {}); if (downloadsStore[downloadId]) { downloadsStore[downloadId].state = 'failed'; downloadsStore[downloadId].error = e.message; saveDownloads(); sendDownloadsUpdate(); } resolve({ success: false, error: e.message }); });
}

ipcMain.handle('game:download', async (event, url, destDir) => {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const downloadId = crypto.randomUUID();
    const filename = path.basename(url.split('?')[0].split('#')[0]) || 'game.zip';
    downloadsStore[downloadId] = { id: downloadId, url, destDir, filepath: path.join(destDir, filename), filename, state: 'downloading', progress: 0, downloadedBytes: 0, totalSize: 0, startedAt: new Date().toISOString(), title: filename };
    saveDownloads(); sendDownloadsUpdate();
    return { ...(await downloadWithHostHandler(url, destDir, downloadId)), downloadId };
  } catch (e) {
    const downloadId = crypto.randomUUID();
    downloadsStore[downloadId] = { id: downloadId, url, destDir, state: 'failed', error: e.message, startedAt: new Date().toISOString() };
    saveDownloads(); sendDownloadsUpdate();
    return { success: false, error: e.message, downloadId };
  }
});

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { fetchPage(res.headers.location).then(resolve).catch(reject); return; }
      let data = ''; res.on('data', (c) => data += c); res.on('end', () => resolve(data)); res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadWithHostHandler(url, destDir, downloadId) {
  const host = new URL(url).hostname.toLowerCase();
  let targetUrl = url;
  if (host.includes('mediafire.com')) {
    const html = await fetchPage(url);
    const pp = [/aria-label="Download file".*?href="(https:[^"]+)"/,/id="downloadButton".*?href="(https:[^"]+)"/,/href="(https:\/\/download[^"]+)"/,/"(https:\/\/[^"]*mediafire[^"]*download[^"]*)"/,/kno\.textContent\s*=\s*'([^']+)'/];
    for (const p of pp) { const m = html.match(p); if (m) { targetUrl = m[1].replace(/&amp;/g, '&'); break; } }
    if (targetUrl === url) return { success: false, error: 'Nie można znaleźć linku do pobrania z MediaFire.' };
  } else if (host.includes('drive.google.com')||host.includes('googleusercontent.com')) { const f = url.match(/[-\w]{25,}/)?.[0]; if (!f) return { success: false, error: 'Nieprawidłowy link Google Drive' }; targetUrl = `https://drive.usercontent.google.com/download?id=${f}&export=download&confirm=t`; }
  else if (host.includes('dropbox.com')) { targetUrl = url + (url.includes('?')?'&':'?') + 'dl=1'; }
  else if (['bzzhr.to','buzzheavier.com','bzzhr.co','fuckingfast.net','fuckingfast.co'].some(d=>host.includes(d))) { targetUrl = url.replace(/\/?$/, '/download'); let dl = await directDownload(targetUrl, destDir, downloadId); if (!dl.success) { const h = await fetchPage(url); const m = h.match(/href="([^"]+)"[^>]*download/i)||h.match(/"(https:\/\/[^"]+\/(file|d)\/[^"]+)"/); if (m) { targetUrl = m[1]; dl = await directDownload(targetUrl, destDir, downloadId); } } return dl; }
  else if (host.includes('1fichier.com')) { const h = await fetchPage(url); const m = h.match(/href="(https:\/\/[^"]+1fichier[^"]+)"[^>]*>Download/); if (m) targetUrl = m[1]; }
  else if (host.includes('uploaded.net')||host.includes('uploaded.to')) { const m = url.match(/file\/([a-zA-Z0-9]+)/); if (m) targetUrl = `https://uploaded.net/file/${m[1]}/download`; }
  return await directDownload(targetUrl, destDir, downloadId);
}

async function directDownload(url, destDir, downloadId) {
  return new Promise((resolve) => {
    try {
      if (!downloadsStore[downloadId]) return resolve({ success: false, error: 'Anulowano' });
      const filepath = downloadsStore[downloadId].filepath;
      const existingSize = fs.existsSync(filepath) ? fs.statSync(filepath).size : 0;
      downloadsStore[downloadId].downloadedBytes = existingSize;
      const proto = url.startsWith('https')?https:http;
      const opts = { headers: {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}};
      if (existingSize>0) opts.headers.Range = 'bytes='+existingSize+'-';
      const req = proto.get(url, opts, (res) => {
        if (existingSize>0 && res.statusCode===416) { fs.unlinkSync(filepath); downloadsStore[downloadId].downloadedBytes=0; const r2=proto.get(url, opts, (r)=>{downloadStream(r,filepath,resolve,downloadId);}); activeRequests[downloadId]=r2; return; }
        if (existingSize>0 && res.statusCode===206 && downloadsStore[downloadId]) downloadsStore[downloadId].resumedFrom=existingSize;
        if (downloadsStore[downloadId]) downloadsStore[downloadId].totalSize=existingSize+parseInt(res.headers['content-length']||'0',10);
        let redir=0;
        function handle(resp) {
          if (resp.statusCode>=300 && resp.statusCode<400 && resp.headers.location && redir<5) { redir++; const to=resp.headers.location.startsWith('http')?resp.headers.location:new URL(resp.headers.location,url).href; const r2=proto.get(to,opts,handle).on('error',(e)=>resolve({success:false,error:e.message})); activeRequests[downloadId]=r2; return; }
          downloadStream(resp,filepath,resolve,downloadId);
        }
        handle(res);
      });
      activeRequests[downloadId]=req;
      req.on('error',(e)=>{if(e.message.includes('aborted')&&downloadsStore[downloadId]?.state==='paused')resolve({success:false,paused:true,path:filepath}); else{if(downloadsStore[downloadId]){downloadsStore[downloadId].state='failed';downloadsStore[downloadId].error=e.message;saveDownloads();sendDownloadsUpdate();}resolve({success:false,error:e.message});}});
    } catch(e){if(downloadsStore[downloadId]){downloadsStore[downloadId].state='failed';downloadsStore[downloadId].error=e.message;saveDownloads();sendDownloadsUpdate();}resolve({success:false,error:e.message});}
  });
}

ipcMain.handle('download:pause', (_, id)=>{if(!downloadsStore[id]||downloadsStore[id].state!=='downloading')return{success:false};if(activeRequests[id]){activeRequests[id].destroy?.();delete activeRequests[id];}downloadsStore[id].state='paused';saveDownloads();sendDownloadsUpdate();return{success:true};});
ipcMain.handle('download:resume', async (_,id)=>{if(!downloadsStore[id]||downloadsStore[id].state!=='paused')return{success:false};downloadsStore[id].state='downloading';downloadsStore[id].error=null;saveDownloads();sendDownloadsUpdate();const r=await directDownload(downloadsStore[id].url,downloadsStore[id].destDir,id);if(r.success){downloadsStore[id].state='completed';downloadsStore[id].progress=100;saveDownloads();sendDownloadsUpdate();}else if(!r.paused){downloadsStore[id].state='failed';downloadsStore[id].error=r.error;saveDownloads();sendDownloadsUpdate();}return r;});
ipcMain.handle('download:cancel', (_,id)=>{if(!downloadsStore[id])return{success:false};if(activeRequests[id]){activeRequests[id].destroy?.();delete activeRequests[id];}if(downloadsStore[id].filepath&&fs.existsSync(downloadsStore[id].filepath))try{fs.unlinkSync(downloadsStore[id].filepath)}catch{}delete downloadsStore[id];saveDownloads();sendDownloadsUpdate();return{success:true};});
ipcMain.handle('download:list', ()=>Object.values(downloadsStore));

const activeRequests = {};

ipcMain.handle('game:download', async (event, url, destDir) => {
  try {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const downloadId = crypto.randomUUID();
    downloadsStore[downloadId] = { id: downloadId, url, destDir, state: 'downloading', progress: 0, startedAt: new Date().toISOString(), title: path.basename(url.split('?')[0]) || 'game.zip' };
    saveDownloads(); sendDownloadsUpdate();
    const result = await downloadWithHostHandler(url, destDir, downloadId);
    return { ...result, downloadId };
  } catch (e) {
    const downloadId = crypto.randomUUID();
    downloadsStore[downloadId] = { id: downloadId, url, destDir, state: 'failed', error: e.message, startedAt: new Date().toISOString(), title: path.basename(url.split('?')[0]) || 'game.zip' };
    saveDownloads(); sendDownloadsUpdate();
    return { success: false, error: e.message, downloadId };
  }
});

async function downloadWithHostHandler(url, destDir, downloadId) {
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
    let dl = await directDownload(targetUrl, destDir, downloadId);
    if (!dl.success) {
      const html = await fetchPage(url);
      const m = html.match(/href="([^"]+)"[^>]*download/i) || html.match(/"(https:\/\/[^"]+\/(file|d)\/[^"]+)"/);
      if (m) { targetUrl = m[1]; dl = await directDownload(targetUrl, destDir, downloadId); }
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

  return await directDownload(targetUrl, destDir, downloadId);
}

async function directDownload(url, destDir, downloadId) {
  return new Promise((resolve) => {
    try {
      const filename = path.basename(url.split('?')[0].split('#')[0]) || 'game.zip';
      const filepath = path.join(destDir, filename);
      if (downloadsStore[downloadId]) { downloadsStore[downloadId].filepath = filepath; downloadsStore[downloadId].filename = filename; saveDownloads(); sendDownloadsUpdate(); }
      const existingSize = fs.existsSync(filepath) ? fs.statSync(filepath).size : 0;
      const proto = url.startsWith('https') ? https : http;
      const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } };
      if (existingSize > 0) opts.headers.Range = 'bytes=' + existingSize + '-';
      const req = proto.get(url, opts, (res) => {
        if (existingSize > 0 && res.statusCode === 416) {
          fs.unlinkSync(filepath);
          const req2 = proto.get(url, opts, (res2) => {
            if (downloadsStore[downloadId]) { downloadsStore[downloadId].resumedFrom = 0; }
            downloadStream(res2, filepath, resolve, downloadId);
          });
          activeRequests[downloadId] = req2;
          return;
        }
        if (existingSize > 0 && res.statusCode === 206) {
          if (downloadsStore[downloadId]) { downloadsStore[downloadId].resumedFrom = existingSize; }
        }
        if (downloadsStore[downloadId]) { downloadsStore[downloadId].totalSize = existingSize + parseInt(res.headers['content-length'] || '0', 10); }
        let redir = 0;
        function handle(resp) {
          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location && redir < 5) {
            redir++;
            const redirectTo = resp.headers.location.startsWith('http') ? resp.headers.location : new URL(resp.headers.location, url).href;
            const req2 = proto.get(redirectTo, opts, handle).on('error', (e) => resolve({ success: false, error: e.message }));
            activeRequests[downloadId] = req2;
            return;
          }
          downloadStream(resp, filepath, resolve, downloadId);
        }
        handle(res);
      });
      activeRequests[downloadId] = req;
      req.on('error', (e) => {
        if (e.message.includes('aborted') && downloadsStore[downloadId]?.state === 'paused') {
          resolve({ success: false, paused: true, path: filepath });
        } else {
          if (downloadsStore[downloadId]) { downloadsStore[downloadId].state = 'failed'; downloadsStore[downloadId].error = e.message; saveDownloads(); sendDownloadsUpdate(); }
          resolve({ success: false, error: e.message });
        }
      });
    } catch (e) {
      if (downloadsStore[downloadId]) { downloadsStore[downloadId].state = 'failed'; downloadsStore[downloadId].error = e.message; saveDownloads(); sendDownloadsUpdate(); }
      resolve({ success: false, error: e.message });
    }
  });
}

ipcMain.handle('download:pause', (_, downloadId) => {
  if (!downloadsStore[downloadId]) return { success: false, error: 'Download not found' };
  if (downloadsStore[downloadId].state !== 'downloading') return { success: false, error: 'Not downloading' };
  if (activeRequests[downloadId]) { activeRequests[downloadId].destroy(); delete activeRequests[downloadId]; }
  downloadsStore[downloadId].state = 'paused';
  saveDownloads(); sendDownloadsUpdate();
  return { success: true };
});

ipcMain.handle('download:resume', async (_, downloadId) => {
  if (!downloadsStore[downloadId]) return { success: false, error: 'Download not found' };
  if (downloadsStore[downloadId].state !== 'paused') return { success: false, error: 'Not paused' };
  downloadsStore[downloadId].state = 'downloading';
  downloadsStore[downloadId].error = null;
  saveDownloads(); sendDownloadsUpdate();
  const d = downloadsStore[downloadId];
  const result = await directDownload(d.url, d.destDir, downloadId);
  if (result.success) { downloadsStore[downloadId].state = 'completed'; downloadsStore[downloadId].progress = 100; }
  else if (!result.paused) { downloadsStore[downloadId].state = 'failed'; downloadsStore[downloadId].error = result.error; }
  saveDownloads(); sendDownloadsUpdate();
  return result;
});

ipcMain.handle('download:cancel', (_, downloadId) => {
  if (!downloadsStore[downloadId]) return { success: false, error: 'Download not found' };
  if (activeRequests[downloadId]) { activeRequests[downloadId].destroy(); delete activeRequests[downloadId]; }
  if (downloadsStore[downloadId].filepath && fs.existsSync(downloadsStore[downloadId].filepath)) {
    try { fs.unlinkSync(downloadsStore[downloadId].filepath); } catch {}
  }
  delete downloadsStore[downloadId];
  saveDownloads(); sendDownloadsUpdate();
  return { success: true };
});

ipcMain.handle('download:list', () => {
  return Object.values(downloadsStore);
});

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
