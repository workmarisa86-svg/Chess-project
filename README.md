# Chess Coach ♞

A complete chess game that runs in any browser — no installation, no build step, no frameworks.
Just open `index.html`.

## Features

- **Main menu** (no board): Play, Challenge, Settings, Statistics and Glossary, plus **Resume game**
  when a game is in progress (it survives closing the app). The English/Español switch and the
  light/dark toggle are always in the top bar. A 💡 *Did you know?* fact sits under the buttons.
- **Play**
  - *Vs Friend*: two players on one device, with optional clocks and auto-flip.
  - *Vs Robot → Alone*: choose White, Black or Random and a level (Beginner, Easy, Medium, Hard,
    Impossible) and play with no feedback.
  - *Vs Robot → Coach*: the same, plus a quiet coach. After each of your moves it shows one label —
    **Great**, **Accurate**, **Good** or **Blunder**. After a blunder you can *Take back*, *Show best
    move* or *Keep my move*. The **Best move** button (your turn only) reveals the best move with an
    arrow and a 1–3 sentence explanation from the engine's analysis (what it wins, threatens or
    stops, named with the proper term and a ▼ glossary dropdown), and you choose whether to play it.
- **Board screen**: a large board with Flip, Undo and (in Coach) Best move; a ⋯ menu with New game,
  Offer draw and Resign; the ⌄ chevron returns to the menu (asking to keep the game, resign or
  cancel). Compact player bars with captured pieces and clocks, a collapsible move list, the gold
  highlight of the opponent's last move, legal-move and check highlights, and sounds.
- **Full chess rules**: castling, en passant, promotion, checkmate, stalemate, threefold repetition,
  the fifty-move rule and insufficient material; time-outs (a draw if the opponent can't mate),
  resignation and draws by agreement.
- **Settings**: clock (none, 1+0, 3+2, 5+0, 10+0, 15+10, 30+0 or custom), board colors, coordinates,
  legal-move and last-move highlights, auto-queen, confirm moves on touch screens, auto-flip, sound,
  notation language, interface language, theme, and Reset settings. Everything is saved.
- **Statistics**: results by mode, level and color, the coach's counts (Great, Accurate, Good,
  Blunder, and how often you used Best move) and the challenge statistics. Reset asks for confirmation.
- **Glossary**: every term the coach uses, alphabetical, with explanations and mini-board examples.
- **Challenge**: hundreds of puzzles in four categories — *Openings* (traps and punishing real opening
  mistakes), *Tactics* (forks, pins, skewers, discovered attacks, back-rank mates, deflection…),
  *Endgames* (basic mates, opposition, the rule of the square, pawn breakthroughs, king and pawn
  endings) and *Master games* (positions from famous games such as the Opera Game and the Immortal
  Game) — at five levels from Beginner to Impossible, with solved/total progress. The goal is shown
  above the board ("White to move · Mate in 2"). Play your move; in longer solutions the robot
  replies and you continue. A correct solution shows a short explanation, the theme (with a glossary
  dropdown), a *Did you know?* fact and, for master games, what was actually played. A wrong move
  offers *Try again*, *Hint* (highlights the piece to move) and *Show answer*. Optional timer, *Skip*,
  and random order without repeats until everything is solved. Every category has puzzles at every
  level: when you solve the last puzzle of a level, it says *Level complete* and offers *Next level*
  (the Challenge screen also ticks finished levels ✓ and shows a *Next level* button).
- **Analysis board** (inside Challenge): set up any position with a palette of pieces and an eraser,
  by typing (e.g. `Kg1 Rc3 Ph7 kg8`) or with a FEN (Copy/Paste). Clear, Start position, Flip, side to
  move and castling rights. Friendly checks (no pawns on the first/last rank, one king each, kings not
  touching, the side not to move can't be in check). **Best move** runs the engine in a Web Worker
  (progress bar, Cancel) and shows the best move with an arrow, the top three candidates with an
  evaluation, and why the best one works. Play it, keep exploring, Undo, or Edit again.
- **Challenge statistics**: puzzles solved, first-try accuracy, current and best streak, and results
  by category and level, with their own Reset.

## Install it and play offline

When the game is opened from a web address (such as the GitHub Pages link below), it works as an
installable app (a PWA):

- **After the first visit it works with no internet connection** — the app, the computer opponent,
  the coach and the glossary are all stored on the device.
- **Install button** (⬇ in the top bar):
  - *Chrome / Edge (computer or Android)*: opens the browser's install prompt.
  - *iPhone / iPad (Safari)*: shows how to use Share → *Add to Home Screen*.
  - *Safari on Mac*: shows how to use File → *Add to Dock*.
- Once installed it opens in its own window with the Chess Coach icon, like any other app.
- When you publish changes, installed copies download them in the background and show
  **"A new version is available — Reload"**, so players can switch whenever they like. Apps left
  open for a long time also check for updates every hour.

Offline mode and installing need the game to be served from a web address; opening `index.html`
straight from your disk still works for playing, but without those two extras.

### Sharing the domain with other apps

All GitHub Pages sites of one account share a domain (`<user>.github.io`), and with it the
browser's saved data. Chess Coach keeps strictly to its own space:

- the service worker, manifest `id`, `start_url` and `scope` are all limited to `/Chess-project/`
  (written as `./`, which the browser resolves relative to this folder);
- the service worker ignores every request outside `/Chess-project/`;
- saved settings and statistics use keys starting with `chess-coach.` (for example
  `chess-coach.stats`), and offline caches are named `chess-coach-v…`. Only those are ever
  read or deleted. Data saved by older versions under `chesscoach.` is moved over automatically.

If you add more apps on the same domain, give each one its own scope and its own name prefixes
too, and make sure their service workers only delete their own caches.

## Files

```
index.html       page layout
css/style.css    styles (responsive, light/dark)
js/core.js       chess rules, evaluation and search engine (also runs in a Web Worker)
js/i18n.js       interface text in English and Spanish
js/terms.js      glossary terms, openings and opening book
js/facts.js      "Did you know?" facts
js/coach.js      move ratings and best-move explanations
js/sound.js      board sounds (synthesized, no audio files)
js/app.js        board, controls, game flow, challenge and analysis board
data/challenges.js  the puzzles (loaded only when Challenge opens; cached for offline use)
tools/           Node.js scripts that generate and verify the puzzles (not used by the app)
manifest.webmanifest  app name, colors and icons for installing
sw.js            service worker: stores the app for offline use
icons/           app icons
pieces/cburnett/ chess piece images (see credits below)
```

## How the puzzles are made

The puzzles in `data/challenges.js` are generated and checked with the app's own engine by the
scripts in `tools/` (Node.js, not used by the app):

- `node tools/mine-tactics.js <seed> <minutes> <out.jsonl>` plays engine games with human-like
  mistakes and keeps the positions where a decisive tactic appears.
- `node tools/build-challenges.js <mined.jsonl...>` adds opening traps and punished opening
  mistakes, endgames and positions from famous games, verifies everything and writes the data file.

Every stored solution is replayed and must be legal, and at every step the solver's move must be
clearly the best one: a forced mate (and no equally fast alternative), the only move that holds a
draw, or a decisive margin over the second-best move. Positions that fail are discarded. The
explanations are written from the engine's analysis by the coach, in English and Spanish.

## Publish it with GitHub Pages

1. Push these files to the repository's default branch (for example `main`), with `index.html` at the root.
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch (`main`) and the folder **/ (root)**, then click **Save**.
5. Wait a minute or two. The page shows your link, e.g.
   `https://<your-username>.github.io/<repository-name>/`.

Every time you push changes to that branch, the site updates automatically.

## Credits

Chess pieces: the **cburnett** set by
**[Colin M.L. Burnett](https://en.wikipedia.org/wiki/User:Cburnett)**, licensed under the
**GNU GPL v2 or later** (as distributed by [Lichess](https://github.com/lichess-org/lila)).
The two bishops were modified: the cross on the mitre is replaced by the traditional diagonal
slit. The license text and details are in [`pieces/cburnett/`](pieces/cburnett/README.md).
