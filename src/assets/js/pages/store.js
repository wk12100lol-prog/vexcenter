class StorePage {
  render(container) {
    container.innerHTML = `
      <div class="page store-page">
        <div id="announcements-bar" style="margin-bottom:16px;display:flex;flex-direction:column;gap:8px;"></div>

        <div class="hero-banner">
          <div class="hero-bg">
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

    this.loadFeatured();
    this.loadNewReleases();
    this.loadTopRated();
  }

  async loadFeatured() {
    const grid = document.getElementById('store-featured-grid');
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

  handleUpload() {
    if (!api.isAuthenticated) {
      alert('Zaloguj się, aby dodać grę.');
      return;
    }
    if (!api.isDeveloper) {
      if (confirm('Musisz zostać zweryfikowanym deweloperem. Przejść do ustawień?')) {
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
            <label>Plik gry (.exe, .zip)</label>
            <input type="file" id="up-file" accept=".exe,.zip,.rar,.7z,.msi" required />
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
        fd.append('game_file', document.getElementById('up-file').files[0]);
        const img = document.getElementById('up-image').files[0];
        if (img) fd.append('image', img);

        const result = await api.uploadGame(fd);
        alert('Gra została przesłana!');
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
