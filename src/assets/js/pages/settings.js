class SettingsPage {
  constructor() {
    this.tab = 'profile';
  }

  render(container) {
    if (!api.isAuthenticated || !api.user) {
      container.innerHTML = `<div class="empty-state"><div class="icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h3>Zaloguj się</h3><p>Zaloguj się, aby uzyskać dostęp do ustawień.</p><button class="btn btn-primary" onclick="router.navigate('auth')">Zaloguj się</button></div>`;
      return;
    }
    container.innerHTML = `
      <div class="page settings-page">
        <div class="page-header"><h1>Ustawienia</h1></div>
        <div style="display:flex;gap:24px;">
          <div class="settings-tabs" style="width:200px;flex-shrink:0;display:flex;flex-direction:column;gap:4px;">
            ${['profile','friends','developer','games','notifications','updates','steam','reports','downloads','about'].map((t,i) => `
              <button class="btn settings-tab ${i===0?'btn-primary':'btn-ghost'}" data-tab="${t}" style="text-align:left;justify-content:flex-start;padding:10px 14px;border-radius:8px;">
                ${t === 'profile' ? '👤 Profil' : t === 'friends' ? '👥 Znajomi' : t === 'developer' ? '🛠 Deweloper' : t === 'games' ? '🎮 Gry' : t === 'notifications' ? '🔔 Powiadomienia' : t === 'updates' ? '🔄 Aktualizacje' : t === 'steam' ? '🟦 Steam' : t === 'reports' ? '📋 Zgłoszenia' : t === 'downloads' ? '📥 Pobieranie' : 'ℹ️ O nas'}
              </button>
            `).join('')}
          </div>
          <div id="settings-content" style="flex:1;"></div>
        </div>
      </div>
    `;
    container.querySelectorAll('.settings-tab').forEach(b => b.addEventListener('click', () => {
      container.querySelectorAll('.settings-tab').forEach(x => { x.className = 'btn settings-tab btn-ghost'; });
      b.className = 'btn settings-tab btn-primary';
      this.tab = b.dataset.tab;
      this.loadTab(container);
    }));
    this.loadTab(container);
  }

  async loadTab(container) {
    const el = document.getElementById('settings-content');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const data = await api.getSettings();
      if (this.tab === 'profile') this.renderProfile(el, data);
      else if (this.tab === 'friends') this.renderFriends(el);
      else if (this.tab === 'developer') this.renderDeveloper(el, data);
      else if (this.tab === 'games') this.renderGames(el, data);
      else if (this.tab === 'notifications') this.renderNotifications(el);
      else if (this.tab === 'updates') this.renderUpdates(el);
      else if (this.tab === 'steam') this.renderSteam(el);
      else if (this.tab === 'reports') this.renderReports(el);
      else if (this.tab === 'downloads') this.renderDownloads(el);
      else if (this.tab === 'about') this.renderAbout(el);
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania ustawień</p></div>'; }
  }

  renderProfile(el, data) {
    const u = data.user;
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;margin-bottom:16px;">
        <h3 style="margin-bottom:20px;">Awatar</h3>
        <div style="display:flex;align-items:center;gap:20px;">
          <div id="s-avatar-preview" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;flex-shrink:0;overflow:hidden;">
            ${u.avatar ? '<img src="'+img(u.avatar)+'" style="width:100%;height:100%;object-fit:cover;" />' : u.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <input type="file" id="s-avatar-input" accept="image/*" style="display:none;" />
            <button class="btn btn-secondary btn-sm" id="s-avatar-btn">Zmień zdjęcie</button>
            <p style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px;">JPG, PNG, WEBP, GIF</p>
          </div>
        </div>
      </div>
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:20px;">Edytuj profil</h3>
        <form id="settings-form">
          <div class="form-group"><label>Nazwa użytkownika</label><input type="text" value="${u.username}" disabled style="opacity:0.5;"/></div>
          <div class="form-group"><label>Email</label><input type="email" value="${u.email}" disabled style="opacity:0.5;"/></div>
          <div class="form-group"><label>Wyświetlana nazwa</label><input type="text" id="s-display_name" value="${u.display_name||''}" placeholder="Twoja nazwa"/></div>
          <div class="form-group"><label>Status</label><input type="text" id="s-status_message" value="${u.status_message||''}" placeholder="Np. Gram w RPG" maxlength="100"/></div>
          <div class="form-group"><label>Bio</label><textarea id="s-bio" rows="3" placeholder="Opowiedz coś o sobie">${u.bio||''}</textarea></div>
          <div class="form-group"><label>Strona WWW</label><input type="url" id="s-website" value="${u.website||''}" placeholder="https://"/></div>
          <button class="btn btn-primary" type="submit">Zapisz zmiany</button>
        </form>
      </div>
      <div style="margin-top:16px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:16px;">Wygląd i język</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;">Motyw</label>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm ${document.documentElement.classList.contains('theme-light')?'btn-secondary':'btn-primary'}" id="theme-dark-btn">Ciemny</button>
              <button class="btn btn-sm ${document.documentElement.classList.contains('theme-light')?'btn-primary':'btn-secondary'}" id="theme-light-btn">Jasny</button>
            </div>
          </div>
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;">Język</label>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm ${(localStorage.getItem('vex_lang')||'pl')==='pl'?'btn-primary':'btn-secondary'}" id="lang-pl-btn">PL</button>
              <button class="btn btn-sm ${(localStorage.getItem('vex_lang')||'pl')==='en'?'btn-primary':'btn-secondary'}" id="lang-en-btn">EN</button>
              <button class="btn btn-sm ${(localStorage.getItem('vex_lang')||'pl')==='de'?'btn-primary':'btn-secondary'}" id="lang-de-btn">DE</button>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border);">
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;">Krój czcionki</label>
            <select id="font-family-select" style="width:100%;padding:8px 12px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-family:inherit;outline:none;cursor:pointer;"></select>
          </div>
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;">Rozmiar czcionki</label>
            <div id="font-size-btns" style="display:flex;gap:6px;"></div>
          </div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border);">
          <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:8px;">Wydajność tła</label>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-sm ${(localStorage.getItem('vex_perf_mode')||'visual')==='visual'?'btn-primary':'btn-secondary'}" id="perf-visual-btn">🎨 Ładne</button>
            <button class="btn btn-sm ${localStorage.getItem('vex_perf_mode')==='performance'?'btn-primary':'btn-secondary'}" id="perf-perf-btn">⚡ Płynne</button>
          </div>
          <p style="font-size:11px;color:rgba(255,255,255,0.2);margin-top:6px;">Ładne = 35 particle + 3 glow + siatka (więcej CPU/GPU). Płynne = 10 particle + 1 glow.</p>
        </div>
      </div>
      <div style="margin-top:16px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:12px;">Statystyki</h3>
        <div class="profile-stats">${['gameCount','reviewCount','friendCount','installedCount'].map(s => `<div class="stat"><div class="value">${data.stats[s]||0}</div><div class="label">${s==='gameCount'?'Gry':s==='reviewCount'?'Opinie':s==='friendCount'?'Znajomi':'Zainstalowane'}</div></div>`).join('')}</div>
      </div>
    `;
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { display_name: document.getElementById('s-display_name').value, status_message: document.getElementById('s-status_message').value, bio: document.getElementById('s-bio').value, website: document.getElementById('s-website').value };
      await api.updateSettings(body);
      headerComponent.updateUser(api.user);
      showModal('Sukces', 'Zapisano!', 'success');
    });

    document.getElementById('s-avatar-btn')?.addEventListener('click', () => {
      document.getElementById('s-avatar-input').click();
    });
    document.getElementById('theme-dark-btn')?.addEventListener('click', () => {
      document.documentElement.classList.remove('theme-light');
      localStorage.setItem('vex_theme', 'dark');
      const lightBtn = document.getElementById('theme-light-btn');
      const darkBtn = document.getElementById('theme-dark-btn');
      if (lightBtn) { lightBtn.className = 'btn btn-sm btn-secondary'; }
      if (darkBtn) { darkBtn.className = 'btn btn-sm btn-primary'; }
    });
    document.getElementById('theme-light-btn')?.addEventListener('click', () => {
      document.documentElement.classList.add('theme-light');
      localStorage.setItem('vex_theme', 'light');
      const lightBtn = document.getElementById('theme-light-btn');
      const darkBtn = document.getElementById('theme-dark-btn');
      if (lightBtn) { lightBtn.className = 'btn btn-sm btn-primary'; }
      if (darkBtn) { darkBtn.className = 'btn btn-sm btn-secondary'; }
    });
    document.getElementById('lang-pl-btn')?.addEventListener('click', () => {
      if (typeof setLang === 'function') { setLang('pl'); }
      document.getElementById('lang-pl-btn').className = 'btn btn-sm btn-primary';
      document.getElementById('lang-en-btn').className = 'btn btn-sm btn-secondary';
      document.getElementById('lang-de-btn').className = 'btn btn-sm btn-secondary';
    });
    document.getElementById('lang-en-btn')?.addEventListener('click', () => {
      if (typeof setLang === 'function') { setLang('en'); }
      document.getElementById('lang-en-btn').className = 'btn btn-sm btn-primary';
      document.getElementById('lang-pl-btn').className = 'btn btn-sm btn-secondary';
      document.getElementById('lang-de-btn').className = 'btn btn-sm btn-secondary';
    });
    document.getElementById('lang-de-btn')?.addEventListener('click', () => {
      if (typeof setLang === 'function') { setLang('de'); }
      document.getElementById('lang-de-btn').className = 'btn btn-sm btn-primary';
      document.getElementById('lang-pl-btn').className = 'btn btn-sm btn-secondary';
      document.getElementById('lang-en-btn').className = 'btn btn-sm btn-secondary';
    });

    document.getElementById('perf-visual-btn')?.addEventListener('click', () => {
      localStorage.setItem('vex_perf_mode', 'visual');
      document.getElementById('perf-visual-btn').className = 'btn btn-sm btn-primary';
      const perfBtn = document.getElementById('perf-perf-btn');
      if (perfBtn) perfBtn.className = 'btn btn-sm btn-secondary';
      if (typeof recreateBackground === 'function') recreateBackground();
    });
    document.getElementById('perf-perf-btn')?.addEventListener('click', () => {
      localStorage.setItem('vex_perf_mode', 'performance');
      document.getElementById('perf-perf-btn').className = 'btn btn-sm btn-primary';
      const visBtn = document.getElementById('perf-visual-btn');
      if (visBtn) visBtn.className = 'btn btn-sm btn-secondary';
      if (typeof recreateBackground === 'function') recreateBackground();
    });
    document.getElementById('s-avatar-input')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('avatar', file);
      try {
        const result = await api.uploadAvatar(fd);
        const avatarUrl = result.avatar || result.data?.avatar;
        if (avatarUrl) {
          const preview = document.getElementById('s-avatar-preview');
          preview.innerHTML = '<img src="'+img(avatarUrl)+'" style="width:100%;height:100%;object-fit:cover;" />';
          api.user.avatar = avatarUrl;
          headerComponent.updateUser(api.user);
        }
        showModal('Sukces', 'Awatar zaktualizowany!', 'success');
      } catch (err) {
        showModal('Błąd', err.message, 'error');
      }
    });
  }

  async renderFriends(el) {
    try {
      const data = await api.getFriends();
      const fl = data.friends || [];
      const pr = data.pending_requests || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3>Znajomi (${fl.length})</h3>
            <button class="btn btn-secondary btn-sm" id="btn-add-friend">+ Dodaj znajomego</button>
          </div>
          ${pr.length ? `<div style="margin-bottom:16px;padding:12px;background:rgba(245,158,11,0.08);border-radius:8px;border:1px solid rgba(245,158,11,0.15);"><strong style="color:var(--yellow-400);font-size:13px;">Prośby o znajomych (${pr.length})</strong>${pr.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 0;"><span>${f.username}</span><div><button class="btn btn-sm btn-primary" data-accept="${f.id}">Akceptuj</button> <button class="btn btn-sm btn-ghost" data-reject="${f.id}">Odrzuć</button></div></div>`).join('')}</div>` : ''}
          <div>${fl.length ? fl.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--glass-border);">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;overflow:hidden;${f.avatar ? 'background:none;' : ''}">
                ${f.avatar ? '<img src="'+img(f.avatar)+'" style="width:100%;height:100%;object-fit:cover;" />' : f.username.charAt(0).toUpperCase()}
              </div>
              <span>${f.username} ${f.status_message ? '<span style="color:rgba(255,255,255,0.3);font-size:12px;">— '+f.status_message+'</span>':''}</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-sm btn-ghost" data-remove="${f.id}" style="color:var(--red-400);">Usuń</button>
            </div>
          </div>`).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak znajomych. Dodaj kogoś!</p>'}</div>
        </div>
      `;
      el.querySelectorAll('[data-accept]').forEach(b => b.addEventListener('click', async () => { await api.acceptFriend(b.dataset.accept); this.renderFriends(el); }));
      el.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', async () => { await api.rejectFriend(b.dataset.reject); this.renderFriends(el); }));
      el.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', async () => { if(await showConfirm('Potwierdzenie', 'Usunąć znajomego?')){ await api.removeFriend(b.dataset.remove); this.renderFriends(el); }}));
      document.getElementById('btn-add-friend')?.addEventListener('click', () => {
        const modal = document.getElementById('add-friend-modal');
        if (modal) modal.remove();
        profilePage.showAddFriendModal();
      });
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania znajomych</p></div>'; }
  }

  renderDeveloper(el, data) {
    const app = data.developer_application;
    const isDev = api.isDeveloper;
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:4px;">Weryfikacja developera</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Zweryfikuj się jako twórca gier i publikuj swoje tytuły na VexCenter.</p>
        ${isDev ? `<div style="padding:16px;background:rgba(16,185,129,0.08);border-radius:8px;border:1px solid rgba(16,185,129,0.15);margin-bottom:16px;"><strong style="color:var(--green-400);">✓ Jesteś zweryfikowanym deweloperem!</strong><p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">Możesz dodawać gry i zarządzać linkami do pobrania.</p></div>` : app?.status === 'pending' ? `<div style="padding:16px;background:rgba(245,158,11,0.08);border-radius:8px;border:1px solid rgba(245,158,11,0.15);margin-bottom:16px;"><strong style="color:var(--yellow-400);">⏳ Twoja aplikacja jest sprawdzana</strong><p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">Administrator wkrótce ją rozpatrzy.</p></div>` : app?.status === 'rejected' ? `<div style="padding:16px;background:rgba(239,68,68,0.08);border-radius:8px;border:1px solid rgba(239,68,68,0.15);margin-bottom:16px;"><strong style="color:var(--red-400);">✗ Aplikacja odrzucona</strong>${app.admin_note ? `<p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">Powód: ${app.admin_note}</p>`:''}</div>` : ''}
        ${!isDev && app?.status !== 'pending' ? `
        <form id="dev-form">
          <div class="form-group"><label>Imię i nazwisko *</label><input type="text" id="dev-full_name" required placeholder="Jan Kowalski"/></div>
          <div class="form-group"><label>Nazwa studia</label><input type="text" id="dev-studio_name" placeholder="Nazwa twojego studia"/></div>
          <div class="form-group"><label>Strona WWW</label><input type="url" id="dev-website" placeholder="https://mojastrona.pl"/></div>
          <div class="form-group"><label>Dlaczego chcesz zostać deweloperem? *</label><textarea id="dev-reason" rows="3" required placeholder="Opisz swoją motywację"></textarea></div>
          <div class="form-group"><label>Doświadczenie</label><textarea id="dev-experience" rows="3" placeholder="Jakie gry tworzyłeś? Jakie masz umiejętności?"></textarea></div>
          <button class="btn btn-primary" type="submit">Wyślij wniosek</button>
        </form>` : ''}
      </div>
    `;
    document.getElementById('dev-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { full_name: document.getElementById('dev-full_name').value, studio_name: document.getElementById('dev-studio_name').value, website: document.getElementById('dev-website').value, reason: document.getElementById('dev-reason').value, experience: document.getElementById('dev-experience').value };
      try { await api.applyDeveloper(body); showModal('Sukces', 'Wniosek wysłany!', 'success'); this.renderDeveloper(el, await api.getSettings()); } catch(err) { showModal('Błąd', err.message, 'error'); }
    });
  }

  renderGames(el, data) {
    const inst = data.installations || [];
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:16px;">Zainstalowane gry (${inst.length})</h3>
        ${inst.length ? inst.map(i => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--glass-border);">
            <div><strong>${i.game_title}</strong><br><span style="font-size:12px;color:rgba(255,255,255,0.3);">${i.install_path}</span></div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm btn-primary" data-launch="${i.game_id}" data-exe="${i.executable_path||''}">▶ Uruchom</button>
              <button class="btn btn-sm btn-ghost" data-set-exe="${i.game_id}">${i.executable_path?'Zmień exe':'Ustaw exe'}</button>
            </div>
          </div>
        `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak zainstalowanych gier. Przejdź do sklepu i dodaj grę!</p>'}
      </div>
    `;
    el.querySelectorAll('[data-launch]').forEach(b => b.addEventListener('click', async () => {
      let exe = b.dataset.exe;
      if (!exe) {
        const res = await window.VexCenter.game.selectExecutable();
        if (res.canceled) return;
        exe = res.path;
        await api.registerInstall(b.dataset.launch, null, exe);
      }
      const result = await window.VexCenter.game.launch(b.dataset.launch, exe);
      if (!result.success) showModal('Błąd', result.error, 'error');
    }));
    el.querySelectorAll('[data-set-exe]').forEach(b => b.addEventListener('click', async () => {
      const res = await window.VexCenter.game.selectExecutable();
      if (res.canceled) return;
      await api.registerInstall(b.dataset.setExe, null, res.path);
      showModal('Sukces', 'Ścieżka zaktualizowana!', 'success');
      this.renderGames(el, await api.getSettings());
    }));
  }

  async renderNotifications(el) {
    try {
      const d = await api.getNotifications();
      const list = d.notifications || [];
      el.innerHTML = `
        <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3>Powiadomienia (${list.length})</h3>
            ${list.length ? '<button class="btn btn-sm btn-secondary" id="notif-mark-read">Oznacz jako przeczytane</button>' : ''}
          </div>
          ${list.length ? list.map(n => `
            <div style="padding:12px;border-bottom:1px solid var(--glass-border);${n.is_read ? 'opacity:0.5;' : ''}">
              <div style="font-size:13px;">${n.message}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;">${n.created_at}</div>
            </div>
          `).join('') : '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak powiadomień</p>'}
        </div>
      `;
      document.getElementById('notif-mark-read')?.addEventListener('click', async () => {
        await api.markNotificationsRead();
        this.renderNotifications(el);
      });
    } catch { el.innerHTML = '<div class="empty-state"><p>Błąd ładowania powiadomień</p></div>'; }
  }

  async renderUpdates(el) {
    const autoUpdate = localStorage.getItem('vex_auto_update') === 'true';
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:4px;">Aktualizacje</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Sprawdź czy dostępna jest nowsza wersja VexCenter.</p>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.15);margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <div><div style="font-size:14px;font-weight:600;">Auto-aktualizacja</div><div style="font-size:12px;color:rgba(255,255,255,0.3);">Automatycznie pobieraj i instaluj aktualizacje przy uruchomieniu</div></div>
          </div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;">
            <input type="checkbox" id="auto-update-toggle" ${autoUpdate ? 'checked' : ''} style="opacity:0;width:0;height:0;" />
            <span style="position:absolute;cursor:pointer;inset:0;background:${autoUpdate ? '#7c3aed' : 'rgba(255,255,255,0.15)'};border-radius:12px;transition:0.2s;"></span>
            <span style="position:absolute;top:2px;left:${autoUpdate ? '22px' : '2px'};width:20px;height:20px;border-radius:50%;background:#fff;transition:0.2s;"></span>
          </label>
        </div>
        <div style="background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.15);padding:16px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:600;">Wersja ${window.VexCenter?.appVersion || '1.6.0'}</div>
              <div id="update-status" style="font-size:12px;color:rgba(255,255,255,0.3);">Kliknij "Sprawdź" aby wyszukać aktualizacje</div>
            </div>
          </div>
        </div>
        <div id="update-progress-wrap" style="display:none;margin-bottom:16px;">
          <div style="height:6px;border-radius:3px;background:rgba(255,255,255,0.08);overflow:hidden;">
            <div id="update-progress-fill" style="height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#7c3aed,#a855f7);transition:width 0.3s;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;">
            <span id="update-progress-label">Pobieranie...</span>
            <span id="update-progress-pct">0%</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" id="btn-check-updates">🔍 Sprawdź aktualizacje</button>
          <button class="btn btn-secondary" id="btn-download-update" style="display:none;">⬇ Pobierz aktualizację</button>
          <button class="btn btn-success" id="btn-install-update" style="display:none;background:var(--green-500);">🔄 Zainstaluj teraz</button>
        </div>
      </div>
      <div style="margin-top:16px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:4px;">Historia wersji</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:16px;">Ostatnie wydania VexCenter z GitHub.</p>
        <div id="release-notes" style="font-size:13px;">Ładowanie...</div>
      </div>
    `;

    if (!window.VexCenter?.update) {
      document.getElementById('btn-check-updates').disabled = true;
      document.getElementById('update-status').textContent = 'Funkcja dostępna tylko w aplikacji desktopowej.';
      return;
    }

    const statusEl = document.getElementById('update-status');
    const progressWrap = document.getElementById('update-progress-wrap');
    const progressFill = document.getElementById('update-progress-fill');
    const progressPct = document.getElementById('update-progress-pct');
    const btnCheck = document.getElementById('btn-check-updates');
    const btnDownload = document.getElementById('btn-download-update');
    const btnInstall = document.getElementById('btn-install-update');

    window.VexCenter.update.onStatus((msg) => { statusEl.textContent = msg; });
    window.VexCenter.update.onAvailable((info) => {
      statusEl.textContent = `Dostępna wersja ${info.version}!`;
      btnDownload.style.display = 'inline-flex';
    });
    window.VexCenter.update.onError((msg) => {
      statusEl.textContent = 'Błąd: ' + msg;
      btnCheck.disabled = false;
      btnCheck.textContent = '🔍 Sprawdź aktualizacje';
      btnDownload.disabled = false;
      btnDownload.textContent = '⬇ Pobierz aktualizację';
      progressWrap.style.display = 'none';
    });
    window.VexCenter.update.onProgress((pct) => {
      progressWrap.style.display = 'block';
      progressFill.style.width = pct + '%';
      progressPct.textContent = Math.round(pct) + '%';
    });
    window.VexCenter.update.onDownloaded(() => {
      progressWrap.style.display = 'none';
      statusEl.textContent = 'Pobrano! Kliknij "Zainstaluj teraz"';
      btnDownload.style.display = 'none';
      btnInstall.style.display = 'inline-flex';
    });

    btnCheck.addEventListener('click', async () => {
      btnCheck.disabled = true;
      btnCheck.textContent = '⏳ Sprawdzanie...';
      statusEl.textContent = 'Sprawdzanie...';
      await window.VexCenter.update.check();
      btnCheck.disabled = false;
      btnCheck.textContent = '🔍 Sprawdź aktualizacje';
    });

    btnDownload.addEventListener('click', async () => {
      btnDownload.disabled = true;
      btnDownload.textContent = '⏳ Pobieranie...';
      progressWrap.style.display = 'block';
      await window.VexCenter.update.download();
      btnDownload.disabled = false;
      btnDownload.textContent = '⬇ Pobierz aktualizację';
    });

    btnInstall.addEventListener('click', () => {
      window.VexCenter.update.install();
    });

    document.getElementById('auto-update-toggle')?.addEventListener('change', function() {
      localStorage.setItem('vex_auto_update', this.checked ? 'true' : 'false');
      const bg = this.nextElementSibling;
      const dot = bg.nextElementSibling;
      bg.style.background = this.checked ? '#7c3aed' : 'rgba(255,255,255,0.15)';
      dot.style.left = this.checked ? '22px' : '2px';
    });

    const fontSel = document.getElementById('font-family-select');
    if (fontSel) {
      ['Inter','System','Monospace','Serif'].forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.toLowerCase();
        opt.textContent = f;
        if ((localStorage.getItem('vex_font')||'inter') === f.toLowerCase()) opt.selected = true;
        fontSel.appendChild(opt);
      });
      fontSel.addEventListener('change', () => {
        localStorage.setItem('vex_font', fontSel.value);
        settingsPage.applyFontSettings();
      });
    }
    const fb = document.getElementById('font-size-btns');
    if (fb) {
      [['small','S'],['medium','M'],['large','L'],['xlarge','XL']].forEach(([v,l]) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm ' + ((localStorage.getItem('vex_font_size')||'medium')===v?'btn-primary':'btn-secondary');
        btn.dataset.fontSize = v;
        btn.textContent = l;
        btn.style.cssText = 'flex:1;font-size:11px;padding:6px 4px;';
        btn.addEventListener('click', () => {
          fb.querySelectorAll('button').forEach(b => { b.className = b.className.replace('btn-primary','btn-secondary'); });
          btn.className = btn.className.replace('btn-secondary','btn-primary');
          localStorage.setItem('vex_font_size', v);
          settingsPage.applyFontSettings();
        });
        fb.appendChild(btn);
      });
    }

    fetch('https://api.github.com/repos/wk12100lol-prog/vexcenter/releases?per_page=5').then(r=>r.json()).then(releases=>{
      const el=document.getElementById('release-notes'); if(!el) return;
      if(!Array.isArray(releases)||!releases.length){el.innerHTML='<p style="color:rgba(255,255,255,0.2);">Brak informacji.</p>';return;}
      el.innerHTML=releases.map((r,i)=>`
        <div style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);${i===0?'background:rgba(124,58,237,0.06);border-radius:8px;margin-bottom:8px;':''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <a href="${r.html_url}" target="_blank" style="font-weight:600;color:var(--purple-400);text-decoration:none;font-size:14px;">${r.tag_name}</a>
            <span style="font-size:11px;color:rgba(255,255,255,0.2);">${new Date(r.published_at).toLocaleDateString('pl-PL')}</span>
          </div>
          ${r.body?'<p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;white-space:pre-wrap;">'+r.body.substring(0,300)+'</p>':''}
        </div>
      `).join('');
    }).catch(()=>{const el=document.getElementById('release-notes');if(el)el.innerHTML='<p style="color:rgba(255,255,255,0.2);">Nie można załadować.</p>';});
  }

  applyFontSettings() {
    const font = localStorage.getItem('vex_font') || 'inter';
    const size = localStorage.getItem('vex_font_size') || 'medium';
    const fontMap = { inter: 'var(--font)', system: 'var(--font-system)', monospace: 'var(--font-mono)', serif: 'var(--font-serif)' };
    const sizeMap = { small: '13px', medium: '14px', large: '16px', xlarge: '18px' };
    document.documentElement.style.setProperty('--app-font', fontMap[font] || 'var(--font)');
    document.documentElement.style.setProperty('--app-fs-base', sizeMap[size] || '14px');
  }

  renderSteam(el) {
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;margin-bottom:16px;">
        <h3 style="margin-bottom:4px;">Importuj gry z Steam</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Przeskanuj swój komputer w poszukiwaniu zainstalowanych gier Steam i dodaj je do biblioteki VexCenter.</p>
        <button class="btn btn-primary" id="steam-scan-btn">🔍 Skanuj Steam</button>
        <div id="steam-results" style="margin-top:16px;"></div>
      </div>
    `;

    const resultsDiv = document.getElementById('steam-results');
    document.getElementById('steam-scan-btn').addEventListener('click', async () => {
      if (!window.VexCenter?.steam) {
        resultsDiv.innerHTML = '<p style="color:rgba(255,255,255,0.3);padding:12px;">Funkcja dostępna tylko w aplikacji VexCenter (nie w przeglądarce).</p>';
        return;
      }
      resultsDiv.innerHTML = '<p style="color:rgba(255,255,255,0.3);padding:12px;">Skanowanie...</p>';
      try {
        const data = await window.VexCenter.steam.scan();
        const games = data.games || [];
        if (!games.length) {
          resultsDiv.innerHTML = '<p style="color:rgba(255,255,255,0.3);padding:12px;">Nie znaleziono żadnych gier Steam na tym komputerze.</p>';
          return;
        }
        let html = '<div style="max-height:400px;overflow-y:auto;border:1px solid var(--glass-border);border-radius:8px;">';
        html += games.map((g, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--glass-border);">
            <input type="checkbox" checked id="steam-game-${i}" style="width:16px;height:16px;accent-color:#7c3aed;" />
            <div style="flex:1;font-size:13px;">${g.title}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.3);">ID: ${g.steam_id}</div>
          </div>
        `).join('');
        html += '</div>';
        html += `<button class="btn btn-primary" id="steam-import-btn" style="margin-top:12px;">📥 Importuj zaznaczone (${games.length})</button>`;
        resultsDiv.innerHTML = html;

        document.getElementById('steam-import-btn').addEventListener('click', async () => {
          const selected = [];
          document.querySelectorAll('[id^="steam-game-"]:checked').forEach(cb => {
            const idx = parseInt(cb.id.replace('steam-game-', ''));
            selected.push(games[idx]);
          });
          if (!selected.length) { showModal('Info', 'Nie zaznaczono żadnych gier', 'info'); return; }
          document.getElementById('steam-import-btn').disabled = true;
          document.getElementById('steam-import-btn').textContent = 'Importowanie...';
          try {
            const res = await api.steamImport(selected);
            showModal('Sukces', 'Zaimportowano ' + res.added + ' gier!', 'success');
            resultsDiv.innerHTML = '<p style="color:rgba(255,255,255,0.3);padding:12px;">Import zakończony. Zaimportowano ' + res.added + ' gier.</p>';
          } catch (err) { showModal('Błąd', err.message, 'error');
            document.getElementById('steam-import-btn').disabled = false;
            document.getElementById('steam-import-btn').textContent = '📥 Importuj zaznaczone'; }
        });
      } catch (err) {
        resultsDiv.innerHTML = '<p style="color:#ef4444;padding:12px;">Błąd skanowania: ' + err.message + '</p>';
      }
    });
  }

  async renderReports(el) {
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;margin-bottom:16px;">
        <h3 style="margin-bottom:4px;">Zgłoś problem</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Masz problem? Chcesz zaproponować nową funkcję? Daj nam znać!</p>
        <form id="report-form">
          <div class="form-group"><label>Tytuł</label><input type="text" id="report-title" required placeholder="Krótki tytuł zgłoszenia" /></div>
          <div class="form-group"><label>Kategoria</label>
            <select id="report-category" style="width:100%;padding:10px 12px;border:1px solid var(--glass-border);border-radius:8px;background:rgba(255,255,255,0.04);color:#fff;font-size:14px;font-family:inherit;outline:none;">
              <option value="bug">Błąd</option>
              <option value="feature">Propozycja</option>
              <option value="other">Inne</option>
            </select>
          </div>
          <div class="form-group"><label>Opis</label><textarea id="report-desc" rows="4" required placeholder="Szczegółowy opis..."></textarea></div>
          <button class="btn btn-primary" type="submit">Wyślij zgłoszenie</button>
        </form>
      </div>
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:16px;">Twoje zgłoszenia</h3>
        <div id="my-reports-list"></div>
      </div>
    `;

    document.getElementById('report-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('report-title').value.trim(),
        category: document.getElementById('report-category').value,
        description: document.getElementById('report-desc').value.trim(),
      };
      if (!data.title || !data.description) return;
      try {
        await api.submitReport(data);
        showModal('Sukces', 'Zgłoszenie wysłane!', 'success');
        document.getElementById('report-form').reset();
        this.loadReportsList();
      } catch (err) { showModal('Błąd', err.message, 'error'); }
    });

    this.loadReportsList();
  }

  async loadReportsList() {
    const el = document.getElementById('my-reports-list');
    if (!el) return;
    try {
      const d = await api.getMyReports();
      const list = d.reports || [];
      if (!list.length) { el.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Brak zgłoszeń.</p>'; return; }
      const statusColors = { open: 'rgba(239,68,68,0.15)', in_progress: 'rgba(245,158,11,0.15)', resolved: 'rgba(16,185,129,0.15)', closed: 'rgba(255,255,255,0.08)' };
      const statusText = { open: 'Otwarte', in_progress: 'W trakcie', resolved: 'Rozwiązane', closed: 'Zamknięte' };
      el.innerHTML = list.map(r => `
        <div style="padding:14px;border-bottom:1px solid var(--glass-border);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <strong style="font-size:14px;">${r.title}</strong>
            <span style="font-size:11px;padding:2px 10px;border-radius:4px;background:${statusColors[r.status]||statusColors.open};color:${r.status==='resolved'?'var(--green-400)':r.status==='in_progress'?'var(--yellow-400)':r.status==='closed'?'rgba(255,255,255,0.3)':'var(--red-400)'}">${statusText[r.status]||r.status}</span>
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:4px;">${r.category} • ${r.created_at}</div>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);">${r.description}</p>
          ${r.admin_note ? '<div style="margin-top:8px;padding:8px 12px;background:rgba(124,58,237,0.08);border-radius:6px;font-size:12px;color:var(--purple-300);">Odpowiedź admina: '+r.admin_note+'</div>' : ''}
        </div>
      `).join('');
    } catch { el.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Błąd ładowania zgłoszeń.</p>'; }
  }

  renderDownloads(el) {
    const dl = window.VexCenter?.download;
    if (!dl) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">Menedżer pobierania dostępny tylko w aplikacji desktopowej.</div>';
      return;
    }
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:4px;">Menedżer pobierania</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Wstrzymuj i wznawiaj pobieranie gier.</p>
        <div id="downloads-list" style="display:flex;flex-direction:column;gap:12px;">Ładowanie...</div>
      </div>
    `;
    this._refreshDownloads();
    const unsub = dl.onUpdate(() => this._refreshDownloads());
    this._dlUnsub = unsub;
  }

  _refreshDownloads() {
    const el = document.getElementById('downloads-list');
    if (!el) return;
    const dl = window.VexCenter?.download;
    if (!dl) return;
    dl.list().then(list => {
      if (!list || !list.length) {
        el.innerHTML = '<p style="color:rgba(255,255,255,0.2);text-align:center;padding:20px;font-size:13px;">Brak pobieranych plików.</p>';
        return;
      }
      el.innerHTML = list.map(d => {
        const isActive = d.state === 'downloading';
        const isPaused = d.state === 'paused';
        const isCompleted = d.state === 'completed';
        const isFailed = d.state === 'failed';
        const pct = d.progress || 0;
        const stateIcon = isActive ? '⏳' : isPaused ? '⏸️' : isCompleted ? '✅' : '❌';
        const stateText = isActive ? 'Pobieranie' : isPaused ? 'Wstrzymane' : isCompleted ? 'Zakończone' : 'Błąd';
        return `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${stateIcon} ${d.title||d.filename||'Nieznany'}</span>
              <span style="font-size:11px;color:rgba(255,255,255,0.3);">${stateText}</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;margin-bottom:8px;">
              <div style="height:100%;width:${pct}%;background:${isFailed?'var(--red-400,#ef4444)':isCompleted?'var(--green-400,#10b981)':'var(--purple-400,#a78bfa)'};border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <div style="display:flex;gap:6px;">
              ${isActive ? `<button class="btn btn-sm btn-ghost dl-pause" data-id="${d.id}">⏸ Wstrzymaj</button>` : ''}
              ${isPaused ? `<button class="btn btn-sm btn-primary dl-resume" data-id="${d.id}">▶ Wznów</button>` : ''}
              ${(isActive||isPaused) ? `<button class="btn btn-sm btn-ghost dl-cancel" data-id="${d.id}">🗑 Anuluj</button>` : ''}
              ${isFailed ? `<button class="btn btn-sm btn-ghost dl-cancel" data-id="${d.id}">🗑 Usuń</button>` : ''}
              ${isCompleted ? `<span style="font-size:11px;color:rgba(255,255,255,0.2);padding:6px 10px;">${d.filepath||''}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
      el.querySelectorAll('.dl-pause').forEach(b => b.addEventListener('click', () => { dl.pause(b.dataset.id); this._refreshDownloads(); }));
      el.querySelectorAll('.dl-resume').forEach(b => b.addEventListener('click', () => { dl.resume(b.dataset.id); setTimeout(()=>this._refreshDownloads(),500); }));
      el.querySelectorAll('.dl-cancel').forEach(b => b.addEventListener('click', () => { dl.cancel(b.dataset.id); this._refreshDownloads(); }));
    }).catch(() => { el.innerHTML = '<p style="color:rgba(255,255,255,0.2);text-align:center;padding:20px;">Błąd ładowania listy.</p>'; });
  }

  renderAbout(el) {
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:32px;text-align:center;">
        <div style="width:80px;height:80px;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);margin:0 auto 20px;animation:logoSpin 12s linear infinite;filter:drop-shadow(0 0 40px rgba(124,58,237,0.3));"></div>
        <h2 style="font-size:24px;font-weight:900;background:linear-gradient(135deg,#fff 20%,#a78bfa 50%,#f472b6 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px;">VexCenter</h2>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:24px;">v1.6.5 — Gaming Platform</p>
        <div style="background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.1);border-radius:12px;padding:24px;margin-bottom:20px;">
          <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:8px;">Stworzone przez</p>
          <p style="font-size:20px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">VexHack Team</p>
        </div>
        <div style="background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:12px;">Dołącz do nas na Discordzie!</p>
          <a href="https://dc.gg/vexhack.py" target="_blank" class="btn btn-primary" style="font-size:15px;padding:14px 32px;text-decoration:none;display:inline-flex;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.054C1.482 8.336.87 12.185.985 15.976a.076.076 0 0 0 .031.058 19.813 19.813 0 0 0 5.964 3.017.076.076 0 0 0 .082-.027 14.09 14.09 0 0 0 1.22-1.987.074.074 0 0 0-.04-.102 12.97 12.97 0 0 1-1.87-.89.074.074 0 0 1-.017-.118l.327-.256a.074.074 0 0 1 .073-.014c3.928 1.794 8.182 1.794 12.058 0a.074.074 0 0 1 .074.014l.328.256a.074.074 0 0 1-.018.118c-.594.34-1.2.64-1.867.89a.074.074 0 0 0-.04.102c.39.7.79 1.362 1.22 1.987a.076.076 0 0 0 .082.027 19.774 19.774 0 0 0 5.973-3.017.076.076 0 0 0 .03-.058c.13-4.256-.513-8.094-2.412-11.552a.066.066 0 0 0-.032-.054zM8.02 13.33c-.78 0-1.422-.72-1.422-1.597 0-.878.623-1.597 1.422-1.597.798 0 1.422.72 1.422 1.597 0 .878-.624 1.597-1.422 1.597zm7.96 0c-.78 0-1.422-.72-1.422-1.597 0-.878.624-1.597 1.422-1.597.798 0 1.422.72 1.422 1.597 0 .878-.615 1.597-1.422 1.597z"/></svg>
            Dołącz na Discord
          </a>
        </div>
        <p style="font-size:12px;color:rgba(255,255,255,0.15);">dc.gg/vexhack.py</p>
      </div>
    `;
  }
}

const settingsPage = new SettingsPage();
