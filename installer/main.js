const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const https = require('https');

let mainWindow;
const REPO = 'wk12100lol-prog/vexcenter';
const DOWNLOAD_DIR = path.join(app.getPath('temp'), 'vexcenter-installer');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 680, height: 580, resizable: false, frame: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('install:check', async () => {
  try {
    return new Promise((resolve) => {
      const req = https.get(`https://api.github.com/repos/${REPO}/releases/latest`, {
        headers: { 'User-Agent': 'VexCenter-Installer', 'Accept': 'application/vnd.github.v3+json' },
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const r = JSON.parse(data);
            if (r.tag_name) {
              const asset = (r.assets || []).find(a => a.name.includes('win-unpacked') && a.name.endsWith('.zip'));
              resolve({ version: r.tag_name, downloadUrl: asset?.browser_download_url, name: asset?.name });
            } else resolve({ error: r.message || 'No release found' });
          } catch { resolve({ error: 'Invalid response' }); }
        });
      });
      req.on('error', e => resolve({ error: e.message }));
      req.end();
    });
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('install:download', async (_, url) => {
  try {
    if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    const fileName = url.split('/').pop() || 'VexCenter-win-unpacked.zip';
    const destPath = path.join(DOWNLOAD_DIR, fileName);

    return new Promise((resolve) => {
      const file = fs.createWriteStream(destPath);
      const req = https.get(url, { headers: { 'User-Agent': 'VexCenter-Installer' } }, (res) => {
        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          file.write(chunk);
          if (total > 0) {
            const pct = Math.round((downloaded / total) * 100);
            mainWindow?.webContents.send('install:progress', pct);
          }
        });
        res.on('end', () => {
          file.end();
          resolve({ success: true, path: destPath });
        });
      });
      req.on('error', e => { file.close(); fs.unlinkSync(destPath); resolve({ success: false, error: e.message }); });
      req.end();
    });
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('install:select-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Wybierz folder docelowy',
    defaultPath: 'C:\\Program Files\\VexCenter',
    properties: ['createDirectory', 'openDirectory'],
  });
  if (result.canceled) return { canceled: true };
  return { path: result.filePaths[0] };
});

ipcMain.handle('install:extract', async (_, zipPath, targetDir) => {
  try {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    return new Promise((resolve) => {
      const ps = `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${targetDir.replace(/'/g, "''")}' -Force`;
      const child = spawn('powershell.exe', ['-NoProfile', '-Command', ps], { timeout: 180000, windowsHide: true });
      let stderr = '';
      child.stderr.on('data', d => stderr += d);
      child.on('close', (code) => {
        if (code !== 0) return resolve({ success: false, error: `PowerShell exit code ${code}: ${stderr || 'unknown error'}` });
        // verify the exe was actually extracted
        const exe = path.join(targetDir, 'VexCenter.exe');
        if (!fs.existsSync(exe)) return resolve({ success: false, error: 'VexCenter.exe not found after extraction' });
        resolve({ success: true, path: targetDir });
      });
    });
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('install:create-shortcut', async (_, targetPath) => {
  try {
    const desktop = path.join(app.getPath('desktop'), 'VexCenter.lnk');
    const ps = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${desktop.replace(/'/g, "''")}'); $s.TargetPath = '${targetPath.replace(/'/g, "''")}'; $s.Description = 'VexCenter - Platforma dystrybucji gier'; $s.IconLocation = '${targetPath.replace(/'/g, "''")},0'; $s.Save();`;
    await new Promise((resolve, reject) => {
      const child = spawn('powershell.exe', ['-NoProfile', '-Command', ps], { windowsHide: true });
      child.on('close', (code) => { if (code === 0) resolve(); else reject(new Error(`Exit code ${code}`)); });
    });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('install:run-app', async (_, appPath) => {
  try {
    exec(`"${appPath}"`, (err) => {
      if (err) console.error(err);
    });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('window:close', () => app.quit());
