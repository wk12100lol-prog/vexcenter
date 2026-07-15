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
    const searchWrapper = searchInput.parentElement;
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchResults.style.cssText = 'position:absolute;top:100%;left:0;right:0;z-index:999;background:#1a1a2e;border:1px solid var(--glass-border);border-radius:0 0 12px 12px;max-height:400px;overflow-y:auto;display:none;';
    const filterBar = document.createElement('div');
    filterBar.id = 'search-filter-bar';
    filterBar.style.cssText = 'display:none;gap:4px;padding:6px 10px;border-top:1px solid var(--glass-border);flex-wrap:wrap;';
    const filters = [
      { key: 'all', label: 'All' },
      { key: 'free', label: 'Darmowe' },
      { key: 'paid', label: 'Płatne' },
      { key: 'top', label: 'Najwyżej oceniane' }
    ];
    let activeFilter = 'all';
    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.textContent = f.label;
      btn.dataset.filter = f.key;
      btn.style.cssText = 'padding:3px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:'+(f.key==='all'?'rgba(124,58,237,0.2)':'transparent')+';color:'+(f.key==='all'?'var(--purple-300)':'rgba(255,255,255,0.4)')+';font-size:11px;cursor:pointer;font-family:var(--font);font-weight:500;transition:all 0.15s;';
      filterBar.appendChild(btn);
    });
    searchWrapper.style.position = 'relative';
    searchWrapper.appendChild(searchResults);
    searchWrapper.appendChild(filterBar);

    let searchTimeout;
    async function performSearch(q, filter) {
      searchResults.innerHTML = '<div style="padding:12px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">Szukanie...</div>';
      searchResults.style.display = 'block';
      filterBar.style.display = 'flex';
      try {
        let data;
        if (filter === 'free') data = await api.searchGames(q);
        else if (filter === 'paid') data = await api.searchGames(q);
        else if (filter === 'top') data = await api.searchGames(q);
        else data = await api.searchGames(q);
        let games = data.games || [];
        if (filter === 'free') games = games.filter(g => g.price === 0 || g.price === '0.00');
        else if (filter === 'paid') games = games.filter(g => g.price > 0);
        else if (filter === 'top') games = games.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
            filterBar.style.display = 'none';
            searchInput.value = '';
            router.navigate('game', { id: parseInt(el.dataset.id) });
          });
        });
      } catch { searchResults.innerHTML = '<div style="padding:12px;text-align:center;color:#ef4444;font-size:13px;">Błąd wyszukiwania</div>'; }
    }
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const q = e.target.value.trim();
      if (q.length < 2) { searchResults.style.display = 'none'; filterBar.style.display = 'none'; return; }
      searchTimeout = setTimeout(() => performSearch(q, activeFilter), 300);
    });
    searchInput.addEventListener('blur', () => setTimeout(() => { searchResults.style.display = 'none'; filterBar.style.display = 'none'; }, 200));
    searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length >= 2) { searchResults.style.display = 'block'; filterBar.style.display = 'flex'; } });
    filterBar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('button').forEach(b => { b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.4)'; });
        btn.style.background = 'rgba(124,58,237,0.2)'; btn.style.color = 'var(--purple-300)';
        activeFilter = btn.dataset.filter;
        const q = searchInput.value.trim();
        if (q.length >= 2) performSearch(q, activeFilter);
      });
    });

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
