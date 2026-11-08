'use strict';

// Menú de pausa. game.js llama a onPauseChange(paused) desde togglePause().
const pauseMenu = document.getElementById('pause-menu');
const pauseResumeBtn = document.getElementById('pause-resume');
const pauseRestartBtn = document.getElementById('pause-restart');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseControlsList = document.getElementById('pause-controls');
const pauseLevelSelect = document.getElementById('pause-start-level');

for (let i = 1; i <= 10; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = i;
  pauseLevelSelect.appendChild(opt);
}
pauseLevelSelect.value = startLevel;

function onPauseChange(isPaused) {
  if (isPaused) {
    pauseControlsList.classList.add('hidden');
    pauseControlsBtn.setAttribute('aria-expanded', 'false');
    pauseMenu.classList.remove('hidden');
    pauseResumeBtn.focus();
  } else {
    pauseMenu.classList.add('hidden');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
}

pauseResumeBtn.addEventListener('click', () => { if (paused) togglePause(); });

pauseRestartBtn.addEventListener('click', () => {
  startLevel = parseInt(pauseLevelSelect.value, 10) || 1;
  pauseMenu.classList.add('hidden');
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  init(); // reinicia sin recargar; init() reinicia lastTime
});

pauseControlsBtn.addEventListener('click', () => {
  const show = pauseControlsList.classList.toggle('hidden') === false;
  pauseControlsBtn.setAttribute('aria-expanded', String(show));
});
