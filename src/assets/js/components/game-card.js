class GameCardComponent {
  static palettes = [
    ['#7c3aed', '#a855f7', '#2e1065'],
    ['#ec4899', '#f472b6', '#831843'],
    ['#06b6d4', '#22d3ee', '#164e63'],
    ['#10b981', '#34d399', '#064e3b'],
    ['#f59e0b', '#fbbf24', '#78350f'],
    ['#ef4444', '#f87171', '#7f1d1d'],
    ['#8b5cf6', '#a78bfa', '#4c1d95'],
    ['#f97316', '#fb923c', '#7c2d12'],
    ['#14b8a6', '#2dd4bf', '#134e4a'],
    ['#6366f1', '#818cf8', '#312e81'],
  ];

  static generateArt(index) {
    const palette = this.palettes[index % this.palettes.length];
    const angle = (index * 37 + 45) % 360;
    const shapes = [
      `radial-gradient(circle at ${20 + (index * 13) % 60}% ${30 + (index * 17) % 50}%, ${palette[0]}88 0%, transparent 60%)`,
      `radial-gradient(circle at ${60 + (index * 7) % 30}% ${60 + (index * 11) % 30}%, ${palette[1]}66 0%, transparent 50%)`,
      `linear-gradient(${angle}deg, ${palette[0]}99, ${palette[1]}44, ${palette[2]}88)`,
      `repeating-linear-gradient(${angle + 45}deg, transparent, transparent 20px, ${palette[2]}22 20px, ${palette[2]}22 21px)`,
    ];
    return shapes.join(', ');
  }

  static render(game, featured = false, installed = false) {
    const card = document.createElement('vc-game-card');
    const artIndex = game.id || Math.floor(Math.random() * 1000);
    const artBg = this.generateArt(artIndex);
    const hasImage = !!game.thumbnail;

    card.innerHTML = `
      <div class="game-card ${featured ? 'featured' : ''}" data-game-id="${game.id}">
        <div class="thumbnail" id="thumb-${game.id}">
          <div class="thumb-art" style="background:${artBg};">
            ${hasImage ? `<img src="${img(game.thumbnail)}" alt="${game.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
          </div>
          <div class="overlay"></div>
          ${installed ? `
            <button class="play-overlay-btn" data-game-id="${game.id}" data-exe="${game.executable_path || ''}">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Play
            </button>
          ` : `
            <div class="play-hint">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          `}
        </div>
        <div class="info">
          <h3 title="${game.title}">${game.title}</h3>
          <div class="meta">
            <span class="price ${game.price === 0 ? 'free' : ''}">
              ${game.price > 0 ? `${game.price.toFixed(2)} zł` : 'Darmowa'}
            </span>
            ${game.rating ? `
              <span class="rating">
                <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${game.rating.toFixed(1)}
              </span>
            ` : ''}
          </div>
        </div>
        ${game.tags && game.tags.length > 0 ? `
          <div class="tags">
            ${game.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    card.querySelector('.game-card').addEventListener('click', function(e) {
      if (e.target.closest('.play-overlay-btn')) return;
      router.navigate('game', { id: game.id });
    });

    const playBtn = card.querySelector('.play-overlay-btn');
    if (playBtn) {
      playBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const exePath = this.dataset.exe;
        if (exePath && window.VexCenter?.game?.launch) {
          addRecentPlay(game.id, game.title, game.thumbnail);
          window.VexCenter.game.launch(game.id, exePath).then(r => {
            if (!r.success) showModal('Blad', r.error, 'error');
          });
        } else {
          router.navigate('game', { id: game.id });
        }
      });
    }

    return card;
  }

  static renderGrid(games, container, featuredId = null, installedIds = null) {
    container.innerHTML = '';
    if (!games || games.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 12h4"/>
              <path d="M14 12h4"/>
              <path d="M10 10v4"/>
            </svg>
          </div>
          <h3>Brak gier</h3>
          <p>Nie znaleziono żadnych gier. Sprawdź później.</p>
        </div>
      `;
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    games.forEach((game) => {
      const isFeatured = featuredId && game.id === featuredId;
      const isInstalled = installedIds && installedIds.has(game.id);
      grid.appendChild(GameCardComponent.render(game, isFeatured, isInstalled));
    });
    container.appendChild(grid);
  }
}
