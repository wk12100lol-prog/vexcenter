class StorePage {
  render(container) {
    container.innerHTML = `
      <div class="page store-page">
        <div id="announcements-bar" style="margin-bottom:16px;display:flex;flex-direction:column;gap:8px;"></div>

        <div class="hero-banner">
          <div class="hero-bg">
            <img class="hero-banner-img" src="assets/images/hero-banner.png" alt="" onerror="this.style.display='none'">
            <div class="mesh"></div>
            <div class="grid-overlay"></div>
          </div>
          <div class="hero-content">
            <div class="hero-text">
              <h2>Witaj w VexCenter</h2>
              <p>Odkrywaj, graj i dziel się swoimi grami ze społecznością. Każdy może zostać twórcą.</p>
            </div>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" id="hero-browse">Przeglądaj gry</button>
              <button class="btn btn-secondary btn-lg" id="hero-upload">Dodaj swoją grę</button>
            </div>
          </div>
        </div>

        <div class="section" id="recent-section" style="display:none;">
          <div class="section-header">
            <h2>Ostatnio grane</h2>
          </div>
          <div id="store-recent-grid"></div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Polecane</h2>
            <span class="section-link" id="see-all-featured">Zobacz wszystkie →</span>
          </div>
          <div id="store-featured-grid"></div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Nowości</h2>
            <span class="section-link" id="see-all-new">Zobacz wszystkie →</span>
          </div>
          <div id="store-new-grid"></div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Najwyżej oceniane</h2>
            <span class="section-link" id="see-all-top">Zobacz wszystkie →</span>
          </div>
          <div id="store-top-grid"></div>
        </div>
      </div>
    `;

    this.loadAnnouncements();

    document.getElementById('hero-browse')?.addEventListener('click', () => {
      document.getElementById('store-featured-grid')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('hero-upload')?.addEventListener('click', () => this.handleUpload());

    this.loadRecent();
    this.loadFeatured();
    this.loadNewReleases();
    this.loadTopRated();

    if (this._refreshInterval) clearInterval(this._refreshInterval);
    this._refreshInterval = setInterval(() => {
      if (!document.querySelector('.store-page')) return;
      this.loadFeatured();
      this.loadNewReleases();
      this.loadTopRated();
    }, 30000);
  }

  loadRecent() {
    const section = document.getElementById('recent-section');
    const grid = document.getElementById('store-recent-grid');
    if (!section || !grid) return;
    const recent = JSON.parse(localStorage.getItem('vex_recent') || '[]');
    if (recent.length === 0) { section.style.display = 'none'; return; }
    section.style.display = '';
    const games = recent.slice(0, 5).map(r => ({ id: r.id, title: r.title, thumbnail: r.thumbnail }));
    GameCardComponent.renderGrid(games, grid);
  }

  async loadFeatured() {
    const grid = document.getElementById('store-featured-grid');
    if (!grid) return;
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    grid.appendChild(loading);

    try {
      const data = await api.getGames({ featured: true, limit: 5 });
      GameCardComponent.renderGrid(data.items || data.games || [], grid, (data.items || data.games)?.[0]?.id);
    } catch {
      GameCardComponent.renderGrid([], grid);
    }
  }

  async loadNewReleases() {
    const grid = document.getElementById('store-new-grid');
    if (!grid) return;
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    grid.appendChild(loading);

    try {
      const data = await api.getGames({ sort: 'newest', limit: 6 });
      GameCardComponent.renderGrid(data.items || data.games || [], grid);
    } catch {
      GameCardComponent.renderGrid([], grid);
    }
  }

  async loadTopRated() {
    const grid = document.getElementById('store-top-grid');
    if (!grid) return;
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    grid.appendChild(loading);

    try {
      const data = await api.getGames({ sort: 'rating', limit: 6 });
      GameCardComponent.renderGrid(data.items || data.games || [], grid);
    } catch {
      GameCardComponent.renderGrid([], grid);
    }
  }

  async loadAnnouncements() {
    const bar = document.getElementById('announcements-bar');
    try {
      const d = await api.getAnnouncements();
      const items = d.announcements || [];
      if (items.length === 0) { bar.style.display = 'none'; return; }
      bar.style.display = 'flex';
      bar.innerHTML = items.map(a => {
        const icons = { info: 'ℹ️', warning: '⚠️', update: '🆕', maintenance: '🔧' };
        const colors = { info: 'rgba(124,58,237,0.08)', warning: 'rgba(245,158,11,0.08)', update: 'rgba(16,185,129,0.08)', maintenance: 'rgba(239,68,68,0.08)' };
        const borders = { info: 'rgba(124,58,237,0.15)', warning: 'rgba(245,158,11,0.15)', update: 'rgba(16,185,129,0.15)', maintenance: 'rgba(239,68,68,0.15)' };
        return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:10px;background:${colors[a.type]||colors.info};border:1px solid ${borders[a.type]||borders.info};backdrop-filter:blur(8px);">
          <span style="font-size:18px;">${icons[a.type]||icons.info}</span>
          <div><strong style="font-size:13px;">${a.title}</strong><p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">${a.content}</p></div>
        </div>`;
      }).join('');
    } catch { bar.style.display = 'none'; }
  }

  async handleUpload() {
    if (!api.isAuthenticated) {
      showModal('Info', 'Zaloguj się, aby dodać grę.', 'info');
      return;
    }
    if (!api.isDeveloper) {
      if (await showConfirm('Potwierdzenie', 'Musisz zostać zweryfikowanym deweloperem. Przejść do ustawień?')) {
        router.navigate('settings');
        setTimeout(() => {
          const devTab = document.querySelector('[data-tab="developer"]');
          if (devTab) devTab.click();
        }, 100);
      }
      return;
    }
    this.showUploadModal();
  }

  showUploadModal() {
    const existing = document.getElementById('upload-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'upload-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.innerHTML = `
      <div style="background:#1a1a2e;border-radius:16px;padding:32px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;">
        <h2 style="margin-bottom:24px;">Dodaj grę</h2>
        <form id="upload-form">
          <div class="form-group">
            <label>Tytuł</label>
            <input type="text" id="up-title" placeholder="Nazwa gry" required />
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea id="up-desc" rows="3" placeholder="Opis gry" required></textarea>
          </div>
          <div class="form-group">
            <label>Gatunek</label>
            <input type="text" id="up-genre" placeholder="np. Akcja, RPG, Strategia" />
          </div>
          <div class="form-group">
            <label>Cena (PLN)</label>
            <input type="number" id="up-price" placeholder="0.00" step="0.01" min="0" value="0" />
          </div>
          <div class="form-group">
            <label>Link do pobrania</label>
            <input type="url" id="up-download" placeholder="https://bzzhr.to/xyz123 lub direct link do pliku" required />
            <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;line-height:1.5;">
              Obsługiwane hostingi: <strong>bzzhr.to</strong>, <strong>MediaFire</strong>, <strong>Google Drive</strong>, <strong>Dropbox</strong>, <strong>1fichier</strong> oraz direct linki do plików (.zip, .exe, .rar).
              Mega nie jest obsługiwany.
            </div>
          </div>
          <div class="form-group">
            <label>Miniaturka (opcjonalnie)</label>
            <input type="file" id="up-image" accept="image/*" />
          </div>
          <div style="display:flex;gap:12px;margin-top:20px;">
            <button type="submit" class="btn btn-primary btn-block" id="up-submit">Wyślij</button>
            <button type="button" class="btn btn-ghost" id="up-cancel" style="flex:0">Anuluj</button>
          </div>
          <div id="up-error" style="margin-top:12px;display:none;color:#ef4444;font-size:13px;"></div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('up-cancel').addEventListener('click', () => modal.remove());

    document.getElementById('upload-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('up-submit');
      const err = document.getElementById('up-error');
      btn.disabled = true;
      btn.textContent = 'Przesyłanie...';
      err.style.display = 'none';

      try {
        const fd = new FormData();
        fd.append('title', document.getElementById('up-title').value);
        fd.append('description', document.getElementById('up-desc').value);
        fd.append('genre', document.getElementById('up-genre').value);
        fd.append('price', document.getElementById('up-price').value);
        fd.append('download_link', document.getElementById('up-download').value);
        const img = document.getElementById('up-image').files[0];
        if (img) fd.append('image', img);

        const result = await api.uploadGame(fd);
        showModal('Sukces', 'Gra została przesłana!', 'success');
        modal.remove();
        this.loadFeatured();
        this.loadNewReleases();
        this.loadTopRated();
      } catch (e) {
        err.textContent = e.message;
        err.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Wyślij';
      }
    });
  }
}

const storePage = new StorePage();
