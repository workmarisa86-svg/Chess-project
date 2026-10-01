/* Main application: board UI, game flow, computer opponent and coach panel. */
(() => {
  'use strict';
  const { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, START_FEN,
    sqName, sqParse, mFrom, mTo, mPromo, mFlags } = Core;

  const PIECE_CODE = ['', 'P', 'N', 'B', 'R', 'Q', 'K'];
  const VS = '︎'; // force text (not emoji) presentation
  const VAL = [0, 1, 3, 3, 5, 9, 0];
  const PIECE_NAMES = {
    en: ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'],
    es: ['', 'peón', 'caballo', 'alfil', 'torre', 'dama', 'rey']
  };
  const LEVELS = ['beginner', 'easy', 'medium', 'hard', 'impossible'];
  const LEVEL_KEY = { beginner: 'lvlBeginner', easy: 'lvlEasy', medium: 'lvlMedium', hard: 'lvlHard', impossible: 'lvlImpossible' };
  const $ = id => document.getElementById(id);

  // ---------------------------------------------------------------- storage
  const store = {
    get(k, d) { try { const v = localStorage.getItem('chesscoach.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('chesscoach.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  // ---------------------------------------------------------------- state
  const state = {
    lang: store.get('lang', (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en'),
    mode: store.get('mode', 'learn'),
    level: store.get('level', 'medium'),
    colorChoice: store.get('color', 'w'),
    humanColor: WHITE,
    game: new Core.Chess(),
    moves: [], sans: [],
    selected: -1, targets: [],
    lastMove: null,
    flipped: false,
    busy: false,
    token: 0,
    over: null,
    coach: [], entrySeq: 0,
    hint: null,
    openTerms: new Map(),
    openDemos: new Set()
  };
  if (!LEVELS.includes(state.level)) state.level = 'medium';
  if (!['pvp', 'cpu', 'learn'].includes(state.mode)) state.mode = 'learn';

  const t = key => (UI_STRINGS[state.lang] && UI_STRINGS[state.lang][key]) || UI_STRINGS.en[key] || key;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // ---------------------------------------------------------------- engine
  // Runs the search in a Web Worker so the page stays responsive; falls back
  // to the main thread if workers are unavailable (e.g. some file:// setups).
  const Engine = {
    worker: null, fallback: false, seq: 0, pending: new Map(),
    init() {
      try {
        const src = `const Core = (${ChessCore.toString()})();\n` +
          'self.onmessage = e => { let r; try { r = Core.handle(e.data); } catch (err) { r = { error: String(err) }; } r.id = e.data.id; self.postMessage(r); };';
        const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        this.worker = new Worker(url);
        this.worker.onmessage = e => {
          const p = this.pending.get(e.data.id);
          if (p) { this.pending.delete(e.data.id); p.resolve(e.data); }
        };
        this.worker.onerror = () => this.switchToFallback();
        const ping = this.request({ type: 'ping' });
        const timer = setTimeout(() => this.switchToFallback(), 2500);
        ping.then(() => clearTimeout(timer));
      } catch (e) {
        this.fallback = true;
      }
    },
    switchToFallback() {
      if (this.fallback) return;
      this.fallback = true;
      try { this.worker && this.worker.terminate(); } catch (e) { /* ignore */ }
      this.worker = null;
      const waiting = Array.from(this.pending.values());
      this.pending.clear();
      waiting.forEach(p => this.runLocal(p.msg, p.resolve));
    },
    runLocal(msg, resolve) {
      setTimeout(() => {
        let r;
        try { r = Core.handle(msg); } catch (err) { r = { error: String(err) }; }
        resolve(r);
      }, 30);
    },
    request(msg) {
      return new Promise(resolve => {
        if (this.fallback || !this.worker) { this.runLocal(msg, resolve); return; }
        const id = ++this.seq;
        msg.id = id;
        this.pending.set(id, { msg, resolve });
        this.worker.postMessage(msg);
      });
    }
  };

  // ---------------------------------------------------------------- helpers
  function positionAt(n) {
    const g = new Core.Chess(START_FEN);
    for (let i = 0; i < n; i++) g.make(state.moves[i]);
    return g;
  }
  const isComputerGame = () => state.mode === 'cpu' || state.mode === 'learn';
  const isHumanTurn = () => !isComputerGame() || state.game.turn === state.humanColor;
  const canInteract = () => !state.over && !state.busy && isHumanTurn();
  const colorName = c => c === WHITE ? t('white') : t('black');

  // ---------------------------------------------------------------- board
  const boardEl = $('board'), arrowsEl = $('arrows'), wrapEl = $('boardWrap');
  const sqEls = new Map();

  function buildBoard() {
    for (let r = 7; r >= 0; r--) {
      for (let f = 0; f < 8; f++) {
        const sq = r * 16 + f;
        const el = document.createElement('div');
        el.className = 'sq ' + (((r + f) & 1) ? 'light' : 'dark');
        el.dataset.sq = sq;
        boardEl.appendChild(el);
        sqEls.set(sq, el);
      }
    }
    const ro = new ResizeObserver(() => {
      const w = boardEl.clientWidth;
      if (w) document.documentElement.style.setProperty('--sq', (w / 8) + 'px');
    });
    ro.observe(boardEl);
  }

  function pieceHTML(p) {
    if (!p) return '';
    return `<span class="piece ${p & BLACK ? 'b' : 'w'}${PIECE_CODE[p & 7]}"></span>`;
  }

  function renderBoard() {
    const g = state.game, flip = state.flipped;
    const checkSq = !state.over || state.over.reason === 'checkmate' ?
      (g.inCheck() ? g.kings[g.turn >> 3] : -1) : -1;
    const hint = state.hint;
    const movable = canInteract();
    // The opponent's last move is shown in gold: every move in Two Players
    // (the side to move always faces the player who just moved), and the
    // computer's moves in the computer modes. Your own last move stays subtle.
    let oppLast = false;
    if (state.lastMove) {
      const mover = g.board[state.lastMove.to] & BLACK;
      oppLast = !isComputerGame() || mover !== state.humanColor;
    }
    for (const [sq, el] of sqEls) {
      const r = sq >> 4, f = sq & 7;
      el.style.gridRow = flip ? r + 1 : 8 - r;
      el.style.gridColumn = flip ? 8 - f : f + 1;
      const p = g.board[sq];
      const cls = el.classList;
      const onLast = !!state.lastMove && (state.lastMove.from === sq || state.lastMove.to === sq);
      cls.toggle('last-opp', onLast && oppLast);
      cls.toggle('last', onLast && !oppLast);
      cls.toggle('sel', state.selected === sq);
      cls.toggle('target', state.targets.includes(sq));
      cls.toggle('capture', state.targets.includes(sq) && (!!p || isEpTarget(sq)));
      cls.toggle('check', sq === checkSq);
      cls.toggle('hint', !!hint && (sqParse(hint.from) === sq || sqParse(hint.to) === sq));
      cls.toggle('movable', movable && !!p && (p & BLACK) === g.turn);
      cls.remove('drag-src', 'drop-over');
      let html = pieceHTML(p);
      const leftCol = flip ? f === 7 : f === 0;
      const bottomRow = flip ? r === 7 : r === 0;
      if (leftCol) html += `<span class="coord rank">${r + 1}</span>`;
      if (bottomRow) html += `<span class="coord file">${'abcdefgh'[f]}</span>`;
      if (el._html !== html) { el.innerHTML = html; el._html = html; }
    }
    renderArrows();
  }

  function isEpTarget(sq) {
    return state.selected >= 0 && (state.game.board[state.selected] & 7) === PAWN && sq === state.game.ep;
  }

  function arrowSVG(list, flip, size) {
    const s = size / 8;
    const c = name => {
      const sq = sqParse(name), r = sq >> 4, f = sq & 7;
      return [(flip ? 7 - f : f) * s + s / 2, (flip ? r : 7 - r) * s + s / 2];
    };
    let out = '<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
    for (const a of list) {
      const [x1, y1] = c(a[0]), [x2, y2] = c(a[1]);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const ex = x2 - dx / len * s * 0.28, ey = y2 - dy / len * s * 0.28;
      const sx = x1 + dx / len * s * 0.18, sy = y1 + dy / len * s * 0.18;
      const color = a[2] || 'rgba(32,132,222,.85)';
      out += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="${s * 0.16}" stroke-linecap="round" marker-end="url(#ah)"/>`;
    }
    return out;
  }

  function renderArrows() {
    const list = state.hint ? [[state.hint.from, state.hint.to]] : [];
    arrowsEl.innerHTML = arrowSVG(list, state.flipped, 800);
  }

  // ---------------------------------------------------------------- input
  let drag = null;

  function squareFromPoint(x, y) {
    const rect = boardEl.getBoundingClientRect();
    const col = Math.floor((x - rect.left) / (rect.width / 8));
    const row = Math.floor((y - rect.top) / (rect.height / 8));
    if (col < 0 || col > 7 || row < 0 || row > 7) return -1;
    const f = state.flipped ? 7 - col : col;
    const r = state.flipped ? row : 7 - row;
    return r * 16 + f;
  }

  function select(sq) {
    state.selected = sq;
    state.targets = state.game.moves().filter(m => mFrom(m) === sq).map(mTo);
    renderBoard();
  }
  function deselect() {
    state.selected = -1; state.targets = [];
    renderBoard();
  }

  boardEl.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (sq < 0 || !canInteract()) return;
    e.preventDefault();
    if (state.selected >= 0 && state.targets.includes(sq)) { tryMove(state.selected, sq); return; }
    const p = state.game.board[sq];
    if (p && (p & BLACK) === state.game.turn) {
      const wasSelected = state.selected === sq;
      if (!wasSelected) select(sq);
      drag = { sq, wasSelected, x: e.clientX, y: e.clientY, started: false, ghost: null, over: -1 };
      try { boardEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    } else if (state.selected >= 0) {
      deselect();
    }
  });

  boardEl.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.started) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
      drag.started = true;
      const ghost = document.createElement('div');
      ghost.className = 'ghost-piece';
      ghost.innerHTML = pieceHTML(state.game.board[drag.sq]);
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      sqEls.get(drag.sq).classList.add('drag-src');
    }
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    const over = squareFromPoint(e.clientX, e.clientY);
    if (over !== drag.over) {
      if (drag.over >= 0) sqEls.get(drag.over).classList.remove('drop-over');
      if (over >= 0 && state.targets.includes(over)) sqEls.get(over).classList.add('drop-over');
      drag.over = over;
    }
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.ghost) d.ghost.remove();
    if (d.started) {
      const target = cancelled ? -1 : squareFromPoint(e.clientX, e.clientY);
      if (target >= 0 && target !== d.sq && state.targets.includes(target)) tryMove(d.sq, target);
      else renderBoard();
    } else if (d.wasSelected && !cancelled) {
      deselect();
    }
  }
  boardEl.addEventListener('pointerup', e => endDrag(e, false));
  boardEl.addEventListener('pointercancel', e => endDrag(e, true));
  boardEl.addEventListener('contextmenu', e => e.preventDefault());

  function tryMove(from, to) {
    const cands = state.game.moves().filter(m => mFrom(m) === from && mTo(m) === to);
    if (!cands.length) { deselect(); return; }
    if (cands.length > 1) { askPromotion(cands); return; }
    humanMove(cands[0]);
  }

  function askPromotion(cands) {
    const color = state.game.turn;
    const box = $('promoChoices');
    box.innerHTML = '';
    for (const pt of [QUEEN, ROOK, BISHOP, KNIGHT]) {
      const m = cands.find(x => mPromo(x) === pt);
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = pieceHTML(pt | color);
      b.setAttribute('aria-label', cap(PIECE_NAMES[state.lang][pt]));
      b.addEventListener('click', () => { closeModal('promoModal'); humanMove(m); });
      box.appendChild(b);
    }
    openModal('promoModal');
  }

  // ---------------------------------------------------------------- game flow
  function applyMove(m) {
    const g = state.game;
    const san = g.san(m, g.moves());
    g.make(m);
    state.moves.push(m);
    state.sans.push(san);
    state.lastMove = { from: mFrom(m), to: mTo(m) };
    state.selected = -1; state.targets = [];
    state.hint = null;
    const st = g.status();
    state.over = st.over ? st : null;
    if (state.over && !state.recorded) {
      state.recorded = true;
      recordGame(state.over);
      nextFact();
      $('endFact').hidden = false;
    }
  }

  function humanMove(m) {
    const ply = state.moves.length;
    applyMove(m);
    if (state.mode === 'learn') {
      const entry = addEntry({ kind: 'pending', ply });
      const token = state.token;
      state.busy = true;
      renderAll();
      Engine.request({ type: 'analyze', fen: START_FEN, moves: state.moves.slice(0, ply), depth: 5, time: 1300 })
        .then(res => {
          if (token !== state.token) return;
          try {
            const g = positionAt(ply);
            entry.kind = 'user';
            entry.data = Coach.analyzeUserMove(g, m, res.results || [], ply, state.sans.slice(0, ply + 1));
          } catch (err) {
            console.error(err);
            removeEntry(entry);
          }
          state.busy = false;
          if (!state.over) computerTurn();
          else renderAll();
        });
      return;
    }
    renderAll();
    if (!state.over && isComputerGame()) computerTurn();
  }

  function bookMove() {
    if (!['medium', 'hard', 'impossible'].includes(state.level)) return 0;
    const cur = state.sans.map(s => s.replace(/[+#]/g, ''));
    const options = BOOK_LINES.filter(l => l.length > cur.length && cur.every((s, i) => s === l[i])).map(l => l[cur.length]);
    if (!options.length) return 0;
    return state.game.moveFromSan(options[Math.floor(Math.random() * options.length)]);
  }

  function computerTurn() {
    state.busy = true;
    renderAll();
    const token = state.token;
    const started = Date.now();
    const finish = m => {
      if (token !== state.token) return;
      const wait = Math.max(0, 450 - (Date.now() - started));
      setTimeout(() => {
        if (token !== state.token) return;
        state.busy = false;
        if (!m) { renderAll(); return; }
        const ply = state.moves.length;
        let entry = null;
        if (state.mode === 'learn') {
          try {
            const san = state.game.san(m, state.game.moves());
            entry = { kind: 'cpu', ply, data: Coach.analyzeComputerMove(state.game, m, ply, state.sans.concat(san)) };
          } catch (err) { console.error(err); }
        }
        applyMove(m);
        if (entry) addEntry(entry);
        renderAll();
      }, wait);
    };
    const bm = bookMove();
    if (bm) { finish(bm); return; }
    Engine.request({ type: 'move', fen: START_FEN, moves: state.moves.slice(), level: state.level })
      .then(r => finish(r.move || 0));
  }

  function undoPlies(n) {
    for (let i = 0; i < n && state.moves.length; i++) {
      state.game.undo();
      state.moves.pop();
      state.sans.pop();
    }
    const lm = state.moves[state.moves.length - 1];
    state.lastMove = lm ? { from: mFrom(lm), to: mTo(lm) } : null;
    state.over = null;
    state.hint = null;
    state.selected = -1; state.targets = [];
    state.coach = state.coach.filter(e => e.kind === 'info' || e.ply < state.moves.length);
    $('endFact').hidden = true;
  }

  function undo() {
    if (!state.moves.length) return;
    state.token++;
    const wasBusy = state.busy;
    state.busy = false;
    if (!isComputerGame()) { undoPlies(1); renderAll(); return; }
    // Go back to the position before the human's most recent move.
    let n = 0;
    const turnAt = k => (k % 2 === 0 ? WHITE : BLACK);
    let k = state.moves.length;
    if (wasBusy && turnAt(k) !== state.humanColor) { n = 1; }
    else {
      while (k > 0) { k--; n++; if (turnAt(k) === state.humanColor) break; }
      if (turnAt(k) !== state.humanColor) n = 0;
    }
    if (n) undoPlies(n);
    renderAll();
  }

  function takeBackTo(ply) {
    state.token++;
    state.busy = false;
    undoPlies(state.moves.length - ply);
    renderAll();
  }

  function newGame() {
    state.token++;
    state.game = new Core.Chess(START_FEN);
    state.moves = []; state.sans = [];
    state.selected = -1; state.targets = [];
    state.lastMove = null; state.over = null; state.busy = false; state.hint = null;
    state.coach = []; state.openTerms.clear(); state.openDemos.clear();
    state.recorded = false;
    $('endFact').hidden = true;
    state.humanColor = state.colorChoice === 'b' ? BLACK : state.colorChoice === 'r' ? (Math.random() < 0.5 ? WHITE : BLACK) : WHITE;
    if (!isComputerGame()) state.humanColor = WHITE;
    state.flipped = state.humanColor === BLACK;
    if (state.mode === 'learn') addEntry({ kind: 'info', ply: -1, key: state.humanColor === BLACK ? 'coachWelcomeBlack' : 'coachWelcome' });
    renderAll();
    if (isComputerGame() && state.game.turn !== state.humanColor) computerTurn();
  }

  // ---------------------------------------------------------------- coach panel
  function addEntry(e) {
    e.id = ++state.entrySeq;
    state.coach.push(e);
    return e;
  }
  function removeEntry(e) { state.coach = state.coach.filter(x => x !== e); }

  function termHTML(id, text) {
    return `<span class="term"><span class="term-name">${esc(text)}</span><button type="button" class="term-btn" data-term="${id}" aria-expanded="false" aria-label="${esc(text)}: ▼">▼</button></span>`;
  }

  // Replace [[id]], [[a:id]], [[A:id]], [[C:id]], [[the:id]] with term dropdowns.
  function renderTokens(str) {
    return str.replace(/\[\[(?:(a|A|C|the):)?([A-Za-z]+)\]\]/g, (_, mode, id) => {
      const term = TERMS[id];
      if (!term) return id;
      const L = term[state.lang];
      let name = L.n, prefix = '';
      if ((mode === 'a' || mode === 'A') && L.a) prefix = L.a + ' ';
      if (mode === 'the' && L.the) prefix = L.the + ' ';
      if (mode === 'C') name = cap(name);
      if (mode === 'A') { if (prefix) prefix = cap(prefix); else name = cap(name); }
      return prefix + termHTML(id, name);
    });
  }

  function explanationHTML(id, key) {
    const term = TERMS[id];
    if (!term) return '';
    const L = term[state.lang];
    const catKey = { tactic: 'catTactic', rule: 'catRule', principle: 'catPrinciple', opening: 'catOpening', rating: 'catRating' }[term.cat];
    const demoKey = key + '|' + id;
    const demoOpen = state.openDemos.has(demoKey);
    return `<div class="explain" data-term="${id}">
      <div class="explain-head"><span class="explain-title">${esc(cap(L.n))}</span><span class="chip ${term.cat}">${esc(t(catKey))}</span></div>
      <p>${esc(L.d)}</p>
      <p><b>${esc(t('why'))}</b> ${esc(L.w)}</p>
      <p><b>${esc(t('example'))}</b> ${esc(L.x)}</p>
      ${term.demo ? `<button type="button" class="btn small demo-btn" data-demo="${esc(demoKey)}" aria-expanded="${demoOpen}">♟${VS} ${esc(t(demoOpen ? 'hideExample' : 'showExample'))}</button>
      <div class="mini-slot">${demoOpen ? miniBoardHTML(term.demo) : ''}</div>` : ''}
    </div>`;
  }

  function slotHTML(key) {
    const open = state.openTerms.get(key) || [];
    return open.map(id => explanationHTML(id, key)).join('');
  }

  function miniBoardHTML(demo) {
    let g;
    if (demo.fen) g = new Core.Chess(demo.fen);
    else {
      g = new Core.Chess(START_FEN);
      for (const s of (demo.moves || '').split(' ').filter(Boolean)) { const m = g.moveFromSan(s); if (m) g.make(m); }
    }
    const marks = new Set((demo.marks || []).map(sqParse));
    let cells = '';
    for (let r = 7; r >= 0; r--) {
      for (let f = 0; f < 8; f++) {
        const sq = r * 16 + f;
        cells += `<div class="sq ${((r + f) & 1) ? 'light' : 'dark'}${marks.has(sq) ? ' mark' : ''}">${pieceHTML(g.board[sq])}` +
          (f === 0 ? `<span class="coord rank">${r + 1}</span>` : '') + (r === 0 ? `<span class="coord file">${'abcdefgh'[f]}</span>` : '') + '</div>';
      }
    }
    const arrows = (demo.arrows || []).map(a => [a[0], a[1], 'rgba(214,72,30,.85)']);
    return `<div class="mini-board"><div class="grid">${cells}</div><svg class="arrows" viewBox="0 0 800 800">${arrowSVG(arrows, false, 800)}</svg></div>`;
  }

  function paraHTML(key, html) {
    return `<div class="cpara" data-key="${key}"><p>${html}</p><div class="term-slot">${slotHTML(key)}</div></div>`;
  }

  function moveLabel(ply) {
    const n = Math.floor(ply / 2) + 1;
    return ply % 2 === 0 ? `${n}.` : `${n}...`;
  }

  function entryHTML(e, isLatest) {
    if (e.kind === 'info') {
      return `<div class="centry info"><div class="cav">🎓</div><div class="cbody"><p>${esc(t(e.key))}</p></div></div>`;
    }
    if (e.kind === 'pending') {
      return `<div class="centry user"><div class="cav">🧑</div><div class="cbody"><div class="pending">${esc(t('analyzing'))}</div></div></div>`;
    }
    const paras = Coach.paragraphs(e.data, state.lang);
    const who = e.kind === 'user' ? t('you') : t('computer');
    let body = paras.map((p, i) => paraHTML(`${e.id}:${i}`, renderTokens(p))).join('');
    if (e.kind === 'user') {
      const showing = state.hint && state.hint.entry === e.id;
      body += '<div class="cactions">';
      if (e.data.bestMove) {
        body += `<button type="button" class="btn small${showing ? ' active' : ''}" data-act="show" data-entry="${e.id}">👁 ${esc(t(showing ? 'hideHint' : 'showMe'))}</button>`;
      }
      body += `<button type="button" class="btn small" data-act="takeback" data-entry="${e.id}">↶ ${esc(t('takeBack'))}</button></div>`;
    }
    return `<div class="centry ${e.kind}${isLatest ? ' latest' : ''}">
      <div class="cav">${e.kind === 'user' ? '🧑' : '🤖'}</div>
      <div class="cbody"><div class="chead"><span class="who">${esc(who)}</span><span>${moveLabel(e.ply)} ${esc(localizeSan(state.sans[e.ply] || '', state.lang))}</span></div>${body}</div>
    </div>`;
  }

  function renderCoach() {
    const card = $('coachCard');
    card.hidden = state.mode !== 'learn';
    if (card.hidden) return;
    const list = state.coach.slice().reverse();
    const latestId = list.length ? list[0].id : -1;
    $('coachLog').innerHTML = list.map(e => entryHTML(e, e.id === latestId && e.kind !== 'info')).join('');
    syncTermButtons($('coachLog'));
  }

  function syncTermButtons(root) {
    root.querySelectorAll('[data-key]').forEach(p => {
      const open = state.openTerms.get(p.dataset.key) || [];
      p.querySelectorAll(':scope > p .term-btn, :scope > .gl-head .term-btn').forEach(b => {
        const on = open.includes(b.dataset.term);
        b.classList.toggle('open', on);
        b.setAttribute('aria-expanded', on);
      });
    });
  }

  // Term dropdown + demo toggles (coach panel and glossary).
  document.addEventListener('click', e => {
    const tb = e.target.closest('.term-btn, .gl-head');
    if (tb) {
      const btn = tb.classList.contains('term-btn') ? tb : tb.querySelector('.term-btn');
      const para = btn.closest('[data-key]');
      if (!para) return;
      e.preventDefault();
      const key = para.dataset.key, id = btn.dataset.term;
      const open = (state.openTerms.get(key) || []).slice();
      const i = open.indexOf(id);
      if (i >= 0) open.splice(i, 1); else open.push(id);
      state.openTerms.set(key, open);
      para.querySelector('.term-slot').innerHTML = slotHTML(key);
      syncTermButtons(para.parentElement || para);
      return;
    }
    const db = e.target.closest('.demo-btn');
    if (db) {
      const k = db.dataset.demo;
      if (state.openDemos.has(k)) state.openDemos.delete(k); else state.openDemos.add(k);
      const para = db.closest('[data-key]');
      para.querySelector('.term-slot').innerHTML = slotHTML(para.dataset.key);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      const entry = state.coach.find(x => x.id === +act.dataset.entry);
      if (!entry) return;
      if (act.dataset.act === 'show') {
        state.hint = state.hint && state.hint.entry === entry.id ? null :
          { from: entry.data.bestMove.from, to: entry.data.bestMove.to, entry: entry.id };
        renderBoard();
        renderCoach();
      } else if (act.dataset.act === 'takeback') {
        takeBackTo(entry.ply);
      }
    }
  });

  // ---------------------------------------------------------------- side panels
  function renderStatus() {
    const g = state.game, st = $('status');
    let text;
    st.classList.remove('thinking');
    if (state.over) {
      const o = state.over;
      if (o.reason === 'checkmate') {
        if (isComputerGame()) text = o.winner === state.humanColor ? t('youWin') : t('youLose');
        else text = t('checkmateWin').replace('{side}', o.winner === WHITE ? t('whiteSide') : t('blackSide'));
      } else text = t(o.reason);
    } else if (state.busy && state.mode === 'learn' && isHumanTurn() === false && state.coach.some(e => e.kind === 'pending')) {
      text = t('analyzing'); st.classList.add('thinking');
    } else if (state.busy) {
      text = t('thinking'); st.classList.add('thinking');
    } else {
      text = isComputerGame() ? t('yourTurn') : (g.turn === WHITE ? t('whiteToMove') : t('blackToMove'));
      if (g.inCheck()) text += ' — ' + t('check');
    }
    st.textContent = text;
    const dot = $('turnDot');
    dot.className = 'turn-dot ' + (g.turn === WHITE ? 'w' : 'b');
    let info = t(state.mode === 'pvp' ? 'modePvp' : state.mode === 'cpu' ? 'modeCpu' : 'modeLearn');
    if (isComputerGame()) info += ` · ${t(LEVEL_KEY[state.level])} · ${t('playAs')}: ${colorName(state.humanColor)}`;
    $('modeInfo').textContent = info;
  }

  function renderMoves() {
    const el = $('moveList');
    if (!state.sans.length) { el.innerHTML = `<p class="empty">${esc(t('noMoves'))}</p>`; return; }
    let html = '';
    for (let i = 0; i < state.sans.length; i += 2) {
      const w = state.sans[i], b = state.sans[i + 1];
      const cur = state.sans.length - 1;
      html += `<div class="mrow"><span class="num">${i / 2 + 1}.</span>` +
        `<span class="mv${cur === i ? ' cur' : ''}">${esc(localizeSan(w, state.lang))}</span>` +
        `<span class="mv${cur === i + 1 ? ' cur' : ''}">${b ? esc(localizeSan(b, state.lang)) : ''}</span></div>`;
    }
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  function renderBars() {
    const g = state.game;
    // Pieces captured BY each colour, from the move history.
    const taken = { [WHITE]: [], [BLACK]: [] };
    for (const h of g.hist) if (h.cap) taken[(h.cap & BLACK) ^ BLACK].push(h.cap);
    let mat = { [WHITE]: 0, [BLACK]: 0 };
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = g.board[sq];
      if (p) mat[p & BLACK] += VAL[p & 7];
    }
    const bar = color => {
      let name;
      if (isComputerGame()) {
        name = color === state.humanColor ? t('you') : `${t('computer')} · ${t(LEVEL_KEY[state.level])}`;
      } else name = colorName(color);
      const caps = taken[color].slice().sort((a, b) => VAL[b & 7] - VAL[a & 7])
        .map(p => `<span class="piece cap ${p & BLACK ? 'b' : 'w'}${PIECE_CODE[p & 7]}"></span>`).join('');
      const adv = mat[color] - mat[color ^ BLACK];
      const active = !state.over && g.turn === color;
      return { html: `<span class="player-name"><span class="swatch ${color === WHITE ? 'w' : 'b'}"></span>${esc(name)}</span>` +
        `<span class="captured" aria-label="${esc(t('captured'))}">${caps}${adv > 0 ? `<span class="adv">+${adv}</span>` : ''}</span>`, active };
    };
    const bottomColor = state.flipped ? BLACK : WHITE;
    const top = bar(bottomColor ^ BLACK), bottom = bar(bottomColor);
    $('barTop').innerHTML = top.html; $('barTop').classList.toggle('active', top.active);
    $('barBottom').innerHTML = bottom.html; $('barBottom').classList.toggle('active', bottom.active);
  }

  function renderControls() {
    const undoBtn = $('btnUndo');
    let can = state.moves.length > 0;
    if (isComputerGame() && can) {
      // Need at least one human move to take back.
      const firstHumanPly = state.humanColor === WHITE ? 0 : 1;
      can = state.moves.length > firstHumanPly || state.busy;
    }
    undoBtn.disabled = !can;
  }

  function renderAll() {
    renderBoard();
    renderStatus();
    renderBars();
    renderMoves();
    renderCoach();
    renderControls();
  }

  // ---------------------------------------------------------------- language
  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.title = t('appTitle');
    $('langToggle').setAttribute('aria-checked', state.lang === 'es');
    renderSetup();
    renderAll();
    if (!$('glossaryModal').hidden) renderGlossary();
    if (!$('statsModal').hidden) renderStats();
    renderFacts();
    renderInstall();
  }

  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'es' : 'en';
    store.set('lang', state.lang);
    applyLanguage();
  });

  // ---------------------------------------------------------------- modals
  let lastFocus = null;
  function openModal(id) {
    // Only one dialog at a time (the header stays clickable above them).
    document.querySelectorAll('.modal').forEach(m => { if (m.id !== id && !m.hidden) m.hidden = true; });
    if ($(id).hidden) lastFocus = document.activeElement;
    $(id).hidden = false;
    const f = $(id).querySelector('.selected, button, input');
    if (f) setTimeout(() => f.focus(), 0);
  }
  function closeModal(id) {
    $(id).hidden = true;
    if (id === 'promoModal') deselect();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('[data-close]')) closeModal(m.id);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = Array.from(document.querySelectorAll('.modal')).find(m => !m.hidden);
    if (open) closeModal(open.id);
  });

  // New game setup
  const setup = { mode: state.mode, level: state.level, color: state.colorChoice };
  function renderSetup() {
    document.querySelectorAll('#modeOptions .mode-card').forEach(b => b.classList.toggle('selected', b.dataset.mode === setup.mode));
    document.querySelectorAll('#levelOptions button').forEach(b => b.classList.toggle('selected', b.dataset.level === setup.level));
    document.querySelectorAll('#colorOptions button').forEach(b => b.classList.toggle('selected', b.dataset.color === setup.color));
    $('levelField').hidden = setup.mode === 'pvp';
    $('colorField').hidden = setup.mode === 'pvp';
    $('levelDesc').textContent = t(LEVEL_KEY[setup.level] + 'Desc');
  }
  $('modeOptions').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) { setup.mode = b.dataset.mode; renderSetup(); } });
  $('levelOptions').addEventListener('click', e => { const b = e.target.closest('[data-level]'); if (b) { setup.level = b.dataset.level; renderSetup(); } });
  $('colorOptions').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (b) { setup.color = b.dataset.color; renderSetup(); } });
  $('btnStart').addEventListener('click', () => {
    state.mode = setup.mode; state.level = setup.level; state.colorChoice = setup.color;
    store.set('mode', state.mode); store.set('level', state.level); store.set('color', state.colorChoice);
    closeModal('newGameModal');
    newGame();
  });
  $('btnNew').addEventListener('click', () => {
    setup.mode = state.mode; setup.level = state.level; setup.color = state.colorChoice;
    renderSetup();
    nextFact();
    openModal('newGameModal');
  });
  $('btnUndo').addEventListener('click', undo);
  $('btnFlip').addEventListener('click', () => { state.flipped = !state.flipped; renderBoard(); renderBars(); });

  // ---------------------------------------------------------------- statistics
  // Each finished game is stored as one small record in localStorage.
  function loadStats() {
    const list = store.get('stats', []);
    return Array.isArray(list) ? list : [];
  }

  function recordGame(over) {
    const winner = over.reason === 'checkmate' ? over.winner : null;
    const rec = { mode: state.mode, reason: over.reason, plies: state.moves.length, date: Date.now() };
    if (isComputerGame()) {
      rec.level = state.level;
      rec.color = state.humanColor === WHITE ? 'w' : 'b';
      rec.result = winner === null ? 'draw' : winner === state.humanColor ? 'win' : 'loss';
    } else {
      rec.result = winner === null ? 'draw' : winner === WHITE ? 'white' : 'black';
    }
    const list = loadStats();
    list.push(rec);
    store.set('stats', list);
  }

  state.statsColor = 'all';
  function tally(records) {
    const r = { played: records.length, win: 0, loss: 0, draw: 0, white: 0, black: 0 };
    for (const x of records) r[x.result] = (r[x.result] || 0) + 1;
    return r;
  }
  function pctCell(wins, played) {
    if (!played) return '<td class="dim">—</td>';
    const p = Math.round(wins / played * 100);
    return `<td>${p}%<span class="pct-bar" aria-hidden="true"><i style="width:${p}%"></i></span></td>`;
  }
  function resultRow(label, r, cls) {
    return `<tr${cls ? ` class="${cls}"` : ''}><td>${label}</td><td>${r.played}</td><td>${r.win}</td><td>${r.loss}</td><td>${r.draw}</td>${pctCell(r.win, r.played)}</tr>`;
  }
  function resultHead(first) {
    return `<tr><th>${esc(first)}</th><th>${esc(t('played'))}</th><th>${esc(t('wins'))}</th><th>${esc(t('losses'))}</th><th>${esc(t('draws'))}</th><th>${esc(t('winPct'))}</th></tr>`;
  }

  function renderStats() {
    document.querySelectorAll('#statsColor button').forEach(b => b.classList.toggle('selected', b.dataset.scolor === state.statsColor));
    const all = loadStats();
    const vsCpu = all.filter(x => x.mode === 'cpu' || x.mode === 'learn');
    const shown = state.statsColor === 'all' ? vsCpu : vsCpu.filter(x => x.color === state.statsColor);
    const body = $('statsBody');
    $('btnResetStats').disabled = !all.length;
    if (!all.length) { body.innerHTML = `<p class="empty">${esc(t('statsEmpty'))}</p>`; return; }

    const o = tally(shown);
    let html = `<div class="stats-section"><h3>${esc(t('overall'))}</h3><div class="stats-summary">` +
      [['played', o.played], ['wins', o.win], ['losses', o.loss], ['draws', o.draw],
        ['winPct', o.played ? Math.round(o.win / o.played * 100) + '%' : '—']]
        .map(([k, v]) => `<div class="stat-tile"><div class="v">${v}</div><div class="k">${esc(t(k))}</div></div>`).join('') +
      '</div></div>';

    for (const mode of ['cpu', 'learn']) {
      const recs = shown.filter(x => x.mode === mode);
      html += `<div class="stats-section"><h3>${esc(t(mode === 'cpu' ? 'modeCpu' : 'modeLearn'))}</h3><div class="table-scroll"><table class="stats-table">` +
        resultHead(t('level')) +
        LEVELS.map(l => resultRow(esc(t(LEVEL_KEY[l])), tally(recs.filter(x => x.level === l)))).join('') +
        resultRow(esc(t('total')), tally(recs), 'total') + '</table></div></div>';
    }

    html += `<div class="stats-section"><h3>${esc(t('byColor'))}</h3><div class="table-scroll"><table class="stats-table">` +
      resultHead(t('playAs')) +
      resultRow(`<span class="swatch w"></span> ${esc(t('white'))}`, tally(vsCpu.filter(x => x.color === 'w'))) +
      resultRow(`<span class="swatch b"></span> ${esc(t('black'))}`, tally(vsCpu.filter(x => x.color === 'b'))) +
      '</table></div></div>';

    const pvp = tally(all.filter(x => x.mode === 'pvp'));
    html += `<div class="stats-section"><h3>${esc(t('pvpStats'))}</h3><div class="table-scroll"><table class="stats-table">` +
      `<tr><th>${esc(t('played'))}</th><th>${esc(t('whiteWins'))}</th><th>${esc(t('blackWins'))}</th><th>${esc(t('draws'))}</th></tr>` +
      `<tr><td>${pvp.played}</td><td>${pvp.white}</td><td>${pvp.black}</td><td>${pvp.draw}</td></tr></table></div></div>`;
    body.innerHTML = html;
  }

  $('btnStats').addEventListener('click', () => {
    $('resetConfirm').hidden = true; $('resetDone').hidden = true; $('btnResetStats').hidden = false;
    renderStats();
    openModal('statsModal');
  });
  $('statsColor').addEventListener('click', e => {
    const b = e.target.closest('[data-scolor]');
    if (b) { state.statsColor = b.dataset.scolor; renderStats(); }
  });
  $('btnResetStats').addEventListener('click', () => {
    $('resetConfirm').hidden = false; $('btnResetStats').hidden = true; $('resetDone').hidden = true;
    $('btnResetNo').focus();
  });
  $('btnResetNo').addEventListener('click', () => {
    $('resetConfirm').hidden = true; $('btnResetStats').hidden = false;
  });
  $('btnResetYes').addEventListener('click', () => {
    store.set('stats', []);
    $('resetConfirm').hidden = true; $('btnResetStats').hidden = false; $('resetDone').hidden = false;
    renderStats();
  });

  // ---------------------------------------------------------------- did you know?
  // Facts are dealt from a shuffled deck (kept in localStorage), so none
  // repeats until every fact has been shown.
  state.factIdx = -1;
  function nextFact() {
    let deck = store.get('factDeck', []);
    deck = Array.isArray(deck) ? deck.filter(i => Number.isInteger(i) && i >= 0 && i < FACTS.length) : [];
    if (!deck.length) {
      deck = FACTS.map((_, i) => i);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // Don't show the same fact twice in a row across a reshuffle.
      if (deck.length > 1 && deck[0] === state.factIdx) deck.push(deck.shift());
    }
    state.factIdx = deck.shift();
    store.set('factDeck', deck);
    renderFacts();
  }
  function renderFacts() {
    const f = FACTS[state.factIdx];
    document.querySelectorAll('.fact-text').forEach(el => { el.textContent = f ? f[state.lang] : ''; });
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-next-fact]')) nextFact(); });

  // Glossary
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function renderGlossary() {
    const q = norm($('glossarySearch').value.trim());
    const items = Object.keys(TERMS).map(id => ({ id, name: cap(TERMS[id][state.lang].n) }))
      .filter(x => !q || norm(x.name).includes(q) || norm(TERMS[x.id][state.lang].d).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, state.lang, { sensitivity: 'base' }));
    const catKey = { tactic: 'catTactic', rule: 'catRule', principle: 'catPrinciple', opening: 'catOpening', rating: 'catRating' };
    let html = '', letter = '';
    for (const it of items) {
      const l = norm(it.name).charAt(0).toUpperCase();
      if (l !== letter) { letter = l; html += `<div class="gl-letter">${esc(l)}</div>`; }
      const key = 'g:' + it.id, cat = TERMS[it.id].cat;
      const open = (state.openTerms.get(key) || []).includes(it.id);
      html += `<div class="gl-item" data-key="${key}">
        <div class="gl-head"><span class="gl-name">${esc(it.name)}</span><span class="chip ${cat}">${esc(t(catKey[cat]))}</span>
        <button type="button" class="term-btn${open ? ' open' : ''}" data-term="${it.id}" aria-expanded="${open}" aria-label="${esc(it.name)}">▼</button></div>
        <div class="term-slot">${slotHTML(key)}</div></div>`;
    }
    $('glossaryList').innerHTML = html;
  }
  $('glossarySearch').addEventListener('input', renderGlossary);
  $('btnGlossary').addEventListener('click', () => { renderGlossary(); openModal('glossaryModal'); });

  // ---------------------------------------------------------------- install & offline
  // A service worker stores the app for offline play. It needs http(s), so
  // nothing happens when index.html is opened straight from disk.
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMacSafari = !isIOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const canServiceWorker = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);
  let installPrompt = null;

  let toastTimer = null;
  // Small notice at the bottom. With an action (e.g. "Reload") it stays until
  // used or closed; otherwise it disappears after a few seconds.
  function toast(key, actionKey, onAction) {
    clearTimeout(toastTimer);
    $('toastText').textContent = t(key);
    $('toast').dataset.key = key;
    const btn = $('toastAction');
    btn.hidden = !actionKey;
    btn.dataset.key = actionKey || '';
    btn.textContent = actionKey ? t(actionKey) : '';
    btn.onclick = onAction || null;
    $('toast').hidden = false;
    if (!actionKey) toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() { $('toast').hidden = true; }
  $('toastClose').addEventListener('click', hideToast);

  function renderInstall() {
    $('btnInstall').hidden = !canServiceWorker || isStandalone();
    const steps = isIOS ? ['iosStep1', 'iosStep2', 'iosStep3'] : isMacSafari ? ['macStep1', 'macStep2'] :
      isAndroid ? ['androidStep1', 'androidStep2'] : ['otherStep1', 'otherStep2', 'otherStep3'];
    $('installSteps').innerHTML = steps.map(k => `<li>${esc(t(k))}</li>`).join('');
    // Re-translate a visible notice when the language changes.
    if (!$('toast').hidden && $('toast').dataset.key) $('toastText').textContent = t($('toast').dataset.key);
    if ($('toastAction').dataset.key) $('toastAction').textContent = t($('toastAction').dataset.key);
  }

  // Chrome, Edge and Android browsers offer a native install prompt.
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    renderInstall();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    $('btnInstall').hidden = true;
    closeModal('installModal');
    toast('installed');
  });
  $('btnInstall').addEventListener('click', async () => {
    if (installPrompt) {
      const p = installPrompt;
      installPrompt = null;
      p.prompt();
      try { await p.userChoice; } catch (e) { /* ignore */ }
    } else {
      // Safari (iPhone, iPad, Mac) and others: show how to install by hand.
      renderInstall();
      openModal('installModal');
    }
  });
  window.addEventListener('offline', () => toast('offlineNow'));

  if (canServiceWorker) {
    const offerReload = () => toast('updateReady', 'reload', () => { hideToast(); location.reload(); });
    let switching = false;
    // A new service worker (new VERSION in sw.js) is installed and waiting:
    // let the player choose when to switch, then reload once it takes over.
    const offerSwitch = worker => toast('updateReady', 'reload', () => {
      hideToast();
      switching = true;
      worker.postMessage('skipWaiting');
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (switching) { switching = false; location.reload(); }
    });
    // The service worker found newer copies of the app's files in the background.
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'updated') offerReload();
    });

    window.addEventListener('load', () => {
      const firstInstall = !navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').then(reg => {
        if (firstInstall) {
          const sw = reg.installing || reg.waiting || reg.active;
          const done = () => toast('offlineReady');
          if (sw && sw.state === 'activated') done();
          else if (sw) sw.addEventListener('statechange', () => { if (sw.state === 'activated') done(); });
        } else if (reg.waiting) {
          offerSwitch(reg.waiting);
        }
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker || firstInstall) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) offerSwitch(worker);
          });
        });
        // Apps left open for a long time (e.g. installed on a phone) still find updates.
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      }).catch(err => console.warn('Offline mode unavailable:', err));
    });
  }

  // ---------------------------------------------------------------- start
  buildBoard();
  Engine.init();
  applyLanguage();
  newGame();
  if (!store.get('seenSetup', false)) {
    store.set('seenSetup', true);
    renderSetup();
    nextFact();
    openModal('newGameModal');
  }
})();
