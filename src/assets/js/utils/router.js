class VexRouter {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = document.getElementById('page-container');
    if (!this.container) console.warn('[Router] #page-container NOT FOUND!');
    else console.log('[Router] container found');
  }

  register(name, renderFn) {
    this.routes[name] = renderFn;
    console.log('[Router] registered', name);
  }

  navigate(name, params = null) {
    console.log('[Router] navigate to', name, 'current:', this.currentRoute);
    if (this.currentRoute === name && !params) return;
    const renderFn = this.routes[name];
    if (!renderFn) { console.error('[Router] route "'+name+'" not found'); return; }
    this.currentRoute = name;
    if (!this.container) { console.error('[Router] no container!'); return; }
    this.container.innerHTML = '';
    try {
      renderFn(this.container, params);
      console.log('[Router] renderFn called for', name);
    } catch (e) {
      console.error('[Router] renderFn error:', e);
    }
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      const route = item.getAttribute('data-route');
      item.classList.toggle('active', route === name);
    });
  }

  init(defaultRoute) {
    console.log('[Router] init, defaultRoute:', defaultRoute);
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        console.log('[Router] sidebar click', route);
        if (route) this.navigate(route);
      });
    });
    if (defaultRoute) this.navigate(defaultRoute);
  }
}

const router = new VexRouter();
