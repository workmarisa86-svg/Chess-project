/*
 * Mines tactical puzzles from engine games (Node.js tool, not used by the app).
 *
 * Games are played with some human-like imprecision; when a move throws away
 * a lot (the opponent's evaluation jumps), the resulting position is checked
 * with the solver in challenge-lib.js. Only positions with a clearly unique
 * best move survive.
 *
 * Usage: node tools/mine-tactics.js <seed> <minutes> <out.jsonl>
 */
'use strict';
const fs = require('fs');
const L = require('./challenge-lib.js');
const { Core, S, BOOK_LINES } = L;

const seed = parseInt(process.argv[2] || '1', 10);
const minutes = parseFloat(process.argv[3] || '10');
const outFile = process.argv[4] || 'mined.jsonl';

let rs = seed * 2654435761 >>> 0;
const rand = () => { rs ^= rs << 13; rs ^= rs >>> 17; rs ^= rs << 5; return (rs >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rand() * a.length)];

// Choose a move like a club player: mostly good moves, sometimes a worse one.
function humanMove(g, temperature) {
  const res = S.analyzeAll(g, { maxDepth: 2, timeMs: 150 });
  if (!res.length) return 0;
  const top = res.slice(0, 8);
  const w = top.map(r => Math.exp((r.score - top[0].score) / temperature));
  let x = rand() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < top.length; i++) { x -= w[i]; if (x <= 0) return top[i].move; }
  return top[0].move;
}

const seen = new Set();
const end = Date.now() + minutes * 60000;
let games = 0, found = 0;
while (Date.now() < end) {
  games++;
  const g = new Core.Chess();
  const line = pick(BOOK_LINES);
  const pre = Math.floor(rand() * Math.min(10, line.length));
  for (let i = 0; i < pre; i++) g.make(g.moveFromSan(line[i]));
  const temp = 40 + rand() * 120;
  let prev = null;
  for (let ply = pre; ply < 120 && Date.now() < end; ply++) {
    if (g.status().over) break;
    const q = S.think(g, { maxDepth: 4, timeMs: 120 });
    const score = q ? q.score : 0;
    // the previous move threw away >= 2.5 pawns from a roughly balanced position
    if (prev !== null && ply >= 8 && Math.abs(prev) <= 250 && score + prev >= 250 && score >= 200) {
      const fen = g.fen();
      const key = fen.split(' ').slice(0, 2).join(' ');
      if (!seen.has(key)) {
        seen.add(key);
        const sol = L.solve(fen, { depth: 6, time: 2500, maxUser: 5 });
        if (sol) {
          found++;
          fs.appendFileSync(outFile, JSON.stringify({ fen, line: sol.line, goal: sol.goal, userMoves: sol.userMoves, mateN: sol.mateN, src: 'mine' }) + '\n');
        }
      }
    }
    const m = humanMove(g, temp);
    if (!m) break;
    g.make(m);
    prev = score;
  }
}
console.log(`seed ${seed}: ${games} games, ${found} puzzles`);
