/* ═══════════════════════════════════════════════════
   apps/music-player.js  —  Music Player with
   Web Audio visualizer, playlist, full controls
═══════════════════════════════════════════════════ */

function renderMusicPlayer() {
  return `
  <div id="mp-root" style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

    <!-- Album art + visualizer -->
    <div style="position:relative;height:180px;flex-shrink:0;overflow:hidden;background:#0a0a12;">
      <canvas id="mp-viz" width="560" height="180" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
      <div style="position:absolute;inset:0;display:flex;align-items:center;padding:20px;gap:18px;pointer-events:none;">
        <div id="mp-art" style="width:110px;height:110px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:52px;box-shadow:0 8px 32px rgba(0,0,0,0.6);transition:transform 0.3s;background:linear-gradient(135deg,#1a1a2e,#2d1b4e);">🎵</div>
        <div style="flex:1;min-width:0;">
          <div id="mp-title"  style="font-size:17px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;">No track selected</div>
          <div id="mp-artist" style="font-size:12.5px;color:rgba(255,255,255,0.55);margin-bottom:10px;">—</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;" id="mp-tags"></div>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div style="padding:10px 18px 0;background:rgba(0,0,0,0.25);">
      <div id="mp-progress-track" style="height:4px;background:rgba(255,255,255,0.12);border-radius:2px;cursor:pointer;position:relative;" onclick="mpSeek(event)">
        <div id="mp-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#a6e3a1,#89dceb);border-radius:2px;pointer-events:none;transition:width 0.25s linear;"></div>
        <div id="mp-progress-dot" style="position:absolute;top:50%;right:auto;left:0%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#a6e3a1;box-shadow:0 0 6px rgba(166,227,161,0.6);pointer-events:none;transition:left 0.25s linear;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <span id="mp-cur" style="font-size:10.5px;color:rgba(255,255,255,0.4);font-variant-numeric:tabular-nums;">0:00</span>
        <span id="mp-dur" style="font-size:10.5px;color:rgba(255,255,255,0.4);font-variant-numeric:tabular-nums;">0:00</span>
      </div>
    </div>

    <!-- Controls -->
    <div style="padding:8px 18px 10px;background:rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;gap:8px;">
      <button onclick="mpToggleShuffle()" id="mp-btn-shuffle" style="width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.35);cursor:pointer;border-radius:6px;font-size:14px;transition:color .15s,background .15s;" title="Shuffle">⇄</button>
      <button onclick="mpPrev()" style="width:38px;height:38px;border:none;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.8);cursor:pointer;border-radius:8px;font-size:16px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'" title="Previous">⏮</button>
      <button onclick="mpTogglePlay()" id="mp-btn-play" style="width:52px;height:52px;border:none;background:linear-gradient(135deg,#a6e3a1,#89dceb);color:#0a1a0a;cursor:pointer;border-radius:50%;font-size:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(166,227,161,0.35);transition:transform .12s,box-shadow .12s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">▶</button>
      <button onclick="mpNext()" style="width:38px;height:38px;border:none;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.8);cursor:pointer;border-radius:8px;font-size:16px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'" title="Next">⏭</button>
      <button onclick="mpToggleRepeat()" id="mp-btn-repeat" style="width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.35);cursor:pointer;border-radius:6px;font-size:14px;transition:color .15s,background .15s;" title="Repeat">↺</button>
      <!-- Volume -->
      <div style="display:flex;align-items:center;gap:6px;margin-left:8px;">
        <span style="font-size:13px;color:rgba(255,255,255,0.4);">🔊</span>
        <input id="mp-volume" type="range" min="0" max="1" step="0.01" value="0.8" oninput="mpSetVolume(this.value)"
          style="width:70px;accent-color:#a6e3a1;cursor:pointer;">
      </div>
    </div>

    <!-- File loader + playlist -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;border-top:1px solid rgba(255,255,255,0.07);">
      <div style="padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
        <span style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,0.35);flex:1;">Playlist</span>
        <label style="padding:4px 12px;border-radius:6px;border:1px solid rgba(166,227,161,0.35);background:rgba(166,227,161,0.08);color:#a6e3a1;cursor:pointer;font-size:11.5px;font-family:inherit;transition:background .15s;" onmouseover="this.style.background='rgba(166,227,161,0.16)'" onmouseout="this.style.background='rgba(166,227,161,0.08)'">
          + Add Files
          <input type="file" accept="audio/*" multiple onchange="mpAddFiles(this)" style="display:none;">
        </label>
        <button onclick="mpClearAll()" style="padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.35);cursor:pointer;font-size:11.5px;font-family:inherit;">Clear</button>
      </div>
      <div id="mp-playlist" style="flex:1;overflow-y:auto;padding:4px 0;"></div>
      <div id="mp-empty" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.22);gap:8px;padding:20px;">
        <div style="font-size:36px;">🎶</div>
        <div style="font-size:12.5px;text-align:center;line-height:1.6;">Click <strong style="color:rgba(166,227,161,0.6);">+ Add Files</strong> to load<br>your music library</div>
      </div>
    </div>

    <audio id="mp-audio" style="display:none;"></audio>
  </div>`;
}

function mountMusicPlayer() {
  const audio    = document.getElementById('mp-audio');
  const vizCanvas= document.getElementById('mp-viz');
  const vctx     = vizCanvas?.getContext('2d');
  if (!audio || !vctx) return;

  let tracks = [], curIdx = -1, shuffle = false, repeat = false;
  let audioCtx, analyser, src, animId;
  const ARTS = ['🎵','🎸','🎹','🎺','🎻','🥁','🎷','🎙️','🎤','💿'];
  const COLORS = [
    ['#a6e3a1','#89dceb'],['#cba6f7','#f38ba8'],['#fab387','#f9e2af'],
    ['#89b4fa','#cba6f7'],['#f38ba8','#fab387'],['#94e2d5','#a6e3a1'],
  ];

  function setupAudioContext() {
    if (audioCtx) return;
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    src = audioCtx.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function drawViz() {
    animId = requestAnimationFrame(drawViz);
    const W = vizCanvas.width, H = vizCanvas.height;
    vctx.clearRect(0,0,W,H);
    // gradient bg
    const bg = vctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'rgba(10,10,20,0.95)');
    bg.addColorStop(1,'rgba(5,5,15,0.85)');
    vctx.fillStyle = bg; vctx.fillRect(0,0,W,H);

    if (!analyser) {
      // idle wave
      const t = Date.now()/1000;
      vctx.beginPath();
      vctx.strokeStyle='rgba(166,227,161,0.2)';
      vctx.lineWidth=1.5;
      for(let x=0;x<W;x++) {
        const y = H/2 + Math.sin(x*0.03+t)*12 + Math.sin(x*0.07+t*1.3)*6;
        x===0 ? vctx.moveTo(x,y) : vctx.lineTo(x,y);
      }
      vctx.stroke();
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bars = data.length;
    const bw   = W / bars;
    const col  = COLORS[curIdx % COLORS.length] || COLORS[0];

    for (let i=0; i<bars; i++) {
      const v = data[i]/255;
      const bh= v * H * 0.85;
      const g = vctx.createLinearGradient(0, H-bh, 0, H);
      g.addColorStop(0, col[0] + 'cc');
      g.addColorStop(1, col[1] + '44');
      vctx.fillStyle = g;
      vctx.fillRect(i*bw + 1, H-bh, bw-1.5, bh);
    }
  }

  function fmtTime(s) {
    s = Math.floor(s||0);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = audio.currentTime / audio.duration * 100;
    const fill = document.getElementById('mp-progress-fill');
    const dot  = document.getElementById('mp-progress-dot');
    const cur  = document.getElementById('mp-cur');
    if(fill) fill.style.width = pct+'%';
    if(dot)  dot.style.left   = pct+'%';
    if(cur)  cur.textContent  = fmtTime(audio.currentTime);
  }

  function loadTrack(idx) {
    if (!tracks.length) return;
    curIdx = (idx + tracks.length) % tracks.length;
    const t = tracks[curIdx];
    audio.src = t.url;
    audio.volume = parseFloat(document.getElementById('mp-volume')?.value||0.8);
    document.getElementById('mp-title').textContent  = t.name;
    document.getElementById('mp-artist').textContent = t.artist||'Unknown Artist';
    document.getElementById('mp-art').textContent    = ARTS[curIdx % ARTS.length];
    document.getElementById('mp-art').style.background = `linear-gradient(135deg,${COLORS[curIdx%COLORS.length][0]}44,${COLORS[curIdx%COLORS.length][1]}44)`;
    document.getElementById('mp-dur').textContent    = fmtTime(t.duration||0);
    // spin art
    const art = document.getElementById('mp-art');
    if(art) { art.style.transform='scale(0.92)'; setTimeout(()=>art.style.transform='scale(1)',180); }
    renderPlaylist();
  }

  function renderPlaylist() {
    const pl   = document.getElementById('mp-playlist');
    const empty= document.getElementById('mp-empty');
    if(!pl) return;
    if(!tracks.length) { pl.innerHTML=''; if(empty) empty.style.display='flex'; return; }
    if(empty) empty.style.display='none';
    pl.innerHTML = tracks.map((t,i)=>`
      <div onclick="mpPlay(${i})" style="display:flex;align-items:center;gap:10px;padding:7px 14px;cursor:pointer;transition:background .1s;border-radius:0;background:${i===curIdx?'rgba(166,227,161,0.1)':'transparent'};" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='${i===curIdx?'rgba(166,227,161,0.1)':'transparent'}'">
        <div style="width:32px;height:32px;border-radius:6px;background:${`linear-gradient(135deg,${COLORS[i%COLORS.length][0]}55,${COLORS[i%COLORS.length][1]}33)`};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${i===curIdx?'▶':'🎵'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12.5px;font-weight:${i===curIdx?'600':'400'};color:${i===curIdx?'#a6e3a1':'rgba(255,255,255,0.8)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);">${t.artist||'Unknown'}</div>
        </div>
        <span style="font-size:11px;color:rgba(255,255,255,0.3);font-variant-numeric:tabular-nums;">${fmtTime(t.duration)}</span>
        <button onclick="event.stopPropagation();mpRemove(${i})" style="border:none;background:transparent;color:rgba(255,255,255,0.2);cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px;transition:color .1s;" onmouseover="this.style.color='#f38ba8'" onmouseout="this.style.color='rgba(255,255,255,0.2)'">✕</button>
      </div>
    `).join('');
  }

  // Exposed globals
  window.mpPlay = function(idx) {
    loadTrack(idx);
    setupAudioContext();
    if(audioCtx.state==='suspended') audioCtx.resume();
    audio.play();
    document.getElementById('mp-btn-play').innerHTML='⏸';
  };

  window.mpTogglePlay = function() {
    if(!tracks.length) return;
    if(curIdx===-1) { mpPlay(0); return; }
    setupAudioContext();
    if(audioCtx.state==='suspended') audioCtx.resume();
    if(audio.paused) { audio.play(); document.getElementById('mp-btn-play').innerHTML='⏸'; }
    else             { audio.pause();document.getElementById('mp-btn-play').innerHTML='▶'; }
  };

  window.mpNext = function() {
    const next = shuffle ? Math.floor(Math.random()*tracks.length) : curIdx+1;
    mpPlay(next % tracks.length);
  };

  window.mpPrev = function() {
    if(audio.currentTime > 3) { audio.currentTime=0; return; }
    mpPlay((curIdx - 1 + tracks.length) % tracks.length);
  };

  window.mpSeek = function(e) {
    if(!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  window.mpSetVolume = function(v) { audio.volume = parseFloat(v); };

  window.mpToggleShuffle = function() {
    shuffle = !shuffle;
    const btn = document.getElementById('mp-btn-shuffle');
    if(btn) btn.style.color = shuffle ? '#a6e3a1' : 'rgba(255,255,255,0.35)';
  };

  window.mpToggleRepeat = function() {
    repeat = !repeat;
    audio.loop = repeat;
    const btn = document.getElementById('mp-btn-repeat');
    if(btn) btn.style.color = repeat ? '#a6e3a1' : 'rgba(255,255,255,0.35)';
  };

  window.mpAddFiles = function(input) {
    const files = Array.from(input.files);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      // Try to get duration
      const tmp = new Audio(url);
      tmp.addEventListener('loadedmetadata', () => {
        tracks.push({ name: f.name.replace(/\.[^.]+$/,''), artist: '', url, duration: tmp.duration });
        renderPlaylist();
        if(curIdx===-1) loadTrack(0);
      });
    });
    input.value='';
  };

  window.mpRemove = function(idx) {
    URL.revokeObjectURL(tracks[idx].url);
    tracks.splice(idx,1);
    if(idx===curIdx) { audio.pause(); audio.src=''; curIdx=-1; document.getElementById('mp-title').textContent='No track selected'; document.getElementById('mp-artist').textContent='—'; document.getElementById('mp-btn-play').innerHTML='▶'; }
    else if(idx<curIdx) curIdx--;
    renderPlaylist();
  };

  window.mpClearAll = function() {
    tracks.forEach(t=>URL.revokeObjectURL(t.url));
    tracks=[]; curIdx=-1;
    audio.pause(); audio.src='';
    document.getElementById('mp-title').textContent='No track selected';
    document.getElementById('mp-artist').textContent='—';
    document.getElementById('mp-btn-play').innerHTML='▶';
    renderPlaylist();
  };

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', ()=>{ document.getElementById('mp-dur').textContent=fmtTime(audio.duration); });
  audio.addEventListener('ended', ()=>{ if(!repeat) mpNext(); });

  drawViz();
  renderPlaylist();
}
