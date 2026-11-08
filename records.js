'use strict';

// Tabla de records local (localStorage). Depende de game.js solo a través de
// Records.onGameOver(score, lines, maxCombo) y Records.onRestart().
const Records = (() => {
  const KEY = 'tetris.records';
  const TOP_N = 5;
  const NAME_MAX = 12;

  const panelEl = document.getElementById('records-panel');
  const overlayEl = document.getElementById('overlay-records');

  let data = load();
  let highlight = -1;       // index in data.top of the entry just saved
  let pending = null;       // { score, lines } waiting for a name, or null
  let resetArmed = false;   // two-step reset confirmation

  function empty() {
    return { top: [], bestCombo: 0, maxLines: 0 };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const p = JSON.parse(raw);
      const top = Array.isArray(p.top) ? p.top : [];
      return {
        top: top
          .filter(e => e && Number.isFinite(e.score))
          .map(e => ({ name: String(e.name ?? '').slice(0, NAME_MAX), score: e.score, lines: Number(e.lines) || 0 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, TOP_N),
        bestCombo: Number(p.bestCombo) || 0,
        maxLines: Number(p.maxLines) || 0,
      };
    } catch (e) {
      return empty();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable: keep in memory only */ }
  }

  function qualifies(score) {
    if (score <= 0) return false;
    return data.top.length < TOP_N || score > data.top[data.top.length - 1].score;
  }

  function el(tag, text, cls) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }

  function renderTable() {
    const table = el('table');
    if (!data.top.length) {
      const tr = el('tr');
      tr.appendChild(el('td', 'Sin records todavía'));
      table.appendChild(tr);
    }
    data.top.forEach((e, i) => {
      const tr = el('tr', undefined, i === highlight ? 'new' : '');
      tr.appendChild(el('td', `${i + 1}.`));
      tr.appendChild(el('td', e.name || '---', 'name'));
      tr.appendChild(el('td', e.score.toLocaleString(), 'num'));
      table.appendChild(tr);
    });
    return table;
  }

  function renderInto(root, withEntry) {
    const oldInput = root.querySelector('input');
    const keepText = oldInput ? oldInput.value : '';
    const hadFocus = oldInput && document.activeElement === oldInput;
    root.textContent = '';
    if (withEntry && pending) {
      root.appendChild(el('div', '¡Nuevo record! Escribe tu nombre', 'qualify'));
      const row = el('div', undefined, 'row');
      const input = el('input');
      input.type = 'text';
      input.maxLength = NAME_MAX;
      input.placeholder = 'Nombre';
      input.autocomplete = 'off';
      const btn = el('button', 'Guardar');
      const submit = () => submitName(input.value);
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', ev => {
        ev.stopPropagation();
        if (ev.key === 'Enter') submit();
      });
      row.appendChild(input);
      row.appendChild(btn);
      root.appendChild(row);
      input.value = keepText;
      if (hadFocus) input.focus();
      else if (!keepText) {
        // Delay so keys still held from gameplay don't land in the field.
        setTimeout(() => { if (pending && input.isConnected) input.focus(); }, 600);
      }
    }
    root.appendChild(renderTable());
    root.appendChild(el('div', `Mejor combo: ${data.bestCombo}`, 'stat'));
    root.appendChild(el('div', `Líneas máx.: ${data.maxLines}`, 'stat'));

    const resetBtn = el('button', resetArmed ? '¿Seguro? Sí, borrar' : 'Resetear records');
    resetBtn.addEventListener('click', () => {
      if (!resetArmed) {
        resetArmed = true;
        render();
        return;
      }
      resetArmed = false;
      data = empty();
      highlight = -1;
      save();
      render();
    });
    const row = el('div', undefined, 'row');
    row.appendChild(resetBtn);
    if (resetArmed) {
      const cancel = el('button', 'Cancelar');
      cancel.addEventListener('click', () => { resetArmed = false; render(); });
      row.appendChild(cancel);
    }
    root.appendChild(row);
  }

  function render() {
    renderInto(panelEl, false);
    renderInto(overlayEl, true);
  }

  function submitName(raw) {
    if (!pending) return;
    const name = raw.trim().slice(0, NAME_MAX) || 'Anónimo';
    const entry = { name, score: pending.score, lines: pending.lines };
    // Insert after entries with an equal score (earlier records rank first).
    let idx = data.top.findIndex(e => e.score < entry.score);
    if (idx === -1) idx = data.top.length;
    data.top.splice(idx, 0, entry);
    data.top = data.top.slice(0, TOP_N);
    highlight = idx < TOP_N ? idx : -1;
    pending = null;
    save();
    render();
  }

  function onGameOver(score, lines, maxCombo) {
    resetArmed = false;
    highlight = -1;
    pending = qualifies(score) ? { score, lines } : null;
    if (maxCombo > data.bestCombo) data.bestCombo = maxCombo;
    if (lines > data.maxLines) data.maxLines = lines;
    save();
    render();
    overlayEl.hidden = false; // only shown on game over, not on the pause screen
  }

  function onRestart() {
    overlayEl.hidden = true;
    pending = null;
    highlight = -1;
    resetArmed = false;
    render();
  }

  overlayEl.hidden = true;
  render();
  return { onGameOver, onRestart };
})();
