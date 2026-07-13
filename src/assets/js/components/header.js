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

    document.getElementById('global-search')?.addEventListener('input', (e) => {
      console.log('[Szukaj]', e.target.value);
    });

    document.getElementById('header-user-btn')?.addEventListener('click', () => {
      router.navigate('profile');
    });

    document.getElementById('notif-btn')?.addEventListener('click', async () => {
      if (!api.isAuthenticated) return;
      const n = await api.getNotifications().catch(() => ({ notifications: [] }));
      const list = n.notifications || [];
      const msg = list.length ? list.map(x => x.message).join('\n') : 'Brak powiadomień';
      alert(msg);
    });
  }

  updateUser(user) {
    const avatarEl = document.getElementById('header-avatar');
    const usernameEl = document.getElementById('header-username');
    if (!user) {
      avatarEl.textContent = 'V';
      usernameEl.textContent = 'Niezalogowany';
      return;
    }
    avatarEl.textContent = user.username ? user.username.charAt(0).toUpperCase() : 'V';
    usernameEl.textContent = user.username || 'Nieznany';
  }
}

const headerComponent = new HeaderComponent();
