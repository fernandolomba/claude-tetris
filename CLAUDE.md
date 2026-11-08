# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla Tetris implementation — HTML5 Canvas + CSS + JavaScript (ES6+). No build step, no package manager, no dependencies (no `package.json`).

## Running

Open `index.html` directly in a browser, or serve statically:

```bash
python3 -m http.server 8000
# or
npx serve .
```

There is no test suite, linter, or build/watch process — verify changes by opening `index.html` (or the local server URL) in a browser and playing.

## Architecture

Three files, no modules/bundler — everything is loaded via plain `<script>`/`<link>` tags in `index.html`.

- **`index.html`** — DOM structure: `<canvas id="board">` (300×600, the 10×20 play field), a `<canvas id="next-canvas">` for the next-piece preview, the score/lines/level HUD, and the pause/game-over overlay. If `COLS`, `ROWS`, or `BLOCK` change in `game.js`, the board canvas's `width`/`height` attributes must be updated to match (`COLS × BLOCK`, `ROWS × BLOCK`).
- **`style.css`** — dark/retro arcade visual theme only; no layout logic that `game.js` depends on beyond element IDs.
- **`game.js`** — all game logic, single file, no classes, module-level `let`/`const` state (`board`, `current`, `next`, `score`, `lines`, `level`, etc.).

### Core model

- **Board**: `ROWS × COLS` matrix; each cell is `0` (empty) or a color index `1–7` identifying the locked piece type.
- **Pieces**: `PIECES` array of square matrices (index 0 unused/null, indices 1–7 are I/O/T/S/Z/J/L). Rotation (`rotateCW`) is a transpose + row-reverse, not per-shape rotation tables.
- **Collision** (`collide`): checks board bounds and overlap with locked cells for a given shape/offset.
- **Wall kicks** (`tryRotate`): after rotating, tries offsets `[0, -1, 1, -2, 2]` columns until one doesn't collide, else the rotation is discarded.
- **Game loop** (`loop`): driven by `requestAnimationFrame`; accumulates elapsed time and advances the piece one row when `dropAccum >= dropInterval`.
- **Line clears** (`clearLines`): scans bottom-up, splices full rows out and unshifts empty rows at the top.
- **Scoring**: `LINE_SCORES = [0, 100, 300, 500, 800]` multiplied by `level`; hard drop adds 2 pts/cell dropped, soft drop adds 1 pt/row.
- **Level/speed**: level increases every 10 lines; `dropInterval = max(100, 1000 - (level - 1) * 90)` ms.
- **Ghost piece** (`ghostY`): projects the current piece straight down to its landing row, drawn at `globalAlpha = 0.2`.

### Flow

```
init() → createBoard(), spawn() first piece, requestAnimationFrame(loop)
loop(ts) → accumulate dt → drop piece or lockPiece() when dropInterval exceeded → draw() → recurse via rAF
keydown → move / tryRotate / softDrop / hardDrop / togglePause (KeyP)
```

`spawn()` promotes `next` to `current` and generates a new `next`; if the new `current` immediately collides, `endGame()` fires and the Game Over overlay is shown.

## Tunable constants (in `game.js`)

`COLS`, `ROWS`, `BLOCK`, `COLORS`, `LINE_SCORES`, `dropInterval` (initial value, set in `init()`).
