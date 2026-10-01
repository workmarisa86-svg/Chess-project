/*
 * Chess engine core: board representation, rules, move generation,
 * evaluation and search.
 *
 * Everything lives inside one self-contained function so the very same code
 * can run on the page and inside a Web Worker (created from
 * ChessCore.toString()), which keeps the app working from file:// with no
 * build step.
 */
function ChessCore() {
  'use strict';

  const WHITE = 0, BLACK = 8;
  const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
  const F_CAPTURE = 1, F_EP = 2, F_CASTLE = 4, F_DOUBLE = 8, F_PROMO = 16;
  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const N_OFF = [33, 31, 18, 14, -33, -31, -18, -14];
  const B_OFF = [17, 15, -17, -15];
  const R_OFF = [16, -16, 1, -1];
  const K_OFF = [17, 15, -17, -15, 16, -16, 1, -1];
  const MATE = 100000, INF = 1000000, MAXPLY = 64;

  // Squares use the 0x88 layout: sq = rank * 16 + file, rank 0 = rank "1".
  const sqName = s => 'abcdefgh'[s & 7] + ((s >> 4) + 1);
  const sqParse = n => (n.charCodeAt(1) - 49) * 16 + (n.charCodeAt(0) - 97);
  const mkMove = (from, to, flags, promo) => from | (to << 7) | (promo << 14) | (flags << 17);
  const mFrom = m => m & 127;
  const mTo = m => (m >> 7) & 127;
  const mPromo = m => (m >> 14) & 7;
  const mFlags = m => m >> 17;

  // ---- Zobrist hashing (two independent 32-bit keys) ----
  let seed = 0x2545F491;
  const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed >>> 0; };
  const ZP1 = new Uint32Array(16 * 128), ZP2 = new Uint32Array(16 * 128);
  for (let i = 0; i < ZP1.length; i++) { ZP1[i] = rnd(); ZP2[i] = rnd(); }
  const ZC1 = new Uint32Array(16), ZC2 = new Uint32Array(16);
  for (let i = 0; i < 16; i++) { ZC1[i] = rnd(); ZC2[i] = rnd(); }
  const ZE1 = new Uint32Array(8), ZE2 = new Uint32Array(8);
  for (let i = 0; i < 8; i++) { ZE1[i] = rnd(); ZE2[i] = rnd(); }
  const ZS1 = rnd(), ZS2 = rnd();

  // Castling rights kept when a move touches a square (KQkq = 1,2,4,8).
  const CASTLE_MASK = new Uint8Array(128).fill(15);
  CASTLE_MASK[0] = 13; CASTLE_MASK[7] = 14; CASTLE_MASK[4] = 12;
  CASTLE_MASK[112] = 7; CASTLE_MASK[119] = 11; CASTLE_MASK[116] = 3;

  class Chess {
    constructor(fen) {
      this.board = new Int8Array(128);
      this.load(fen || START_FEN);
    }

    load(fen) {
      const b = this.board;
      b.fill(0);
      const parts = fen.trim().split(/\s+/);
      const rows = parts[0].split('/');
      this.kings = [-1, -1];
      for (let r = 0; r < 8; r++) {
        let f = 0;
        const rank = 7 - r;
        for (const ch of rows[r]) {
          if (ch >= '1' && ch <= '8') { f += +ch; continue; }
          const lower = ch.toLowerCase();
          const type = ' pnbrqk'.indexOf(lower);
          const color = ch === lower ? BLACK : WHITE;
          const sq = rank * 16 + f;
          b[sq] = type | color;
          if (type === KING) this.kings[color >> 3] = sq;
          f++;
        }
      }
      this.turn = parts[1] === 'b' ? BLACK : WHITE;
      const c = parts[2] || '-';
      this.castling = (c.includes('K') ? 1 : 0) | (c.includes('Q') ? 2 : 0) |
        (c.includes('k') ? 4 : 0) | (c.includes('q') ? 8 : 0);
      this.ep = parts[3] && parts[3] !== '-' ? sqParse(parts[3]) : -1;
      this.half = parseInt(parts[4] || '0', 10) || 0;
      this.full = parseInt(parts[5] || '1', 10) || 1;
      this.hist = [];
      this.computeHash();
      this.keys = [this.h1];
    }

    fen() {
      let s = '';
      for (let r = 7; r >= 0; r--) {
        let empty = 0;
        for (let f = 0; f < 8; f++) {
          const p = this.board[r * 16 + f];
          if (!p) { empty++; continue; }
          if (empty) { s += empty; empty = 0; }
          const ch = ' pnbrqk'[p & 7];
          s += p & BLACK ? ch : ch.toUpperCase();
        }
        if (empty) s += empty;
        if (r > 0) s += '/';
      }
      let c = '';
      if (this.castling & 1) c += 'K';
      if (this.castling & 2) c += 'Q';
      if (this.castling & 4) c += 'k';
      if (this.castling & 8) c += 'q';
      return `${s} ${this.turn ? 'b' : 'w'} ${c || '-'} ${this.ep >= 0 ? sqName(this.ep) : '-'} ${this.half} ${this.full}`;
    }

    computeHash() {
      let h1 = 0, h2 = 0;
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = this.board[sq];
        if (p) { h1 ^= ZP1[p * 128 + sq]; h2 ^= ZP2[p * 128 + sq]; }
      }
      if (this.turn) { h1 ^= ZS1; h2 ^= ZS2; }
      h1 ^= ZC1[this.castling]; h2 ^= ZC2[this.castling];
      if (this.ep >= 0) { h1 ^= ZE1[this.ep & 7]; h2 ^= ZE2[this.ep & 7]; }
      this.h1 = h1; this.h2 = h2;
    }

    isAttacked(sq, by) {
      const b = this.board;
      if (by === WHITE) {
        let t = sq - 15; if (!(t & 0x88) && b[t] === (WHITE | PAWN)) return true;
        t = sq - 17; if (!(t & 0x88) && b[t] === (WHITE | PAWN)) return true;
      } else {
        let t = sq + 15; if (!(t & 0x88) && b[t] === (BLACK | PAWN)) return true;
        t = sq + 17; if (!(t & 0x88) && b[t] === (BLACK | PAWN)) return true;
      }
      for (let i = 0; i < 8; i++) {
        const t = sq + N_OFF[i];
        if (!(t & 0x88) && b[t] === (by | KNIGHT)) return true;
      }
      for (let i = 0; i < 8; i++) {
        const t = sq + K_OFF[i];
        if (!(t & 0x88) && b[t] === (by | KING)) return true;
      }
      for (let i = 0; i < 4; i++) {
        const o = B_OFF[i];
        for (let t = sq + o; !(t & 0x88); t += o) {
          const p = b[t];
          if (p) { if (p === (by | BISHOP) || p === (by | QUEEN)) return true; break; }
        }
      }
      for (let i = 0; i < 4; i++) {
        const o = R_OFF[i];
        for (let t = sq + o; !(t & 0x88); t += o) {
          const p = b[t];
          if (p) { if (p === (by | ROOK) || p === (by | QUEEN)) return true; break; }
        }
      }
      return false;
    }

    // Squares of all `by` pieces that directly attack `sq`.
    attackers(sq, by) {
      const b = this.board, out = [];
      const pd = by === WHITE ? [-15, -17] : [15, 17];
      for (const o of pd) { const t = sq + o; if (!(t & 0x88) && b[t] === (by | PAWN)) out.push(t); }
      for (const o of N_OFF) { const t = sq + o; if (!(t & 0x88) && b[t] === (by | KNIGHT)) out.push(t); }
      for (const o of K_OFF) { const t = sq + o; if (!(t & 0x88) && b[t] === (by | KING)) out.push(t); }
      for (const o of B_OFF) {
        for (let t = sq + o; !(t & 0x88); t += o) {
          const p = b[t];
          if (p) { if (p === (by | BISHOP) || p === (by | QUEEN)) out.push(t); break; }
        }
      }
      for (const o of R_OFF) {
        for (let t = sq + o; !(t & 0x88); t += o) {
          const p = b[t];
          if (p) { if (p === (by | ROOK) || p === (by | QUEEN)) out.push(t); break; }
        }
      }
      return out;
    }

    // Squares attacked (or defended) by the piece standing on `sq`.
    attacksFrom(sq) {
      const b = this.board, p = b[sq], type = p & 7, out = [];
      if (!p) return out;
      if (type === PAWN) {
        const ds = p & BLACK ? [-15, -17] : [15, 17];
        for (const o of ds) { const t = sq + o; if (!(t & 0x88)) out.push(t); }
      } else if (type === KNIGHT || type === KING) {
        for (const o of type === KNIGHT ? N_OFF : K_OFF) { const t = sq + o; if (!(t & 0x88)) out.push(t); }
      } else {
        const dirs = type === BISHOP ? B_OFF : type === ROOK ? R_OFF : K_OFF;
        for (const o of dirs) {
          for (let t = sq + o; !(t & 0x88); t += o) { out.push(t); if (b[t]) break; }
        }
      }
      return out;
    }

    inCheck(color) {
      const c = color === undefined ? this.turn : color;
      return this.isAttacked(this.kings[c >> 3], c ^ BLACK);
    }

    genPseudo(capsOnly) {
      const b = this.board, us = this.turn, them = us ^ BLACK, list = [];
      const fwd = us === WHITE ? 16 : -16;
      const startRank = us === WHITE ? 1 : 6, lastRank = us === WHITE ? 7 : 0;
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = b[sq];
        if (!p || (p & BLACK) !== us) continue;
        const type = p & 7;
        if (type === PAWN) {
          const to = sq + fwd;
          if (!(to & 0x88) && !b[to]) {
            if ((to >> 4) === lastRank) {
              for (let pr = QUEEN; pr >= KNIGHT; pr--) list.push(mkMove(sq, to, F_PROMO, pr));
            } else if (!capsOnly) {
              list.push(mkMove(sq, to, 0, 0));
              if ((sq >> 4) === startRank && !b[to + fwd]) list.push(mkMove(sq, to + fwd, F_DOUBLE, 0));
            }
          }
          for (let k = 0; k < 2; k++) {
            const t = sq + fwd + (k ? 1 : -1);
            if (t & 0x88) continue;
            const q = b[t];
            if (q && (q & BLACK) === them) {
              if ((t >> 4) === lastRank) {
                for (let pr = QUEEN; pr >= KNIGHT; pr--) list.push(mkMove(sq, t, F_CAPTURE | F_PROMO, pr));
              } else list.push(mkMove(sq, t, F_CAPTURE, 0));
            } else if (t === this.ep) {
              list.push(mkMove(sq, t, F_CAPTURE | F_EP, 0));
            }
          }
        } else if (type === KNIGHT || type === KING) {
          const offs = type === KNIGHT ? N_OFF : K_OFF;
          for (let i = 0; i < 8; i++) {
            const t = sq + offs[i];
            if (t & 0x88) continue;
            const q = b[t];
            if (!q) { if (!capsOnly) list.push(mkMove(sq, t, 0, 0)); }
            else if ((q & BLACK) === them) list.push(mkMove(sq, t, F_CAPTURE, 0));
          }
          if (type === KING && !capsOnly) this.genCastles(sq, list);
        } else {
          const dirs = type === BISHOP ? B_OFF : type === ROOK ? R_OFF : K_OFF;
          for (let i = 0; i < dirs.length; i++) {
            const o = dirs[i];
            for (let t = sq + o; !(t & 0x88); t += o) {
              const q = b[t];
              if (!q) { if (!capsOnly) list.push(mkMove(sq, t, 0, 0)); continue; }
              if ((q & BLACK) === them) list.push(mkMove(sq, t, F_CAPTURE, 0));
              break;
            }
          }
        }
      }
      return list;
    }

    genCastles(sq, list) {
      const b = this.board, us = this.turn, them = us ^ BLACK;
      const base = us === WHITE ? 0 : 112;
      if (sq !== base + 4) return;
      const kRight = us === WHITE ? 1 : 4, qRight = us === WHITE ? 2 : 8;
      if ((this.castling & kRight) && b[base + 7] === (us | ROOK) && !b[base + 5] && !b[base + 6] &&
        !this.isAttacked(base + 4, them) && !this.isAttacked(base + 5, them) && !this.isAttacked(base + 6, them)) {
        list.push(mkMove(base + 4, base + 6, F_CASTLE, 0));
      }
      if ((this.castling & qRight) && b[base] === (us | ROOK) && !b[base + 3] && !b[base + 2] && !b[base + 1] &&
        !this.isAttacked(base + 4, them) && !this.isAttacked(base + 3, them) && !this.isAttacked(base + 2, them)) {
        list.push(mkMove(base + 4, base + 2, F_CASTLE, 0));
      }
    }

    make(m) {
      const b = this.board, from = mFrom(m), to = mTo(m), promo = mPromo(m), flags = mFlags(m);
      const us = this.turn, them = us ^ BLACK, p = b[from];
      let capSq = to, cap = b[to];
      if (flags & F_EP) { capSq = to + (us === WHITE ? -16 : 16); cap = b[capSq]; }
      this.hist.push({ m, cap, castling: this.castling, ep: this.ep, half: this.half, h1: this.h1, h2: this.h2 });
      let h1 = this.h1, h2 = this.h2;
      if (this.ep >= 0) { h1 ^= ZE1[this.ep & 7]; h2 ^= ZE2[this.ep & 7]; }
      if (cap) { b[capSq] = 0; h1 ^= ZP1[cap * 128 + capSq]; h2 ^= ZP2[cap * 128 + capSq]; }
      b[from] = 0; h1 ^= ZP1[p * 128 + from]; h2 ^= ZP2[p * 128 + from];
      const np = promo ? (promo | us) : p;
      b[to] = np; h1 ^= ZP1[np * 128 + to]; h2 ^= ZP2[np * 128 + to];
      if (flags & F_CASTLE) {
        let rf, rt;
        if (to > from) { rf = from + 3; rt = from + 1; } else { rf = from - 4; rt = from - 1; }
        const r = b[rf];
        b[rf] = 0; b[rt] = r;
        h1 ^= ZP1[r * 128 + rf] ^ ZP1[r * 128 + rt];
        h2 ^= ZP2[r * 128 + rf] ^ ZP2[r * 128 + rt];
      }
      if ((p & 7) === KING) this.kings[us >> 3] = to;
      h1 ^= ZC1[this.castling]; h2 ^= ZC2[this.castling];
      this.castling &= CASTLE_MASK[from] & CASTLE_MASK[to];
      h1 ^= ZC1[this.castling]; h2 ^= ZC2[this.castling];
      this.ep = (flags & F_DOUBLE) ? (from + to) >> 1 : -1;
      if (this.ep >= 0) { h1 ^= ZE1[this.ep & 7]; h2 ^= ZE2[this.ep & 7]; }
      this.half = ((p & 7) === PAWN || cap) ? 0 : this.half + 1;
      if (us === BLACK) this.full++;
      this.turn = them;
      h1 ^= ZS1; h2 ^= ZS2;
      this.h1 = h1; this.h2 = h2;
      this.keys.push(h1);
    }

    undo() {
      const st = this.hist.pop();
      if (!st) return null;
      this.keys.pop();
      if (st.isNull) {
        this.turn ^= BLACK;
        this.ep = st.ep; this.h1 = st.h1; this.h2 = st.h2;
        return st;
      }
      const b = this.board, m = st.m, from = mFrom(m), to = mTo(m), promo = mPromo(m), flags = mFlags(m);
      this.turn ^= BLACK;
      const us = this.turn;
      if (us === BLACK) this.full--;
      const np = b[to];
      const p = promo ? (PAWN | us) : np;
      b[from] = p; b[to] = 0;
      if (flags & F_EP) b[to + (us === WHITE ? -16 : 16)] = st.cap;
      else if (st.cap) b[to] = st.cap;
      if (flags & F_CASTLE) {
        let rf, rt;
        if (to > from) { rf = from + 3; rt = from + 1; } else { rf = from - 4; rt = from - 1; }
        b[rf] = b[rt]; b[rt] = 0;
      }
      if ((p & 7) === KING) this.kings[us >> 3] = from;
      this.castling = st.castling; this.ep = st.ep; this.half = st.half;
      this.h1 = st.h1; this.h2 = st.h2;
      return st;
    }

    makeNull() {
      this.hist.push({ m: 0, isNull: true, ep: this.ep, h1: this.h1, h2: this.h2 });
      let h1 = this.h1, h2 = this.h2;
      if (this.ep >= 0) { h1 ^= ZE1[this.ep & 7]; h2 ^= ZE2[this.ep & 7]; }
      this.ep = -1;
      this.turn ^= BLACK;
      h1 ^= ZS1; h2 ^= ZS2;
      this.h1 = h1; this.h2 = h2;
      this.keys.push(h1);
    }

    // Was the last move legal (did it leave the mover's king safe)?
    leftKingSafe() {
      const mover = this.turn ^ BLACK;
      return !this.isAttacked(this.kings[mover >> 3], this.turn);
    }

    moves() {
      const out = [], ps = this.genPseudo(false);
      for (let i = 0; i < ps.length; i++) {
        this.make(ps[i]);
        if (this.leftKingSafe()) out.push(ps[i]);
        this.undo();
      }
      return out;
    }

    hasPieces(color) {
      const b = this.board;
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = b[sq];
        if (p && (p & BLACK) === color) { const t = p & 7; if (t !== PAWN && t !== KING) return true; }
      }
      return false;
    }

    isRepetition() {
      const k = this.keys, n = k.length - 1, stop = Math.max(0, n - this.half);
      for (let i = n - 2; i >= stop; i -= 2) if (k[i] === this.h1) return true;
      return false;
    }

    repetitionCount() {
      const k = this.keys, n = k.length - 1, stop = Math.max(0, n - this.half);
      let c = 1;
      for (let i = n - 2; i >= stop; i -= 2) if (k[i] === this.h1) c++;
      return c;
    }

    insufficientMaterial() {
      const b = this.board, minors = [];
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = b[sq];
        if (!p) continue;
        const t = p & 7;
        if (t === KING) continue;
        if (t === PAWN || t === ROOK || t === QUEEN) return false;
        minors.push({ t, color: p & BLACK, shade: ((sq >> 4) + (sq & 7)) & 1 });
      }
      if (minors.length <= 1) return true;
      // Only bishops, all on the same colour of square.
      return minors.every(x => x.t === BISHOP && x.shade === minors[0].shade);
    }

    status() {
      const legal = this.moves();
      if (!legal.length) {
        return this.inCheck() ? { over: true, reason: 'checkmate', winner: this.turn ^ BLACK } :
          { over: true, reason: 'stalemate' };
      }
      if (this.insufficientMaterial()) return { over: true, reason: 'insufficient' };
      if (this.half >= 100) return { over: true, reason: 'fifty' };
      if (this.repetitionCount() >= 3) return { over: true, reason: 'threefold' };
      return { over: false, check: this.inCheck() };
    }

    // Standard Algebraic Notation (English piece letters).
    san(m, legal) {
      legal = legal || this.moves();
      const b = this.board, from = mFrom(m), to = mTo(m), flags = mFlags(m), promo = mPromo(m);
      const type = b[from] & 7;
      let s;
      if (flags & F_CASTLE) {
        s = (to & 7) === 6 ? 'O-O' : 'O-O-O';
      } else if (type === PAWN) {
        s = flags & F_CAPTURE ? 'abcdefgh'[from & 7] + 'x' + sqName(to) : sqName(to);
        if (promo) s += '=' + ' PNBRQK'[promo];
      } else {
        s = ' PNBRQK'[type];
        const others = legal.filter(x => x !== m && mTo(x) === to && (b[mFrom(x)] & 7) === type);
        if (others.length) {
          const sameFile = others.some(x => (mFrom(x) & 7) === (from & 7));
          const sameRank = others.some(x => (mFrom(x) >> 4) === (from >> 4));
          if (!sameFile) s += 'abcdefgh'[from & 7];
          else if (!sameRank) s += (from >> 4) + 1;
          else s += sqName(from);
        }
        if (flags & F_CAPTURE) s += 'x';
        s += sqName(to);
      }
      this.make(m);
      if (this.inCheck()) s += this.moves().length ? '+' : '#';
      this.undo();
      return s;
    }

    moveFromSan(san) {
      const clean = x => x.replace(/[+#!?]/g, '').replace(/0/g, 'O');
      const target = clean(san), legal = this.moves();
      for (const m of legal) if (clean(this.san(m, legal)) === target) return m;
      return 0;
    }
  }

  // ---- Evaluation: PeSTO piece-square tables, tapered middlegame/endgame ----
  const MG_VAL = [0, 82, 337, 365, 477, 1025, 0];
  const EG_VAL = [0, 94, 281, 297, 512, 936, 0];
  const PHASE_INC = [0, 0, 1, 1, 2, 4, 0];
  const MG_T = [[],
    [0, 0, 0, 0, 0, 0, 0, 0, 98, 134, 61, 95, 68, 126, 34, -11, -6, 7, 26, 31, 65, 56, 25, -20, -14, 13, 6, 21, 23, 12, 17, -23, -27, -2, -5, 12, 17, 6, 10, -25, -26, -4, -4, -10, 3, 3, 33, -12, -35, -1, -20, -23, -15, 24, 38, -22, 0, 0, 0, 0, 0, 0, 0, 0],
    [-167, -89, -34, -49, 61, -97, -15, -107, -73, -41, 72, 36, 23, 62, 7, -17, -47, 60, 37, 65, 84, 129, 73, 44, -9, 17, 19, 53, 37, 69, 18, 22, -13, 4, 16, 13, 28, 19, 21, -8, -23, -9, 12, 10, 19, 17, 25, -16, -29, -53, -12, -3, -1, 18, -14, -19, -105, -21, -58, -33, -17, -28, -19, -23],
    [-29, 4, -82, -37, -25, -42, 7, -8, -26, 16, -18, -13, 30, 59, 18, -47, -16, 37, 43, 40, 35, 50, 37, -2, -4, 5, 19, 50, 37, 37, 7, -2, -6, 13, 13, 26, 34, 12, 10, 4, 0, 15, 15, 15, 14, 27, 18, 10, 4, 15, 16, 0, 7, 21, 33, 1, -33, -3, -14, -21, -13, -12, -39, -21],
    [32, 42, 32, 51, 63, 9, 31, 43, 27, 32, 58, 62, 80, 67, 26, 44, -5, 19, 26, 36, 17, 45, 61, 16, -24, -11, 7, 26, 24, 35, -8, -20, -36, -26, -12, -1, 9, -7, 6, -23, -45, -25, -16, -17, 3, 0, -5, -33, -44, -16, -20, -9, -1, 11, -6, -71, -19, -13, 1, 17, 16, 7, -37, -26],
    [-28, 0, 29, 12, 59, 44, 43, 45, -24, -39, -5, 1, -16, 57, 28, 54, -13, -17, 7, 8, 29, 56, 47, 57, -27, -27, -16, -16, -1, 17, -2, 1, -9, -26, -9, -10, -2, -4, 3, -3, -14, 2, -11, -2, -5, 2, 14, 5, -35, -8, 11, 2, 8, 15, -3, 1, -1, -18, -9, 10, -15, -25, -31, -50],
    [-65, 23, 16, -15, -56, -34, 2, 13, 29, -1, -20, -7, -8, -4, -38, -29, -9, 24, 2, -16, -20, 6, 22, -22, -17, -20, -12, -27, -30, -25, -14, -36, -49, -1, -27, -39, -46, -44, -33, -51, -14, -14, -22, -46, -44, -30, -15, -27, 1, 7, -8, -64, -43, -16, 9, 8, -15, 36, 12, -54, 8, -28, 24, 14]];
  const EG_T = [[],
    [0, 0, 0, 0, 0, 0, 0, 0, 178, 173, 158, 134, 147, 132, 165, 187, 94, 100, 85, 67, 56, 53, 82, 84, 32, 24, 13, 5, -2, 4, 17, 17, 13, 9, -3, -7, -7, -8, 3, -1, 4, 7, -6, 1, 0, -5, -1, -8, 13, 8, 8, 10, 13, 0, 2, -7, 0, 0, 0, 0, 0, 0, 0, 0],
    [-58, -38, -13, -28, -31, -27, -63, -99, -25, -8, -25, -2, -9, -25, -24, -52, -24, -20, 10, 9, -1, -9, -19, -41, -17, 3, 22, 22, 22, 11, 8, -18, -18, -6, 16, 25, 16, 17, 4, -18, -23, -3, -1, 15, 10, -3, -20, -22, -42, -20, -10, -5, -2, -20, -23, -44, -29, -51, -23, -15, -22, -18, -50, -64],
    [-14, -21, -11, -8, -7, -9, -17, -24, -8, -4, 7, -12, -3, -13, -4, -14, 2, -8, 0, -1, -2, 6, 0, 4, -3, 9, 12, 9, 14, 10, 3, 2, -6, 3, 13, 19, 7, 10, -3, -9, -12, -3, 8, 10, 13, 3, -7, -15, -14, -18, -7, -1, 4, -9, -15, -27, -23, -9, -23, -5, -9, -16, -5, -17],
    [13, 10, 18, 15, 12, 12, 8, 5, 11, 13, 13, 11, -3, 3, 8, 3, 7, 7, 7, 5, 4, -3, -5, -3, 4, 3, 13, 1, 2, 1, -1, 2, 3, 5, 8, 4, -5, -6, -8, -11, -4, 0, -5, -1, -7, -12, -8, -16, -6, -6, 0, 2, -9, -9, -11, -3, -9, 2, 3, -1, -5, -13, 4, -20],
    [-9, 22, 22, 27, 27, 19, 10, 20, -17, 20, 32, 41, 58, 25, 30, 0, -20, 6, 9, 49, 47, 35, 19, 9, 3, 22, 24, 45, 57, 40, 57, 36, -18, 28, 19, 47, 31, 34, 39, 23, -16, -27, 15, 6, 9, 17, 10, 5, -22, -23, -30, -16, -16, -23, -36, -32, -33, -28, -22, -43, -5, -32, -20, -41],
    [-74, -35, -18, -18, -11, 15, 4, -17, -12, 17, 14, 17, 17, 38, 23, 11, 10, 17, 23, 15, 20, 45, 44, 13, -8, 22, 24, 27, 26, 33, 26, 3, -18, -4, 21, 24, 27, 23, 9, -11, -19, -3, 11, 21, 23, 16, 7, -9, -27, -11, 4, 13, 14, 4, -5, -17, -53, -34, -21, -11, -28, -14, -24, -43]];

  // Pre-computed per piece code (type|color) and 0x88 square.
  const MG = new Int16Array(16 * 128), EG = new Int16Array(16 * 128);
  for (let t = 1; t <= 6; t++) {
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue;
      const r = sq >> 4, f = sq & 7;
      const wi = (7 - r) * 8 + f, bi = r * 8 + f;
      MG[(t | WHITE) * 128 + sq] = MG_T[t][wi] + MG_VAL[t];
      EG[(t | WHITE) * 128 + sq] = EG_T[t][wi] + EG_VAL[t];
      MG[(t | BLACK) * 128 + sq] = MG_T[t][bi] + MG_VAL[t];
      EG[(t | BLACK) * 128 + sq] = EG_T[t][bi] + EG_VAL[t];
    }
  }
  const PASSED_BONUS = [0, 5, 10, 18, 32, 55, 85, 0];

  // Static evaluation from the side to move's point of view.
  function evaluate(g) {
    const b = g.board;
    let mgW = 0, mgB = 0, egW = 0, egB = 0, phase = 0, bW = 0, bB = 0;
    const pawnsW = new Int8Array(8), pawnsB = new Int8Array(8);
    // Most advanced rank of white pawns / least advanced of black per file.
    const minW = [8, 8, 8, 8, 8, 8, 8, 8], maxB = [-1, -1, -1, -1, -1, -1, -1, -1];
    const maxW = [-1, -1, -1, -1, -1, -1, -1, -1], minB = [8, 8, 8, 8, 8, 8, 8, 8];
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq];
      if (!p) continue;
      const t = p & 7, i = p * 128 + sq;
      if (p & BLACK) {
        mgB += MG[i]; egB += EG[i];
        if (t === BISHOP) bB++;
        if (t === PAWN) { const f = sq & 7, r = sq >> 4; pawnsB[f]++; if (r < minB[f]) minB[f] = r; if (r > maxB[f]) maxB[f] = r; }
      } else {
        mgW += MG[i]; egW += EG[i];
        if (t === BISHOP) bW++;
        if (t === PAWN) { const f = sq & 7, r = sq >> 4; pawnsW[f]++; if (r > maxW[f]) maxW[f] = r; if (r < minW[f]) minW[f] = r; }
      }
      phase += PHASE_INC[t];
    }
    let mg = mgW - mgB, eg = egW - egB;
    if (bW >= 2) { mg += 25; eg += 45; }
    if (bB >= 2) { mg -= 25; eg -= 45; }
    // Passed and doubled pawns.
    for (let f = 0; f < 8; f++) {
      if (pawnsW[f]) {
        const r = maxW[f];
        let passed = true;
        for (let df = -1; df <= 1 && passed; df++) {
          const ff = f + df;
          if (ff < 0 || ff > 7) continue;
          if (pawnsB[ff] && maxB[ff] > r) passed = false;
        }
        if (passed) { mg += PASSED_BONUS[r] >> 1; eg += PASSED_BONUS[r]; }
        if (pawnsW[f] > 1) { mg -= 10; eg -= 20; }
      }
      if (pawnsB[f]) {
        const r = minB[f];
        let passed = true;
        for (let df = -1; df <= 1 && passed; df++) {
          const ff = f + df;
          if (ff < 0 || ff > 7) continue;
          if (pawnsW[ff] && minW[ff] < r) passed = false;
        }
        if (passed) { mg -= PASSED_BONUS[7 - r] >> 1; eg -= PASSED_BONUS[7 - r]; }
        if (pawnsB[f] > 1) { mg += 10; eg += 20; }
      }
    }
    const mgPhase = phase > 24 ? 24 : phase;
    let score = (mg * mgPhase + eg * (24 - mgPhase)) / 24;
    // Mop-up: help convert won endgames by driving the enemy king to the edge.
    if (mgPhase <= 6 && Math.abs(eg) > 300) {
      const strong = eg > 0 ? 0 : 1;
      const wk = g.kings[strong], lk = g.kings[strong ^ 1];
      const lr = lk >> 4, lf = lk & 7;
      const centerDist = Math.max(3 - lr, lr - 4) + Math.max(3 - lf, lf - 4);
      const kingDist = Math.abs((wk >> 4) - lr) + Math.abs((wk & 7) - lf);
      const bonus = centerDist * 12 + (14 - kingDist) * 5;
      score += strong === 0 ? bonus : -bonus;
    }
    return (g.turn === WHITE ? score : -score) | 0;
  }

  // ---- Search ----
  const ORDER_VAL = [0, 100, 320, 330, 500, 900, 2000];
  const TT_EXACT = 0, TT_LOWER = 1, TT_UPPER = 2;

  class Searcher {
    constructor() {
      this.tt = new Map();
      this.historyH = new Int32Array(16 * 128);
      this.killers = [];
      for (let i = 0; i < MAXPLY; i++) this.killers.push([0, 0]);
      this.pvT = [];
      for (let i = 0; i < MAXPLY + 1; i++) this.pvT.push(new Int32Array(MAXPLY + 1));
      this.pvL = new Int32Array(MAXPLY + 1);
    }

    reset(timeMs) {
      this.nodes = 0;
      this.stopped = false;
      this.noStop = false;
      this.deadline = Date.now() + timeMs;
      this.historyH.fill(0);
      for (const k of this.killers) { k[0] = 0; k[1] = 0; }
      if (this.tt.size > 600000) this.tt.clear();
    }

    pvFrom(ply) {
      const out = [];
      for (let i = ply; i < this.pvL[ply]; i++) out.push(this.pvT[ply][i]);
      return out;
    }

    updatePv(ply, m) {
      const row = this.pvT[ply], child = this.pvT[ply + 1];
      row[ply] = m;
      let n = this.pvL[ply + 1];
      if (n < ply + 1) n = ply + 1;
      for (let j = ply + 1; j < n; j++) row[j] = child[j];
      this.pvL[ply] = n;
    }

    scoreMoves(g, moves, ttMove, ply) {
      const b = g.board, sc = new Array(moves.length);
      const k = this.killers[ply] || [0, 0];
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i], fl = mFlags(m);
        let s;
        if (m === ttMove) s = 3000000;
        else if (fl & F_CAPTURE) {
          const victim = fl & F_EP ? PAWN : (b[mTo(m)] & 7);
          s = 1000000 + ORDER_VAL[victim] * 10 - ORDER_VAL[b[mFrom(m)] & 7] / 10 + (mPromo(m) === QUEEN ? 5000 : 0);
        } else if (fl & F_PROMO) s = mPromo(m) === QUEEN ? 950000 : -1000;
        else if (m === k[0]) s = 900000;
        else if (m === k[1]) s = 800000;
        else s = this.historyH[b[mFrom(m)] * 128 + mTo(m)];
        sc[i] = s;
      }
      return sc;
    }

    static pick(moves, sc, i) {
      let best = i;
      for (let j = i + 1; j < moves.length; j++) if (sc[j] > sc[best]) best = j;
      if (best !== i) {
        const tm = moves[i]; moves[i] = moves[best]; moves[best] = tm;
        const ts = sc[i]; sc[i] = sc[best]; sc[best] = ts;
      }
      return moves[i];
    }

    checkTime() {
      if ((++this.nodes & 2047) === 0 && !this.noStop && Date.now() > this.deadline) this.stopped = true;
    }

    qsearch(alpha, beta, ply) {
      const g = this.g;
      this.pvL[ply] = ply;
      this.checkTime();
      if (this.stopped) return 0;
      const stand = evaluate(g);
      if (ply >= MAXPLY - 1) return stand;
      if (stand >= beta) return stand;
      if (stand > alpha) alpha = stand;
      const moves = g.genPseudo(true);
      const sc = this.scoreMoves(g, moves, 0, ply);
      const us = g.turn;
      for (let i = 0; i < moves.length; i++) {
        const m = Searcher.pick(moves, sc, i);
        g.make(m);
        if (g.isAttacked(g.kings[us >> 3], us ^ BLACK)) { g.undo(); continue; }
        const s = -this.qsearch(-beta, -alpha, ply + 1);
        g.undo();
        if (this.stopped) return 0;
        if (s > alpha) {
          alpha = s;
          this.updatePv(ply, m);
          if (s >= beta) return s;
        }
      }
      return alpha;
    }

    negamax(depth, alpha, beta, ply, canNull) {
      const g = this.g;
      this.pvL[ply] = ply;
      if (ply > 0 && (g.half >= 100 || g.isRepetition())) return 0;
      this.checkTime();
      if (this.stopped) return 0;
      if (ply >= MAXPLY - 2) return evaluate(g);
      const inCheck = g.inCheck();
      if (inCheck) depth++;
      if (depth <= 0) return this.qsearch(alpha, beta, ply);
      const pvNode = beta - alpha > 1;

      let ttMove = 0;
      const e = this.tt.get(g.h1);
      if (e && e.h2 === g.h2) {
        ttMove = e.move;
        if (!pvNode && ply > 0 && e.depth >= depth) {
          let s = e.score;
          if (s > MATE - 1000) s -= ply; else if (s < -MATE + 1000) s += ply;
          if (e.flag === TT_EXACT) return s;
          if (e.flag === TT_LOWER && s >= beta) return s;
          if (e.flag === TT_UPPER && s <= alpha) return s;
        }
      }

      if (canNull && !pvNode && !inCheck && depth >= 3 && g.hasPieces(g.turn) && evaluate(g) >= beta) {
        g.makeNull();
        const s = -this.negamax(depth - 3, -beta, -beta + 1, ply + 1, false);
        g.undo();
        if (this.stopped) return 0;
        if (s >= beta) return beta;
      }

      const moves = g.genPseudo(false);
      const sc = this.scoreMoves(g, moves, ttMove, ply);
      const us = g.turn, origAlpha = alpha, k = this.killers[ply];
      let best = -INF, bestMove = 0, legal = 0;
      for (let i = 0; i < moves.length; i++) {
        const m = Searcher.pick(moves, sc, i);
        g.make(m);
        if (g.isAttacked(g.kings[us >> 3], us ^ BLACK)) { g.undo(); continue; }
        legal++;
        const fl = mFlags(m), quiet = !(fl & (F_CAPTURE | F_PROMO));
        let s;
        if (legal === 1) {
          s = -this.negamax(depth - 1, -beta, -alpha, ply + 1, true);
        } else {
          let r = 0;
          if (depth >= 3 && legal > 3 && quiet && !inCheck && m !== k[0] && m !== k[1] && !g.inCheck()) {
            r = legal > 10 ? 2 : 1;
          }
          s = -this.negamax(depth - 1 - r, -alpha - 1, -alpha, ply + 1, true);
          if (s > alpha && r > 0) s = -this.negamax(depth - 1, -alpha - 1, -alpha, ply + 1, true);
          if (s > alpha && s < beta) s = -this.negamax(depth - 1, -beta, -alpha, ply + 1, true);
        }
        g.undo();
        if (this.stopped) return 0;
        if (s > best) {
          best = s; bestMove = m;
          if (s > alpha) {
            alpha = s;
            this.updatePv(ply, m);
            if (s >= beta) {
              if (quiet) {
                if (k[0] !== m) { k[1] = k[0]; k[0] = m; }
                this.historyH[g.board[mFrom(m)] * 128 + mTo(m)] += depth * depth;
              }
              break;
            }
          }
        }
      }
      if (!legal) return inCheck ? -MATE + ply : 0;

      let ts = best;
      if (ts > MATE - 1000) ts += ply; else if (ts < -MATE + 1000) ts -= ply;
      this.tt.set(g.h1, {
        h2: g.h2, depth, score: ts, move: bestMove,
        flag: best <= origAlpha ? TT_UPPER : best >= beta ? TT_LOWER : TT_EXACT
      });
      return best;
    }

    // Iterative deepening; returns the best move with its score and line.
    think(g, opts) {
      this.g = g;
      this.reset(opts.timeMs);
      const legal = g.moves();
      if (!legal.length) return null;
      let result = { move: legal[0], score: 0, pv: [legal[0]], depth: 0 };
      const start = Date.now();
      for (let d = 1; d <= opts.maxDepth; d++) {
        this.noStop = d === 1;
        const s = this.negamax(d, -INF, INF, 0, false);
        if (this.stopped) break;
        const pv = this.pvFrom(0);
        if (pv.length) result = { move: pv[0], score: s, pv, depth: d };
        if (Math.abs(s) > MATE - 1000 && d >= 4) break;
        if (Date.now() - start > opts.timeMs * 0.45) break;
      }
      return result;
    }

    // Exact score (and line) for every legal move; used by the coach.
    analyzeAll(g, opts) {
      this.g = g;
      this.reset(opts.timeMs);
      let moves = g.moves();
      let results = null;
      const start = Date.now();
      for (let d = 1; d <= opts.maxDepth; d++) {
        this.noStop = d === 1;
        const cur = [];
        for (const m of moves) {
          g.make(m);
          const s = -this.negamax(d - 1, -INF, INF, 1, false);
          const pv = [m].concat(this.pvFrom(1));
          g.undo();
          if (this.stopped) break;
          cur.push({ move: m, score: s, pv });
        }
        if (this.stopped) break;
        cur.sort((a, b) => b.score - a.score);
        results = cur;
        results.depth = d;
        moves = cur.map(x => x.move);
        if (Date.now() - start > opts.timeMs * 0.4) break;
      }
      return results || [];
    }

    chooseMove(g, level) {
      const legal = g.moves();
      if (!legal.length) return 0;
      const rand = arr => arr[Math.floor(Math.random() * arr.length)];
      if (level === 'beginner') {
        if (Math.random() < 0.2) {
          const caps = legal.filter(m => mFlags(m) & F_CAPTURE);
          if (caps.length) return rand(caps);
        }
        return rand(legal);
      }
      if (level === 'easy') {
        if (Math.random() < 0.3) return rand(legal);
        const res = this.analyzeAll(g, { maxDepth: 1, timeMs: 400 });
        let best = res[0].move, bestS = -INF;
        for (const r of res) {
          const s = r.score + (Math.random() * 2 - 1) * 90;
          if (s > bestS) { bestS = s; best = r.move; }
        }
        return best;
      }
      if (level === 'medium') {
        if (Math.random() < 0.12) {
          const res = this.analyzeAll(g, { maxDepth: 2, timeMs: 500 });
          if (res.length > 1 && res[0].score - res[1].score < 80) return res[1].move;
        }
        return this.think(g, { maxDepth: 3, timeMs: 900 }).move;
      }
      if (level === 'hard') return this.think(g, { maxDepth: 8, timeMs: 1800 }).move;
      return this.think(g, { maxDepth: 40, timeMs: 5000 }).move;
    }
  }

  let shared = null;
  // Request handler shared by the Web Worker and the main-thread fallback.
  function handle(msg) {
    if (msg.type === 'ping') return { pong: true };
    shared = shared || new Searcher();
    const g = new Chess(msg.fen);
    for (const m of msg.moves) g.make(m);
    if (msg.type === 'move') return { move: shared.chooseMove(g, msg.level) };
    if (msg.type === 'analyze') {
      return { results: shared.analyzeAll(g, { maxDepth: msg.depth, timeMs: msg.time }) };
    }
    return {};
  }

  return {
    WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
    F_CAPTURE, F_EP, F_CASTLE, F_DOUBLE, F_PROMO, MATE, START_FEN,
    N_OFF, B_OFF, R_OFF, K_OFF,
    sqName, sqParse, mkMove, mFrom, mTo, mPromo, mFlags,
    Chess, Searcher, evaluate, handle
  };
}

if (typeof module !== 'undefined') module.exports = ChessCore;
