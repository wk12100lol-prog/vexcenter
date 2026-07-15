function showModal(title, message, type = 'info') {
  const existing = document.getElementById('vex-modal');
  if (existing) existing.remove();

  const colors = {
    info: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', icon: '#7c3aed' },
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '#ef4444' },
  };
  const c = colors[type] || colors.info;

  const modal = document.createElement('div');
  modal.id = 'vex-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;';
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  modal.innerHTML = `
    <div style="background:#1a1a2e;border:1px solid ${c.border};border-radius:16px;padding:28px;width:100%;max-width:380px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:scaleIn 0.2s ease;">
      <div style="width:48px;height:48px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2">
          ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
        </svg>
      </div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:4px;">${title}</h3>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:20px;">${message}</p>
      <button class="btn btn-primary btn-block" id="vex-modal-btn" style="padding:10px;">OK</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('vex-modal-btn').addEventListener('click', () => modal.remove());
  document.getElementById('vex-modal-btn').focus();
}

// confirm dialog returning Promise<boolean>
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vex-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'vex-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;';
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.remove(); resolve(false); } });
    modal.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;width:100%;max-width:360px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:scaleIn 0.2s ease;">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">${title}</h3>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;">${message}</p>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" style="flex:1;padding:10px;" id="vex-confirm-yes">Tak</button>
          <button class="btn btn-ghost" style="flex:1;padding:10px;" id="vex-confirm-no">Nie</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('vex-confirm-yes').addEventListener('click', () => { modal.remove(); resolve(true); });
    document.getElementById('vex-confirm-no').addEventListener('click', () => { modal.remove(); resolve(false); });
  });
}

// logout
function logout() {
  api.setToken(null);
  api.setUser(null);
  localStorage.removeItem('vex_token');
  headerComponent.updateUser(null);
  router.navigate('store');
  location.reload();
}

// Global download manager - persists across page navigation
function addRecentPlay(gameId, title, thumbnail) {
  const recent = JSON.parse(localStorage.getItem('vex_recent') || '[]');
  const filtered = recent.filter(r => r.id !== gameId);
  filtered.unshift({ id: gameId, title, thumbnail, timestamp: Date.now() });
  localStorage.setItem('vex_recent', JSON.stringify(filtered.slice(0, 10)));
}

const downloadManager = {
  active: false,
  gameId: null,
  gameTitle: '',
  progress: 0,
  label: '',
  onComplete: null,
  _barEl: null,
  _watchdog: null,

  show(gameId, title) {
    this.active = true;
    this.gameId = gameId;
    this.gameTitle = title;
    this.progress = 0;
    this.label = 'Pobieranie...';
    this._createBar();
    this._startWatchdog();
  },

  updateProgress(pct, labelText) {
    this.progress = pct;
    if (labelText) this.label = labelText;
    this._updateBar();
  },

  complete() {
    this.active = false;
    this._stopWatchdog();
    this._removeBar();
    if (this.onComplete) {
      this.onComplete(this.gameId);
      this.onComplete = null;
    }
  },

  fail(error) {
    this.updateProgress(0, 'Błąd: ' + error);
    setTimeout(() => { this.active = false; this._stopWatchdog(); this._removeBar(); }, 4000);
  },

  _startWatchdog() {
    this._stopWatchdog();
    this._watchdog = setInterval(() => {
      if (!this.active) { this._stopWatchdog(); return; }
      if (!document.getElementById('dl-bar')) this._createBar();
      else this._updateBar();
    }, 500);
  },

  _stopWatchdog() {
    if (this._watchdog) { clearInterval(this._watchdog); this._watchdog = null; }
  },

  _createBar() {
    this._removeBar();
    const bar = document.createElement('div');
    bar.id = 'dl-bar';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#1a1a2e;border-top:1px solid var(--glass-border);padding:10px 20px;display:flex;align-items:center;gap:16px;animation:slideUp 0.2s ease;';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" style="flex-shrink:0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="dl-bar-title">${this.gameTitle}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.4);flex-shrink:0;" id="dl-bar-label">${this.label}</span>
      </div>
      <div style="width:160px;flex-shrink:0;">
        <div style="height:5px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden;">
          <div id="dl-bar-fill" style="height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#7c3aed,#a855f7);transition:width 0.3s;"></div>
        </div>
      </div>
      <span style="font-size:11px;color:rgba(255,255,255,0.3);width:40px;text-align:right;flex-shrink:0;" id="dl-bar-pct">0%</span>
    `;
    document.body.appendChild(bar);
    this._barEl = bar;
  },

  _updateBar() {
    if (!this._barEl && !document.getElementById('dl-bar')) return;
    if (!this._barEl) this._barEl = document.getElementById('dl-bar');
    const fill = document.getElementById('dl-bar-fill');
    const pctEl = document.getElementById('dl-bar-pct');
    const labelEl = document.getElementById('dl-bar-label');
    if (fill) fill.style.width = this.progress + '%';
    if (pctEl) pctEl.textContent = Math.round(this.progress) + '%';
    if (labelEl) labelEl.textContent = this.label;
  },

  _removeBar() {
    if (this._barEl) { this._barEl.remove(); this._barEl = null; }
  }
};

// Launch overlay
function showLaunchOverlay(title) {
  const existing = document.getElementById('vex-launch-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'vex-launch-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;';
  overlay.innerHTML = `
    <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="width:32px;height:32px;border:3px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <div style="font-size:15px;font-weight:600;">Uruchamianie...</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px;">${title}</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLaunchOverlay() {
  const el = document.getElementById('vex-launch-overlay');
  if (el) el.remove();
}

// Prompt dialog returning Promise<string|null>
function showPrompt(title, placeholder = '', defaultValue = '') {
  return new Promise((resolve) => {
    const existing = document.getElementById('vex-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'vex-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease;';
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.remove(); resolve(null); } });
    modal.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;width:100%;max-width:380px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:scaleIn 0.2s ease;">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">${title}</h3>
        <input type="text" id="vex-prompt-input" placeholder="${placeholder}" value="${defaultValue}" style="width:100%;padding:10px 12px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.04);color:#fff;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:16px;">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" style="flex:1;padding:10px;" id="vex-prompt-ok">OK</button>
          <button class="btn btn-ghost" style="flex:1;padding:10px;" id="vex-prompt-cancel">Anuluj</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const input = document.getElementById('vex-prompt-input');
    input.focus();
    input.select();
    document.getElementById('vex-prompt-ok').addEventListener('click', () => { modal.remove(); resolve(input.value); });
    document.getElementById('vex-prompt-cancel').addEventListener('click', () => { modal.remove(); resolve(null); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { modal.remove(); resolve(input.value); } if (e.key === 'Escape') { modal.remove(); resolve(null); } });
  });
}
