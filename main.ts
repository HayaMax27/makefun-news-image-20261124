// news-image-20261124 round 4: "THE WORLD IN ONE DAY" v2
// A one-page world news summary of Tuesday 24 November 2026, drawn entirely
// in code: a 5x7 bitmap font, a hand-rolled PNG encoder, 13 drawn picture
// stories, a UTC timeline, an in-numbers strip, a 25-story list, a pin map
// and a date-check box. 38 dated stories across 9 regions.
// Node 22, standard library only, no network, fully deterministic.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- palette
const PAPER = [247, 243, 232];
const INK = [22, 21, 19];
const RED = [166, 30, 30];
const DARKRED = [122, 18, 18];
const NAVY = [24, 44, 84];
const BLUE = [36, 84, 160];
const GREEN = [28, 110, 60];
const GOLD = [176, 124, 18];
const ORANGE = [198, 96, 20];
const GREY = [90, 86, 74];
const FAINT = [178, 170, 148];
const SKY = [196, 216, 232];
const OCEAN = [206, 224, 234];
const LAND = [232, 220, 192];
const WHITE = [255, 255, 255];
const BLACK = [12, 12, 12];
const CREAM = [250, 246, 236];

// ------------------------------------------------------- 5x7 bitmap font
// Each glyph is 7 rows of 5 bits, most-significant bit = leftmost column.
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ',': [0, 0, 0, 0, 0, 0x0c, 0x08],
  ':': [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ';': [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  '-': [0, 0, 0, 0x1f, 0, 0, 0],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  '+': [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  $: [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  '=': [0, 0, 0x1f, 0, 0x1f, 0, 0],
  '·': [0, 0, 0x04, 0x04, 0, 0, 0],
};

// ---------------------------------------------------------------- canvas
const W = 1024;
const H = 1024;
const img = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  img[i * 3] = PAPER[0];
  img[i * 3 + 1] = PAPER[1];
  img[i * 3 + 2] = PAPER[2];
}

function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = (y * W + x) * 3;
  img[o] = c[0];
  img[o + 1] = c[1];
  img[o + 2] = c[2];
}

function rect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) px(i, j, c);
  }
}

function hline(x, y, w, c) { rect(x, y, w, 1, c); }
function vline(x, y, h, c) { rect(x, y, 1, h, c); }

function outline(x, y, w, h, c) {
  hline(x, y, w, c);
  hline(x, y + h - 1, w, c);
  vline(x, y, h, c);
  vline(x + w - 1, y, h, c);
}

// Bresenham line.
function line(x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    px(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

function circle(x, y, r, c) {
  for (let j = -r; j <= r; j++) {
    const half = Math.floor(Math.sqrt(r * r - j * j));
    for (let i = -half; i <= half; i++) px(x + i, y + j, c);
  }
}

function circleOutline(x, y, r, c) {
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    px(Math.round(x + r * Math.cos(rad)), Math.round(y + r * Math.sin(rad)), c);
  }
}

// Even-odd scanline polygon fill. pts = [[x,y],...]
function fillPoly(pts, c) {
  let minY = 1e9;
  let maxY = -1e9;
  for (const p of pts) {
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        const t = (y - a[1]) / (b[1] - a[1]);
        xs.push(Math.round(a[0] + t * (b[0] - a[0])));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = xs[k]; x <= xs[k + 1]; x++) px(x, y, c);
    }
  }
}

function triangle(x0, y0, x1, y1, x2, y2, c) {
  fillPoly([[x0, y0], [x1, y1], [x2, y2]], c);
}

// ------------------------------------------------------------ text drawing
function textWidth(s, scale) {
  return s.length * 6 * scale - scale;
}

function drawChar(x, y, ch, scale, c) {
  const g = FONT[ch];
  if (g === undefined) throw new Error('no glyph for ' + JSON.stringify(ch));
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r] & (1 << (4 - col))) rect(x + col * scale, y + r * scale, scale, scale, c);
    }
  }
}

function drawText(x, y, s, scale, c) {
  // The bitmap font holds capitals only; render copy in caps.
  s = s.toUpperCase();
  for (let i = 0; i < s.length; i++) drawChar(x + i * 6 * scale, y, s[i], scale, c);
}

function drawCentered(y, s, scale, c, cx, cw) {
  const x0 = cx === undefined ? 0 : cx;
  const w = cw === undefined ? W : cw;
  drawText(x0 + Math.floor((w - textWidth(s, scale)) / 2), y, s, scale, c);
}

function drawRight(x, y, s, scale, c) {
  drawText(x - textWidth(s, scale), y, s, scale, c);
}

// Greedy word wrap; throws if it needs more than maxLines.
function wrap(s, maxChars, maxLines) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (w.length > maxChars) throw new Error('word too long: ' + w);
    if (cur === '') cur = w;
    else if (cur.length + 1 + w.length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur !== '') lines.push(cur);
  if (lines.length > maxLines) throw new Error('too many lines (' + lines.length + ' > ' + maxLines + '): ' + s);
  return lines;
}

function drawWrapped(x, y, s, scale, maxChars, maxLines, lineH, c) {
  const lines = wrap(s, maxChars, maxLines);
  for (let i = 0; i < lines.length; i++) drawText(x, y + i * lineH, lines[i], scale, c);
  return lines.length;
}

function drawWrappedCentered(cx, y, s, scale, maxChars, maxLines, lineH, c) {
  const lines = wrap(s, maxChars, maxLines);
  for (let i = 0; i < lines.length; i++) {
    drawText(cx - Math.floor(textWidth(lines[i], scale) / 2), y + i * lineH, lines[i], scale, c);
  }
  return lines.length;
}

// ------------------------------------------------------------ PNG encoding
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
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    img.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', Buffer.alloc(0))]);
}

// ------------------------------------------------- badges, banners, scenes
const BADGE_COLOR = {
  CONFIRMED: GREEN,
  OFFICIAL: GOLD,
  REPORTED: BLUE,
  CLAIM: RED,
  ONGOING: ORANGE,
};

function badge(x, y, label) {
  // Small outlined badge, text scale 1, right-aligned at x.
  const w = textWidth(label, 1) + 8;
  const bx = x - w;
  outline(bx, y, w, 11, BADGE_COLOR[label]);
  drawText(bx + 4, y + 2, label, 1, BADGE_COLOR[label]);
  return bx;
}

function banner(x, y, w, label, bg, scale) {
  rect(x, y, w, scale === 2 ? 18 : 14, bg);
  drawText(x + 5, y + (scale === 2 ? 2 : 4), label, scale, WHITE);
}

function numberBadge(x, y, n) {
  circle(x + 9, y + 9, 10, RED);
  circleOutline(x + 9, y + 9, 10, WHITE);
  const s = String(n);
  drawText(x + 10 - Math.floor(textWidth(s, 1) / 2), y + 6, s, 1, WHITE);
}

function explosion(x, y, r, c1, c2) {
  circle(x, y, r, c1);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    triangle(
      Math.round(x + Math.cos(a) * r * 0.6), Math.round(y + Math.sin(a) * r * 0.6),
      Math.round(x + Math.cos(a + 0.35) * r * 1.7), Math.round(y + Math.sin(a + 0.35) * r * 1.7),
      Math.round(x + Math.cos(a - 0.35) * r * 1.7), Math.round(y + Math.sin(a - 0.35) * r * 1.7),
      c2,
    );
  }
  circle(x, y, Math.floor(r * 0.55), c2);
}

// One drawn picture per lead story. kind selects the scene; the picture area
// is x,y,w,h and every scene is drawn from simple shapes only.
function scene(kind, x, y, w, h) {
  const cx = x + Math.floor(w / 2);
  if (kind === 'skyline') {
    rect(x, y, w, h, [214, 222, 226]);
    rect(x, y + h - 14, w, 14, [120, 116, 104]);
    rect(x + 8, y + 22, 22, h - 36, [70, 74, 82]);
    rect(x + 36, y + 10, 18, h - 24, [52, 56, 64]);
    rect(x + 60, y + 28, 26, h - 42, [88, 92, 100]);
    triangle(x + 60, y + 28, x + 86, y + 28, x + 73, y + 12, [52, 56, 64]);
    rect(x + 94, y + 16, 20, h - 30, [70, 74, 82]);
    for (const wy of [y + 26, y + 36, y + 46]) {
      for (const wx of [x + 12, x + 20, x + 40, x + 46, x + 66, x + 76, x + 98, x + 106]) {
        rect(wx, wy, 3, 4, [250, 214, 120]);
      }
    }
    circleOutline(x + w - 24, y + 18, 11, RED);
    line(x + w - 16, y + 26, x + w - 6, y + 36, RED);
  } else if (kind === 'court') {
    rect(x, y, w, h, SKY);
    rect(x, y + h - 10, w, 10, [150, 142, 122]);
    triangle(x + 8, y + 12, x + w - 8, y + 12, cx, y + 2, [236, 232, 220]);
    rect(x + 14, y + 12, w - 28, 4, [210, 204, 188]);
    for (let i = 0; i < 4; i++) {
      const px0 = x + 22 + i * Math.floor((w - 44) / 3);
      rect(px0, y + 16, 8, h - 30, WHITE);
    }
    rect(x + 14, y + h - 16, w - 28, 6, [210, 204, 188]);
    rect(cx - 16, y + h - 26, 32, 5, [120, 84, 40]);
    rect(cx - 2, y + h - 34, 4, 9, [120, 84, 40]);
  } else if (kind === 'flats') {
    rect(x, y, w, h, [58, 66, 84]);
    rect(x + 10, y + 18, 34, h - 26, [120, 118, 110]);
    rect(x + 52, y + 10, 30, h - 18, [96, 94, 88]);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        rect(x + 16 + c * 10, y + 24 + r * 10, 5, 6, [250, 214, 120]);
        rect(x + 57 + c * 9, y + 16 + r * 10, 5, 6, [200, 200, 190]);
      }
    }
    explosion(x + w - 18, y + 16, 9, [240, 120, 30], [250, 200, 60]);
    rect(x, y + h - 8, w, 8, [40, 44, 52]);
  } else if (kind === 'jets') {
    rect(x, y, w, h, SKY);
    circle(x + 18, y + 12, 7, WHITE);
    circle(x + 30, y + 16, 9, WHITE);
    circle(x + w - 26, y + 10, 6, WHITE);
    fillPoly([[x + 30, y + 30], [x + 62, y + 22], [x + 58, y + 34], [x + 36, y + 40]], [40, 44, 52]);
    fillPoly([[x + 70, y + 44], [x + 96, y + 38], [x + 92, y + 48], [x + 74, y + 52]], [40, 44, 52]);
    rect(x, y + h - 10, w, 10, [110, 140, 110]);
    triangle(x + w - 34, y + h - 26, x + w - 14, y + h - 26, x + w - 24, y + h - 10, RED);
    drawText(x + w - 32, y + h - 24, '!', 1, WHITE);
  } else if (kind === 'pact') {
    rect(x, y, w, h, CREAM);
    rect(x + 12, y + 10, w - 24, h - 20, WHITE);
    outline(x + 12, y + 10, w - 24, h - 20, INK);
    rect(x + 20, y + 18, 34, 20, [36, 84, 160]);
    rect(x + 20, y + 18, 34, 7, [200, 60, 60]);
    circle(x + 37, y + 28, 4, WHITE);
    rect(x + 60, y + 18, 34, 20, [28, 110, 60]);
    rect(x + 60, y + 18, 34, 7, [250, 210, 60]);
    line(x + 20, y + 46, x + w - 20, y + 46, FAINT);
    line(x + 20, y + 52, x + w - 34, y + 52, FAINT);
    line(cx - 12, y + 8, cx + 12, y + h - 8, RED);
    line(cx + 12, y + 8, cx - 12, y + h - 8, RED);
  } else if (kind === 'trophy') {
    rect(x, y, w, h, [220, 235, 200]);
    rect(x, y + h - 12, w, 12, [28, 110, 60]);
    circleOutline(cx - 16, y + 22, 9, GOLD);
    circleOutline(cx + 16, y + 22, 9, GOLD);
    rect(cx - 12, y + 8, 24, 18, [212, 168, 52]);
    rect(cx - 12, y + 8, 24, 5, [240, 200, 90]);
    rect(cx - 3, y + 26, 6, 12, [212, 168, 52]);
    rect(cx - 12, y + 38, 24, 6, [176, 124, 18]);
    rect(cx - 16, y + 44, 32, 4, [140, 100, 20]);
    circle(cx - 22, y + 52, 4, WHITE);
    circle(cx + 24, y + 50, 3, WHITE);
  } else if (kind === 'chart') {
    rect(x, y, w, h, NAVY);
    for (let i = 1; i < 4; i++) hline(x + 6, y + Math.floor((h * i) / 4), w - 12, [70, 90, 130]);
    const pts = [[x + 8, y + h - 14], [x + 30, y + h - 22], [x + 52, y + h - 18], [x + 74, y + h - 30], [x + 96, y + h - 26], [x + 118, y + h - 40], [x + 140, y + 16]];
    for (let i = 0; i + 1 < pts.length; i++) {
      line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], [80, 220, 120]);
      line(pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, [80, 220, 120]);
    }
    triangle(x + 140, y + 16, x + 130, y + 16, x + 140, y + 6, [80, 220, 120]);
    rect(x + 8, y + h - 12, 26, 8, [40, 44, 52]);
    rect(x + 38, y + h - 12, 26, 8, [40, 44, 52]);
    rect(x + 68, y + h - 12, 26, 8, [40, 44, 52]);
  } else if (kind === 'pharma') {
    rect(x, y, w, h, WHITE);
    outline(x, y, w, h, FAINT);
    rect(x + 12, y + 14, 26, h - 26, [220, 228, 236]);
    rect(x + 12, y + 8, 26, 8, [36, 84, 160]);
    rect(x + 16, y + 24, 18, 12, WHITE);
    drawText(x + 18, y + 26, '$', 1, BLUE);
    rect(x + w - 52, y + 14, 36, 12, [200, 40, 40]);
    rect(x + w - 52, y + 26, 36, 12, WHITE);
    outline(x + w - 52, y + 14, 36, 24, [200, 40, 40]);
  } else if (kind === 'strike') {
    rect(x, y, w, h, [214, 150, 110]);
    rect(x + 8, y + 26, 30, h - 34, [70, 66, 60]);
    rect(x + 44, y + 16, 26, h - 24, [88, 82, 74]);
    rect(x + 76, y + 30, 34, h - 38, [70, 66, 60]);
    for (const wx of [x + 13, x + 21, x + 29, x + 49, x + 57, x + 81, x + 89, x + 97]) {
      rect(wx, y + 32, 4, 5, [250, 214, 120]);
    }
    explosion(x + w - 22, y + 14, 10, [240, 120, 30], [250, 200, 60]);
    circle(x + 30, y + 12, 6, [120, 116, 110]);
    circle(x + 44, y + 8, 8, [120, 116, 110]);
    rect(x, y + h - 8, w, 8, [52, 48, 44]);
  } else if (kind === 'oilrig') {
    rect(x, y, w, h, SKY);
    rect(x, y + h - 12, w, 12, [150, 132, 100]);
    line(x + 20, y + h - 12, x + 44, y + 12, INK);
    line(x + 68, y + h - 12, x + 44, y + 12, INK);
    for (let i = 0; i < 3; i++) {
      const yy = y + 22 + i * 12;
      line(x + 26 + i * 3, yy, x + 62 - i * 3, yy, INK);
    }
    rect(x + 40, y + 6, 8, 8, INK);
    rect(x + w - 40, y + h - 30, 30, 18, [60, 60, 58]);
    rect(x + w - 34, y + h - 26, 6, 6, [250, 214, 120]);
    rect(x + w - 24, y + h - 26, 6, 6, [250, 214, 120]);
    circle(x + w - 12, y + 12, 7, [250, 214, 120]);
  } else if (kind === 'bus') {
    rect(x, y, w, h, SKY);
    rect(x, y + h - 16, w, 16, [90, 90, 88]);
    hline(x, y + h - 8, w, WHITE);
    rect(x + 14, y + 18, 74, 26, [240, 200, 60]);
    rect(x + 14, y + 18, 74, 6, [200, 60, 60]);
    for (let i = 0; i < 4; i++) rect(x + 20 + i * 17, y + 26, 12, 10, SKY);
    circle(x + 28, y + 46, 6, INK);
    circle(x + 74, y + 46, 6, INK);
    explosion(x + w - 16, y + 14, 8, [240, 120, 30], [250, 200, 60]);
    rect(x + w - 30, y + h - 26, 10, 4, [60, 60, 58]);
  } else if (kind === 'sun') {
    rect(x, y, w, h, [250, 236, 200]);
    circle(cx, y + 22, 14, [250, 200, 60]);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      line(Math.round(cx + Math.cos(a) * 18), Math.round(y + 22 + Math.sin(a) * 18),
        Math.round(cx + Math.cos(a) * 25), Math.round(y + 22 + Math.sin(a) * 25), [240, 170, 40]);
    }
    rect(x + 14, y + h - 30, 8, 22, [200, 60, 60]);
    circle(x + 18, y + h - 8, 7, RED);
    rect(x + 14, y + h - 30, 8, 10, WHITE);
    rect(x + w - 40, y + h - 26, 28, 4, [120, 116, 104]);
    rect(x + w - 40, y + h - 18, 28, 4, [120, 116, 104]);
  } else if (kind === 'rocket') {
    rect(x, y, w, h, [20, 28, 60]);
    for (const s of [[x + 14, y + 8], [x + 40, y + 16], [x + 90, y + 10], [x + 110, y + 24], [x + 24, y + 34], [x + 130, y + 40]]) {
      px(s[0], s[1], WHITE);
      px(s[0] + 1, s[1], WHITE);
    }
    rect(cx - 6, y + 10, 12, h - 30, WHITE);
    triangle(cx - 6, y + 10, cx + 6, y + 10, cx, y + 2, RED);
    circle(cx, y + 22, 4, SKY);
    triangle(cx - 6, y + h - 30, cx - 14, y + h - 18, cx - 6, y + h - 22, RED);
    triangle(cx + 6, y + h - 30, cx + 14, y + h - 18, cx + 6, y + h - 22, RED);
    triangle(cx - 5, y + h - 20, cx + 5, y + h - 20, cx, y + h - 6, [250, 160, 40]);
    rect(x, y + h - 6, w, 6, [120, 116, 104]);
  }
}

// ------------------------------------------------------------- the stories
// Every story happened, or was first reported, on Tuesday 24 November 2026.
// Items dated to other days are kept out of the stories and listed instead
// in the DATE CHECK box at the foot of the page.
const LEADS = [
  {
    n: 1, scene: 'skyline', kicker: 'CHINA · POLITICS', badge: 'OFFICIAL',
    banner: 'UNDER INVESTIGATION', bannerBg: RED,
    head: 'CHINA INVESTIGATES SHANGHAI PARTY CHIEF CHEN JINING',
    deck: "Shanghai's party chief, 62, is under investigation for 'serious violations', state media say.",
    src: 'CCTV VIA CNN',
  },
  {
    n: 2, scene: 'court', kicker: 'NEW YORK · COURTS', badge: 'CONFIRMED',
    banner: 'GUILTY · 10 OF 12 COUNTS', bannerBg: DARKRED,
    head: 'US JURY FINDS HUAWEI GUILTY IN TRADE-SECRETS CASE',
    deck: 'Federal court, Brooklyn: guilty on 10 of 12 counts, cleared of racketeering. Huawei will appeal.',
    src: 'AP, CNN',
  },
  {
    n: 3, scene: 'flats', kicker: 'UKRAINE · WAR', badge: 'CONFIRMED',
    banner: '9 KILLED IN A DAY', bannerBg: RED,
    head: 'RUSSIAN ATTACKS KILL 9 ACROSS UKRAINE IN A DAY',
    deck: 'Tally at 11:37 UTC: 9 killed and 81 hurt; a Zaporizhzhia apartment block is hit.',
    src: 'KYIV INDEPENDENT',
  },
  {
    n: 4, scene: 'jets', kicker: 'S. KOREA · SECURITY', badge: 'CONFIRMED',
    banner: 'AIR RAID ALERT', bannerBg: RED,
    head: 'RUSSIAN JETS SPARK KOREA AIR RAID ALERT',
    deck: 'Ulleungdo told to shelter at 07:52. No airspace violated.',
    src: 'KOREA HERALD',
  },
  {
    n: 5, scene: 'pact', kicker: 'SOLOMONS · DIPLOMACY', badge: 'REPORTED',
    banner: 'CHINA PACT ENDS 2027', bannerBg: NAVY,
    head: 'SOLOMONS TO LET ITS CHINA PACT LAPSE',
    deck: "Won't renew 2022 deal. Australia welcomes the call.",
    src: 'SMH, ABC',
  },
  {
    n: 6, scene: 'trophy', kicker: 'SENEGAL · SPORT', badge: 'CONFIRMED',
    banner: 'AFCON CHAMPIONS', bannerBg: GREEN,
    head: 'SPORTS COURT GIVES SENEGAL AFCON TITLE',
    deck: 'CAS restores 1-0 final win; champions again.',
    src: 'CNN',
  },
  {
    n: 7, scene: 'chart', kicker: 'WALL STREET · MARKETS', badge: 'CONFIRMED',
    banner: 'DOW 50,000', bannerBg: NAVY,
    head: 'DOW CLOSES BACK ABOVE 50,000',
    deck: 'At 21:00 UTC; Nasdaq falls 1.5% as chips slide.',
    src: 'ABC NEWS',
  },
  {
    n: 8, scene: 'pharma', kicker: 'PHARMA · BUSINESS', badge: 'OFFICIAL',
    banner: '$41BN DEAL', bannerBg: DARKRED,
    head: 'SANOFI TO BUY INSMED FOR $41BN',
    deck: 'Deal announced 05:30 UTC: $175 a share, cash.',
    src: 'SANOFI',
  },
  {
    n: 9, scene: 'strike', kicker: 'GAZA · WAR', badge: 'CONFIRMED',
    banner: 'GAZA CITY · AIR STRIKE', bannerBg: RED,
    head: 'ISRAEL KILLS HAMAS SECURITY CHIEF',
    deck: 'Naim Abu Nahel dies in Gaza City air strike.',
    src: 'WAPO, TOI',
  },
  {
    n: 10, scene: 'oilrig', kicker: 'IRAQ · ENERGY', badge: 'OFFICIAL',
    banner: 'KURDISH OIL · KIRKUK', bannerBg: NAVY,
    head: 'BAGHDAD ORDERS KURDISH OIL TAKEOVER',
    deck: 'Kirkuk and 3 more provinces; Erbil says no.',
    src: 'THE NATIONAL',
  },
  {
    n: 11, scene: 'bus', kicker: 'UAE · DISASTER', badge: 'OFFICIAL',
    banner: '13 DEAD', bannerBg: DARKRED,
    head: 'RAS AL KHAIMAH BUS CRASH: 13 DEAD',
    deck: 'Bus carried 41; 14 hurt, police say.',
    src: 'THE NATIONAL',
  },
  {
    n: 12, scene: 'sun', kicker: 'ENGLAND · WEATHER', badge: 'OFFICIAL',
    banner: '5,258 · RECORD', bannerBg: ORANGE,
    head: 'RECORD 5,258 HEAT DEATHS IN ENGLAND',
    deck: 'Summer 2026: old record 2,985 in 2022.',
    src: 'UKHSA',
  },
  {
    n: 13, scene: 'rocket', kicker: 'KOUROU · SPACE', badge: 'CONFIRMED',
    banner: '36 SATELLITES · ARIANE 6', bannerBg: NAVY,
    head: 'ARIANE 6 LOFTS 36 AMAZON SATELLITES',
    deck: 'Lift-off 11:14 UTC from French Guiana.',
    src: 'AIAA, XINHUA',
  },
];

// 25 more stories, one line each. Status letters: C confirmed, O official,
// R reported, CL one side's claim.
const ALSO = [
  { n: 14, text: 'UK: WARNS UKRAINE SUPPLIERS OF SABOTAGE', src: 'MOD', st: 'O' },
  { n: 15, text: 'SLOVAKIA: MPS END POSTAL VOTES FROM ABROAD', src: 'AP', st: 'C' },
  { n: 16, text: 'FRANCE: NAHEL OFFICER SENT TO MURDER TRIAL', src: 'AFP', st: 'C' },
  { n: 17, text: '16:30 UTC TURKEY: HELICOPTER CRASH KILLS 5', src: 'AA', st: 'C' },
  { n: 18, text: 'YEMEN: UK SANCTIONS HOUTHI LEADERS', src: 'GOV.UK', st: 'O' },
  { n: 19, text: 'SAUDI: 2027 DEFICIT SET AT 3.6% OF GDP', src: 'ARAB NEWS', st: 'O' },
  { n: 20, text: 'DR CONGO: REBELS SAY ADVANCE HALTED', src: 'AL JAZEERA', st: 'CL' },
  { n: 21, text: 'ETHIOPIA: ALAMATA WAR-CRIMES PROBE URGED', src: 'AMNESTY', st: 'C' },
  { n: 22, text: 'CAMEROON: SEPARATIST DENIES WAR CRIMES', src: 'AP', st: 'C' },
  { n: 23, text: 'BANGLADESH: HASINA PLANS 16 DEC RETURN', src: 'REUTERS', st: 'CL' },
  { n: 24, text: 'MANILA: TOP COURT REJECTS DUTERTE PLEAS, 9-4', src: 'PHILSTAR', st: 'C' },
  { n: 25, text: 'CHINA: PAKISTANI NAMED TO SHENZHOU-24 CREW', src: 'HKFP', st: 'O' },
  { n: 26, text: '00:30 UTC INDIA: BUS CRASH KILLS 4 CHILDREN', src: 'TRIBUNE', st: 'C' },
  { n: 27, text: '01:00 UTC HANOI: EATERY GAS BLAST KILLS 7', src: 'VNEXPRESS', st: 'C' },
  { n: 28, text: 'CRICKET: ENGLAND BEAT AUSTRALIA BY 8 WICKETS', src: 'ABC', st: 'C' },
  { n: 29, text: 'CANBERRA: WONG BACKS THE US ALLIANCE', src: 'AAP', st: 'O' },
  { n: 30, text: 'VANUATU: MPS BACK A$500M AUSTRALIA PACT', src: 'AAP', st: 'O' },
  { n: 31, text: '15:00 UTC US: CONFIDENCE INDEX 103.3', src: 'CONF. BOARD', st: 'O' },
  { n: 32, text: 'BRAZIL: BOLSONARO STILL IN INTENSIVE CARE', src: 'HOSPITAL', st: 'R' },
  { n: 33, text: 'CARTAGENA: ABOUT 25 HELD HOSTAGE IN STORE', src: 'REUTERS', st: 'R' },
  { n: 34, text: 'ANTARCTIC: SHARES SLIP BELOW $83 IPO PRICE', src: 'CNBC', st: 'R' },
  { n: 35, text: 'BITCOIN: FALLS BELOW $60,000', src: 'INVEZZ', st: 'C' },
  { n: 36, text: 'UNAIDS: 1.2M NEW HIV INFECTIONS IN 2025', src: 'AFP', st: 'O' },
  { n: 37, text: 'UN: 5 WOMEN AN HOUR KILLED BY KIN', src: 'UNODC', st: 'O' },
  { n: 38, text: 'CHAMPIONS LEAGUE: REAL MADRID 5-1 PSV', src: 'UEFA', st: 'C' },
];

const CHIPS = [
  { label: 'EUROPE 5', c: BLUE },
  { label: 'MIDDLE EAST 6', c: [150, 90, 40] },
  { label: 'AFRICA 4', c: GREEN },
  { label: 'ASIA 7', c: RED },
  { label: 'OCEANIA 4', c: [20, 130, 140] },
  { label: 'AMERICAS 5', c: [110, 60, 150] },
  { label: 'WORLD 7', c: [80, 80, 80] },
  { label: 'SOUTH ASIA 3', c: ORANGE },
];

const UTC_ITEMS = [
  '00:30 BUS CRASH', '01:00 HANOI BLAST', '05:30 SANOFI DEAL', '07:52 KOREA ALERT',
  '11:14 ARIANE 6', '11:37 9 KILLED', '15:00 CONFIDENCE', '21:00 DOW 50,000',
];

const NUMBERS = [
  { v: '9', cap: 'KILLED IN UKRAINE IN A DAY' },
  { v: '10 OF 12', cap: 'COUNTS: HUAWEI GUILTY' },
  { v: '50,000', cap: 'DOW CLOSES BACK ABOVE' },
  { v: '$41BN', cap: 'SANOFI BUYS INSMED' },
  { v: '5,258', cap: 'HEAT DEATHS, ENGLAND RECORD' },
  { v: '13', cap: 'DIE IN UAE BUS CRASH' },
];

// News from other days, deliberately left out of the stories.
const DATECHECK = [
  'HUANG RESIGNS AS NVIDIA CEO - 13 NOV 2026',
  'ICJ RULES MYANMAR COMMITTED ROHINGYA GENOCIDE - 19 NOV 2026',
  'US BLACKLISTS MEGASPEED CLOUD FIRM - 23 NOV 2026',
  'COP31 ENDS WITHOUT A DEAL - 22 NOV 2026',
  'DR CONGO DECLARES EBOLA OUTBREAK - SEP 2026',
  'NOT YET: SOLOMONS-AUSTRALIA TREATY SIGNING (WED)',
];

// ------------------------------------------------------------------ border
rect(8, 8, W - 16, 2, INK);
rect(8, H - 10, W - 16, 2, INK);
rect(8, 8, 2, H - 16, INK);
rect(W - 10, 8, 2, H - 16, INK);
rect(14, 14, W - 28, 1, FAINT);
rect(14, H - 15, W - 28, 1, FAINT);
rect(14, 14, 1, H - 28, FAINT);
rect(W - 15, 14, 1, H - 28, FAINT);

// --------------------------------------------------------------- masthead
drawText(16, 20, 'ONE DAY OF WORLD NEWS', 1, RED);
drawRight(1008, 20, '38 STORIES · 9 REGIONS · 20 FIELDS', 1, INK);
drawCentered(36, 'TUESDAY 24 NOVEMBER 2026', 4, INK);
drawCentered(70, "CHINA PUTS SHANGHAI'S PARTY CHIEF UNDER INVESTIGATION · US JURY FINDS HUAWEI GUILTY · RUSSIAN ATTACKS KILL 9 IN UKRAINE", 1, INK);
rect(16, 82, 992, 3, INK);

// ------------------------------------------------------------ region chips
{
  const slot = 992 / CHIPS.length;
  for (let i = 0; i < CHIPS.length; i++) {
    const cx0 = 16 + i * slot;
    const w = textWidth(CHIPS[i].label, 1) + 16;
    const bx = Math.floor(cx0 + (slot - w) / 2);
    rect(bx, 88, w, 18, CHIPS[i].c);
    drawText(bx + 8, 92, CHIPS[i].label, 1, WHITE);
  }
}

// ------------------------------------------------------------ UTC timeline
rect(16, 112, 992, 18, BLACK);
rect(16, 112, 100, 18, RED);
drawText(22, 116, 'THE DAY IN UTC', 1, WHITE);
{
  const items = UTC_ITEMS.join(' · ');
  drawText(124, 116, items, 1, WHITE);
}

// ------------------------------------------------------------ in numbers
rect(16, 136, 92, 38, BLACK);
drawText(30, 141, 'IN', 1, WHITE);
drawText(22, 152, 'NUMBERS', 1, WHITE);
{
  const slot = (1008 - 116) / NUMBERS.length;
  for (let i = 0; i < NUMBERS.length; i++) {
    const cx0 = 116 + i * slot;
    const cx = cx0 + slot / 2;
    drawText(Math.floor(cx - textWidth(NUMBERS[i].v, 2) / 2), 140, NUMBERS[i].v, 2, RED);
    drawWrappedCentered(cx, 158, NUMBERS[i].cap, 1, 24, 2, 9, GREY);
    if (i > 0) vline(Math.floor(cx0), 140, 32, FAINT);
  }
}
rect(16, 180, 992, 2, INK);

// ------------------------------------------------------------ lead stories
function leadCard(s, x, y, w, picH, headChars, deckChars, bannerScale) {
  scene(s.scene, x, y, w, picH);
  numberBadge(x, y, s.n);
  banner(x, y + picH - (bannerScale === 2 ? 18 : 14), w, s.banner, s.bannerBg, bannerScale);
  const ky = y + picH + 4;
  drawText(x, ky, s.kicker, 1, RED);
  badge(x + w, ky - 2, s.badge);
  const hy = ky + 12;
  const headLines = drawWrapped(x, hy, s.head, 2, headChars, 3, 15, INK);
  const dy = hy + headLines * 15 + 4;
  drawWrapped(x, dy, s.deck, 1, deckChars, 2, 9, INK);
  drawText(x, dy + 20, s.src, 1, GREY);
}

// Row 1: three big stories.
{
  const xs = [16, 348, 680];
  for (let i = 0; i < 3; i++) leadCard(LEADS[i], xs[i], 186, 312, 64, 26, 52, 2);
}
// Rows 2 and 3: five stories each.
{
  const xs = [16, 216, 416, 616, 816];
  for (let i = 0; i < 5; i++) leadCard(LEADS[3 + i], xs[i], 344, 190, 58, 15, 31, 1);
  for (let i = 0; i < 5; i++) leadCard(LEADS[8 + i], xs[i], 500, 190, 58, 15, 31, 1);
}
rect(16, 656, 992, 2, INK);

// -------------------------------------------------------------- also list
drawText(16, 664, 'ALSO ON TUESDAY 24 NOVEMBER · 25 MORE, BY REGION', 1, RED);
rect(16, 676, 992, 1, GREY);
{
  const left = ALSO.slice(0, 13);
  const right = ALSO.slice(13);
  const cols = [[16, left], [512, right]];
  for (const [cx0, items] of cols) {
    let y = 684;
    for (const it of items) {
      drawText(cx0, y, String(it.n), 1, RED);
      const tx = cx0 + 24;
      const line = it.text + ' · ' + it.src;
      drawText(tx, y, line, 1, INK);
      const dotX = tx + textWidth(line, 1) + 14;
      const stColor = BADGE_COLOR[it.st === 'CL' ? 'CLAIM' : it.st === 'O' ? 'OFFICIAL' : it.st === 'R' ? 'REPORTED' : 'CONFIRMED'];
      if (it.st === 'CL') {
        outline(dotX - 7, y - 1, 15, 11, stColor);
        drawText(dotX - 5, y + 1, 'CL', 1, stColor);
      } else {
        circleOutline(dotX, y + 3, 6, stColor);
        drawText(dotX - 2, y, it.st, 1, stColor);
      }
      y += 12;
    }
  }
}

// ------------------------------------------------------- map + date check
drawText(16, 844, 'WHERE IT HAPPENED · PINS 1-13', 1, RED);
drawText(652, 844, 'DATE CHECK · LEFT OFF ON PURPOSE', 1, RED);
rect(16, 856, 624, 112, OCEAN);
outline(16, 856, 624, 112, GREY);
{
  // Simplified continents, map-local coords inside the 624x112 box.
  const ox = 16;
  const oy = 856;
  const land = (pts) => fillPoly(pts.map((p) => [ox + p[0], oy + p[1]]), LAND);
  land([[20, 8], [150, 4], [180, 20], [170, 45], [120, 55], [80, 50], [40, 40], [15, 25]]);
  land([[170, 2], [195, 2], [195, 12], [175, 12]]);
  land([[185, 60], [230, 58], [250, 75], [235, 92], [205, 88], [185, 75]]);
  land([[300, 8], [340, 4], [355, 18], [340, 32], [315, 30], [300, 20]]);
  land([[300, 42], [350, 40], [365, 60], [350, 88], [320, 86], [300, 62]]);
  land([[360, 5], [560, 2], [600, 18], [580, 45], [520, 60], [450, 55], [400, 40], [365, 25]]);
  land([[520, 72], [575, 70], [590, 82], [560, 90], [525, 86]]);
  const pins = [
    [555, 30], [160, 26], [345, 20], [580, 18], [595, 80], [305, 55],
    [172, 36], [315, 18], [375, 42], [395, 38], [415, 48], [305, 12], [245, 62],
  ];
  for (let i = 0; i < pins.length; i++) {
    const px0 = ox + pins[i][0];
    const py0 = oy + pins[i][1];
    circle(px0, py0, 8, RED);
    circleOutline(px0, py0, 8, WHITE);
    const s = String(i + 1);
    drawText(px0 - Math.floor(textWidth(s, 1) / 2), py0 - 3, s, 1, WHITE);
  }
}
{
  const bx = 652;
  let y = 860;
  drawWrapped(bx, y, 'THESE MADE THE NEWS ON OTHER DAYS, SO THEY ARE NOT TODAY\'S NEWS:', 1, 58, 2, 9, GREY);
  y += 20;
  for (const d of DATECHECK) {
    drawText(bx, y, '·', 1, RED);
    drawWrapped(bx + 10, y, d, 1, 56, 2, 9, INK);
    y += 13;
  }
}

// ------------------------------------------------------------------ footer
rect(16, 976, 992, 1, INK);
drawCentered(984, 'EVERY STORY HAPPENED, OR WAS FIRST REPORTED, ON TUESDAY 24 NOV 2026 (UTC) · SOURCES NAMED ON EACH ITEM · ORIGINAL DRAWINGS, NO PHOTOS', 1, GREY);
drawCentered(998, 'HOW SURE - CONFIRMED: VERIFIED BY 2+ SOURCES · OFFICIAL: ON THE RECORD · REPORTED: OUTLETS REPORT, NOT YET OFFICIAL · CLAIM: ONE SIDE\'S ACCOUNT', 1, GREY);

// -------------------------------------------------------------------- write
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng());
