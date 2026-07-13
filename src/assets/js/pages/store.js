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
}

const storePage = new StorePage();
