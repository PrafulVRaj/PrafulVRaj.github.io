/* ═══════════════════════════════════════════════════
   apps/snake.js  —  Classic Snake game
═══════════════════════════════════════════════════ */

function renderSnake() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;gap:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;width:360px;">
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">Score</div>
        <div id="snake-score" style="font-size:22px;font-weight:600;color:#a6e3a1;">0</div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">Best</div>
        <div id="snake-best" style="font-size:22px;font-weight:600;color:var(--text-dim);">0</div>
      </div>
      <canvas id="snake-canvas" width="360" height="360"
        style="border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:#0d1117;display:block;"></canvas>
      <div id="snake-msg" style="font-size:12.5px;color:var(--text-dim);text-align:center;height:18px;"></div>
      <div style="display:flex;gap:8px;">
        <button onclick="snakeStart()" style="padding:7px 20px;border-radius:7px;border:1px solid rgba(166,227,161,0.4);background:rgba(166,227,161,0.1);color:#a6e3a1;cursor:pointer;font-size:12.5px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='rgba(166,227,161,0.18)'" onmouseout="this.style.background='rgba(166,227,161,0.1)'">▶ Start</button>
        <button onclick="snakePause()" style="padding:7px 20px;border-radius:7px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text-dim);cursor:pointer;font-size:12.5px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='var(--glass-lite)'">⏸ Pause</button>
      </div>
      <div style="font-size:11px;color:var(--text-dimmer);">Arrow Keys or WASD to move</div>
    </div>
  `;
}

function mountSnake() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CELL = 18, COLS = 20, ROWS = 20;
  let snake, dir, nextDir, food, score, best = 0, loop, paused = false, running = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * CELL + CELL/2 - 1, y * CELL + CELL/2 - 1, 2, 2);

    // food
    const fx = food.x * CELL, fy = food.y * CELL;
    ctx.fillStyle = '#f38ba8';
    ctx.beginPath();
    ctx.arc(fx + CELL/2, fy + CELL/2, CELL/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      ctx.fillStyle = `hsl(${140 - t * 30},60%,${55 - t * 15}%)`;
      const r = i === 0 ? 6 : 4;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, r);
      ctx.fill();
    });
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function step() {
    if (paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
      return gameOver();
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      document.getElementById('snake-score').textContent = score;
      if (score > best) { best = score; document.getElementById('snake-best').textContent = best; }
      placeFood();
    } else { snake.pop(); }
    draw();
  }

  function gameOver() {
    clearInterval(loop); running = false;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f38ba8';
    ctx.font = 'bold 28px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px Segoe UI';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Press Start to play again', canvas.width/2, canvas.height/2 + 45);
  }

  window.snakeStart = function() {
    clearInterval(loop);
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = nextDir = {x:1,y:0};
    score = 0; paused = false; running = true;
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-msg').textContent = '';
    placeFood(); draw();
    const speed = Math.max(80, 160 - score * 2);
    loop = setInterval(() => { step(); }, 120);
  };

  window.snakePause = function() {
    if (!running) return;
    paused = !paused;
    document.getElementById('snake-msg').textContent = paused ? '⏸ Paused — press Pause to resume' : '';
  };

  const DIRS = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
                 w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} };
  document.addEventListener('keydown', e => {
    if (!running) return;
    const d = DIRS[e.key];
    if (d && !(d.x === -dir.x && d.y === -dir.y)) { nextDir = d; e.preventDefault(); }
  });

  // draw idle state
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '16px Segoe UI'; ctx.textAlign = 'center';
  ctx.fillText('Press Start to play', canvas.width/2, canvas.height/2);
}
