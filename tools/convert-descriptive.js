/*
 * Converts the game scores of "Chess Fundamentals" Part II from descriptive
 * notation (P - K 4, Kt x B ch) to moves the app can play, by matching each
 * description against the legal moves. A game is kept only if every move
 * matches exactly one legal move. Writes books/fundamentals/games.json.
 * Usage: node tools/convert-descriptive.js [book]
 *   fundamentals (default): the games of Part II, one per chapter
 *   bluebook: every "Game" inside each chapter, written in the older long style
 *             ("K. Kt. to K. B's 3d.", "Q. takes P.", "Castles on K's side")
 */
'use strict';
const fs = require('fs');
const L = require('./challenge-lib.js');
const { Core } = L;
const BOOK = process.argv[2] || 'fundamentals';
const book = JSON.parse(fs.readFileSync(`books/${BOOK}/text.json`, 'utf8'));

const FILE = { QR: 0, QKt: 1, QB: 2, Q: 3, K: 4, KB: 5, KKt: 6, KR: 7 };
const PIECE = { P: 1, Kt: 2, B: 3, R: 4, Q: 5, K: 6 };
// "K. Kt. to K. B's 3d." -> "K Kt - K B 3"; "Q. P. takes B." -> "Q P x B"; "Castles on Q's side" -> "O-O-O"
function longStyle(t) {
  t = t.replace(/\[[A-Z]\]/g, '').replace(/\(ch\.?\)|\bch\./gi, '').replace(/[.,;:!?]+\s*$/, '').trim();
  if (/^castles/i.test(t)) return /Q(ueen)?'?s side/i.test(t) ? 'O-O-O' : 'O-O';
  t = t.replace(/\b(Kt|K|Q|R|B|P)\.?(?=\s|'|$)/g, '$1');
  t = t.replace(/\s*en passant/i, '').replace(/\s+checks?\b/i, '');
  t = t.replace(/'s/g, '').replace(/\b(\d)(st|d|nd|rd|th)\b/g, '$1').replace(/\b(sq|square)\b\.?/g, '1');
  // "his"/"her" name the moving piece's own side: "K Kt to his 5" is KKt5, "Q to her Kt 3" is QKt3
  const mv = /^(.*?)\s+(to|takes)\s+(his|her)\s+(.*)$/.exec(t);
  if (mv) {
    const mover = mv[1].trim(), side = mv[3] === 'her' ? 'Q' : 'K';
    const own = /^[QK]\s/.test(mover) || mover === 'K' || mover === 'Q' ? mover : side + ' ' + mover;
    t = `${mover} ${mv[2]} ${/^\d/.test(mv[4]) ? own.replace(/\s*P$/, '') + ' ' + mv[4] : side + ' ' + mv[4]}`;
  }
  t = t.replace(/\s+to\s+/, ' - ').replace(/\s+takes\s+/, ' x ');
  t = t.replace(/\bQueens?\b/g, 'Q').replace(/\(?\s*(?:and )?(?:dis\.?|discovers?)\s*ch(eck)?\.?\)?/gi, '');
  return t.replace(/\./g, '').replace(/\s+/g, ' ').trim();
}
const norm = s => s.replace(/<sup>.*?<\/sup>/g, '').replace(/&nbsp;/g, ' ').replace(/&times;|×|�/g, 'x').replace(/<[^>]+>/g, '').replace(/[!?]+/g, '').replace(/\s+/g, ' ').trim();

// Squares a descriptor like "Q B 4", "B 4", "K 3" can mean, for the side to move.
function squares(desc, black) {
  const m = /^(Q|K)?\s?(R|Kt|B|Q|K)?\s?([1-8])$/.exec(desc.trim());
  if (!m) return null;
  const rank = black ? 8 - +m[3] : +m[3] - 1;
  let files;
  if (!m[2]) files = m[1] === 'Q' ? [3] : [4];                 // "Q 4" / "K 4"
  else if (m[2] === 'Q' || m[2] === 'K') files = [FILE[m[2]]];
  else files = m[1] ? [FILE[m[1] + m[2]]] : [FILE['Q' + m[2]], FILE['K' + m[2]]];
  return files.map(f => rank * 16 + f);
}
// "Kt P", "Q B P", "B", "K Kt" -> piece type and possible files of the captured piece
function target(desc) {
  const toks = desc.trim().split(' ');
  const type = PIECE[toks[toks.length - 1]];
  if (!type) return null;
  const q = toks.slice(0, -1).join('');
  let files = null;
  if (q) {
    if (FILE[q] !== undefined) files = [FILE[q]];
    else if (q === 'Q' || q === 'K') files = type === 1 ? [FILE[q]] : q === 'Q' ? [0, 1, 2, 3] : [4, 5, 6, 7];
    else if (PIECE[q]) files = q === 'Kt' ? [1, 6] : q === 'B' ? [2, 5] : q === 'R' ? [0, 7] : [FILE[q]];
    else return null;
  }
  return { type, files };
}
function candidates(g, text) {
  let t = text.replace(/\s*(ch|dis ch|dbl ch|mate|e\.p\.|e p)\.?$/i, '').replace(/\s*ch\s*$/, '').trim();
  const black = g.turn === 8;
  const legal = g.moves();
  if (/^O\s?-\s?O\s?-\s?O/.test(t)) return legal.filter(m => (g.board[Core.mFrom(m)] & 7) === 6 && Core.mTo(m) - Core.mFrom(m) === -2);
  if (/^O\s?-\s?O/.test(t)) return legal.filter(m => (g.board[Core.mFrom(m)] & 7) === 6 && Core.mTo(m) - Core.mFrom(m) === 2);
  let promo = 0;
  const pm = /(?:=|\s)\s?\(?(Q|R|B|Kt)\)?$/.exec(t);
  if (pm && /8/.test(t)) { promo = PIECE[pm[1]]; t = t.slice(0, pm.index).trim(); }
  t = t.replace(/\s+X\s+/g, ' x ').replace(/^(P|Kt|B|R|Q|K) (?=(?:[QK] )?(?:(?:R|Kt|B) )?[1-8]$)/, '$1 - '); // also "P K 4" (a missing dash)
  const m = /^(.*?)\s?(?:\(([^)]*)\))?\s?([-x])\s?(.+)$/.exec(t);
  if (!m) return [];
  const [, mover, fromHint, op, restAll] = m;
  const mt = mover.trim().split(' ').filter(Boolean);
  const type = PIECE[mt[mt.length - 1]];
  if (!type) return [];
  const q = mt.slice(0, -1).join('');          // "Q", "K", "QB", "Kt", "R"... qualifier of the moving piece
  let list = legal.filter(mv => (g.board[Core.mFrom(mv)] & 7) === type);
  if (promo) list = list.filter(mv => Core.mPromo(mv) === promo);
  else list = list.filter(mv => !Core.mPromo(mv) || Core.mPromo(mv) === 5);
  if (q) {
    let files;
    if (type === 1) files = FILE[q] !== undefined ? [FILE[q]] : q === 'Kt' ? [1, 6] : q === 'B' ? [2, 5] : q === 'R' ? [0, 7] : null;
    else files = q === 'Q' ? [0, 1, 2, 3] : q === 'K' ? [4, 5, 6, 7] : null;
    if (files) {
      const f = list.filter(mv => files.includes(Core.mFrom(mv) & 7));
      // "K R" means the king's rook even after it has moved across: if no piece fits by side, ignore it
      if (f.length || type === 1) list = f;
    }
  }
  if (fromHint) { const sq = squares(fromHint, black); if (sq) list = list.filter(mv => sq.includes(Core.mFrom(mv))); }
  if (op === '-') {
    const sq = squares(restAll, black);
    if (!sq) return [];
    return list.filter(mv => sq.includes(Core.mTo(mv)) && !g.board[Core.mTo(mv)]);
  }
  // capture: "B", "Kt P", "P (K 3)"
  const tm = /^(.*?)\s?(?:\(([^)]*)\))?$/.exec(restAll.trim());
  const tg = target(tm[1]);
  if (!tg) return [];
  const atSq = tm[2] ? squares(tm[2], black) : null;
  return list.filter(mv => {
    const to = Core.mTo(mv);
    const ep = type === 1 && to === g.ep && tg.type === 1;
    const cap = ep ? 1 : g.board[to] & 7;
    if (cap !== tg.type) return false;
    if (atSq && !atSq.includes(to)) return false;
    return !tg.files || tg.files.includes(to & 7);
  });
}
// When the description fits two legal moves, the author meant the sensible one:
// take the move the engine rates clearly higher (the next moves confirm it).
function pick(g, c) {
  if (c.length === 1) return { move: c[0] };
  if (!c.length || c.length > 3) return null;
  const res = L.analyze(g, 5, 800).filter(r => c.includes(r.move));
  if (res.length !== c.length) return null;
  return { move: res[0].move, guessed: true }; // analyze() returns the best first
}

// Each game: its title, the chapter it is in, and its move-table rows.
const sources = [];
if (BOOK === 'fundamentals') {
  book.chapters.forEach((ch, idx) => {
    if (ch.part !== 'PART II') return;
    const players = /White:\s*([^<]*?)\s+Black:\s*([^<]*?)\.?\s*<\/p>/.exec(ch.html.replace(/&nbsp;/g, ' '));
    sources.push({ idx, title: ch.title, html: ch.html, white: players ? players[1].trim() : '', black: players ? players[2].trim() : '' });
  });
} else {
  book.chapters.forEach((ch, idx) => {
    const parts = ch.html.split(/(?=<p[^>]*>\s*<span[^>]*>Game<\/span>)/);
    for (const part of parts.slice(1)) {
      const head = /<p[^>]*>\s*<span[^>]*>Game<\/span>\s*([^<]*)/.exec(part);
      const title = ('Game ' + (head ? head[1] : '')).replace(/&mdash;/g, ' — ').replace(/\s+/g, ' ').trim();
      sources.push({ idx, title, html: part.split(/<h2/)[0], white: '', black: '' });
    }
  });
}
const out = [];
for (const src of sources) {
  const ch = src;
  const rows = [...ch.html.matchAll(/<tr>(.*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(c => norm(c[1])));
  const g = new Core.Chess();
  const sans = [];
  let ok = true, why = '', guessed = 0;
  for (const r of rows) {
    const mm = /^(\d+)\.\s*(.*)$/.exec(r[0] || '');
    if (!mm) continue;
    const num = +mm[1];
    const blackTxt = (r[1] || '').replace(/^\d+\.\s*/, '');
    const plies = [[mm[2], 0], [blackTxt, 1]];
    for (let [txt, side] of plies) {
      if (BOOK !== 'fundamentals') txt = longStyle(txt);
      if (!txt || /^\.+$/.test(txt.replace(/\s/g, ''))) continue;
      if (/resigns|drawn|wins|mate$/i.test(txt) && !/ - | x |O-O/.test(txt)) continue;
      const expectPly = (num - 1) * 2 + side;
      if (expectPly !== sans.length) { ok = false; why = `numbering at ${num}${side ? '...' : '.'} (${sans.length})`; break; }
      let c = candidates(g, txt);
      // "Q B x B": qualifiers name where a piece started, not where it is; if nothing fits, drop them
      if (!c.length) c = candidates(g, txt.replace(/(^|[x-]\s?)(?:[QK]\s)(?=(?:Kt|B|R)\b)/g, '$1'));
      const p = pick(g, c);
      if (!p) { ok = false; why = `${num}${side ? '...' : '.'} "${txt}" -> ${c.length} candidates`; break; }
      if (p.guessed) guessed++;
      sans.push(g.san(p.move, g.moves()));
      g.make(p.move);
    }
    if (!ok) break;
  }
  if (process.env.VERBOSE || BOOK === 'fundamentals') console.log((ok ? 'OK  ' : 'FAIL'), ch.title.slice(0, 60), sans.length, 'plies', ok ? `(${guessed} ties settled by the engine)` : why);
  if (ok && sans.length > 10) out.push({ idx: ch.idx, title: ch.title, white: ch.white, black: ch.black, moves: sans.join(' ') });
}
console.log(out.length, 'of', sources.length, 'games converted');
fs.writeFileSync(`books/${BOOK}/games.json`, JSON.stringify(out));
