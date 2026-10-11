/*
 * Builds data/challenges.js (Node.js tool, not loaded by the app).
 *
 * Sources:
 *   - mined tactics (tools/mine-tactics.js output, *.jsonl files)
 *   - well-known opening traps and real opening blunders punished
 *   - generated endgames (basic mates, king and pawn, rule of the square,
 *     Lucena, pawn breakthroughs)
 *   - positions from famous games (only moves we are certain of)
 * Every puzzle is (re)verified with the app's own engine; failures are dropped.
 *
 * Usage: node tools/build-challenges.js <mined1.jsonl> [mined2.jsonl ...]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./challenge-lib.js');
const { Core, Coach, BOOK_LINES, S } = L;

const LEVELS = ['beginner', 'easy', 'medium', 'hard', 'impossible'];
const out = [];
const seen = new Set();
const keyOf = fen => fen.split(' ').slice(0, 2).join(' ');
let rs = (+process.env.SEED || 12345) >>> 0;
const rand = () => { rs ^= rs << 13; rs ^= rs >>> 17; rs ^= rs << 5; return (rs >>> 0) / 4294967296; };
const log = (...a) => console.log(...a);

function sanLine(fen, line) {
  const g = new Core.Chess(fen), s = [];
  for (const u of line) { const m = L.fromUci(g, u); s.push(g.san(m, g.moves())); g.make(m); }
  return s;
}
function uciLine(fen, sans) {
  const g = new Core.Chess(fen), u = [];
  for (const s of sans) { const m = g.moveFromSan(s); if (!m) return null; u.push(L.uci(m)); g.make(m); }
  return u;
}

function add(p) {
  const k = keyOf(p.f);
  if (seen.has(k)) return false;
  seen.add(k);
  out.push(p);
  return true;
}

// ------------------------------------------------------------ levels
function levelFor(cat, sol, theme) {
  const n = sol.userMoves;
  if (sol.goal === 'mate') {
    if (sol.mateN === 1) return 0;
    if (sol.mateN === 2) return cat === 'e' ? 1 : 2;
    if (sol.mateN === 3) return 3;
    return 4;
  }
  if (sol.goal === 'draw') return n >= 3 ? 4 : n === 2 ? 3 : 2;
  if (n === 1) return ['hangingPiece', 'materialValue', 'winningExchange'].includes(theme) ? 0 : 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4;
}

function goalCode(sol, fen, cat) {
  if (sol.goal === 'mate') return 'm' + sol.mateN;
  if (sol.goal === 'draw') return 'draw';
  if (cat === 'o') return 'best';
  if (cat === 'e') return 'win';
  const g = new Core.Chess(fen);
  const end = new Core.Chess(fen);
  for (const u of sol.line) end.make(L.fromUci(end, u));
  const gained = L.balance(end, g.turn) - L.balance(g, g.turn);
  return gained >= 2 ? 'mat' : 'win';
}

function makePuzzle(cat, fen, sol, extra) {
  const e = extra || {};
  const theme = e.theme || L.themeOf(fen, sol.line, sol.goal);
  const lvl = e.level !== undefined ? e.level : levelFor(cat, sol, theme);
  const ex = L.explain(fen, sol.line, { lead: e.lead, tail: e.tail });
  const p = { f: fen, s: sol.line.join(' '), g: goalCode(sol, fen, cat), t: theme, l: lvl, c: cat, en: ex.en, es: ex.es };
  if (e.name) p.n = e.name;
  if (e.after) p.a = e.after; // master games: what was played next
  return p;
}

// ------------------------------------------------------------ 1. mined tactics
function loadMined(files) {
  let n = 0, kept = 0;
  for (const f of files) {
    for (const lineTxt of fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)) {
      n++;
      const c = JSON.parse(lineTxt);
      // material should not already be lopsided: puzzles from roughly level positions
      const g = new Core.Chess(c.fen);
      if (Math.abs(L.balance(g, g.turn)) > 3) continue;
      const sol = L.solve(c.fen, { depth: 6, time: 3000, given: c.line, goal: c.goal });
      if (!sol) continue;
      if (add(makePuzzle('t', c.fen, sol))) kept++;
    }
  }
  log(`mined: ${kept} of ${n} kept after re-verification`);
}

// ------------------------------------------------------------ 2. openings
// Well-known traps. lead = short context in our own words.
const TRAPS = [
  { moves: 'e4 e5 Qh5 Nc6 Bc4 Nf6', sol: 'Qxf7#', en: 'Black forgot that f7 was attacked twice.', es: 'Las negras olvidaron que f7 estaba atacado dos veces.' },
  { moves: 'e4 e5 Bc4 Bc5 Qh5 Nf6', sol: 'Qxf7#', en: 'The knight attacks the queen, but f7 is the real story.', es: 'El caballo ataca a la dama, pero lo importante es f7.' },
  { moves: 'f3 e5 g4', sol: 'Qh4#', en: 'White weakened the king’s diagonal with two pawn moves.', es: 'Las blancas debilitaron la diagonal de su rey con dos jugadas de peón.' },
  { moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6', sol: 'Nd6#', en: 'The queen on e2 pins the e-pawn, so a knight check can be deadly.', es: 'La dama en e2 clava el peón e, así que un jaque de caballo puede ser mortal.' },
  { moves: 'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4', sol: 'Nd3#', en: 'White grabbed a bishop, but the king is surrounded by its own pieces.', es: 'Las blancas se llevaron un alfil, pero su rey está rodeado por sus propias piezas.' },
  { moves: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1', sol: 'Bxf7+ Ke7 Nd5#', en: 'Black took the queen. Now the minor pieces strike.', es: 'Las negras se llevaron la dama. Ahora atacan las piezas menores.' },
  { moves: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6', sol: 'Nxe5', en: 'The bishop on g4 looks like it pins the knight to the queen. Does it really?', es: 'El alfil de g4 parece clavar el caballo a la dama. ¿De verdad?' },
  { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5', sol: 'Qg5', en: 'White grabbed the e5 pawn. Find the double attack.', es: 'Las blancas capturaron en e5. Busca el doble ataque.' },
  { moves: 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1', sol: 'Qxe4+ Be2 Nf3#', en: 'White’s king is still in the center and the knight on d4 is close.', es: 'El rey blanco sigue en el centro y el caballo de d4 está muy cerca.' },
  { moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5', sol: 'Nxd5', en: 'White thinks the knight on f6 is pinned to the queen.', es: 'Las blancas creen que el caballo de f6 está clavado a la dama.' },
  { moves: 'd4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4', sol: 'exf2+ Ke2 fxg1=N+', en: 'The pawn on e3 is closer to promoting than it looks.', es: 'El peón de e3 está más cerca de coronar de lo que parece.' },
  { moves: 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3', sol: 'Bb4', en: 'White attacks the queen, but the c1 square is weak.', es: 'Las blancas atacan a la dama, pero la casilla c1 es débil.' },
  { moves: 'e4 e5 Nf3 f6 Nxe5 fxe5', sol: 'Qh5+', en: 'Black accepted the knight. The weakened king pays the price.', es: 'Las negras aceptaron el caballo. Su rey debilitado lo pagará.' },
  { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6', sol: 'Nc6+', en: 'Both queens stand on the e-file.', es: 'Las dos damas están en la columna e.' },
  { moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4', sol: 'c5', en: 'The white bishop on b3 has very few squares.', es: 'El alfil blanco de b3 tiene muy pocas casillas.' },
  { moves: 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5', sol: 'Nxe4 Bxd8 Bxf2+ Ke2 Bg4#', en: 'White attacks the queen. Ignore it!', es: 'Las blancas atacan a la dama. ¡Ignóralo!' },
  { moves: 'd4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5', sol: 'Qf3', en: 'Black’s pawns have left the long diagonal open.', es: 'Los peones negros han dejado abierta la gran diagonal.' }
];

function openingName(sans) {
  return Coach.openingAt(sans);
}

function addTraps() {
  let kept = 0;
  for (const t of TRAPS) {
    const sans = t.moves.split(' ');
    let g;
    try { g = L.playSans(sans); } catch (e) { log('trap illegal:', t.moves, e.message); continue; }
    const fen = g.fen();
    const given = uciLine(fen, t.sol.split(' '));
    if (!given) { log('trap solution illegal:', t.moves, '|', t.sol); continue; }
    const goal = /#$/.test(t.sol) ? 'mate' : 'win';
    const sol = L.solve(fen, { depth: 7, time: 4000, given, goal });
    if (!sol || sol.line.length !== given.length) { log('trap not verified:', t.moves, '|', t.sol, sol && sol.line.join(' ')); continue; }
    const op = openingName(sans);
    const lead = {
      en: (op ? `From the [[the:${op}]]. ` : '') + t.en,
      es: (op ? `De [[the:${op}]]. ` : '') + t.es
    };
    if (add(makePuzzle('o', fen, sol, { lead, theme: undefined }))) kept++;
  }
  log(`traps: ${kept} of ${TRAPS.length}`);
}

// Real opening positions where a natural-looking move is a mistake.
// Positions come from the book lines, continued for a few moves with good
// engine moves, so they stay in the opening (by move 12).
function addOpeningBlunders(limit, minutes) {
  const end = Date.now() + (minutes || 20) * 60000;
  const tried = new Set();
  let kept = 0;
  while (kept < limit && Date.now() < end) {
    const book = BOOK_LINES[Math.floor(rand() * BOOK_LINES.length)];
    const k = 4 + Math.floor(rand() * Math.min(10, book.length - 3));
    const sans = book.slice(0, Math.min(k, book.length));
    const g = L.playSans(sans);
    const op = openingName(sans);
    // continue with 0-6 good moves (one of the engine's top three)
    const extra = Math.floor(rand() * 7);
    for (let i = 0; i < extra && !g.status().over; i++) {
      const r = S.analyzeAll(g, { maxDepth: 2, timeMs: 200 }).slice(0, 3).filter((x, j, arr) => x.score >= arr[0].score - 40);
      g.make(r[Math.floor(rand() * r.length)].move);
    }
    if (g.status().over || g.full > 12) continue;
    const key = keyOf(g.fen());
    if (tried.has(key)) continue;
    tried.add(key);
    const quick = S.analyzeAll(g, { maxDepth: 2, timeMs: 300 });
    const deep = S.analyzeAll(g, { maxDepth: 5, timeMs: 2000 });
    if (!deep.length || Math.abs(deep[0].score) > 150) continue;
    const bestDeep = deep[0].score;
    // plausible at a glance (among the top moves at depth 2) but losing at depth 5
    const blunders = quick.slice(0, 8).map(q => q.move).filter(m => {
      const d = deep.find(x => x.move === m);
      return d && bestDeep - d.score >= 220 && d.score <= -150;
    });
    for (const b of blunders.slice(0, 1)) {
      const bsan = g.san(b, g.moves());
      g.make(b);
      const fen = g.fen();
      g.undo();
      const sol = L.solve(fen, { depth: 6, time: 3000, maxUser: 4 });
      if (!sol) continue;
      const side = { en: g.turn === 0 ? 'White' : 'Black', es: g.turn === 0 ? 'las blancas' : 'las negras' };
      const lead = {
        en: (op ? `From the [[the:${op}]]. ` : '') + `${side.en}’s last move, {{${bsan}}}, was a mistake.`,
        es: (op ? `De [[the:${op}]]. ` : '') + `La última jugada de ${side.es}, {{${bsan}}}, fue un error.`
      };
      if (add(makePuzzle('o', fen, sol, { lead }))) kept++;
    }
  }
  log(`opening blunders: ${kept} (${tried.size} positions)`);
}

// ------------------------------------------------------------ 3. famous games
// Only games whose moves are well documented; puzzles start at given ply.
const GAMES = [
  {
    en: 'Paul Morphy vs. the Duke of Brunswick and Count Isouard, Paris 1858 (the “Opera Game”)',
    es: 'Paul Morphy contra el duque de Brunswick y el conde Isouard, París 1858 (la “Partida de la Ópera”)',
    moves: 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#',
    result: { en: 'Morphy won with checkmate.', es: 'Morphy ganó con jaque mate.' },
    starts: [[30, 3], [32, 1], [24, 1], [18, 1], [28, 1]]
  },
  {
    en: 'Adolf Anderssen vs. Lionel Kieseritzky, London 1851 (the “Immortal Game”)',
    es: 'Adolf Anderssen contra Lionel Kieseritzky, Londres 1851 (la “Partida Inmortal”)',
    moves: 'e4 e5 f4 exf4 Bc4 Qh4+ Kf1 b5 Bxb5 Nf6 Nf3 Qh6 d3 Nh5 Nh4 Qg5 Nf5 c6 g4 Nf6 Rg1 cxb5 h4 Qg6 h5 Qg5 Qf3 Ng8 Bxf4 Qf6 Nc3 Bc5 Nd5 Qxb2 Bd6 Bxg1 e5 Qxa1+ Ke2 Na6 Nxg7+ Kd8 Qf6+ Nxf6 Be7#',
    result: { en: 'Anderssen had given up both rooks, a bishop and his queen, and still delivered mate.', es: 'Anderssen había entregado las dos torres, un alfil y la dama, y aun así dio mate.' },
    starts: [[40, 5], [42, 3], [44, 1], [36, 1]]
  },
  {
    en: 'Adolf Anderssen vs. Jean Dufresne, Berlin 1852 (the “Evergreen Game”)',
    es: 'Adolf Anderssen contra Jean Dufresne, Berlín 1852 (la “Partida Siempreviva”)',
    moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d3 Qb3 Qf6 e5 Qg6 Re1 Nge7 Ba3 b5 Qxb5 Rb8 Qa4 Bb6 Nbd2 Bb7 Ne4 Qf5 Bxd3 Qh5 Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#',
    result: { en: 'Anderssen finished with a famous double check and mate.', es: 'Anderssen terminó con un célebre jaque doble y mate.' },
    starts: [[40, 7], [38, 9], [42, 5], [44, 3], [46, 1]]
  },
  {
    en: 'Richard Réti vs. Savielly Tartakower, Vienna 1910',
    es: 'Richard Réti contra Savielly Tartakower, Viena 1910',
    moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Kc7 Bd8#',
    result: { en: 'The game ended with this short, famous queen sacrifice.', es: 'La partida terminó con este breve y famoso sacrificio de dama.' },
    starts: [[16, 5], [18, 3], [20, 1]]
  },
  {
    en: 'Edward Lasker vs. George Thomas, London 1912',
    es: 'Edward Lasker contra George Thomas, Londres 1912',
    moves: 'd4 e6 Nf3 f5 Nc3 Nf6 Bg5 Be7 Bxf6 Bxf6 e4 fxe4 Nxe4 b6 Ne5 O-O Bd3 Bb7 Qh5 Qe7 Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5 h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#',
    result: { en: 'The black king was chased across the whole board and mated on g1.', es: 'El rey negro fue perseguido por todo el tablero y recibió mate en g1.' },
    starts: [[20, 15], [26, 9], [28, 7], [30, 5], [32, 3]]
  },
  {
    en: 'Donald Byrne vs. Bobby Fischer, New York 1956 (the “Game of the Century”)',
    es: 'Donald Byrne contra Bobby Fischer, Nueva York 1956 (la “Partida del Siglo”)',
    moves: 'Nf3 Nf6 c4 g6 Nc3 Bg7 d4 O-O Bf4 d5 Qb3 dxc4 Qxc4 c6 e4 Nbd7 Rd1 Nb6 Qc5 Bg4 Bg5 Na4 Qa3 Nxc3 bxc3 Nxe4 Bxe7 Qb6 Bc4 Nxc3 Bc5 Rfe8+ Kf1 Be6 Bxb6 Bxc4+ Kg1 Ne2+ Kf1 Nxd4+ Kg1 Ne2+ Kf1 Nc3+ Kg1 axb6',
    result: { en: 'Fischer, aged 13, came out with a rook, two bishops and a knight for the queen and went on to win.', es: 'Fischer, con 13 años, obtuvo torre, dos alfiles y caballo por la dama y acabó ganando.' },
    starts: [[33, 1], [35, 1], [21, 1], [25, 1]]
  }
];

function addGames() {
  let kept = 0;
  for (const game of GAMES) {
    const all = game.moves.split(' ');
    try { L.playSans(all); } catch (e) { log('GAME ILLEGAL', game.en, e.message); continue; }
    for (const [ply, len] of game.starts) {
      const g = L.playSans(all.slice(0, ply));
      const fen = g.fen();
      const solSans = all.slice(ply, ply + len);
      const given = uciLine(fen, solSans);
      const goal = /#$/.test(solSans[solSans.length - 1]) && ply + len === all.length ? 'mate' : 'win';
      const sol = L.solve(fen, { depth: goal === 'mate' ? 8 : 7, time: 6000, given, goal });
      if (!sol || sol.line.length !== given.length) {
        log('game puzzle not verified:', game.en.slice(0, 30), 'ply', ply, solSans.join(' '), '->', sol && sol.line.join(' '));
        continue;
      }
      const moveNo = Math.floor(ply / 2) + 1;
      const rest = all.slice(ply);
      // what was actually played from here, and how the game went on
      let after;
      if (rest.length === sol.line.length) {
        after = { en: `That is exactly how the game ended. ${game.result.en}`, es: `Así terminó exactamente la partida. ${game.result.es}` };
      } else {
        const played = rest.map(x => `{{${x}}}`).join(' ');
        after = { en: `In the game: ${played}. ${game.result.en}`, es: `En la partida: ${played}. ${game.result.es}` };
      }
      const lead = { en: `Move ${moveNo} of this game.`, es: `Jugada ${moveNo} de esta partida.` };
      if (add(makePuzzle('g', fen, sol, { lead, after, name: { en: game.en, es: game.es } }))) kept++;
    }
  }
  log(`famous games: ${kept}`);
}

// ------------------------------------------------------------ 4. endgames
function placeFen(pieces, turn) {
  // pieces: [{p:'K', sq}] with sq 0..63 (a1 = 0)
  const b = Array(64).fill('');
  for (const x of pieces) b[x.sq] = x.p;
  let s = '';
  for (let r = 7; r >= 0; r--) {
    let e = 0;
    for (let f = 0; f < 8; f++) {
      const c = b[r * 8 + f];
      if (!c) { e++; continue; }
      if (e) { s += e; e = 0; }
      s += c;
    }
    if (e) s += e;
    if (r) s += '/';
  }
  return `${s} ${turn} - - 0 1`;
}
const fileOf = s => s % 8, rankOf = s => s >> 3;
const touch = (a, b) => Math.abs(fileOf(a) - fileOf(b)) <= 1 && Math.abs(rankOf(a) - rankOf(b)) <= 1;

function randomPosition(spec, turn, extraCheck) {
  for (let tries = 0; tries < 200; tries++) {
    const used = new Set(), pcs = [];
    let ok = true;
    for (const [p, constraint] of spec) {
      let sq, n = 0;
      do { sq = Math.floor(rand() * 64); n++; } while ((used.has(sq) || (constraint && !constraint(sq, pcs))) && n < 200);
      if (n >= 200) { ok = false; break; }
      if (p.toLowerCase() === 'p' && (rankOf(sq) === 0 || rankOf(sq) === 7)) { ok = false; break; }
      used.add(sq);
      pcs.push({ p, sq });
    }
    if (!ok) continue;
    const K = pcs.find(x => x.p === 'K'), k = pcs.find(x => x.p === 'k');
    if (touch(K.sq, k.sq)) continue;
    const fen = placeFen(pcs, turn);
    const g = new Core.Chess(fen);
    if (g.inCheck(g.turn ^ 8)) continue; // side not to move may not be in check
    if (!g.moves().length) continue;
    if (extraCheck && !extraCheck(g, pcs)) continue;
    return { fen, pcs };
  }
  return null;
}

// Direct opposition: kings on the same line with one square between, the other side to move.
function opposition(g) {
  const a = g.kings[0], b = g.kings[1];
  const df = Math.abs((a & 7) - (b & 7)), dr = Math.abs((a >> 4) - (b >> 4));
  return (df === 0 && dr === 2) || (dr === 0 && df === 2);
}

const ENDGAME_TEXT = {
  basicMate: {
    en: 'The defending king is pushed to the edge, where it has few squares left.',
    es: 'El rey defensor está arrinconado en el borde, donde le quedan pocas casillas.'
  },
  oppositionWin: {
    en: 'In king and pawn endings the kings fight for key squares. Taking the [[opposition]] forces the other king to give way.',
    es: 'En los finales de rey y peón los reyes luchan por las casillas clave. Tomar la [[opposition]] obliga al otro rey a ceder el paso.'
  },
  oppositionDraw: {
    en: 'The defending king must keep the [[opposition]] in front of the pawn; any other move lets the pawn through.',
    es: 'El rey defensor debe mantener la [[opposition]] delante del peón; cualquier otra jugada deja pasar al peón.'
  },
  kp: {
    en: 'A king and pawn ending: only one move keeps the win, so count carefully.',
    es: 'Un final de rey y peón: solo una jugada mantiene la victoria, así que cuenta con cuidado.'
  },
  kpDraw: {
    en: 'A king and pawn ending: only one move saves the game.',
    es: 'Un final de rey y peón: solo una jugada salva la partida.'
  },
  square: {
    en: 'Use the [[ruleOfSquare]]: the king can catch the pawn only if it steps into the pawn’s square right now.',
    es: 'Aplica la [[ruleOfSquare]]: el rey solo alcanza al peón si entra ahora mismo en su cuadrado.'
  },
  lucena: {
    en: 'This is the [[lucena]]: the winning side shelters its king with the rook and promotes.',
    es: 'Es la [[lucena]]: el bando fuerte protege a su rey con la torre y corona.'
  },
  breakthrough: {
    en: 'A pawn [[breakthrough]]: by giving up pawns, one pawn gets through and promotes.',
    es: 'Una [[breakthrough]] de peones: entregando peones, uno pasa y corona.'
  }
};

function endgameLead(theme) {
  const t = ENDGAME_TEXT[theme];
  return t ? { en: t.en, es: t.es } : null;
}

function addEndgameSet(name, count, maker, opts) {
  let kept = 0, tries = 0;
  while (kept < count && tries < count * 60) {
    tries++;
    const pos = maker();
    if (!pos) continue;
    const sol = L.solve(pos.fen, Object.assign({ depth: 10, time: 2500, maxUser: 5 }, opts.solve || {}));
    if (!sol) continue;
    if (opts.accept && !opts.accept(pos, sol)) continue;
    const theme = typeof opts.theme === 'function' ? opts.theme(pos, sol) : opts.theme;
    if (!theme) continue;
    const lead = endgameLead(theme === 'opposition' ? (sol.goal === 'draw' ? 'oppositionDraw' : 'oppositionWin') : theme);
    if (add(makePuzzle('e', pos.fen, sol, { lead, theme: theme === 'kp' || theme === 'kpDraw' ? 'kingPawnEnding' : theme }))) kept++;
  }
  log(`endgames ${name}: ${kept} (${tries} tries)`);
}

function addEndgames() {
  const side = () => (rand() < 0.5 ? 'w' : 'b');
  const swapIfBlack = (spec, turn) => turn === 'w' ? spec : spec.map(([p, c]) => [p === p.toUpperCase() ? p.toLowerCase() : p.toUpperCase(), c]);
  // Basic mates with queen and with rook (defending king near an edge).
  const edge = sq => fileOf(sq) === 0 || fileOf(sq) === 7 || rankOf(sq) === 0 || rankOf(sq) === 7;
  const near = (sq, pcs) => { const K = pcs.find(x => x.p === 'K' || x.p === 'k'); return Math.max(Math.abs(fileOf(sq) - fileOf(K.sq)), Math.abs(rankOf(sq) - rankOf(K.sq))) <= 3; };
  for (const [piece, cnt] of [['Q', 22], ['R', 22]]) {
    addEndgameSet('mate ' + piece, cnt, () => {
      const t = side();
      return randomPosition(swapIfBlack([['k', edge], ['K', near], [piece, null]], t), t);
    }, { theme: 'basicMate', solve: { goal: 'mate', depth: 9, time: 2500 }, accept: (p, s) => s.mateN <= 4 });
  }
  // King and pawn vs king: one move wins (or one move draws).
  const kpk = t => randomPosition(swapIfBlack([['K', null], ['P', sq => rankOf(sq) >= 2 && rankOf(sq) <= 5 && fileOf(sq) > 0 && fileOf(sq) < 7], ['k', null]], t), t);
  addEndgameSet('K+P wins', 18, () => kpk(side()), {
    solve: { goal: 'win', depth: 14, time: 3000, maxUser: 3 },
    theme: (pos, sol) => {
      const g = new Core.Chess(pos.fen);
      const m = L.fromUci(g, sol.line[0]);
      if ((g.board[Core.mFrom(m)] & 7) !== 6) return 'kp';
      g.make(m);
      return opposition(g) ? 'opposition' : 'kp';
    }
  });
  // Defender to move: only one move holds (opposition, or catching the pawn in its square).
  addEndgameSet('K+P holds', 16, () => {
    const t = side();
    // the side to move has the lone king; the pawn belongs to the other side
    const spec = t === 'w' ? [['K', null], ['k', null], ['p', sq => rankOf(sq) >= 2 && rankOf(sq) <= 6]] : [['k', null], ['K', null], ['P', sq => rankOf(sq) >= 1 && rankOf(sq) <= 5]];
    return randomPosition(spec, t);
  }, {
    solve: { goal: 'draw', depth: 14, time: 3000, maxUser: 2 },
    theme: (pos, sol) => {
      const g = new Core.Chess(pos.fen);
      const m = L.fromUci(g, sol.line[0]);
      g.make(m);
      if (opposition(g)) return 'opposition';
      // pawn far from both kings at the start: catching it is the rule of the square
      const pawn = pos.pcs.find(x => x.p.toLowerCase() === 'p');
      const myK = pos.pcs.find(x => x.p === (g.turn === 0 ? 'k' : 'K'));
      return Math.abs(fileOf(pawn.sq) - fileOf(myK.sq)) >= 3 ? 'square' : 'kpDraw';
    }
  });
  // Pawn breakthroughs: three pawns against three, kings far away.
  for (let i = 0; i < 12; i++) {
    const f0 = Math.floor(rand() * 6); // files f0..f0+2
    const wr = 4, br = 6; // white pawns on rank 5, black on rank 7
    const pcs = [];
    for (let f = f0; f < f0 + 3; f++) { pcs.push({ p: 'P', sq: wr * 8 + f }); pcs.push({ p: 'p', sq: br * 8 + f }); }
    const kf = f0 >= 3 ? 0 : 7;
    pcs.push({ p: 'K', sq: Math.floor(rand() * 2) * 8 + kf });
    pcs.push({ p: 'k', sq: (3 + Math.floor(rand() * 2)) * 8 + (kf === 0 ? 1 : 6) });
    const fen = placeFen(pcs, 'w');
    const g = new Core.Chess(fen);
    if (g.inCheck(8) || touch(pcs[6].sq, pcs[7].sq)) continue;
    const sol = L.solve(fen, { goal: 'win', depth: 12, time: 4000, maxUser: 4 });
    if (!sol) continue;
    add(makePuzzle('e', fen, sol, { lead: endgameLead('breakthrough'), theme: 'breakthrough' }));
  }
  // Lucena: king on the queening square, pawn on the 7th, defending king cut off.
  let luc = 0;
  for (let i = 0; i < 80 && luc < 8; i++) {
    const f = 1 + Math.floor(rand() * 6);
    const pcs = [{ p: 'K', sq: 7 * 8 + f }, { p: 'P', sq: 6 * 8 + f }];
    const cutFile = f + (rand() < 0.5 ? -2 : 2);
    if (cutFile < 0 || cutFile > 7) continue;
    const kFile = cutFile + (cutFile > f ? 1 : -1);
    if (kFile < 0 || kFile > 7) continue;
    pcs.push({ p: 'k', sq: (5 + Math.floor(rand() * 2)) * 8 + kFile });
    pcs.push({ p: 'R', sq: Math.floor(rand() * 3) * 8 + (cutFile > f ? cutFile - 1 : cutFile + 1) });
    const rf = f + (cutFile > f ? -1 : 1);
    if (rf < 0 || rf > 7) continue;
    pcs.push({ p: 'r', sq: (1 + Math.floor(rand() * 3)) * 8 + rf });
    const sqs = new Set(pcs.map(x => x.sq));
    if (sqs.size !== pcs.length) continue;
    const fen = placeFen(pcs, 'w');
    const g = new Core.Chess(fen);
    if (g.inCheck(8) || !g.moves().length) continue;
    const sol = L.solve(fen, { goal: 'win', depth: 12, time: 5000, maxUser: 3 });
    if (!sol) continue;
    if (add(makePuzzle('e', fen, sol, { lead: endgameLead('lucena'), theme: 'lucena', level: sol.userMoves >= 2 ? 4 : 3 }))) luc++;
  }
  log(`endgames Lucena: ${luc}`);
}

// ------------------------------------------------------------ main
// --merge a.js b.js ...: combine partial outputs (built with ONLY=... OUT=...) into one file.
const merging = process.argv[2] === '--merge';
const minedFiles = merging ? [] : process.argv.slice(2);
if (merging) {
  for (const f of process.argv.slice(3)) {
    const ctx = { self: {} };
    require('vm').runInNewContext(fs.readFileSync(f, 'utf8'), ctx);
    ctx.self.CHALLENGES.forEach(p => { delete p.i; add(p); });
  }
}
const ONLY = merging ? [] : process.env.ONLY ? process.env.ONLY.split(',') : null; // e.g. ONLY=games,traps for a quick test
const want = k => !ONLY || ONLY.includes(k);
const t0 = Date.now();
if (want('games')) addGames();
if (want('traps')) addTraps();
if (want('endgames')) addEndgames();
if (want('blunders')) addOpeningBlunders(+(process.env.BLUNDERS || 80), +(process.env.MINUTES || 25));
if (minedFiles.length) loadMined(minedFiles);

// Themes without a glossary entry of their own.
const THEME_ALIAS = { mateThreat: 'threat', backRankThreat: 'backRankMate', square: 'ruleOfSquare', kp: 'kingPawnEnding', kpDraw: 'kingPawnEnding' };
for (const p of out) if (THEME_ALIAS[p.t]) p.t = THEME_ALIAS[p.t];
// Shuffle and give stable ids.
out.sort(() => rand() - 0.5);
// Ids come from the position, so saved progress survives future rebuilds.
const fnv = str => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
const used = new Set();
out.forEach(p => { let id = fnv(keyOf(p.f)); while (used.has(id)) id += 'x'; used.add(id); p.i = id; });
const counts = {};
for (const p of out) { const k = p.c + LEVELS[p.l][0]; counts[k] = (counts[k] || 0) + 1; }
log('total', out.length, 'by category/level', JSON.stringify(counts), `in ${Math.round((Date.now() - t0) / 1000)}s`);
const header = '/* Challenge puzzles: generated and engine-verified by tools/build-challenges.js. Loaded on demand. */\n';
fs.writeFileSync(process.env.OUT || path.join(__dirname, '..', 'data', 'challenges.js'), header + 'self.CHALLENGES = ' + JSON.stringify(out) + ';\n');
