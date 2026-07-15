const LANG = {
  pl: {
    store: 'Sklep', library: 'Biblioteka', profile: 'Profil',
    settings: 'Ustawienia', logout: 'Wyloguj', play: 'Graj',
    install: 'Zainstaluj', download: 'Pobierz', search: 'Szukaj...',
    recent: 'Ostatnio grane', featured: 'Polecane',
    free: 'Darmowa', rating: 'Ocena', reviews: 'Opinie',
    comments: 'Komentarze', login: 'Zaloguj', register: 'Rejestracja',
    light: 'Jasny', dark: 'Ciemny', language: 'Język',
    browse: 'Przeglądaj gry', upload: 'Dodaj swoją grę',
    newest: 'Nowości', top_rated: 'Najwyżej oceniane',
    no_games: 'Brak gier', no_results: 'Brak wyników',
    no_recent: 'Brak ostatnio granych gier',
    welcome_title: 'Witaj w VexCenter',
    welcome_desc: 'Odkrywaj, graj i dziel się swoimi grami ze społecznością. Każdy może zostać twórcą.',
    see_all: 'Zobacz wszystkie',
    all: 'All', free_filter: 'Darmowe', paid_filter: 'Płatne', top_filter: 'Najwyżej oceniane',
    back_to_store: 'Powrót do sklepu',
    write_review: 'Napisz opinię...', submit: 'Wyślij',
    downloads_count: 'pobrań', by: 'przez',
    comment_placeholder: 'Napisz komentarz...',
    no_reviews: 'Brak opinii. Bądź pierwszy!',
    no_comments: 'Brak komentarzy',
    error: 'Błąd',
    browse_section: 'Przeglądaj', community: 'Społeczność',
    admin_panel: 'Panel Admina', admin: 'Administracja',
  },
  en: {
    store: 'Store', library: 'Library', profile: 'Profile',
    settings: 'Settings', logout: 'Logout', play: 'Play',
    install: 'Install', download: 'Download', search: 'Search...',
    recent: 'Recently Played', featured: 'Featured',
    free: 'Free', rating: 'Rating', reviews: 'Reviews',
    comments: 'Comments', login: 'Sign In', register: 'Register',
    light: 'Light', dark: 'Dark', language: 'Language',
    browse: 'Browse Games', upload: 'Upload Your Game',
    newest: 'New Releases', top_rated: 'Top Rated',
    no_games: 'No games', no_results: 'No results',
    no_recent: 'No recently played games',
    welcome_title: 'Welcome to VexCenter',
    welcome_desc: 'Discover, play and share your games with the community. Anyone can be a creator.',
    see_all: 'See all',
    all: 'All', free_filter: 'Free', paid_filter: 'Paid', top_filter: 'Top Rated',
    back_to_store: 'Back to Store',
    write_review: 'Write a review...', submit: 'Submit',
    downloads_count: 'downloads', by: 'by',
    comment_placeholder: 'Write a comment...',
    no_reviews: 'No reviews yet. Be the first!',
    no_comments: 'No comments',
    error: 'Error',
    browse_section: 'Browse', community: 'Community',
    admin_panel: 'Admin Panel', admin: 'Administration',
  }
};

let currentLang = localStorage.getItem('vex_lang') || 'pl';
function __(key) { return LANG[currentLang][key] || key; }
function setLang(l) { currentLang = l; localStorage.setItem('vex_lang', l); document.dispatchEvent(new Event('langchange')); }

// Apply language to sidebar and header automatically on langchange
document.addEventListener('langchange', function() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = __(key);
  });
});