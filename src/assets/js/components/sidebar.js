class SidebarComponent {
  constructor() {
    this.el = document.querySelector('vc-sidebar');
  }

  render() {
    this.el.innerHTML = `
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-title">Przeglądaj</div>
          <a class="sidebar-item active" data-route="store" href="#">
            <span class="icon"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span>
            Sklep
          </a>
          <a class="sidebar-item" data-route="library" href="#">
            <span class="icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
            Biblioteka
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-title">Społeczność</div>
          <a class="sidebar-item" data-route="profile" href="#">
            <span class="icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
            Profil
          </a>
          <a class="sidebar-item" data-route="settings" href="#">
            <span class="icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg></span>
            Ustawienia
          </a>
        </div>
        <div class="sidebar-section" data-role="admin">
          <div class="sidebar-section-title">Administracja</div>
          <a class="sidebar-item" data-route="admin" href="#">
            <span class="icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/><path d="M12 11l-4-2v2l4 2 4-2v-2l-4 2z"/></svg></span>
            Panel Admina
          </a>
        </div>
      </nav>
    `;
  }
}

const sidebarComponent = new SidebarComponent();
