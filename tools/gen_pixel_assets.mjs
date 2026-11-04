import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'assets');
mkdirSync(OUT, { recursive: true });

const THEMES = {
  dark: {
    bgA: '#0A0B0F', bgB: '#161822', dot: '#8B90A0', dotOp: 0.16,
    K: '#0A0A0E', R: '#D62828', D: '#8E1B1B', P: '#F2615C',
    S: '#C9CCD4', s: '#8F939D', W: '#F4F6F8', G: '#34343E',
    E: '#FFD23F', O: '#FF9E1B', Y: '#FFC300',
    H: '#FFE082', Z: '#8A6D00', V: '#FF2E88', J: '#2E3240',
    C: '#ECECEA', M: '#E63946', F: '#FFC300',
    T: '#9AA0AE', U: '#FFC300',
    chipBg: '#14151B', chipText: '#F2F2EE',
  },
  light: {
    bgA: '#FBF8F1', bgB: '#F0EBDD', dot: '#B9B3A4', dotOp: 0.3,
    K: '#1A1A1F', R: '#C8102E', D: '#8A1420', P: '#E4574F',
    S: '#9AA0AC', s: '#6E737E', W: '#FFFFFF', G: '#4A4E58',
    E: '#FFC300', O: '#FF9E1B', Y: '#B26B00',
    H: '#F5C542', Z: '#8A6D00', V: '#E4006E', J: '#2E3138',
    C: '#222226', M: '#C8102E', F: '#C8102E',
    T: '#7A8090', U: '#B26B00',
    chipBg: '#FFFFFF', chipText: '#1A1A1F',
  },
};

const CLASS = { E: 'eye', F: 'blink', T: 'tw', U: 'tw2', V: 'eye' };

const FONT = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  'A': ['01110','10001','10001','11111','10001','10001','10001'],
  'B': ['11110','10001','10001','11110','10001','10001','11110'],
  'C': ['01110','10001','10000','10000','10000','10001','01110'],
  'D': ['11110','10001','10001','10001','10001','10001','11110'],
  'E': ['11111','10000','10000','11110','10000','10000','11111'],
  'F': ['11111','10000','10000','11110','10000','10000','10000'],
  'G': ['01110','10001','10000','10111','10001','10001','01111'],
  'H': ['10001','10001','10001','11111','10001','10001','10001'],
  'I': ['11111','00100','00100','00100','00100','00100','11111'],
  'J': ['00111','00010','00010','00010','00010','10010','01100'],
  'K': ['10001','10010','10100','11000','10100','10010','10001'],
  'L': ['10000','10000','10000','10000','10000','10000','11111'],
  'M': ['10001','11011','10101','10101','10001','10001','10001'],
  'N': ['10001','11001','10101','10011','10001','10001','10001'],
  'O': ['01110','10001','10001','10001','10001','10001','01110'],
  'P': ['11110','10001','10001','11110','10000','10000','10000'],
  'Q': ['01110','10001','10001','10001','10101','10010','01101'],
  'R': ['11110','10001','10001','11110','10100','10010','10001'],
  'S': ['01111','10000','10000','01110','00001','00001','11110'],
  'T': ['11111','00100','00100','00100','00100','00100','00100'],
  'U': ['10001','10001','10001','10001','10001','10001','01110'],
  'V': ['10001','10001','10001','10001','10001','01010','00100'],
  'W': ['10001','10001','10001','10101','10101','10101','01010'],
  'X': ['10001','10001','01010','00100','01010','10001','10001'],
  'Y': ['10001','10001','01010','00100','00100','00100','00100'],
  'Z': ['11111','00001','00010','00100','01000','10000','11111'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','11110','00001','00001','10001','01110'],
  '6': ['00110','01000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00010','01100'],
  '!': ['00100','00100','00100','00100','00100','00000','00100'],
  '/': ['00001','00001','00010','00100','01000','10000','10000'],
  ':': ['00000','00100','00100','00000','00100','00100','00000'],
  '.': ['00000','00000','00000','00000','00000','00100','00100'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '>': ['01000','00100','00010','00001','00010','00100','01000'],
  '%': ['11001','11010','00100','00100','01011','10011','00000'],
  '?': ['01110','10001','00001','00010','00100','00000','00100'],
};

function makeGrid(w, h) {
  return Array.from({ length: h }, () => Array(w).fill('.'));
}
function put(g, x, y, ch) {
  x = Math.round(x); y = Math.round(y);
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = ch;
}
function rectF(g, x, y, w, h, ch) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, ch);
}
function ellipseF(g, cx, cy, rx, ry, ch) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1.0) put(g, x, y, ch);
    }
}
function lineF(g, x0, y0, x1, y1, ch, t = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const p = steps === 0 ? 0 : i / steps;
    const x = Math.round(x0 + (x1 - x0) * p);
    const y = Math.round(y0 + (y1 - y0) * p);
    const o = Math.floor((t - 1) / 2);
    rectF(g, x - o, y - o, t, t, ch);
  }
}
function outlineGrid(g, ch = 'K') {
  const H = g.length, W = g[0].length;
  const src = g.map((r) => r.slice());
  const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (src[y][x] === '.') continue;
    if (nb.some(([dx, dy]) => {
      const X = x + dx, Y = y + dy;
      return X < 0 || X >= W || Y < 0 || Y >= H || src[Y][X] === '.';
    })) g[y][x] = ch;
  }
}
function stamp(g, src, ox, oy, scale) {
  for (let y = 0; y < src.length; y++) for (let x = 0; x < src[0].length; x++) {
    const ch = src[y][x];
    if (ch !== '.') rectF(g, ox + x * scale, oy + y * scale, scale, scale, ch);
  }
}
function drawText(g, str, x, y, scale, ch) {
  let cx = x;
  for (const c of str.toUpperCase()) {
    const glyph = FONT[c] || FONT[' '];
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (glyph[gy][gx] === '1') rectF(g, cx + gx * scale, y + gy * scale, scale, scale, ch);
    }
    cx += 6 * scale;
  }
}
function emitRects(g, pal, ox = 0, oy = 0) {
  const H = g.length, W = g[0].length;
  const used = Array.from({ length: H }, () => Array(W).fill(false));
  const out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (used[y][x] || g[y][x] === '.') continue;
    const ch = g[y][x];
    let w = 0;
    while (x + w < W && !used[y][x + w] && g[y][x + w] === ch) w++;
    let h = 1;
    outer: while (y + h < H) {
      for (let i = 0; i < w; i++) {
        if (used[y + h][x + i] || g[y + h][x + i] !== ch) break outer;
      }
      h++;
    }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) used[y + j][x + i] = true;
    const cls = CLASS[ch];
    out.push(`<rect x="${x + ox}" y="${y + oy}" width="${w}" height="${h}" fill="${pal[ch] || '#FF00FF'}"${cls ? ` class="${cls}"` : ''}/>`);
  }
  return out;
}

/* ── pixel art: Ohma Zi-O style helmet (48x52) ── */
function buildHelmet() {
  const g = makeGrid(48, 52);

  const shell = (ch, grow) => {
    ellipseF(g, 24, 19, 16 + grow, 13.5 + grow, ch);
    for (let y = 30; y <= 49; y++) {
      const t = (y - 30) / 19;
      const half = 14 - 7 * Math.pow(t, 1.15) + grow;
      rectF(g, Math.round(24 - half), y, Math.round(half * 2), 1, ch);
    }
  };

  // gold rim + dark steel mask
  shell('Y', 2);
  shell('J', 0);

  // gear-tooth crown along the dome
  for (let a = 202; a <= 338; a += 14) {
    const rad = a * Math.PI / 180;
    const tx = Math.round(24 + 16.5 * Math.cos(rad));
    const ty = Math.round(19 + 14 * Math.sin(rad));
    rectF(g, tx - 1, ty - 3, 2, 4, 'Y');
  }

  // long clock-hand antennae
  lineF(g, 13, 11, 2, 3, 'Y', 2);
  lineF(g, 35, 11, 46, 3, 'Y', 2);
  put(g, 2, 2, 'H'); put(g, 1, 3, 'H');
  put(g, 45, 2, 'H'); put(g, 46, 3, 'H');

  // forehead clock dial
  ellipseF(g, 24, 15, 9.5, 9.5, 'Y');
  ellipseF(g, 24, 15, 8, 8, 'K');
  for (let a = 0; a < 360; a += 30) {
    const rad = (a - 90) * Math.PI / 180;
    put(g, Math.round(24 + 6.5 * Math.cos(rad)), Math.round(15 + 6.5 * Math.sin(rad)),
      a % 90 === 0 ? 'H' : 'Y');
  }
  lineF(g, 24, 15, 20, 10, 'H', 1);
  lineF(g, 24, 15, 28, 11, 'H', 1);
  put(g, 24, 15, 'H');

  // central gold ridge
  rectF(g, 23, 25, 2, 11, 'Z');
  put(g, 23, 25, 'H'); put(g, 24, 25, 'H');

  // angular red compound eyes with dark rims
  const rows = [
    [10, 20], [9, 20], [9, 20], [9, 20], [9, 19], [10, 19],
    [10, 18], [11, 18], [12, 17], [13, 16], [14, 16], [15, 16],
  ];
  rows.forEach(([a, b], i) => {
    rectF(g, a, 26 + i, b - a + 1, 1, 'D');
    rectF(g, 47 - b, 26 + i, b - a + 1, 1, 'D');
    if (i > 0 && i < rows.length - 1 && b - a > 3) {
      rectF(g, a + 1, 26 + i, b - a - 1, 1, i < 3 ? 'O' : 'R');
      rectF(g, 47 - b + 1, 26 + i, b - a - 1, 1, i < 3 ? 'O' : 'R');
    }
  });

  // gold brow ridges above the eyes
  rectF(g, 9, 25, 12, 1, 'Y');
  rectF(g, 27, 25, 12, 1, 'Y');

  // cheek plates + gold mouth grille
  rectF(g, 14, 37, 2, 8, 'Y');
  rectF(g, 32, 37, 2, 8, 'Y');
  rectF(g, 18, 39, 12, 6, 'Y');
  for (const bx of [19, 22, 25, 28]) rectF(g, bx, 40, 1, 4, 'K');

  // neck
  rectF(g, 20, 47, 8, 4, 'K');
  outlineGrid(g);
  return g;
}

/* ── pixel art: coin sprite (12x12) ── */
function buildCoin() {
  const g = makeGrid(12, 12);
  ellipseF(g, 5.5, 5.5, 5, 5, 'K');
  ellipseF(g, 5.5, 5.5, 4, 4, 'Y');
  ellipseF(g, 5.5, 5.5, 2.2, 2.2, 'E');
  put(g, 4, 3, 'W'); put(g, 4, 4, 'W');
  return g;
}

function star(g, x, y, ch) {
  put(g, x, y, ch); put(g, x - 1, y, ch); put(g, x + 1, y, ch);
  put(g, x, y - 1, ch); put(g, x, y + 1, ch);
}

function drawHpBar(g, x, y, w, h) {
  rectF(g, x, y, w, h, 'K');
  rectF(g, x + 2, y + 2, w - 4, h - 4, 'G');
  const fill = Math.round((w - 4) * 0.8);
  rectF(g, x + 2, y + 2, fill, h - 4, 'M');
  for (let tx = x + 2 + 28; tx < x + 2 + fill; tx += 28) rectF(g, tx, y + 2, 1, h - 4, 'K');
  rectF(g, x + 2, y + 2, 4, h - 4, 'Y');
}

function buildBanner(name) {
  const th = THEMES[name];
  const W = 1200, H = 360;
  const g = makeGrid(W, H);

  stamp(g, buildHelmet(), 90, 46, 5);

  // title with drop shadow
  drawText(g, 'KAMEN RIC1ER', 432, 92, 4, 'K');
  drawText(g, 'KAMEN RIC1ER', 430, 90, 4, 'Y');
  rectF(g, 430, 122, 284, 3, 'Y');

  drawText(g, 'JAVA / SPRING / VUE', 430, 150, 2, 'K');
  drawText(g, 'JAVA / SPRING / VUE', 428, 148, 2, 'C');
  drawText(g, '- RIDER OF THE JVM -', 430, 178, 2, 'K');
  drawText(g, '- RIDER OF THE JVM -', 428, 176, 2, 's');

  drawText(g, '> PRESS START', 430, 226, 2, 'F');
  drawText(g, '1UP', 1046, 316, 2, 'Y');
  drawText(g, 'HP', 92, 326, 2, 'C');
  drawHpBar(g, 128, 324, 220, 20);

  stamp(g, buildCoin(), 1008, 60, 4);
  star(g, 352, 44, 'T');
  star(g, 1062, 192, 'U');
  star(g, 380, 302, 'T');
  star(g, 1140, 92, 'U');

  const rects = emitRects(g, th);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360" role="img" aria-label="Kamen Ric1er pixel banner, Ohma Zi-O style helmet">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${th.bgA}"/><stop offset="1" stop-color="${th.bgB}"/>
</linearGradient>
<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${th.dot}" opacity="${th.dotOp}"/></pattern>
</defs>
<style>
@keyframes twinkle{0%,100%{opacity:.12}50%{opacity:.9}}
@keyframes eyeGlow{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes tick{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.eye{animation:eyeGlow 2.6s ease-in-out infinite}
.blink{animation:blink 1.1s steps(1) infinite}
.tw{animation:twinkle 2.8s ease-in-out infinite}
.tw2{animation:twinkle 3.6s ease-in-out infinite;animation-delay:1.2s}
.secondHand{transform-box:view-box;transform-origin:212.5px 123.5px;animation:tick 60s steps(60) linear infinite}
</style>
<rect width="1200" height="360" fill="url(#bg)"/>
<rect width="1200" height="360" fill="url(#dots)"/>
${rects.join('')}
<rect class="secondHand" x="211" y="103.5" width="3" height="20" fill="${th.H}"/>
<rect x="210.5" y="122" width="5" height="4" fill="${th.E}"/>
</svg>`;
}

function dividerSvg(th) {
  const sq = [];
  for (let x = -32; x < 1232; x += 32) {
    sq.push(`<rect x="${x}" y="10" width="8" height="6" fill="${th.M}"/>`);
    sq.push(`<rect x="${x + 16}" y="12" width="4" height="2" fill="${th.S}" opacity="0.75"/>`);
    sq.push(`<rect x="${x + 24}" y="12" width="4" height="2" fill="${th.S}" opacity="0.35"/>`);
  }
  const gem = [];
  const halfs = [2, 4, 6, 8, 10, 12, 12, 10, 8, 6, 4, 2];
  halfs.forEach((hw, i) => gem.push(`<rect x="${600 - hw}" y="${7 + i}" width="${hw * 2}" height="1" fill="${th.M}"/>`));
  gem.push(`<rect x="598" y="11" width="4" height="4" fill="${th.E}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="26" viewBox="0 0 1200 26" role="img" aria-label="pixel divider">
<style>
@keyframes march{to{transform:translateX(-32px)}}
@keyframes gemP{0%,100%{opacity:1}50%{opacity:.55}}
.march{animation:march 1.3s linear infinite}
.gem{animation:gemP 2.4s ease-in-out infinite}
</style>
<g class="march">${sq.join('')}</g>
<g class="gem">${gem.join('')}</g>
</svg>`;
}

const TECH = [
  { label: 'JAVA', color: '#E63946' },
  { label: 'SPRING', color: '#6DB33F' },
  { label: 'VUE', color: '#41B883' },
  { label: 'JS', color: '#F7DF1E' },
  { label: 'MYSQL', color: '#4E9CC0' },
  { label: 'REDIS', color: '#E63946' },
  { label: 'GIT', color: '#F05033' },
  { label: 'DOCKER', color: '#2496ED' },
  { label: 'LINUX', color: '#FCC624' },
  { label: 'HTML', color: '#E34F26' },
  { label: 'CSS', color: '#2965F1' },
  { label: 'JDK', color: '#EE9E2C' },
];

function buildBadgeRow(entries, th, aria) {
  const scale = 2, H = 34, gap = 14, maxW = 560;
  const widths = entries.map((e) => e.label.length * 6 * scale - 2 + 28);
  const rows = [];
  let cur = [], curW = 0;
  entries.forEach((e, i) => {
    const w = widths[i];
    if (cur.length && curW + gap + w > maxW) { rows.push({ items: cur, w: curW }); cur = []; curW = 0; }
    cur.push(i);
    curW += (cur.length > 1 ? gap : 0) + w;
  });
  if (cur.length) rows.push({ items: cur, w: curW });
  const svgW = Math.max(...rows.map((r) => r.w));
  const svgH = rows.length * H + (rows.length - 1) * gap;
  const rects = [];
  let y = 0;
  for (const row of rows) {
    let x = 0;
    for (const idx of row.items) {
      const e = entries[idx], w = widths[idx];
      const g = makeGrid(w, H);
      rectF(g, 0, 0, w, H, 'K');
      rectF(g, 2, 2, w - 4, H - 4, 'Z');
      rectF(g, 4, 4, w - 8, H - 8, 'b');
      const tw = e.label.length * 12 - 2;
      drawText(g, e.label, Math.round((w - tw) / 2), 10, scale, 'x');
      rects.push(...emitRects(g, { K: th.K, Z: e.color, b: th.chipBg, x: th.chipText }, x, y));
      x += w + gap;
    }
    y += H + gap;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="${aria}">${rects.join('')}</svg>`;
}

function main() {
  for (const name of ['dark', 'light']) {
    const th = THEMES[name];
    writeFileSync(join(OUT, `banner-${name}.svg`), buildBanner(name));
    writeFileSync(join(OUT, `divider-${name}.svg`), dividerSvg(th));
    writeFileSync(join(OUT, `tech-${name}.svg`), buildBadgeRow(TECH, th, 'pixel tech stack badges'));
    writeFileSync(join(OUT, `badge-email-${name}.svg`), buildBadgeRow([{ label: 'EMAIL', color: '#E63946' }], th, 'email badge'));
    writeFileSync(join(OUT, `badge-github-${name}.svg`), buildBadgeRow([{ label: 'GITHUB', color: name === 'dark' ? '#C9CCD4' : '#4A4E58' }], th, 'github badge'));
    console.log('generated', name, 'assets');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

export { THEMES, FONT, makeGrid, put, rectF, ellipseF, lineF, outlineGrid, emitRects, drawText };
