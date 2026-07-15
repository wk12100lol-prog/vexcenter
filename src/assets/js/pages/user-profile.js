class UserProfilePage {
  async render(container, params) {
    const userId = typeof params === 'object' ? params?.id : params;
    if (!userId) { container.innerHTML = '<div class="empty-state"><h3>Nieprawidłowe ID użytkownika</h3></div>'; return; }
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const data = await api.get('user/public-profile?id=' + userId);
      const u = data.user || data;
      if (!u || !u.id) { container.innerHTML = '<div class="empty-state"><h3>Nie znaleziono użytkownika</h3></div>'; return; }
      container.innerHTML = `
        <div class="page user-profile-page">
          <button class="btn btn-ghost btn-sm" id="up-back" style="margin-bottom:16px;">← Powrót</button>
          <div class="profile-header-card">
            <div class="profile-avatar">
              ${u.avatar ? '<img src="'+img(u.avatar)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.innerHTML=this.parentElement.innerHTML" />' : (u.username ? u.username.charAt(0).toUpperCase() : '?')}
            </div>
            <div class="profile-info">
              <h2>${u.username || 'Nieznany'}</h2>
              <div class="badge-row">
                ${u.role === 'admin' ? '<span class="badge badge-premium">Admin</span>' : ''}
                ${u.role === 'developer' ? '<span class="badge badge-dev">Deweloper</span>' : ''}
              </div>
              ${u.status_message ? '<p style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px;">'+u.status_message+'</p>' : ''}
              ${u.bio ? '<p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:8px;max-width:500px;">'+u.bio+'</p>' : ''}
              <div class="profile-stats" style="margin-top:12px;">
                <div class="stat"><div class="value">${u.gameCount||0}</div><div class="label">Gry</div></div>
                <div class="stat"><div class="value">${u.reviewCount||0}</div><div class="label">Opinie</div></div>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="section-header"><h2>Opinie</h2></div>
            <div id="up-reviews"><div class="loading"><div class="spinner"></div></div></div>
          </div>
        </div>
      `;
      document.getElementById('up-back')?.addEventListener('click', () => window.history.back());
      this.loadUserReviews(userId);
    } catch { container.innerHTML = '<div class="empty-state"><h3>Nie znaleziono użytkownika</h3></div>'; }
  }

  async loadUserReviews(userId) {
    const el = document.getElementById('up-reviews');
    if (!el) return;
    try {
      const data = await api.get('user/public-profile-reviews?user_id=' + userId);
      const reviews = data.reviews || [];
      if (reviews.length === 0) {
        el.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak opinii.</p>';
        return;
      }
      el.innerHTML = reviews.map(r => `
        <div style="padding:12px 0;border-bottom:1px solid var(--glass-border);cursor:pointer;" class="up-review" data-game-id="${r.game_id}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <strong style="font-size:13px;">${r.game_title || 'Gra #'+r.game_id}</strong>
            <span style="font-size:13px;color:var(--yellow-400);">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
          </div>
          ${r.content ? '<p style="font-size:13px;color:rgba(255,255,255,0.5);">'+r.content+'</p>' : ''}
        </div>
      `).join('');
      el.querySelectorAll('.up-review').forEach(el2 => el2.addEventListener('click', function() {
        const gid = parseInt(this.dataset.gameId);
        if (gid) router.navigate('game', { id: gid });
      }));
    } catch { el.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Błąd ładowania opinii</p>'; }
  }
}

const userProfilePage = new UserProfilePage();