const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GH_TOKEN || '';
const OWNER = 'wk12100lol-prog';
const REPO = 'vexcenter';
const TAG = 'v1.0.1';

const files = [
  'dist/latest.yml',
  'dist/VexCenter Setup 1.0.1.exe',
  'dist/VexCenter Setup 1.0.1.exe.blockmap'
];

async function uploadAsset(filePath, releaseId) {
  const name = path.basename(filePath);
  const content = fs.readFileSync(filePath);
  const url = `https://uploads.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}/assets?name=${name}`;
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': content.length
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 201) resolve(JSON.parse(body));
        else reject(new Error(`HTTP ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(content);
    req.end();
  });
}

async function getReleaseByTag() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'VexCenter', 'Authorization': `token ${TOKEN}` } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(body));
        else reject(new Error(`HTTP ${res.statusCode}: ${body}`));
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    if (!TOKEN) return console.log('No GH_TOKEN set. Set it and re-run.');
    const release = await getReleaseByTag();
    const releaseId = release.id;
    console.log(`Release ID: ${releaseId}`);
    for (const f of files) {
      console.log(`Uploading ${f}...`);
      const asset = await uploadAsset(f, releaseId);
      console.log(`  OK: ${asset.name} (${asset.size} bytes)`);
    }
    console.log('Done!');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
