/* ═══════════════════════════════════════════════════
   ui.js  —  Taskbar dots, start menu, context menu,
             wallpaper, toasts, clock, live stats, dock magnify
═══════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════
   TASKBAR DOT UPDATES
══════════════════════════════════════════════════ */
function updateTaskbarDots() {
  const MAP = {
    about:'dock-about', projects:'dock-projects', skills:'dock-skills', contact:'dock-contact',
    games:'dock-games', musicplayer:'dock-musicplayer', mediaplayer:'dock-mediaplayer',
  };
  WIN_IDS.forEach(id => {
    const btn = document.getElementById(MAP[id]);
    if (!btn) return;
    const st = winState[id];
    btn.classList.toggle('running',     st.open && !st.minimized);
    btn.classList.toggle('focused-app', focusedWin === id);
  });

  // Update active app name in top bar
  const appNames = {
    about:'About Me', projects:'Projects', skills:'Skills', contact:'Contact',
    games:'Games', snake:'Snake', minesweeper:'Minesweeper', tictactoe:'Tic Tac Toe',
    flappybird:'Flappy Bird', chess:'Chess', musicplayer:'Music Player', mediaplayer:'Media Player',
  };
  const activeEl = document.getElementById('tb-active-app');
  if (activeEl) {
    activeEl.textContent = focusedWin ? '—  ' + (appNames[focusedWin] || focusedWin) : '';
  }
}


/* ══════════════════════════════════════════════════
   START MENU
══════════════════════════════════════════════════ */
let smOpen = false;

function toggleStartMenu() {
  smOpen = !smOpen;
  document.getElementById('start-menu').classList.toggle('open', smOpen);
  const logo = document.getElementById('tb-arch-logo');
  if (logo) logo.style.background = smOpen ? 'rgba(255,255,255,0.10)' : '';
  if (smOpen) setTimeout(() => document.getElementById('sm-search').focus(), 150);
}

function openFromSM(id) {
  openWin(id);
  smOpen = false;
  document.getElementById('start-menu').classList.remove('open');
  const logo = document.getElementById('tb-arch-logo');
  if (logo) logo.style.background = '';
}

document.addEventListener('click', e => {
  if (smOpen && !e.target.closest('#start-menu') && !e.target.closest('#tb-arch-logo') && !e.target.closest('.tb-right-item')) {
    smOpen = false;
    document.getElementById('start-menu').classList.remove('open');
    const logo = document.getElementById('tb-arch-logo');
    if (logo) logo.style.background = '';
  }
  if (!e.target.closest('#ctx-menu') && !e.target.closest('.desk-icon')) closeCtx();
  if (!e.target.closest('.desk-icon')) {
    document.querySelectorAll('.desk-icon').forEach(d => d.classList.remove('selected'));
  }
});


/* ══════════════════════════════════════════════════
   RIGHT-CLICK CONTEXT MENU
══════════════════════════════════════════════════ */
const ctxMenu = document.getElementById('ctx-menu');

document.getElementById('desktop').addEventListener('contextmenu', e => {
  if (e.target.closest('.win') || e.target.closest('#topbar') || e.target.closest('#dock')) return;
  e.preventDefault();
  closeCtx();
  const x = Math.min(e.clientX, window.innerWidth  - 220);
  const y = Math.min(e.clientY, window.innerHeight - 320);
  ctxMenu.style.left = x + 'px';
  ctxMenu.style.top  = y + 'px';
  ctxMenu.style.transformOrigin = (e.clientX > window.innerWidth / 2 ? 'right' : 'left') + ' top';
  requestAnimationFrame(() => ctxMenu.classList.add('open'));
});

function closeCtx() { ctxMenu.classList.remove('open'); }

function ctxAction(type) {
  closeCtx();
  const msgs = { view:'Large icons enabled', sort:'Icons sorted by name', refresh:'Desktop refreshed ✓', settings:'Display settings — coming soon!' };
  showToast('✅', 'Action', msgs[type] || 'Done');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCtx();
    if (smOpen) toggleStartMenu();
    document.getElementById('wp-picker').classList.remove('open');
  }
  if (e.key === 'F5') { ctxAction('refresh'); e.preventDefault(); }
});


/* ══════════════════════════════════════════════════
   WALLPAPER
══════════════════════════════════════════════════ */
const WALLPAPERS = [
  { id:'bloom',    label:'Bloom',    style:'background:radial-gradient(ellipse 80% 60% at 30% 60%,rgba(0,120,212,0.7) 0%,transparent 55%),radial-gradient(ellipse 60% 70% at 75% 25%,rgba(138,43,226,0.55) 0%,transparent 50%),linear-gradient(135deg,#050818,#0d1525 50%,#1a0630)' },
  { id:'sunset',   label:'Sunset',   style:'background:radial-gradient(ellipse 90% 50% at 50% 100%,rgba(255,80,0,.7) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at 80% 30%,rgba(200,0,100,.4) 0%,transparent 50%),linear-gradient(180deg,#08001a,#1a0520 40%,#3d0c05)' },
  { id:'aurora',   label:'Aurora',   style:'background:radial-gradient(ellipse 100% 50% at 50% 0%,rgba(0,220,130,.5) 0%,transparent 55%),radial-gradient(ellipse 80% 60% at 10% 40%,rgba(0,120,212,.4) 0%,transparent 50%),linear-gradient(180deg,#001a10,#060d1a 60%,#0a0010)' },
  { id:'midnight', label:'Midnight', style:'background:radial-gradient(ellipse 60% 40% at 50% 50%,rgba(0,60,120,.5) 0%,transparent 70%),linear-gradient(135deg,#020408,#060c18)' },
  { id:'city',     label:'City',     style:'background:radial-gradient(ellipse 100% 55% at 20% 0%,rgba(220,100,80,.55) 0%,transparent 60%),radial-gradient(ellipse 80% 40% at 0% 30%,rgba(200,80,60,.40) 0%,transparent 55%),radial-gradient(ellipse 60% 50% at 70% 10%,rgba(120,80,160,.50) 0%,transparent 55%),radial-gradient(ellipse 100% 60% at 50% 100%,rgba(30,20,50,.80) 0%,transparent 60%),linear-gradient(185deg,#b06060 0%,#7a4a80 25%,#3a2860 55%,#1a1030 80%,#0a0818 100%)' },
];

let selectedWp = CONFIG.defaultWallpaper;

function initWallpaperPicker() {
  const grid = document.getElementById('wp-grid');
  WALLPAPERS.forEach(wp => {
    const s = document.createElement('div');
    s.className     = 'wp-swatch' + (wp.id === selectedWp ? ' selected' : '');
    s.style.cssText = wp.style;
    s.dataset.id    = wp.id;
    s.innerHTML     = `<div class="wp-swatch-label">${wp.label}</div>`;
    s.onclick = () => {
      selectedWp = wp.id;
      grid.querySelectorAll('.wp-swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
    };
    grid.appendChild(s);
  });
  applyWallpaperById(selectedWp, false);
}

function openWpPicker()  { closeCtx(); document.getElementById('wp-picker').classList.add('open'); }
function closeWpPicker() { document.getElementById('wp-picker').classList.remove('open'); }
function closeWpPickerBg(e) { if (e.target === document.getElementById('wp-picker')) closeWpPicker(); }

function applyWallpaper() { applyWallpaperById(selectedWp, true); closeWpPicker(); }

function applyWallpaperById(id, animate) {
  const wp = WALLPAPERS.find(w => w.id === id);
  if (!wp) return;
  const el = document.getElementById('wallpaper');
  if (animate) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.cssText = wp.style + ';position:absolute;inset:0;z-index:0;transition:opacity 0.4s;';
      el.style.opacity = '1';
      showToast('🖼️','Wallpaper Changed',`Applied "${wp.label}"`);
    }, 300);
  } else {
    el.style.cssText = wp.style + ';position:absolute;inset:0;z-index:0;';
  }
}


/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
let _toastId = 0;
function showToast(icon, title, body) {
  const area = document.getElementById('toast-area');
  const div  = document.createElement('div');
  div.className = 'toast';
  div.id = 'toast-' + (++_toastId);
  div.innerHTML = `<div class="toast-head"><span class="toast-icon">${icon}</span><span class="toast-title">${title}</span></div><div class="toast-body">${body}</div>`;
  div.onclick = () => dismissToast(div);
  area.appendChild(div);
  setTimeout(() => dismissToast(div), 4000);
}
function dismissToast(el) {
  if (!el.parentNode) return;
  el.classList.add('toast-out');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}


/* ══════════════════════════════════════════════════
   CLOCK  (top bar — short format)
══════════════════════════════════════════════════ */
function initClock() {
  function tick() {
    const n = new Date();
    const timeStr = n.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
    const dateStr = n.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    const timeEl = document.getElementById('clk-time');
    const dateEl = document.getElementById('clk-date-short');
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
  }
  tick();
  setInterval(tick, 1000);
}


/* ══════════════════════════════════════════════════
   SIMULATED LIVE STATS
   (Randomised to feel live — replace with real APIs if needed)
══════════════════════════════════════════════════ */
function initLiveStats() {
  let cpu  = 3;
  let ram  = 1.2;
  let temp = 45;
  let batt = 59;

  function updateStats() {
    /* gentle random walk */
    cpu  = Math.max(1,  Math.min(99, cpu  + (Math.random() * 4 - 2)));
    ram  = Math.max(0.8,Math.min(8,  ram  + (Math.random() * 0.1 - 0.05)));
    temp = Math.max(30, Math.min(90, temp + (Math.random() * 2  - 1)));
    batt = Math.max(5,  Math.min(100,batt - 0.01));  // slowly drain

    const cpuEl  = document.getElementById('stat-cpu');
    const ramEl  = document.getElementById('stat-ram');
    const tempEl = document.getElementById('stat-temp');
    const battEl = document.getElementById('batt-pct');
    const fillEl = document.getElementById('batt-fill');

    if (cpuEl)  cpuEl.textContent  = Math.round(cpu) + '%';
    if (ramEl)  ramEl.textContent  = ram.toFixed(1) + 'GB';
    if (tempEl) tempEl.textContent = Math.round(temp) + '°C';
    if (battEl) battEl.textContent = Math.round(batt) + '%';
    if (fillEl) fillEl.style.width = Math.round(batt) + '%';

    /* color batt red when low */
    if (fillEl) {
      fillEl.style.background = batt < 20 ? '#f38ba8' : batt < 40 ? '#f9e2af' : '#a6e3a1';
    }
  }

  updateStats();
  setInterval(updateStats, 2500);
}


/* ══════════════════════════════════════════════════
   DOCK MAGNIFY  (macOS-style neighbor scale)
══════════════════════════════════════════════════ */
function initDockMagnify() {
  const dock = document.getElementById('dock');
  if (!dock) return;
  const btns = Array.from(dock.querySelectorAll('.dock-btn'));

  dock.addEventListener('mousemove', e => {
    const hoveredBtn = e.target.closest('.dock-btn');
    if (!hoveredBtn) { clearMagnify(btns); return; }

    const idx = btns.indexOf(hoveredBtn);
    btns.forEach((btn, i) => {
      btn.classList.remove('neighbor-1', 'neighbor-2');
      const dist = Math.abs(i - idx);
      if (dist === 1) btn.classList.add('neighbor-1');
      else if (dist === 2) btn.classList.add('neighbor-2');
    });
  });

  dock.addEventListener('mouseleave', () => clearMagnify(btns));
}

function clearMagnify(btns) {
  btns.forEach(b => b.classList.remove('neighbor-1', 'neighbor-2'));
}
