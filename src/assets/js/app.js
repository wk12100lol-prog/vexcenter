(function () {
  'use strict';

  window.addEventListener('error', (e) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#1a1a2e;border-top:2px solid #ef4444;padding:12px 16px;font-size:12px;color:#ef4444;font-family:monospace;white-space:pre-wrap;max-height:200px;overflow:auto;';
    d.textContent = '[Błąd] ' + (e.error?.stack || e.message || 'Nieznany błąd');
    document.body?.appendChild(d);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#1a1a2e;border-top:2px solid #f59e0b;padding:12px 16px;font-size:12px;color:#f59e0b;font-family:monospace;white-space:pre-wrap;max-height:200px;overflow:auto;';
    d.textContent = '[Promise] ' + (e.reason?.message || e.reason || 'Nieznany');
    document.body?.appendChild(d);
  });

  /* === ANIMATED BG === */
  function createBackground() {
    const canvas = document.createElement('div');
    canvas.id = 'bg-canvas';

    for (let i = 0; i < 3; i++) {
      const g = document.createElement('div'); g.className = 'bg-glow'; canvas.appendChild(g);
    }
    const l = document.createElement('div'); l.className = 'bg-line'; canvas.appendChild(l);

    const colors = ['#7c3aed', '#a855f7', '#ec4899', '#06b6d4', '#8b5cf6', '#f472b6'];
    for (let i = 0; i < 35; i++) {
      const p = document.createElement('div'); p.className = 'bg-particle';
      const c = colors[i % colors.length];
      const sz = 2 + Math.random() * 3;
      const col = 20 + Math.random() * 60;
      Object.assign(p.style, {
        '--col': c, '--size': sz+'px', '--glow': (sz*4)+'px',
        '--dur': (12 + Math.random() * 18)+'s', '--delay': (Math.random() * 15)+'s',
        '--drift': (Math.random() - 0.5) * 30 + 'px',
        '--max-op': (0.3 + Math.random() * 0.4),
        left: col + '%', top: (Math.random() * 90 + 5) + '%'
      });
      canvas.appendChild(p);
    }
    document.body.appendChild(canvas);
  }

  /* === SPLASH SCREEN === */
  function createSplash(alreadyLoggedIn = false) {
    const overlay = document.createElement('div');
    overlay.id = 'splash-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:var(--black);
      display:flex;align-items:center;justify-content:center;
      transition:opacity 0.5s ease, transform 0.5s ease;
    `;
    if (alreadyLoggedIn) {
      overlay.style.cssText += 'opacity:0;pointer-events:none;';
      document.body.appendChild(overlay);
      setTimeout(() => { overlay.remove(); router.navigate('store'); }, 300);
      return;
    }

    const isLogin = true;
    overlay.innerHTML = `
      <div style="text-align:center;animation:fadeIn 0.8s ease;max-width:400px;width:100%;padding:20px;">
        <div style="position:relative;display:flex;justify-content:center;align-items:center;height:80px;margin-bottom:16px;">
          <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpin 20s linear infinite;filter:drop-shadow(0 0 40px rgba(124,58,237,0.3));"></div>
          <div style="position:absolute;width:34px;height:34px;background:var(--black);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpinReverse 20s linear infinite;"></div>
        </div>
        <h1 style="font-size:32px;font-weight:900;background:linear-gradient(135deg,#fff 30%,#a78bfa 70%,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px;margin-bottom:4px;">VexCenter</h1>
        <p style="color:rgba(255,255,255,0.3);font-size:14px;margin-bottom:32px;">Zaloguj się, aby kontynuować</p>
        <form id="splash-form" style="text-align:left;">
          <div id="splash-fields">
            <div class="form-group" id="splash-username-group" style="display:none;">
              <label for="splash-username">Nazwa użytkownika</label>
              <input type="text" id="splash-username" placeholder="Twoja nazwa" autocomplete="username" />
            </div>
            <div class="form-group">
              <label for="splash-email">Adres e-mail</label>
              <input type="email" id="splash-email" placeholder="twoj@email.pl" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="splash-password">Hasło</label>
              <input type="password" id="splash-password" placeholder="••••••••" required minlength="6" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="splash-btn">Zaloguj się</button>
        </form>
        <p style="margin-top:20px;font-size:13px;color:rgba(255,255,255,0.3);">
          <span id="splash-toggle-label">Nie masz konta?</span>
          <a id="splash-toggle" style="color:var(--purple-400);cursor:pointer;font-weight:600;">Zarejestruj się</a>
        </p>
        <div id="splash-error" style="margin-top:12px;padding:10px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:none;font-size:13px;color:var(--red-400);"></div>
        <p style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.12);">v1.4.1 — Gaming Platform</p>
        <a id="splash-diag" style="font-size:10px;color:rgba(255,255,255,0.08);cursor:pointer;display:block;margin-top:4px;">diagnostyka</a>
      </div>
    `;

    document.body.appendChild(overlay);

    // Diagnostyka po kliknięciu
    document.getElementById('splash-diag')?.addEventListener('click', async function() {
      this.textContent = 'Sprawdzanie połączenia...';
      try {
        const res = await fetch('https://vexcenter1.vercel.app/api/ping');
        const data = await res.json();
        this.textContent = 'API: ' + (data.status || 'err') + ' | DB: ' + (data.database || '?') + ' | PHP: ' + (data.php_version || '?');
      } catch (e) {
        this.textContent = 'Błąd połączenia: ' + e.message;
      }
    });

    let loginMode = true;
    const toggle = document.getElementById('splash-toggle');
    const toggleLabel = document.getElementById('splash-toggle-label');
    const usernameGroup = document.getElementById('splash-username-group');
    const btn = document.getElementById('splash-btn');
    const form = document.getElementById('splash-form');
    const emailInput = document.getElementById('splash-email');
    const passInput = document.getElementById('splash-password');
    const userInput = document.getElementById('splash-username');

    toggle.addEventListener('click', () => {
      loginMode = !loginMode;
      usernameGroup.style.display = loginMode ? 'none' : 'block';
      btn.textContent = loginMode ? 'Zaloguj się' : 'Utwórz konto';
      toggleLabel.textContent = loginMode ? 'Nie masz konta?' : 'Masz już konto?';
      toggle.textContent = loginMode ? 'Zarejestruj się' : 'Zaloguj się';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passInput.value;
      const username = userInput.value;

      btn.disabled = true;
      btn.textContent = 'Przetwarzanie...';

      try {
        let result;
        if (loginMode) {
          result = await api.login(email, password);
        } else {
          if (!username) { showModal('Info', 'Podaj nazwę użytkownika', 'info'); btn.disabled = false; btn.textContent = 'Utwórz konto'; return; }
          result = await api.register(username, email, password);
        }

        const data = result.data || result;
        if (data.token) {
          api.setToken(data.token);
          api.setUser(data.user);
          headerComponent.updateUser(data.user);
          overlay.style.opacity = '0';
          overlay.style.transform = 'scale(1.05)';
          setTimeout(() => { overlay.remove(); }, 500);
          router.navigate('store');
        }
      } catch (err) {
        showModal('Błąd', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = loginMode ? 'Zaloguj się' : 'Utwórz konto';
      }
    });

  }

  /* === TITLEBAR === */
  function initTitlebar() {
    const tb = document.createElement('div');
    tb.id = 'titlebar';
    tb.innerHTML = `
      <div class="logo-mark" id="logo-btn">
        <div class="hex"></div>
        <div class="hex-inner"></div>
        <div class="dot-ring"></div>
      </div>
      <span class="title">VexCenter</span>
      <div class="window-controls">
        <button class="btn-minimize" id="win-minimize"><svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <button class="btn-maximize" id="win-maximize"><svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1" ry="1"/></svg></button>
        <button class="btn-close" id="win-close"><svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
      </div>
    `;
    document.getElementById('app').insertBefore(tb, document.getElementById('app').firstChild);
    if (window.VexCenter?.window) {
      document.getElementById('win-minimize').addEventListener('click', () => window.VexCenter.window.minimize());
      document.getElementById('win-maximize').addEventListener('click', () => window.VexCenter.window.maximize());
      document.getElementById('win-close').addEventListener('click', () => window.VexCenter.window.close());
    }
  }

  /* === ROUTES === */
  function registerRoutes() {
    router.register('store', (c) => storePage.render(c));
    router.register('library', (c) => libraryPage.render(c));
    router.register('profile', (c) => profilePage.render(c));
    router.register('settings', (c) => settingsPage.render(c));
    router.register('admin', (c) => adminPage.render(c));
    router.register('game', (c, p) => gameDetailPage.render(c, p));
    router.register('user', (c, p) => userProfilePage.render(c, p));
  }

  let _updatePrompted = false;
  let _updateListenersInit = false;
  function initAutoUpdateListeners() {
    if (!window.VexCenter?.update || _updateListenersInit) return;
    _updateListenersInit = true;
    const appVersion = '1.4.1';
    window.VexCenter.update.onAvailable(async (info) => {
      if (_updatePrompted) return;
      _updatePrompted = true;
      if (localStorage.getItem('vex_auto_update') === 'true') {
        showModal('Aktualizacja', 'Pobieranie wersji ' + info.version + '...', 'info');
        await window.VexCenter.update.download();
      } else {
        const confirmed = await showConfirm('Dostępna aktualizacja', 'Nowa wersja ' + info.version + ' jest dostępna (masz ' + appVersion + '). Pobrać teraz?');
        if (confirmed) {
          await window.VexCenter.update.download();
        }
      }
    });
    window.VexCenter.update.onDownloaded(() => {
      showConfirm('Aktualizacja gotowa', 'Nowa wersja została pobrana. Zainstalować teraz?').then(ok => {
        if (ok) window.VexCenter.update.install();
      });
    });
  }

  async function init() {
    const savedTheme = localStorage.getItem('vex_theme');
    if (savedTheme === 'light') document.documentElement.classList.add('theme-light');
    createBackground();
    initTitlebar();
    headerComponent.render();
    sidebarComponent.render();
    document.getElementById('sidebar-logout')?.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
    registerRoutes();

    // hide logo splash
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hidden');

    router.init();

    if (api.token) {
      try {
        const restored = await api.restoreSession();
        if (restored) {
          headerComponent.updateUser(api.user);
          createSplash(true);
          initAutoUpdateListeners();
          return;
        }
      } catch (e) {
        console.error('[Init] restoreSession failed:', e);
      }
    }
    createSplash(false);
    initAutoUpdateListeners();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init().catch(e => console.error('[Init] init() failed:', e));
})();
