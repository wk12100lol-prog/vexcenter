const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Reuse the same pixel generation from create-icon.js
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

function createIconRaw(w, glow) {
  const h = w;
  const raw = Buffer.alloc(w * h * 4);
  raw.fill(0);
  const cx = w/2, cy = h/2, r = w * 0.36;
  // glow
  if (glow) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < r + 12) {
          const a = Math.max(0, 1 - (dist - r + 4) / 16);
          const idx = (y * w + x) * 4;
          raw[idx] = 124; raw[idx+1] = 58; raw[idx+2] = 237; raw[idx+3] = Math.round(a * 60);
        }
      }
    }
  }
  // hex bg
  for (let y = 0; y < h; y++) {
    const xs = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      const p1x = cx + r * Math.cos(angle), p1y = cy + r * Math.sin(angle);
      const angle2 = Math.PI / 180 * (60 * (i+1) - 30);
      const p2x = cx + r * Math.cos(angle2), p2y = cy + r * Math.sin(angle2);
      if ((p1y < y && p2y >= y) || (p2y < y && p1y >= y)) {
        const t2 = (y - p1y) / (p2y - p1y);
        xs.push(p1x + t2 * (p2x - p1x));
      }
    }
    if (xs.length >= 2) {
      xs.sort((a, b) => a - b);
      for (let x = Math.round(xs[0]); x <= Math.round(xs[xs.length - 1]); x++) {
        if (x >= 0 && x < w) {
          const idx = (y * w + x) * 4;
          raw[idx] = 124; raw[idx+1] = 58; raw[idx+2] = 237; raw[idx+3] = 255;
        }
      }
    }
  }
  // triangle
  const tr = r * 0.32;
  const pts = [
    {x: cx - tr*0.5, y: cy - tr*0.866},
    {x: cx - tr*0.5, y: cy + tr*0.866},
    {x: cx + tr, y: cy},
  ];
  for (let y = 0; y < h; y++) {
    const xs2 = [];
    for (let i = 0; i < 3; i++) {
      const p1 = pts[i], p2 = pts[(i+1)%3];
      if ((p1.y < y && p2.y >= y) || (p2.y < y && p1.y >= y)) {
        const t = (y - p1.y) / (p2.y - p1.y);
        xs2.push(p1.x + t * (p2.x - p1.x));
      }
    }
    if (xs2.length >= 2) {
      xs2.sort((a, b) => a - b);
      for (let x = Math.round(xs2[0]); x <= Math.round(xs2[xs2.length - 1]); x++) {
        if (x >= 0 && x < w) {
          const idx = (y * w + x) * 4;
          raw[idx] = 236; raw[idx+1] = 72; raw[idx+2] = 153; raw[idx+3] = 255;
        }
      }
    }
  }
  return raw;
}

function makePNG(raw, w, h) {
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
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const base = path.join(__dirname, '..', 'src', 'assets', 'images');

// Create ICO with multiple sizes
const sizes = [256, 64, 48, 32, 24, 16];
const images = sizes.map(w => {
  const h = w;
  const raw = createIconRaw(w, w >= 48);
  return { w, h, data: makePNG(raw, w, h) };
});

// ICO header
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);  // reserved
header.writeUInt16LE(1, 2);  // ICO type
header.writeUInt16LE(images.length, 4);  // count

// ICO directory entries + image data
let offset = 6 + images.length * 16;
const dirs = [];
const allData = [];

for (const img of images) {
  const dir = Buffer.alloc(16);
  dir.writeUInt8(img.w === 256 ? 0 : img.w, 0);   // width (0 = 256)
  dir.writeUInt8(img.h === 256 ? 0 : img.h, 1);   // height
  dir.writeUInt8(0, 2);  // colors
  dir.writeUInt8(0, 3);  // reserved
  dir.writeUInt16LE(1, 4);  // planes
  dir.writeUInt16LE(32, 6);  // bpp
  dir.writeUInt32LE(img.data.length, 8);  // size
  dir.writeUInt32LE(offset, 12);  // offset
  dirs.push(dir);
  allData.push(img.data);
  offset += img.data.length;
}

const ico = Buffer.concat([header, ...dirs, ...allData]);
fs.writeFileSync(path.join(base, 'icon.ico'), ico);
console.log('Created icon.ico with', images.length, 'sizes');

// Also copy to installer
const instDir = path.join(__dirname, 'assets');
fs.writeFileSync(path.join(instDir, 'icon.ico'), ico);
console.log('Copied to installer/assets/icon.ico');
