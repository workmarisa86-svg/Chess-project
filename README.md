# Chess Coach ♞

A complete chess game that runs in any browser — no installation, no build step, no frameworks.
Just open `index.html`.

## Features

- **Full chess rules**: legal moves only, check, checkmate, stalemate, castling, en passant,
  promotion (with a piece picker), threefold repetition, the fifty-move rule and insufficient material.
- **Click or drag** pieces (mouse or touch). The selected piece and its legal moves are highlighted.
- Turn indicator, **move list in algebraic notation**, captured pieces with material balance.
- The opponent's last move (the computer's, or the other player's) is highlighted in **gold**
  on both squares until the next move.
- **New Game**, **Undo Move** and **Flip board** buttons. Against the computer you choose to play
  **White, Black or Random**; as Black the board is flipped so your pieces are at the bottom.
- **Statistics**: every finished game is saved in the browser. See games played, wins, losses,
  draws and win % for each mode and difficulty, filter by the color you played, and reset
  (with confirmation).
- **"Did you know?"** 💡 chess facts on the new-game screen and after each game, with a
  *Next fact* button; facts don't repeat until all of them have been shown.
- **English / Español** switch (always visible in the top bar). Everything is translated, including
  the coach and the glossary, and the move list uses Spanish notation (R, D, T, A, C) in Spanish.
  The choice is remembered.
- **Play modes**
  1. *Two Players* on the same device.
  2. *Vs Computer* with five levels: Beginner, Easy, Medium, Hard and Impossible.
  3. *Learn Mode (Coach)*: play the computer while a coach explains every move:
     - names tactics (fork, pin, skewer, discovered attack/check, double check, double attack,
       deflection, decoy, zwischenzug, removing the defender, overloading, x-ray, back-rank mate,
       smothered mate, sacrifice, hanging pieces…),
     - rates your move: Brilliant, Great, Good, Inaccuracy, Mistake or Blunder,
     - tells you the better move you missed (by name) and what your opponent can do after a mistake,
     - explains the computer's moves and warns you about its threats,
     - recognizes openings (Italian Game, Sicilian Defense, Queen's Gambit and 40+ more),
     - mentions principles (center control, development, king safety, castling early, passed pawns…),
     - **Show me** draws the better move on the board, **Take back** lets you retry.
- **Term explanations**: every term the coach mentions has a ▼ button that opens a short explanation
  (what it is, why it's useful, an example) with a mini board showing the pattern.
- **Glossary** button with all terms in alphabetical order.

## Install it / play offline

Chess Coach is an installable app (PWA). After you open the published site once
(it needs `https://`, e.g. GitHub Pages), it is stored on the device and opens and plays
**without an internet connection**, on computers and phones. A short notice says
*"Ready to play offline"* when it's done.

- Tap **⬇ Install** in the top bar. Where the browser supports it (Chrome, Edge, Android),
  this opens the install prompt; otherwise it shows the steps (iPhone/iPad: Share →
  *Add to Home Screen*; Safari on Mac: File → *Add to Dock*).
- Installed, it opens full screen from its own knight icon.
- When a new version is published, a *"A new version is available — Reload"* notice appears.

Opening `index.html` straight from disk still works, but offline storage needs a web server.

**When you change any file**, bump `VERSION` at the top of `sw.js` (e.g. `'v1'` → `'v2'`)
so visitors get the new files. If you add a new file, add it to the `ASSETS` list there too.

## Files

```
index.html       page layout
css/style.css    styles (responsive, light/dark)
js/core.js       chess rules, evaluation and search engine (also runs in a Web Worker)
js/i18n.js       interface text in English and Spanish
js/terms.js      glossary terms, openings and opening book
js/facts.js      "Did you know?" facts
js/coach.js      move analysis and coach explanations
js/app.js        board, controls and game flow
js/pwa.js        install button, offline/update notices, service worker registration
sw.js            service worker: caches every file for offline play
manifest.webmanifest  app name, colors and icons for installing
icons/           app icons (SVG, PNG and maskable versions)
```

## Publish it with GitHub Pages

1. Push these files to the repository's default branch (for example `main`), with `index.html` at the root.
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch (`main`) and the folder **/ (root)**, then click **Save**.
5. Wait a minute or two. The page shows your link, e.g.
   `https://<your-username>.github.io/<repository-name>/`.

Every time you push changes to that branch, the site updates automatically.
