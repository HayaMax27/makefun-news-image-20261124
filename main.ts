// news-image-20261124: "THE WORLD IN ONE DAY"
// A newspaper front page of Tuesday 24 November 2026, drawn entirely in code:
// a 5x7 bitmap font designed here, a hand-rolled PNG encoder, and 30 stories
// verified as first reported on that day, across seven regions.
// Node 22, standard library only, no network, fully deterministic.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- palette
const PAPER = [246, 241, 227];
const INK = [22, 21, 19];
const RED = [166, 30, 30];
const GREY = [90, 86, 74];
const FAINT = [178, 170, 148];

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
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
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
};

// ------------------------------------------------------------- the stories
// Every story was first reported on Tuesday 24 November 2026.
const LEADS = [
  {
    kicker: 'CHINA',
    head: 'SHANGHAI PARTY CHIEF FALLS IN XI PURGE',
    deck: 'Chen Jining, a Politburo member, is under investigation. He is the fourth of the 24-member body to fall since 2025.',
  },
  {
    kicker: 'MARKETS',
    head: 'HUANG IS BACK AND STOCKS SOAR',
    deck: 'Nvidia jumps 31.5% after Huang returns as CEO. Taiex soars 9.0% to a record points gain and Nikkei adds 3.9%.',
  },
  {
    kicker: 'UNITED STATES',
    head: 'HUAWEI GUILTY OF TRADE-SECRETS THEFT',
    deck: 'A US jury convicts the Chinese giant on 10 of 12 counts, including bank fraud. It is cleared of racketeering.',
  },
];

// Three columns, nine stories each: 27 + 3 leads = 30 stories.
const COLUMNS = [
  [
    {
      title: 'EUROPE',
      stories: [
        { head: 'RUSSIA HITS ZAPORIZHZHIA: 2 DEAD', deck: 'Overnight drones wreck a block of flats. Kyiv says 96 drones came in and 73 were shot down.' },
        { head: 'UKRAINE HITS RUSSIAN SHIPS AT SEA', deck: 'Drones strike a cargo ship in the Gulf of Finland and a corvette off Libya, Kyiv says.' },
        { head: 'POLAND CRIES FOUL OVER AIRSPACE', deck: 'Warsaw accuses Russia of a new deliberate violation as the war edges toward NATO borders.' },
        { head: 'NATO VOWS TO DEFEND SPACE', deck: 'Rutte says the alliance will answer threats in orbit after reports of a Russian nuclear satellite.' },
        { head: 'ZELENSKY URGES FOUR-WAY TALKS NOW', deck: 'Kyiv says it is ready to meet Russia, the US and Europe as soon as Tuesday. He repeats his NATO call.' },
        { head: 'CHESS CROWN OPENS WITH A DRAW', deck: 'Gukesh and Sindarov, both 20, draw Game 1 in Geneva in 38 moves. The youngest title match ever.' },
      ],
    },
    {
      title: 'MARKETS AND SPORT',
      stories: [
        { head: 'SANOFI BUYS INSMED FOR $41B', deck: 'The French drugmaker pays $175 a share in cash, the biggest pharma deal of 2026.' },
        { head: 'SENEGAL GETS AFCON CROWN BACK', deck: 'CAS restores the 1-0 final win over Morocco, ruling the referee was right to restart play.' },
        { head: 'BEAVER SUPERMOON PEAKS', deck: 'The full moon crests at 14:53 UTC, the first of four supermoons in a row, beside the Pleiades.' },
      ],
    },
  ],
  [
    {
      title: 'ASIA-PACIFIC',
      stories: [
        { head: 'CHINA SENTENCES SPY TO DEATH', deck: 'An official surnamed Ma is condemned for passing 35 state secrets to an unnamed foreign country.' },
        { head: 'INDONESIA PICKS TWO TO REPLACE VP', deck: 'Prabowo nominates Amran Sulaiman and Sugiono after Gibran quit on Nov 12 over eligibility questions.' },
        { head: 'MALAYSIA TO SEND THOUSANDS BACK', deck: 'Anwar says 1,500 will go by ship in December and 5,303 by air, days after the ICJ genocide ruling.' },
        { head: 'FIRST TRAIN REACHES NEPAL', deck: 'The Saryu-Kamala Express arrives in Janakpur after 604 km. Weekly service starts Nov 28.' },
        { head: 'RUSSIAN JETS ENTER KOREA AIR ZONE', deck: 'Seoul scrambles fighters and orders Ulleungdo islanders to shelter. No airspace was violated.' },
        { head: 'ICJ: MYANMAR GUILTY OF GENOCIDE', deck: 'The world court rules 9-6 that the 2017 campaign against the Rohingya was genocide. A first.' },
      ],
    },
    {
      title: 'MIDDLE EAST',
      stories: [
        { head: 'FOUR TANKERS HIT BY MINES', deck: 'Iran says tankers are ablaze in the Strait of Hormuz after blasts. Its Guards say they hit a ship too.' },
        { head: 'IRGC SAYS IT HIT SHIP IN HORMUZ', deck: 'The Guards say their navy targeted a container ship that had switched off its tracking in a closed zone.' },
        { head: 'ISRAEL KILLS HAMAS SECURITY CHIEF', deck: 'A Gaza strike kills Brig. Gen. Naeem Abu Nahel and six others despite the ceasefire.' },
      ],
    },
  ],
  [
    {
      title: 'MIDDLE EAST',
      stories: [
        { head: 'GAZA ALERT AS MENINGITIS SURGES', deck: '272 cases in October, eight times the norm. Fifteen have died this year. The ministry blames shortages.' },
        { head: 'HOUTHIS 60 KM FROM ADEN', deck: 'Yemen army says fighters are closing on the temporary capital after pullbacks by the Red Sea.' },
        { head: 'RIYADH TOWER HIT, 11 WOUNDED', deck: 'A suspected Houthi drone strike hits the PIF tower in the financial district, the second in a week.' },
        { head: 'IRAQ TAKES KURD OILFIELDS', deck: 'Baghdad orders federal control of Kurdish oilfields and crossings. Barzani calls it unacceptable.' },
      ],
    },
    {
      title: 'THE AMERICAS',
      stories: [
        { head: 'US CONFIDENCE JUMPS TO 103.3', deck: 'The Conference Board index rises 11.4 points, its highest since January 2025, beating forecasts of 92.' },
        { head: 'US BLACKLISTS MEGASPEED', deck: 'The Singapore cloud firm at the centre of the Nvidia spy scandal joins the Entity List.' },
        { head: 'PENTAGON REBUKES CANADA', deck: 'Washington says Ottawa falls short as a defence partner and faults its F-35 review. Only 41.9% fly.' },
        { head: 'US DRONE HELPS NAB EL CHAPO ISIDRO', deck: 'Mexico captures the cartel boss in Sinaloa after a gunfight. It says it will try him, not extradite.' },
        { head: '25 HELD HOSTAGE IN CARTAGENA', deck: 'Gunmen seize a supermarket in Colombia. Five women are freed. Villavicencio car bomb hurts 23.' },
      ],
    },
  ],
];

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
  // The bitmap font holds capitals only; render sentence-case copy in caps.
  s = s.toUpperCase();
  for (let i = 0; i < s.length; i++) drawChar(x + i * 6 * scale, y, s[i], scale, c);
}

function drawCentered(y, s, scale, c) {
  drawText(Math.floor((W - textWidth(s, scale)) / 2), y, s, scale, c);
}

// Greedy word wrap to at most maxChars per line; throws if it needs more
// than maxLines, so an over-long story fails loudly instead of overflowing.
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
drawCentered(34, 'THE WORLD IN ONE DAY', 2, INK);
drawCentered(58, 'TUESDAY 24 NOVEMBER 2026', 4, INK);
drawCentered(104, '30 STORIES FROM SEVEN REGIONS', 1, GREY);
rect(24, 120, 976, 3, INK);
rect(24, 126, 976, 1, INK);

// ------------------------------------------------------------- lead stories
const LEAD_X = [24, 356, 688];
for (let i = 0; i < LEADS.length; i++) {
  const x = LEAD_X[i];
  const lead = LEADS[i];
  drawText(x, 140, lead.kicker, 1, RED);
  const headLines = drawWrapped(x, 156, lead.head, 2, 26, 3, 16, INK);
  drawWrapped(x, 156 + headLines * 16 + 6, lead.deck, 1, 52, 3, 9, INK);
}
rect(344, 140, 1, 152, FAINT);
rect(676, 140, 1, 152, FAINT);
rect(24, 306, 976, 2, INK);

// ------------------------------------------------------------ story columns
const COL_X = [24, 356, 688];
const COL_W = 312;
for (let ci = 0; ci < COLUMNS.length; ci++) {
  const x = COL_X[ci];
  let y = 322;
  for (const section of COLUMNS[ci]) {
    drawText(x, y, section.title, 1, RED);
    rect(x, y + 11, COL_W, 1, GREY);
    y += 20;
    for (const story of section.stories) {
      const headLines = drawWrapped(x, y, story.head, 2, 26, 2, 16, INK);
      y += headLines * 16 + 4;
      const deckLines = drawWrapped(x, y, story.deck, 1, 52, 2, 9, INK);
      y += deckLines * 9 + 15;
    }
    y += 10;
  }
}

// ------------------------------------------------------------------ footer
rect(24, 966, 976, 1, INK);
drawCentered(978, 'ALL EVENTS FIRST REPORTED ON TUESDAY 24 NOVEMBER 2026', 1, GREY);

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

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng());
