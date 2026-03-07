/* ═══════════════════════════════════════════════════
   apps/flappybird.js  —  Flappy Bird clone
═══════════════════════════════════════════════════ */

function renderFlappybird() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;gap:10px;">
      <div style="display:flex;gap:24px;align-items:center;">
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">Score <span id="fb-score" style="font-size:20px;font-weight:600;color:#f9e2af;margin-left:4px;">0</span></div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">Best <span id="fb-best" style="font-size:20px;font-weight:600;color:var(--text-dim);margin-left:4px;">0</span></div>
      </div>
      <canvas id="fb-canvas" width="320" height="400" style="border-radius:12px;border:1px solid rgba(255,255,255,0.08);display:block;cursor:pointer;"></canvas>
      <div style="font-size:11px;color:var(--text-dimmer);">Click or Space to flap</div>
    </div>
  `;
}

function mountFlappybird() {
  const canvas = document.getElementById('fb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const SKY_TOP = '#1a1a2e', SKY_BOT = '#2d1b4e';
  const PIPE_W = 52, GAP = 130, PIPE_SPEED = 2.2;
  const BIRD_X = 72, BIRD_R = 14;
  const GRAVITY = 0.38, FLAP = -7.5;

  let bird, pipes, score, best = 0, state, raf;

  function reset() {
    bird   = { y: H / 2, vy: 0, rot: 0 };
    pipes  = [];
    score  = 0;
    state  = 'idle'; // idle | playing | dead
    cancelAnimationFrame(raf);
    document.getElementById('fb-score').textContent = '0';
    loop();
  }

  function spawnPipe() {
    const topH = 60 + Math.random() * (H - GAP - 140);
    pipes.push({ x: W, topH });
  }

  function flap() {
    if (state === 'dead') { reset(); return; }
    if (state === 'idle') state = 'playing';
    bird.vy = FLAP;
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, SKY_TOP); g.addColorStop(1, SKY_BOT);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    [[30,40],[80,70],[150,25],[200,55],[260,35],[290,80],[50,90],[170,85]].forEach(([x,y])=>{
      ctx.fillRect(x,y,1.5,1.5);
    });
  }

  function drawGround() {
    ctx.fillStyle = '#2d4a1e';
    ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#3d6a28';
    ctx.fillRect(0, H - 30, W, 8);
  }

  function drawPipe(p) {
    const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
    grad.addColorStop(0, '#2d7a1a'); grad.addColorStop(0.4, '#3da020'); grad.addColorStop(1, '#1a5010');
    ctx.fillStyle = grad;
    // top pipe
    ctx.beginPath(); ctx.roundRect(p.x, 0, PIPE_W, p.topH, [0,0,6,6]); ctx.fill();
    // top cap
    ctx.fillRect(p.x - 4, p.topH - 18, PIPE_W + 8, 18);
    // bottom pipe
    const botY = p.topH + GAP;
    ctx.beginPath(); ctx.roundRect(p.x, botY, PIPE_W, H - botY, [6,6,0,0]); ctx.fill();
    // bottom cap
    ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 18);
  }

  function drawBird() {
    ctx.save();
    ctx.translate(BIRD_X, bird.y);
    ctx.rotate(Math.min(Math.max(bird.rot, -0.5), 1.2));

    // body
    ctx.fillStyle = '#f9e2af';
    ctx.beginPath(); ctx.ellipse(0, 0, BIRD_R, BIRD_R * 0.85, 0, 0, Math.PI * 2); ctx.fill();

    // wing
    ctx.fillStyle = '#e0b060';
    ctx.beginPath(); ctx.ellipse(-4, 3, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();

    // eye
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(5, -3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e1e2e';
    ctx.beginPath(); ctx.arc(6.5, -3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(7.2, -3.5, 1, 0, Math.PI * 2); ctx.fill();

    // beak
    ctx.fillStyle = '#fab387';
    ctx.beginPath(); ctx.moveTo(10, -1); ctx.lineTo(17, 1); ctx.lineTo(10, 3); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 28px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 40);
  }

  function drawOverlay(msg, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f9e2af';
    ctx.font = 'bold 28px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(msg, W/2, H/2 - 20);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '13px Segoe UI';
    ctx.fillText(sub, W/2, H/2 + 16);
    if (state === 'dead') {
      ctx.fillText('Best: ' + best, W/2, H/2 + 40);
      ctx.fillText('Click to restart', W/2, H/2 + 64);
    }
  }

  let frameCount = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    frameCount++;
    drawSky();

    if (state === 'playing') {
      // physics
      bird.vy += GRAVITY;
      bird.y  += bird.vy;
      bird.rot = bird.vy * 0.08;

      // spawn pipes
      if (frameCount % 95 === 0) spawnPipe();

      // move pipes
      pipes.forEach(p => p.x -= PIPE_SPEED);
      pipes = pipes.filter(p => p.x > -PIPE_W - 10);

      // score
      pipes.forEach(p => {
        if (!p.scored && p.x + PIPE_W < BIRD_X) {
          p.scored = true; score++;
          document.getElementById('fb-score').textContent = score;
        }
      });

      // collision
      const ground = bird.y + BIRD_R > H - 30;
      const ceiling = bird.y - BIRD_R < 0;
      const hitPipe = pipes.some(p => {
        const bx = BIRD_X, by = bird.y, r = BIRD_R - 2;
        return bx+r > p.x && bx-r < p.x+PIPE_W && (by-r < p.topH || by+r > p.topH+GAP);
      });
      if (ground || ceiling || hitPipe) {
        state = 'dead';
        if (score > best) { best = score; document.getElementById('fb-best').textContent = best; }
      }
    }

    pipes.forEach(drawPipe);
    drawGround();
    drawBird();
    if (state === 'playing' || state === 'dead') drawHUD();
    if (state === 'idle')  drawOverlay('🐦 Flappy Bird', 'Click or Space to start');
    if (state === 'dead')  drawOverlay('💀 Game Over', 'Score: ' + score);
  }

  canvas.addEventListener('click', flap);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('fb-canvas')) { flap(); e.preventDefault(); }
  });

  reset();
}
