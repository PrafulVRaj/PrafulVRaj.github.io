/* ═══════════════════════════════════════════════════
   apps/minesweeper.js  —  Classic Minesweeper
═══════════════════════════════════════════════════ */

function renderMinesweeper() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;gap:12px;">
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-dim);">
          💣 <span id="ms-mines">0</span>
        </div>
        <button onclick="msNewGame()" style="padding:6px 16px;border-radius:8px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text);cursor:pointer;font-size:13px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='var(--glass-lite)'">
          <span id="ms-emoji">🙂</span> New Game
        </button>
        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-dim);">
          ⏱ <span id="ms-timer">0</span>s
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:4px;">
        <button onclick="msSetDiff('easy')" id="ms-d-easy" style="padding:4px 12px;border-radius:6px;border:1px solid rgba(166,227,161,0.5);background:rgba(166,227,161,0.15);color:#a6e3a1;cursor:pointer;font-size:11.5px;font-family:inherit;">Easy</button>
        <button onclick="msSetDiff('medium')" id="ms-d-medium" style="padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text-dim);cursor:pointer;font-size:11.5px;font-family:inherit;">Medium</button>
        <button onclick="msSetDiff('hard')" id="ms-d-hard" style="padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text-dim);cursor:pointer;font-size:11.5px;font-family:inherit;">Hard</button>
      </div>
      <div id="ms-grid" style="display:grid;gap:2px;background:rgba(0,0,0,0.2);padding:6px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);"></div>
      <div id="ms-msg" style="font-size:13px;color:var(--text-dim);height:20px;text-align:center;"></div>
    </div>
  `;
}

function mountMinesweeper() {
  const DIFFS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 12, cols: 12, mines: 25 },
    hard:   { rows: 14, cols: 14, mines: 40 },
  };
  let cfg = DIFFS.easy, board = [], revealed = [], flagged = [], started = false, over = false, timerInt;

  const NUM_COLORS = ['','#89b4fa','#a6e3a1','#f38ba8','#cba6f7','#fab387','#89dceb','#f5c2e7','#6c7086'];

  window.msSetDiff = function(d) {
    cfg = DIFFS[d];
    ['easy','medium','hard'].forEach(k => {
      const btn = document.getElementById('ms-d-' + k);
      if (!btn) return;
      if (k === d) {
        btn.style.border = '1px solid rgba(166,227,161,0.5)';
        btn.style.background = 'rgba(166,227,161,0.15)';
        btn.style.color = '#a6e3a1';
      } else {
        btn.style.border = '1px solid rgba(255,255,255,0.1)';
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = 'rgba(255,255,255,0.55)';
      }
    });
    msNewGame();
  };

  window.msNewGame = function() {
    clearInterval(timerInt);
    started = false; over = false;
    board    = Array.from({length: cfg.rows}, () => Array(cfg.cols).fill(0));
    revealed = Array.from({length: cfg.rows}, () => Array(cfg.cols).fill(false));
    flagged  = Array.from({length: cfg.rows}, () => Array(cfg.cols).fill(false));
    document.getElementById('ms-timer').textContent = '0';
    document.getElementById('ms-emoji').textContent = '🙂';
    document.getElementById('ms-msg').textContent = '';
    document.getElementById('ms-mines').textContent = cfg.mines;
    renderGrid();
  };

  function placeMines(firstR, firstC) {
    let placed = 0;
    while (placed < cfg.mines) {
      const r = Math.floor(Math.random() * cfg.rows);
      const c = Math.floor(Math.random() * cfg.cols);
      if (board[r][c] === -1 || (Math.abs(r-firstR)<=1 && Math.abs(c-firstC)<=1)) continue;
      board[r][c] = -1; placed++;
    }
    for (let r = 0; r < cfg.rows; r++)
      for (let c = 0; c < cfg.cols; c++) {
        if (board[r][c] === -1) continue;
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r+dr, nc = c+dc;
          if (nr>=0&&nr<cfg.rows&&nc>=0&&nc<cfg.cols&&board[nr][nc]===-1) n++;
        }
        board[r][c] = n;
      }
  }

  function reveal(r, c) {
    if (r<0||r>=cfg.rows||c<0||c>=cfg.cols||revealed[r][c]||flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0) for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc);
  }

  function checkWin() {
    let unrevealed = 0;
    for (let r=0;r<cfg.rows;r++) for (let c=0;c<cfg.cols;c++)
      if (!revealed[r][c] && board[r][c]!==-1) unrevealed++;
    return unrevealed === 0;
  }

  function renderGrid() {
    const grid = document.getElementById('ms-grid');
    if (!grid) return;
    const cellSize = Math.min(28, Math.floor(380 / cfg.cols));
    grid.style.gridTemplateColumns = `repeat(${cfg.cols}, ${cellSize}px)`;
    grid.innerHTML = '';
    for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) {
      const cell = document.createElement('div');
      cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize*0.52}px;border-radius:4px;cursor:pointer;font-weight:600;transition:background .1s;user-select:none;`;
      const r2=r,c2=c;
      if (revealed[r][c]) {
        cell.style.background = 'rgba(0,0,0,0.25)';
        if (board[r][c] === -1) { cell.textContent = '💥'; cell.style.background='rgba(243,139,168,0.25)'; }
        else if (board[r][c] > 0) { cell.textContent = board[r][c]; cell.style.color = NUM_COLORS[board[r][c]]; }
      } else if (flagged[r][c]) {
        cell.style.background='rgba(255,255,255,0.08)'; cell.textContent='🚩';
      } else {
        cell.style.background='rgba(255,255,255,0.07)';
        cell.addEventListener('mouseover',()=>{ if(!over) cell.style.background='rgba(255,255,255,0.13)'; });
        cell.addEventListener('mouseout', ()=>{ cell.style.background='rgba(255,255,255,0.07)'; });
        cell.addEventListener('click', () => {
          if (over || flagged[r2][c2]) return;
          if (!started) {
            started = true;
            placeMines(r2, c2);
            let t = 0;
            timerInt = setInterval(()=>{ document.getElementById('ms-timer').textContent=++t; }, 1000);
          }
          if (board[r2][c2] === -1) {
            for(let rr=0;rr<cfg.rows;rr++) for(let cc=0;cc<cfg.cols;cc++) if(board[rr][cc]===-1) revealed[rr][cc]=true;
            revealed[r2][c2]=true; over=true; clearInterval(timerInt);
            document.getElementById('ms-emoji').textContent='😵';
            document.getElementById('ms-msg').textContent='💥 Boom! Better luck next time.';
          } else {
            reveal(r2,c2);
            if(checkWin()){ over=true; clearInterval(timerInt); document.getElementById('ms-emoji').textContent='😎'; document.getElementById('ms-msg').textContent='🎉 You won!'; }
          }
          renderGrid();
        });
        cell.addEventListener('contextmenu', e => {
          e.preventDefault(); if(over||revealed[r2][c2]) return;
          flagged[r2][c2]=!flagged[r2][c2];
          const remaining = cfg.mines - flagged.flat().filter(Boolean).length;
          document.getElementById('ms-mines').textContent=remaining;
          renderGrid();
        });
      }
      grid.appendChild(cell);
    }
  }
  msNewGame();
}
