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
- **Statistics**: results by mode, level and color, plus the coach's counts (Great, Accurate, Good,
  Blunder, and how often you used Best move). Reset asks for confirmation.
- **Glossary**: every term the coach uses, alphabetical, with explanations and mini-board examples.
- **Challenge**: coming in the next update.

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
