/* ═══════════════════════════════════════════════════
   loading.js  —  Post-login Windows 11 loading screen
   Sequence: login → loading screen → desktop
═══════════════════════════════════════════════════ */

/* Messages Windows 11 shows during startup */
const LOADING_MESSAGES = [
  'Hi.',
  'Getting things ready',
  'Setting up your portfolio',
  'Loading your projects',
  'Almost there',
  'Just a moment',
];

let _ldClockTimer = null;

/* ── Show the loading screen ───────────────────── */
function showLoadingScreen(onComplete) {
  const screen   = document.getElementById('loading-screen');
  const greeting = document.getElementById('ld-greeting');

  /* Snap visible immediately — no fade-in so there's zero white gap */
  screen.style.transition = 'none';
  screen.style.opacity    = '1';
  screen.style.pointerEvents = 'all';
  screen.classList.add('visible');

  /* start the big clock */
  startLoadingClock();

  /* show greeting with a slight delay */
  setTimeout(() => greeting.classList.add('show'), 200);

  /* cycle through status messages */
  let msgIndex = 0;
  const msgEl    = document.getElementById('ld-msg-inner');
  const messages = LOADING_MESSAGES.slice(1); /* skip "Hi." — that's the greeting */

  msgEl.textContent = messages[0];

  const msgInterval = setInterval(() => {
    /* swap out message with fade */
    msgEl.classList.add('swapping');
    setTimeout(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      msgEl.textContent = messages[msgIndex];
      msgEl.classList.remove('swapping');
    }, 300);
  }, 1800);

  /* Total loading duration — feels like Windows (~4s) */
  setTimeout(() => {
    clearInterval(msgInterval);
    stopLoadingClock();
    dismissLoadingScreen(onComplete);
  }, 4200);
}

/* ── Dismiss loading screen → reveal desktop ───── */
function dismissLoadingScreen(onComplete) {
  const screen = document.getElementById('loading-screen');
  screen.classList.add('fade-out');
  screen.addEventListener('transitionend', () => {
    screen.style.display = 'none';
    if (onComplete) onComplete();
  }, { once: true });
}

/* ── Live clock inside loading screen ─────────── */
function startLoadingClock() {
  const timeEl = document.getElementById('ld-clock-time');
  const dateEl = document.getElementById('ld-clock-date');

  function tickLoading() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month:   'long',
      day:     'numeric',
    });
  }

  tickLoading();
  _ldClockTimer = setInterval(tickLoading, 1000);
}

function stopLoadingClock() {
  if (_ldClockTimer) {
    clearInterval(_ldClockTimer);
    _ldClockTimer = null;
  }
}
