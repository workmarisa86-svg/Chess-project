/*
 * Shared helpers for building the Challenge puzzles (Node.js, not loaded by the app).
 *
 * It loads the app's own engine (js/core.js) and coach (js/coach.js) so every
 * stored solution is checked by the same engine the app uses:
 *   - every move of the solution must be legal;
 *   - at every step the solver's move must be clearly the best one
 *     (a decisive margin over the second-best move, or the only forced mate /
 *     the only drawing move);
 * Positions that fail are discarded.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(['core', 'i18n', 'terms', 'coach'].map(f => fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')).join('\n') +
  ';this.Core=Core;this.Coach=Coach;this.TERMS=TERMS;this.OPENINGS=OPENINGS;this.BOOK_LINES=BOOK_LINES;this.localizeSan=localizeSan;', ctx);
const { Core, Coach, TERMS, OPENINGS, BOOK_LINES, localizeSan } = ctx;
const { MATE, sqName, sqParse, mFrom, mTo, mPromo, mFlags, F_CAPTURE, WHITE, BLACK } = Core;
const S = new Core.Searcher();

const PROMO = ' pnbrqk';
const uci = m => sqName(mFrom(m)) + sqName(mTo(m)) + (mPromo(m) ? PROMO[mPromo(m)] : '');
function fromUci(g, u) {
  return g.moves().find(m => uci(m) === u) || 0;
}
const isMate = s => s > MATE - 500;
const mateIn = s => Math.ceil((MATE - s) / 2); // moves for the side to move
const winPct = Coach.winPct;

function analyze(g, depth, time) {
  return S.analyzeAll(g, { maxDepth: depth, timeMs: time });
}

const VAL = [0, 1, 3, 3, 5, 9, 0];
function material(g, color) {
  let m = 0;
  for (let sq = 0; sq < 128; sq++) {
    if (sq & 0x88) { sq += 7; continue; }
    const p = g.board[sq];
    if (p && (p & BLACK) === color) m += VAL[p & 7];
  }
  return m;
}
const balance = (g, color) => material(g, color) - material(g, color ^ BLACK);

/*
 * Check one step: is results[0] clearly the only best move for this goal?
 *   goal 'mate': the best move is a mate, and no other move mates as fast.
 *   goal 'win' : decisive margin, and the result is clearly winning.
 *   goal 'draw': the best move holds (about equal), every other move loses.
 */
function uniqueBest(results, goal) {
  const best = results[0], second = results[1];
  if (!best) return false;
  if (goal === 'mate') {
    if (!isMate(best.score)) return false;
    return !second || !isMate(second.score) || mateIn(second.score) > mateIn(best.score);
  }
  if (goal === 'draw') {
    // the engine often shows a small edge in drawn pawn endings, so allow up to ~1.6 pawns
    if (Math.abs(best.score) > 160 || isMate(best.score)) return false;
    return !second || winPct(second.score) <= 15 || isMate(-second.score);
  }
  // win
  if (!second) return winPct(best.score) >= 75;
  return winPct(best.score) >= 75 && winPct(best.score) - winPct(second.score) >= 25;
}

/*
 * Work out (or re-check) a solution line from a start position.
 * Returns { line: [uci...], userMoves, goal, mateN, ok } or null.
 *   given: an existing line to verify instead of the engine's own choice.
 */
function solve(fen, opts) {
  const o = Object.assign({ depth: 6, time: 2500, maxUser: 4, goal: null, given: null }, opts || {});
  const g = new Core.Chess(fen);
  const first = analyze(g, o.depth, o.time);
  if (!first.length) return null;
  let goal = o.goal || (isMate(first[0].score) ? 'mate' : 'win');
  if (goal === 'mate' && !isMate(first[0].score)) return null;
  const startBal = balance(g, g.turn);
  const solver = g.turn;
  const line = [];
  let res = first, userMoves = 0, mateN = goal === 'mate' ? mateIn(first[0].score) : 0;
  for (let step = 0; ; step++) {
    if (!res.length) return null;
    let mv = res[0].move;
    if (o.given) {
      const want = o.given[step * 2];
      if (!want) break;
      const gm = fromUci(g, want);
      if (!gm) return null;
      // the given move must be the engine's unique best (or an equally fast mate at the end)
      const r = res.find(x => x.move === gm);
      if (!r) return null;
      if (gm !== res[0].move) {
        if (!(goal === 'mate' && isMate(r.score) && mateIn(r.score) === mateIn(res[0].score) && mateIn(r.score) === 1)) return null;
      }
      mv = gm;
    }
    // At the final mating move any mate is accepted by the app, so mate in 1 needs no uniqueness.
    const finalMate = goal === 'mate' && isMate(res[0].score) && mateIn(res[0].score) === 1;
    if (!finalMate && !uniqueBest(res, goal)) {
      if (step === 0) return null;
      break; // the decisive part is over: stop the line here
    }
    line.push(uci(mv));
    userMoves++;
    g.make(mv);
    const st = g.status();
    if (st.over) break;
    if (userMoves >= o.maxUser && !o.given) break;
    // opponent's best reply (from the given line, or the engine)
    let reply;
    if (o.given) {
      const want = o.given[step * 2 + 1];
      if (!want) break;
      reply = fromUci(g, want);
      if (!reply) return null;
    } else {
      const r = analyze(g, Math.max(4, o.depth - 1), Math.min(1500, o.time));
      if (!r.length) break;
      reply = r[0].move;
    }
    // For win goals, stop once the gain is banked and the next move isn't forced.
    line.push(uci(reply));
    g.make(reply);
    if (g.status().over) return null; // the defender should not end the game
    res = analyze(g, o.depth, o.time);
    if (goal === 'win' && !o.given) {
      const gained = balance(g, solver) - startBal;
      if (gained >= 2 && !uniqueBest(res, 'win')) { line.pop(); break; }
    }
  }
  if (!userMoves) return null;
  // remove a dangling opponent move at the end
  if (line.length % 2 === 0) line.pop();
  const end = new Core.Chess(fen);
  for (const u of line) end.make(fromUci(end, u));
  if (goal === 'mate') {
    const st = end.status();
    if (!(st.over && st.reason === 'checkmate')) return null;
    mateN = (line.length + 1) / 2;
  } else if (goal === 'win') {
    const r = analyze(end, 4, 800);
    // after the last solver move it is the defender's turn: they must be clearly lost
    if (!r.length || winPct(-r[0].score) < 75) return null;
  } else if (goal === 'draw') {
    const r = analyze(end, Math.max(6, o.depth), o.time);
    if (r.length && Math.abs(r[0].score) > 160) return null;
  }
  return { line, userMoves: (line.length + 1) / 2, goal, mateN, ok: true };
}

// ------------------------------------------------------------ explanations
const MV = (g, m) => `{{${g.san(m, g.moves())}}}`; // notation localized by the app

// Plain-language reason the first move works, written from the analysis.
function explain(fen, line, opts) {
  const o = opts || {};
  const g = new Core.Chess(fen);
  const res = analyze(g, 5, 1500);
  const out = { en: [], es: [] };
  if (o.lead) { out.en.push(o.lead.en); out.es.push(o.lead.es); }
  if (res.length) {
    const first = fromUci(g, line[0]);
    const ordered = [res.find(r => r.move === first) || res[0]].concat(res.filter(r => r.move !== first));
    g.makeNull(); const threatRes = analyze(g, 4, 500); g.undo();
    const threat = (!g.inCheck() && threatRes.length) ? { move: threatRes[0].move, score: threatRes[0].score, pv: threatRes[0].pv } : null;
    for (const L of ['en', 'es']) {
      const ex = Coach.explainBest(g, ordered, threat, 30, L, 'en');
      if (ex) out[L].push(...ex.sentences.filter(s => !/Several moves|Varias jugadas/.test(s))
        .map(s => s.replace(/<b class="mv">([^<]+)<\/b>/g, '{{$1}}')));
    }
  }
  // the whole line, so the player can follow it
  if (line.length > 1) {
    const h = new Core.Chess(fen), parts = [];
    for (const u of line) { const m = fromUci(h, u); parts.push(MV(h, m)); h.make(m); }
    out.en.push(`The full line: ${parts.join(' ')}.`);
    out.es.push(`La línea completa: ${parts.join(' ')}.`);
  }
  if (o.tail) { out.en.push(o.tail.en); out.es.push(o.tail.es); }
  return { en: out.en.join(' '), es: out.es.join(' ') };
}

// Main theme of the first move (for statistics and labels).
function themeOf(fen, line, goal) {
  const g = new Core.Chess(fen);
  const m = fromUci(g, line[0]);
  const r = analyze(g, 4, 600);
  const best = r.find(x => x.move === m);
  const tactics = Coach.detectTactics(g, m, best ? best.pv : null);
  const order = ['smotheredMate', 'backRankMate', 'doubleCheck', 'discoveredCheck', 'fork', 'doubleAttack', 'skewer', 'pin',
    'discoveredAttack', 'hangingPiece', 'winningExchange', 'removingDefender', 'deflection', 'decoy', 'overloading', 'zwischenzug', 'xray',
    'mateThreat', 'backRankThreat', 'sacrifice', 'promotion', 'enPassant'];
  for (const id of order) if (tactics.some(t => t.id === id)) return id;
  return goal === 'mate' ? 'checkmate' : 'materialValue';
}

function sideToMove(fen) { return fen.split(' ')[1] === 'b' ? 'b' : 'w'; }

function playSans(sans) {
  const g = new Core.Chess();
  for (const s of sans) {
    const m = g.moveFromSan(s);
    if (!m) throw new Error('Illegal move in line: ' + s + ' after ' + sans.slice(0, sans.indexOf(s)).join(' '));
    g.make(m);
  }
  return g;
}

module.exports = {
  Core, Coach, TERMS, OPENINGS, BOOK_LINES, localizeSan, S, MATE,
  uci, fromUci, analyze, solve, explain, themeOf, uniqueBest, isMate, mateIn, winPct, balance, material,
  sideToMove, playSans, sqName, sqParse, WHITE, BLACK
};
