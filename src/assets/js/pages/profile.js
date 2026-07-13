class ProfilePage {
  async render(container) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    let user = api.user;
    if (!user && api.token) {
      try {
        const data = await api.getProfile();
        user = data.user || data;
        api.setUser(user);
        headerComponent.updateUser(user);
      } catch {}
    }

    const isAuth = !!user;

    container.innerHTML = `
      <div class="page profile-page">
        <div class="profile-header-card">
          <div class="profile-avatar" id="profile-avatar">
            ${user?.avatar ? '<img src="'+user.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />' : (user?.username ? user.username.charAt(0).toUpperCase() : 'V')}
          </div>
          <div class="profile-info">
            <h2 id="profile-username">${user?.username || 'Niezalogowany'}</h2>
            <div class="badge-row">
              ${user?.role === 'admin' ? '<span class="badge badge-premium">Admin</span>' : ''}
              ${user?.role === 'developer' ? '<span class="badge badge-dev">Deweloper</span>' : ''}
              ${isAuth ? '<span class="badge badge-online">Online</span>' : ''}
            </div>
            ${isAuth ? '<p style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px;">' + (user?.status_message || '') + '</p>' : ''}
            <div class="profile-stats">
              <div class="stat">
                <div class="value">${user?.gameCount || 0}</div>
                <div class="label">Gry</div>
              </div>
              <div class="stat">
                <div class="value">${user?.reviewCount || 0}</div>
                <div class="label">Opinie</div>
              </div>
              <div class="stat">
                <div class="value">${user?.friendCount || 0}</div>
                <div class="label">Znajomi</div>
              </div>
            </div>
          </div>
        </div>

        <div id="profile-content">
          ${!isAuth ? `
            <div class="empty-state">
              <div class="icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Profil użytkownika</h3>
              <p>Zaloguj się, aby zobaczyć swój profil.</p>
              <button class="btn btn-primary" onclick="router.navigate('auth')">Zaloguj się</button>
            </div>
          ` : `
            <div class="section">
              <div class="section-header"><h2>Ostatnio grane</h2></div>
              <div class="empty-state" style="padding: 32px;"><p style="margin:0;">Brak ostatnio granych gier.</p></div>
            </div>
            <div class="section">
              <div class="section-header"><h2>Osiągnięcia</h2></div>
              <div class="empty-state" style="padding: 32px;"><p style="margin:0;">Brak osiągnięć. Graj, aby zdobywać!</p></div>
            </div>
            <div class="section">
              <div class="section-header"><h2>Znajomi</h2></div>
              <div id="profile-friends"><div class="loading"><div class="spinner"></div></div></div>
            </div>
          `}
        </div>
      </div>
    `;

    if (isAuth) {
      this.loadFriends();
    }
  }

  async loadFriends() {
    const el = document.getElementById('profile-friends');
    if (!el) return;
    try {
      const data = await api.getFriends();
      const fl = data.friends || [];
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:14px;font-weight:600;">${fl.length} znajomych</span>
          <button class="btn btn-secondary btn-sm" id="pf-add-friend">+ Dodaj znajomego</button>
        </div>
        ${fl.length ? fl.map(f => `
          <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--glass-border);">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;overflow:hidden;${f.avatar ? 'background:none;' : ''}">
              ${f.avatar ? '<img src="'+f.avatar+'" style="width:100%;height:100%;object-fit:cover;" />' : (f.username ? f.username.charAt(0).toUpperCase() : '?')}
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:600;">${f.username}</div>
              ${f.status_message ? '<div style="font-size:11px;color:rgba(255,255,255,0.3);">'+f.status_message+'</div>' : ''}
            </div>
          </div>
        `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:16px;">Brak znajomych</p>'}
      `;
      document.getElementById('pf-add-friend')?.addEventListener('click', () => this.showAddFriendModal());
    } catch {
      el.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:16px;">Błąd ładowania znajomych</p>';
    }
  }

  showAddFriendModal() {
    const existing = document.getElementById('add-friend-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'add-friend-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.innerHTML = `
      <div style="background:#1a1a2e;border-radius:16px;padding:24px;width:100%;max-width:380px;">
        <h3 style="margin-bottom:16px;">Dodaj znajomego</h3>
        <div class="form-group">
          <label>Wyszukaj użytkownika</label>
          <input type="text" id="af-search" placeholder="Nazwa użytkownika..." minlength="2" />
        </div>
        <div id="af-results" style="margin-top:8px;max-height:200px;overflow-y:auto;"></div>
        <button class="btn btn-ghost" id="af-close" style="margin-top:12px;width:100%;">Anuluj</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('af-close').addEventListener('click', () => modal.remove());

    let timeout;
    document.getElementById('af-search').addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const q = e.target.value.trim();
        const results = document.getElementById('af-results');
        if (q.length < 2) { results.innerHTML = ''; return; }
        results.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:13px;">Szukanie...</p>';
        try {
          const data = await api.searchUsers(q);
          const users = data.users || [];
          if (users.length === 0) {
            results.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:13px;">Nie znaleziono użytkowników.</p>';
            return;
          }
          results.innerHTML = users.map(u => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px;cursor:pointer;" class="af-user" data-id="${u.id}" data-name="${u.username}">
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;overflow:hidden;${u.avatar ? 'background:none;' : ''}">
                ${u.avatar ? '<img src="'+u.avatar+'" style="width:100%;height:100%;object-fit:cover;" />' : u.username.charAt(0).toUpperCase()}
              </div>
              <div style="flex:1;font-size:13px;">${u.username}</div>
            </div>
          `).join('');
          results.querySelectorAll('.af-user').forEach(el => {
            el.addEventListener('click', async () => {
              const id = parseInt(el.getAttribute('data-id'));
              const name = el.getAttribute('data-name');
              try {
                await api.addFriend(id);
                alert('Wysłano zaproszenie do ' + name + '!');
                modal.remove();
              } catch (err) {
                alert(err.message);
              }
            });
          });
        } catch {
          results.innerHTML = '<p style="color:#ef4444;font-size:13px;">Błąd wyszukiwania</p>';
        }
      }, 300);
    });
  }
}

const profilePage = new ProfilePage();
