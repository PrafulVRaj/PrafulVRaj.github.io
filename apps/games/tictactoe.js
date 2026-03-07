/* ═══════════════════════════════════════════════════
   apps/tictactoe.js  —  Tic Tac Toe vs AI
═══════════════════════════════════════════════════ */

function renderTictactoe() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px;gap:16px;">
      <div style="display:flex;gap:20px;align-items:center;">
        <div style="text-align:center;">
          <div style="font-size:11px;color:var(--text-dimmer);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">You</div>
          <div style="font-size:32px;">❌</div>
          <div id="ttt-score-x" style="font-size:18px;font-weight:600;color:#89b4fa;">0</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px;color:var(--text-dimmer);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Draws</div>
          <div style="font-size:32px;">🤝</div>
          <div id="ttt-score-d" style="font-size:18px;font-weight:600;color:var(--text-dim);">0</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px;color:var(--text-dimmer);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">AI</div>
          <div style="font-size:32px;">⭕</div>
          <div id="ttt-score-o" style="font-size:18px;font-weight:600;color:#f38ba8;">0</div>
        </div>
      </div>

      <div id="ttt-status" style="font-size:13.5px;color:var(--text-dim);min-height:20px;text-align:center;"></div>

      <div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px;background:rgba(0,0,0,0.2);border-radius:14px;border:1px solid rgba(255,255,255,0.06);"></div>

      <div style="display:flex;gap:8px;margin-top:4px;">
        <button onclick="tttNewGame()" style="padding:7px 20px;border-radius:7px;border:1px solid rgba(137,180,250,0.4);background:rgba(137,180,250,0.1);color:#89b4fa;cursor:pointer;font-size:12.5px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='rgba(137,180,250,0.18)'" onmouseout="this.style.background='rgba(137,180,250,0.1)'">New Game</button>
        <button onclick="tttToggleAI()" id="ttt-ai-btn" style="padding:7px 20px;border-radius:7px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text-dim);cursor:pointer;font-size:12.5px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='var(--glass-lite)'">🤖 AI: On</button>
      </div>
    </div>
  `;
}

function mountTictactoe() {
  let board, current, scores = {X:0,O:0,D:0}, gameOver, aiOn = true;
  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWinner(b) {
    for (const [a,bI,c] of WINS) if (b[a] && b[a]===b[bI] && b[a]===b[c]) return b[a];
    if (b.every(Boolean)) return 'D';
    return null;
  }

  function minimax(b, isMax, depth) {
    const w = checkWinner(b);
    if (w === 'O') return 10 - depth;
    if (w === 'X') return depth - 10;
    if (w === 'D') return 0;
    if (isMax) {
      let best = -Infinity;
      for (let i=0;i<9;i++) if (!b[i]) { b[i]='O'; best=Math.max(best,minimax(b,false,depth+1)); b[i]=null; }
      return best;
    } else {
      let best = Infinity;
      for (let i=0;i<9;i++) if (!b[i]) { b[i]='X'; best=Math.min(best,minimax(b,true,depth+1)); b[i]=null; }
      return best;
    }
  }

  function aiMove() {
    let best = -Infinity, move = -1;
    for (let i=0;i<9;i++) if (!board[i]) {
      board[i]='O';
      const score = minimax(board, false, 0);
      board[i]=null;
      if (score > best) { best=score; move=i; }
    }
    return move;
  }

  function setStatus(txt, color='var(--text-dim)') {
    const el = document.getElementById('ttt-status');
    if (el) { el.textContent=txt; el.style.color=color; }
  }

  function renderBoard() {
    const el = document.getElementById('ttt-board');
    if (!el) return;
    el.innerHTML = '';
    const winner = checkWinner(board);
    let winLine = null;
    if (winner && winner !== 'D') {
      winLine = WINS.find(([a,b,c]) => board[a]===winner && board[b]===winner && board[c]===winner);
    }
    board.forEach((cell, i) => {
      const btn = document.createElement('button');
      const isWin = winLine && winLine.includes(i);
      btn.style.cssText = `width:96px;height:96px;border-radius:10px;border:1px solid ${isWin?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'};background:${isWin?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)'};color:${cell==='X'?'#89b4fa':'#f38ba8'};font-size:40px;cursor:${!cell&&!gameOver?'pointer':'default'};transition:background .15s, transform .1s;font-family:inherit;display:flex;align-items:center;justify-content:center;`;
      btn.textContent = cell==='X'?'✕':cell==='O'?'○':'';
      if (!cell && !gameOver) {
        btn.addEventListener('mouseover', () => btn.style.background='rgba(255,255,255,0.09)');
        btn.addEventListener('mouseout',  () => btn.style.background='rgba(255,255,255,0.04)');
        btn.addEventListener('click', () => makeMove(i));
      }
      el.appendChild(btn);
    });
  }

  function makeMove(i) {
    if (board[i] || gameOver) return;
    board[i] = current;
    const w = checkWinner(board);
    if (w) { endGame(w); renderBoard(); return; }
    current = current==='X'?'O':'X';
    renderBoard();
    setStatus(current==='X'?'Your turn ❌':'AI thinking...','var(--text-dim)');
    if (current==='O' && aiOn) setTimeout(() => { const m=aiMove(); if(m!==-1){board[m]='O'; const w2=checkWinner(board); if(w2){endGame(w2);renderBoard();return;} current='X'; renderBoard(); setStatus('Your turn ❌'); } }, 300);
  }

  function endGame(w) {
    gameOver = true;
    if (w==='D') { scores.D++; setStatus('🤝 Draw!','var(--text-dim)'); }
    else if (w==='X') { scores.X++; setStatus('🎉 You win!','#89b4fa'); }
    else { scores.O++; setStatus('🤖 AI wins!','#f38ba8'); }
    updateScores();
  }

  function updateScores() {
    const xe=document.getElementById('ttt-score-x'), oe=document.getElementById('ttt-score-o'), de=document.getElementById('ttt-score-d');
    if(xe) xe.textContent=scores.X; if(oe) oe.textContent=scores.O; if(de) de.textContent=scores.D;
  }

  window.tttNewGame = function() {
    board = Array(9).fill(null); current='X'; gameOver=false;
    setStatus('Your turn ❌'); renderBoard();
  };

  window.tttToggleAI = function() {
    aiOn = !aiOn;
    const btn = document.getElementById('ttt-ai-btn');
    if (btn) btn.textContent = aiOn ? '🤖 AI: On' : '👤 2 Players';
    tttNewGame();
  };

  tttNewGame();
}
