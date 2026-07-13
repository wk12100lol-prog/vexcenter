(function () {
  const box = document.createElement('div');
  box.id = 'diag-box';
  box.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99998;background:#1a1a2e;border:1px solid #7c3aed;border-radius:8px;padding:12px;font-size:11px;color:#fff;font-family:monospace;max-width:400px;max-height:300px;overflow:auto;';
  document.body.appendChild(box);

  function log(msg) {
    const line = document.createElement('div');
    line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  // hooks
  const origFetch = window.fetch;
  window.fetch = function (url, opts) {
    log('FETCH ' + (opts?.method || 'GET') + ' ' + url);
    return origFetch.apply(this, arguments).then(r => {
      log('FETCH OK ' + r.status);
      return r;
    }).catch(e => {
      log('FETCH ERR ' + e.message);
      throw e;
    });
  };

  // test button - manual navigation
  const testBtn = document.createElement('button');
  testBtn.textContent = 'TEST: navigate store';
  testBtn.style.cssText = 'position:fixed;bottom:40px;right:10px;z-index:99998;padding:6px 12px;font-size:11px;background:#7c3aed;color:#fff;border:none;border-radius:4px;cursor:pointer;';
  testBtn.addEventListener('click', () => {
    log('TEST: navigating to store...');
    try {
      if (typeof router !== 'undefined' && router.navigate) {
        router.navigate('store');
        log('TEST: navigate called');
      } else {
        log('TEST: router not found!');
      }
    } catch (e) {
      log('TEST ERROR: ' + e.message);
    }
  });
  document.body.appendChild(testBtn);

  document.addEventListener('DOMContentLoaded', () => {
    log('DOMContentLoaded fired');
    log('api.token=' + (api?.token ? 'exists' : 'null'));
    log('api.user=' + (api?.user ? 'exists' : 'null'));
    log('router=' + (typeof router));
    log('headerComponent=' + (typeof headerComponent));
    log('sidebarComponent=' + (typeof sidebarComponent));
    log('storePage=' + (typeof storePage));
    log('libraryPage=' + (typeof libraryPage));
    log('VexCenter=' + (window.VexCenter ? 'exists' : 'null'));
    log('VexCenter.api=' + (window.VexCenter?.api ? 'exists' : 'null'));

    // test API
    api.get('ping').then(d => {
      log('PING OK status=' + (d.status || d));
    }).catch(e => {
      log('PING ERR ' + e.message);
    });
  });

  window.addEventListener('error', e => log('GLOBAL_ERR ' + (e.error?.message || e.message)));
  window.addEventListener('unhandledrejection', e => log('UNHANDLED ' + (e.reason?.message || e.reason)));
})();
