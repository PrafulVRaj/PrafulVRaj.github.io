/* ═══════════════════════════════════════════════════
   apps.js  —  Renders window body content from config
   Add new app renderers here as we build Step 2+
═══════════════════════════════════════════════════ */


/* ── About ──────────────────────────────────────── */
function renderAbout() {
  const u = CONFIG.user;
  return `
    <div class="about-wrap">
      <div class="about-hero">
        <div class="about-avatar">${u.avatar}</div>
        <div class="about-meta">
          <h2>${u.fullName}</h2>
          <div class="role">${u.role}</div>
          <p>${u.bio}</p>
        </div>
      </div>
      <p style="font-size:15px;color:white;line-height:1.7;">${u.bio2}</p>
      <div class="tag-row">
        ${u.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `;
}


/* ── Projects ───────────────────────────────────── */
function renderProjects() {
  const cards = CONFIG.projects.map(p => `
    <div class="proj-card" onclick="onProjectClick('${p.id}')">
      <div class="pc-emoji">${p.emoji}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="pc-stack">
        ${p.stack.map(s => `<span>${s}</span>`).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="proj-wrap">
      <div class="win-sec-title">Featured Projects</div>
      <div class="proj-grid">${cards}</div>
    </div>
  `;
}

/* Called when a project card is clicked */
function onProjectClick(id) {
  const p = CONFIG.projects.find(p => p.id === id);
  if (!p) return;
  /* Step 2: if type === 'app', open its own window */
  if (p.type === 'app') {
    openWin(id);
  } else {
    showToast(p.emoji, p.title, 'Project details coming in Step 2!');
  }
}


/* ── Skills ─────────────────────────────────────── */
function renderSkills() {
  return `
    <div class="skills-wrap">
      ${Object.entries(CONFIG.skills).map(([group, items]) => `
        <div class="skill-group">
          <div class="sg-title">${group}</div>
          ${items.map(([name, pct]) => `
            <div class="skill-row">
              <span class="sk-name">${name}</span>
              <div class="sk-track">
                <div class="sk-fill" data-pct="${pct / 100}" style="width:100%"></div>
              </div>
              <span class="sk-pct">${pct}%</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

let skillsAnimated = false;

function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.sk-fill').forEach((el, i) => {
    const pct = parseFloat(el.dataset.pct);
    setTimeout(() => { el.style.transform = `scaleX(${pct})`; }, i * 60);
  });
}


/* ── Contact ────────────────────────────────────── */
function renderContact() {
  const rows = CONFIG.contact.map(c => `
    <a class="contact-row" href="${c.href}">
      <span class="cr-icon">${c.icon}</span>
      <div>
        <div class="cr-label">${c.label}</div>
        <div class="cr-value">${c.value}</div>
      </div>
    </a>
  `).join('');

  return `<div class="contact-wrap"><div class="contact-list">${rows}</div></div>`;
}


/* ── Games Folder ───────────────────────────────── */
const GAME_LIST = [
  { id:'snake',       emoji:'🐍', label:'Snake',       color:'#1a2e1a' },
  { id:'minesweeper', emoji:'💣', label:'Minesweeper', color:'#2a1a1a' },
  { id:'tictactoe',   emoji:'⭕', label:'Tic Tac Toe', color:'#1a1a2e' },
  { id:'flappybird',  emoji:'🐦', label:'Flappy Bird', color:'#1a2535' },
  { id:'chess',       emoji:'♟️', label:'Chess',       color:'#2a2018' },
];

function renderGamesFolder() {
  const cards = GAME_LIST.map(g => `
    <div onclick="openWin('${g.id}')" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 10px;border-radius:10px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);transition:background .15s,transform .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.transform='none'">
      <div style="width:58px;height:58px;border-radius:14px;background:linear-gradient(145deg,${g.color},${g.color}88);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 4px 14px rgba(0,0,0,0.4);">${g.emoji}</div>
      <span style="font-size:12px;color:var(--text-dim);text-align:center;">${g.label}</span>
    </div>
  `).join('');
  return `
    <div style="padding:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dimmer);margin-bottom:14px;">5 Games</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">${cards}</div>
    </div>`;
}


/* ── Mount all app content into window bodies ───── */
function mountApps() {
  document.getElementById('body-about').innerHTML       = renderAbout();
  document.getElementById('body-projects').innerHTML    = renderProjects();
  document.getElementById('body-skills').innerHTML      = renderSkills();
  document.getElementById('body-contact').innerHTML     = renderContact();
  document.getElementById('body-games').innerHTML       = renderGamesFolder();

  // Games — HTML shells; logic mounted lazily on first open
  document.getElementById('body-snake').innerHTML       = renderSnake();
  document.getElementById('body-minesweeper').innerHTML = renderMinesweeper();
  document.getElementById('body-tictactoe').innerHTML   = renderTictactoe();
  document.getElementById('body-flappybird').innerHTML  = renderFlappybird();
  document.getElementById('body-chess').innerHTML       = renderChess();

  // Media apps — HTML shells; logic mounted lazily on first open
  document.getElementById('body-musicplayer').innerHTML  = renderMusicPlayer();
  document.getElementById('body-mediaplayer').innerHTML  = renderMediaPlayer();
}

// Lazy mount on first open — canvas/audio needs to be in DOM
const _mounted = {};
function mountGameOnOpen(id) {
  if (_mounted[id]) return;
  _mounted[id] = true;
  const fns = {
    snake: mountSnake, minesweeper: mountMinesweeper,
    tictactoe: mountTictactoe, flappybird: mountFlappybird,
    chess: mountChess,
    musicplayer: mountMusicPlayer,
    mediaplayer: mountMediaPlayer,
  };
  if (fns[id]) fns[id]();
}
