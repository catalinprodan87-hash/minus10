// make-icons.js — generates real PNG icons with ZERO npm dependencies.
// Run once with:  node make-icons.js
// Produces: icon-192.png, icon-512.png, apple-touch-icon.png (180x180)
//
// Why this exists: iOS "Add to Home Screen" needs REAL .png files (it ignores
// data-URI / inline icons). We don't want an npm dependency (no build step), so
// we encode the PNG by hand. The only hard part — DEFLATE compression — is done
// by Node's built-in `zlib`. Everything else (IHDR/IDAT/IEND chunks + CRC) is
// plain bytes.
//
// Design: emerald gradient square with a white downward arrow = "weight down".
// Full-bleed background (no transparent corners) so iOS rounds it nicely and
// Android maskable fills the whole tile.

const fs = require('fs');
const zlib = require('zlib');

// ---- CRC32 (needed for every PNG chunk) ----------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ---- write one PNG chunk (length + type + data + crc) ---------------------
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// ---- encode an RGBA pixel buffer as a PNG ---------------------------------
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type 6 = RGBA
  // ihdr[10..12] = 0 (compression / filter / interlace defaults)

  // raw scanlines: each row is prefixed with a filter byte (0 = none)
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter type 0
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- draw the icon into an RGBA buffer ------------------------------------
function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;

  // Arrow geometry, all as fractions of the icon size so it scales cleanly.
  const shaftHalfW = size * 0.075;          // half-width of the vertical shaft
  const shaftTop = size * 0.26;
  const shaftBottom = size * 0.55;
  const headTopY = size * 0.50;
  const headBottomY = size * 0.76;          // arrow tip (points down)
  const headHalfW = size * 0.21;            // half-width of the arrowhead base

  for (let y = 0; y < size; y++) {
    // vertical gradient: emerald -> darker emerald (top to bottom)
    const t = y / size;
    const bgR = Math.round(16 + (5 - 16) * t);     // #10b981 -> #047857-ish
    const bgG = Math.round(185 + (120 - 185) * t);
    const bgB = Math.round(129 + (87 - 129) * t);

    for (let x = 0; x < size; x++) {
      let r = bgR, g = bgG, b = bgB;

      // Is this pixel part of the white arrow?
      const inShaft = x >= cx - shaftHalfW && x <= cx + shaftHalfW &&
                      y >= shaftTop && y <= shaftBottom;
      // Triangle head: width shrinks linearly from headTopY (wide) to tip.
      let inHead = false;
      if (y >= headTopY && y <= headBottomY) {
        const prog = (y - headTopY) / (headBottomY - headTopY); // 0..1
        const halfAtY = headHalfW * (1 - prog);
        inHead = Math.abs(x - cx) <= halfAtY;
      }
      if (inShaft || inHead) { r = 255; g = 255; b = 255; }

      const i = (y * size + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return buf;
}

function write(size, name) {
  fs.writeFileSync(name, encodePNG(size, size, drawIcon(size)));
  console.log('wrote', name, size + 'x' + size);
}

write(192, 'icon-192.png');
write(512, 'icon-512.png');
write(180, 'apple-touch-icon.png');
console.log('done');
