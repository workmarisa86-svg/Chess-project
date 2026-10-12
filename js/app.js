/* Main application: screens and menus, board UI, game flow, clocks, robot
   opponent, the simple coach, settings, statistics and glossary. */
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
  const CLOCK_PRESETS = [[1, 0], [3, 2], [5, 0], [10, 0], [15, 10], [30, 0]];
  const $ = id => document.getElementById(id);

  // ---------------------------------------------------------------- storage
  // localStorage is shared by every app on the same github.io domain, so all
  // keys carry this app's own prefix: chess-coach.stats, chess-coach.lang, ...
  const STORE_PREFIX = 'chess-coach.';
  const OLD_PREFIX = 'chesscoach.'; // used by early versions
  (function migrateOldKeys() {
    try {
      const old = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(OLD_PREFIX)) old.push(k);
      }
      for (const k of old) {
        const nk = STORE_PREFIX + k.slice(OLD_PREFIX.length);
        // Copy first, remove after: if copying fails, the old data stays put.
        if (localStorage.getItem(nk) === null) localStorage.setItem(nk, localStorage.getItem(k));
        localStorage.removeItem(k);
      }
    } catch (e) { /* storage unavailable: nothing to migrate */ }
  })();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(STORE_PREFIX + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(STORE_PREFIX + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    remove(k) { try { localStorage.removeItem(STORE_PREFIX + k); } catch (e) { /* ignore */ } }
  };

  // ---------------------------------------------------------------- settings
  const DEFAULT_SETTINGS = {
    clock: null,            // null = no clock, or { base: minutes, inc: seconds }
    boardTheme: 'brown', coords: true, showLegal: true, showLast: true,
    autoQueen: false, confirmTouch: false, autoFlip: false,
    sound: true, notation: 'auto', theme: 'system'
  };
  const settings = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
  const saveSettings = () => store.set('settings', settings);

  // Robot setup (colour + level). Earlier versions kept these as separate
  // "mode", "level" and "color" keys: fold them in once and drop the old keys.
  const robotSetup = Object.assign({ level: 'medium', color: 'w' }, store.get('robotSetup', {}));
  (function migrateSetup() {
    const oldLevel = store.get('level', null), oldColor = store.get('color', null);
    if (store.get('robotSetup', null) === null && (oldLevel || oldColor)) {
      if (LEVELS.includes(oldLevel)) robotSetup.level = oldLevel;
      if (['w', 'b', 'r'].includes(oldColor)) robotSetup.color = oldColor;
      store.set('robotSetup', robotSetup);
    }
    ['mode', 'level', 'color', 'seenSetup'].forEach(k => store.remove(k));
  })();
  if (!LEVELS.includes(robotSetup.level)) robotSetup.level = 'medium';

  // ---------------------------------------------------------------- state
  const state = {
    lang: store.get('lang', (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en'),
    screen: 'menu',
    setupMode: 'learn',
    mode: null,            // 'pvp' (Vs Friend), 'cpu' (Robot, Alone), 'learn' (Robot, Coach)
    level: robotSetup.level,
    humanColor: WHITE,
    game: new Core.Chess(),
    moves: [], sans: [],
    selected: -1, targets: [],
    lastMove: null,
    flipped: false,
    busy: false,
    token: 0,
    over: null,
    recorded: false,
    hint: null,            // arrow on the board: { from, to }
    strip: null,           // coach strip content
    pending: 0,            // move waiting for touch confirmation
    clock: null,
    openTerms: new Map(),
    openDemos: new Set(),
    statsColor: 'all',
    factIdx: -1,
    startFen: START_FEN,   // where the move list starts (puzzles and the analysis board use other positions)
    hintSq: -1,            // a square to highlight (puzzle hint)
    pz: null,              // the puzzle being solved
    an: null               // analysis board state
  };

  const t = key => (UI_STRINGS[state.lang] && UI_STRINGS[state.lang][key]) || UI_STRINGS.en[key] || key;
  const tf = (key, vars) => t(key).replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const nl = () => settings.notation === 'auto' ? state.lang : settings.notation; // notation language
  const san = s => localizeSan(s, nl());

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
    // Stop a long search (analysis board): restart the worker. A search on the
    // main thread can't be interrupted; its answer is simply ignored.
    cancel() {
      if (this.fallback || !this.worker) return;
      try { this.worker.terminate(); } catch (e) { /* ignore */ }
      this.worker = null;
      const waiting = Array.from(this.pending.values());
      this.pending.clear();
      waiting.forEach(p => p.resolve({ cancelled: true }));
      this.init();
    },
    request(msg) {
      msg.fen = msg.fen || START_FEN;
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
    const g = new Core.Chess(state.startFen);
    for (let i = 0; i < n; i++) g.make(state.moves[i]);
    return g;
  }
  const isRobotGame = () => state.mode === 'cpu' || state.mode === 'learn';
  const isPlayMode = () => state.mode === 'pvp' || state.mode === 'cpu' || state.mode === 'learn';
  const isTraining = () => state.mode === 'puzzle' || state.mode === 'analysis';
  const isEditing = () => state.mode === 'analysis' && !!state.an && state.an.edit;
  const isHumanTurn = () => state.mode === 'puzzle' ? !!state.pz && !state.pz.done && !state.pz.auto && state.game.turn === state.pz.color :
    !isRobotGame() || state.game.turn === state.humanColor;
  const canInteract = () => state.screen === 'game' && !state.over && !state.busy && !state.pending && isHumanTurn() && !isEditing() &&
    !(state.strip && (state.strip.kind === 'blunder' || state.strip.kind === 'pzWrong'));
  const colorName = c => c === WHITE ? t('white') : t('black');
  const sideName = c => t(c === WHITE ? 'whiteSide' : 'blackSide'); // used mid-sentence
  const gameInProgress = () => isPlayMode() && !state.over && state.moves.length > 0;

  // ---------------------------------------------------------------- theme
  const darkQuery = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function resolvedTheme() {
    if (settings.theme === 'light' || settings.theme === 'dark') return settings.theme;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }
  function applyTheme() {
    document.documentElement.dataset.theme = resolvedTheme();
    document.documentElement.dataset.board = settings.boardTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolvedTheme() === 'dark' ? '#17191c' : '#2f6f57';
  }
  if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', () => { if (settings.theme === 'system') applyTheme(); });
  $('themeToggle').addEventListener('click', () => {
    settings.theme = resolvedTheme() === 'dark' ? 'light' : 'dark';
    saveSettings();
    applyTheme();
    if (state.screen === 'settings') renderSettings();
  });

  // ---------------------------------------------------------------- screens
  const SCREENS = {
    menu: 'scrMenu', play: 'scrPlay', robot: 'scrRobot', setup: 'scrSetup', game: 'scrGame',
    settings: 'scrSettings', stats: 'scrStats', glossary: 'scrGlossary', challenge: 'scrChallenge'
  };

  function show(name, push) {
    if (state.screen === 'game' && name !== 'game') pauseClock();
    for (const [k, id] of Object.entries(SCREENS)) $(id).hidden = k !== name;
    state.screen = name;
    closeMore();
    if (push !== false && name !== 'menu') history.pushState({ s: name }, '');
    window.scrollTo(0, 0);
    renderScreen();
    if (name === 'game') resumeClock();
  }

  function renderScreen() {
    switch (state.screen) {
      case 'menu': renderMenu(); break;
      case 'setup': renderSetup(); break;
      case 'game': renderGame(); break;
      case 'settings': renderSettings(); break;
      case 'stats': renderStats(); break;
      case 'glossary': renderGlossary(); break;
      case 'challenge': renderChallenge(); break;
    }
  }

  function goMenu() {
    if (state.screen === 'game' && gameInProgress()) { askLeave(); return; }
    show('menu', false);
    history.replaceState({ s: 'menu' }, '');
  }

  history.replaceState({ s: 'menu' }, '');
  window.addEventListener('popstate', e => {
    const target = (e.state && e.state.s) || 'menu';
    if (state.screen === 'game' && target !== 'game' && gameInProgress()) {
      history.pushState({ s: 'game' }, '');
      askLeave();
      return;
    }
    if (target === 'game' && !state.mode) { show('menu', false); return; }
    show(target, false);
  });

  document.addEventListener('click', e => {
    const back = e.target.closest('[data-back]');
    if (back) { history.back(); return; }
    const go = e.target.closest('[data-go]');
    if (!go) return;
    const where = go.dataset.go;
    if (where === 'resume') resumeGame();
    else if (where === 'friend') confirmNewGame(() => startGame('pvp'));
    else if (where === 'setup-learn' || where === 'setup-cpu') { state.setupMode = where.slice(6); show('setup'); }
    else show(where);
  });
  $('brandHome').addEventListener('click', goMenu);
  // From a puzzle or the analysis board, the chevron goes back to the Challenge screen.
  $('btnLeave').addEventListener('click', () => { if (isTraining()) history.back(); else goMenu(); });

  // ---------------------------------------------------------------- dialogs
  let lastFocus = null;
  function openModal(id) {
    document.querySelectorAll('.modal').forEach(m => { if (m.id !== id && !m.hidden) m.hidden = true; });
    if ($(id).hidden) lastFocus = document.activeElement;
    $(id).hidden = false;
    const f = $(id).querySelector('.primary, button, input');
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
    if (open) closeModal(open.id); else closeMore();
  });

  // ask(title, text, [{ key, cls, fn }]) — a small choice dialog.
  function ask(titleKey, text, buttons) {
    $('askTitle').textContent = t(titleKey);
    $('askText').textContent = text || '';
    $('askText').hidden = !text;
    const box = $('askActions');
    box.innerHTML = '';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'btn ' + (b.cls || '');
      el.textContent = t(b.key);
      el.addEventListener('click', () => { closeModal('askModal'); if (b.fn) b.fn(); });
      box.appendChild(el);
    }
    openModal('askModal');
  }

  function askLeave() {
    ask('leaveTitle', t('leaveText'), [
      { key: 'keepIt', cls: 'primary', fn: () => { saveGame(); show('menu', false); history.replaceState({ s: 'menu' }, ''); } },
      { key: 'resign', cls: 'danger', fn: () => { resign(); show('menu', false); history.replaceState({ s: 'menu' }, ''); } },
      { key: 'cancel' }
    ]);
  }

  function confirmNewGame(fn) {
    if (gameInProgress() || savedGame()) {
      ask('newGameTitle', t('newGameText'), [
        { key: 'newGame', cls: 'primary', fn: () => { discardSaved(); fn(); } },
        { key: 'cancel' }
      ]);
    } else fn();
  }

  // ---------------------------------------------------------------- board
  const boardEl = $('board'), arrowsEl = $('arrows');
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
    const g = state.game, flip = state.flipped, editing = isEditing();
    const board = editing ? state.an.board : g.board;
    const checkSq = editing ? -1 : !state.over || state.over.reason === 'checkmate' ?
      (g.inCheck() ? g.kings[g.turn >> 3] : -1) : -1;
    const hint = state.hint;
    const movable = canInteract();
    // The opponent's last move is shown in gold: every move in Vs Friend
    // (the side to move always faces the player who just moved), and the
    // robot's moves against the robot. Your own last move stays subtle.
    let oppLast = false;
    if (state.lastMove && !editing) {
      const mover = g.board[state.lastMove.to] & BLACK;
      if (state.mode === 'puzzle') oppLast = !!state.pz && mover !== state.pz.color;
      else oppLast = !isRobotGame() || mover !== state.humanColor;
    }
    const showLast = settings.showLast, showLegal = settings.showLegal, coords = settings.coords;
    for (const [sq, el] of sqEls) {
      const r = sq >> 4, f = sq & 7;
      el.style.gridRow = flip ? r + 1 : 8 - r;
      el.style.gridColumn = flip ? 8 - f : f + 1;
      const p = board[sq];
      const cls = el.classList;
      const onLast = !editing && showLast && !!state.lastMove && (state.lastMove.from === sq || state.lastMove.to === sq);
      const target = showLegal && state.targets.includes(sq);
      cls.toggle('last-opp', onLast && oppLast);
      cls.toggle('last', onLast && !oppLast);
      cls.toggle('sel', state.selected === sq);
      cls.toggle('target', target);
      cls.toggle('capture', target && (!!p || isEpTarget(sq)));
      cls.toggle('check', sq === checkSq);
      cls.toggle('hint', (!!hint && (sqParse(hint.from) === sq || sqParse(hint.to) === sq)) || state.hintSq === sq);
      cls.toggle('movable', movable && !!p && (p & BLACK) === g.turn);
      cls.remove('drag-src', 'drop-over');
      let html = pieceHTML(p);
      if (coords) {
        if (flip ? f === 7 : f === 0) html += `<span class="coord rank">${r + 1}</span>`;
        if (flip ? r === 7 : r === 0) html += `<span class="coord file">${'abcdefgh'[f]}</span>`;
      }
      if (el._html !== html) { el.innerHTML = html; el._html = html; }
    }
    arrowsEl.innerHTML = arrowSVG(hint ? [[hint.from, hint.to]] : [], flip, 800);
    boardEl.classList.toggle('editing', editing);
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

  // ---------------------------------------------------------------- input
  let drag = null, lastPointer = 'mouse';

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

  document.addEventListener('pointerdown', e => { lastPointer = e.pointerType || 'mouse'; Sound.unlock(); }, true);

  boardEl.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (sq >= 0 && isEditing() && state.screen === 'game') { e.preventDefault(); editTap(sq); return; }
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
    if (cands.length > 1) {
      if (settings.autoQueen) { chooseMove(cands.find(x => mPromo(x) === QUEEN)); return; }
      askPromotion(cands);
      return;
    }
    chooseMove(cands[0]);
  }

  // With "confirm moves on touch screens", a tapped move waits for ✓.
  function chooseMove(m) {
    if (settings.confirmTouch && lastPointer === 'touch') {
      state.pending = m;
      state.selected = -1; state.targets = [];
      state.hint = { from: sqName(mFrom(m)), to: sqName(mTo(m)) };
      state.strip = { kind: 'confirm', move: m, prev: state.strip };
      renderGame();
      return;
    }
    humanMove(m);
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
      b.addEventListener('click', () => { closeModal('promoModal'); chooseMove(m); });
      box.appendChild(b);
    }
    openModal('promoModal');
  }

  // ---------------------------------------------------------------- clocks
  // Clocks are used in Vs Friend and Vs Robot (Alone), not in Coach games.
  const clockConfig = mode => (settings.clock && (mode === 'pvp' || mode === 'cpu')) ? settings.clock : null;

  function newClock(cfg) {
    return cfg ? { w: cfg.base * 60000, b: cfg.base * 60000, inc: cfg.inc * 1000, running: false, last: 0, base: cfg.base, incS: cfg.inc } : null;
  }
  const sideKey = c => c === WHITE ? 'w' : 'b';
  function timeLeft(c) {
    const k = state.clock;
    if (!k) return 0;
    let v = k[sideKey(c)];
    if (k.running && c === state.game.turn) v -= performance.now() - k.last;
    return Math.max(0, v);
  }
  function clockAfterMove(mover) {
    const k = state.clock;
    if (!k || state.over) return;
    const now = performance.now();
    if (k.running) k[sideKey(mover)] -= now - k.last;
    k[sideKey(mover)] += k.inc;
    k.running = true;
    k.last = now;
  }
  function pauseClock() {
    const k = state.clock;
    if (!k || !k.running) return;
    k[sideKey(state.game.turn)] = timeLeft(state.game.turn);
    k.running = false;
    k.paused = true;
  }
  function resumeClock() {
    const k = state.clock;
    if (!k || !k.paused || state.over) return;
    k.paused = false;
    k.running = true;
    k.last = performance.now();
  }
  function fmtClock(ms) {
    const s = ms / 1000;
    if (s < 10) return s.toFixed(1);
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  }
  // Can this side still give mate? (If not, running out of time is a draw.)
  function canMate(color) {
    const b = state.game.board;
    let minors = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq];
      if (!p || (p & BLACK) !== color) continue;
      const tp = p & 7;
      if (tp === PAWN || tp === ROOK || tp === QUEEN) return true;
      if (tp === KNIGHT || tp === BISHOP) minors++;
    }
    return minors >= 2;
  }
  setInterval(() => {
    const k = state.clock;
    if (!k || !k.running || state.over || state.screen !== 'game') return;
    const side = state.game.turn;
    if (timeLeft(side) <= 0) {
      k[sideKey(side)] = 0;
      k.running = false;
      state.token++;
      state.busy = false;
      endGame(canMate(side ^ BLACK) ? { reason: 'timeout', winner: side ^ BLACK, loser: side } : { reason: 'timeoutDraw' });
      return;
    }
    updateClocks();
  }, 200);

  function updateClocks() {
    document.querySelectorAll('.clock[data-side]').forEach(el => {
      const c = el.dataset.side === 'w' ? WHITE : BLACK;
      const ms = timeLeft(c);
      el.textContent = fmtClock(ms);
      el.classList.toggle('running', !!state.clock && state.clock.running && !state.over && state.game.turn === c);
      el.classList.toggle('low', ms < 20000);
    });
  }

  // ---------------------------------------------------------------- game flow
  function playSound(m, st) {
    if (st && st.over) Sound.play('end');
    else if (state.game.inCheck()) Sound.play('check');
    else if (mFlags(m) & Core.F_CAPTURE) Sound.play('capture');
    else Sound.play('move');
  }

  function applyMove(m) {
    const g = state.game;
    const mover = g.turn;
    const s = g.san(m, g.moves());
    g.make(m);
    state.moves.push(m);
    state.sans.push(s);
    state.lastMove = { from: mFrom(m), to: mTo(m) };
    state.selected = -1; state.targets = [];
    state.hint = null;
    state.pending = 0;
    clockAfterMove(mover);
    if (state.mode === 'pvp' && settings.autoFlip) state.flipped = g.turn === BLACK;
    const st = g.status();
    playSound(m, st);
    if (st.over) endGame(st, true);
    else saveGame();
  }

  function endGame(over, quiet) {
    state.over = Object.assign({ over: true }, over);
    if (isTraining()) { // puzzles and analysis: nothing to record or save
      if (!quiet) Sound.play('end');
      renderGame();
      return;
    }
    if (state.clock) { pauseClock(); state.clock.running = false; }
    if (!state.recorded) {
      state.recorded = true;
      recordGame(state.over);
    }
    if (!quiet) Sound.play('end');
    discardSaved();
    nextFact();
    $('endFact').hidden = false;
    renderGame();
  }

  function humanMove(m) {
    if (state.mode === 'puzzle') { puzzleMove(m); return; }
    if (state.mode === 'analysis') { state.strip = null; state.hint = null; applyMove(m); renderGame(); return; }
    const ply = state.moves.length;
    state.strip = null;
    applyMove(m);
    if (state.mode === 'learn') {
      const token = state.token;
      state.busy = true;
      state.strip = { kind: 'checking' };
      renderGame();
      Engine.request({ type: 'analyze', moves: state.moves.slice(0, ply), depth: 5, time: 1000 }).then(res => {
        if (token !== state.token) return;
        const results = res.results || [];
        const r = Coach.rateMove(results, m);
        bumpCoach(r.label);
        state.busy = false;
        if (r.label === 'blunder' && !state.over) {
          state.strip = { kind: 'blunder', move: m, ply, san: state.sans[ply] };
          Sound.play('error');
          renderGame();
          return;
        }
        state.strip = { kind: 'label', label: r.label, san: state.sans[ply] };
        if (!state.over) robotTurn(); else renderGame();
      });
      return;
    }
    renderGame();
    if (!state.over && isRobotGame()) robotTurn();
  }

  function bookMove() {
    if (!['medium', 'hard', 'impossible'].includes(state.level)) return 0;
    const cur = state.sans.map(s => s.replace(/[+#]/g, ''));
    const options = BOOK_LINES.filter(l => l.length > cur.length && cur.every((s, i) => s === l[i])).map(l => l[cur.length]);
    if (!options.length) return 0;
    return state.game.moveFromSan(options[Math.floor(Math.random() * options.length)]);
  }

  function robotTurn() {
    state.busy = true;
    renderGame();
    const token = state.token;
    const started = Date.now();
    const finish = m => {
      if (token !== state.token) return;
      const wait = Math.max(0, 350 - (Date.now() - started));
      setTimeout(() => {
        if (token !== state.token || state.over) return;
        state.busy = false;
        if (m) applyMove(m);
        renderGame();
      }, wait);
    };
    const bm = bookMove();
    if (bm) { finish(bm); return; }
    // With a clock, never spend more than a small share of the time left.
    const timeCap = state.clock ? Math.max(150, timeLeft(state.game.turn) / 30) : 0;
    Engine.request({ type: 'move', moves: state.moves.slice(), level: state.level, timeCap })
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
    state.pending = 0;
    state.selected = -1; state.targets = [];
    if (state.mode === 'pvp' && settings.autoFlip) state.flipped = state.game.turn === BLACK;
    $('endFact').hidden = true;
  }

  const boardResult = () => state.over && ['checkmate', 'stalemate', 'threefold', 'fifty', 'insufficient'].includes(state.over.reason);

  function canUndo() {
    if (state.mode === 'analysis') return !isEditing() && state.moves.length > 0;
    if (state.mode === 'puzzle') return false;
    if (state.over && !boardResult()) return false; // resignations, time and agreed draws are final
    if (!state.moves.length) return false;
    if (isRobotGame()) return state.moves.length > (state.humanColor === WHITE ? 0 : 1) || state.busy;
    return true;
  }

  function undo() {
    if (!canUndo()) return;
    state.token++;
    const wasBusy = state.busy;
    state.busy = false;
    state.strip = null;
    if (state.mode === 'analysis') { if (wasBusy) Engine.cancel(); undoPlies(1); renderGame(); return; }
    if (!isRobotGame()) { undoPlies(1); saveGame(); renderGame(); return; }
    // Go back to the position before the human's most recent move.
    const turnAt = k => (k % 2 === 0 ? WHITE : BLACK);
    let n = 0, k = state.moves.length;
    if (wasBusy && turnAt(k) !== state.humanColor) n = 1;
    else {
      while (k > 0) { k--; n++; if (turnAt(k) === state.humanColor) break; }
      if (turnAt(k) !== state.humanColor) n = 0;
    }
    if (n) undoPlies(n);
    saveGame();
    renderGame();
  }

  function newGameState(mode) {
    state.token++;
    state.mode = mode;
    state.startFen = START_FEN;
    state.game = new Core.Chess(START_FEN);
    state.pz = null; state.an = null; state.hintSq = -1;
    state.moves = []; state.sans = [];
    state.selected = -1; state.targets = [];
    state.lastMove = null; state.over = null; state.busy = false; state.hint = null;
    state.strip = null; state.pending = 0; state.recorded = false;
    state.openTerms.clear(); state.openDemos.clear();
    state.clock = newClock(clockConfig(mode));
    $('endFact').hidden = true;
  }

  function startGame(mode) {
    newGameState(mode);
    if (mode === 'pvp') {
      state.humanColor = WHITE;
    } else {
      state.level = robotSetup.level;
      const c = robotSetup.color;
      state.humanColor = c === 'b' ? BLACK : c === 'r' ? (Math.random() < 0.5 ? WHITE : BLACK) : WHITE;
    }
    state.flipped = state.humanColor === BLACK;
    show('game');
    if (isRobotGame() && state.game.turn !== state.humanColor) robotTurn();
  }

  function resign() {
    if (!state.mode || state.over) return;
    state.token++;
    state.busy = false;
    const loser = isRobotGame() ? state.humanColor : state.game.turn;
    endGame({ reason: 'resign', winner: loser ^ BLACK, loser });
  }

  function offerDraw() {
    if (!state.mode || state.over || state.busy) return;
    if (!isRobotGame()) {
      const other = state.game.turn ^ BLACK;
      ask('drawOfferTitle', tf('drawOfferText', { side: colorName(other) }), [
        { key: 'accept', cls: 'primary', fn: () => endGame({ reason: 'agreement' }) },
        { key: 'decline' }
      ]);
      return;
    }
    if (!isHumanTurn()) return;
    state.busy = true;
    renderGame();
    const token = state.token;
    Engine.request({ type: 'eval', moves: state.moves.slice(), time: 400 }).then(r => {
      if (token !== state.token) return;
      state.busy = false;
      // The robot accepts unless it thinks it is better (score is from your side).
      if ((r.score || 0) >= -40) { toast('robotAcceptsDraw'); endGame({ reason: 'agreement' }); }
      else { toast('robotDeclinesDraw'); renderGame(); }
    });
  }

  // ---------------------------------------------------------------- saving / resuming
  function saveGame() {
    if (!isPlayMode()) return; // puzzles and analysis never touch the saved game
    if (!gameInProgress()) { discardSaved(); return; }
    const k = state.clock;
    store.set('game', {
      mode: state.mode, level: state.level, humanColor: state.humanColor, moves: state.moves.slice(),
      flipped: state.flipped,
      clock: k ? { w: timeLeft(WHITE), b: timeLeft(BLACK), inc: k.inc, base: k.base, incS: k.incS } : null
    });
  }
  const savedGame = () => {
    const s = store.get('game', null);
    return s && Array.isArray(s.moves) && s.moves.length && ['pvp', 'cpu', 'learn'].includes(s.mode) ? s : null;
  };
  function discardSaved() { store.remove('game'); }

  function resumeGame() {
    if (state.mode && gameInProgress()) { show('game'); if (isRobotGame() && !isHumanTurn() && !state.busy) robotTurn(); return; }
    const s = savedGame();
    if (!s) { show('menu', false); return; }
    newGameState(s.mode);
    state.level = LEVELS.includes(s.level) ? s.level : 'medium';
    state.humanColor = s.humanColor === BLACK ? BLACK : WHITE;
    state.flipped = !!s.flipped;
    try {
      for (const m of s.moves) {
        if (!state.game.moves().includes(m)) throw new Error('bad move');
        const sn = state.game.san(m, state.game.moves());
        state.game.make(m);
        state.moves.push(m);
        state.sans.push(sn);
      }
    } catch (e) { discardSaved(); show('menu', false); return; }
    const lm = state.moves[state.moves.length - 1];
    state.lastMove = lm ? { from: mFrom(lm), to: mTo(lm) } : null;
    if (s.clock && state.clock !== undefined) {
      state.clock = { w: s.clock.w, b: s.clock.b, inc: s.clock.inc, base: s.clock.base, incS: s.clock.incS, running: false, last: 0, paused: true };
    }
    show('game');
    if (isRobotGame() && !isHumanTurn()) robotTurn();
  }

  // ---------------------------------------------------------------- coach
  function bumpCoach(label) {
    const c = Object.assign({ great: 0, accurate: 0, good: 0, blunder: 0, bestUsed: 0 }, store.get('coachStats', {}));
    c[label] = (c[label] || 0) + 1;
    store.set('coachStats', c);
  }

  function requestBest(fromBlunder) {
    if (state.mode !== 'learn' || state.busy || state.over || !isHumanTurn()) return;
    bumpCoach('bestUsed');
    state.busy = true;
    state.strip = { kind: 'finding' };
    renderGame();
    const token = state.token;
    const ply = state.moves.length;
    Engine.request({ type: 'explain', moves: state.moves.slice(), depth: 5, time: 1200 }).then(res => {
      if (token !== state.token) return;
      state.busy = false;
      const g = positionAt(ply);
      const ex = res.results && res.results.length ? Coach.explainBest(g, res.results, res.threat, ply, state.lang, nl()) : null;
      if (!ex) { state.strip = null; renderGame(); return; }
      state.hint = { from: ex.from, to: ex.to };
      state.strip = { kind: 'best', ex, keep: fromBlunder || 0, results: res.results, threat: res.threat, ply };
      renderGame();
    });
  }

  // Coach strip actions
  $('coachStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-strip]');
    if (!b) return;
    const s = state.strip;
    switch (b.dataset.strip) {
      case 'takeback':
        state.token++; state.busy = false; state.strip = null;
        undoPlies(1); saveGame(); renderGame();
        break;
      case 'showbest': {
        const m = s.move;
        state.token++; state.busy = false;
        undoPlies(1); saveGame();
        requestBest(m);
        break;
      }
      case 'keep':
        state.strip = null;
        if (s && s.kind === 'best' && s.keep) {
          // Replay the move the player chose to keep, then let the robot answer.
          state.hint = null;
          applyMove(s.keep);
          if (!state.over) robotTurn(); else renderGame();
        } else if (!state.over) robotTurn();
        break;
      case 'play':
        if (s && s.kind === 'best') humanMove(s.ex.move);
        break;
      case 'hide':
        state.strip = null; state.hint = null; renderGame();
        break;
      case 'pzRetry':
        state.strip = null; undoPlies(1); renderGame();
        break;
      case 'pzHint': puzzleHint(); break;
      case 'pzAnswer': puzzleShowAnswer(); break;
      case 'pzNext': nextPuzzle(); break;
      case 'pzNextLevel': goToLevel(+b.dataset.level); break;
      case 'pzHub': history.back(); break;
      case 'anCancel':
        state.token++; Engine.cancel(); state.busy = false; state.strip = null; renderGame();
        break;
      case 'anPlay':
        if (s && s.kind === 'anResult') humanMove(s.ex.move);
        break;
      case 'confirm':
        if (state.pending) { const m = state.pending; state.strip = s.prev || null; humanMove(m); }
        break;
      case 'cancel':
        state.pending = 0; state.hint = null; state.strip = s ? s.prev || null : null; renderGame();
        break;
    }
  });

  const LABEL_ICON = { great: '★', accurate: '✓', good: '•', blunder: '??' };

  function renderStrip() {
    const el = $('coachStrip'), s = state.strip;
    if (!s) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.className = 'coach-strip ' + s.kind + (s.label ? ' lbl-' + s.label : '');
    let html = '';
    switch (s.kind) {
      case 'checking':
        html = `<div class="strip-line pending">${esc(t('checkingMove'))}</div>`;
        break;
      case 'finding':
        html = `<div class="strip-line pending">${esc(t('findingBest'))}</div>`;
        break;
      case 'label':
        html = `<div class="strip-line"><span class="rate-pill r-${s.label}">${LABEL_ICON[s.label]} ${esc(t('lbl_' + s.label))}</span> <span class="strip-move">${esc(san(s.san))}</span></div>`;
        break;
      case 'blunder':
        html = `<div class="strip-line"><span class="rate-pill r-blunder">${LABEL_ICON.blunder} ${esc(t('lbl_blunder'))}</span> ${esc(tf('blunderText', { move: san(s.san) }))}</div>
          <div class="strip-actions">
            <button type="button" class="btn small" data-strip="takeback">↶ ${esc(t('takeBack'))}</button>
            <button type="button" class="btn small primary" data-strip="showbest">💡 ${esc(t('showBestMove'))}</button>
            <button type="button" class="btn small" data-strip="keep">${esc(t('keepMyMove'))}</button>
          </div>`;
        break;
      case 'best': {
        const key = 'strip:' + state.moves.length;
        const body = s.ex.sentences.map(x => renderTokens(x)).join(' ');
        html = `<div class="strip-line"><b>${esc(t('bestMoveIs'))}</b> <span class="strip-move">${esc(san(s.ex.san))}</span></div>
          <div class="cpara" data-key="${key}"><p>${body}</p><div class="term-slot">${slotHTML(key)}</div></div>
          <div class="strip-actions">
            <button type="button" class="btn small primary" data-strip="play">▶ ${esc(t('playIt'))}</button>
            ${s.keep ? `<button type="button" class="btn small" data-strip="keep">${esc(t('keepMyMove'))}</button>`
              : `<button type="button" class="btn small" data-strip="hide">${esc(t('close'))}</button>`}
          </div>`;
        break;
      }
      case 'pzWrong':
        html = `<div class="strip-line"><span class="rate-pill r-blunder">✗ ${esc(t('pzWrong'))}</span></div>
          <div class="strip-actions">
            <button type="button" class="btn small primary" data-strip="pzRetry">↶ ${esc(t('tryAgain'))}</button>
            <button type="button" class="btn small" data-strip="pzHint">💡 ${esc(t('hint'))}</button>
            <button type="button" class="btn small" data-strip="pzAnswer">👁 ${esc(t('showAnswer'))}</button>
          </div>`;
        break;
      case 'pzSolved':
      case 'pzAnswer':
        html = puzzleResultHTML(s);
        break;
      case 'anThinking':
        html = `<div class="strip-line pending">${esc(t('analyzing'))}</div>
          <div class="progress" aria-hidden="true"><span style="animation-duration:${s.limit}ms"></span></div>
          <div class="strip-actions"><button type="button" class="btn small" data-strip="anCancel">✕ ${esc(t('cancel'))}</button></div>`;
        break;
      case 'anResult':
        html = analysisResultHTML(s);
        break;
      case 'anInfo':
        html = `<div class="strip-line">${esc(s.text)}</div>`;
        break;
      case 'confirm': {
        const g = state.game;
        const sn = g.san(s.move, g.moves());
        html = `<div class="strip-line">${esc(tf('confirmMove', { move: san(sn) }))}</div>
          <div class="strip-actions">
            <button type="button" class="btn small primary" data-strip="confirm">✓ ${esc(t('confirm'))}</button>
            <button type="button" class="btn small" data-strip="cancel">✕ ${esc(t('cancel'))}</button>
          </div>`;
        break;
      }
    }
    el.innerHTML = html;
    syncTermButtons(el);
  }

  // ---------------------------------------------------------------- glossary terms
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

  const CAT_KEY = { tactic: 'catTactic', rule: 'catRule', principle: 'catPrinciple', opening: 'catOpening', rating: 'catRating', endgame: 'catEndgame' };

  function explanationHTML(id, key) {
    const term = TERMS[id];
    if (!term) return '';
    const L = term[state.lang];
    const demoKey = key + '|' + id;
    const demoOpen = state.openDemos.has(demoKey);
    return `<div class="explain" data-term="${id}">
      <div class="explain-head"><span class="explain-title">${esc(cap(L.n))}</span><span class="chip ${term.cat}">${esc(t(CAT_KEY[term.cat]))}</span></div>
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

  // Term dropdowns and demo toggles (coach strip and glossary).
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
    }
  });

  // ---------------------------------------------------------------- game screen
  function statusText() {
    const g = state.game, o = state.over;
    if (state.mode === 'puzzle' && state.pz) {
      const pz = state.pz;
      if (pz.done) return t(pz.failed ? 'pzAnswerShown' : pz.mistakes || pz.hints ? 'pzSolved' : 'pzCorrect');
      if (pz.auto) return t(pz.failed ? 'pzShowing' : 'pzReplying');
      return goalText(pz);
    }
    if (state.mode === 'analysis') {
      if (isEditing()) return t('setupTitle');
      if (o) return o.reason === 'checkmate' ? tf('checkmateWin', { side: o.winner === WHITE ? t('whiteSide') : t('blackSide') }) : t(o.reason);
      if (state.busy) return t('analyzing');
      return (g.turn === WHITE ? t('whiteToMove') : t('blackToMove')) + (g.inCheck() ? ' — ' + t('check') : '');
    }
    if (o) {
      const vsRobot = isRobotGame();
      switch (o.reason) {
        case 'checkmate':
          return vsRobot ? t(o.winner === state.humanColor ? 'youWin' : 'youLose') :
            t('checkmateWin').replace('{side}', o.winner === WHITE ? t('whiteSide') : t('blackSide'));
        case 'resign':
          return vsRobot ? t('youResigned') : tf('resignedPvp', { loser: sideName(o.loser), winner: sideName(o.winner) });
        case 'timeout':
          if (vsRobot) return t(o.winner === state.humanColor ? 'robotTimeout' : 'youTimeout');
          return tf('timeoutPvp', { loser: sideName(o.loser), winner: sideName(o.winner) });
        default:
          return t(o.reason);
      }
    }
    if (state.busy && state.strip && (state.strip.kind === 'checking' || state.strip.kind === 'finding')) return t('coachThinking');
    if (state.busy) return isRobotGame() && !isHumanTurn() ? t('thinking') : t('pleaseWait');
    let text = isRobotGame() ? t('yourTurn') : (g.turn === WHITE ? t('whiteToMove') : t('blackToMove'));
    if (g.inCheck()) text += ' — ' + t('check');
    return text;
  }

  function renderStatus() {
    const st = $('status');
    st.textContent = statusText();
    st.classList.toggle('thinking', !!state.busy && !state.over);
    $('turnDot').className = 'turn-dot ' + (state.game.turn === WHITE ? 'w' : 'b');
  }

  function renderMoves() {
    const el = $('moveList');
    if (!state.sans.length) { el.innerHTML = `<p class="empty">${esc(t('noMoves'))}</p>`; return; }
    let html = '';
    const cur = state.sans.length - 1;
    // Puzzles and the analysis board can start in the middle of a game, with Black to move.
    const parts = state.startFen.split(' ');
    const off = parts[1] === 'b' ? 1 : 0, first = parseInt(parts[5], 10) || 1;
    for (let i = -off; i < state.sans.length; i += 2) {
      const w = i >= 0 ? state.sans[i] : null, b = state.sans[i + 1];
      html += `<div class="mrow"><span class="num">${first + (i + off) / 2}.</span>` +
        `<span class="mv${cur === i ? ' cur' : ''}">${w ? esc(san(w)) : '…'}</span>` +
        `<span class="mv${cur === i + 1 ? ' cur' : ''}">${b ? esc(san(b)) : ''}</span></div>`;
    }
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  function renderBars() {
    const g = state.game;
    // Pieces captured BY each colour, from the move history.
    const taken = { [WHITE]: [], [BLACK]: [] };
    for (const h of g.hist) if (h.cap) taken[(h.cap & BLACK) ^ BLACK].push(h.cap);
    const mat = { [WHITE]: 0, [BLACK]: 0 };
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = g.board[sq];
      if (p) mat[p & BLACK] += VAL[p & 7];
    }
    const bar = color => {
      const name = isRobotGame() ? (color === state.humanColor ? t('you') : `${t('robot')} · ${t(LEVEL_KEY[state.level])}`) : colorName(color);
      const caps = taken[color].slice().sort((a, b) => VAL[b & 7] - VAL[a & 7])
        .map(p => `<span class="piece cap ${p & BLACK ? 'b' : 'w'}${PIECE_CODE[p & 7]}"></span>`).join('');
      const adv = mat[color] - mat[color ^ BLACK];
      const clock = state.clock ? `<span class="clock" data-side="${sideKey(color)}"></span>` : '';
      return { html: `<span class="player-name"><span class="swatch ${color === WHITE ? 'w' : 'b'}"></span>${esc(name)}</span>` +
        `<span class="captured" aria-label="${esc(t('captured'))}">${caps}${adv > 0 ? `<span class="adv">+${adv}</span>` : ''}</span>${clock}`,
      active: !state.over && g.turn === color };
    };
    const bottomColor = state.flipped ? BLACK : WHITE;
    const top = bar(bottomColor ^ BLACK), bottom = bar(bottomColor);
    if (state.mode === 'puzzle' && state.pz) {
      const p = state.pz.p;
      top.html = `<span class="player-name">🎯 ${esc(t(CAT_NAME[p.c]))} · ${esc(t(LEVEL_KEY[LEVELS[p.l]]))}</span>`;
      top.active = false;
      bottom.html = `<span class="player-name"><span class="swatch ${state.pz.color === WHITE ? 'w' : 'b'}"></span>${esc(t('you'))}</span>` +
        (chSetup.timer ? `<span class="clock pz-timer" id="pzTimer">${fmtElapsed(puzzleElapsed())}</span>` : '');
      bottom.active = !state.pz.done;
    }
    $('barTop').hidden = $('barBottom').hidden = isEditing();
    $('barTop').innerHTML = top.html; $('barTop').classList.toggle('active', top.active);
    $('barBottom').innerHTML = bottom.html; $('barBottom').classList.toggle('active', bottom.active);
    updateClocks();
  }

  function renderControls() {
    const puzzle = state.mode === 'puzzle', analysis = state.mode === 'analysis', editing = isEditing();
    const pz = state.pz;
    $('btnUndo').hidden = puzzle;
    $('btnUndo').disabled = !canUndo();
    const coach = state.mode === 'learn';
    $('btnBest').hidden = !coach && !analysis;
    $('btnBest').disabled = analysis ? state.busy || !!state.over :
      !coach || state.busy || !!state.over || !isHumanTurn() || !!state.pending ||
      (state.strip && (state.strip.kind === 'blunder' || state.strip.kind === 'best'));
    $('btnHint').hidden = !puzzle || !pz || pz.done;
    $('btnHint').disabled = !pz || pz.auto || state.hintSq >= 0;
    $('btnSkip').hidden = !puzzle || !pz || pz.done;
    $('btnSkip').disabled = !pz || pz.auto;
    $('btnNext').hidden = !puzzle || !pz || !pz.done;
    $('btnEdit').hidden = !analysis;
    document.querySelector('#scrGame .controls').hidden = editing;
    $('editPanel').hidden = !editing;
    $('movesPanel').hidden = editing;
    $('btnMore').hidden = isTraining();
    if (editing) renderEditPanel();
    document.querySelector('#moreMenu [data-act="draw"]').disabled = !!state.over || state.busy || !state.moves.length;
    document.querySelector('#moreMenu [data-act="resign"]').disabled = !!state.over || !state.moves.length;
  }

  function renderGame() {
    if (state.screen !== 'game') return;
    renderBoard();
    renderStatus();
    renderBars();
    renderMoves();
    renderStrip();
    renderControls();
  }

  $('btnUndo').addEventListener('click', undo);
  $('btnFlip').addEventListener('click', () => { state.flipped = !state.flipped; renderBoard(); renderBars(); });
  $('btnBest').addEventListener('click', () => { if (state.mode === 'analysis') analysisBest(); else requestBest(0); });
  $('btnHint').addEventListener('click', puzzleHint);
  $('btnSkip').addEventListener('click', puzzleSkip);
  $('btnNext').addEventListener('click', nextPuzzle);
  $('btnEdit').addEventListener('click', () => editPosition(state.game.fen()));

  function closeMore() { $('moreMenu').hidden = true; $('btnMore').setAttribute('aria-expanded', 'false'); }
  $('btnMore').addEventListener('click', e => {
    e.stopPropagation();
    const open = $('moreMenu').hidden;
    $('moreMenu').hidden = !open;
    $('btnMore').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.more-wrap')) closeMore(); });
  $('moreMenu').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    closeMore();
    if (b.dataset.act === 'new') {
      const mode = state.mode;
      const again = () => { discardSaved(); startGameAgain(mode); };
      if (gameInProgress()) ask('newGameTitle', t('newGameText'), [{ key: 'newGame', cls: 'primary', fn: again }, { key: 'cancel' }]);
      else again();
    } else if (b.dataset.act === 'resign') {
      ask('resignTitle', '', [{ key: 'resign', cls: 'danger', fn: resign }, { key: 'cancel' }]);
    } else if (b.dataset.act === 'draw') {
      offerDraw();
    }
  });
  function startGameAgain(mode) {
    // Same mode and settings, without stacking another history entry.
    history.replaceState({ s: 'game' }, '');
    newGameState(mode);
    if (mode !== 'pvp') {
      const c = robotSetup.color;
      state.level = robotSetup.level;
      state.humanColor = c === 'b' ? BLACK : c === 'r' ? (Math.random() < 0.5 ? WHITE : BLACK) : WHITE;
    } else state.humanColor = WHITE;
    state.flipped = state.humanColor === BLACK;
    renderGame();
    resumeClock();
    if (isRobotGame() && state.game.turn !== state.humanColor) robotTurn();
  }

  // ---------------------------------------------------------------- challenge: puzzles
  // The puzzles live in data/challenges.js. It is only loaded when the
  // Challenge screen is first opened (the service worker keeps it for offline
  // use). Each puzzle: i id, f position (FEN), s solution (moves, the robot's
  // replies in between), g goal, t theme, l level 0-4, c category, en/es
  // explanation, n game name and a "what happened next" for master games.
  const CATS = ['o', 't', 'e', 'g'];
  const CAT_NAME = { o: 'catOpenings', t: 'catTactics', e: 'catEndgames', g: 'catGames' };
  const chSetup = Object.assign({ cat: 't', level: 0, timer: false }, store.get('challengeSetup', {}));
  if (!CATS.includes(chSetup.cat)) chSetup.cat = 't';
  if (!(chSetup.level >= 0 && chSetup.level <= 4)) chSetup.level = 0;
  const saveChSetup = () => store.set('challengeSetup', chSetup);
  const seenThisSession = new Set();
  let puzzlesPromise = null;

  function loadPuzzles() {
    if (window.CHALLENGES) return Promise.resolve(window.CHALLENGES);
    if (!puzzlesPromise) {
      puzzlesPromise = new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = 'data/challenges.js';
        el.onload = () => (window.CHALLENGES ? resolve(window.CHALLENGES) : reject(new Error('no data')));
        el.onerror = () => { puzzlesPromise = null; el.remove(); reject(new Error('load failed')); };
        document.head.appendChild(el);
      });
    }
    return puzzlesPromise;
  }

  const PROMO_CH = ' pnbrqk';
  const uciOf = m => sqName(mFrom(m)) + sqName(mTo(m)) + (mPromo(m) ? PROMO_CH[mPromo(m)] : '');
  const fromUci = (g, u) => g.moves().find(m => uciOf(m) === u) || 0;

  // Challenge statistics: solved puzzles (by id), first-try results, streaks,
  // and results per category and level.
  function chStats() {
    const s = Object.assign({ solved: {}, played: 0, first: 0, cur: 0, best: 0, cat: {}, lvl: {} }, store.get('challengeStats', {}));
    for (const k of ['solved', 'cat', 'lvl']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
    return s;
  }
  function recordChallenge(p, result) { // result: 'first' | 'solved' | 'failed'
    const s = chStats();
    s.played++;
    const bump = (obj, k) => {
      const r = obj[k] || (obj[k] = { p: 0, s: 0, f: 0 });
      r.p++;
      if (result !== 'failed') r.s++;
      if (result === 'first') r.f++;
    };
    bump(s.cat, p.c); bump(s.lvl, p.l);
    if (result === 'first') { s.first++; s.cur++; s.best = Math.max(s.best, s.cur); } else s.cur = 0;
    if (result !== 'failed') s.solved[p.i] = 1;
    store.set('challengeStats', s);
  }

  // Random order, no repeats: unsolved puzzles first (not shown again in this
  // session until the others have been seen); once all are solved, go round
  // again in a new random order.
  function pickPuzzle(all) {
    const pool = all.filter(p => p.c === chSetup.cat && p.l === chSetup.level);
    if (!pool.length) return null;
    const solved = chStats().solved;
    const current = state.pz ? state.pz.p.i : null;
    let cand = pool.filter(p => !solved[p.i] && !seenThisSession.has(p.i));
    if (!cand.length) {
      cand = pool.filter(p => !solved[p.i] && p.i !== current);
      cand.forEach(p => seenThisSession.delete(p.i));
    }
    if (!cand.length) cand = pool.filter(p => !solved[p.i]);
    if (cand.length) return cand[Math.floor(Math.random() * cand.length)];
    const key = chSetup.cat + chSetup.level;
    const decks = store.get('challengeDeck', {});
    let deck = (Array.isArray(decks[key]) ? decks[key] : []).filter(id => pool.some(p => p.i === id));
    if (!deck.length) {
      deck = pool.map(p => p.i).filter(id => id !== current);
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      toast('chAllSolved');
    }
    const id = deck.shift();
    decks[key] = deck;
    store.set('challengeDeck', decks);
    return pool.find(p => p.i === id) || pool[0];
  }

  // Levels: a level is complete when every puzzle in it is solved; the next
  // level is the next one up in the same category that has puzzles.
  const poolOf = (all, cat, lvl) => all.filter(p => p.c === cat && p.l === lvl);
  function levelDone(cat, lvl) {
    const pool = poolOf(window.CHALLENGES || [], cat, lvl), solved = chStats().solved;
    return pool.length > 0 && pool.every(p => solved[p.i]);
  }
  function nextLevelFor(cat, lvl) {
    for (let l = lvl + 1; l <= 4; l++) if (poolOf(window.CHALLENGES || [], cat, l).length) return l;
    return -1;
  }
  function goToLevel(lvl) {
    chSetup.level = lvl;
    saveChSetup();
    nextPuzzle();
  }

  function nextPuzzle() {
    loadPuzzles().then(all => {
      const p = pickPuzzle(all);
      if (p) startPuzzle(p); else show('challenge');
    }).catch(() => toast('loadFailed'));
  }

  function startPuzzle(p) {
    newGameState('puzzle');
    state.startFen = p.f;
    state.game = new Core.Chess(p.f);
    state.pz = {
      p, line: p.s.split(' '), step: 0, color: state.game.turn,
      mistakes: 0, hints: 0, done: false, failed: false, auto: false, recorded: false, t0: performance.now(), t: 0
    };
    state.flipped = state.pz.color === BLACK;
    seenThisSession.add(p.i);
    if (state.screen !== 'game') show('game');
    else { window.scrollTo(0, 0); renderGame(); }
  }

  const puzzleElapsed = () => { const pz = state.pz; return !pz ? 0 : pz.done ? pz.t : performance.now() - pz.t0; };
  function fmtElapsed(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  setInterval(() => {
    if (state.mode !== 'puzzle' || state.screen !== 'game' || !chSetup.timer || !state.pz || state.pz.done) return;
    const el = $('pzTimer');
    if (el) el.textContent = fmtElapsed(puzzleElapsed());
  }, 250);

  function goalText(pz) {
    const g = pz.p.g;
    const goal = g.charAt(0) === 'm' && g !== 'mat' ? tf('goalMate', { n: g.slice(1) }) :
      t({ mat: 'goalMaterial', win: 'goalWin', draw: 'goalDraw', best: 'goalBest' }[g] || 'goalBest');
    return `${t(pz.color === WHITE ? 'whiteToMove' : 'blackToMove')} · ${goal}`;
  }

  function puzzleMove(m) {
    const pz = state.pz, g = state.game;
    let ok = uciOf(m) === pz.line[pz.step];
    if (!ok) { g.make(m); ok = g.status().reason === 'checkmate'; g.undo(); } // any checkmate solves it
    state.strip = null;
    state.hintSq = -1;
    applyMove(m);
    if (!ok) {
      pz.mistakes++;
      state.strip = { kind: 'pzWrong' };
      Sound.play('error');
      renderGame();
      return;
    }
    pz.step++;
    if (state.over || pz.step >= pz.line.length) { puzzleSolved(); return; }
    // The robot answers with the defence from the solution.
    pz.auto = true;
    renderGame();
    const token = state.token;
    setTimeout(() => {
      if (token !== state.token) return;
      const r = fromUci(state.game, pz.line[pz.step]);
      pz.step++;
      pz.auto = false;
      if (r) applyMove(r);
      renderGame();
    }, 450);
  }

  function puzzleHint() {
    const pz = state.pz;
    if (!pz || pz.done || pz.auto) return;
    if (state.strip && state.strip.kind === 'pzWrong') undoPlies(1);
    state.strip = null;
    pz.hints++;
    const m = fromUci(state.game, pz.line[pz.step]);
    state.hintSq = m ? mFrom(m) : -1; // highlight the piece to move
    renderGame();
  }

  function puzzleShowAnswer() {
    const pz = state.pz;
    if (!pz || pz.done) return;
    if (state.strip && state.strip.kind === 'pzWrong') undoPlies(1);
    pz.failed = true;
    pz.auto = true;
    state.strip = null;
    state.hintSq = -1;
    const token = ++state.token;
    const step = () => {
      if (token !== state.token) return;
      if (pz.step >= pz.line.length) { puzzleSolved(); return; }
      const m = fromUci(state.game, pz.line[pz.step]);
      if (!m) { puzzleSolved(); return; }
      state.hint = { from: sqName(mFrom(m)), to: sqName(mTo(m)) };
      renderGame();
      setTimeout(() => {
        if (token !== state.token) return;
        applyMove(m);
        pz.step++;
        renderGame();
        setTimeout(step, 450);
      }, 650);
    };
    step();
  }

  function puzzleSolved() {
    const pz = state.pz;
    pz.done = true;
    pz.auto = false;
    pz.t = performance.now() - pz.t0;
    state.hintSq = -1;
    const wasDone = levelDone(pz.p.c, pz.p.l);
    if (!pz.recorded) {
      pz.recorded = true;
      recordChallenge(pz.p, pz.failed ? 'failed' : (pz.mistakes || pz.hints) ? 'solved' : 'first');
    }
    // This solve finished the whole level: offer the next one.
    state.strip = { kind: pz.failed ? 'pzAnswer' : 'pzSolved', levelDone: !wasDone && levelDone(pz.p.c, pz.p.l) };
    if (!pz.failed && !state.over) Sound.play('notify');
    nextFact();
    $('endFact').hidden = false;
    renderGame();
  }

  function puzzleSkip() {
    const pz = state.pz;
    if (!pz || pz.auto) return;
    // Skipping after a wrong try or a hint counts as not solved.
    if (!pz.done && !pz.recorded && (pz.mistakes || pz.hints)) { pz.recorded = true; recordChallenge(pz.p, 'failed'); }
    nextPuzzle();
  }

  // Explanations: {{Nf3}} marks a move (shown in the chosen notation), [[term]] a glossary term.
  const puzzleText = str => renderTokens(esc(str).replace(/\{\{([^}]+)\}\}/g, (_, x) => `<b class="mv">${esc(san(x))}</b>`));

  function puzzleResultHTML(s) {
    const kind = s.kind, pz = state.pz, p = pz.p, L = state.lang;
    const key = 'pz:' + p.i;
    const head = kind === 'pzSolved' ?
      `<span class="rate-pill r-great">✓ ${esc(t(pz.mistakes || pz.hints ? 'pzSolved' : 'pzCorrect'))}</span>` :
      `<span class="rate-pill r-good">👁 ${esc(t('pzAnswerShown'))}</span>`;
    const time = chSetup.timer && kind === 'pzSolved' ? ` <span class="pz-time">⏱ ${fmtElapsed(pz.t)}</span>` : '';
    let body = '';
    if (p.n) body += `<p class="pz-game">🏛️ <b>${esc(p.n[L] || p.n.en)}</b></p>`;
    if (TERMS[p.t]) body += `<p class="pz-theme">${esc(t('theme'))}: ${renderTokens('[[C:' + p.t + ']]')}</p>`;
    body += `<p>${puzzleText(p[L] || p.en)}</p>`;
    if (p.a) body += `<p class="pz-after">${puzzleText(p.a[L] || p.a.en)}</p>`;
    let banner = '', actions = `<button type="button" class="btn small primary" data-strip="pzNext">→ ${esc(t('next'))}</button>`;
    if (s.levelDone) {
      const next = nextLevelFor(p.c, p.l);
      const where = `${t(CAT_NAME[p.c])} · ${t(LEVEL_KEY[LEVELS[p.l]])}`;
      banner = `<div class="level-done">🎉 <b>${esc(tf('chLevelDoneTitle', { where }))}</b>` +
        (next < 0 ? `<br>${esc(tf('chCategoryDone', { cat: t(CAT_NAME[p.c]) }))}` : '') + '</div>';
      actions = next >= 0 ?
        `<button type="button" class="btn small primary" data-strip="pzNextLevel" data-level="${next}">${esc(tf('chNextLevel', { level: t(LEVEL_KEY[LEVELS[next]]) }))} →</button>
         <button type="button" class="btn small" data-strip="pzNext">↻ ${esc(t('chPlayAgain'))}</button>` :
        `<button type="button" class="btn small primary" data-strip="pzHub">${esc(t('chChooseCategory'))}</button>
         <button type="button" class="btn small" data-strip="pzNext">↻ ${esc(t('chPlayAgain'))}</button>`;
    }
    return `${banner}<div class="strip-line">${head}${time}</div>
      <div class="cpara" data-key="${key}">${body}<div class="term-slot">${slotHTML(key)}</div></div>
      <div class="strip-actions">${actions}</div>`;
  }

  // ---------------------------------------------------------------- challenge screen
  function renderChallenge() {
    document.querySelectorAll('#chCats [data-cat]').forEach(b => b.classList.toggle('selected', b.dataset.cat === chSetup.cat));
    document.querySelectorAll('#chLevels [data-l]').forEach(b => b.classList.toggle('selected', +b.dataset.l === chSetup.level));
    $('chLevelDesc').textContent = t('chLvlDesc' + chSetup.level);
    $('chTimer').checked = !!chSetup.timer;
    const all = window.CHALLENGES;
    if (!all) {
      $('chLoading').hidden = false;
      $('chLoading').textContent = t('loading');
      $('btnChStart').disabled = true;
      $('chProgress').hidden = true;
      loadPuzzles().then(() => { if (state.screen === 'challenge') renderChallenge(); })
        .catch(() => { $('chLoading').textContent = t('loadFailed'); });
      return;
    }
    $('chLoading').hidden = true;
    $('chProgress').hidden = false;
    const solved = chStats().solved;
    document.querySelectorAll('#chCats [data-cat]').forEach(b => {
      const list = all.filter(p => p.c === b.dataset.cat);
      b.querySelector('small').textContent = tf('chSolvedShort', { s: list.filter(p => solved[p.i]).length, n: list.length });
    });
    document.querySelectorAll('#chLevels [data-l]').forEach(b => {
      const n = poolOf(all, chSetup.cat, +b.dataset.l).length;
      b.classList.toggle('done', levelDone(chSetup.cat, +b.dataset.l));
      b.classList.toggle('empty', !n);
    });
    const pool = poolOf(all, chSetup.cat, chSetup.level);
    const done = pool.filter(p => solved[p.i]).length;
    const complete = pool.length > 0 && done === pool.length;
    const next = nextLevelFor(chSetup.cat, chSetup.level);
    $('chProgressText').textContent = !pool.length ? t('chNone') :
      tf('chProgress', { s: done, n: pool.length }) + (complete ? ' — ' + t('chLevelDone') : '');
    $('chProgressBar').style.width = pool.length ? (done / pool.length * 100) + '%' : '0';
    $('btnChStart').disabled = !pool.length;
    $('btnChStart').textContent = t(complete ? 'chPlayAgain' : 'chStart');
    $('btnChNextLevel').hidden = !complete || next < 0;
    if (next >= 0) $('btnChNextLevel').textContent = tf('chNextLevel', { level: t(LEVEL_KEY[LEVELS[next]]) }) + ' →';
  }
  $('chCats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (b) { chSetup.cat = b.dataset.cat; saveChSetup(); renderChallenge(); }
  });
  $('chLevels').addEventListener('click', e => {
    const b = e.target.closest('[data-l]');
    if (b) { chSetup.level = +b.dataset.l; saveChSetup(); renderChallenge(); }
  });
  $('chTimer').addEventListener('change', e => { chSetup.timer = e.target.checked; saveChSetup(); });
  $('btnChStart').addEventListener('click', nextPuzzle);
  $('btnChNextLevel').addEventListener('click', () => { const n = nextLevelFor(chSetup.cat, chSetup.level); if (n >= 0) goToLevel(n); });
  $('btnAnalysis').addEventListener('click', () => startAnalysis());

  // ---------------------------------------------------------------- analysis board
  // Set up any position (palette, text or FEN), check that it is legal, then
  // ask the engine for the best move, the top three candidates and why.
  const ANALYSIS_MS = 4000;
  const EDIT_TOOLS = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP', 'x'];
  const toolPiece = tool => tool === 'x' ? 0 : PIECE_CODE.indexOf(tool[1]) | (tool[0] === 'b' ? BLACK : WHITE);
  const sqOf = (f, r) => r * 16 + f;

  function startAnalysis() {
    newGameState('analysis');
    state.flipped = false;
    editPosition(store.get('analysisFen', START_FEN), true);
    show('game');
  }

  // Read a FEN into the editor. Returns false (and changes nothing) if it can't be read.
  function parseFen(fen) {
    const parts = String(fen || '').trim().split(/\s+/);
    const rows = (parts[0] || '').split('/');
    if (rows.length !== 8) return null;
    const board = new Int8Array(128);
    for (let r = 0; r < 8; r++) {
      let f = 0;
      for (const ch of rows[r]) {
        if (ch >= '1' && ch <= '8') { f += +ch; continue; }
        const type = ' pnbrqk'.indexOf(ch.toLowerCase());
        if (type < 1 || f > 7) return null;
        board[sqOf(f, 7 - r)] = type | (ch === ch.toLowerCase() ? BLACK : WHITE);
        f++;
      }
      if (f !== 8) return null;
    }
    const turn = parts[1] === 'b' ? BLACK : WHITE;
    if (parts[1] && parts[1] !== 'w' && parts[1] !== 'b') return null;
    const castle = new Set((parts[2] && parts[2] !== '-' ? parts[2] : '').split('').filter(c => 'KQkq'.includes(c)));
    return { board, turn, castle };
  }

  function editPosition(fen, quiet) {
    if (state.busy) Engine.cancel();
    state.token++;
    state.busy = false;
    const pos = parseFen(fen) || parseFen(START_FEN);
    state.an = { edit: true, tool: (state.an && state.an.tool) || 'wP', board: pos.board, turn: pos.turn, castle: pos.castle, msg: null };
    state.moves = []; state.sans = [];
    state.lastMove = null; state.over = null; state.hint = null; state.strip = null; state.hintSq = -1;
    state.selected = -1; state.targets = [];
    fixCastling();
    state.an.msg = validatePosition();
    if (!quiet) renderGame();
  }

  // Castling is only possible with the king and rook on their starting squares.
  function castleAllowed(c) {
    const b = state.an.board;
    const K = KING | (c === c.toUpperCase() ? WHITE : BLACK), R = ROOK | (c === c.toUpperCase() ? WHITE : BLACK);
    const r = c === c.toUpperCase() ? 0 : 7;
    return b[sqOf(4, r)] === K && b[sqOf('Kk'.includes(c) ? 7 : 0, r)] === R;
  }
  function fixCastling() { for (const c of Array.from(state.an.castle)) if (!castleAllowed(c)) state.an.castle.delete(c); }

  function editorFen() {
    const an = state.an;
    let s = '';
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      for (let f = 0; f < 8; f++) {
        const p = an.board[sqOf(f, r)];
        if (!p) { empty++; continue; }
        if (empty) { s += empty; empty = 0; }
        const ch = ' pnbrqk'[p & 7];
        s += p & BLACK ? ch : ch.toUpperCase();
      }
      if (empty) s += empty;
      if (r) s += '/';
    }
    const c = 'KQkq'.split('').filter(x => an.castle.has(x)).join('') || '-';
    return `${s} ${an.turn === BLACK ? 'b' : 'w'} ${c} - 0 1`;
  }

  // Friendly checks: returns a message, or null if the position is legal.
  function validatePosition() {
    const b = state.an.board;
    const count = { [WHITE]: { all: 0, K: 0, P: 0 }, [BLACK]: { all: 0, K: 0, P: 0 } };
    const kings = {};
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const sq = sqOf(f, r), p = b[sq];
      if (!p) continue;
      const c = count[p & BLACK];
      c.all++;
      if ((p & 7) === KING) { c.K++; kings[p & BLACK] = sq; }
      if ((p & 7) === PAWN) {
        c.P++;
        if (r === 0 || r === 7) return tf('errPawnRank', { sq: sqName(sq) });
      }
    }
    for (const col of [WHITE, BLACK]) {
      const c = count[col], side = sideName(col);
      if (c.K === 0) return tf('errNoKing', { side });
      if (c.K > 1) return tf('errTwoKings', { side });
      if (c.P > 8) return tf('errPawns', { side });
      if (c.all > 16) return tf('errTooMany', { side });
    }
    const kw = kings[WHITE], kb = kings[BLACK];
    if (Math.abs((kw & 7) - (kb & 7)) <= 1 && Math.abs((kw >> 4) - (kb >> 4)) <= 1) return t('errKingsTouch');
    const g = new Core.Chess(editorFen());
    const other = state.an.turn ^ BLACK;
    if (g.inCheck(other)) return tf('errOppCheck', { side: sideName(other), turn: sideName(state.an.turn) });
    return null;
  }

  function editChanged() {
    fixCastling();
    state.an.msg = validatePosition();
    renderBoard();
    renderEditPanel();
  }

  function editTap(sq) {
    const an = state.an, piece = toolPiece(an.tool);
    if (an.tool === 'x' || an.board[sq] === piece) an.board[sq] = 0;
    else {
      if ((piece & 7) === PAWN && ((sq >> 4) === 0 || (sq >> 4) === 7)) {
        an.msg = tf('errPawnRank', { sq: sqName(sq) });
        Sound.play('error');
        renderEditPanel(true);
        return;
      }
      // Only one king per side: placing a king moves it.
      if ((piece & 7) === KING) for (let s = 0; s < 128; s++) if (!(s & 0x88) && an.board[s] === piece) an.board[s] = 0;
      an.board[sq] = piece;
    }
    editChanged();
  }

  // Text entry such as "Kg1 Rc3 Ph7 kg8": capitals are White, small letters Black.
  function addPiecesFromText(text) {
    const letters = nl() === 'es' ? 'RDTACP' : 'KQRBNP'; // king, queen, rook, bishop, knight, pawn
    const placed = [], bad = [];
    for (const tok of text.trim().split(/[\s,;]+/).filter(Boolean)) {
      const m = /^([A-Za-z])([a-h][1-8])$/.exec(tok);
      const i = m ? letters.indexOf(m[1].toUpperCase()) : -1;
      if (i < 0) { bad.push(tok); continue; }
      const type = [KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN][i];
      const sq = sqParse(m[2]);
      if (type === PAWN && ((sq >> 4) === 0 || (sq >> 4) === 7)) { bad.push(tok); continue; }
      placed.push([sq, type | (m[1] === m[1].toUpperCase() ? WHITE : BLACK)]);
    }
    for (const [sq, p] of placed) {
      if ((p & 7) === KING) for (let s = 0; s < 128; s++) if (!(s & 0x88) && state.an.board[s] === p) state.an.board[s] = 0;
      state.an.board[sq] = p;
    }
    editChanged();
    if (bad.length) { state.an.msg = tf('errText', { list: bad.join(' ') }); renderEditPanel(true); }
    return !bad.length;
  }

  function renderEditPanel(flash) {
    const an = state.an;
    if (!an) return;
    const pal = $('palette');
    if (!pal.children.length) {
      pal.innerHTML = EDIT_TOOLS.map(tl => `<button type="button" data-tool="${tl}" class="${tl === 'x' ? 'eraser' : ''}">` +
        (tl === 'x' ? '<span class="eraser-icon" aria-hidden="true">⌫</span>' : pieceHTML(toolPiece(tl))) + '</button>').join('');
    }
    pal.querySelectorAll('[data-tool]').forEach(b => {
      const tl = b.dataset.tool;
      b.classList.toggle('selected', tl === an.tool);
      b.setAttribute('aria-pressed', tl === an.tool);
      b.setAttribute('aria-label', tl === 'x' ? t('eraser') :
        `${tl[0] === 'w' ? t('white') : t('black')} ${PIECE_NAMES[state.lang][PIECE_CODE.indexOf(tl[1])]}`);
    });
    document.querySelectorAll('#edTurn [data-turn]').forEach(b => b.classList.toggle('selected', (b.dataset.turn === 'b') === (an.turn === BLACK)));
    document.querySelectorAll('[data-castle]').forEach(cb => {
      const ok = castleAllowed(cb.dataset.castle);
      cb.disabled = !ok;
      cb.checked = ok && an.castle.has(cb.dataset.castle);
    });
    if (document.activeElement !== $('edFen')) $('edFen').value = editorFen();
    $('edTextHelp').textContent = t(nl() === 'es' ? 'piecesTextHelpEs' : 'piecesTextHelpEn');
    $('edText').placeholder = nl() === 'es' ? 'Rg1 Tc3 Ph7 rg8' : 'Kg1 Rc3 Ph7 kg8';
    const msg = $('editMsg');
    msg.textContent = an.msg || t('posOk');
    msg.className = 'edit-msg ' + (an.msg ? 'error' : 'ok');
    if (flash) { msg.classList.remove('flash'); void msg.offsetWidth; msg.classList.add('flash'); }
  }

  $('palette').addEventListener('click', e => {
    const b = e.target.closest('[data-tool]');
    if (b && state.an) { state.an.tool = b.dataset.tool; renderEditPanel(); }
  });
  $('edTurn').addEventListener('click', e => {
    const b = e.target.closest('[data-turn]');
    if (b && state.an) { state.an.turn = b.dataset.turn === 'b' ? BLACK : WHITE; editChanged(); renderStatus(); }
  });
  document.querySelectorAll('[data-castle]').forEach(cb => cb.addEventListener('change', () => {
    if (!state.an) return;
    if (cb.checked) state.an.castle.add(cb.dataset.castle); else state.an.castle.delete(cb.dataset.castle);
    editChanged();
  }));
  $('edText').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (addPiecesFromText($('edText').value)) $('edText').value = ''; } });
  $('edFen').addEventListener('change', () => loadFenText($('edFen').value));
  $('edFen').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); loadFenText($('edFen').value); } });

  function loadFenText(text) {
    const pos = parseFen(text);
    if (!pos) { state.an.msg = t('errFen'); renderEditPanel(true); return false; }
    Object.assign(state.an, { board: pos.board, turn: pos.turn, castle: pos.castle });
    $('edFen').blur();
    editChanged();
    return true;
  }

  $('editPanel').addEventListener('click', e => {
    const b = e.target.closest('[data-ed]');
    if (!b || !state.an) return;
    const an = state.an;
    switch (b.dataset.ed) {
      case 'clear': an.board = new Int8Array(128); an.castle.clear(); editChanged(); break;
      case 'start': loadFenText(START_FEN); break;
      case 'flip': state.flipped = !state.flipped; renderBoard(); break;
      case 'text': if (addPiecesFromText($('edText').value)) $('edText').value = ''; break;
      case 'copy': {
        const fen = editorFen();
        const done = () => toast('fenCopied');
        const fallback = () => { const i = $('edFen'); i.value = fen; i.focus(); i.select(); try { document.execCommand('copy'); done(); } catch (err) { toast('copyManually'); } };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(fen).then(done, fallback);
        else fallback();
        break;
      }
      case 'paste': {
        const manual = () => { const i = $('edFen'); i.value = ''; i.focus(); toast('pasteHere'); };
        if (navigator.clipboard && navigator.clipboard.readText) {
          navigator.clipboard.readText().then(txt => { if (!txt || !loadFenText(txt)) manual(); }, manual);
        } else manual();
        break;
      }
      case 'done': {
        an.msg = validatePosition();
        if (an.msg) { renderEditPanel(true); Sound.play('error'); return; }
        const fen = editorFen();
        store.set('analysisFen', fen);
        state.startFen = fen;
        state.game = new Core.Chess(fen);
        an.edit = false;
        const st = state.game.status();
        state.over = st.over ? Object.assign({ over: true }, st) : null;
        if (st.over) state.strip = { kind: 'anInfo', text: t(st.reason === 'checkmate' ? 'anNoMovesMate' : 'anNoMovesStalemate') };
        window.scrollTo(0, 0);
        renderGame();
        break;
      }
    }
  });

  // Engine evaluation, from White's point of view, in words.
  function evalText(score, turn) {
    const MATE = Core.MATE;
    if (Math.abs(score) > MATE - 500) {
      const n = Math.max(1, Math.ceil((MATE - Math.abs(score)) / 2));
      const winner = score > 0 ? turn : turn ^ BLACK;
      return { num: (winner === WHITE ? '+' : '−') + 'M' + n, text: tf('mateFor', { side: sideName(winner), n }) };
    }
    const w = (turn === WHITE ? score : -score) / 100;
    let num = (w > 0.05 ? '+' : w < -0.05 ? '−' : '') + Math.abs(w).toFixed(1);
    if (state.lang === 'es') num = num.replace('.', ',');
    const a = Math.abs(w), side = sideName(w > 0 ? WHITE : BLACK);
    const text = a < 0.5 ? t('evalEqual') : tf(a < 1.5 ? 'evalSlightly' : a < 3 ? 'evalBetter' : 'evalWinning', { side });
    return { num, text };
  }

  function analysisBest() {
    if (state.mode !== 'analysis' || isEditing() || state.busy || state.over) return;
    const token = ++state.token;
    const fen = state.game.fen();
    state.busy = true;
    state.hint = null;
    state.strip = { kind: 'anThinking', limit: ANALYSIS_MS };
    renderGame();
    Engine.request({ type: 'explain', fen, moves: [], depth: 30, time: ANALYSIS_MS }).then(res => {
      if (token !== state.token || res.cancelled) return;
      state.busy = false;
      const g = new Core.Chess(fen);
      const results = res.results || [];
      const ex = results.length ? Coach.explainBest(g, results, res.threat, 30, state.lang, nl()) : null;
      if (!ex) { state.strip = null; renderGame(); return; }
      state.hint = { from: ex.from, to: ex.to };
      state.strip = { kind: 'anResult', ex, results: results.slice(0, 3), fen, depth: res.depth || 0, turn: g.turn };
      renderGame();
    });
  }

  function analysisResultHTML(s) {
    const g = new Core.Chess(s.fen), legal = g.moves();
    const key = 'an:' + s.fen;
    const rows = s.results.map((r, i) => {
      const ev = evalText(r.score, s.turn);
      return `<li class="${i === 0 ? 'best' : ''}"><span class="cand-move">${esc(san(g.san(r.move, legal)))}</span>` +
        `<span class="cand-num">${esc(ev.num)}</span><span class="cand-text">${esc(ev.text)}</span></li>`;
    }).join('');
    const body = s.ex.sentences.map(x => renderTokens(x)).join(' ');
    return `<div class="strip-line"><b>${esc(t('bestMoveIs'))}</b> <span class="strip-move">${esc(san(s.ex.san))}</span>` +
      (s.depth ? ` <span class="depth">${esc(tf('depthN', { n: s.depth }))}</span>` : '') + `</div>
      <ol class="cands">${rows}</ol>
      <div class="cpara" data-key="${esc(key)}"><p>${body}</p><div class="term-slot">${slotHTML(key)}</div></div>
      <div class="strip-actions">
        <button type="button" class="btn small primary" data-strip="anPlay">▶ ${esc(t('playIt'))}</button>
        <button type="button" class="btn small" data-strip="hide">${esc(t('close'))}</button>
      </div>`;
  }

  // ---------------------------------------------------------------- challenge statistics
  function renderChStats() {
    const s = chStats();
    const solvedN = Object.keys(s.solved).length;
    $('btnResetCh').disabled = !s.played && !solvedN;
    const body = $('chStatsBody');
    if (!s.played) { body.innerHTML = `<p class="empty">${esc(t('chStatsEmpty'))}</p>`; return; }
    const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
    let html = `<div class="stats-summary">` + tile('chSolvedCount', solvedN) + tile('chPlayed', s.played) +
      tile('chFirstTry', pct(s.first, s.played)) + tile('chStreak', s.cur) + tile('chBestStreak', s.best) + '</div>';
    const table = (title, keys, nameOf, obj) => `<div class="table-scroll"><table class="stats-table">` +
      `<tr><th>${esc(title)}</th><th>${esc(t('chPlayed'))}</th><th>${esc(t('chSolvedCol'))}</th><th>${esc(t('chFirstTry'))}</th></tr>` +
      keys.map(k => { const r = obj[k] || { p: 0, s: 0, f: 0 }; return `<tr><td>${esc(nameOf(k))}</td><td>${r.p}</td><td>${r.s}</td><td>${pct(r.f, r.p)}</td></tr>`; }).join('') +
      '</table></div>';
    html += table(t('chCategory'), CATS, k => t(CAT_NAME[k]), s.cat);
    html += table(t('level'), [0, 1, 2, 3, 4], k => t(LEVEL_KEY[LEVELS[k]]), s.lvl);
    body.innerHTML = html;
  }
  $('btnResetCh').addEventListener('click', () => {
    ask('resetChTitle', t('resetChConfirm'), [
      { key: 'resetYes', cls: 'danger', fn: () => { store.remove('challengeStats'); store.remove('challengeDeck'); seenThisSession.clear(); renderStats(); toast('resetDone'); } },
      { key: 'cancel' }
    ]);
  });

  // ---------------------------------------------------------------- menu & setup
  function renderMenu() {
    const live = state.mode && gameInProgress();
    const s = live ? null : savedGame();
    const resumable = live || !!s;
    $('btnResume').hidden = !resumable;
    if (resumable) {
      const mode = live ? state.mode : s.mode, n = live ? state.moves.length : s.moves.length;
      $('resumeInfo').textContent = `${t(modeKey(mode))} · ${tf('moveN', { n: Math.ceil(n / 2) })}`;
    }
  }
  const modeKey = m => m === 'pvp' ? 'vsFriend' : m === 'cpu' ? 'modeAlone' : 'modeCoach';

  function renderSetup() {
    $('setupTitle').textContent = t(state.setupMode === 'learn' ? 'modeCoach' : 'modeAlone');
    document.querySelectorAll('#levelOptions button').forEach(b => b.classList.toggle('selected', b.dataset.level === robotSetup.level));
    document.querySelectorAll('#colorOptions button').forEach(b => b.classList.toggle('selected', b.dataset.color === robotSetup.color));
    $('levelDesc').textContent = t(LEVEL_KEY[robotSetup.level] + 'Desc');
    const cfg = clockConfig(state.setupMode);
    $('setupClockNote').textContent = state.setupMode === 'learn' ? t('clockNoteCoach') :
      cfg ? tf('clockNoteOn', { tc: `${cfg.base}+${cfg.inc}` }) : t('clockNoteOff');
  }
  $('levelOptions').addEventListener('click', e => {
    const b = e.target.closest('[data-level]');
    if (b) { robotSetup.level = b.dataset.level; store.set('robotSetup', robotSetup); renderSetup(); }
  });
  $('colorOptions').addEventListener('click', e => {
    const b = e.target.closest('[data-color]');
    if (b) { robotSetup.color = b.dataset.color; store.set('robotSetup', robotSetup); renderSetup(); }
  });
  $('btnStart').addEventListener('click', () => confirmNewGame(() => startGame(state.setupMode)));

  // ---------------------------------------------------------------- settings screen
  function seg(name, options, current) {
    return `<div class="seg" data-setting="${name}">` + options.map(([v, label, extra]) =>
      `<button type="button" data-value="${esc(String(v))}" class="${String(v) === String(current) ? 'selected' : ''}">${extra || ''}${esc(label)}</button>`).join('') + '</div>';
  }
  function toggle(name, labelKey) {
    return `<label class="switch-row"><span>${esc(t(labelKey))}</span>
      <input type="checkbox" data-toggle="${name}" ${settings[name] ? 'checked' : ''}><span class="switch" aria-hidden="true"></span></label>`;
  }

  function renderSettings() {
    const c = settings.clock;
    const cur = !c ? 'off' : CLOCK_PRESETS.some(([b, i]) => b === c.base && i === c.inc) && !settings.clockCustom ? `${c.base}+${c.inc}` : 'custom';
    const clockOpts = [['off', t('clockOff')], ...CLOCK_PRESETS.map(([b, i]) => [`${b}+${i}`, `${b}+${i}`]), ['custom', t('clockCustom')]];
    const themes = [['brown', t('boardBrown')], ['green', t('boardGreen')], ['blue', t('boardBlue')], ['gray', t('boardGray')]]
      .map(([v, l]) => [v, l, `<span class="board-swatch b-${v}" aria-hidden="true"></span>`]);
    $('settingsBody').innerHTML = `
      <section class="set-group">
        <h3>⏱ ${esc(t('secClock'))}</h3>
        ${seg('clock', clockOpts, cur)}
        <div class="custom-clock" ${cur === 'custom' ? '' : 'hidden'}>
          <label>${esc(t('minutes'))} <input type="number" min="1" max="180" step="1" id="clockBase" value="${c ? c.base : 10}"></label>
          <label>${esc(t('increment'))} <input type="number" min="0" max="60" step="1" id="clockInc" value="${c ? c.inc : 0}"></label>
        </div>
        <p class="hint-text">${esc(t('clockApplies'))}</p>
      </section>
      <section class="set-group">
        <h3>♟ ${esc(t('secBoard'))}</h3>
        <div class="field-label">${esc(t('boardColors'))}</div>
        ${seg('boardTheme', themes, settings.boardTheme)}
        ${toggle('coords', 'optCoords')}
        ${toggle('showLegal', 'optLegal')}
        ${toggle('showLast', 'optLast')}
        ${toggle('autoQueen', 'optAutoQueen')}
        ${toggle('confirmTouch', 'optConfirm')}
        ${toggle('autoFlip', 'optAutoFlip')}
      </section>
      <section class="set-group">
        <h3>⚙ ${esc(t('secGeneral'))}</h3>
        ${toggle('sound', 'optSound')}
        <div class="field-label">${esc(t('interfaceLang'))}</div>
        ${seg('lang', [['en', 'English'], ['es', 'Español']], state.lang)}
        <div class="field-label">${esc(t('notationLang'))}</div>
        ${seg('notation', [['auto', t('notationAuto')], ['en', 'English (K Q R B N)'], ['es', 'Español (R D T A C)']], settings.notation)}
        <div class="field-label">${esc(t('themeLabel'))}</div>
        ${seg('theme', [['system', t('themeSystem')], ['light', '☀ ' + t('themeLight')], ['dark', '☾ ' + t('themeDark')]], settings.theme)}
        <button type="button" class="btn danger" id="btnResetSettings">${esc(t('resetSettings'))}</button>
      </section>`;
  }

  $('settingsBody').addEventListener('click', e => {
    const b = e.target.closest('.seg[data-setting] button');
    if (b) {
      const name = b.parentElement.dataset.setting, v = b.dataset.value;
      if (name === 'clock') {
        if (v === 'off') { settings.clock = null; settings.clockCustom = false; }
        else if (v === 'custom') { settings.clockCustom = true; settings.clock = settings.clock || { base: 10, inc: 0 }; }
        else { const [base, inc] = v.split('+').map(Number); settings.clock = { base, inc }; settings.clockCustom = false; }
      } else if (name === 'lang') {
        setLang(v);
      } else {
        settings[name] = v;
      }
      saveSettings();
      applyTheme();
      renderSettings();
      return;
    }
    if (e.target.id === 'btnResetSettings') {
      ask('resetSettingsTitle', t('resetSettingsText'), [
        { key: 'resetSettings', cls: 'danger', fn: () => {
          Object.keys(settings).forEach(k => delete settings[k]);
          Object.assign(settings, DEFAULT_SETTINGS);
          saveSettings(); applyTheme(); Sound.setEnabled(settings.sound); renderSettings(); toast('settingsReset');
        } },
        { key: 'cancel' }
      ]);
    }
  });
  $('settingsBody').addEventListener('change', e => {
    const tg = e.target.dataset.toggle;
    if (tg) {
      settings[tg] = e.target.checked;
      if (tg === 'sound') Sound.setEnabled(settings.sound);
      saveSettings();
      return;
    }
    if (e.target.id === 'clockBase' || e.target.id === 'clockInc') {
      const base = Math.min(180, Math.max(1, parseInt($('clockBase').value, 10) || 10));
      const inc = Math.min(60, Math.max(0, parseInt($('clockInc').value, 10) || 0));
      settings.clock = { base, inc };
      settings.clockCustom = true;
      saveSettings();
      renderSettings();
    }
  });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    state.lang = l;
    store.set('lang', l);
    applyLanguage();
  }
  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.title = t('appTitle');
    $('langToggle').setAttribute('aria-checked', state.lang === 'es');
    renderScreen();
    renderFacts();
    renderInstall();
  }
  $('langToggle').addEventListener('click', () => setLang(state.lang === 'en' ? 'es' : 'en'));

  // ---------------------------------------------------------------- statistics
  function loadStats() {
    const list = store.get('stats', []);
    return Array.isArray(list) ? list : [];
  }

  function recordGame(over) {
    const winner = over.winner === WHITE || over.winner === BLACK ? over.winner : null;
    const rec = { mode: state.mode, reason: over.reason, plies: state.moves.length, date: Date.now() };
    if (isRobotGame()) {
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
  const tile = (k, v) => `<div class="stat-tile"><div class="v">${v}</div><div class="k">${esc(t(k))}</div></div>`;

  function renderStats() {
    renderChStats();
    document.querySelectorAll('#statsColor button').forEach(b => b.classList.toggle('selected', b.dataset.scolor === state.statsColor));
    const all = loadStats();
    const coach = Object.assign({ great: 0, accurate: 0, good: 0, blunder: 0, bestUsed: 0 }, store.get('coachStats', {}));
    const coachTotal = coach.great + coach.accurate + coach.good + coach.blunder;
    const vsRobot = all.filter(x => x.mode === 'cpu' || x.mode === 'learn');
    const shown = state.statsColor === 'all' ? vsRobot : vsRobot.filter(x => x.color === state.statsColor);
    const body = $('statsBody');
    $('btnResetStats').disabled = !all.length && !coachTotal && !coach.bestUsed;
    if (!all.length && !coachTotal && !coach.bestUsed) { body.innerHTML = `<p class="empty">${esc(t('statsEmpty'))}</p>`; return; }

    const o = tally(shown);
    let html = `<div class="stats-section"><h3>${esc(t('overall'))}</h3><div class="stats-summary">` +
      tile('played', o.played) + tile('wins', o.win) + tile('losses', o.loss) + tile('draws', o.draw) +
      tile('winPct', o.played ? Math.round(o.win / o.played * 100) + '%' : '—') + '</div></div>';

    for (const mode of ['cpu', 'learn']) {
      const recs = shown.filter(x => x.mode === mode);
      html += `<div class="stats-section"><h3>${esc(t(modeKey(mode)))}</h3><div class="table-scroll"><table class="stats-table">` +
        resultHead(t('level')) +
        LEVELS.map(l => resultRow(esc(t(LEVEL_KEY[l])), tally(recs.filter(x => x.level === l)))).join('') +
        resultRow(esc(t('total')), tally(recs), 'total') + '</table></div></div>';
    }

    html += `<div class="stats-section"><h3>${esc(t('byColor'))}</h3><div class="table-scroll"><table class="stats-table">` +
      resultHead(t('playAs')) +
      resultRow(`<span class="swatch w"></span> ${esc(t('white'))}`, tally(vsRobot.filter(x => x.color === 'w'))) +
      resultRow(`<span class="swatch b"></span> ${esc(t('black'))}`, tally(vsRobot.filter(x => x.color === 'b'))) +
      '</table></div></div>';

    html += `<div class="stats-section"><h3>${esc(t('coachCounts'))}</h3><div class="stats-summary">` +
      tile('lbl_great', coach.great) + tile('lbl_accurate', coach.accurate) + tile('lbl_good', coach.good) +
      tile('lbl_blunder', coach.blunder) + tile('bestUsedCount', coach.bestUsed) + '</div></div>';

    const pvp = tally(all.filter(x => x.mode === 'pvp'));
    html += `<div class="stats-section"><h3>${esc(t('vsFriend'))}</h3><div class="table-scroll"><table class="stats-table">` +
      `<tr><th>${esc(t('played'))}</th><th>${esc(t('whiteWins'))}</th><th>${esc(t('blackWins'))}</th><th>${esc(t('draws'))}</th></tr>` +
      `<tr><td>${pvp.played}</td><td>${pvp.white}</td><td>${pvp.black}</td><td>${pvp.draw}</td></tr></table></div></div>`;
    body.innerHTML = html;
  }

  $('statsColor').addEventListener('click', e => {
    const b = e.target.closest('[data-scolor]');
    if (b) { state.statsColor = b.dataset.scolor; renderStats(); }
  });
  $('btnResetStats').addEventListener('click', () => {
    ask('resetStatsTitle', t('resetConfirm'), [
      { key: 'resetYes', cls: 'danger', fn: () => { store.set('stats', []); store.remove('coachStats'); renderStats(); toast('resetDone'); } },
      { key: 'cancel' }
    ]);
  });

  // ---------------------------------------------------------------- did you know?
  // Facts are dealt from a shuffled deck (kept in localStorage), so none
  // repeats until every fact has been shown.
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

  // ---------------------------------------------------------------- glossary
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function renderGlossary() {
    const q = norm($('glossarySearch').value.trim());
    const items = Object.keys(TERMS).map(id => ({ id, name: cap(TERMS[id][state.lang].n) }))
      .filter(x => !q || norm(x.name).includes(q) || norm(TERMS[x.id][state.lang].d).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, state.lang, { sensitivity: 'base' }));
    let html = '', letter = '';
    for (const it of items) {
      const l = norm(it.name).charAt(0).toUpperCase();
      if (l !== letter) { letter = l; html += `<div class="gl-letter">${esc(l)}</div>`; }
      const key = 'g:' + it.id, cat = TERMS[it.id].cat;
      const open = (state.openTerms.get(key) || []).includes(it.id);
      html += `<div class="gl-item" data-key="${key}">
        <div class="gl-head"><span class="gl-name">${esc(it.name)}</span><span class="chip ${cat}">${esc(t(CAT_KEY[cat]))}</span>
        <button type="button" class="term-btn${open ? ' open' : ''}" data-term="${it.id}" aria-expanded="${open}" aria-label="${esc(it.name)}">▼</button></div>
        <div class="term-slot">${slotHTML(key)}</div></div>`;
    }
    $('glossaryList').innerHTML = html;
  }
  $('glossarySearch').addEventListener('input', renderGlossary);

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
    if (!$('toast').hidden && $('toast').dataset.key) $('toastText').textContent = t($('toast').dataset.key);
    if ($('toastAction').dataset.key) $('toastAction').textContent = t($('toastAction').dataset.key);
  }

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
      renderInstall();
      openModal('installModal');
    }
  });
  window.addEventListener('offline', () => { if ($('toastAction').hidden || $('toast').hidden) toast('offlineNow'); });
  // Phones may close a backgrounded app: keep the game (and clocks) saved.
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });

  if (canServiceWorker) {
    let reloadOffered = false; // show the "new version" notice only once
    const offerReload = () => {
      if (reloadOffered) return;
      reloadOffered = true;
      toast('updateReady', 'reload', () => { hideToast(); saveGame(); location.reload(); });
    };
    let switching = false;
    const offerSwitch = worker => toast('updateReady', 'reload', () => {
      hideToast();
      saveGame();
      switching = true;
      worker.postMessage('skipWaiting');
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (switching) { switching = false; location.reload(); }
    });
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'updated') offerReload();
    });

    window.addEventListener('load', async () => {
      // Clean-up: a worker of this app registered with any other scope, and
      // caches of earlier versions under other names. Other apps' workers
      // (scripts outside this folder) and caches are never touched.
      try {
        const scope = new URL('./', location.href).href;
        for (const r of await navigator.serviceWorker.getRegistrations()) {
          const script = (r.active || r.waiting || r.installing || {}).scriptURL || '';
          if (r.scope !== scope && script.startsWith(scope)) await r.unregister();
        }
        if (window.caches) for (const k of await caches.keys()) if (k.startsWith('chesscoach')) await caches.delete(k);
      } catch (e) { /* ignore */ }
      const firstInstall = !navigator.serviceWorker.controller;
      // Scope './' = this app's own folder (/Chess-project/ on GitHub Pages),
      // so the worker never controls other apps on the same domain.
      navigator.serviceWorker.register('sw.js', { scope: './' }).then(reg => {
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
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      }).catch(err => console.warn('Offline mode unavailable:', err));
    });
  }

  // ---------------------------------------------------------------- start
  buildBoard();
  Engine.init();
  Sound.setEnabled(settings.sound);
  applyTheme();
  nextFact();
  applyLanguage();
  show('menu', false);
})();
