const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const size = 256;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background rounded rect
const r = 48;
ctx.beginPath();
ctx.moveTo(r, 0);
ctx.lineTo(size - r, 0);
ctx.quadraticCurveTo(size, 0, size, r);
ctx.lineTo(size, size - r);
ctx.quadraticCurveTo(size, size, size - r, size);
ctx.lineTo(r, size);
ctx.quadraticCurveTo(0, size, 0, size - r);
ctx.lineTo(0, r);
ctx.quadraticCurveTo(0, 0, r, 0);
ctx.closePath();

const grad = ctx.createLinearGradient(0, 0, size, size);
grad.addColorStop(0, '#7c3aed');
grad.addColorStop(0.5, '#a855f7');
grad.addColorStop(1, '#ec4899');
ctx.fillStyle = grad;
ctx.fill();

// Inner cutout hexagon (dark)
const cx = size / 2;
const cy = size / 2;
const outerR = 72;
const innerR = 72 * 0.58;

ctx.beginPath();
for (let i = 0; i < 6; i++) {
  const angle = (Math.PI / 3) * i - Math.PI / 6;
  const x = cx + outerR * Math.cos(angle);
  const y = cy + outerR * Math.sin(angle);
  if (i === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
}
ctx.closePath();
ctx.fillStyle = '#0c0c18';
ctx.fill();

// Play triangle
ctx.beginPath();
const triSize = 34;
const triCx = cx;
const triCy = cy;
ctx.moveTo(triCx - triSize * 0.4, triCy - triSize * 0.55);
ctx.lineTo(triCx + triSize * 0.5, triCy);
ctx.lineTo(triCx - triSize * 0.4, triCy + triSize * 0.55);
ctx.closePath();
ctx.fillStyle = '#ffffff';
ctx.fill();

const outDir = path.join(__dirname, '..', 'src', 'assets', 'images');
fs.writeFileSync(path.join(outDir, 'icon.png'), canvas.toBuffer('image/png'));
console.log('icon.png saved');
