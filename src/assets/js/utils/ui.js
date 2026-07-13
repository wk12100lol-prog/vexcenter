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
