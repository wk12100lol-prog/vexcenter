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
            ${[['dashboard','📊 Dashboard'],['games','🎮 Gry'],['allgames','🎯 Wszystkie gry'],['developers','🛠 Deweloperzy'],['users','👥 Użytkownicy'],['announcements','📢 Ogłoszenia'],['reports','📋 Zgłoszenia']].map(([t,l],i) =>
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
    else if (this.tab === 'allgames') this.renderAllGames(el);
    else if (this.tab === 'developers') this.renderDevelopers(el);
    else if (this.tab === 'users') this.renderUsers(el);
    else if (this.tab === 'announcements') this.renderAnnouncements(el);
    else if (this.tab === 'reports') this.renderReports(el);
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
                <button class="btn btn-sm btn-ghost" data-del="${g.id}" style="color:var(--red-400);">Usuń</button>
              </div>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak gier oczekujących.</p>'}
        </div>
      `;
      el.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', async () => {
        await api.approveGame(b.dataset.app); this.renderGames(el);
      }));
      el.querySelectorAll('[data-rej]').forEach(b => b.addEventListener('click', async () => {
        const r = await showPrompt('Powód odrzucenia', 'Powód...');
        if (r !== null) { await api.rejectGame(b.dataset.rej, r); this.renderGames(el); }
      }));
      el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        if (!(await showConfirm('Potwierdzenie', 'Na pewno usunąć tę grę?'))) return;
        await api.deleteGame(b.dataset.del); this.renderGames(el);
      }));
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderAllGames(el) {
    try {
      const d = await api.getGames({ limit: 100 });
      const games = d.items || d.games || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <h3 style="margin-bottom:16px;">Wszystkie gry (${games.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
            ${games.map(g => `
              <div style="padding:14px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.02);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong>${g.title}</strong><br>
                  <span style="font-size:12px;color:rgba(255,255,255,0.3);">${g.developer_name||'Nieznany'} • ${g.created_at}</span>
                </div>
                <button class="btn btn-sm btn-ghost" data-del="${g.id}" style="color:var(--red-400);">Usuń</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        if (!(await showConfirm('Potwierdzenie', 'Na pewno usunąć tę grę?'))) return;
        await api.deleteGame(b.dataset.del); this.renderAllGames(el);
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
        const n = await showPrompt('Notatka do odrzucenia', 'Notatka...'); if (n !== null) { await api.rejectDev(b.dataset.rej, n); this.renderDevelopers(el); }
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
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
            ${users.map(u => `
              <div style="padding:14px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.02);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong>${u.username}</strong><br>
                  <span style="font-size:12px;color:rgba(255,255,255,0.3);">${u.email}</span><br>
                  <span style="font-size:11px;color:rgba(255,255,255,0.2);">${u.created_at}</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                  <select class="role-select" data-id="${u.id}" style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:6px;padding:4px 8px;font-size:12px;color:#fff;">
                    ${['user','developer','admin'].map(r => `<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
                  </select>
                  ${u.role !== 'admin' ? `<button class="btn btn-sm btn-ghost" data-del="${u.id}" style="color:var(--red-400);padding:4px 8px;font-size:12px;">Usuń</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        if (!(await showConfirm('Potwierdzenie', 'Na pewno usunąć tego użytkownika? Usunięte zostaną też jego gry.'))) return;
        await api.deleteUser(b.dataset.del); this.renderUsers(el);
      }));
      el.querySelectorAll('.role-select').forEach(s => s.addEventListener('change', async () => {
        if (!(await showConfirm('Potwierdzenie', 'Zmienić rolę użytkownika na "' + s.value + '"?'))) { s.value = s.options[s.selectedIndex].defaultSelected ? s.value : ''; return; }
        await api.updateUserRole(s.dataset.id, s.value);
        this.renderUsers(el);
      }));
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
        const title = await showPrompt('Tytuł ogłoszenia', 'Tytuł...'); if (!title) return;
        const content = await showPrompt('Treść', 'Treść...'); if (!content) return;
        const type = await showPrompt('Typ', 'info/warning/update/maintenance', 'info') || 'info';
        await api.createAnnouncement({ title, content, type });
        this.renderAnnouncements(el);
      });
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania</p></div>'; }
  }

  async renderReports(el) {
    try {
      const d = await api.getReports(this._reportFilter || '');
      const list = d.reports || [];
      const statusColors = { open: 'rgba(239,68,68,0.15)', in_progress: 'rgba(245,158,11,0.15)', resolved: 'rgba(16,185,129,0.15)', closed: 'rgba(255,255,255,0.08)' };
      const statusStr = { open: 'Otwarte', in_progress: 'W trakcie', resolved: 'Rozwiązane', closed: 'Zamknięte' };
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3>Zgłoszenia (${list.length})</h3>
            <div style="display:flex;gap:6px;">
              ${['','open','in_progress','resolved','closed'].map(s => `<button class="btn btn-sm ${(!this._reportFilter && !s) || this._reportFilter === s ? 'btn-primary' : 'btn-ghost'}" data-filter="${s}" style="font-size:11px;">${s ? statusStr[s]||s : 'Wszystkie'}</button>`).join('')}
            </div>
          </div>
          ${list.length ? list.map(r => `
            <div class="report-item" data-id="${r.id}" style="padding:16px;border-bottom:1px solid var(--glass-border);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <strong>${r.title}</strong>
                    <span style="font-size:11px;padding:2px 10px;border-radius:4px;background:${statusColors[r.status]||statusColors.open};color:${r.status==='resolved'?'var(--green-400)':r.status==='in_progress'?'var(--yellow-400)':r.status==='closed'?'rgba(255,255,255,0.3)':'var(--red-400)'}">${statusStr[r.status]||r.status}</span>
                  </div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:6px;">${r.username} • ${r.category} • ${r.created_at}</div>
                  <p style="font-size:13px;color:rgba(255,255,255,0.5);">${r.description}</p>
                  ${r.admin_note ? '<div style="margin-top:6px;font-size:12px;color:var(--purple-300);">Notatka: '+r.admin_note+'</div>' : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;margin-left:16px;">
                  <button class="btn btn-sm ${r.status==='open'?'btn-primary':'btn-ghost'}" data-set-status="${r.id}" data-status="open" style="font-size:10px;padding:3px 8px;">Otwarte</button>
                  <button class="btn btn-sm ${r.status==='in_progress'?'btn-primary':'btn-ghost'}" data-set-status="${r.id}" data-status="in_progress" style="font-size:10px;padding:3px 8px;">W trakcie</button>
                  <button class="btn btn-sm ${r.status==='resolved'?'btn-primary':'btn-ghost'}" data-set-status="${r.id}" data-status="resolved" style="font-size:10px;padding:3px 8px;">Rozwiązane</button>
                  <button class="btn btn-sm ${r.status==='closed'?'btn-primary':'btn-ghost'}" data-set-status="${r.id}" data-status="closed" style="font-size:10px;padding:3px 8px;">Zamknięte</button>
                </div>
              </div>
              <div class="report-note-form" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--glass-border);">
                <div style="display:flex;gap:8px;">
                  <input type="text" class="report-note-input" placeholder="Notatka admina..." style="flex:1;padding:8px 12px;border:1px solid var(--glass-border);border-radius:6px;background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-family:inherit;outline:none;" />
                  <button class="btn btn-sm btn-primary report-note-save" data-id="${r.id}">Zapisz</button>
                </div>
              </div>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak zgłoszeń.</p>'}
        </div>
      `;

      el.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', async () => {
        this._reportFilter = b.dataset.filter || '';
        this.renderReports(el);
      }));

      el.querySelectorAll('[data-set-status]').forEach(b => b.addEventListener('click', async () => {
        const reportId = b.dataset.setStatus;
        const newStatus = b.dataset.status;
        const noteInput = b.closest('.report-item').querySelector('.report-note-input');
        const noteForm = b.closest('.report-item').querySelector('.report-note-form');
        noteForm.style.display = 'flex';
        noteInput.focus();
        noteInput.dataset.targetStatus = newStatus;
        noteInput.dataset.targetId = reportId;
      }));

      el.querySelectorAll('.report-note-save').forEach(b => b.addEventListener('click', async () => {
        const reportItem = b.closest('.report-item');
        const noteInput = reportItem.querySelector('.report-note-input');
        const note = noteInput.value.trim();
        const targetId = noteInput.dataset.targetId || b.dataset.id;
        const targetStatus = noteInput.dataset.targetStatus || 'resolved';
        await api.updateReport(targetId, targetStatus, note);
        showModal('Sukces', 'Zgłoszenie zaktualizowane!', 'success');
        this.renderReports(el);
      }));
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania zgłoszeń</p></div>'; }
  }
}

const adminPage = new AdminPage();
