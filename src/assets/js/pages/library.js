class LibraryPage {
  render(container) {
    container.innerHTML = `
      <div class="page library-page">
        <div class="page-header">
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

    try {
      const data = await api.getLibrary();
      const games = data.games || [];
      if (games.length === 0) {
        content.innerHTML = `
          <div class="empty-state">
            <div class="icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
                <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M14 12h4"/><path d="M10 10v4"/>
              </svg>
            </div>
            <h3>Brak gier w bibliotece</h3>
            <p>Odwiedź sklep i kup swoje pierwsze gry!</p>
            <button class="btn btn-primary" onclick="router.navigate('store')">Przejdź do sklepu</button>
          </div>
        `;
      } else {
        GameCardComponent.renderGrid(games, content);
      }
    } catch {
      content.innerHTML = `
        <div class="empty-state">
          <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
              <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M14 12h4"/><path d="M10 10v4"/>
            </svg>
          </div>
          <h3>Brak gier w bibliotece</h3>
          <p>Odwiedź sklep i kup swoje pierwsze gry!</p>
          <button class="btn btn-primary" onclick="router.navigate('store')">Przejdź do sklepu</button>
        </div>
      `;
    }
  }
}

const libraryPage = new LibraryPage();
