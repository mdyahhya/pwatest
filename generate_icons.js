const fs = require('fs');
const zlib = require('zlib');

// Function to create a valid PNG buffer with custom dimensions and flat color + simple design
function createPng(width, height, r, g, b) {
  // CRC32 implementation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = chunk('IHDR', ihdrData);

  // Raw Image Data (Filter byte 0 + RGB for each pixel)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineSize);

  // Calculate inner square bounds for stylish 'Y' minimalist icon logo
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const padding = size * 0.15;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineSize;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;

      // Draw background: Dark sleek black/slate #0f172a
      let pr = 15;
      let pg = 23;
      let pb = 42;

      // Draw icon symbol inside (rounded square border + letter 'Y' / minimal dot)
      // Check if pixel is within rounded rect
      const rx = Math.abs(x - cx);
      const ry = Math.abs(y - cy);
      const maxR = (size / 2) - padding;

      if (rx < maxR && ry < maxR) {
        // Subtle gradient / accent element
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (dist < maxR * 0.7) {
          // Pure white / bright blue emblem
          pr = 255;
          pg = 255;
          pb = 255;
          // Inner detail: dark cut for 'PWA / Y' symbol
          // Stem of Y
          if (x >= cx - (size*0.04) && x <= cx + (size*0.04) && y >= cy && y <= cy + (size*0.25)) {
            pr = 15; pg = 23; pb = 42;
          }
          // Left branch of Y
          if (x < cx && (cy - y) >= (cx - x) - (size*0.06) && (cy - y) <= (cx - x) + (size*0.06) && y <= cy) {
            pr = 15; pg = 23; pb = 42;
          }
          // Right branch of Y
          if (x >= cx && (cy - y) >= (x - cx) - (size*0.06) && (cy - y) <= (x - cx) + (size*0.06) && y <= cy) {
            pr = 15; pg = 23; pb = 42;
          }
        }
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);

  // IEND
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate sizes
fs.writeFileSync('icon-192.png', createPng(192, 192, 15, 23, 42));
fs.writeFileSync('icon-512.png', createPng(512, 512, 15, 23, 42));
fs.writeFileSync('apple-touch-icon.png', createPng(180, 180, 15, 23, 42));
fs.writeFileSync('favicon.png', createPng(64, 64, 15, 23, 42));

console.log('Successfully generated PWA icon set: icon-192.png, icon-512.png, apple-touch-icon.png, favicon.png');
