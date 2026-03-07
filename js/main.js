/* ═══════════════════════════════════════════════════
   main.js  —  Initialisation & desktop-ready callback
   This is the glue that runs everything in order.
═══════════════════════════════════════════════════ */

/* Called by boot.js after login succeeds */
function onDesktopReady() {
  /* staggered window openings */
  setTimeout(() => { openWin('about'); }, 150);
  setTimeout(() => {
    openWin('projects');
    const el = document.getElementById('win-projects');
    el.style.left = '210px';
    el.style.top  = '100px';
  }, 320);

  showToast('👋', 'Welcome back, ' + CONFIG.user.name, 'Your portfolio desktop.');
}

/* Desktop icon single-click selection */
function selectIcon(el) {
  document.querySelectorAll('.desk-icon').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── Bootstrap ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  mountApps();           // apps.js  — render window content from config
  initWallpaperPicker(); // ui.js    — build wallpaper swatches
  initClock();           // ui.js    — start live clock
  initLiveStats();       // ui.js    — simulate CPU/RAM/temp/battery
  initDockMagnify();     // ui.js    — dock hover magnify effect
  initDrag();            // windows.js — drag handlers
  initResize();          // windows.js — resize handles
  initWindowFocus();     // windows.js — click-to-focus
});
