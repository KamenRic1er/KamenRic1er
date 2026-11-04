import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const A = (f) => readFileSync(join(process.cwd(), 'assets', f), 'utf8').trim();
const outFile = process.argv[2];
if (!outFile) {
  console.error('usage: node tools/build_preview.mjs <out.html>');
  process.exit(1);
}
mkdirSync(dirname(outFile), { recursive: true });

const typingDark = 'https://readme-typing-svg.demolab.com?font=Press+Start+2P&size=18&duration=3200&pause=900&color=FFC300&center=true&vCenter=true&width=760&lines=%3E+PRESS+START...;HENSHIN!+KAMEN+RIC1ER;JAVA+%2F+SPRING+%2F+VUE;RIDER+OF+THE+JVM';
const typingLight = typingDark.replace('color=FFC300', 'color=C8102E');

const statsDark = 'https://github-readme-stats.vercel.app/api?username=KamenRic1er&show_icons=true&bg_color=101218&title_color=E63946&text_color=E8E8E2&icon_color=FFC300&border_color=E63946&ring_color=C9CCD4';
const statsLight = 'https://github-readme-stats.vercel.app/api?username=KamenRic1er&show_icons=true&bg_color=FFFDF8&title_color=C8102E&text_color=1A1A1F&icon_color=B26B00&border_color=C8102E&ring_color=C9CCD4';
const langsDark = 'https://github-readme-stats.vercel.app/api/top-langs/?username=KamenRic1er&layout=compact&hide_title=true&langs_count=6&bg_color=101218&title_color=E63946&text_color=E8E8E2&border_color=E63946';
const langsLight = 'https://github-readme-stats.vercel.app/api/top-langs/?username=KamenRic1er&layout=compact&hide_title=true&langs_count=6&bg_color=FFFDF8&title_color=C8102E&text_color=1A1A1F&border_color=C8102E';
const streakDark = 'https://streak-stats.demolab.com?user=KamenRic1er&background=101218&stroke=E63946&ring=FFC300&fire=FFC300&currStreakNum=C9CCD4&sideNums=E63946&currStreakLabel=C9CCD4&sideLabels=E8E8E2&dates=8B90A0';
const streakLight = 'https://streak-stats.demolab.com?user=KamenRic1er&background=FFFDF8&stroke=C8102E&ring=B26B00&fire=C8102E&currStreakNum=C8102E&sideNums=4A4E58&currStreakLabel=C8102E&sideLabels=4A4E58&dates=8A8F9C';
const pin = (repo, dark) => `https://github-readme-stats.vercel.app/api/pin/?username=KamenRic1er&repo=${repo}&bg_color=${dark ? '101218&title_color=E63946&text_color=E8E8E2&icon_color=FFC300&border_color=E63946' : 'FFFDF8&title_color=C8102E&text_color=1A1A1F&icon_color=B26B00&border_color=C8102E'}`;

const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pixel Kamen Rider Profile — Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
  body.dark { background: #0A0B0F; }
  body.light { background: #FBF8F1; }
  #toolbar { position: sticky; top: 0; z-index: 10; display: flex; gap: 10px; justify-content: center; padding: 10px; background: #0A0B0F; border-bottom: 2px solid #E63946; }
  #toolbar button { padding: 9px 18px; border: 2px solid #E63946; background: transparent; color: #E63946; font-family: 'Press Start 2P', monospace; font-size: 10px; cursor: pointer; letter-spacing: 1px; }
  #toolbar button.active { background: #E63946; color: #0A0B0F; }
  #stage { max-width: 920px; margin: 0 auto; padding: 24px 16px 64px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .only-light { display: none !important; }
  body.light .only-light { display: block !important; }
  body.light .only-dark { display: none !important; }
  body.light .badges.only-light { display: flex !important; }
  .fill { width: 100%; }
  .fill svg { width: 100%; height: auto; display: block; }
  .mid { width: 100%; max-width: 720px; }
  .mid svg { width: 100%; height: auto; display: block; }
  .badges { display: flex; justify-content: center; }
  .badges svg { max-width: 100%; height: auto; }
  .badge-links { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; align-items: center; }
  .badge-links svg { height: 34px; width: auto; display: block; }
  .pxh { font-family: 'Press Start 2P', monospace; font-size: 13px; letter-spacing: 1px; margin: 16px 0 2px; text-align: center; }
  body.dark .pxh { color: #FFC300; }
  body.light .pxh { color: #C8102E; }
  p { max-width: 640px; text-align: center; line-height: 1.8; margin: 0; font-size: 15px; }
  body.dark p { color: #DCDDE4; }
  body.light p { color: #2A2A30; }
  .cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; }
  .cards img { border-radius: 4px; max-width: 100%; }
  .snake-ph { width: 100%; max-width: 760px; height: 190px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-family: 'Press Start 2P', monospace; }
  body.dark .snake-ph { border: 2px solid #E63946; background: repeating-linear-gradient(0deg, #101218, #101218 12px, #171922 12px, #171922 13px); color: #FFC300; }
  body.light .snake-ph { border: 2px solid #C8102E; background: repeating-linear-gradient(0deg, #FFFDF8, #FFFDF8 12px, #F5F0E4 12px, #F5F0E4 13px); color: #C8102E; }
  .snake-ph .snake { font-size: 20px; animation: snakeblink 2s steps(1) infinite; }
  .snake-ph .sub2 { font-size: 9px; opacity: .7; font-family: Consolas, monospace; }
  @keyframes snakeblink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .25; } }
  sub { font-family: 'Press Start 2P', monospace; font-size: 9px; }
  body.dark sub { color: #9AA0AE; }
  body.light sub { color: #6E737E; }
  .note { font-size: 11px; font-family: Consolas, monospace; border: 2px dashed; padding: 8px 14px; margin-top: 6px; }
  body.dark .note { color: #E63946; border-color: #E63946; }
  body.light .note { color: #C8102E; border-color: #C8102E; }
</style>
</head>
<body class="dark">
<div id="toolbar">
  <button id="btnDark" onclick="setMode('dark')">DARK</button>
  <button id="btnLight" onclick="setMode('light')">LIGHT</button>
</div>
<div id="stage">

  <div class="only-dark fill">{{BANNER_DARK}}</div>
  <div class="only-light fill">{{BANNER_LIGHT}}</div>

  <img alt="typing" data-dark="${typingDark}" data-light="${typingLight}" src="">

  <div class="only-dark mid">{{DIVIDER_DARK}}</div>
  <div class="only-light mid">{{DIVIDER_LIGHT}}</div>

  <div class="pxh">&#9658; PLAYER 1</div>
  <p>Backend developer with the belt always on. I build services with <b>Java &amp; Spring</b>, craft interfaces with <b>Vue</b>, and read JDK source code for fun. RPC frameworks, forums, weird side quests &mdash; if it compiles, it rides.</p>

  <div class="pxh">&#9658; POWER-UPS // TECH STACK</div>
  <div class="badges only-dark">{{TECH_DARK}}</div>
  <div class="badges only-light">{{TECH_LIGHT}}</div>

  <div class="pxh">&#9658; SCORE BOARD // GITHUB STATS</div>
  <div class="cards">
    <img alt="stats" data-dark="${statsDark}" data-light="${statsLight}" src="">
    <img alt="top langs" data-dark="${langsDark}" data-light="${langsLight}" src="">
  </div>
  <div class="cards">
    <img alt="streak" data-dark="${streakDark}" data-light="${streakLight}" src="">
  </div>
  <div class="note">Stats / project cards load from Vercel &mdash; may be blocked in local previews, they render fine on GitHub via its image proxy.</div>

  <div class="pxh">&#9658; CONTRIBUTION MATRIX</div>
  <div class="snake-ph">
    <div class="snake">SNAKE_LOADING...</div>
    <div class="sub2">renders after the GitHub Action runs</div>
  </div>

  <div class="pxh">&#9658; STAGE SELECT // PROJECTS</div>
  <div class="cards">
    <a href="https://github.com/KamenRic1er/community"><img alt="community" data-dark="${pin('community', true)}" data-light="${pin('community', false)}" src=""></a>
    <a href="https://github.com/KamenRic1er/MyRPC"><img alt="MyRPC" data-dark="${pin('MyRPC', true)}" data-light="${pin('MyRPC', false)}" src=""></a>
    <a href="https://github.com/KamenRic1er/JDKSourceLearn"><img alt="JDKSourceLearn" data-dark="${pin('JDKSourceLearn', true)}" data-light="${pin('JDKSourceLearn', false)}" src=""></a>
    <a href="https://github.com/KamenRic1er/atguigu-note"><img alt="atguigu-note" data-dark="${pin('atguigu-note', true)}" data-light="${pin('atguigu-note', false)}" src=""></a>
  </div>

  <div class="pxh">&#9658; CONTINUE? // CONTACT</div>
  <div class="badge-links">
    <a href="#" onclick="return false" class="only-dark">{{BADGE_EMAIL_DARK}}</a>
    <a href="#" onclick="return false" class="only-light">{{BADGE_EMAIL_LIGHT}}</a>
    <a href="#" onclick="return false" class="only-dark">{{BADGE_GITHUB_DARK}}</a>
    <a href="#" onclick="return false" class="only-light">{{BADGE_GITHUB_LIGHT}}</a>
  </div>
  <div class="note">EMAIL badge links to pcwl1017@163.com.</div>

  <div class="only-dark mid">{{DIVIDER_DARK2}}</div>
  <div class="only-light mid">{{DIVIDER_LIGHT2}}</div>
  <sub>&copy; 2026 KAMEN RIC1ER &middot; INSERT COIN TO CONTINUE</sub>

</div>
<script>
  function setMode(m) {
    document.body.className = m;
    document.getElementById('btnDark').classList.toggle('active', m === 'dark');
    document.getElementById('btnLight').classList.toggle('active', m === 'light');
    document.querySelectorAll('img[data-dark]').forEach(function (img) {
      img.src = m === 'dark' ? img.dataset.dark : img.dataset.light;
    });
  }
  setMode('dark');
</script>
</body>
</html>
`;

const html = template
  .replaceAll('{{BANNER_DARK}}', A('banner-dark.svg'))
  .replaceAll('{{BANNER_LIGHT}}', A('banner-light.svg'))
  .replaceAll('{{DIVIDER_DARK2}}', A('divider-dark.svg'))
  .replaceAll('{{DIVIDER_LIGHT2}}', A('divider-light.svg'))
  .replaceAll('{{DIVIDER_DARK}}', A('divider-dark.svg'))
  .replaceAll('{{DIVIDER_LIGHT}}', A('divider-light.svg'))
  .replaceAll('{{TECH_DARK}}', A('tech-dark.svg'))
  .replaceAll('{{TECH_LIGHT}}', A('tech-light.svg'))
  .replaceAll('{{BADGE_EMAIL_DARK}}', A('badge-email-dark.svg'))
  .replaceAll('{{BADGE_EMAIL_LIGHT}}', A('badge-email-light.svg'))
  .replaceAll('{{BADGE_GITHUB_DARK}}', A('badge-github-dark.svg'))
  .replaceAll('{{BADGE_GITHUB_LIGHT}}', A('badge-github-light.svg'));

writeFileSync(outFile, html);
console.log('preview written to', outFile, '(' + Math.round(html.length / 1024) + ' KB)');
