module.exports = {
  app: {
    name: 'VexCenter',
    version: '1.0.0',
    description: 'Platforma dystrybucji gier cyfrowych',
  },
  api: {
    baseURL: 'https://vexcenter.infinityfreeapp.com/api',
    timeout: 10000,
  },
  auth: {
    tokenKey: 'vexcenter_token',
    refreshTokenKey: 'vexcenter_refresh',
  },
  store: {
    currency: 'PLN',
    currencySymbol: 'zł',
    defaultPageSize: 24,
  },
  upload: {
    maxGameSize: 2 * 1024 * 1024 * 1024,
    allowedTypes: ['.zip', '.rar', '.7z', '.exe', '.msi'],
    maxScreenshots: 10,
  },
};
