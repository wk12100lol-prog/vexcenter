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
      background:radial-gradient(ellipse at 50% 50%,#0d0d1a 0%,#000 100%);
      display:flex;align-items:center;justify-content:center;
      transition:opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
    `;

    // Particle burst
    const colors = ['#7c3aed','#a855f7','#ec4899','#06b6d4','#8b5cf6','#f472b6','#22d3ee','#818cf8'];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      const angle = Math.random() * 360;
      const dist = 80 + Math.random() * 250;
      const px = Math.cos(angle * Math.PI / 180) * dist;
      const py = Math.sin(angle * Math.PI / 180) * dist;
      const sz = 1.5 + Math.random() * 3;
      const dur = 1.5 + Math.random() * 3;
      p.style.cssText = `
        position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:50%;top:50%;
        opacity:0;
        animation: splashParticle ${dur}s cubic-bezier(0.2,0.8,0.2,1) ${0.3 + Math.random()*0.5}s forwards;
        --tx:${px}px;--ty:${py}px;
        filter:blur(${sz > 2 ? '2px' : '0.5px'}) brightness(1.3);
      `;
      overlay.appendChild(p);
    }

    if (alreadyLoggedIn) {
      const hexColors = ['#7c3aed','#a855f7','#ec4899','#06b6d4','#8b5cf6','#f472b6','#22d3ee','#c084fc','#e879f9','#2dd4bf','#818cf8','#f9a8d4'];

      // Stars
      const stars = document.createElement('div');
      stars.style.cssText = 'position:absolute;inset:0;background-image:' +
        'radial-gradient(1px 1px at 10% 20%,rgba(255,255,255,0.4),transparent),' +
        'radial-gradient(1px 1px at 30% 50%,rgba(255,255,255,0.3),transparent),' +
        'radial-gradient(1.5px 1.5px at 50% 10%,rgba(255,255,255,0.5),transparent),' +
        'radial-gradient(1px 1px at 70% 30%,rgba(255,255,255,0.2),transparent),' +
        'radial-gradient(1px 1px at 90% 60%,rgba(255,255,255,0.3),transparent),' +
        'radial-gradient(1.5px 1.5px at 20% 80%,rgba(255,255,255,0.4),transparent);' +
        'animation:starTwinkle 4s ease-in-out infinite alternate;';
      overlay.appendChild(stars);

      // Nebula glows
      const nebulaHTML = '<div style="position:absolute;width:600px;height:600px;border-radius:50%;filter:blur(150px);opacity:0.06;background:#7c3aed;top:-200px;left:-150px;animation:nebulaDrift 12s ease-in-out infinite alternate;"></div>' +
        '<div style="position:absolute;width:600px;height:600px;border-radius:50%;filter:blur(150px);opacity:0.06;background:#ec4899;bottom:-200px;right:-150px;animation:nebulaDrift 12s ease-in-out infinite alternate;animation-delay:-4s;"></div>';
      overlay.insertAdjacentHTML('beforeend', nebulaHTML);

      // 120 burst particles
      const burstColors = ['#7c3aed','#a855f7','#ec4899','#06b6d4','#8b5cf6','#f472b6','#22d3ee','#818cf8','#c084fc','#f9a8d4','#e879f9','#2dd4bf'];
      for (let i = 0; i < 120; i++) {
        const p = document.createElement('div');
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dist = 40 + Math.random() * 350;
        const tx = Math.sin(phi) * Math.cos(theta) * dist;
        const ty = Math.sin(phi) * Math.sin(theta) * dist;
        const tz = Math.cos(phi) * dist * 0.5;
        const sz = 1 + Math.random() * 4;
        const col = burstColors[Math.floor(Math.random() * burstColors.length)];
        p.style.cssText = `position:absolute;border-radius:50%;left:50%;top:50%;opacity:0;will-change:transform,opacity;` +
          `--tx:${tx}px;--ty:${ty}px;--tz:${tz}px;width:${sz}px;height:${sz}px;background:${col};` +
          `box-shadow:0 0 ${sz*4}px ${col};filter:blur(${sz>3?'2px':'0.5px'}) brightness(1.5);` +
          `animation:splashParticle3D ${1+Math.random()*3}s cubic-bezier(0.15,0.8,0.3,1) ${Math.random()*0.6}s forwards;`;
        overlay.appendChild(p);
      }

      // Center content
      overlay.innerHTML += `
        <div style="text-align:center;position:relative;z-index:10;transform-style:preserve-3d;perspective:1000px;">
          <div style="position:relative;display:flex;justify-content:center;align-items:center;height:120px;margin:0 auto 24px;animation:centerFloat 5s ease-in-out infinite;">
            <div style="position:absolute;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%);animation:glowPulse 3s ease-in-out infinite;"></div>
            <div style="position:relative;z-index:2;">
              <div style="width:90px;height:90px;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpin 12s linear infinite;filter:drop-shadow(0 0 80px rgba(124,58,237,0.3)) drop-shadow(0 0 150px rgba(168,85,247,0.15));transform:translateZ(10px);"></div>
              <div style="position:absolute;width:48px;height:48px;background:#0d0d1a;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpinReverse 12s linear infinite;inset:0;margin:auto;transform:translateZ(15px);"></div>
              <div style="position:absolute;width:130px;height:130px;border:1px solid rgba(124,58,237,0.1);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%) translateZ(-5px);animation:hexRingSpin 8s linear infinite;"></div>
            </div>
          </div>
          <h1 style="font-size:42px;font-weight:900;background:linear-gradient(135deg,#fff 15%,#a78bfa 45%,#f472b6 70%,#fff 85%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-2px;margin-bottom:4px;opacity:0;animation:titleReveal 1s cubic-bezier(0.16,1,0.3,1) 0.8s forwards;transform:translateZ(30px);">VexCenter</h1>
          <p style="font-size:12px;color:rgba(255,255,255,0.12);letter-spacing:3px;text-transform:uppercase;font-weight:500;opacity:0;animation:taglineReveal 0.8s ease 1.5s forwards;transform:translateZ(10px);">Gaming Platform</p>
          <div style="position:fixed;bottom:32px;left:0;right:0;text-align:center;z-index:20;opacity:0;animation:fadeIn 1s ease 2.5s forwards;">
            <p style="font-size:11px;color:rgba(255,255,255,0.1);letter-spacing:1px;">by VexHack Team &bull; <a href="https://dc.gg/vexhack.py" target="_blank" style="color:#7c3aed;text-decoration:none;">dc.gg/vexhack.py</a></p>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      window.__dismissSplash = () => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(1.05)';
        setTimeout(() => {
          overlay.remove();
        }, 600);
      };
      return;
    }

    overlay.innerHTML += `
      <div style="text-align:center;animation:splashReveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;max-width:420px;width:100%;padding:20px;">
        <div style="position:relative;display:flex;justify-content:center;align-items:center;height:90px;margin-bottom:20px;">
          <div style="position:absolute;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%);animation:glowPulse 3s ease-in-out infinite;"></div>
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpin 20s linear infinite;filter:drop-shadow(0 0 60px rgba(124,58,237,0.4));"></div>
          <div style="position:absolute;width:38px;height:38px;background:#0d0d1a;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);animation:logoSpinReverse 20s linear infinite;"></div>
        </div>
        <h1 style="font-size:38px;font-weight:900;background:linear-gradient(135deg,#fff 20%,#a78bfa 50%,#f472b6 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px;margin-bottom:4px;animation:textGlow 4s ease-in-out infinite;">VexCenter</h1>
        <p style="color:rgba(255,255,255,0.25);font-size:14px;margin-bottom:36px;letter-spacing:1px;">Zaloguj się, aby kontynuować</p>
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
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="splash-btn" style="position:relative;overflow:hidden;"><span style="position:relative;z-index:1;">Zaloguj się</span></button>
        </form>
        <p style="margin-top:20px;font-size:13px;color:rgba(255,255,255,0.3);">
          <span id="splash-toggle-label">Nie masz konta?</span>
          <a id="splash-toggle" style="color:var(--purple-400);cursor:pointer;font-weight:600;">Zarejestruj się</a>
        </p>
        <div id="splash-error" style="margin-top:12px;padding:10px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:none;font-size:13px;color:var(--red-400);"></div>
        <p style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.12);">v${window.VexCenter?.appVersion || '1.6.0'} — Gaming Platform</p>
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
    const appVersion = window.VexCenter?.appVersion || '1.6.0';
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

  function applyFontSettings() {
    const font = localStorage.getItem('vex_font') || 'inter';
    const size = localStorage.getItem('vex_font_size') || 'medium';
    const fontMap = { inter: 'var(--font)', system: 'var(--font-system)', monospace: 'var(--font-mono)', serif: 'var(--font-serif)' };
    const sizeMap = { small: '13px', medium: '14px', large: '16px', xlarge: '18px' };
    document.documentElement.style.setProperty('--app-font', fontMap[font] || 'var(--font)');
    document.documentElement.style.setProperty('--app-fs-base', sizeMap[size] || '14px');
  }

  async function init() {
    applyFontSettings();
    const savedTheme = localStorage.getItem('vex_theme');
    if (savedTheme === 'light') document.documentElement.classList.add('theme-light');

    // Show splash immediately for logged-in users; load everything in background
    const isLoggedIn = !!api.token;
    if (isLoggedIn) createSplash(true);

    createBackground();
    initTitlebar();
    headerComponent.render();
    sidebarComponent.render();
    document.getElementById('sidebar-logout')?.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
    registerRoutes();

    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hidden');

    router.init();

    if (isLoggedIn) {
      try {
        const restored = await api.restoreSession();
        if (restored) {
          headerComponent.updateUser(api.user);
          initAutoUpdateListeners();
          if (window.__dismissSplash) {
            window.__dismissSplash();
            setTimeout(() => (window.__dismissSplash = null), 1000);
          }
          router.navigate('store');
          return;
        }
      } catch (e) {
        console.error('[Init] restoreSession failed:', e);
      }
      // Fallback: if restoreSession fails, still dismiss splash
      if (window.__dismissSplash) {
        window.__dismissSplash();
        setTimeout(() => (window.__dismissSplash = null), 1000);
      }
    }
    if (!isLoggedIn) createSplash(false);
    initAutoUpdateListeners();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init().catch(e => console.error('[Init] init() failed:', e));
})();
