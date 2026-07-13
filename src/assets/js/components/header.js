class HeaderComponent {
  constructor() {
    this.el = document.querySelector('vc-header');
  }

  render() {
    this.el.innerHTML = `
      <div class="header-inner">
        <div class="header-search">
          <span class="search-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          </span>
          <input type="text" placeholder="Szukaj gier, modów, twórców..." id="global-search" />
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="notif-btn" title="Powiadomienia">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="dot"></span>
          </button>
          <button class="icon-btn" id="chat-btn" title="Wiadomości">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          <div class="header-user" id="header-user-btn">
            <div class="avatar" id="header-avatar">V</div>
            <span class="username" id="header-username">Niezalogowany</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('global-search')?.addEventListener('input', (e) => {
      console.log('[Szukaj]', e.target.value);
    });

    document.getElementById('header-user-btn')?.addEventListener('click', () => {
      router.navigate('profile');
    });

    document.getElementById('chat-btn')?.addEventListener('click', () => {
      if (!api.isAuthenticated) { alert('Zaloguj się, aby czatować.'); return; }
      this.openChatPanel();
    });

    document.getElementById('notif-btn')?.addEventListener('click', async () => {
      if (!api.isAuthenticated) return;
      const n = await api.getNotifications().catch(() => ({ notifications: [] }));
      const list = n.notifications || [];
      const msg = list.length ? list.map(x => x.message).join('\n') : 'Brak powiadomień';
      alert(msg);
    });
  }

  updateUser(user) {
    const avatarEl = document.getElementById('header-avatar');
    const usernameEl = document.getElementById('header-username');
    if (!user) {
      avatarEl.textContent = 'V';
      avatarEl.innerHTML = 'V';
      usernameEl.textContent = 'Niezalogowany';
      return;
    }
    if (user.avatar) {
      avatarEl.innerHTML = '<img src="'+user.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
    } else {
      avatarEl.textContent = user.username ? user.username.charAt(0).toUpperCase() : 'V';
    }
    usernameEl.textContent = user.username || 'Nieznany';
  }

  openChatPanel() {
    const existing = document.getElementById('chat-panel');
    if (existing) { existing.remove(); return; }

    const panel = document.createElement('div');
    panel.id = 'chat-panel';
    panel.style.cssText = 'position:fixed;bottom:0;right:80px;width:360px;height:440px;z-index:9999;background:#1a1a2e;border:1px solid var(--glass-border);border-radius:12px 12px 0 0;display:flex;flex-direction:column;animation:slideUp 0.2s ease;overflow:hidden;';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--glass-border);">
        <strong>Wiadomości</strong>
        <button id="chat-close" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;">✕</button>
      </div>
      <div id="chat-conv-list" style="flex:1;overflow-y:auto;padding:8px;"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById('chat-close').addEventListener('click', () => {
      if (this.chatInterval) clearInterval(this.chatInterval);
      panel.remove();
    });

    this.loadConversations();
  }

  async loadConversations() {
    const list = document.getElementById('chat-conv-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:13px;">Ładowanie...</div>';

    try {
      const data = await api.getConversations();
      const convs = data.conversations || [];
      if (convs.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:13px;">Brak rozmów. Dodaj znajomego, aby rozpocząć.</div>';
        return;
      }
      list.innerHTML = convs.map(c => `
        <div class="chat-conv-item" data-id="${c.other_id}" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s;"
             onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;overflow:hidden;${c.other_avatar ? 'background:none;' : ''}">
            ${c.other_avatar ? '<img src="'+c.other_avatar+'" style="width:100%;height:100%;object-fit:cover;" />' : (c.other_name ? c.other_name.charAt(0).toUpperCase() : '?')}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;">${c.other_name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.last_message || ''}</div>
          </div>
          ${c.unread > 0 ? '<div style="background:#7c3aed;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">'+c.unread+'</div>' : ''}
        </div>
      `).join('');

      list.querySelectorAll('.chat-conv-item').forEach(el => {
        el.addEventListener('click', () => {
          const userId = el.getAttribute('data-id');
          this.openConversation(userId);
        });
      });
    } catch {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;font-size:13px;">Błąd ładowania rozmów</div>';
    }
  }

  async openConversation(otherId) {
    const panel = document.getElementById('chat-panel');
    if (!panel) return;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--glass-border);">
        <button id="chat-back" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:16px;">←</button>
        <span id="chat-other-name" style="font-size:14px;font-weight:600;">...</span>
        <button id="chat-close2" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;">✕</button>
      </div>
      <div id="chat-msgs" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;"></div>
      <div style="display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--glass-border);">
        <input type="text" id="chat-input" placeholder="Napisz wiadomość..." style="flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:8px;padding:8px 12px;color:#fff;font-size:13px;outline:none;" />
        <button id="chat-send" class="btn btn-primary btn-sm">Wyślij</button>
      </div>
    `;

    document.getElementById('chat-back').addEventListener('click', () => {
      if (this.chatInterval) clearInterval(this.chatInterval);
      panel.remove();
      headerComponent.openChatPanel();
    });
    document.getElementById('chat-close2').addEventListener('click', () => {
      if (this.chatInterval) clearInterval(this.chatInterval);
      panel.remove();
    });

    await this.loadMessages(otherId);
    this.chatInterval = setInterval(() => this.loadMessages(otherId, true), 3000);
  }

  async loadMessages(otherId, silent = false) {
    try {
      const data = await api.getMessages(otherId);
      const msgs = data.messages || [];
      const container = document.getElementById('chat-msgs');
      if (!container) return;

      const otherName = msgs.length > 0 ? (msgs[0].sender_id == otherId ? msgs[0].sender_name : msgs[0].receiver_name) : '...';
      const nameEl = document.getElementById('chat-other-name');
      if (nameEl) nameEl.textContent = otherName;

      if (!silent) {
        container.innerHTML = msgs.map(m => `
          <div style="display:flex;flex-direction:column;align-items:${m.is_mine ? 'flex-end' : 'flex-start'};">
            <div style="max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;background:${m.is_mine ? '#7c3aed' : 'rgba(255,255,255,0.08)'};">
              ${m.content}
            </div>
            <span style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:2px;">${m.created_at ? new Date(m.created_at).toLocaleTimeString() : ''}</span>
          </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
      }

      await api.markMessagesRead(otherId);
    } catch {}
  }
}

const headerComponent = new HeaderComponent();
