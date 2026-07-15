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
            ${['profile','friends','developer','games','notifications','updates'].map((t,i) => `
              <button class="btn settings-tab ${i===0?'btn-primary':'btn-ghost'}" data-tab="${t}" style="text-align:left;justify-content:flex-start;padding:10px 14px;border-radius:8px;">
                ${t === 'profile' ? '👤 Profil' : t === 'friends' ? '👥 Znajomi' : t === 'developer' ? '🛠 Deweloper' : t === 'games' ? '🎮 Gry' : t === 'notifications' ? '🔔 Powiadomienia' : '🔄 Aktualizacje'}
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
              <button class="btn btn-sm ${document.documentElement.classList.contains('theme-light')?'btn-primary':'btn-secondary'}" id="theme-dark-btn">Ciemny</button>
              <button class="btn btn-sm ${document.documentElement.classList.contains('theme-light')?'btn-secondary':'btn-primary'}" id="theme-light-btn">Jasny</button>
            </div>
          </div>
          <div style="flex:1;min-width:160px;">
            <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;">Język</label>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm ${(localStorage.getItem('vex_lang')||'pl')==='pl'?'btn-primary':'btn-secondary'}" id="lang-pl-btn">PL</button>
              <button class="btn btn-sm ${(localStorage.getItem('vex_lang')||'pl')==='en'?'btn-primary':'btn-secondary'}" id="lang-en-btn">EN</button>
            </div>
          </div>
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
    });
    document.getElementById('lang-en-btn')?.addEventListener('click', () => {
      if (typeof setLang === 'function') { setLang('en'); }
      document.getElementById('lang-en-btn').className = 'btn btn-sm btn-primary';
      document.getElementById('lang-pl-btn').className = 'btn btn-sm btn-secondary';
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
    el.innerHTML = `
      <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:24px;">
        <h3 style="margin-bottom:4px;">Aktualizacje</h3>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:20px;">Sprawdź czy dostępna jest nowsza wersja VexCenter.</p>
        <div style="background:rgba(124,58,237,0.08);border-radius:8px;border:1px solid rgba(124,58,237,0.15);padding:16px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:600;">Wersja 1.3.1</div>
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
  }
}

const settingsPage = new SettingsPage();
