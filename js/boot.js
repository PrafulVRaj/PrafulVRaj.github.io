/* ═══════════════════════════════════════════════════
   boot.js  —  Boot screen → Login screen flow
═══════════════════════════════════════════════════ */

const bootScreen  = document.getElementById('boot-screen');
const loginScreen = document.getElementById('login-screen');

let loginUser = CONFIG.loginUsers[0];

/* ── STEP 1: Click boot screen ─────────────────── */
function bootClick() {
  // Show and animate the progress bar
  const track = document.querySelector('.boot-progress-track');
  const bar   = document.getElementById('boot-progress-bar');
  track.classList.add('visible');

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;   // random chunky steps
    if (progress >= 100) {
      progress = 100;
      bar.style.width = '100%';
      clearInterval(interval);

      // Slight pause at 100%, then fade to login
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        bootScreen.addEventListener('transitionend', () => {
          bootScreen.style.display = 'none';
          loginScreen.classList.add('visible');
          setTimeout(() => document.getElementById('login-pw').focus(), 400);
        }, { once: true });
      }, 300);

    } else {
      bar.style.width = progress + '%';
    }
  }, 120);
}

/* ── User switcher ─────────────────────────────── */
function selectUser(userId) {
  const user = CONFIG.loginUsers.find(u => u.id === userId);
  if (!user) return;
  loginUser = user;

  document.getElementById('login-avatar-img').textContent = user.avatar;
  document.getElementById('login-uname').textContent       = user.name;

  document.querySelectorAll('.login-user-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('uc-' + userId).classList.add('active');

  document.getElementById('login-pw').value = '';
  document.getElementById('login-pw').focus();
}

/* ── STEP 2: Submit login ──────────────────────── */
function doLogin() {
  const pw   = document.getElementById('login-pw').value;
  const wrap = document.getElementById('pw-wrap');

  if (pw !== CONFIG.loginPassword) {
    wrap.classList.add('shake');
    wrap.addEventListener('animationend', () => wrap.classList.remove('shake'), { once: true });
    document.getElementById('login-pw').value = '';
    return;
  }

  /* Show loading screen FIRST, then fade login out — prevents white flash */
  showLoadingScreen(() => {
    const desktop = document.getElementById('desktop');
    const topbar  = document.getElementById('topbar');
    const dock    = document.getElementById('dock');
    [desktop, topbar, dock].forEach(el => {
      if (!el) return;
      el.style.transition  = 'opacity 0.5s';
    });
    requestAnimationFrame(() => {
      [desktop, topbar, dock].forEach(el => {
        if (!el) return;
        el.style.opacity       = '1';
        el.style.pointerEvents = 'all';
      });
    });
    onDesktopReady();
  });

  loginScreen.classList.add('fade-out');
  loginScreen.addEventListener('transitionend', () => {
    loginScreen.style.display = 'none';
  }, { once: true });
}

/* ── System buttons ────────────────────────────── */
function sysBtnAction(type) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: '#000', opacity: '0',
    zIndex: '999999',
    transition: 'opacity 0.5s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  });

  const msgs = {
    sleep:    { icon: '💤', text: 'Sleeping…'      },
    restart:  { icon: '🔄', text: 'Restarting…'    },
    shutdown: { icon: '🔴',  text: 'Shutting down…' },
  };

  const m = msgs[type];
  overlay.innerHTML = `
    <div style="font-size:36px">${m.icon}</div>
    <div>${m.text}</div>
    <div style="font-size:11px;margin-top:8px;opacity:0.4">Reload the page to wake up</div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
}

/* ── Keyboard shortcut: Enter on password field ── */
document.getElementById('login-pw')
  .addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

/* ── Build login user chips from config ────────── */
(function buildLoginUsers() {
  const container = document.getElementById('login-users');
  CONFIG.loginUsers.forEach((u, i) => {
    const chip = document.createElement('div');
    chip.className = 'login-user-chip' + (i === 0 ? ' active' : '');
    chip.id = 'uc-' + u.id;
    chip.onclick = () => selectUser(u.id);
    chip.innerHTML = `
      <div class="luc-avatar" style="background:linear-gradient(135deg,#2a3a6a,#4a2a7a)">${u.avatar}</div>
      <div class="luc-name">${u.name}</div>
    `;
    container.appendChild(chip);
  });

  /* Set initial avatar + name */
  const first = CONFIG.loginUsers[0];
  document.getElementById('login-avatar-img').textContent = first.avatar;
  document.getElementById('login-uname').textContent       = first.name;

  /* Populate start menu user */
  document.getElementById('sm-uavatar').textContent = first.avatar;
  document.getElementById('sm-uname').textContent   = first.name;
})();
