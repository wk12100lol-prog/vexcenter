class VexAPI {
  constructor() {
    this.baseURL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://vexcenter1.vercel.app/api';
    this.token = localStorage.getItem('vex_token') || null;
    this.user = null;
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('vex_token', token);
    else localStorage.removeItem('vex_token');
  }

  setUser(user) {
    this.user = user;
    if (user?.role) {
      document.querySelectorAll('[data-role]').forEach(el => {
        const roles = el.getAttribute('data-role').split(' ');
        el.style.display = roles.includes(user.role) ? '' : 'none';
      });
    }
  }

  get isAuthenticated() { return !!this.token; }
  get isAdmin() { return this.user?.role === 'admin'; }
  get isDeveloper() { return this.user?.role === 'developer' || this.user?.role === 'admin'; }

  async restoreSession() {
    if (!this.token) return false;
    try {
      const data = await this.getProfile();
      const u = data.user || data;
      if (u?.id) { this.setUser(u); return true; }
    } catch {}
    this.setToken(null);
    return false;
  }

  getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async request(method, endpoint, data = null) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const opts = { method: method.toUpperCase(), headers: this.getHeaders() };
        if (data && method !== 'get') opts.body = JSON.stringify(data);

        const res = await fetch(`${this.baseURL}/${endpoint}`, opts);

        if (!res.ok && res.status !== 400 && res.status !== 401 && res.status !== 403 && res.status !== 404 && res.status !== 409 && res.status !== 500) {
          if (attempt === 0 && (res.status === 0 || res.status >= 500)) continue;
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const text = await res.text();
        let raw;
        try { raw = JSON.parse(text); } catch { throw new Error('Invalid JSON: ' + text.substring(0, 100)); }
        if (raw.error) throw new Error(raw.error);
        return raw.data || raw;
      } catch (err) {
        if (attempt === 1) throw err;
      }
    }
  }

  get(e) { return this.request('get', e); }
  post(e, d) { return this.request('post', e, d); }
  put(e, d) { return this.request('put', e, d); }
  delete(e) { return this.request('delete', e); }

  login(email, password) { return this.post('auth/login', { email, password }); }
  register(username, email, password) { return this.post('auth/register', { username, email, password }); }
  getProfile() { return this.get('user/profile'); }
  getGames(p = {}) { return this.get('games?' + new URLSearchParams(p).toString()); }
  getGame(id) { return this.get(`games/${id}`); }
  uploadGame(fd) { return this.post('games', fd); }
  getDownloads(gameId) { return this.get(`games/${gameId}/downloads`); }
  addDownload(gameId, data) { return this.post(`games/${gameId}/downloads`, data); }
  registerInstall(gameId, path, exe) { return this.post(`games/${gameId}/install`, { install_path: path, executable_path: exe }); }
  getLibrary() { return this.get('user/library'); }
  purchaseGame(gameId) { return this.post('store/purchase', { game_id: gameId }); }
  submitReview(gameId, data) { return this.post(`games/${gameId}/reviews`, data); }
  getFriends() { return this.get('friends/list'); }
  addFriend(userId) { return this.post('friends/add', { friend_id: userId }); }
  acceptFriend(userId) { return this.post('friends/accept', { friend_id: userId }); }
  rejectFriend(userId) { return this.post('friends/reject', { friend_id: userId }); }
  removeFriend(userId) { return this.post('friends/remove', { friend_id: userId }); }
  getSettings() { return this.get('settings'); }
  updateSettings(data) { return this.put('settings', data); }
  applyDeveloper(data) { return this.post('developer/apply', data); }
  getDevStatus() { return this.get('developer/status'); }
  getNotifications() { return this.get('notifications'); }
  markNotificationsRead() { return this.put('notifications/read'); }
  getAdminStats() { return this.get('admin/stats'); }
  getPendingGames() { return this.get('admin/games'); }
  approveGame(id) { return this.put(`admin/games/${id}/approve`); }
  rejectGame(id, reason) { return this.put(`admin/games/${id}/reject`, { reason }); }
  getDevApplications() { return this.get('admin/developers'); }
  approveDev(id) { return this.put(`admin/developers/${id}/approve`); }
  rejectDev(id, note) { return this.put(`admin/developers/${id}/reject`, { note }); }
  getUsers() { return this.get('admin/users'); }
  getAnnouncements() { return this.get('announcements'); }
  createAnnouncement(data) { return this.post('announcements', data); }
  hideAnnouncement(id) { return this.delete(`announcements/${id}`); }
}

const api = new VexAPI();
