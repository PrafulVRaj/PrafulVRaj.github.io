/* ═══════════════════════════════════════════════════
   windows.js  —  Window open/close/min/max/drag/resize
═══════════════════════════════════════════════════ */

const WIN_IDS = ['about','projects','skills','contact','games','snake','minesweeper','tictactoe','flappybird','chess','musicplayer','mediaplayer'];

/* state map: id → { open, minimized, maximized, savedRect } */
const winState = {};
WIN_IDS.forEach(id => {
  winState[id] = { open: false, minimized: false, maximized: false, savedRect: null };
});

let zCounter   = 100;
let focusedWin = null;

/* ── Helpers ───────────────────────────────────── */
function getWinEl(id) {
  return document.getElementById('win-' + id);
}

/* ── Focus ─────────────────────────────────────── */
function bringFocus(id) {
  if (focusedWin && focusedWin !== id) {
    getWinEl(focusedWin)?.classList.remove('focused');
    document.getElementById('tb-' + focusedWin)?.classList.remove('focused-app');
  }
  focusedWin = id;
  getWinEl(id).style.zIndex = ++zCounter;
  getWinEl(id).classList.add('focused');
  document.getElementById('tb-' + id)?.classList.add('focused-app');
  updateTaskbarDots();
}

/* ── Open ──────────────────────────────────────── */
function openWin(id) {
  const el = getWinEl(id);
  const st = winState[id];

  if (!st.open) {
    el.classList.remove('hidden');
    el.classList.add('is-opening');
    el.addEventListener('animationend', () => el.classList.remove('is-opening'), { once: true });
    st.open = true;
    st.minimized = false;
  } else if (st.minimized) {
    el.classList.remove('hidden');
    el.classList.add('is-restoring');
    el.addEventListener('animationend', () => el.classList.remove('is-restoring'), { once: true });
    st.minimized = false;
  }

  bringFocus(id);
  updateTaskbarDots();

  /* trigger skill bar animation when skills window opens */
  if (id === 'skills') setTimeout(animateSkillBars, 120);

  /* mount canvas/audio logic on first open */
  const LAZY = ['snake','minesweeper','tictactoe','flappybird','chess','musicplayer','mediaplayer'];
  if (LAZY.includes(id)) setTimeout(() => mountGameOnOpen(id), 80);
}

/* ── Close ─────────────────────────────────────── */
function closeWin(id) {
  const el = getWinEl(id);
  el.classList.add('is-closing');
  el.addEventListener('animationend', () => {
    el.classList.remove('is-closing');
    el.classList.add('hidden');
    winState[id].open      = false;
    winState[id].minimized = false;
    if (focusedWin === id) focusedWin = null;
    updateTaskbarDots();
  }, { once: true });
}

/* ── Minimise ──────────────────────────────────── */
function minWin(id) {
  const el = getWinEl(id);
  el.classList.add('is-minimizing');
  el.addEventListener('animationend', () => {
    el.classList.remove('is-minimizing');
    el.classList.add('hidden');
    winState[id].minimized = true;
    if (focusedWin === id) focusedWin = null;
    updateTaskbarDots();
  }, { once: true });
}

/* ── Maximise toggle ───────────────────────────── */
function toggleMaxWin(id) {
  const el = getWinEl(id);
  const st = winState[id];

  if (!st.maximized) {
    st.savedRect = {
      left: el.style.left, top: el.style.top,
      width: el.style.width, height: el.style.height,
    };
    el.classList.add('maximized');
    st.maximized = true;
  } else {
    el.classList.remove('maximized');
    const r = st.savedRect;
    el.style.left   = r.left;
    el.style.top    = r.top;
    el.style.width  = r.width;
    el.style.height = r.height;
    st.maximized = false;
  }
}

/* ── Taskbar click: toggle show/minimise ───────── */
function toggleWinFromTaskbar(id) {
  const st = winState[id];
  if (!st.open || st.minimized) {
    openWin(id);
  } else if (focusedWin === id) {
    minWin(id);
  } else {
    bringFocus(id);
  }
}

/* ── Init drag on all titlebars ────────────────── */
function initDrag() {
  document.querySelectorAll('.win-bar').forEach(bar => {
    const id = bar.dataset.win;

    bar.addEventListener('mousedown', e => {
      if (e.target.closest('.wc-btn')) return;
      if (winState[id]?.maximized)     return;

      bringFocus(id);
      const el = getWinEl(id);
      const ox = e.clientX, oy = e.clientY;
      const sl = el.offsetLeft, st2 = el.offsetTop;

      const onMove = ev => {
        el.style.left = (sl + ev.clientX - ox) + 'px';
        el.style.top  = (st2 + ev.clientY - oy) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
      e.preventDefault();
    });

    /* double-click titlebar = max/restore */
    bar.addEventListener('dblclick', e => {
      if (!e.target.closest('.wc-btn')) toggleMaxWin(bar.dataset.win);
    });
  });
}

/* ── Init resize handles ───────────────────────── */
function initResize() {
  document.querySelectorAll('.win-resize').forEach(handle => {
    const el = handle.closest('.win');
    handle.addEventListener('mousedown', e => {
      const sw = el.offsetWidth, sh = el.offsetHeight;
      const sx = e.clientX,      sy = e.clientY;

      const onMove = ev => {
        el.style.width  = Math.max(300, sw + ev.clientX - sx) + 'px';
        el.style.height = Math.max(200, sh + ev.clientY - sy) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
      e.preventDefault();
    });
  });
}

/* ── Click on window = focus ───────────────────── */
function initWindowFocus() {
  WIN_IDS.forEach(id => {
    getWinEl(id)?.addEventListener('mousedown', () => bringFocus(id));
  });
}
