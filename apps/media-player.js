/* ═══════════════════════════════════════════════════
   apps/media-player.js  —  Video / Media Player
   Supports: mp4, webm, mkv, ogg, avi + audio files
   Now includes: built-in video library sidebar
═══════════════════════════════════════════════════ */

function renderMediaPlayer() {
  return `
  <div id="mdp-root" style="display:flex;flex-direction:row;height:100%;background:#000;overflow:hidden;">

    <!-- ── Library Sidebar ── -->
    <div id="mdp-sidebar" style="
      width:210px;min-width:210px;max-width:210px;
      display:flex;flex-direction:column;
      background:#0c0c12;
      border-right:1px solid rgba(255,255,255,0.07);
      overflow:hidden;
      transition:width 0.25s ease,min-width 0.25s ease,opacity 0.25s ease;
    ">
      <!-- Sidebar header -->
      <div style="padding:10px 12px 6px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
        <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;">Library</span>
        <button onclick="mdpToggleSidebar()" style="width:22px;height:22px;border:none;background:transparent;color:rgba(255,255,255,0.3);cursor:pointer;font-size:13px;line-height:1;border-radius:4px;padding:0;" title="Hide sidebar" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">✕</button>
      </div>

      <!-- Sidebar list -->
      <div id="mdp-lib-list" style="flex:1;overflow-y:auto;padding:6px 0;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent;">
        <!-- Populated by mountMediaPlayer() -->
      </div>

      <!-- Sidebar footer: open file -->
      <div style="padding:8px 10px;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
        <label style="
          display:flex;align-items:center;gap:7px;
          padding:6px 10px;border-radius:7px;
          border:1px solid rgba(243,139,168,0.3);
          background:rgba(243,139,168,0.06);
          color:#f38ba8;cursor:pointer;font-size:11px;
          font-family:inherit;transition:background .15s;
          white-space:nowrap;
        " onmouseover="this.style.background='rgba(243,139,168,0.14)'" onmouseout="this.style.background='rgba(243,139,168,0.06)'">
          📂 Open File
          <input type="file" accept="video/*,audio/*" onchange="mdpOpenFile(this)" style="display:none;">
        </label>
      </div>
    </div>

    <!-- ── Main area ── -->
    <div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;">

      <!-- Video viewport -->
      <div id="mdp-viewport" style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;background:#050508;overflow:hidden;min-height:0;cursor:none;" ondblclick="mdpToggleFullscreen()" onmousemove="mdpShowControls()">
        <video id="mdp-video" style="max-width:100%;max-height:100%;object-fit:contain;display:block;outline:none;" tabindex="-1"></video>

        <!-- Placeholder when no file -->
        <div id="mdp-placeholder" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;pointer-events:none;">
          <div style="font-size:56px;opacity:0.2;">🎬</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.22);text-align:center;">Select a video from the library<br>or open a file</div>
        </div>

        <!-- Big center play/pause flash -->
        <div id="mdp-flash" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity 0.3s;">
          <div style="width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;font-size:32px;backdrop-filter:blur(8px);">▶</div>
        </div>

        <!-- Title overlay -->
        <div id="mdp-title-overlay" style="position:absolute;top:0;left:0;right:0;padding:10px 14px;background:linear-gradient(to bottom,rgba(0,0,0,0.7),transparent);pointer-events:none;opacity:0;transition:opacity 0.3s;display:flex;align-items:center;gap:8px;">
          <!-- Sidebar toggle (shown when sidebar is hidden) -->
          <button id="mdp-sidebar-show-btn" onclick="mdpToggleSidebar()" style="display:none;width:26px;height:26px;border:none;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:12px;border-radius:5px;backdrop-filter:blur(6px);pointer-events:all;flex-shrink:0;" title="Show library" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">☰</button>
          <div id="mdp-title-text" style="font-size:13px;color:rgba(255,255,255,0.8);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
        </div>

        <!-- Controls overlay -->
        <div id="mdp-controls" style="position:absolute;bottom:0;left:0;right:0;padding:0 12px 10px;background:linear-gradient(to top,rgba(0,0,0,0.85),transparent);opacity:0;transition:opacity 0.3s;cursor:default;">

          <!-- Progress -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span id="mdp-cur" style="font-size:11px;color:rgba(255,255,255,0.6);font-variant-numeric:tabular-nums;width:36px;">0:00</span>
            <div id="mdp-prog-track" style="flex:1;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;cursor:pointer;position:relative;" onclick="mdpSeek(event)" onmousemove="mdpHoverProgress(event)" onmouseout="mdpHidePreview()">
              <div id="mdp-prog-buf"  style="position:absolute;top:0;left:0;height:100%;background:rgba(255,255,255,0.18);border-radius:2px;width:0%;pointer-events:none;"></div>
              <div id="mdp-prog-fill" style="position:absolute;top:0;left:0;height:100%;background:linear-gradient(90deg,#f38ba8,#fab387);border-radius:2px;width:0%;pointer-events:none;transition:width 0.2s linear;"></div>
              <div id="mdp-prog-dot"  style="position:absolute;top:50%;left:0%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#f38ba8;pointer-events:none;transition:left 0.2s linear;box-shadow:0 0 6px rgba(243,139,168,0.6);"></div>
            </div>
            <span id="mdp-dur" style="font-size:11px;color:rgba(255,255,255,0.6);font-variant-numeric:tabular-nums;width:36px;text-align:right;">0:00</span>
          </div>

          <!-- Buttons row -->
          <div style="display:flex;align-items:center;gap:4px;">
            <button onclick="mdpTogglePlay()" id="mdp-btn-play" style="width:36px;height:36px;border:none;background:transparent;color:#fff;cursor:pointer;font-size:18px;border-radius:6px;transition:background .15s;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">▶</button>
            <button onclick="mdpPrevTrack()" style="width:34px;height:34px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;border-radius:6px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'" title="Previous">⏮</button>
            <button onclick="mdpNextTrack()" style="width:34px;height:34px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;border-radius:6px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'" title="Next">⏭</button>
            <button onclick="mdpSkip(-10)" style="width:34px;height:34px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:12px;border-radius:6px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'" title="-10s">⏪</button>
            <button onclick="mdpSkip(10)"  style="width:34px;height:34px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:12px;border-radius:6px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'" title="+10s">⏩</button>

            <!-- Volume -->
            <button onclick="mdpToggleMute()" id="mdp-btn-mute" style="width:30px;height:30px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;border-radius:6px;" title="Mute">🔊</button>
            <input id="mdp-vol" type="range" min="0" max="1" step="0.01" value="1" oninput="mdpSetVol(this.value)" style="width:60px;accent-color:#f38ba8;cursor:pointer;">

            <span style="flex:1;"></span>

            <!-- Playback speed -->
            <select id="mdp-speed" onchange="mdpSetSpeed(this.value)" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:11px;padding:3px 6px;border-radius:5px;cursor:pointer;font-family:inherit;outline:none;">
              <option value="0.5">0.5×</option>
              <option value="0.75">0.75×</option>
              <option value="1" selected>1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>

            <!-- Fullscreen -->
            <button onclick="mdpToggleFullscreen()" style="width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;border-radius:6px;transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'" title="Fullscreen">⛶</button>
          </div>
        </div>
      </div>

      <!-- Bottom status bar -->
      <div style="padding:6px 12px;display:flex;align-items:center;gap:10px;background:rgba(8,8,14,0.95);border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;">
        <div id="mdp-filename" style="flex:1;font-size:11px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">No file loaded</div>
        <div id="mdp-resolution" style="font-size:11px;color:rgba(255,255,255,0.2);white-space:nowrap;"></div>
      </div>

    </div><!-- /main area -->
  </div>`;
}

function mountMediaPlayer() {
  const video = document.getElementById('mdp-video');
  if (!video) return;

  let hideTimer, muted = false;
  let currentLibIndex = -1;   // index into VIDEO_LIBRARY (-1 = file-opened)
  let sidebarVisible  = true;

  /* ── helpers ── */
  function fmtTime(s) {
    s = Math.floor(s || 0);
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  }

  function updateProgress() {
    if (!video.duration) return;
    const pct  = video.currentTime / video.duration * 100;
    const fill = document.getElementById('mdp-prog-fill');
    const dot  = document.getElementById('mdp-prog-dot');
    const cur  = document.getElementById('mdp-cur');
    if (fill) fill.style.width = pct + '%';
    if (dot)  dot.style.left   = pct + '%';
    if (cur)  cur.textContent  = fmtTime(video.currentTime);
    if (video.buffered.length) {
      const buf = document.getElementById('mdp-prog-buf');
      if (buf) buf.style.width = (video.buffered.end(video.buffered.length - 1) / video.duration * 100) + '%';
    }
  }

  function flash(icon) {
    const el = document.getElementById('mdp-flash');
    if (!el) return;
    el.querySelector('div').textContent = icon;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 500);
  }

  /* ── build library list ── */
  function buildLibrary() {
    const list = document.getElementById('mdp-lib-list');
    if (!list) return;

    const lib = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY : [];

    if (lib.length === 0) {
      list.innerHTML = `<div style="padding:16px 14px;font-size:11px;color:rgba(255,255,255,0.25);text-align:center;line-height:1.6;">
        No videos configured.<br>
        Edit <code style="color:#f38ba8;font-size:10px;">js/video-library.js</code><br>
        to add your videos.
      </div>`;
      return;
    }

    list.innerHTML = lib.map((v, i) => `
      <div class="mdp-lib-item" id="mdp-lib-${i}" onclick="mdpPlayLibItem(${i})" style="
        display:flex;align-items:center;gap:9px;
        padding:7px 10px;cursor:pointer;
        border-left:2px solid transparent;
        transition:background .12s,border-color .12s;
        user-select:none;
      " onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=(${i}===window._mdpCurrentIdx?'rgba(243,139,168,0.08)':'transparent')">
        <!-- Thumbnail / icon -->
        <div style="width:38px;height:26px;border-radius:4px;overflow:hidden;flex-shrink:0;background:#1a1a22;display:flex;align-items:center;justify-content:center;">
          ${v.thumbnail
            ? `<img src="${v.thumbnail}" style="width:100%;height:100%;object-fit:cover;">`
            : `<span style="font-size:14px;opacity:0.4;">🎬</span>`}
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:0;">
          <div style="font-size:11.5px;color:rgba(255,255,255,0.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;">${v.title}</div>
          ${v.duration ? `<div style="font-size:10px;color:rgba(255,255,255,0.28);margin-top:1px;">${v.duration}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  function setActiveLibItem(idx) {
    // Clear old
    document.querySelectorAll('.mdp-lib-item').forEach(el => {
      el.style.background      = 'transparent';
      el.style.borderLeftColor = 'transparent';
    });
    if (idx < 0) return;
    const el = document.getElementById(`mdp-lib-${idx}`);
    if (el) {
      el.style.background      = 'rgba(243,139,168,0.08)';
      el.style.borderLeftColor = '#f38ba8';
      el.scrollIntoView({ block: 'nearest' });
    }
    window._mdpCurrentIdx = idx;
  }

  function loadVideo(src, title, libIdx) {
    if (video.src && video.src.startsWith('blob:')) URL.revokeObjectURL(video.src);
    video.src = src;
    video.load();
    document.getElementById('mdp-title-text').textContent  = title;
    document.getElementById('mdp-filename').textContent    = title;
    document.getElementById('mdp-placeholder').style.display = 'none';
    document.getElementById('mdp-resolution').textContent  = '';
    document.getElementById('mdp-btn-play').textContent    = '⏸';
    currentLibIndex = libIdx;
    setActiveLibItem(libIdx);
    video.play().catch(() => {});
    video.addEventListener('loadedmetadata', () => {
      document.getElementById('mdp-dur').textContent = fmtTime(video.duration);
      if (video.videoWidth) {
        document.getElementById('mdp-resolution').textContent = `${video.videoWidth}×${video.videoHeight}`;
      }
    }, { once: true });
  }

  /* ── public API ── */
  window._mdpCurrentIdx = -1;

  window.mdpPlayLibItem = function(idx) {
    const lib = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY : [];
    if (idx < 0 || idx >= lib.length) return;
    const v = lib[idx];
    loadVideo(v.src, v.title, idx);
  };

  window.mdpToggleSidebar = function() {
    const sidebar  = document.getElementById('mdp-sidebar');
    const showBtn  = document.getElementById('mdp-sidebar-show-btn');
    sidebarVisible = !sidebarVisible;
    if (sidebarVisible) {
      sidebar.style.width    = '210px';
      sidebar.style.minWidth = '210px';
      sidebar.style.opacity  = '1';
      sidebar.style.pointerEvents = 'all';
      if (showBtn) showBtn.style.display = 'none';
    } else {
      sidebar.style.width    = '0';
      sidebar.style.minWidth = '0';
      sidebar.style.opacity  = '0';
      sidebar.style.pointerEvents = 'none';
      if (showBtn) showBtn.style.display = 'flex';
    }
  };

  window.mdpTogglePlay = function() {
    if (!video.src) return;
    if (video.paused) { video.play(); flash('▶'); document.getElementById('mdp-btn-play').textContent = '⏸'; }
    else              { video.pause(); flash('⏸'); document.getElementById('mdp-btn-play').textContent = '▶'; }
  };

  window.mdpPrevTrack = function() {
    const lib = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY : [];
    if (!lib.length) return;
    const next = currentLibIndex <= 0 ? lib.length - 1 : currentLibIndex - 1;
    mdpPlayLibItem(next);
  };

  window.mdpNextTrack = function() {
    const lib = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY : [];
    if (!lib.length) return;
    const next = (currentLibIndex + 1) % lib.length;
    mdpPlayLibItem(next);
  };

  window.mdpSeek = function(e) {
    if (!video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    video.currentTime = (e.clientX - rect.left) / rect.width * video.duration;
  };

  window.mdpHoverProgress = function() {
    const dot = document.getElementById('mdp-prog-dot');
    if (dot) dot.style.transform = 'translate(-50%,-50%) scale(1.4)';
  };

  window.mdpHidePreview = function() {
    const dot = document.getElementById('mdp-prog-dot');
    if (dot) dot.style.transform = 'translate(-50%,-50%) scale(1)';
  };

  window.mdpSkip = function(s) {
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + s));
    flash(s > 0 ? '+10s' : '-10s');
  };

  window.mdpSetVol = function(v) { video.volume = parseFloat(v); muted = v == 0; };

  window.mdpToggleMute = function() {
    muted = !muted; video.muted = muted;
    document.getElementById('mdp-btn-mute').textContent = muted ? '🔇' : '🔊';
  };

  window.mdpSetSpeed = function(v) { video.playbackRate = parseFloat(v); };

  window.mdpShowControls = function() {
    const ctrl  = document.getElementById('mdp-controls');
    const title = document.getElementById('mdp-title-overlay');
    const vp    = document.getElementById('mdp-viewport');
    if (ctrl)  ctrl.style.opacity  = '1';
    if (title) title.style.opacity = '1';
    if (vp)    vp.style.cursor     = 'default';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!video.paused) {
        if (ctrl)  ctrl.style.opacity  = '0';
        if (title) title.style.opacity = '0';
        if (vp)    vp.style.cursor     = 'none';
      }
    }, 2500);
  };

  window.mdpToggleFullscreen = function() {
    const vp = document.getElementById('mdp-viewport');
    if (!document.fullscreenElement) vp?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  window.mdpOpenFile = function(input) {
    const file = input.files[0];
    if (!file) return;
    const url  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '');
    loadVideo(url, name, -1);   // -1 = not a library item
    document.getElementById('mdp-filename').textContent = file.name;
    input.value = '';
  };

  /* ── keyboard shortcuts ── */
  const keyHandler = e => {
    const win = document.getElementById('win-mediaplayer');
    if (!win || win.style.display === 'none' || win.classList.contains('hidden')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space')      { e.preventDefault(); mdpTogglePlay(); }
    if (e.code === 'ArrowLeft')  { e.preventDefault(); mdpSkip(-5); }
    if (e.code === 'ArrowRight') { e.preventDefault(); mdpSkip(5); }
    if (e.code === 'ArrowUp')    { e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); document.getElementById('mdp-vol').value = video.volume; }
    if (e.code === 'ArrowDown')  { e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); document.getElementById('mdp-vol').value = video.volume; }
    if (e.key === 'm' || e.key === 'M') mdpToggleMute();
    if (e.key === 'f' || e.key === 'F') mdpToggleFullscreen();
    if (e.key === 'n' || e.key === 'N') mdpNextTrack();
    if (e.key === 'p' || e.key === 'P') mdpPrevTrack();
  };
  document.addEventListener('keydown', keyHandler);

  /* ── video events ── */
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('ended', () => {
    document.getElementById('mdp-btn-play').textContent = '▶';
    // Auto-advance to next in library
    const lib = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY : [];
    if (currentLibIndex >= 0 && lib.length > 1) {
      setTimeout(() => mdpNextTrack(), 800);
    }
  });
  video.addEventListener('click', mdpTogglePlay);
  document.getElementById('mdp-viewport')?.addEventListener('mouseenter', mdpShowControls);

  /* ── init ── */
  buildLibrary();
}