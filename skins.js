'use strict';

// Visual skins. Loaded before game.js; game.js delegates drawBlock/drawGrid to the active skin.
// Each skin: palette (index 1-8), gridColor, and a block(ctx, px, py, size, color, alpha) function
// where (px, py) is the top-left pixel of the cell.

const SKIN_STORAGE_KEY = 'tetris.skin';

const SKINS = {
  retro: {
    palette: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d', '#90a4ae'],
    gridColor: '#22222e',
    block(ctx, px, py, size, color) {
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(px + 1, py + 1, size - 2, 4);
    },
  },

  neon: {
    palette: [null, '#00f0ff', '#fff200', '#d400ff', '#39ff14', '#ff2a4d', '#4d6bff', '#ff9500', '#c0c8d0'],
    gridColor: '#14142a',
    block(ctx, px, py, size, color) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 3, py + 3, size - 6, size - 6);
      ctx.fillStyle = color;
      ctx.globalAlpha *= 0.35;
      ctx.fillRect(px + 3, py + 3, size - 6, size - 6);
    },
  },

  pastel: {
    palette: [null, '#a8e6ef', '#fff1b8', '#e1c4f0', '#c5eccb', '#f8c4c4', '#c5cbf0', '#fbd9b0', '#cfd8dc'],
    gridColor: '#4a4262',
    block(ctx, px, py, size, color) {
      const r = size * 0.28;
      const x = px + 1, y = py + 1, w = size - 2, h = size - 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(x + r, y + 3, w - 2 * r, 3);
    },
  },

  pixel: {
    palette: [null, '#29adff', '#ffec27', '#c04cf0', '#00e436', '#ff004d', '#5f6fff', '#ffa300', '#83769c'],
    gridColor: '#1d1d2b',
    block(ctx, px, py, size, color) {
      const u = size / 6; // 6x6 "pixel" grid inside the block
      ctx.fillStyle = color;
      ctx.fillRect(px, py, size, size);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; // top/left bevel
      ctx.fillRect(px, py, size, u);
      ctx.fillRect(px, py, u, size);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; // bottom/right bevel
      ctx.fillRect(px, py + size - u, size, u);
      ctx.fillRect(px + size - u, py, u, size);
      // checker texture in the interior
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 1; i < 5; i++)
        for (let j = 1; j < 5; j++)
          if ((i + j) % 2 === 0) ctx.fillRect(px + i * u, py + j * u, u, u);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(px + 2 * u, py + 2 * u, u, u);
    },
  },
};

let activeSkinName = 'retro';

function skinDrawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  const skin = SKINS[activeSkinName];
  context.save();
  context.globalAlpha = alpha ?? 1;
  skin.block(context, x * size, y * size, size, skin.palette[colorIndex], alpha ?? 1);
  context.restore(); // also resets shadowBlur/shadowColor/globalAlpha
}

function skinDrawGrid(context, cols, rows, size) {
  context.save();
  context.strokeStyle = SKINS[activeSkinName].gridColor;
  context.lineWidth = 0.5;
  for (let c = 1; c < cols; c++) {
    context.beginPath();
    context.moveTo(c * size, 0);
    context.lineTo(c * size, rows * size);
    context.stroke();
  }
  for (let r = 1; r < rows; r++) {
    context.beginPath();
    context.moveTo(0, r * size);
    context.lineTo(cols * size, r * size);
    context.stroke();
  }
  context.restore();
}

function applySkin(name, redraw) {
  if (!SKINS[name]) name = 'retro';
  activeSkinName = name;
  document.body.dataset.skin = name;
  const sel = document.getElementById('skin-select');
  if (sel) sel.value = name;
  if (redraw && typeof redrawAll === 'function') redrawAll();
}

(function initSkins() {
  let saved = null;
  try { saved = localStorage.getItem(SKIN_STORAGE_KEY); } catch (e) { /* ignore */ }
  applySkin(saved, false);
  const sel = document.getElementById('skin-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    applySkin(sel.value, true);
    try { localStorage.setItem(SKIN_STORAGE_KEY, activeSkinName); } catch (e) { /* ignore */ }
    sel.blur(); // don't steal game keys
  });
  // Game keys pressed while the select still has focus must not alter it
  sel.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
      sel.blur();
    }
  });
})();
