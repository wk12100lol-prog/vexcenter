const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (c >>> 8) ^ tbl[(c ^ buf[n]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const tbl = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  tbl[i] = c;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, t, data, crc]);
}

function drawHexagon(img, w, cx, cy, r, color) {
  const coords = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    coords.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  // fill with scanline algorithm
  for (let y = 0; y < w; y++) {
    const xs = [];
    for (let i = 0; i < 6; i++) {
      const p1 = coords[i], p2 = coords[(i + 1) % 6];
      if ((p1.y < y && p2.y >= y) || (p2.y < y && p1.y >= y)) {
        const t = (y - p1.y) / (p2.y - p1.y);
        xs.push(p1.x + t * (p2.x - p1.x));
      }
    }
    if (xs.length >= 2) {
      xs.sort((a, b) => a - b);
      for (let x = Math.round(xs[0]); x <= Math.round(xs[xs.length - 1]); x++) {
        if (x >= 0 && x < w) {
          const idx = (y * w + x) * 4;
          img[idx] = color[0]; img[idx+1] = color[1]; img[idx+2] = color[2]; img[idx+3] = color[3];
        }
      }
    }
  }
}

function createIcon(size, glow = false) {
  const w = size, h = size;
  const raw = Buffer.alloc(w * h * 4);
  for (let i = 0; i < raw.length; i++) raw[i] = 0;
  raw.fill(0);

  const cx = w / 2, cy = h / 2, r = w * 0.36;

  // glow
  if (glow) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < r + 12) {
          const a = Math.max(0, 1 - (dist - r + 4) / 16);
          const idx = (y * w + x) * 4;
          raw[idx] = 124; raw[idx+1] = 58; raw[idx+2] = 237;
          raw[idx+3] = Math.round(a * 60);
        }
      }
    }
  }

  // hexagon background (darker)
  drawHexagon(raw, w, cx, cy, r, [99, 46, 190, 255]);

  // hexagon inner (gradient simulated)
  drawHexagon(raw, w, cx, cy, r * 0.88, [124, 58, 237, 255]);

  // triangle play button
  const tr = r * 0.32;
  const pts = [
    { x: cx - tr * 0.5, y: cy - tr * 0.866 },
    { x: cx - tr * 0.5, y: cy + tr * 0.866 },
    { x: cx + tr, y: cy },
  ];
  for (let y = 0; y < h; y++) {
    const xs = [];
    for (let i = 0; i < 3; i++) {
      const p1 = pts[i], p2 = pts[(i + 1) % 3];
      if ((p1.y < y && p2.y >= y) || (p2.y < y && p1.y >= y)) {
        const t = (y - p1.y) / (p2.y - p1.y);
        xs.push(p1.x + t * (p2.x - p1.x));
      }
    }
    if (xs.length >= 2) {
      xs.sort((a, b) => a - b);
      for (let x = Math.round(xs[0]); x <= Math.round(xs[xs.length - 1]); x++) {
        if (x >= 0 && x < w) {
          const idx = (y * w + x) * 4;
          raw[idx] = 236; raw[idx+1] = 72; raw[idx+2] = 153; raw[idx+3] = 255;
        }
      }
    }
  }

  return raw;
}

function writePNG(filePath, raw, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rawSize = (w * 4 + 1) * h;
  const rawData = Buffer.alloc(rawSize);
  let off = 0;
  for (let y = 0; y < h; y++) {
    rawData[off++] = 0;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      rawData[off++] = raw[idx];
      rawData[off++] = raw[idx+1];
      rawData[off++] = raw[idx+2];
      rawData[off++] = raw[idx+3];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
  console.log('Created:', path.basename(filePath), w + 'x' + h);
}

// Create icons
const base = path.join(__dirname, '..', 'src', 'assets', 'images');
const installerAssets = path.join(__dirname, 'assets');

// App icon 256x256 with glow
const appRaw = createIcon(256, true);
writePNG(path.join(base, 'icon.png'), appRaw, 256, 256);

// Installer icon 256x256 without glow (smaller file)
const instRaw = createIcon(256, false);
writePNG(path.join(installerAssets, 'icon.png'), instRaw, 256, 256);

console.log('Done');
