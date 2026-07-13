class AdminPage {
  constructor() { this.tab = 'dashboard'; }

  render(container) {
    if (!api.isAdmin) {
      container.innerHTML = `<div class="empty-state"><div class="icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h3>Brak dostępu</h3><p>Tylko administratorzy mogą przeglądać to panel.</p></div>`;
      return;
    }
    container.innerHTML = `
      <div class="page admin-page">
        <div class="page-header"><h1>Panel Administracyjny</h1></div>
        <div style="display:flex;gap:24px;">
          <div style="width:200px;flex-shrink:0;display:flex;flex-direction:column;gap:4px;">
            ${[['dashboard','📊 Dashboard'],['games','🎮 Gry'],['developers','🛠 Deweloperzy'],['users','👥 Użytkownicy'],['announcements','📢 Ogłoszenia']].map(([t,l],i) =>
              `<button class="btn admin-tab ${i===0?'btn-primary':'btn-ghost'}" data-tab="${t}" style="text-align:left;justify-content:flex-start;padding:10px 14px;border-radius:8px;">${l}</button>`
            ).join('')}
          </div>
          <div id="admin-content" style="flex:1;"></div>
        </div>
      </div>
    `;
    container.querySelectorAll('.admin-tab').forEach(b => b.addEventListener('click', () => {
      container.querySelectorAll('.admin-tab').forEach(x => { x.className = 'btn admin-tab btn-ghost'; });
      b.className = 'btn admin-tab btn-primary';
      this.tab = b.dataset.tab;
      this.loadTab(container);
    }));
    this.loadTab(container);
  }

  async loadTab() {
    const el = document.getElementById('admin-content');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    if (this.tab === 'dashboard') this.renderDashboard(el);
    else if (this.tab === 'games') this.renderGames(el);
    else if (this.tab === 'developers') this.renderDevelopers(el);
    else if (this.tab === 'users') this.renderUsers(el);
    else if (this.tab === 'announcements') this.renderAnnouncements(el);
  }

  async renderDashboard(el) {
    try {
      const d = await api.getAdminStats();
      const s = d.stats || {};
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">
          ${[['total_users','Użytkownicy','👥'],['total_games','Gry','🎮'],['pending_games','Oczekujące gry', '⏳'],['pending_devs','Oczek. deweloperzy','🛠'],['total_purchases','Zakupy','💰'],['total_reviews','Opinie','⭐']].map(([k,n,i]) => `
            <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">${i}</div>
              <div style="font-size:28px;font-weight:800;">${s[k]||0}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;">${n}</div>
            </div>
          `).join('')}
        </div>
      `;
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderGames(el) {
    try {
      const d = await api.getPendingGames();
      const games = d.games || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <h3 style="margin-bottom:16px;">Gry oczekujące na weryfikację (${games.length})</h3>
          ${games.length ? games.map(g => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--glass-border);">
              <div><strong>${g.title}</strong><br><span style="font-size:12px;color:rgba(255,255,255,0.3);">${g.developer_name||'Nieznany'} • ${g.created_at}</span></div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-sm btn-primary" data-app="${g.id}">Zatwierdź</button>
                <button class="btn btn-sm btn-ghost" data-rej="${g.id}" style="color:var(--red-400);">Odrzuć</button>
              </div>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak gier oczekujących.</p>'}
        </div>
      `;
      el.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', async () => {
        await api.approveGame(b.dataset.app); this.renderGames(el);
      }));
      el.querySelectorAll('[data-rej]').forEach(b => b.addEventListener('click', async () => {
        const r = prompt('Powód odrzucenia:');
        if (r !== null) { await api.rejectGame(b.dataset.rej, r); this.renderGames(el); }
      }));
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderDevelopers(el) {
    try {
      const d = await api.getDevApplications();
      const apps = d.applications || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <h3 style="margin-bottom:16px;">Aplikacje deweloperskie (${apps.length})</h3>
          ${apps.length ? apps.map(a => `
            <div style="padding:16px;border-bottom:1px solid var(--glass-border);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div><strong>${a.full_name}</strong> (${a.username}) ${a.studio_name ? '— '+a.studio_name:''}<br>
                  <span style="font-size:12px;color:rgba(255,255,255,0.3);">${a.email} ${a.website ? '• <a href="'+a.website+'" target="_blank" style="color:var(--purple-400);">'+a.website+'</a>':''}</span>
                  ${a.reason ? '<p style="font-size:13px;margin-top:6px;color:rgba(255,255,255,0.6);">'+a.reason+'</p>':''}
                  ${a.experience ? '<p style="font-size:12px;color:rgba(255,255,255,0.3);">Doświadczenie: '+a.experience+'</p>':''}
                  <span style="font-size:11px;color:rgba(255,255,255,0.2);">Status: ${a.status} • ${a.created_at}</span>
                </div>
                ${a.status === 'pending' ? `<div style="display:flex;gap:8px;flex-shrink:0;">
                  <button class="btn btn-sm btn-primary" data-app="${a.id}">Zatwierdź</button>
                  <button class="btn btn-sm btn-ghost" data-rej="${a.id}" style="color:var(--red-400);">Odrzuć</button>
                </div>` : ''}
              </div>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak aplikacji.</p>'}
        </div>
      `;
      el.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', async () => {
        await api.approveDev(b.dataset.app); this.renderDevelopers(el);
      }));
      el.querySelectorAll('[data-rej]').forEach(b => b.addEventListener('click', async () => {
        const n = prompt('Notatka do odrzucenia:'); if (n !== null) { await api.rejectDev(b.dataset.rej, n); this.renderDevelopers(el); }
      }));
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderUsers(el) {
    try {
      const d = await api.getUsers();
      const users = d.users || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <h3 style="margin-bottom:16px;">Użytkownicy (${users.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
            ${users.map(u => `
              <div style="padding:14px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.02);">
                <strong>${u.username}</strong><br>
                <span style="font-size:12px;color:rgba(255,255,255,0.3);">${u.email}</span><br>
                <span style="font-size:11px;color:rgba(255,255,255,0.2);">Rola: ${u.role} • ${u.created_at}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderAnnouncements(el) {
    try {
      const d = await api.getAnnouncements();
      const items = d.announcements || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3>Ogłoszenia (${items.length})</h3>
            <button class="btn btn-primary btn-sm" id="btn-new-announcement">+ Nowe ogłoszenie</button>
          </div>
          ${items.length ? items.map(a => `
            <div style="padding:14px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:rgba(124,58,237,0.1);color:var(--purple-300);">${a.type}</span>
                <strong style="margin-left:8px;">${a.title}</strong>
                <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">${a.content}</p>
                <span style="font-size:11px;color:rgba(255,255,255,0.2);">${a.created_at}</span>
              </div>
              <button class="btn btn-sm btn-ghost" data-del="${a.id}" style="color:var(--red-400);flex-shrink:0;">Usuń</button>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak ogłoszeń.</p>'}
        </div>
      `;
      el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        await api.hideAnnouncement(b.dataset.del); this.renderAnnouncements(el);
      }));
      document.getElementById('btn-new-announcement')?.addEventListener('click', async () => {
        const title = prompt('Tytuł ogłoszenia:'); if (!title) return;
        const content = prompt('Treść:'); if (!content) return;
        const type = prompt('Typ (info/warning/update/maintenance):') || 'info';
        await api.createAnnouncement({ title, content, type });
        this.renderAnnouncements(el);
      });
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }
}

const adminPage = new AdminPage();
