/*
 * Build the Levels puzzles (data/levels/NNN.js) from the list made by
 * tools/select-lichess-puzzles.py. Puzzles: Lichess open database, CC0.
 *
 *   node tools/build-levels.js levels.tsv [--check 300] [--report sample.txt]
 *
 * Every puzzle is replayed with the app's own engine (js/core.js): all moves
 * must be legal, and mate puzzles must end in checkmate. A random sample is
 * also searched by the engine to confirm the first move is a good one.
 * Puzzles that fail are dropped. Writes CHUNK puzzles per file and sets
 * TOTAL in js/levels.js.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['core', 'i18n', 'terms', 'coach', 'levels'].map(f => fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')).join('\n') +
  ';this.Core=Core;this.Coach=Coach;this.Levels=Levels;this.TERMS=TERMS;', ctx);
const { Core, Levels } = ctx;

const args = process.argv.slice(2);
const src = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const CHECK = +opt('--check', 300);
const REPORT = opt('--report', null);
const OUT = path.join(ROOT, 'data', 'levels');

const PROMO = ' pnbrqk';
const uci = m => Core.sqName(Core.mFrom(m)) + Core.sqName(Core.mTo(m)) + (Core.mPromo(m) ? PROMO[Core.mPromo(m)] : '');
const fromUci = (g, u) => g.moves().find(m => uci(m) === u) || 0;

const rows = fs.readFileSync(src, 'utf8').split('\n').filter(Boolean);
const kept = [];
let bad = 0;
for (const r of rows) {
  const [id, fen, moves, rating, themes] = r.split('\t');
  const ms = moves.split(' ');
  const g = new Core.Chess(fen);
  let ok = true;
  for (const u of ms) { const m = fromUci(g, u); if (!m) { ok = false; break; } g.make(m); }
  const tags = themes.split(' ');
  const isMate = tags.includes('mate');
  if (ok && isMate) { const st = g.status(); ok = st.over && st.reason === 'checkmate'; }
  if (ok && !isMate && g.status().over) ok = false;
  if (!ok) { bad++; continue; }
  const f = fen.split(' ');
  const mv = ms.map(u => u.length === 5 ? u.slice(0, 4) + u[4].toUpperCase() : u).join('');
  kept.push([id, f[0], f[1], f[2], f[3], mv, rating, Levels.encodeThemes(tags)].join(' '));
}
console.log(`replayed ${rows.length}: ${kept.length} legal, ${bad} dropped`);

// Engine spot-check on a random sample: the solver's first move must be a
// mate (mate puzzles) or not clearly worse than the engine's choice.
const S = new Core.Searcher();
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const drop = new Set();
let agree = 0, checked = 0;
const sample = new Set();
while (sample.size < Math.min(CHECK, kept.length)) sample.add(Math.floor(rnd() * kept.length));
for (const k of sample) {
  Levels.add(0, kept[k]);
  const p = Levels.get(1);
  const g = new Core.Chess(p.f);
  g.make(fromUci(g, p.pre));
  const first = fromUci(g, p.s.split(' ')[0]);
  const res = S.analyzeAll(g, { maxDepth: 8, timeMs: 1200 });
  checked++;
  const mine = res.find(x => x.move === first), best = res[0];
  const mateScore = s => s > Core.MATE - 500;
  let ok;
  if (p.g.charAt(0) === 'm') ok = mine && (mateScore(mine.score) || !mateScore(best.score) || mine.score >= best.score - 300);
  else ok = mine && (mine.score >= best.score - 150 || mine.score >= 300);
  if (best.move === first) agree++;
  if (!ok) { drop.add(k); console.log('engine disagrees:', kept[k].split(' ')[0], mine && mine.score, best.score); }
}
console.log(`engine check: ${checked} sampled, ${agree} same first move, ${drop.size} dropped`);
const final = kept.filter((_, k) => !drop.has(k));

// Write chunks.
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let bytes = 0;
for (let c = 0; c * Levels.CHUNK < final.length; c++) {
  const part = final.slice(c * Levels.CHUNK, (c + 1) * Levels.CHUNK).join('\n');
  const js = `Levels.add(${c},${JSON.stringify(part)});\n`;
  fs.writeFileSync(path.join(OUT, String(c).padStart(3, '0') + '.js'), js);
  bytes += js.length;
}
const lv = path.join(ROOT, 'js', 'levels.js');
const starts = [];
for (let c = 0; c * Levels.CHUNK < final.length; c++) starts.push(+final[c * Levels.CHUNK].split(' ')[6]);
fs.writeFileSync(lv, fs.readFileSync(lv, 'utf8').replace(/const TOTAL = \d+;/, `const TOTAL = ${final.length};`)
  .replace(/const STARTS = \[[^\]]*\];/, `const STARTS = [${starts.join(', ')}];`));
console.log(`wrote ${final.length} puzzles in ${Math.ceil(final.length / Levels.CHUNK)} files, ${(bytes / 1e6).toFixed(1)} MB`);

if (REPORT) {
  // Explanations for a sample of levels, to read through.
  const out = [];
  const pick = [1, 2, 3, 50, 500, 5000, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 199000];
  for (let i = 0; i < 40; i++) pick.push(1 + Math.floor(rnd() * final.length));
  for (const n of pick) {
    if (n > final.length) continue;
    Levels.add(0, final[n - 1]);
    const p = Levels.get(1);
    const ex = Levels.explain(p);
    out.push(`#${n} ${p.lid} r${p.r} ${p.g} [${p.th.join(',')}] term=${ex.t}\n  pre ${p.pre} line ${p.s}\n  EN: ${ex.en}\n  ES: ${ex.es}\n`);
  }
  fs.writeFileSync(REPORT, out.join('\n'));
}
