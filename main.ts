// news-image-20261124 — draws one image summing up Tuesday 24 November 2026.
// Node 22, standard library only. No network, no copied artwork: every pixel
// is drawn here by code. Output is deterministic: two runs write identical bytes.
//
// Usage: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader does.)

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------- palette
const NAVY_TOP: [number, number, number] = [13, 31, 49];
const NAVY_BOT: [number, number, number] = [18, 51, 80];
const GRID: [number, number, number] = [27, 58, 82];
const LAND: [number, number, number] = [46, 107, 132];
const LAND_EDGE: [number, number, number] = [38, 90, 112];
const AMBER: [number, number, number] = [245, 185, 66];
const AMBER_DK: [number, number, number] = [13, 31, 49];
const WHITE: [number, number, number] = [244, 248, 250];
const MUTED: [number, number, number] = [143, 182, 201];
const MOON: [number, number, number] = [245, 233, 200];
const CRATER: [number, number, number] = [217, 201, 160];

// ---------------------------------------------------------------- framebuffer
const px = new Uint8Array(W * H * 3);

function setPixel(x: number, y: number, c: [number, number, number]): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: [number, number, number]): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setPixel(i, j, c);
}

function fillCircle(cx: number, cy: number, r: number, c: [number, number, number]): void {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(x, y, c);
    }
  }
}

function fillEllipse(cx: number, cy: number, rx: number, ry: number, c: [number, number, number]): void {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(x, y, c);
    }
  }
}

// ---------------------------------------------------------------- 5x7 font
// Each glyph is 7 rows of 5 bits, top row first, bit 4 = leftmost pixel.
const FONT: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '!': [4, 4, 4, 4, 4, 0, 4],
  "'": [4, 4, 8, 0, 0, 0, 0],
  '(': [2, 4, 8, 8, 8, 4, 2],
  ')': [8, 4, 2, 2, 2, 4, 8],
  ',': [0, 0, 0, 0, 12, 4, 8],
  '-': [0, 0, 0, 14, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 12, 12],
  '/': [1, 1, 2, 4, 8, 16, 16],
  '0': [14, 17, 19, 21, 25, 17, 14],
  '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 6, 8, 16, 31],
  '3': [30, 1, 1, 14, 1, 1, 30],
  '4': [2, 6, 10, 18, 31, 2, 2],
  '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [6, 8, 16, 30, 17, 17, 14],
  '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 2, 12],
  ':': [0, 12, 12, 0, 12, 12, 0],
  '?': [14, 17, 1, 6, 4, 0, 4],
  '%': [17, 17, 2, 4, 8, 17, 17],
  '+': [0, 4, 4, 14, 4, 4, 0],
  '&': [12, 18, 20, 8, 21, 18, 13],
  '$': [4, 15, 20, 14, 5, 30, 4],
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(s: string, x: number, y: number, scale: number, c: [number, number, number]): void {
  const up = s.toUpperCase();
  for (let k = 0; k < up.length; k++) {
    const g = FONT[up[k]] ?? FONT[' '];
    const ox = x + k * 6 * scale;
    for (let r = 0; r < 7; r++) {
      const row = g[r];
      for (let bit = 0; bit < 5; bit++) {
        if (row & (16 >> bit)) {
          fillRect(ox + bit * scale, y + r * scale, scale, scale, c);
        }
      }
    }
  }
}

function drawTextCentered(s: string, cx: number, y: number, scale: number, c: [number, number, number]): void {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c);
}

// ---------------------------------------------------------------- PNG writer
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePNG(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- background
for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const c: [number, number, number] = [
    Math.round(NAVY_TOP[0] + (NAVY_BOT[0] - NAVY_TOP[0]) * t),
    Math.round(NAVY_TOP[1] + (NAVY_BOT[1] - NAVY_TOP[1]) * t),
    Math.round(NAVY_TOP[2] + (NAVY_BOT[2] - NAVY_TOP[2]) * t),
  ];
  fillRect(0, y, W, 1, c);
}

// ---------------------------------------------------------------- frame
fillRect(12, 12, 1000, 3, AMBER);
fillRect(12, 1009, 1000, 3, AMBER);
fillRect(12, 12, 3, 1000, AMBER);
fillRect(1009, 12, 3, 1000, AMBER);

// ---------------------------------------------------------------- masthead
drawTextCentered('TUESDAY 24 NOVEMBER 2026', 512, 28, 6, WHITE);
drawTextCentered('THE WORLD IN ONE IMAGE', 512, 84, 3, AMBER);
fillRect(80, 116, 864, 4, AMBER);

// ---------------------------------------------------------------- map: graticule
for (let i = 1; i < 8; i++) fillRect(40 + i * 118, 140, 2, 470, GRID);
for (let i = 1; i < 5; i++) fillRect(40, 140 + i * 94, 944, 2, GRID);
fillRect(40, 140, 944, 2, GRID);
fillRect(40, 608, 944, 2, GRID);

// ---------------------------------------------------------------- map: continents (symbolic blobs)
const LANDS: Array<[number, number, number, number]> = [
  [215, 290, 120, 80], // North America
  [250, 220, 70, 45], // Canada / Alaska
  [180, 380, 45, 35], // Central America
  [330, 185, 28, 18], // Greenland
  [330, 470, 55, 85], // South America
  [320, 400, 40, 40], // north South America
  [525, 255, 55, 40], // Europe
  [560, 230, 35, 25], // Scandinavia
  [490, 235, 12, 20], // Britain
  [545, 400, 70, 95], // Africa
  [520, 330, 45, 40], // north Africa
  [730, 270, 150, 75], // Asia
  [800, 330, 70, 55], // East Asia
  [690, 360, 60, 45], // India
  [850, 420, 30, 45], // SE Asia
  [860, 510, 60, 35], // Australia
  [880, 300, 12, 28], // Japan
];
for (const [cx, cy, rx, ry] of LANDS) {
  fillEllipse(cx, cy, rx, ry, LAND_EDGE);
  fillEllipse(cx, cy, rx - 3, ry - 3, LAND);
}

// region labels
drawText('NORTH AMERICA', 118, 338, 2, MUTED);
drawText('SOUTH AMERICA', 268, 486, 2, MUTED);
drawText('EUROPE', 498, 208, 2, MUTED);
drawText('AFRICA', 512, 436, 2, MUTED);
drawText('ASIA', 700, 238, 2, MUTED);
drawText('OCEANIA', 818, 548, 2, MUTED);

// ---------------------------------------------------------------- moon (story 2)
fillCircle(920, 185, 34, MOON);
fillCircle(920, 185, 30, MOON);
fillCircle(908, 176, 6, CRATER);
fillCircle(930, 194, 8, CRATER);
fillCircle(916, 200, 4, CRATER);
// sparkles
fillRect(862, 158, 3, 12, WHITE);
fillRect(858, 162, 12, 3, WHITE);
fillRect(962, 232, 3, 10, WHITE);
fillRect(958, 236, 10, 3, WHITE);

// ---------------------------------------------------------------- markers
function marker(n: string, cx: number, cy: number): void {
  fillCircle(cx, cy, 22, WHITE);
  fillCircle(cx, cy, 18, AMBER);
  drawTextCentered(n, cx, cy - 10, 3, AMBER_DK);
}
marker('1', 528, 248); // Geneva — chess
marker('2', 790, 190); // sky — supermoon
marker('3', 878, 283); // Tokyo — markets
marker('4', 705, 330); // India — train
marker('5', 318, 265); // New York — US data

// ---------------------------------------------------------------- story list
const STORIES: Array<[string, string]> = [
  ['CHESS BEGINS IN GENEVA', 'GUKESH DEFENDS TITLE VS SINDAROV, GAME 1'],
  ['BEAVER SUPERMOON PEAKS', 'FULL MOON AT ITS CLOSEST, BESIDE PLEIADES'],
  ['TOKYO REOPENS, NIKKEI UP', "STOCKS REBOUND AFTER FRIDAY'S RECORD ROUT"],
  ['NEW TRAIN REACHES NEPAL', 'FIRST AYODHYA-JANAKPUR EXPRESS ARRIVES'],
  ['U.S. CONFIDENCE OUT TODAY', 'NOVEMBER DATA AS WALL ST WATCHES AI RALLY'],
];
STORIES.forEach(([head, detail], i) => {
  const y0 = 640 + i * 70;
  fillRect(48, y0 + 2, 48, 48, AMBER);
  drawTextCentered(String(i + 1), 72, y0 + 14, 3, AMBER_DK);
  drawText(head, 112, y0 + 6, 4, WHITE);
  drawText(detail, 112, y0 + 38, 3, MUTED);
  if (i < 4) fillRect(48, y0 + 64, 928, 2, GRID);
});

// ---------------------------------------------------------------- footer
drawTextCentered('SOURCES: CHESS.COM - EARTHSKY - REUTERS - QNC NEWS', 512, 992, 2, MUTED);

// ---------------------------------------------------------------- write output
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG());
