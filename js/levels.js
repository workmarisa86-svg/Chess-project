/*
 * Levels: a numbered path of puzzles from the Lichess open puzzle database
 * (lichess.org, CC0 public domain), from Level 1 up to the hardest.
 *
 * The puzzles live in data/levels/000.js, 001.js, ... (CHUNK puzzles each),
 * loaded only when needed. Each chunk calls Levels.add(k, text), where text
 * has one puzzle per line:
 *   id placement side castling ep moves rating themes
 * moves are UCI moves written together (promotion piece in capitals, e.g.
 * "e7e8Q"); the first is the opponent's last move, played before the
 * solver's turn. themes are one-character codes (THEMES below), "-" if none.
 *
 * explain() writes the explanation shown after the puzzle in English and
 * Spanish: it names the tactic (Lichess theme tags) and describes, from the
 * solution line and the coach's tactic detection, which pieces do what and
 * what is won. {{SAN}} marks a move, [[term]] a glossary term.
 */
const Levels = (function () {
  'use strict';
  const { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, F_CAPTURE, F_EP, F_CASTLE,
    sqName, mFrom, mTo, mPromo, mFlags } = Core;

  const CHUNK = 2000;
  const TOTAL = 199999; // written by tools/build-levels.js
  // Lichess rating of the first puzzle of each file (written by tools/build-levels.js).
  const STARTS = [400, 816, 906, 955, 962, 994, 1026, 1062, 1083, 1109, 1113, 1139, 1142, 1165, 1158, 1174, 1192, 1212, 1231, 1255, 1260, 1293, 1309, 1334, 1341, 1356, 1366, 1394, 1400, 1414, 1450, 1467, 1476, 1489, 1513, 1523, 1556, 1562, 1585, 1602, 1617, 1614, 1621, 1630, 1649, 1644, 1653, 1659, 1679, 1681, 1684, 1699, 1720, 1724, 1733, 1750, 1746, 1756, 1782, 1789, 1796, 1807, 1822, 1818, 1839, 1859, 1860, 1885, 1898, 1890, 1919, 1920, 1925, 1946, 1955, 1971, 1966, 1987, 1998, 2015, 2025, 2051, 2063, 2073, 2092, 2094, 2116, 2138, 2155, 2162, 2191, 2209, 2237, 2259, 2294, 2320, 2349, 2387, 2447, 2549];

  // Lichess theme tags kept in the data (index = code character).
  const CODES = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const THEMES = ['sacrifice', 'deflection', 'attraction', 'clearance', 'interference', 'discoveredAttack',
    'discoveredCheck', 'doubleCheck', 'skewer', 'fork', 'pin', 'xRayAttack', 'intermezzo', 'quietMove', 'zugzwang',
    'capturingDefender', 'trappedPiece', 'exposedKing', 'defensiveMove', 'promotion', 'underPromotion', 'advancedPawn',
    'attackingF2F7', 'enPassant', 'castling', 'kingsideAttack', 'queensideAttack', 'crushing', 'advantage', 'equality',
    'backRankMate', 'smotheredMate', 'anastasiaMate', 'arabianMate', 'bodenMate', 'doubleBishopMate', 'dovetailMate',
    'hookMate', 'killBoxMate', 'vukovicMate', 'balestraMate', 'triangleMate', 'cornerMate', 'blindSwineMate', 'operaMate',
    'pillsburysMate', 'morphysMate', 'epauletteMate', 'swallowstailMate'];
  const encodeThemes = tags => tags.map(t => THEMES.indexOf(t)).filter(i => i >= 0).map(i => CODES[i]).join('') || '-';
  const decodeThemes = s => s === '-' ? [] : [...s].map(c => THEMES[CODES.indexOf(c)]).filter(Boolean);

  // ------------------------------------------------------------------ data
  const chunks = {};
  function add(k, text) { chunks[k] = text.split('\n'); }
  const chunkOf = n => Math.floor((n - 1) / CHUNK);
  const has = n => !!chunks[chunkOf(n)];
  // A level whose puzzle is close to rating r (h picks one inside its file).
  function levelForRating(r, h) {
    let k = 0;
    while (k + 1 < STARTS.length && STARTS[k + 1] <= r) k++;
    return Math.min(TOTAL, k * CHUNK + 1 + (h >>> 0) % CHUNK);
  }

  const PROMO = { Q: 'q', R: 'r', B: 'b', N: 'n' };
  function splitMoves(s) {
    const out = [];
    for (let i = 0; i < s.length;) {
      let u = s.slice(i, i + 4); i += 4;
      if (PROMO[s[i]]) { u += PROMO[s[i]]; i++; }
      out.push(u);
    }
    return out;
  }
  // Level n (1-based) as a puzzle object for the puzzle player.
  function get(n) {
    const rows = chunks[chunkOf(n)];
    const row = rows && rows[(n - 1) % CHUNK];
    if (!row) return null;
    const [id, place, side, castle, ep, mv, rating, th] = row.split(' ');
    const moves = splitMoves(mv);
    const themes = decodeThemes(th || '-');
    const solver = moves.length >> 1;
    const p = {
      i: 'L' + n, n: null, level: n, lid: id, f: `${place} ${side} ${castle} ${ep} 0 1`, pre: moves[0],
      s: moves.slice(1).join(' '), r: +rating, th: themes, c: 't', l: Math.max(0, Math.min(4, Math.round((+rating - 800) / 400))),
      g: 'win', t: '', en: '', es: ''
    };
    // A forced mate: the line ends in checkmate.
    const g = new Core.Chess(p.f);
    for (const u of moves) { const m = fromUci(g, u); if (!m) return null; g.make(m); }
    const st = g.status();
    if (st.over && st.reason === 'checkmate') p.g = 'm' + solver;
    return p;
  }

  const PROMO_CH = ' pnbrqk';
  const uciOf = m => sqName(mFrom(m)) + sqName(mTo(m)) + (mPromo(m) ? PROMO_CH[mPromo(m)] : '');
  const fromUci = (g, u) => g.moves().find(m => uciOf(m) === u) || 0;

  // ------------------------------------------------------------------ words
  const VAL = [0, 1, 3, 3, 5, 9, 100];
  const PN = {
    en: ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'],
    es: ['', 'peón', 'caballo', 'alfil', 'torre', 'dama', 'rey']
  };
  const PNS = { en: ['', 'pawns', 'knights', 'bishops', 'rooks', 'queens', 'kings'], es: ['', 'peones', 'caballos', 'alfiles', 'torres', 'damas', 'reyes'] };
  const FEM = [false, false, false, false, true, true, false];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const join = (items, L) => items.length <= 1 ? (items[0] || '') :
    items.slice(0, -1).join(', ') + (L === 'es' ? ' y ' : ' and ') + items[items.length - 1];
  // "the knight on f7" / "el caballo de f7"
  const the = (L, t, sq) => L === 'es' ? `${FEM[t] ? 'la' : 'el'} ${PN.es[t]} de ${sq}` : `the ${PN.en[t]} on ${sq}`;
  const theT = (L, t) => L === 'es' ? `${FEM[t] ? 'la' : 'el'} ${PN.es[t]}` : `the ${PN.en[t]}`;
  const aP = (L, t) => L === 'es' ? `${FEM[t] ? 'una' : 'un'} ${PN.es[t]}` : `a ${PN.en[t]}`;
  // Spanish personal "a": "a la dama", "al rey"
  const aObj = s => s.startsWith('el ') ? 'al ' + s.slice(3) : 'a ' + s;
  const SIDE = { en: ['White', 'Black'], es: ['las blancas', 'las negras'] };
  const side = (L, color) => SIDE[L][color === WHITE ? 0 : 1];
  const Side = (L, color) => cap(side(L, color));

  // Glossary term for a Lichess tag (or a plain name for mate patterns without one).
  const TERM_OF = {
    fork: 'fork', pin: 'pin', skewer: 'skewer', discoveredAttack: 'discoveredAttack', discoveredCheck: 'discoveredCheck',
    doubleCheck: 'doubleCheck', deflection: 'deflection', attraction: 'decoy', clearance: 'clearance', interference: 'interference',
    intermezzo: 'zwischenzug', xRayAttack: 'xray', quietMove: 'quietMove', zugzwang: 'zugzwang', capturingDefender: 'removingDefender',
    trappedPiece: 'trappedPiece', sacrifice: 'sacrifice', promotion: 'promotion', underPromotion: 'underpromotion', enPassant: 'enPassant',
    backRankMate: 'backRankMate', smotheredMate: 'smotheredMate', anastasiaMate: 'anastasiaMate', arabianMate: 'arabianMate',
    operaMate: 'operaMate'
  };
  const PATTERN_NAME = {
    bodenMate: ["Boden's mate", 'el mate de Boden'], doubleBishopMate: ['a mate with two bishops', 'un mate con dos alfiles'],
    dovetailMate: ['a dovetail mate', 'un mate de la cola de paloma'], hookMate: ['a hook mate', 'un mate del gancho'],
    killBoxMate: ['a box mate', 'un mate de la caja'], vukovicMate: ["Vuković's mate", 'el mate de Vuković'],
    balestraMate: ['a balestra mate', 'un mate balestra'], triangleMate: ['a triangle mate', 'un mate del triángulo'],
    cornerMate: ['a corner mate', 'un mate en la esquina'], blindSwineMate: ["the blind swine mate (two rooks on the 7th rank)", 'el mate de los cerdos ciegos (dos torres en la séptima)'],
    pillsburysMate: ["Pillsbury's mate", 'el mate de Pillsbury'], morphysMate: ["Morphy's mate", 'el mate de Morphy'],
    epauletteMate: ['an epaulette mate', 'un mate de las charreteras'], swallowstailMate: ["a swallow's tail mate", 'un mate de la cola de golondrina']
  };
  const MATE_PATTERNS = ['smotheredMate', 'backRankMate', 'anastasiaMate', 'arabianMate', 'operaMate', 'bodenMate', 'doubleBishopMate',
    'dovetailMate', 'hookMate', 'killBoxMate', 'vukovicMate', 'balestraMate', 'triangleMate', 'cornerMate', 'blindSwineMate',
    'pillsburysMate', 'morphysMate', 'epauletteMate', 'swallowstailMate'];
  // Most telling tactic first.
  const TACTIC_ORDER = ['doubleCheck', 'discoveredCheck', 'discoveredAttack', 'skewer', 'fork', 'pin', 'deflection', 'attraction',
    'clearance', 'interference', 'xRayAttack', 'intermezzo', 'capturingDefender', 'trappedPiece', 'quietMove', 'zugzwang',
    'underPromotion', 'promotion', 'enPassant', 'sacrifice'];
  const tokA = id => `[[a:${id}]]`;

  // ------------------------------------------------------------------ the line
  function buildLine(p) {
    const ucis = [p.pre].concat(p.s.split(' '));
    const g = new Core.Chess(p.f);
    const plies = [];
    for (let k = 0; k < ucis.length; k++) {
      const m = fromUci(g, ucis[k]);
      if (!m) return null;
      const legal = g.moves();
      const from = mFrom(m), to = mTo(m), fl = mFlags(m);
      const capSq = fl & F_EP ? to + (g.turn === WHITE ? -16 : 16) : to;
      const ply = {
        m, san: g.san(m, legal), color: g.turn, t: g.board[from] & 7, from: sqName(from), to: sqName(to), fromSq: from, toSq: to,
        cap: fl & F_CAPTURE ? g.board[capSq] & 7 : 0, promo: mPromo(m), castle: !!(fl & F_CASTLE), nLegal: legal.length
      };
      g.make(m);
      ply.check = g.inCheck();
      ply.mate = ply.check && !g.moves().length;
      plies.push(ply);
    }
    plies.shift(); // the opponent's move before the puzzle starts
    return { plies, moves: plies.map(x => x.m) };
  }
  // The position before ply i of the solution (with the real move history).
  function posAt(p, i) {
    const g = new Core.Chess(p.f);
    const ucis = [p.pre].concat(p.s.split(' '));
    for (let k = 0; k <= i; k++) g.make(fromUci(g, ucis[k]));
    return g;
  }
  const between = (a, b, c) => { // is square b strictly between a and c on one line? (0x88)
    const df = (c & 7) - (a & 7), dr = (c >> 4) - (a >> 4);
    if (!(df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr))) return false;
    const step = Math.sign(dr) * 16 + Math.sign(df);
    for (let s = a + step; s !== c; s += step) if (s === b) return true;
    return false;
  };
  const slides = t => t === BISHOP || t === ROOK || t === QUEEN;
  const lineOk = (t, a, c) => {
    const df = (c & 7) - (a & 7), dr = (c >> 4) - (a >> 4);
    if (t === ROOK) return df === 0 || dr === 0;
    if (t === BISHOP) return df !== 0 && Math.abs(df) === Math.abs(dr);
    return df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr);
  };
  const clearBetween = (g, a, c, skip) => {
    const df = (c & 7) - (a & 7), dr = (c >> 4) - (a >> 4);
    const step = Math.sign(dr) * 16 + Math.sign(df);
    for (let s = a + step; s !== c; s += step) if (g.board[s] && s !== skip) return false;
    return true;
  };

  // ------------------------------------------------------------------ explanation
  function explain(p) {
    const line = buildLine(p);
    if (!line) return { en: '', es: '', t: '' };
    const { plies, moves } = line;
    const tags = new Set(p.th || []);
    const us = plies[0].color, them = us ^ BLACK;
    const isMate = p.g.charAt(0) === 'm';
    const N = (plies.length + 1) >> 1;
    const clauses = plies.map(() => []); // per ply: [{en, es, id}]
    const used = new Set();
    const addClause = (i, id, en, es) => { if (!used.has(id) || id === 'x') { used.add(id); clauses[i].push({ en, es }); } };
    const S = i => `{{${plies[i].san}}}`;

    // 1. What the coach sees on each of the solver's moves.
    const detected = plies.map((x, i) => {
      if (i % 2) return [];
      const g = posAt(p, i);
      try { return Core && typeof Coach !== 'undefined' ? Coach.detectTactics(g, moves[i], moves.slice(i)) : []; } catch (e) { return []; }
    });
    const want = id => {
      const tag = { decoy: 'attraction', xray: 'xRayAttack', zwischenzug: 'intermezzo', removingDefender: 'capturingDefender', doubleAttack: 'fork' }[id] || id;
      return tags.has(tag) || id === 'doubleCheck' || id === 'discoveredCheck';
    };
    for (let i = 0; i < plies.length; i += 2) {
      for (const x of detected[i]) {
        if (!want(x.id)) continue;
        const tag = { decoy: 'attraction', xray: 'xRayAttack', zwischenzug: 'intermezzo', removingDefender: 'capturingDefender', doubleAttack: 'fork' }[x.id] || x.id;
        if (used.has(tag)) continue;
        const c = detectedClause(x, i);
        if (c) addClause(i, tag, c.en, c.es);
      }
    }

    function detectedClause(x, i) {
      const tgt = o => ({ en: the('en', o.t, o.sq), es: the('es', o.t, o.sq) });
      switch (x.id) {
        case 'fork': case 'doubleAttack': {
          const ts = x.targets.map(tgt);
          return {
            en: `${cap(the('en', x.piece, x.sq))} attacks ${join(ts.map(o => o.en), 'en')} at the same time: ${tokA(x.id)}.`,
            es: `${cap(the('es', x.piece, x.sq))} ataca a la vez ${join(ts.map(o => aObj(o.es)), 'es')}: ${tokA(x.id)}.`
          };
        }
        case 'pin': return {
          en: `${cap(the('en', x.piece, x.sq))} pins ${the('en', x.pinned.t, x.pinned.sq)} to ${theT('en', x.behind.t)} behind it: ${tokA('pin')}${x.absolute ? ', so the pinned piece may not move at all' : ''}.`,
          es: `${cap(the('es', x.piece, x.sq))} clava ${aObj(the('es', x.pinned.t, x.pinned.sq))} contra ${theT('es', x.behind.t)} que tiene detrás: ${tokA('pin')}${x.absolute ? ', así que la pieza clavada no puede moverse' : ''}.`
        };
        case 'skewer': return {
          en: `${cap(the('en', x.piece, x.sq))} hits ${the('en', x.front.t, x.front.sq)}, and once it steps aside ${theT('en', x.behind.t)} behind it on ${x.behind.sq} falls: ${tokA('skewer')}.`,
          es: `${cap(the('es', x.piece, x.sq))} ataca ${aObj(the('es', x.front.t, x.front.sq))} y, cuando se aparte, caerá ${theT('es', x.behind.t)} que está detrás, en ${x.behind.sq}: ${tokA('skewer')}.`
        };
        case 'xray': return {
          en: `${cap(the('en', x.piece, x.sq))} works together with ${the('en', x.front.t, x.front.sq)} on the same line against ${the('en', x.target.t, x.target.sq)}: ${tokA('xray')} attack.`,
          es: `${cap(the('es', x.piece, x.sq))} y ${the('es', x.front.t, x.front.sq)} actúan en la misma línea contra ${the('es', x.target.t, x.target.sq)}: ${tokA('xray')}.`
        };
        case 'discoveredAttack': return {
          en: `Moving the ${PN.en[x.piece]} uncovers ${the('en', x.slider, x.sliderSq)}, which now attacks ${the('en', x.target.t, x.target.sq)}: ${tokA('discoveredAttack')}.`,
          es: `Al mover ${theT('es', x.piece)} se destapa ${the('es', x.slider, x.sliderSq)}, que ahora ataca ${aObj(the('es', x.target.t, x.target.sq))}: ${tokA('discoveredAttack')}.`
        };
        case 'discoveredCheck': return {
          en: `Moving the ${PN.en[x.piece]} uncovers a check from ${the('en', x.slider, x.sliderSq)}: ${tokA('discoveredCheck')}.`,
          es: `Al mover ${theT('es', x.piece)} se destapa el jaque de ${the('es', x.slider, x.sliderSq)}: ${tokA('discoveredCheck')}.`
        };
        case 'doubleCheck': {
          const g = posAt(p, i + 1), ks = g.kings[them >> 3];
          const ch = g.attackers(ks, us).map(s => ({ en: the('en', g.board[s] & 7, sqName(s)), es: the('es', g.board[s] & 7, sqName(s)) }));
          return {
            en: `It is ${tokA('doubleCheck')}: ${join(ch.map(o => o.en), 'en')} both give check, so nothing can block or capture and the king has to move.`,
            es: `Es ${tokA('doubleCheck')}: ${join(ch.map(o => o.es), 'es')} dan jaque a la vez, así que no se puede tapar ni capturar y el rey tiene que moverse.`
          };
        }
        case 'deflection': return {
          en: `It is ${tokA('deflection')}: ${theT('en', x.piece)} on ${x.arrow[0]} is dragged to ${x.arrow[1]} and can no longer guard ${x.sq}.`,
          es: `Es ${tokA('deflection')}: ${theT('es', x.piece)} de ${x.arrow[0]} tiene que ir a ${x.arrow[1]} y ya no puede defender ${x.sq}.`
        };
        case 'decoy': return {
          en: `It is ${tokA('decoy')}: it lures ${theT('en', x.piece)} to ${x.sq}, where it becomes a target.`,
          es: `Es ${tokA('decoy')}: atrae ${aObj(theT('es', x.piece))} a ${x.sq}, donde queda expuest${x.piece === QUEEN ? 'a' : 'o'}.`
        };
        case 'removingDefender': return {
          en: `It removes the defender: ${the('en', x.captured.t, x.captured.sq)} was protecting ${the('en', x.target.t, x.target.sq)} (${tokA('removingDefender')}).`,
          es: `Elimina al defensor: ${the('es', x.captured.t, x.captured.sq)} protegía ${aObj(the('es', x.target.t, x.target.sq))} (${tokA('removingDefender')}).`
        };
        case 'zwischenzug': return {
          en: `Instead of recapturing on ${x.sq} at once, ${side('en', us)} first plays this forcing move: ${tokA('zwischenzug')}.`,
          es: `En lugar de recapturar enseguida en ${x.sq}, ${side('es', us)} intercalan primero esta jugada forzante: ${tokA('zwischenzug')}.`
        };
        case 'promotion': return null;
      }
      return null;
    }

    // 2. Ideas the coach does not detect directly, found from the line itself.
    const solverIdx = plies.map((x, i) => i).filter(i => i % 2 === 0);
    const sanOf = i => S(i);

    if (tags.has('clearance') && !used.has('clearance')) {
      outer: for (const i of solverIdx) for (const j of solverIdx) {
        if (j <= i) continue;
        const a = plies[i], b = plies[j];
        if (b.toSq === a.fromSq && b.fromSq !== a.toSq) {
          addClause(i, 'clearance', `It clears the square ${a.from} for ${theT('en', b.t)}, which comes in with ${sanOf(j)}: ${tokA('clearance')}.`,
            `Deja libre la casilla ${a.from} para ${theT('es', b.t)}, que entrará con ${sanOf(j)}: ${tokA('clearance')}.`);
          break outer;
        }
        if (slides(b.t) && between(b.fromSq, a.fromSq, b.toSq)) {
          addClause(i, 'clearance', `It clears the line for ${the('en', b.t, b.from)}, which goes through ${a.from} with ${sanOf(j)}: ${tokA('clearance')}.`,
            `Despeja la línea para ${the('es', b.t, b.from)}, que pasará por ${a.from} con ${sanOf(j)}: ${tokA('clearance')}.`);
          break outer;
        }
      }
    }

    if (tags.has('interference') && !used.has('interference')) {
      outer2: for (const i of solverIdx) {
        const a = plies[i], g = posAt(p, i + 1); // after the move
        for (const j of solverIdx) {
          if (j <= i) continue;
          const T = plies[j].toSq;
          for (let s = 0; s < 128; s++) {
            if (s & 0x88) { s += 7; continue; }
            const q = g.board[s];
            if (!q || (q & BLACK) !== them || !slides(q & 7) || s === T) continue;
            if (!lineOk(q & 7, s, T) || !between(s, a.toSq, T) || !clearBetween(g, s, T, a.toSq)) continue;
            addClause(i, 'interference', `The ${PN.en[a.t]} lands between ${the('en', q & 7, sqName(s))} and ${sqName(T)}, cutting the line it was guarding: ${tokA('interference')}. That is why ${sanOf(j)} works later.`,
              `${cap(theT('es', a.t))} se interpone entre ${the('es', q & 7, sqName(s))} y ${sqName(T)} y corta la línea que defendía: ${tokA('interference')}. Por eso luego funciona ${sanOf(j)}.`);
            break outer2;
          }
        }
      }
    }

    if (tags.has('intermezzo') && !used.has('intermezzo')) {
      const pre = buildPre(p);
      for (const i of solverIdx) {
        const prev = i === 0 ? pre : plies[i - 1];
        if (!prev || !prev.cap) continue;
        const sq = prev.toSq;
        if (plies[i].toSq === sq) continue;
        const j = solverIdx.find(k => k > i && plies[k].toSq === sq && plies[k].cap);
        if (j === undefined) continue;
        addClause(i, 'intermezzo', `Instead of taking back on ${prev.to} at once, ${side('en', us)} first inserts this move: ${tokA('zwischenzug')}. The recapture ${sanOf(j)} comes later.`,
          `En lugar de recapturar enseguida en ${prev.to}, ${side('es', us)} intercalan primero esta jugada: ${tokA('zwischenzug')}. La recaptura ${sanOf(j)} llega después.`);
        break;
      }
    }

    // A piece of ours is taken on the square we just moved to.
    const takenNext = i => i + 1 < plies.length && plies[i + 1].toSq === plies[i].toSq && plies[i + 1].cap;
    if ((tags.has('attraction') || tags.has('deflection')) && !(used.has('attraction') && used.has('deflection'))) {
      for (const i of solverIdx) {
        if (!takenNext(i) || i + 2 >= plies.length) continue;
        const r = plies[i + 1], nx = plies[i + 2];
        if (tags.has('deflection') && !used.has('deflection')) {
          // the capturing piece used to guard the square of a later move
          const g = posAt(p, i + 1);
          const guarded = g.attacksFrom(r.fromSq);
          const j = solverIdx.find(k => k > i + 1 && guarded.includes(plies[k].toSq) && plies[k].toSq !== r.toSq);
          if (j !== undefined) {
            addClause(i, 'deflection', `It is ${tokA('deflection')}: after ${sanOf(i + 1)} ${the('en', r.t, r.from)} has left its post and no longer guards ${plies[j].to}, so ${sanOf(j)} follows.`,
              `Es ${tokA('deflection')}: tras ${sanOf(i + 1)}, ${the('es', r.t, r.from)} abandona su puesto y ya no defiende ${plies[j].to}, así que llega ${sanOf(j)}.`);
            continue;
          }
        }
        if (tags.has('attraction') && !used.has('attraction') && (nx.check || r.t === KING || r.t === QUEEN)) {
          addClause(i, 'attraction', `It is ${tokA('decoy')}: it drags ${theT('en', r.t)} to ${r.to}, where ${sanOf(i + 2)} ${nx.check ? 'catches it with check' : 'hits it'}.`,
            `Es ${tokA('decoy')}: atrae ${aObj(theT('es', r.t))} a ${r.to}, donde ${sanOf(i + 2)} ${nx.check ? 'lo alcanza con jaque' : 'lo ataca'}.`);
        }
      }
    }

    if (tags.has('capturingDefender') && !used.has('capturingDefender')) {
      for (const i of solverIdx) {
        if (!plies[i].cap) continue;
        const g = posAt(p, i);
        const guards = g.attacksFrom(plies[i].toSq);
        const j = solverIdx.find(k => k > i && guards.includes(plies[k].toSq));
        if (j === undefined) continue;
        addClause(i, 'capturingDefender', `It removes the defender: ${the('en', plies[i].cap, plies[i].to)} was guarding ${plies[j].to}, where ${sanOf(j)} lands later (${tokA('removingDefender')}).`,
          `Elimina al defensor: ${the('es', plies[i].cap, plies[i].to)} protegía ${plies[j].to}, adonde llegará ${sanOf(j)} (${tokA('removingDefender')}).`);
        break;
      }
    }

    if (tags.has('xRayAttack') && !used.has('xRayAttack')) {
      for (const i of solverIdx) {
        const j = i + 2;
        if (j >= plies.length || !plies[i].cap || plies[i + 1].toSq !== plies[i].toSq || plies[j].toSq !== plies[i].toSq) continue;
        if (!slides(plies[j].t) || !between(plies[j].fromSq, plies[i].fromSq, plies[i].toSq)) continue;
        addClause(j, 'xRayAttack', `${cap(the('en', plies[j].t, plies[j].from))} was backing up the first capture from behind, through the same line: ${tokA('xray')}.`,
          `${cap(the('es', plies[j].t, plies[j].from))} apoyaba la primera captura desde atrás, por la misma línea: ${tokA('xray')}.`);
        break;
      }
    }

    if (tags.has('pin') && !used.has('pin')) {
      // a pin already on the board that the solution exploits
      const pin = findPin(posAt(p, 0), us);
      if (pin) addClause(0, 'pin', `Note ${tokA('pin')}: ${the('en', pin.t, pin.sq)} cannot move away, because ${the('en', pin.bt, pin.bsq)} stands behind it on the line of ${the('en', pin.at, pin.asq)}.`,
        `Fíjate en ${tokA('pin')}: ${the('es', pin.t, pin.sq)} no puede apartarse, porque detrás está ${the('es', pin.bt, pin.bsq)}, en la línea de ${the('es', pin.at, pin.asq)}.`);
    }

    if (tags.has('trappedPiece') && !used.has('trappedPiece')) {
      const j = solverIdx.filter(k => plies[k].cap >= KNIGHT).sort((a, b) => VAL[plies[b].cap] - VAL[plies[a].cap])[0];
      if (j !== undefined) {
        addClause(j, 'trappedPiece', `${cap(the('en', plies[j].cap, plies[j].to))} had no safe square left: ${tokA('trappedPiece')}.`,
          `${cap(the('es', plies[j].cap, plies[j].to))} no tenía ninguna casilla segura: ${tokA('trappedPiece')}.`);
      }
    }

    if (tags.has('quietMove') && !used.has('quietMove')) {
      const quiet = solverIdx.filter(i => !plies[i].check && !plies[i].cap && !plies[i].promo && !plies[i].mate);
      const i = quiet.length ? quiet[0] : undefined;
      if (i !== undefined) {
        const thr = detected[i].find(x => x.id === 'mateThreat' || x.id === 'backRankThreat');
        addClause(i, 'quietMove', `This is ${tokA('quietMove')}: no check and no capture${thr ? `, but it threatens {{${thr.san}}}` : ''}, and ${side('en', them)} cannot meet everything.`,
          `Es ${tokA('quietMove')}: ni jaque ni captura${thr ? `, pero amenaza {{${thr.san}}}` : ''}, y ${side('es', them)} no pueden con todo.`);
      }
    }

    if (tags.has('zugzwang') && !used.has('zugzwang')) {
      const i = solverIdx.filter(k => !plies[k].check && k + 1 < plies.length).pop();
      if (i !== undefined) {
        addClause(i, 'zugzwang', `${Side('en', them)} would love to pass, but must move, and every move makes things worse: ${tokA('zugzwang')}.`,
          `A ${side('es', them)} les gustaría pasar, pero tienen que mover, y cualquier jugada empeora su posición: ${tokA('zugzwang')}.`);
      }
    }

    // A quiet move that sets up a mate threat.
    for (const i of solverIdx) {
      const x = plies[i];
      if (x.check || x.mate || clauses[i].length) continue;
      const thr = detected[i].find(d => d.id === 'mateThreat' || d.id === 'backRankThreat');
      if (thr) addClause(i, 'x', `It threatens {{${thr.san}}}${thr.id === 'backRankThreat' ? `, ${tokA('backRankMate')}` : ''}.`,
        `Amenaza {{${thr.san}}}${thr.id === 'backRankThreat' ? `, ${tokA('backRankMate')}` : ''}.`);
    }

    // 3. The sentences.
    const out = { en: [], es: [] };
    const named = TACTIC_ORDER.filter(id => used.has(id) && id !== 'sacrifice');
    for (const id of TACTIC_ORDER) if (tags.has(id) && !named.includes(id) && id !== 'sacrifice' && named.length < 2 && TERM_OF[id]) named.push(id);
    const sacs = solverIdx.filter(i => isSac(i));
    const hasSac = sacs.length > 0 || tags.has('sacrifice');
    const ideaTok = named.slice(0, 2).map(id => tokA(TERM_OF[id]));
    if (hasSac && ideaTok.length < 3) ideaTok.push(tokA('sacrifice'));
    let pattern = null;
    if (isMate) {
      pattern = MATE_PATTERNS.find(x => tags.has(x)) || null;
      if (!pattern) {
        const last = detected[plies.length - 1].find(x => x.id === 'smotheredMate' || x.id === 'backRankMate');
        if (last) pattern = last.id;
      }
      const patEn = !pattern ? '' : TERM_OF[pattern] ? tokA(TERM_OF[pattern]) : PATTERN_NAME[pattern][0];
      const patEs = !pattern ? '' : TERM_OF[pattern] ? tokA(TERM_OF[pattern]) : PATTERN_NAME[pattern][1];
      out.en.push(`Forced mate in ${N}${patEn ? `: ${patEn}` : ''}${ideaTok.length ? `, built on ${join(ideaTok, 'en')}` : ''}.`);
      out.es.push(`Mate forzado en ${N}${patEs ? `: ${patEs}` : ''}${ideaTok.length ? `, basado en ${join(ideaTok, 'es')}` : ''}.`);
    } else if (ideaTok.length) {
      out.en.push(`This was ${join(ideaTok, 'en')}.`);
      out.es.push(`Esto fue ${join(ideaTok, 'es')}.`);
    } else if (tags.has('advancedPawn') || tags.has('promotion')) {
      out.en.push(`This was the power of an advanced [[passedPawn]].`);
      out.es.push(`Aquí decide la fuerza de un [[passedPawn]] avanzado.`);
    } else {
      out.en.push(`${Side('en', us)} wins by force.`);
      out.es.push(`${Side('es', us)} ganan por la fuerza.`);
    }

    for (let i = 0; i < plies.length; i++) {
      const x = plies[i];
      if (i % 2 === 0) {
        const s = stepText(i);
        out.en.push(s.en); out.es.push(s.es);
        for (const c of clauses[i]) { out.en.push(c.en); out.es.push(c.es); }
      } else {
        const r = replyText(i);
        out.en.push(r.en); out.es.push(r.es);
        for (const c of clauses[i]) { out.en.push(c.en); out.es.push(c.es); }
      }
      void x;
    }
    if (!isMate) {
      const o = outcome();
      out.en.push(o.en); out.es.push(o.es);
    }
    const main = named.length ? TERM_OF[named[0]] : pattern && TERM_OF[pattern] ? TERM_OF[pattern] : hasSac ? 'sacrifice' : isMate ? 'checkmate' : '';
    const es = out.es.join(' ').replace(/\bde el /g, 'del ').replace(/\ba el /g, 'al ');
    return { en: out.en.join(' '), es, t: main };

    // ---- helpers that need the line
    function isSac(i) {
      const x = plies[i];
      if (x.t === KING || x.promo) return false;
      if (!takenNext(i)) return detected[i].some(d => d.id === 'sacrifice');
      return VAL[x.t] > VAL[x.cap] + 1 || (VAL[x.t] > VAL[x.cap] && !(i + 2 < plies.length && plies[i + 2].toSq === x.toSq));
    }
    function stepText(i) {
      const x = plies[i], ck = x.check && !x.mate;
      const wC = { en: ck ? ' with check' : '', es: ck ? ' con jaque' : '' };
      if (x.mate) {
        const m = mateWhy(i);
        return { en: `${S(i)} is checkmate: ${m.en}`, es: `${S(i)} es jaque mate: ${m.es}` };
      }
      if (x.castle) return { en: `${S(i)}: ${side('en', us)} castles${wC.en}.`, es: `${S(i)}: ${side('es', us)} enrocan${wC.es}.` };
      if (x.promo) {
        return {
          en: `${S(i)}: the pawn ${x.cap ? `takes the ${PN.en[x.cap]} on ${x.to} and ` : ''}promotes to ${aP('en', x.promo)}${wC.en}${x.promo !== QUEEN ? ` (${tokA('underpromotion')})` : ''}.`,
          es: `${S(i)}: el peón ${x.cap ? `captura ${aObj(theT('es', x.cap))} de ${x.to} y ` : ''}corona en ${aP('es', x.promo)}${wC.es}${x.promo !== QUEEN ? ` (${tokA('underpromotion')})` : ''}.`
        };
      }
      if (isSac(i)) {
        return x.cap ? {
          en: `${S(i)}! ${Side('en', us)} gives up the ${PN.en[x.t]}: it takes the ${PN.en[x.cap]} on ${x.to}${wC.en}, but can be captured.`,
          es: `${S(i)}! ${Side('es', us)} entregan ${theT('es', x.t)}: captura ${aObj(theT('es', x.cap))} de ${x.to}${wC.es}, aunque se la pueden comer.`.replace('se la pueden', FEM[x.t] ? 'se la pueden' : 'se lo pueden')
        } : {
          en: `${S(i)}! ${Side('en', us)} offers the ${PN.en[x.t]} on ${x.to}${wC.en}.`,
          es: `${S(i)}! ${Side('es', us)} ofrecen ${theT('es', x.t)} en ${x.to}${wC.es}.`
        };
      }
      if (x.cap) return {
        en: `${S(i)}: ${theT('en', x.t)} takes the ${PN.en[x.cap]} on ${x.to}${wC.en}.`,
        es: `${S(i)}: ${theT('es', x.t)} captura ${aObj(theT('es', x.cap))} de ${x.to}${wC.es}.`
      };
      return { en: `${S(i)}: ${theT('en', x.t)} goes to ${x.to}${wC.en}.`, es: `${S(i)}: ${theT('es', x.t)} va a ${x.to}${wC.es}.` };
    }
    function replyText(i) {
      const x = plies[i];
      const accepts = plies[i - 1] && x.toSq === plies[i - 1].toSq && x.cap && isSac(i - 1);
      if (x.nLegal === 1) {
        return x.cap ? { en: `${Side('en', them)} has to take: ${S(i)}.`, es: `${Side('es', them)} tienen que capturar: ${S(i)}.` } :
          { en: `${Side('en', them)}'s only move is ${S(i)}.`, es: `La única jugada de ${side('es', them)} es ${S(i)}.` };
      }
      if (accepts) return { en: `${Side('en', them)} takes it: ${S(i)}.`, es: `${Side('es', them)} la aceptan: ${S(i)}.`.replace('la aceptan', FEM[plies[i - 1].t] ? 'la aceptan' : 'lo aceptan') };
      return { en: `The best defence is ${S(i)}.`, es: `La mejor defensa es ${S(i)}.` };
    }
    function mateWhy(i) {
      const g = posAt(p, i + 1);
      const ks = g.kings[them >> 3];
      const own = [];
      for (const o of Core.K_OFF) {
        const s = ks + o;
        if (s & 0x88) continue;
        const q = g.board[s];
        if (q && (q & BLACK) === them) own.push({ t: q & 7, sq: sqName(s) });
      }
      const k = { en: the('en', KING, sqName(ks)), es: the('es', KING, sqName(ks)) };
      // "its own pawns on g7 and h7" / "sus propios peones de g7 y h7"
      const groups = {};
      for (const o of own) (groups[o.t] = groups[o.t] || []).push(o.sq);
      const ts = Object.keys(groups).map(Number).sort((a, b) => a - b);
      const grpEn = ts.map(t => groups[t].length > 1 ? `${PNS.en[t]} on ${join(groups[t], 'en')}` : `${PN.en[t]} on ${groups[t][0]}`);
      const grpEs = ts.map((t, n) => groups[t].length > 1 ? `${n ? '' : 'sus propi' + (FEM[t] ? 'as ' : 'os ')}${PNS.es[t]} de ${join(groups[t], 'es')}` :
        `${n ? '' : 'su '}${PN.es[t]} de ${groups[t][0]}`);
      const many = own.length > 1;
      const checkers = g.attackers(ks, us);
      const dbl = checkers.length > 1;
      return {
        en: `${k.en} is attacked${dbl ? ' twice' : ''} and has no square to go to` + (own.length ? `: its own ${join(grpEn, 'en')} ${many ? 'block' : 'blocks'} the way out.` : `: every square around it is covered by ${side('en', us)}'s pieces.`),
        es: `${k.es} está atacado${dbl ? ' dos veces' : ''} y no tiene adónde ir` + (own.length ? `: ${join(grpEs, 'es')} le ${many ? 'cierran' : 'cierra'} el paso.` : `: todas las casillas a su alrededor están controladas por ${side('es', us)}.`)
      };
    }
    function outcome() {
      // material won along the line, cancelling out trades
      const gained = [], lost = [];
      for (let i = 0; i < plies.length; i++) {
        const x = plies[i];
        if (x.cap) (x.color === us ? gained : lost).push(x.cap);
        if (x.promo) { if (x.color === us) { gained.push(x.promo); lost.push(PAWN); } else { lost.push(x.promo); gained.push(PAWN); } }
      }
      // the last capture may be answered by a recapture
      const last = plies[plies.length - 1], g = posAt(p, plies.length);
      if (last.cap && !last.mate && !last.check) {
        const atk = g.attackers(last.toSq, them), def = g.attackers(last.toSq, us);
        if (atk.length && (!def.length || Math.min(...atk.map(s => VAL[g.board[s] & 7])) < VAL[last.promo || last.t])) lost.push(last.promo || last.t);
      }
      const G = gained.slice(), Lo = lost.slice();
      for (let k = G.length - 1; k >= 0; k--) { const j = Lo.indexOf(G[k]); if (j >= 0) { Lo.splice(j, 1); G.splice(k, 1); } }
      const net = G.reduce((a, t) => a + VAL[t], 0) - Lo.reduce((a, t) => a + VAL[t], 0);
      const words = (L, list) => {
        const cnt = {};
        for (const t of list) cnt[t] = (cnt[t] || 0) + 1;
        return Object.keys(cnt).map(Number).sort((a, b) => VAL[b] - VAL[a]).map(t => cnt[t] === 1 ?
          (t === QUEEN ? (L === 'es' ? 'la dama' : 'the queen') : aP(L, t)) :
          `${L === 'es' ? (cnt[t] === 2 ? 'dos' : 'tres') : (cnt[t] === 2 ? 'two' : 'three')} ${PNS[L][t]}`);
      };
      const thr = detected[plies.length - 1].find(x => x.id === 'mateThreat' || x.id === 'backRankThreat');
      const lp = plies[plies.length - 1];
      const seventh = lp.t === PAWN && !lp.promo && (lp.toSq >> 4) === (us === WHITE ? 6 : 1);
      if (seventh) {
        return { en: `${G.length && net > 0 ? `${Side('en', us)} has won ${join(words('en', G), 'en')}, and ` : ''}the pawn on ${lp.to} is one step from promoting: ${side('en', them)} cannot stop it.`,
          es: `${G.length && net > 0 ? `${Side('es', us)} han ganado ${join(words('es', G), 'es')}, y ` : ''}el peón de ${lp.to} está a un paso de coronar: ${side('es', them)} no pueden detenerlo.` };
      }
      if (net <= 0 || !G.length) {
        if (tags.has('equality')) return { en: `With this, ${side('en', us)} saves the game.`, es: `Con esto, ${side('es', us)} salvan la partida.` };
        if (thr) return { en: `The threat of {{${thr.san}}} decides the game.`, es: `La amenaza de {{${thr.san}}} decide la partida.` };
        return { en: `${Side('en', them)} is left without a good defence, and ${side('en', us)} is winning.`, es: `${Side('es', them)} se quedan sin buena defensa y ${side('es', us)} ganan.` };
      }
      if (G.length === 1 && G[0] === ROOK && Lo.length === 1 && (Lo[0] === KNIGHT || Lo[0] === BISHOP)) {
        return { en: `In the end ${side('en', us)} wins the exchange, a rook for a ${PN.en[Lo[0]]} ([[winningExchange]]).`,
          es: `Al final ${side('es', us)} ganan la calidad, una torre por ${aP('es', Lo[0])} ([[winningExchange]]).` };
      }
      return {
        en: `In the end ${side('en', us)} wins ${join(words('en', G), 'en')}${Lo.length ? ` for ${join(words('en', Lo), 'en')}` : ''}.`,
        es: `Al final ${side('es', us)} ganan ${join(words('es', G), 'es')}${Lo.length ? ` a cambio de ${join(words('es', Lo), 'es')}` : ''}.`
      };
    }
  }

  function buildPre(p) {
    const g = new Core.Chess(p.f);
    const m = fromUci(g, p.pre);
    if (!m) return null;
    const fl = mFlags(m);
    return { toSq: mTo(m), to: sqName(mTo(m)), cap: fl & F_CAPTURE ? 1 : 0 };
  }

  // An enemy piece pinned by one of `us`'s line pieces (to the king or a bigger piece).
  function findPin(g, us) {
    const them = us ^ BLACK;
    for (let s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      const q = g.board[s];
      if (!q || (q & BLACK) !== us || !slides(q & 7)) continue;
      const dirs = (q & 7) === BISHOP ? Core.B_OFF : (q & 7) === ROOK ? Core.R_OFF : Core.K_OFF;
      for (const o of dirs) {
        let first = -1;
        for (let t = s + o; !(t & 0x88); t += o) {
          const z = g.board[t];
          if (!z) continue;
          if ((z & BLACK) !== them) break;
          if (first < 0) { first = t; continue; }
          const ft = g.board[first] & 7, bt = z & 7;
          if (ft !== KING && (bt === KING || VAL[bt] > VAL[ft]) && VAL[ft] < VAL[q & 7] + (bt === KING ? 100 : 0)) {
            return { t: ft, sq: sqName(first), bt, bsq: sqName(t), at: q & 7, asq: sqName(s) };
          }
          break;
        }
      }
    }
    return null;
  }

  return { CHUNK, TOTAL, THEMES, CODES, encodeThemes, decodeThemes, add, has, get, chunkOf, levelForRating, explain, splitMoves };
})();
if (typeof module !== 'undefined') module.exports = Levels;
