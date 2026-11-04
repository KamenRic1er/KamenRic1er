import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { makeGrid, put, rectF, emitRects, drawText, FONT } from './gen_pixel_assets.mjs';

const LOGIN = process.env.GH_LOGIN || 'KamenRic1er';
const TOKEN = process.env.GITHUB_TOKEN || '';
const OUT = process.env.OUT_DIR || join(process.cwd(), 'assets', 'generated');

const HDRS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'kamen-ric1er-profile',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

const PAL = {
  dark: {
    a: '#101218', b: '#E63946', c: '#F2F2EE', d: '#9AA0AE',
    e: '#FFC300', f: '#23252F', g: '#161822',
  },
  light: {
    a: '#FFFDF8', b: '#C8102E', c: '#1A1A1F', d: '#6E737E',
    e: '#B26B00', f: '#E7E1D3', g: '#F5F0E4',
  },
};

const LANG_COLORS = {
  Java: '#B07219', JavaScript: '#F1E05A', TypeScript: '#3178C6', Vue: '#41B883',
  HTML: '#E34C26', CSS: '#563D7C', Shell: '#89E051', Python: '#3572A5',
  C: '#555555', 'C++': '#F34B7D', Go: '#00ADD8', Rust: '#DEA584',
  Kotlin: '#A97BFF', SQL: '#E38C00', Dockerfile: '#384D54',
};
const PIN_REPOS = ['community', 'MyRPC', 'JDKSourceLearn', 'atguigu-note'];
const FALLBACK_COLORS = ['#E63946', '#FFC300', '#2A9D8F', '#8E7DBE', '#F4A261', '#4D96FF'];

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: HDRS });
  if (!res.ok) throw new Error(`GitHub API ${path} -> ${res.status}`);
  return res.json();
}

async function graphql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...HDRS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${json.errors[0].message}`);
  return json.data;
}

const CONTRIB_QUERY = `query($login: String!, $from: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from) {
      contributionCalendar { totalContributions }
    }
  }
}`;

async function collect() {
  const user = await gh(`/users/${LOGIN}`);
  const allRepos = await gh(`/users/${LOGIN}/repos?per_page=100&type=owner&sort=pushed`);
  const repos = allRepos.filter((r) => !r.fork);

  let contrib = null;
  if (TOKEN) {
    const from = new Date(Date.now() - 365 * 864e5).toISOString();
    try {
      const data = await graphql(CONTRIB_QUERY, { login: LOGIN, from });
      contrib = data.user.contributionsCollection.contributionCalendar.totalContributions;
    } catch (err) {
      console.warn('graphql failed:', err.message);
    }
  }

  const byName = new Map(allRepos.map((r) => [r.name.toLowerCase(), r]));
  const pinned = PIN_REPOS.map((name) => {
    const r = byName.get(name.toLowerCase());
    return {
      name: r ? r.name : name,
      description: r ? r.description || '' : '',
      stars: r ? r.stargazers_count : 0,
      lang: r ? r.language || '' : '',
    };
  });

  const langBytes = new Map();
  const sample = [...repos].sort((a, b) => b.size - a.size).slice(0, 20);
  for (const r of sample) {
    try {
      const langs = await gh(`/repos/${LOGIN}/${r.name}/languages`);
      for (const [name, bytes] of Object.entries(langs)) {
        langBytes.set(name, (langBytes.get(name) || 0) + bytes);
      }
    } catch (err) {
      console.warn(`languages skipped for ${r.name}:`, err.message);
    }
  }
  const langs = [...langBytes.entries()]
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6);

  return {
    repos: user.public_repos,
    followers: user.followers,
    stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    contrib,
    langs,
    pinned: pinned.slice(0, 4),
  };
}

const fmt = (n) => {
  if (n == null) return '?';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};

const clean = (str, max) => {
  const allowed = new Set(Object.keys(FONT));
  return [...String(str).toUpperCase()]
    .map((ch) => (allowed.has(ch) ? ch : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
};

const tw = (str, scale) => str.length * 6 * scale - scale;

function card(w, h, pal) {
  const g = makeGrid(w, h);
  rectF(g, 0, 0, w, h, 'b');
  rectF(g, 3, 3, w - 6, h - 6, 'a');
  for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]) put(g, x, y, '.');
  put(g, 1, 1, '.');
  put(g, w - 2, 1, '.');
  put(g, 1, h - 2, '.');
  put(g, w - 2, h - 2, '.');
  return g;
}

function svg(g, pal, w, h, aria) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${aria}">${emitRects(g, pal).join('')}</svg>`;
}

function statsSvg(data, pal) {
  const W = 460, H = 200;
  const g = card(W, H, pal);
  drawText(g, 'SCORE BOARD', 20, 18, 2, 'e');
  drawText(g, 'KAMEN RIC1ER // GITHUB', 20, 44, 1, 'd');
  const rows = [
    ['REPOS', data.repos],
    ['STARS', data.stars],
    ['FOLLOWERS', data.followers],
    ['CONTRIB 1Y', data.contrib],
  ];
  rows.forEach(([label, n], i) => {
    const y = 72 + i * 29;
    drawText(g, label, 22, y + 2, 1, 'd');
    const val = fmt(n);
    drawText(g, val, W - 30 - tw(val, 3), y - 7, 3, 'c');
    for (let x = 22; x < W - 22; x += 5) put(g, x, y + 20, 'f');
  });
  return svg(g, pal, W, H, 'GitHub stats card');
}

function langsSvg(langs, pal) {
  const W = 460, H = 200;
  const g = card(W, H, pal);
  drawText(g, 'TOP LANGS', 20, 18, 2, 'e');
  drawText(g, 'BY BYTES', 20, 44, 1, 'd');

  const total = langs.reduce((s, l) => s + l.bytes, 0) || 1;
  const max = langs[0] ? langs[0].bytes : 1;
  const palWithColors = { ...pal };
  langs.forEach((l, i) => {
    const key = String(i + 1);
    palWithColors[key] = LANG_COLORS[l.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    const y = 64 + i * 22;
    const label = clean(l.name, 10);
    drawText(g, label, 22, y + 1, 1, 'c');
    const bx = 100, bw = 256;
    rectF(g, bx, y - 1, bw, 10, 'f');
    const w = Math.max(6, Math.round((bw - 2) * (l.bytes / max)));
    for (let x = bx + 1; x < bx + 1 + w - 4; x += 6) rectF(g, x, y + 1, 5, 6, key);
    const pct = ((l.bytes / total) * 100).toFixed(1);
    drawText(g, `${pct}%`, W - 22 - tw(`${pct}%`, 1), y + 1, 1, 'd');
  });
  return svg(g, palWithColors, W, H, 'Top languages card');
}

function pinSvg(repo, pal) {
  const W = 400, H = 104;
  const g = card(W, H, pal);
  drawText(g, clean(repo.name, 16), 18, 16, 2, 'c');
  drawText(g, clean(repo.description, 44) || '- NO DESCRIPTION -', 18, 44, 1, 'd');
  drawText(g, `STARS ${fmt(repo.stars)}`, 18, 72, 1, 'e');
  const lang = clean(repo.lang, 12) || 'CODE';
  drawText(g, lang, W - 18 - tw(lang, 1), 72, 1, 'd');
  return svg(g, pal, W, H, `Project card: ${repo.name}`);
}

const data = await collect();
console.log(
  `repos=${data.repos} stars=${data.stars} followers=${data.followers} contrib=${data.contrib} langs=${data.langs.map((l) => l.name).join(',')}`,
);

mkdirSync(OUT, { recursive: true });
for (const name of ['dark', 'light']) {
  const pal = PAL[name];
  writeFileSync(join(OUT, `stats-${name}.svg`), statsSvg(data, pal));
  writeFileSync(join(OUT, `langs-${name}.svg`), langsSvg(data.langs, pal));
  data.pinned.forEach((repo, i) => {
    writeFileSync(join(OUT, `pin-${i + 1}-${name}.svg`), pinSvg(repo, pal));
  });
  console.log('generated stats', name, 'assets');
}
