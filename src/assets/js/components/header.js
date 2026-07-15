class HeaderComponent {
  constructor() {
    this.el = document.querySelector('vc-header');
  }

  render() {
    this.el.innerHTML = `
      <div class="header-inner">
        <div class="header-search">
          <span class="search-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          </span>
          <input type="text" placeholder="Szukaj gier, modów, twórców..." id="global-search" />
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="notif-btn" title="Powiadomienia">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="dot"></span>
          </button>
          <div class="header-user" id="header-user-btn">
            <div class="avatar" id="header-avatar">V</div>
            <span class="username" id="header-username">Niezalogowany</span>
          </div>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('global-search');
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchResults.style.cssText = 'position:absolute;top:100%;left:0;right:0;z-index:999;background:#1a1a2e;border:1px solid var(--glass-border);border-radius:0 0 12px 12px;max-height:400px;overflow-y:auto;display:none;';
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(searchResults);

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const q = e.target.value.trim();
      if (q.length < 2) { searchResults.style.display = 'none'; return; }
      searchTimeout = setTimeout(async () => {
        searchResults.innerHTML = '<div style="padding:12px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">Szukanie...</div>';
        searchResults.style.display = 'block';
        try {
          const data = await api.searchGames(q);
          const games = data.games || [];
          if (games.length === 0) {
            searchResults.innerHTML = '<div style="padding:12px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">Brak wyników</div>';
            return;
          }
          searchResults.innerHTML = games.map(g => `
            <div class="search-result-item" data-id="${g.id}" style="display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;transition:background 0.15s;"
                 onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''">
              <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#7c3aed20,#a855f720);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;${g.thumbnail ? 'background:none;' : ''}">
                ${g.thumbnail ? '<img src="'+img(g.thumbnail)+'" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'" />' : '<span style="font-size:18px;opacity:0.3;">🎮</span>'}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;">${g.title}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.3);">${g.price > 0 ? g.price.toFixed(2)+' zł' : 'Darmowa'}${g.rating ? ' • ★ '+g.rating : ''}</div>
              </div>
            </div>
          `).join('');
          searchResults.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
              searchResults.style.display = 'none';
              searchInput.value = '';
              router.navigate('game', { id: parseInt(el.dataset.id) });
            });
          });
        } catch { searchResults.innerHTML = '<div style="padding:12px;text-align:center;color:#ef4444;font-size:13px;">Błąd wyszukiwania</div>'; }
      }, 300);
    });
    searchInput.addEventListener('blur', () => setTimeout(() => searchResults.style.display = 'none', 200));
    searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length >= 2) searchResults.style.display = 'block'; });

    document.getElementById('header-user-btn')?.addEventListener('click', () => {
      router.navigate('profile');
    });

    document.getElementById('notif-btn')?.addEventListener('click', () => {
      if (!api.isAuthenticated) return;
      this.openNotifPanel();
    });
  }

  updateUser(user) {
    const avatarEl = document.getElementById('header-avatar');
    const usernameEl = document.getElementById('header-username');
    if (!user) {
      avatarEl.textContent = 'V';
      avatarEl.innerHTML = 'V';
      usernameEl.textContent = 'Niezalogowany';
      return;
    }
    if (user.avatar) {
      avatarEl.innerHTML = '<img src="'+img(user.avatar)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display=\'none\'" />';
    } else {
      avatarEl.textContent = user.username ? user.username.charAt(0).toUpperCase() : 'V';
    }
    usernameEl.textContent = user.username || 'Nieznany';
  }

  async openNotifPanel() {
    const existing = document.getElementById('notif-panel');
    if (existing) { existing.remove(); return; }

    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = 'position:fixed;bottom:0;right:140px;width:360px;height:440px;z-index:9999;background:#1a1a2e;border:1px solid var(--glass-border);border-radius:12px 12px 0 0;display:flex;flex-direction:column;animation:slideUp 0.2s ease;overflow:hidden;';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--glass-border);">
        <strong>Powiadomienia</strong>
        <button id="notif-panel-close" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;">✕</button>
      </div>
      <div id="notif-list" style="flex:1;overflow-y:auto;padding:8px;"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById('notif-panel-close').addEventListener('click', () => panel.remove());

    const list = document.getElementById('notif-list');
    list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:13px;">Ładowanie...</div>';

    try {
      const n = await api.getNotifications();
      const items = n.notifications || [];
      if (items.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:13px;">Brak powiadomień</div>';
        return;
      }
      list.innerHTML = items.map(notif => `
        <div style="padding:12px;border-bottom:1px solid var(--glass-border);${notif.is_read ? 'opacity:0.5;' : ''}">
          <div style="font-size:13px;">${notif.message}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;">${notif.created_at || ''}</div>
        </div>
      `).join('');
      await api.markNotificationsRead();
    } catch {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;font-size:13px;">Błąd ładowania</div>';
    }
  }

}

const headerComponent = new HeaderComponent();
