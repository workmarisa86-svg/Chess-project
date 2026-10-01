/*
 * The coach: recognizes tactics, principles and openings, rates moves and
 * writes friendly explanations in English or Spanish.
 *
 * Analysis produces plain data (piece types, squares, SAN), and rendering
 * turns it into text for the current language, so switching language simply
 * re-renders every coach message.
 */
const Core = ChessCore();

const Coach = (() => {
  const { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
    F_CAPTURE, F_EP, F_CASTLE, MATE, B_OFF, R_OFF, K_OFF,
    sqName, mFrom, mTo, mPromo, mFlags } = Core;
  const VAL = [0, 1, 3, 3, 5, 9, 100];
  const MAJOR = new Set(['fork', 'doubleAttack', 'pin', 'skewer', 'discoveredAttack', 'discoveredCheck',
    'doubleCheck', 'removingDefender', 'overloading', 'deflection', 'decoy', 'zwischenzug', 'checkmate',
    'smotheredMate', 'backRankMate', 'mateThreat', 'backRankThreat', 'xray']);

  // ---------- board helpers ----------
  const minVal = (g, squares) => squares.reduce((mv, s) => Math.min(mv, VAL[g.board[s] & 7]), 1000);

  // Is the piece on sq attacked and insufficiently defended?
  function isHanging(g, sq) {
    const p = g.board[sq];
    if (!p || (p & 7) === KING) return false;
    const own = p & BLACK, atk = g.attackers(sq, own ^ BLACK);
    if (!atk.length) return false;
    if (!g.attackers(sq, own).length) return true;
    return minVal(g, atk) < VAL[p & 7];
  }

  function isSafe(g, sq) {
    const p = g.board[sq];
    if ((p & 7) === KING) return true;
    const own = p & BLACK, atk = g.attackers(sq, own ^ BLACK);
    if (!atk.length) return true;
    if (!g.attackers(sq, own).length) return false;
    return minVal(g, atk) >= VAL[p & 7];
  }

  function forkTargets(g, sq) {
    const p = g.board[sq], them = (p & BLACK) ^ BLACK, mover = p & 7, out = [];
    for (const s of g.attacksFrom(sq)) {
      const q = g.board[s];
      if (!q || (q & BLACK) !== them) continue;
      const t = q & 7;
      if (t === PAWN) continue;
      if (t === KING || VAL[t] > VAL[mover] || !g.attackers(s, them).length) out.push({ t, sq: sqName(s) });
    }
    return out;
  }

  function undevelopedMinors(g, us) {
    const base = us === WHITE ? 0 : 112;
    let n = 0;
    if (g.board[base + 1] === (us | KNIGHT)) n++;
    if (g.board[base + 6] === (us | KNIGHT)) n++;
    if (g.board[base + 2] === (us | BISHOP)) n++;
    if (g.board[base + 5] === (us | BISHOP)) n++;
    return n;
  }

  function queensOnBoard(g) {
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      if ((g.board[sq] & 7) === QUEEN) return true;
    }
    return false;
  }

  function isOpenFile(g, file) {
    for (let r = 0; r < 8; r++) if ((g.board[r * 16 + file] & 7) === PAWN) return false;
    return true;
  }

  function isPassed(g, sq) {
    const p = g.board[sq], us = p & BLACK, f = sq & 7, r = sq >> 4;
    for (let ff = f - 1; ff <= f + 1; ff++) {
      if (ff < 0 || ff > 7) continue;
      for (let rr = 0; rr < 8; rr++) {
        const q = g.board[rr * 16 + ff];
        if (q !== ((us ^ BLACK) | PAWN)) continue;
        if (us === WHITE ? rr > r : rr < r) return false;
      }
    }
    return true;
  }

  // Pieces that are the sole defender of two or more attacked pieces.
  function findOverloaded(g, us) {
    const them = us ^ BLACK, roles = new Map();
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = g.board[sq];
      if (!p || (p & BLACK) !== them || (p & 7) === KING || (p & 7) === PAWN) continue;
      if (!g.attackers(sq, us).length) continue;
      const defs = g.attackers(sq, them);
      if (defs.length !== 1 || (g.board[defs[0]] & 7) === KING) continue;
      const d = defs[0];
      if (!roles.has(d)) roles.set(d, []);
      roles.get(d).push({ t: p & 7, sq: sqName(sq) });
    }
    const out = [];
    for (const [d, targets] of roles) {
      if (targets.length >= 2) out.push({ sq: sqName(d), t: g.board[d] & 7, targets });
    }
    return out;
  }

  // After our move (opponent to move): could we mate next move if they passed?
  function mateThreat(g) {
    g.makeNull();
    let found = null;
    const legal = g.moves();
    for (const m of legal) {
      g.make(m);
      const mate = g.inCheck() && g.moves().length === 0;
      g.undo();
      if (mate) {
        const to = mTo(m), them = g.turn ^ BLACK, k = g.kings[them >> 3];
        const home = them === WHITE ? 0 : 7;
        const t = g.board[mFrom(m)] & 7;
        const backRank = (k >> 4) === home && (to >> 4) === home && (t === ROOK || t === QUEEN);
        found = { san: g.san(m, legal), from: sqName(mFrom(m)), to: sqName(to), backRank };
        break;
      }
    }
    g.undo();
    return found;
  }

  function lineTactics(g, sq, type, safe, out) {
    const p = g.board[sq], us = p & BLACK, them = us ^ BLACK;
    const dirs = type === BISHOP ? B_OFF : type === ROOK ? R_OFF : K_OFF;
    for (const o of dirs) {
      const diag = Math.abs(o) === 15 || Math.abs(o) === 17;
      let first = -1;
      for (let t = sq + o; !(t & 0x88); t += o) if (g.board[t]) { first = t; break; }
      if (first < 0) continue;
      const X = g.board[first], xt = X & 7;
      let second = -1;
      for (let t = first + o; !(t & 0x88); t += o) if (g.board[t]) { second = t; break; }
      if ((X & BLACK) === them) {
        if (second < 0 || (g.board[second] & BLACK) !== them || !safe) continue;
        const yt = g.board[second] & 7;
        if (xt !== KING && xt !== PAWN && (yt === KING || VAL[yt] > VAL[xt])) {
          out.push({ id: 'pin', piece: type, sq: sqName(sq), pinned: { t: xt, sq: sqName(first) },
            behind: { t: yt, sq: sqName(second) }, absolute: yt === KING, arrow: [sqName(sq), sqName(second)] });
        } else if ((xt === KING || VAL[xt] > VAL[yt]) && yt !== PAWN &&
          (VAL[yt] > VAL[type] || !g.attackers(second, them).length)) {
          out.push({ id: 'skewer', piece: type, sq: sqName(sq), front: { t: xt, sq: sqName(first) },
            behind: { t: yt, sq: sqName(second) }, arrow: [sqName(sq), sqName(second)] });
        }
      } else {
        const compatible = diag ? (xt === BISHOP || xt === QUEEN) : (xt === ROOK || xt === QUEEN);
        if (!compatible || second < 0) continue;
        const Z = g.board[second];
        if ((Z & BLACK) === them && (Z & 7) !== PAWN) {
          out.push({ id: 'xray', piece: type, sq: sqName(sq), front: { t: xt, sq: sqName(first) },
            target: { t: Z & 7, sq: sqName(second) } });
        }
      }
    }
  }

  // Deflection / decoy, recognized from the engine's main line.
  function deflectionDecoy(g, pv) {
    const [m, r, f] = pv;
    const to = mTo(m);
    if (!r || !f || mTo(r) !== to || !(mFlags(r) & F_CAPTURE)) return null;
    const moverT = mPromo(m) || (g.board[mFrom(m)] & 7);
    const capT = mFlags(m) & F_EP ? PAWN : (g.board[to] & 7);
    if (VAL[moverT] <= VAL[capT]) return null; // not an offer of material
    let res = null;
    g.make(m);
    const cFrom = mFrom(r), ct = g.board[cFrom] & 7, fTo = mTo(f);
    const guarded = g.attacksFrom(cFrom).includes(fTo);
    g.make(r);
    const fCap = g.board[fTo] & 7;
    g.make(f);
    const check = g.inCheck(), mate = check && !g.moves().length;
    const hitsTo = g.attacksFrom(fTo).includes(to);
    g.undo(); g.undo(); g.undo();
    if (guarded && fTo !== to && (fCap >= KNIGHT || mate)) {
      res = { id: 'deflection', piece: ct, sq: sqName(fTo), arrow: [sqName(cFrom), sqName(to)] };
    } else if ((ct === KING || ct === QUEEN) && hitsTo && (check || ct === QUEEN)) {
      res = { id: 'decoy', piece: ct, sq: sqName(to), arrow: [sqName(cFrom), sqName(to)] };
    }
    return res;
  }

  // ---------- tactic detection (g is the position BEFORE move m) ----------
  function detectTactics(g, m, pv) {
    const out = [];
    const us = g.turn, them = us ^ BLACK;
    const from = mFrom(m), to = mTo(m), fl = mFlags(m);
    const ptype = g.board[from] & 7;
    const capSq = fl & F_EP ? to + (us === WHITE ? -16 : 16) : to;
    const capP = fl & F_CAPTURE ? g.board[capSq] : 0, capT = capP & 7;
    const capWasDefended = capP ? g.attackers(capSq, them).length > 0 : false;
    const guardedByCap = [];
    if (capP) {
      for (const s of g.attacksFrom(capSq)) {
        const q = g.board[s];
        if (q && (q & BLACK) === them && (q & 7) !== KING && (q & 7) !== PAWN && !isHanging(g, s)) guardedByCap.push(s);
      }
    }
    const overBefore = new Set(findOverloaded(g, us).map(o => o.sq));
    // Could we have recaptured the piece just taken? (for zwischenzug)
    let recapSq = -1;
    const prev = g.hist[g.hist.length - 1];
    if (prev && !prev.isNull && prev.cap && (prev.cap & BLACK) === us) {
      const s = mTo(prev.m);
      if (g.moves().some(x => mTo(x) === s)) recapSq = s;
    }

    g.make(m);
    const moverT = mPromo(m) || ptype;
    const eKing = g.kings[them >> 3];
    const checkers = g.attackers(eKing, us);
    const replies = g.moves();
    const mate = checkers.length > 0 && replies.length === 0;
    const safe = isSafe(g, to);

    if (mate) {
      const ksq = eKing, kr = ksq >> 4, home = them === WHITE ? 0 : 7;
      let smothered = (g.board[checkers[0]] & 7) === KNIGHT;
      if (smothered) {
        for (const o of K_OFF) {
          const t = ksq + o;
          if (!(t & 0x88) && (!g.board[t] || (g.board[t] & BLACK) !== them)) { smothered = false; break; }
        }
      }
      const ct = g.board[checkers[0]] & 7;
      if (smothered) out.push({ id: 'smotheredMate' });
      else if (kr === home && (checkers[0] >> 4) === home && (ct === ROOK || ct === QUEEN)) out.push({ id: 'backRankMate' });
      else out.push({ id: 'checkmate' });
    }

    if (checkers.length >= 2) {
      out.push({ id: 'doubleCheck', piece: moverT, sq: sqName(to) });
    } else if (checkers.length === 1 && checkers[0] !== to && !(fl & F_CASTLE)) {
      out.push({ id: 'discoveredCheck', piece: moverT, sq: sqName(to), slider: g.board[checkers[0]] & 7,
        sliderSq: sqName(checkers[0]), arrow: [sqName(checkers[0]), sqName(eKing)] });
    }

    const targets = forkTargets(g, to);
    if (!mate && targets.length >= 2 && safe) {
      out.push({ id: moverT === QUEEN ? 'doubleAttack' : 'fork', piece: moverT, sq: sqName(to), targets });
    }

    if (!mate && (moverT === BISHOP || moverT === ROOK || moverT === QUEEN)) lineTactics(g, to, moverT, safe, out);

    // Discovered attack: a line piece of ours that looked through `from`.
    if (!mate && checkers.length < 2 && !(fl & F_CASTLE)) {
      for (let s = 0; s < 128; s++) {
        if (s & 0x88) { s += 7; continue; }
        const q = g.board[s];
        if (!q || (q & BLACK) !== us || s === to) continue;
        const qt = q & 7;
        if (qt !== BISHOP && qt !== ROOK && qt !== QUEEN) continue;
        const dirs = qt === BISHOP ? B_OFF : qt === ROOK ? R_OFF : K_OFF;
        for (const o of dirs) {
          let passed = false, hit = -1;
          for (let t = s + o; !(t & 0x88); t += o) {
            if (t === from) passed = true;
            if (g.board[t]) { hit = t; break; }
          }
          if (!passed || hit < 0) continue;
          const Z = g.board[hit];
          if ((Z & BLACK) !== them || (Z & 7) === KING || (Z & 7) === PAWN) continue;
          if (VAL[Z & 7] > VAL[qt] || !g.attackers(hit, them).length) {
            out.push({ id: 'discoveredAttack', piece: moverT, sq: sqName(to), slider: qt, sliderSq: sqName(s),
              target: { t: Z & 7, sq: sqName(hit) }, arrow: [sqName(s), sqName(hit)] });
          }
        }
      }
    }

    if (capP) {
      for (const s of guardedByCap) {
        const q = g.board[s];
        if (q && (q & BLACK) === them && g.attackers(s, us).length && isHanging(g, s)) {
          out.push({ id: 'removingDefender', captured: { t: capT, sq: sqName(capSq) }, target: { t: q & 7, sq: sqName(s) } });
          break;
        }
      }
    }

    if (!mate) {
      for (const o of findOverloaded(g, us)) {
        if (!overBefore.has(o.sq)) { out.push({ id: 'overloading', defender: { t: o.t, sq: o.sq }, targets: o.targets }); break; }
      }
    }

    if (capP) {
      const target = { t: capT, sq: sqName(capSq) };
      if (!capWasDefended) out.push({ id: 'hangingPiece', piece: ptype, target });
      else if (capT === ROOK && (ptype === BISHOP || ptype === KNIGHT)) out.push({ id: 'winningExchange', piece: ptype, target });
      else if (VAL[capT] > VAL[ptype]) out.push({ id: 'materialGain', piece: ptype, target });
      else if (VAL[capT] === VAL[ptype] && g.attackers(to, them).length) out.push({ id: 'trade', piece: ptype, target });
    }

    if (!mate && moverT !== KING && !mPromo(m) && VAL[moverT] >= 3 &&
      VAL[moverT] - (capP ? VAL[capT] : 0) >= 2 && replies.some(r => mTo(r) === to)) {
      const atk = g.attackers(to, them);
      if (atk.length && (!g.attackers(to, us).length || minVal(g, atk) < VAL[moverT])) {
        out.push({ id: 'sacrifice', piece: moverT, sq: sqName(to) });
      }
    }

    if (mPromo(m)) out.push({ id: 'promotion', promo: mPromo(m) });
    if (fl & F_EP) out.push({ id: 'enPassant' });

    if (recapSq >= 0 && to !== recapSq && pv && pv[0] === m && pv.length >= 3 && mTo(pv[2]) === recapSq &&
      (checkers.length || targets.length)) {
      out.push({ id: 'zwischenzug', sq: sqName(recapSq) });
    }

    if (!checkers.length && replies.length) {
      const mt = mateThreat(g);
      if (mt) out.push({ id: mt.backRank ? 'backRankThreat' : 'mateThreat', san: mt.san, arrow: [mt.from, mt.to] });
    }

    if (checkers.length === 1 && checkers[0] === to && !mate) out.push({ id: 'check', piece: moverT, sq: sqName(to) });
    g.undo();

    if (pv && pv[0] === m && pv.length >= 3) {
      const dd = deflectionDecoy(g, pv);
      if (dd) {
        const i = out.findIndex(t => !['checkmate', 'smotheredMate', 'backRankMate'].includes(t.id));
        out.splice(i < 0 ? out.length : i, 0, dd);
      }
    }
    return out;
  }

  // ---------- principles ----------
  function detectPrinciples(g, m, plyIndex) {
    const out = [];
    const us = g.turn, from = mFrom(m), to = mTo(m), fl = mFlags(m);
    const type = g.board[from] & 7;
    const home = us === WHITE ? 0 : 7;
    const opening = plyIndex < 24;
    if (fl & F_CASTLE) { out.push({ id: 'castle' }); return out; }
    const toName = sqName(to);
    if (type === PAWN && opening) {
      const center = us === WHITE ? ['d4', 'e4', 'c4'] : ['d5', 'e5', 'c5'];
      if (center.includes(toName)) out.push({ id: 'centerControl', piece: PAWN, sq: toName });
    }
    if ((type === KNIGHT || type === BISHOP) && (from >> 4) === home && opening) {
      out.push({ id: 'development', piece: type, sq: toName });
    }
    const undeveloped = undevelopedMinors(g, us);
    g.make(m);
    const givesCheck = g.inCheck();
    const passed = type === PAWN && isPassed(g, to);
    g.undo();
    if (type === QUEEN && plyIndex < 16 && undeveloped >= 2 && !(fl & F_CAPTURE)) {
      out.push({ id: 'earlyQueen', warn: true });
    } else if (opening && plyIndex < 20 && (type === KNIGHT || type === BISHOP) && (from >> 4) !== home &&
      !(fl & F_CAPTURE) && !givesCheck && undeveloped >= 2) {
      out.push({ id: 'tempo', warn: true });
    }
    const rights = us === WHITE ? 3 : 12;
    if (type === KING && (g.castling & rights) && queensOnBoard(g)) out.push({ id: 'kingSafetyWarn', warn: true });
    if (type === ROOK && (from & 7) !== (to & 7) && isOpenFile(g, to & 7)) {
      out.push({ id: 'openFile', sq: toName, file: 'abcdefgh'[to & 7] });
    }
    if (type === BISHOP) {
      const fian = us === WHITE ? { b2: 'b3', g2: 'g3' } : { b7: 'b6', g7: 'g6' };
      const pawnSq = fian[toName];
      if (pawnSq && g.board[Core.sqParse(pawnSq)] === (us | PAWN)) out.push({ id: 'fianchetto', sq: toName });
    }
    if (type === KING && !queensOnBoard(g) && plyIndex > 30) {
      const cd = s => Math.max(3 - (s >> 4), (s >> 4) - 4) + Math.max(3 - (s & 7), (s & 7) - 4);
      if (cd(to) < cd(from)) out.push({ id: 'kingActivity' });
    }
    const rel = us === WHITE ? (to >> 4) : 7 - (to >> 4);
    if (passed && rel >= 4 && !mPromo(m)) out.push({ id: 'passedPawn', sq: toName });
    return out;
  }

  // ---------- openings ----------
  const cleanSan = s => s.replace(/[+#!?]/g, '');
  function openingAt(sans) {
    let best = null, bestLen = 0;
    for (const o of OPENINGS) {
      if (o.moves.length > sans.length || o.moves.length <= bestLen) continue;
      let ok = true;
      for (let i = 0; i < o.moves.length; i++) if (cleanSan(sans[i]) !== o.moves[i]) { ok = false; break; }
      if (ok) { best = o.id; bestLen = o.moves.length; }
    }
    return best;
  }
  // The opening named by exactly this move (null if nothing new).
  function newOpening(sans) {
    const now = openingAt(sans);
    if (!now) return null;
    return now !== openingAt(sans.slice(0, -1)) ? now : null;
  }

  // ---------- evaluation helpers ----------
  function winPct(cp) {
    if (cp > MATE - 1000) cp = 3000; else if (cp < -MATE + 1000) cp = -3000;
    cp = Math.max(-3000, Math.min(3000, cp));
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  }

  // What does a line win for the side to move at g?
  function lineGain(g, pv, score) {
    if (score > MATE - 500) return { kind: 'mate', n: Math.max(1, Math.ceil((MATE - score) / 2)) };
    const us = g.turn, gained = [], lost = [];
    let net = 0, made = 0;
    for (let i = 0; i < pv.length && i < 10; i++) {
      const m = pv[i], fl = mFlags(m), mover = g.turn;
      const cap = fl & F_EP ? PAWN : (fl & F_CAPTURE ? g.board[mTo(m)] & 7 : 0);
      const sign = mover === us ? 1 : -1;
      if (cap) { net += sign * VAL[cap]; (sign > 0 ? gained : lost).push(cap); }
      if (mPromo(m)) net += sign * (VAL[mPromo(m)] - 1);
      g.make(m); made++;
    }
    while (made--) g.undo();
    let kind = null;
    if (net >= 7) kind = gained.includes(QUEEN) ? 'queen' : 'material';
    else if (net >= 4) kind = gained.includes(ROOK) ? 'rook' : 'material';
    else if (net === 2 && gained.includes(ROOK) && (lost.includes(KNIGHT) || lost.includes(BISHOP))) kind = 'exchange';
    else if (net >= 2) kind = (gained.includes(KNIGHT) || gained.includes(BISHOP)) ? 'piece' : 'material';
    else if (net >= 1) kind = 'pawn';
    return kind ? { kind, net } : null;
  }

  function moveInfo(g, m, legal) {
    const fl = mFlags(m), from = mFrom(m), to = mTo(m);
    return {
      san: g.san(m, legal || g.moves()),
      piece: g.board[from] & 7,
      from: sqName(from), to: sqName(to),
      capture: !!(fl & F_CAPTURE),
      castle: fl & F_CASTLE ? ((to & 7) === 6 ? 'K' : 'Q') : null,
      promo: mPromo(m)
    };
  }

  const pickTactics = (list, n) => {
    const major = list.filter(t => MAJOR.has(t.id));
    const minor = list.filter(t => !MAJOR.has(t.id));
    // Avoid repeating the same idea twice (e.g. a check that is also a fork).
    const seen = new Set(), outList = [];
    for (const t of major.concat(minor)) {
      if (seen.has(t.id)) continue;
      if (t.id === 'check' && major.length) continue;
      if ((t.id === 'trade' || t.id === 'materialGain') && major.length) continue;
      seen.add(t.id);
      outList.push(t);
      if (outList.length >= n) break;
    }
    return outList;
  };

  // ---------- building coach entries ----------
  function analyzeUserMove(g, m, results, plyIndex, sans) {
    const legal = g.moves();
    const best = results[0];
    const mine = results.find(r => r.move === m) || { move: m, score: best ? best.score : 0, pv: [m] };
    const isBest = !best || best.move === m || Math.abs(best.score - mine.score) <= 5;
    const d = best ? Math.max(0, winPct(best.score) - winPct(mine.score)) : 0;
    let tactics = detectTactics(g, m, mine.pv);
    const sac = tactics.some(t => t.id === 'sacrifice');
    const hasMajor = tactics.some(t => MAJOR.has(t.id));
    const second = results.find(r => r.move !== (best && best.move));
    const onlyMove = isBest && second && winPct(best.score) - winPct(second.score) >= 12 && winPct(best.score) > 35;

    let rating;
    if (isBest || d < 1.5) {
      if (sac && winPct(mine.score) >= 45 && d < 1.5) rating = 'brilliant';
      else if (onlyMove || (hasMajor && d < 1.5)) rating = 'great';
      else rating = 'good';
    } else if (d < 4) rating = 'good';
    else if (d < 10) rating = 'inaccuracy';
    else if (d < 20) rating = 'mistake';
    else rating = 'blunder';
    // Allowing a forced mate is always a blunder; missing one is at least an inaccuracy.
    if (best && mine.score < -MATE + 500 && best.score > -MATE + 500) rating = 'blunder';
    if (rating === 'good' && !isBest && best.score > MATE - 500 && mine.score < MATE - 500) rating = 'inaccuracy';

    const goodish = rating === 'brilliant' || rating === 'great' || rating === 'good';
    if (!goodish) tactics = tactics.filter(t => t.id !== 'sacrifice' && t.id !== 'decoy' && t.id !== 'deflection');
    const entry = {
      kind: 'user', move: moveInfo(g, m, legal), rating, isBest, onlyMove,
      tactics: pickTactics(tactics, 2),
      principles: detectPrinciples(g, m, plyIndex).slice(0, 2),
      opening: newOpening(sans),
      bestMove: null, better: null, refutation: null
    };

    if (best && !isBest && d >= 2.5) {
      const bt = detectTactics(g, best.move, best.pv).filter(t => MAJOR.has(t.id) || t.id === 'hangingPiece');
      entry.better = {
        move: moveInfo(g, best.move, legal),
        tactic: bt.length ? bt[0] : null,
        gain: lineGain(g, best.pv, best.score),
        mild: rating === 'good'
      };
      entry.bestMove = { from: entry.better.move.from, to: entry.better.move.to };
    }

    if ((rating === 'mistake' || rating === 'blunder') && mine.pv.length > 1) {
      g.make(m);
      const reply = mine.pv[1];
      const rLegal = g.moves();
      if (rLegal.includes(reply)) {
        const rt = detectTactics(g, reply, mine.pv.slice(1)).filter(t => MAJOR.has(t.id));
        let hanging = null;
        if (mFlags(reply) & F_CAPTURE && !(mFlags(reply) & F_EP) && isHanging(g, mTo(reply))) {
          hanging = { t: g.board[mTo(reply)] & 7, sq: sqName(mTo(reply)) };
        }
        let gain = null;
        if (mine.score < -MATE + 500) {
          gain = { kind: 'mate', n: Math.max(1, Math.ceil((MATE + mine.score - 1) / 2)) };
        } else gain = lineGain(g, mine.pv.slice(1), -mine.score);
        entry.refutation = { move: moveInfo(g, reply, rLegal), tactic: rt[0] || null, gain, hanging };
      }
      g.undo();
    }
    return entry;
  }

  function analyzeComputerMove(g, m, plyIndex, sans) {
    const legal = g.moves();
    const entry = {
      kind: 'cpu', move: moveInfo(g, m, legal),
      tactics: pickTactics(detectTactics(g, m, null), 2),
      principles: detectPrinciples(g, m, plyIndex).slice(0, 2),
      opening: newOpening(sans),
      dangers: []
    };
    g.make(m);
    const human = g.turn;
    if (g.moves().length) {
      const list = [];
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = g.board[sq];
        if (p && (p & BLACK) === human && (p & 7) !== PAWN && isHanging(g, sq)) {
          list.push({ t: p & 7, sq: sqName(sq), undefended: !g.attackers(sq, human).length });
        }
      }
      list.sort((a, b) => VAL[b.t] - VAL[a.t]);
      entry.dangers = list.slice(0, 2);
    }
    g.undo();
    return entry;
  }

  // ---------- text ----------
  const PIECES = {
    en: ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'],
    es: ['', 'peón', 'caballo', 'alfil', 'torre', 'dama', 'rey']
  };
  const FEM = [false, false, false, false, true, true, false];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const list = (items, lang) => items.length <= 1 ? (items[0] || '') :
    items.slice(0, -1).join(', ') + (lang === 'es' ? ' y ' : ' and ') + items[items.length - 1];
  const aObj = s => s.startsWith('el ') ? 'al ' + s.slice(3) : 'a ' + s;

  function helpers(lang, you) {
    const P = PIECES[lang];
    if (lang === 'es') {
      const tu = t => 'tu ' + P[t];
      const rival = t => (FEM[t] ? 'la ' : 'el ') + P[t] + ' rival';
      return { P, own: t => you ? tu(t) : rival(t), opp: t => you ? rival(t) : tu(t), tu, rival };
    }
    const your = t => 'your ' + P[t], their = t => 'their ' + P[t];
    return { P, own: t => you ? your(t) : their(t), opp: t => you ? their(t) : your(t), your, their };
  }

  function moveWords(mi, lang) {
    const P = PIECES[lang];
    if (lang === 'es') {
      if (mi.castle) return mi.castle === 'K' ? 'enroque corto' : 'enroque largo';
      let s = cap(P[mi.piece]) + (mi.capture ? ' captura en ' : ' a ') + mi.to;
      if (mi.promo) s += ', coronando ' + P[mi.promo];
      return s;
    }
    if (mi.castle) return mi.castle === 'K' ? 'castling kingside' : 'castling queenside';
    let s = cap(P[mi.piece]) + (mi.capture ? ' takes on ' : ' to ') + mi.to;
    if (mi.promo) s += ', promoting to a ' + P[mi.promo];
    return s;
  }

  function moveText(mi, lang) {
    return `<b class="mv">${localizeSan(mi.san, lang)}</b> (${moveWords(mi, lang)})`;
  }

  function tacticText(x, lang, you) {
    const H = helpers(lang, you), P = H.P;
    const on = (o) => lang === 'es' ? `${H.opp(o.t)} en ${o.sq}` : `${H.opp(o.t)} on ${o.sq}`;
    if (lang === 'es') {
      const A = cap(H.own(x.piece || PAWN));
      switch (x.id) {
        case 'fork': return you ? `Eso fue [[a:fork]]: ${H.own(x.piece)} en ${x.sq} ataca a la vez ${list(x.targets.map(t => aObj(on(t))), lang)}.`
          : `¡Es [[a:fork]]! ${A} en ${x.sq} ataca a la vez ${list(x.targets.map(t => aObj(on(t))), lang)}: no podrás salvarlo todo.`;
        case 'doubleAttack': return you ? `Es [[a:doubleAttack]]: ${H.own(x.piece)} en ${x.sq} ataca a la vez ${list(x.targets.map(t => aObj(on(t))), lang)}.`
          : `¡Cuidado, [[a:doubleAttack]]! ${A} en ${x.sq} ataca a la vez ${list(x.targets.map(t => aObj(on(t))), lang)}.`;
        case 'pin': return `${you ? 'Eso fue' : 'El rival hizo'} [[a:pin]]: ${H.own(x.piece)} clava ${aObj(on(x.pinned))}, porque detrás está ${H.opp(x.behind.t)}${x.absolute ? ' (y como es el rey, mover esa pieza sería ilegal)' : ''}.`;
        case 'skewer': return you ? `¡Es [[a:skewer]]! ${A} ataca ${aObj(on(x.front))} y, cuando se aparte, podrás capturar ${H.opp(x.behind.t)}, que está detrás.`
          : `¡Es [[a:skewer]]! ${A} ataca ${aObj(on(x.front))} y, cuando se aparte, el rival podrá capturar ${H.opp(x.behind.t)}, que está detrás.`;
        case 'xray': return `${you ? 'Buena idea:' : 'Atención:'} ${H.own(x.piece)} y ${H.own(x.front.t)} se alinean contra ${H.opp(x.target.t)} en ${x.target.sq}: es [[a:xray]].`;
        case 'discoveredAttack': return you ? `¡[[A:discoveredAttack]]! Al mover ${H.own(x.piece)}, destapaste ${H.own(x.slider)} de ${x.sliderSq}, que ahora ataca ${aObj(on(x.target))}.`
          : `[[A:discoveredAttack]]: el rival apartó su ${P[x.piece]} y destapó su ${P[x.slider]} de ${x.sliderSq}, que ahora ataca ${aObj(on(x.target))}.`;
        case 'discoveredCheck': return you ? `¡[[A:discoveredCheck]]! Al mover ${H.own(x.piece)}, ${H.own(x.slider)} de ${x.sliderSq} da jaque.`
          : `[[A:discoveredCheck]]: el rival apartó su ${P[x.piece]} y su ${P[x.slider]} de ${x.sliderSq} te da jaque.`;
        case 'doubleCheck': return you ? '¡[[A:doubleCheck]]! El rey rival recibe jaque de dos piezas a la vez y está obligado a moverse.'
          : '¡[[A:doubleCheck]]! Tu rey recibe jaque de dos piezas a la vez: la única defensa es mover el rey.';
        case 'checkmate': return you ? '¡[[C:checkmate]]! El rey rival está atacado y no tiene escapatoria. ¡Has ganado!'
          : '[[C:checkmate]]. Tu rey no tiene escapatoria. Usa «Retroceder» para buscar una defensa.';
        case 'backRankMate': return you ? '¡[[C:backRankMate]]! El rey rival quedó atrapado en su primera fila por sus propios peones. ¡Has ganado!'
          : 'Es [[a:backRankMate]]: tu rey quedó encerrado tras sus propios peones. Abrir una casilla de escape (por ejemplo, con h3) lo evita.';
        case 'smotheredMate': return you ? '¡[[C:smotheredMate]]! El rey rival está rodeado por sus propias piezas y tu caballo da mate.'
          : '[[C:smotheredMate]]: tu rey quedó encerrado por sus propias piezas.';
        case 'check': return you ? `Das [[check]] con ${H.own(x.piece)}: el rival está obligado a responder.`
          : `¡[[C:check]]! ${A} ataca a tu rey: debes responder.`;
        case 'removingDefender': return you ? `Eso es [[a:removingDefender]]: capturaste ${H.opp(x.captured.t)}, que protegía ${aObj(on(x.target))}.`
          : `El rival aplicó [[a:removingDefender]]: capturó tu ${P[x.captured.t]}, que protegía ${aObj(on(x.target))}.`;
        case 'overloading': return you ? `Aprovechas [[a:overloading]]: ${H.opp(x.defender.t)} en ${x.defender.sq} tiene que defender a la vez ${list(x.targets.map(t => aObj(on(t))), lang)}, ¡y no puede con todo!`
          : `Cuidado con [[a:overloading]]: tu ${P[x.defender.t]} en ${x.defender.sq} tiene que defender a la vez ${list(x.targets.map(t => aObj(on(t))), lang)} y no puede con todo.`;
        case 'hangingPiece': return you ? `Capturaste ${on(x.target)} gratis: era [[a:hangingPiece]] (no tenía defensa).`
          : `El rival capturó tu ${P[x.target.t]} en ${x.target.sq}: era [[a:hangingPiece]]. ¡Comprueba siempre que tus piezas estén protegidas!`;
        case 'winningExchange': return you ? `Entregas una pieza menor por una torre: eso es [[winningExchange]].`
          : `El rival cambia una pieza menor por tu torre: eso es [[winningExchange]].`;
        case 'materialGain': return you ? `Ganas material: ${H.own(x.piece)} captura ${on(x.target)}. Conocer el [[materialValue]] te ayuda a hacer buenos cambios.`
          : `El rival gana material: su ${P[x.piece]} captura tu ${P[x.target.t]} en ${x.target.sq}.`;
        case 'trade': return you ? `Es [[a:trade]]: ${H.own(x.piece)} captura ${on(x.target)} y el rival puede recapturar.`
          : `El rival propone [[a:trade]]: su ${P[x.piece]} capturó tu ${P[x.target.t]} en ${x.target.sq}; seguramente puedes recapturar.`;
        case 'sacrifice': return you ? `¡Un auténtico [[sacrifice]]! Ofreciste ${H.own(x.piece)} para conseguir algo más grande a cambio.`
          : `El rival ofrece [[a:sacrifice]]: puedes capturar ${H.own(x.piece)} en ${x.sq}, ¡pero piensa bien antes de hacerlo!`;
        case 'promotion': return you ? `¡[[C:promotion]]! Tu peón se convirtió en ${FEM[x.promo] ? 'una' : 'un'} ${P[x.promo]}.`
          : `[[C:promotion]]: el peón rival se convirtió en ${FEM[x.promo] ? 'una' : 'un'} ${P[x.promo]}.`;
        case 'enPassant': return you ? '¡Hiciste [[a:enPassant]], la captura especial de peón!' : 'El rival hizo [[a:enPassant]] sobre tu peón.';
        case 'zwischenzug': return you ? `¡Buena [[zwischenzug]]! En lugar de recapturar enseguida en ${x.sq}, primero jugaste una jugada forzante: la recaptura puede esperar.`
          : `Una [[zwischenzug]]: en lugar de recapturar enseguida en ${x.sq}, el rival intercaló primero una jugada forzante.`;
        case 'mateThreat': return you ? `[[C:threat]]: ahora amenazas [[checkmate]] con <b class="mv">${localizeSan(x.san, lang)}</b>.`
          : `¡Cuidado! El rival amenaza [[checkmate]] con <b class="mv">${localizeSan(x.san, lang)}</b>. ¡Defiéndete!`;
        case 'backRankThreat': return you ? `[[C:threat]]: ahora amenazas [[a:backRankMate]] con <b class="mv">${localizeSan(x.san, lang)}</b>.`
          : `¡Cuidado! El rival amenaza [[a:backRankMate]] con <b class="mv">${localizeSan(x.san, lang)}</b>. Una casilla de escape para tu rey lo evitaría.`;
        case 'deflection': return you ? `Es [[a:deflection]]: obligas ${aObj(H.opp(x.piece))} a abandonar la defensa de ${x.sq}.`
          : `Es [[a:deflection]]: el rival quiere que tu ${P[x.piece]} abandone la defensa de ${x.sq}.`;
        case 'decoy': return you ? `Es [[a:decoy]]: atraes ${aObj(H.opp(x.piece))} a ${x.sq}, donde quedará en apuros.`
          : `Es [[a:decoy]]: el rival quiere atraer a tu ${P[x.piece]} a ${x.sq}.`;
      }
      return '';
    }
    const A = cap(H.own(x.piece || PAWN));
    switch (x.id) {
      case 'fork': return you ? `That was [[a:fork]]: ${H.own(x.piece)} on ${x.sq} attacks ${list(x.targets.map(on), lang)} at the same time.`
        : `That's [[a:fork]]! ${A} on ${x.sq} attacks ${list(x.targets.map(on), lang)} at the same time — you can't save everything.`;
      case 'doubleAttack': return you ? `That's [[a:doubleAttack]]: ${H.own(x.piece)} on ${x.sq} hits ${list(x.targets.map(on), lang)} at once.`
        : `Careful — [[a:doubleAttack]]! ${A} on ${x.sq} hits ${list(x.targets.map(on), lang)} at once.`;
      case 'pin': return `${you ? 'That was' : 'They set up'} [[a:pin]]: ${H.own(x.piece)} stops ${on(x.pinned)} from moving, because ${H.opp(x.behind.t)} is behind it${x.absolute ? ' — since it’s the king, moving would even be illegal' : ''}.`;
      case 'skewer': return you ? `That's [[a:skewer]]! ${A} attacks ${on(x.front)}, and when it moves away you can capture ${H.opp(x.behind.t)} behind it.`
        : `That's [[a:skewer]]! ${A} attacks ${on(x.front)}, and when it moves away they can capture ${H.opp(x.behind.t)} behind it.`;
      case 'xray': return `${you ? 'Nice idea:' : 'Heads up:'} ${H.own(x.piece)} and ${H.own(x.front.t)} line up in [[a:xray]] attack against ${H.opp(x.target.t)} on ${x.target.sq}.`;
      case 'discoveredAttack': return you ? `[[A:discoveredAttack]]! By moving ${H.own(x.piece)}, you uncovered ${H.own(x.slider)} on ${x.sliderSq}, which now attacks ${on(x.target)}.`
        : `[[A:discoveredAttack]]: by moving their ${P[x.piece]}, they uncovered their ${P[x.slider]} on ${x.sliderSq}, which now attacks ${on(x.target)}.`;
      case 'discoveredCheck': return you ? `[[A:discoveredCheck]]! Moving ${H.own(x.piece)} revealed a check from ${H.own(x.slider)} on ${x.sliderSq}.`
        : `[[A:discoveredCheck]]: their ${P[x.piece]} stepped aside, so their ${P[x.slider]} on ${x.sliderSq} gives check.`;
      case 'doubleCheck': return you ? '[[A:doubleCheck]]! The enemy king is attacked by two pieces at once, so it must move.'
        : '[[A:doubleCheck]]! Your king is attacked twice — the only answer is to move the king.';
      case 'checkmate': return you ? '[[C:checkmate]]! The enemy king is attacked and has no escape. You win!'
        : '[[C:checkmate]]. Your king has no escape. Use “Take back” to look for a defense.';
      case 'backRankMate': return you ? '[[C:backRankMate]]! The king was trapped on its back rank by its own pawns. You win!'
        : 'That’s [[a:backRankMate]]: your king was trapped behind its own pawns. Making an escape square (for example with h3) prevents this.';
      case 'smotheredMate': return you ? '[[C:smotheredMate]]! The king is surrounded by its own pieces and your knight delivers mate.'
        : '[[C:smotheredMate]] — your king was boxed in by its own pieces.';
      case 'check': return you ? `You give [[check]] with ${H.own(x.piece)}, so your opponent must respond.`
        : `[[C:check]]! ${A} attacks your king — you must respond.`;
      case 'removingDefender': return you ? `That's [[removingDefender]]: you captured ${H.opp(x.captured.t)}, which was protecting ${on(x.target)}.`
        : `They used [[removingDefender]]: they captured your ${P[x.captured.t]}, which was protecting ${on(x.target)}.`;
      case 'overloading': return you ? `You exploit [[overloading]]: ${H.opp(x.defender.t)} on ${x.defender.sq} must defend both ${list(x.targets.map(on), lang)} — it can't do both jobs!`
        : `Watch out for [[overloading]]: your ${P[x.defender.t]} on ${x.defender.sq} is the only defender of ${list(x.targets.map(on), lang)} — it can't protect both.`;
      case 'hangingPiece': return you ? `You captured ${on(x.target)} for free — it was [[a:hangingPiece]] (undefended).`
        : `They captured your ${P[x.target.t]} on ${x.target.sq} — it was [[a:hangingPiece]]. Always check that your pieces are protected!`;
      case 'winningExchange': return you ? 'You give a minor piece for a rook — that’s [[winningExchange]].'
        : 'They take your rook for a minor piece — that’s [[winningExchange]] for them.';
      case 'materialGain': return you ? `You win material: ${H.own(x.piece)} captures ${on(x.target)}. Knowing the [[materialValue]] helps you trade well.`
        : `They win material: their ${P[x.piece]} captures your ${P[x.target.t]} on ${x.target.sq}.`;
      case 'trade': return you ? `That's [[a:trade]]: ${H.own(x.piece)} takes ${on(x.target)}, and they can take back.`
        : `They offer [[a:trade]]: their ${P[x.piece]} took your ${P[x.target.t]} on ${x.target.sq} — you can probably take back.`;
      case 'sacrifice': return you ? `A real [[sacrifice]]! You offered ${H.own(x.piece)} to get something bigger in return.`
        : `They offer [[a:sacrifice]]: you can capture ${H.own(x.piece)} on ${x.sq}, but think carefully before taking it!`;
      case 'promotion': return you ? `[[C:promotion]]! Your pawn became a ${P[x.promo]}.` : `[[C:promotion]]: their pawn became a ${P[x.promo]}.`;
      case 'enPassant': return you ? 'You captured [[enPassant]] — the special pawn capture!' : 'They captured your pawn [[enPassant]].';
      case 'zwischenzug': return you ? `Clever [[zwischenzug]]! Instead of recapturing on ${x.sq} right away, you first played a forcing move — the recapture can wait.`
        : `A [[zwischenzug]]: instead of recapturing on ${x.sq} immediately, they inserted a forcing move first.`;
      case 'mateThreat': return you ? `[[C:threat]]: you now threaten [[checkmate]] with <b class="mv">${x.san}</b>!`
        : `Watch out! They threaten [[checkmate]] with <b class="mv">${x.san}</b>. Defend!`;
      case 'backRankThreat': return you ? `[[C:threat]]: you now threaten [[a:backRankMate]] with <b class="mv">${x.san}</b>!`
        : `Watch out! They threaten [[a:backRankMate]] with <b class="mv">${x.san}</b>. An escape square for your king would help.`;
      case 'deflection': return you ? `That's [[a:deflection]]: you force ${H.opp(x.piece)} away from guarding ${x.sq}.`
        : `That's [[a:deflection]]: they want to pull your ${P[x.piece]} away from guarding ${x.sq}.`;
      case 'decoy': return you ? `That's [[a:decoy]]: you lure ${H.opp(x.piece)} to ${x.sq}, where it gets into trouble.`
        : `That's [[a:decoy]]: they want to lure your ${P[x.piece]} to ${x.sq}.`;
    }
    return '';
  }

  function principleText(x, lang, you) {
    const H = helpers(lang, you);
    if (lang === 'es') {
      switch (x.id) {
        case 'castle': return you ? 'Has hecho el [[castling]]: es bueno [[castleEarly]], porque mejora la [[kingSafety]] y conecta tus torres.'
          : 'El rival hizo el [[castling]] y mejora la [[kingSafety]] de su rey.';
        case 'centerControl': return you ? `Tu peón en ${x.sq} contribuye al [[centerControl]].` : `El rival lucha por el [[centerControl]] con su peón en ${x.sq}.`;
        case 'development': return you ? `Buen [[development]]: ${H.own(x.piece)} entra en juego en ${x.sq}.` : `El rival continúa su [[development]]: su ${H.P[x.piece]} entra en juego en ${x.sq}.`;
        case 'earlyQueen': return you ? 'Cuidado con [[earlyQueen]]: puede ser hostigada por piezas rivales y perderás [[tempo]]s.'
          : 'El rival decidió [[earlyQueen]]: busca atacarla mientras desarrollas tus piezas, ganando [[tempo]]s.';
        case 'tempo': return you ? 'Has movido la misma pieza dos veces en la apertura. Eso cuesta un [[tempo]]: intenta desarrollar primero otras piezas.'
          : 'El rival movió la misma pieza dos veces: le cuesta un [[tempo]]. ¡Aprovecha para desarrollarte!';
        case 'kingSafetyWarn': return you ? 'Al mover el rey pierdes el derecho a enrocar: piensa en la [[kingSafety]].'
          : 'El rey rival se movió y ya no puede enrocar: su [[kingSafety]] puede resentirse.';
        case 'openFile': return you ? `Tu torre en ${x.sq} ocupa una [[openFile]]: ¡a las torres les encantan las columnas abiertas!` : `La torre rival se sitúa en una [[openFile]] (columna ${x.file}).`;
        case 'fianchetto': return you ? `Es un [[fianchetto]]: tu alfil en ${x.sq} controla la gran diagonal.` : `El rival hace un [[fianchetto]]: su alfil en ${x.sq} apunta a la gran diagonal.`;
        case 'kingActivity': return you ? 'En el final, [[a:kingActivity]] es una pieza poderosa: ¡buena centralización!' : 'El rey rival se activa: en el final, [[a:kingActivity]] es muy importante.';
        case 'passedPawn': return you ? `Tu [[passedPawn]] en ${x.sq} avanza: ningún peón rival puede detenerlo.` : `¡Vigila el [[passedPawn]] rival en ${x.sq}! Bloquéalo antes de que corone.`;
      }
      return '';
    }
    switch (x.id) {
      case 'castle': return you ? 'You castled! [[C:castleEarly]] is a great habit: it improves your [[kingSafety]] and connects your rooks.'
        : 'They castled ([[castling]]), improving their [[kingSafety]].';
      case 'centerControl': return you ? `Your pawn on ${x.sq} helps with [[centerControl]].` : `They fight for [[centerControl]] with their pawn on ${x.sq}.`;
      case 'development': return you ? `Good [[development]]: ${H.own(x.piece)} comes into play on ${x.sq}.` : `They continue their [[development]], bringing their ${H.P[x.piece]} to ${x.sq}.`;
      case 'earlyQueen': return you ? 'Be careful with [[earlyQueen]]: it can be chased by enemy pieces, and you lose [[tempo]]s.'
        : 'They went for [[earlyQueen]] — look for ways to attack it while developing your pieces, gaining [[tempo]]s.';
      case 'tempo': return you ? 'You moved the same piece twice in the opening. That costs a [[tempo]] — try to develop new pieces first.'
        : 'They moved the same piece twice — that costs them a [[tempo]]. Use it to develop!';
      case 'kingSafetyWarn': return you ? 'Moving your king loses the right to castle — think about [[kingSafety]].'
        : 'Their king moved and can no longer castle — their [[kingSafety]] may suffer.';
      case 'openFile': return you ? `Your rook on ${x.sq} sits on [[a:openFile]] — rooks love open files!` : `Their rook takes [[a:openFile]] (the ${x.file}-file).`;
      case 'fianchetto': return you ? `That's [[a:fianchetto]]: your bishop on ${x.sq} controls the long diagonal.` : `They set up [[a:fianchetto]] — their bishop on ${x.sq} eyes the long diagonal.`;
      case 'kingActivity': return you ? 'In the endgame, [[a:kingActivity]] is a powerful piece — nice centralization!' : 'Their king is becoming active — in the endgame, [[a:kingActivity]] matters a lot.';
      case 'passedPawn': return you ? `Your [[passedPawn]] on ${x.sq} is marching forward — no enemy pawn can stop it.` : `Watch their [[passedPawn]] on ${x.sq}! Blockade it before it promotes.`;
    }
    return '';
  }

  function gainText(gain, lang, you, hypothetical) {
    if (!gain) return '';
    const H = helpers(lang, you);
    if (lang === 'es') {
      const pre = hypothetical ? ', que habría ganado ' : ', ganando ';
      switch (gain.kind) {
        case 'mate': return hypothetical ? `, que llevaba a mate en ${gain.n}` : `, con mate en ${gain.n}`;
        case 'queen': return pre + H.opp(QUEEN);
        case 'rook': return pre + 'una torre';
        case 'piece': return pre + 'una pieza';
        case 'exchange': return pre + 'la calidad';
        case 'pawn': return pre + 'un peón';
        default: return hypothetical ? ', que habría ganado material' : ', ganando material';
      }
    }
    const pre = hypothetical ? ', which would have won ' : ', winning ';
    switch (gain.kind) {
      case 'mate': return hypothetical ? `, leading to checkmate in ${gain.n}` : `, with checkmate in ${gain.n}`;
      case 'queen': return pre + H.opp(QUEEN);
      case 'rook': return pre + 'a rook';
      case 'piece': return pre + 'a piece';
      case 'exchange': return pre + 'the exchange';
      case 'pawn': return pre + 'a pawn';
      default: return pre + 'material';
    }
  }

  const MATES = new Set(['checkmate', 'smotheredMate', 'backRankMate']);
  const RATING_SYMBOL = { brilliant: '!!', great: '!', good: '✓', inaccuracy: '?!', mistake: '?', blunder: '??' };
  const RATING_TEXT = {
    en: {
      brilliant: () => 'You found a sacrifice that really works!',
      great: e => e.onlyMove ? 'It was the only really good move here!' : 'You found the strongest continuation!',
      good: e => e.isBest ? 'That’s exactly what a strong player would play.' : 'It keeps your position healthy.',
      inaccuracy: () => 'Not bad, but there was something more precise.',
      mistake: () => 'This move makes your position noticeably worse.',
      blunder: () => 'Oops! This gives your opponent a big chance.'
    },
    es: {
      brilliant: () => '¡Encontraste un sacrificio que funciona de verdad!',
      great: e => e.onlyMove ? '¡Era la única jugada realmente buena aquí!' : '¡Encontraste la continuación más fuerte!',
      good: e => e.isBest ? 'Es exactamente lo que jugaría un jugador fuerte.' : 'Mantiene tu posición sana.',
      inaccuracy: () => 'No está mal, pero había algo más preciso.',
      mistake: () => 'Esta jugada empeora claramente tu posición.',
      blunder: () => '¡Uy! Esto le da una gran oportunidad a tu rival.'
    }
  };

  // Returns an array of paragraphs (strings with [[term]] tokens).
  function paragraphs(entry, lang) {
    const out = [];
    const es = lang === 'es';
    if (entry.kind === 'user') {
      out.push(`${es ? 'Jugaste' : 'You played'} ${moveText(entry.move, lang)}.`);
      out.push(`<span class="badge b-${entry.rating}">${RATING_SYMBOL[entry.rating]} [[C:${entry.rating}]]</span> ${RATING_TEXT[lang][entry.rating](entry)}`);
      const praise = ['brilliant', 'great', 'good'].includes(entry.rating);
      entry.tactics.forEach((t, i) => {
        let s = tacticText(t, lang, true);
        if (s && i === 0 && praise && MAJOR.has(t.id) && !/^\[\[C:|^¡/.test(s)) s = (es ? '¡Bien! ' : 'Nice! ') + s;
        if (s) out.push(s);
      });
      entry.principles.forEach(p => { const s = principleText(p, lang, true); if (s) out.push(s); });
      if (entry.opening) out.push(es ? `Apertura: estamos en [[the:${entry.opening}]].` : `Opening: this is [[the:${entry.opening}]].`);
      if (entry.better) {
        const b = entry.better, mv = moveText(b.move, lang), gain = gainText(b.gain, lang, true, true);
        const id = b.tactic ? b.tactic.id : null;
        const lead = es ? (b.mild ? 'Aun así,' : 'Pero') : (b.mild ? 'Still,' : 'But');
        let s;
        if (es) {
          if (!id) s = `${b.mild ? 'Aún mejor era' : 'Era más fuerte'} ${mv}${gain}.`;
          else if (id === 'mateThreat') s = `${lead} ${mv} habría amenazado [[checkmate]]${gain}.`;
          else if (id === 'backRankThreat') s = `${lead} ${mv} habría amenazado [[a:backRankMate]]${gain}.`;
          else if (id === 'hangingPiece') s = `${lead} podías capturar [[a:hangingPiece]] con ${mv}${gain}.`;
          else if (MATES.has(id)) s = `${lead} tenías [[a:${id}]] con ${mv}.`;
          else s = `${lead} tenías [[a:${termOf(id)}]] con ${mv}${gain}.`;
        } else {
          if (!id) s = `${b.mild ? 'Even stronger was' : 'A stronger move was'} ${mv}${gain}.`;
          else if (id === 'mateThreat') s = `${lead} ${mv} would have threatened [[checkmate]]${gain}.`;
          else if (id === 'backRankThreat') s = `${lead} ${mv} would have threatened [[a:backRankMate]]${gain}.`;
          else if (id === 'hangingPiece') s = `${lead} you could have captured [[a:hangingPiece]] with ${mv}${gain}.`;
          else if (MATES.has(id)) s = `${lead} you had [[a:${id}]] with ${mv}!`;
          else s = `${lead} you had [[a:${termOf(id)}]] available with ${mv}${gain}.`;
        }
        out.push(s);
      }
      if (entry.refutation) {
        const r = entry.refutation;
        if (r.hanging) {
          out.push(es ? `Tu ${PIECES.es[r.hanging.t]} en ${r.hanging.sq} quedó sin defensa suficiente: es [[a:hangingPiece]].`
            : `Your ${PIECES.en[r.hanging.t]} on ${r.hanging.sq} isn’t properly defended — it’s [[a:hangingPiece]].`);
        }
        let tac = '';
        if (r.tactic) {
          const id = r.tactic.id;
          if (id === 'mateThreat') tac = es ? ' (amenazando [[checkmate]])' : ' (threatening [[checkmate]])';
          else if (id === 'backRankThreat') tac = es ? ' (amenazando [[a:backRankMate]])' : ' (threatening [[a:backRankMate]])';
          else tac = ` ([[a:${termOf(id)}]])`;
        }
        const gain = gainText(r.gain, lang, false, false);
        out.push(es ? `El problema: ahora el rival puede jugar ${moveText(r.move, lang)}${tac}${gain}.`
          : `The problem: now they can play ${moveText(r.move, lang)}${tac}${gain}.`);
      }
    } else {
      out.push(`${es ? 'La computadora jugó' : 'The computer played'} ${moveText(entry.move, lang)}.`);
      let said = 0;
      entry.tactics.forEach(t => { const s = tacticText(t, lang, false); if (s) { out.push(s); said++; } });
      entry.principles.forEach(p => { const s = principleText(p, lang, false); if (s) { out.push(s); said++; } });
      if (entry.opening) out.push(es ? `Apertura: estamos en [[the:${entry.opening}]].` : `Opening: this is [[the:${entry.opening}]].`);
      entry.dangers.forEach(d => {
        const g = FEM[d.t] ? 'a' : 'o';
        out.push(es ? `Cuidado: tu ${PIECES.es[d.t]} en ${d.sq} está atacad${g}${d.undefended ? ' y sin defensa' : ''}. Podría convertirse en [[a:hangingPiece]].`
          : `Watch out: your ${PIECES.en[d.t]} on ${d.sq} is under attack${d.undefended ? ' and undefended' : ''}. It could become [[a:hangingPiece]].`);
        said++;
      });
      if (!said && !entry.opening) out.push(es ? 'Una jugada tranquila para mejorar su posición.' : 'A quiet move to improve their position.');
    }
    return out;
  }

  // Tactic ids used only internally map to glossary terms.
  function termOf(id) {
    if (id === 'backRankThreat') return 'backRankMate';
    if (id === 'mateThreat') return 'threat';
    if (id === 'materialGain') return 'materialValue';
    return id;
  }

  // Squares to highlight for "show me" on a tactic.
  function arrowsFor(entry) {
    const a = [];
    if (entry.bestMove) a.push([entry.bestMove.from, entry.bestMove.to]);
    return a;
  }

  return { analyzeUserMove, analyzeComputerMove, paragraphs, openingAt, arrowsFor, winPct, termOf };
})();
