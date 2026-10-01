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
- When you publish changes, installed copies pick them up automatically the next time they open
  with an internet connection.

Offline mode and installing need the game to be served from a web address; opening `index.html`
straight from your disk still works for playing, but without those two extras.

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
manifest.webmanifest  app name, colors and icons for installing
sw.js            service worker: stores the app for offline use
icons/           app icons
pieces/cburnett/ chess piece images (see credits below)
```

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
