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
            ${user?.username ? user.username.charAt(0).toUpperCase() : 'V'}
          </div>
          <div class="profile-info">
            <h2 id="profile-username">${user?.username || 'Niezalogowany'}</h2>
            <div class="badge-row">
              ${user?.role === 'admin' ? '<span class="badge badge-premium">Admin</span>' : ''}
              ${user?.role === 'developer' ? '<span class="badge badge-dev">Deweloper</span>' : ''}
              ${isAuth ? '<span class="badge badge-online">Online</span>' : ''}
            </div>
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
          `}
        </div>
      </div>
    `;
  }
}

const profilePage = new ProfilePage();
