class LibraryPage {
  constructor() {
    this.CUSTOM_GAMES_KEY = 'vex_custom_games';
  }

  getCustomGames() {
    return JSON.parse(localStorage.getItem(this.CUSTOM_GAMES_KEY) || '[]');
  }

  saveCustomGame(game) {
    const games = this.getCustomGames();
    games.push({ id: 'custom_' + Date.now(), addedAt: new Date().toISOString(), ...game });
    localStorage.setItem(this.CUSTOM_GAMES_KEY, JSON.stringify(games));
  }

  removeCustomGame(id) {
    const games = this.getCustomGames().filter(g => g.id !== id);
    localStorage.setItem(this.CUSTOM_GAMES_KEY, JSON.stringify(games));
  }

  render(container) {
    container.innerHTML = `
      <div class="page library-page">
        <div class="page-header" style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;gap:16px;">
          <div>
            <h1>Biblioteka</h1>
            <p class="subtitle">Twoja kolekcja gier</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" id="lib-view-grid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" id="lib-view-list">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div id="library-content"></div>
      </div>
    `;
    this.loadLibrary();
  }

  async loadLibrary() {
    const content = document.getElementById('library-content');

    if (!api.isAuthenticated) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>Biblioteka jest pusta</h3>
          <p>Zaloguj się, aby zobaczyć zakupione gry.</p>
          <button class="btn btn-primary" onclick="router.navigate('auth')">Zaloguj się</button>
        </div>
      `;
      return;
    }

    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    let purchasedGames = [];
    try {
      const data = await api.getLibrary();
      purchasedGames = data.games || [];
    } catch {}

    const customGames = this.getCustomGames();

    if (purchasedGames.length === 0 && customGames.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
              <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M14 12h4"/><path d="M10 10v4"/>
            </svg>
          </div>
          <h3>Brak gier w bibliotece</h3>
          <p>Odwiedź sklep i kup swoje pierwsze gry lub dodaj ręcznie zainstalowaną grę.</p>
          <button class="btn btn-primary" id="lib-add-manual-empty" style="margin-top:12px;">+ Dodaj grę ręcznie</button>
        </div>
      `;
      document.getElementById('lib-add-manual-empty')?.addEventListener('click', () => this.showAddManualModal());
      return;
    }

    let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
    html += '<h2 style="font-size:18px;">Zakupione gry</h2>';
    html += '<button class="btn btn-primary btn-sm" id="lib-add-manual-btn">+ Dodaj ręcznie</button>';
    html += '</div>';

    if (purchasedGames.length > 0) {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:32px;">';
      for (const g of purchasedGames) {
        html += this.renderGameCard(g);
      }
      html += '</div>';
    } else {
      html += '<p style="color:rgba(255,255,255,0.3);margin-bottom:32px;">Brak zakupionych gier.</p>';
    }

    if (customGames.length > 0) {
      html += '<h2 style="font-size:18px;margin-bottom:16px;">Moje gry (lokalne)</h2>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">';
      for (const g of customGames) {
        html += `
          <div class="game-card" style="position:relative;">
            <div class="game-card-body" style="padding:20px;">
              <h3 style="font-size:15px;font-weight:700;">${g.name}</h3>
              <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;">${g.exePath || 'Brak ścieżki'}</p>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn btn-primary btn-sm btn-play" data-exe="${g.exePath}" data-name="${g.name}" style="flex:1;">Uruchom</button>
                <button class="btn btn-ghost btn-sm btn-remove-custom" data-id="${g.id}" style="padding:6px 8px;color:#ef4444;">Usuń</button>
              </div>
            </div>
          </div>
        `;
      }
      html += '</div>';
    }

    content.innerHTML = html;

    document.getElementById('lib-add-manual-btn')?.addEventListener('click', () => this.showAddManualModal());

    content.querySelectorAll('.game-card').forEach(card => {
      const btn = card.querySelector('.btn-play');
      if (btn) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); this.launchGame(btn.dataset.exe, btn.dataset.name); });
      }
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-play') || e.target.closest('.btn-remove-custom')) return;
        router.navigate('game', {id: parseInt(card.dataset.gameId)});
      });
    });

    content.querySelectorAll('.btn-remove-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.removeCustomGame(id);
        this.loadLibrary();
      });
    });
  }

  renderGameCard(g) {
    return `
      <div class="game-card" data-game-id="${g.id}">
        <div class="game-card-img" style="background:linear-gradient(135deg,#7c3aed20,#a855f720);position:relative;">
          ${g.thumbnail ? '<img src="'+img(g.thumbnail)+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'" />' : ''}
          <div style="font-size:32px;opacity:0.3;display:flex;align-items:center;justify-content:center;height:100%;">🎮</div>
        </div>
        <div class="game-card-body">
          <h3 class="game-card-title">${g.title}</h3>
          <div class="game-card-meta">
            ${g.rating ? '<span>★ ' + g.rating + '</span>' : ''}
            <span>${g.price > 0 ? g.price.toFixed(2) + ' PLN' : 'Darmowa'}</span>
          </div>
          ${g.installed && g.executable_path ? '<button class="btn btn-primary btn-sm btn-play" data-exe="'+g.executable_path+'" data-name="'+g.title+'" style="margin-top:10px;width:100%;">▶ Uruchom</button>' : ''}
        </div>
      </div>
    `;
  }

  showAddManualModal() {
    const existing = document.getElementById('manual-game-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'manual-game-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.innerHTML = `
      <div style="background:#1a1a2e;border-radius:16px;padding:32px;width:100%;max-width:440px;">
        <h2 style="margin-bottom:24px;">Dodaj grę ręcznie</h2>
        <form id="manual-game-form">
          <div class="form-group">
            <label>Nazwa gry</label>
            <input type="text" id="mg-name" placeholder="Nazwa gry" required />
          </div>
          <div class="form-group">
            <label>Ścieżka do pliku .exe</label>
            <div style="display:flex;gap:8px;">
              <input type="text" id="mg-exe" placeholder="C:\\Gry\\moja_gra\\game.exe" required style="flex:1;" />
              <button type="button" class="btn btn-ghost btn-sm" id="mg-browse">Przeglądaj</button>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:20px;">
            <button type="submit" class="btn btn-primary btn-block">Dodaj</button>
            <button type="button" class="btn btn-ghost" id="mg-cancel" style="flex:0">Anuluj</button>
          </div>
          <div id="mg-error" style="margin-top:12px;display:none;color:#ef4444;font-size:13px;"></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('mg-cancel').addEventListener('click', () => modal.remove());

    document.getElementById('mg-browse').addEventListener('click', async () => {
      if (window.VexCenter?.game?.selectExecutable) {
        const result = await window.VexCenter.game.selectExecutable();
        if (result && result.path) {
          document.getElementById('mg-exe').value = result.path;
        }
      }
    });

    document.getElementById('manual-game-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('mg-name').value.trim();
      const exe = document.getElementById('mg-exe').value.trim();
      const err = document.getElementById('mg-error');

      if (!name || !exe) {
        err.textContent = 'Wypełnij wszystkie pola.';
        err.style.display = 'block';
        return;
      }

      this.saveCustomGame({ name, exePath: exe });
      modal.remove();
      this.loadLibrary();
    });
  }

  launchGame(exePath, name) {
    if (!exePath) {
      showModal('Info', 'Brak ścieżki do pliku wykonywalnego.', 'info');
      return;
    }
    if (window.VexCenter?.game?.launch) {
      window.VexCenter.game.launch(null, exePath)
        .then(r => { if (!r.success) showModal('Błąd', r.error || 'Nieznany błąd', 'error'); })
        .catch(e => showModal('Błąd', e.message, 'error'));
    } else {
      showModal('Info', 'Funkcja uruchamiania dostępna tylko w aplikacji desktopowej.', 'info');
    }
  }
}

const libraryPage = new LibraryPage();
