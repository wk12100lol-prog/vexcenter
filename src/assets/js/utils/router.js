class VexRouter {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.container = document.getElementById('page-container');
  }

  register(name, renderFn) {
    this.routes[name] = renderFn;
  }

  navigate(name, params = null) {
    if (this.currentRoute === name && !params) return;
    const renderFn = this.routes[name];
    if (!renderFn) { console.error('Route "'+name+'" not found'); return; }
    this.currentRoute = name;
    this.container.innerHTML = '';
    renderFn(this.container, params);
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      const route = item.getAttribute('data-route');
      item.classList.toggle('active', route === name);
    });
  }

  init(defaultRoute) {
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        if (route) this.navigate(route);
      });
    });
    if (defaultRoute) this.navigate(defaultRoute);
  }
}

const router = new VexRouter();
