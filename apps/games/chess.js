/* ═══════════════════════════════════════════════════
   apps/chess.js  —  Chess vs AI (minimax)
═══════════════════════════════════════════════════ */

function renderChess() {
  return `
    <div style="display:flex;height:100%;gap:0;">
      <!-- Board -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:12px;">
        <canvas id="chess-canvas" width="360" height="360" style="border-radius:8px;cursor:pointer;display:block;box-shadow:0 4px 20px rgba(0,0,0,0.4);"></canvas>
      </div>
      <!-- Side panel -->
      <div style="width:160px;display:flex;flex-direction:column;padding:14px 12px;gap:10px;border-left:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dimmer);">Status</div>
        <div id="chess-status" style="font-size:12.5px;color:var(--text-dim);line-height:1.5;min-height:36px;"></div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dimmer);margin-top:4px;">Captured</div>
        <div id="chess-captured" style="font-size:16px;line-height:1.6;min-height:24px;word-break:break-all;"></div>
        <button onclick="chessNewGame()" style="margin-top:auto;padding:7px 10px;border-radius:7px;border:1px solid rgba(166,227,161,0.4);background:rgba(166,227,161,0.08);color:#a6e3a1;cursor:pointer;font-size:12px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='rgba(166,227,161,0.16)'" onmouseout="this.style.background='rgba(166,227,161,0.08)'">New Game</button>
        <button onclick="chessToggleSide()" id="chess-side-btn" style="padding:7px 10px;border-radius:7px;border:1px solid var(--border);background:var(--glass-lite);color:var(--text-dim);cursor:pointer;font-size:12px;font-family:inherit;">Play as Black</button>
        <div style="font-size:10.5px;color:var(--text-dimmer);line-height:1.5;">You play White.<br>Click piece then square.</div>
      </div>
    </div>
  `;
}

function mountChess() {
  const canvas = document.getElementById('chess-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SQ = 45;

  // Piece chars
  const PIECES = {
    K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
    k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
  };

  const VALS = { p:1, n:3, b:3, r:5, q:9, k:0 };

  let board, selected, turn, captured, playerSide, aiThinking, gameOver;

  function initBoard() {
    return [
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R'],
    ];
  }

  function isWhite(p) { return p && p === p.toUpperCase(); }
  function isBlack(p) { return p && p === p.toLowerCase(); }
  function sameColor(a, b) { return (isWhite(a) && isWhite(b)) || (isBlack(a) && isBlack(b)); }

  function inBounds(r, c) { return r>=0&&r<8&&c>=0&&c<8; }

  function pieceMoves(b, r, c, checkKing=true) {
    const p = b[r][c]; if (!p) return [];
    const moves = [], pt = p.toLowerCase();
    const white = isWhite(p);
    const fwd = white ? -1 : 1;
    const startRow = white ? 6 : 1;

    const slide = (dr, dc) => {
      let nr=r+dr, nc=c+dc;
      while(inBounds(nr,nc)) {
        if (!b[nr][nc]) { moves.push([nr,nc]); nr+=dr; nc+=dc; }
        else { if(!sameColor(p,b[nr][nc])) moves.push([nr,nc]); break; }
      }
    };

    if (pt==='p') {
      if (inBounds(r+fwd,c) && !b[r+fwd][c]) {
        moves.push([r+fwd,c]);
        if (r===startRow && !b[r+2*fwd][c]) moves.push([r+2*fwd,c]);
      }
      [[r+fwd,c-1],[r+fwd,c+1]].forEach(([nr,nc]) => {
        if (inBounds(nr,nc) && b[nr][nc] && !sameColor(p,b[nr][nc])) moves.push([nr,nc]);
      });
    } else if (pt==='n') {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => {
        const nr=r+dr, nc=c+dc;
        if (inBounds(nr,nc) && !sameColor(p,b[nr][nc])) moves.push([nr,nc]);
      });
    } else if (pt==='b') {
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => slide(dr,dc));
    } else if (pt==='r') {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => slide(dr,dc));
    } else if (pt==='q') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => slide(dr,dc));
    } else if (pt==='k') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
        const nr=r+dr, nc=c+dc;
        if (inBounds(nr,nc) && !sameColor(p,b[nr][nc])) moves.push([nr,nc]);
      });
    }
    return moves;
  }

  function isInCheck(b, white) {
    let kr=-1, kc=-1;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]===(white?'K':'k')) { kr=r; kc=c; }
    if(kr===-1) return true;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=b[r][c];
      if (!p || isWhite(p)===white) continue;
      if(pieceMoves(b,r,c,false).some(([nr,nc])=>nr===kr&&nc===kc)) return true;
    }
    return false;
  }

  function legalMoves(b, r, c) {
    const p = b[r][c]; if (!p) return [];
    return pieceMoves(b,r,c).filter(([nr,nc]) => {
      const nb = b.map(row=>[...row]);
      nb[nr][nc]=p; nb[r][c]=null;
      return !isInCheck(nb, isWhite(p));
    });
  }

  function allLegal(b, white) {
    const moves=[];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=b[r][c];
      if(!p||isWhite(p)!==white) continue;
      legalMoves(b,r,c).forEach(([nr,nc]) => moves.push({r,c,nr,nc}));
    }
    return moves;
  }

  function evaluate(b) {
    let score=0;
    const CENTER = [[3,3],[3,4],[4,3],[4,4]];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=b[r][c]; if(!p) continue;
      const v=(VALS[p.toLowerCase()]||0);
      const center = CENTER.some(([cr,cc])=>cr===r&&cc===c) ? 0.2 : 0;
      score += isWhite(p) ? (v+center) : -(v+center);
    }
    return score;
  }

  function minimax(b, depth, alpha, beta, maxing) {
    const moves = allLegal(b, maxing);
    if (depth===0 || moves.length===0) return evaluate(b);
    if (maxing) {
      let best=-Infinity;
      for(const m of moves) {
        const nb=b.map(r=>[...r]); nb[m.nr][m.nc]=nb[m.r][m.c]; nb[m.r][m.c]=null;
        const v=minimax(nb,depth-1,alpha,beta,false);
        best=Math.max(best,v); alpha=Math.max(alpha,v);
        if(beta<=alpha) break;
      }
      return best;
    } else {
      let best=Infinity;
      for(const m of moves) {
        const nb=b.map(r=>[...r]); nb[m.nr][m.nc]=nb[m.r][m.c]; nb[m.r][m.c]=null;
        const v=minimax(nb,depth-1,alpha,beta,true);
        best=Math.min(best,v); beta=Math.min(beta,v);
        if(beta<=alpha) break;
      }
      return best;
    }
  }

  function aiMove() {
    const isAiWhite = playerSide === 'black';
    const moves = allLegal(board, isAiWhite);
    if (!moves.length) return;
    let best = isAiWhite ? -Infinity : Infinity, bestM = moves[0];
    for (const m of moves) {
      const nb = board.map(r=>[...r]); nb[m.nr][m.nc]=nb[m.r][m.c]; nb[m.r][m.c]=null;
      const v = minimax(nb, 2, -Infinity, Infinity, !isAiWhite);
      if (isAiWhite ? v>best : v<best) { best=v; bestM=m; }
    }
    const cap = board[bestM.nr][bestM.nc];
    board[bestM.nr][bestM.nc] = board[bestM.r][bestM.c];
    board[bestM.r][bestM.c] = null;
    if (cap) captured.push(cap);
    // pawn promotion
    if (board[bestM.nr][bestM.nc]==='P' && bestM.nr===0) board[bestM.nr][bestM.nc]='Q';
    if (board[bestM.nr][bestM.nc]==='p' && bestM.nr===7) board[bestM.nr][bestM.nc]='q';
    turn = playerSide === 'white' ? 'white' : 'black';
    aiThinking = false;
    updateStatus();
    drawBoard();
  }

  function drawBoard() {
    const flip = playerSide === 'black';
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const dr=flip?7-r:r, dc=flip?7-c:c;
      const light = (r+c)%2===0;
      ctx.fillStyle = light ? '#c8a882' : '#5a3a1a';
      ctx.fillRect(dc*SQ, dr*SQ, SQ, SQ);

      // highlight selected
      if (selected && selected[0]===r && selected[1]===c) {
        ctx.fillStyle='rgba(255,220,0,0.35)'; ctx.fillRect(dc*SQ,dr*SQ,SQ,SQ);
      }
      // highlight legal moves
      if (selected) {
        const lm = legalMoves(board, selected[0], selected[1]);
        if (lm.some(([nr,nc])=>nr===r&&nc===c)) {
          ctx.fillStyle='rgba(0,200,100,0.3)'; ctx.fillRect(dc*SQ,dr*SQ,SQ,SQ);
          if (board[r][c]) { ctx.strokeStyle='rgba(0,200,100,0.7)'; ctx.lineWidth=2; ctx.strokeRect(dc*SQ+1,dr*SQ+1,SQ-2,SQ-2); }
        }
      }
    }

    // pieces
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=board[r][c]; if(!p) continue;
      const dr=flip?7-r:r, dc=flip?7-c:c;
      ctx.font = `${SQ*0.72}px serif`;
      // shadow
      ctx.fillStyle='rgba(0,0,0,0.4)';
      ctx.fillText(PIECES[p], dc*SQ+SQ/2+1, dr*SQ+SQ/2+1);
      ctx.fillStyle = isWhite(p) ? '#fff8f0' : '#1a0a00';
      ctx.fillText(PIECES[p], dc*SQ+SQ/2, dr*SQ+SQ/2);
    }

    // coords
    ctx.font='9px Segoe UI'; ctx.textBaseline='top';
    for(let i=0;i<8;i++) {
      const file='abcdefgh'[flip?7-i:i];
      const rank=flip?i+1:8-i;
      ctx.fillStyle=(i%2===0)?'#5a3a1a':'#c8a882';
      ctx.textAlign='left'; ctx.fillText(file, i*SQ+2, 7*SQ+SQ-11);
      ctx.textAlign='right'; ctx.fillText(rank, i*SQ+SQ-2, i*SQ+2);
    }

    // captured
    const capEl=document.getElementById('chess-captured');
    if(capEl) capEl.textContent=captured.map(p=>PIECES[p]).join('');
  }

  function updateStatus() {
    const el=document.getElementById('chess-status');
    if(!el) return;
    const playerWhite = playerSide==='white';
    const playerTurn  = (playerWhite && turn==='white') || (!playerWhite && turn==='black');
    const playerCheck = isInCheck(board, playerWhite);
    const aiCheck     = isInCheck(board, !playerWhite);
    const playerMoves = allLegal(board, playerWhite);
    const aiMoves     = allLegal(board, !playerWhite);

    if (gameOver) return;
    if (!playerMoves.length) {
      gameOver=true;
      el.textContent = playerCheck ? '☠️ Checkmate!\nAI wins.' : '🤝 Stalemate! Draw.';
      return;
    }
    if (!aiMoves.length) {
      gameOver=true; el.textContent = '🎉 You win!\nCheckmate!'; return;
    }
    if (playerTurn) el.textContent=(playerCheck?'⚠️ Check!\n':'')+'Your turn';
    else            el.textContent=(aiCheck?'⚠️ AI in check!\n':'')+(aiThinking?'🤖 AI thinking…':'AI\'s turn');
  }

  canvas.addEventListener('click', e => {
    if (gameOver || aiThinking) return;
    const rect=canvas.getBoundingClientRect();
    const flip=playerSide==='black';
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const dc=Math.floor(mx/SQ), dr=Math.floor(my/SQ);
    const c=flip?7-dc:dc, r=flip?7-dr:dr;
    if(!inBounds(r,c)) return;
    const playerWhite=playerSide==='white';

    if (selected) {
      const lm=legalMoves(board,selected[0],selected[1]);
      if (lm.some(([nr,nc])=>nr===r&&nc===c)) {
        const cap=board[r][c];
        board[r][c]=board[selected[0]][selected[1]];
        board[selected[0]][selected[1]]=null;
        if(cap) captured.push(cap);
        // pawn promo
        if(board[r][c]==='P'&&r===0) board[r][c]='Q';
        if(board[r][c]==='p'&&r===7) board[r][c]='q';
        selected=null; turn=playerWhite?'black':'white';
        updateStatus(); drawBoard();
        aiThinking=true;
        setTimeout(()=>{ aiMove(); }, 400);
        return;
      }
      selected=null;
    }
    const p=board[r][c];
    if(p && isWhite(p)===playerWhite && turn===(playerWhite?'white':'black')) {
      selected=[r,c];
    }
    updateStatus(); drawBoard();
  });

  window.chessNewGame = function() {
    board=initBoard(); selected=null; turn='white';
    captured=[]; aiThinking=false; gameOver=false;
    if(playerSide==='black') { aiThinking=true; setTimeout(()=>aiMove(),400); }
    updateStatus(); drawBoard();
  };

  window.chessToggleSide = function() {
    playerSide = playerSide==='white'?'black':'white';
    const btn=document.getElementById('chess-side-btn');
    if(btn) btn.textContent=playerSide==='white'?'Play as Black':'Play as White';
    const hint=document.querySelector('#win-chess .win-body div:last-of-type');
    chessNewGame();
  };

  playerSide='white';
  chessNewGame();
}
