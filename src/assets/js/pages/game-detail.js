class GameDetailPage {
  async render(container, params) {
    const gameId = typeof params === 'object' ? params?.id : params;
    if (!gameId) { container.innerHTML = '<div class="empty-state"><h3>Nieprawidłowe ID gry</h3></div>'; return; }
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const d = await api.getGame(gameId);
      const g = d.game;
      if (!g) { container.innerHTML = '<div class="empty-state"><h3>Gra nie znaleziona</h3></div>'; return; }

      container.innerHTML = `
        <div class="page game-detail-page">
          <button class="btn btn-ghost btn-sm" id="back-to-store" style="margin-bottom:16px;">← Powrót do sklepu</button>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div style="flex:1;min-width:300px;">
              <div style="border-radius:12px;overflow:hidden;border:1px solid var(--glass-border);aspect-ratio:16/9;background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08));display:flex;align-items:center;justify-content:center;margin-bottom:16px;position:relative;">
                ${g.thumbnail ? `<img src="${img(g.thumbnail)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` : ''}
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M14 12h4"/><path d="M10 10v4"/></svg>
              </div>
              ${d.screenshots?.length ? `<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;">${d.screenshots.slice(0,6).map(s => `<div style="min-width:160px;aspect-ratio:16/9;border-radius:8px;overflow:hidden;border:1px solid var(--glass-border);flex-shrink:0;"><img src="${img(s.url)}" style="width:100%;height:100%;object-fit:cover;"/></div>`).join('')}</div>` : ''}
            </div>
            <div style="flex:1;min-width:280px;">
              <h1 style="font-size:24px;font-weight:800;margin-bottom:4px;">${g.title}</h1>
              <div style="display:flex;gap:12px;font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:16px;flex-wrap:wrap;">
                <span>${g.developer_name || 'Nieznany'}</span>
                ${g.category ? `<span>• ${g.category}</span>` : ''}
                ${g.rating ? `<span>• ⭐ ${g.rating.toFixed(1)}</span>` : ''}
                <span>• ${g.download_count || 0} pobrań</span>
              </div>
              <div style="font-size:28px;font-weight:800;color:var(--purple-400);margin-bottom:16px;">${g.price > 0 ? g.price.toFixed(2)+' zł' : '<span style="color:var(--green-400);">Darmowa</span>'}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
                ${d.is_installed ? `
                  <button class="btn btn-primary" id="btn-launch">▶ Uruchom</button>
                  <button class="btn btn-secondary" id="btn-set-path">📂 Zmień ścieżkę</button>
                ` : `
                  <button class="btn btn-primary" id="btn-install">📥 Pobierz i zainstaluj</button>
                `}
                ${api.isAuthenticated && !d.is_installed && g.price === 0 ? `<button class="btn btn-secondary" id="btn-add-to-library">+ Dodaj do biblioteki</button>` : ''}
              </div>
              ${g.tags?.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;">${g.tags.map(t => `<span style="font-size:11px;padding:3px 10px;border-radius:4px;background:rgba(124,58,237,0.1);color:var(--purple-300);border:1px solid rgba(124,58,237,0.1);">${t}</span>`).join('')}</div>` : ''}
              <p style="color:rgba(255,255,255,0.6);line-height:1.6;font-size:14px;">${g.description}</p>
            </div>
          </div>

          <div class="section" style="margin-top:24px;">
            <div class="section-header"><h2 data-i18n="stats">Statystyki</h2></div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <div style="flex:1;min-width:140px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--purple-400);">${g.download_count||0}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;" data-i18n="downloads">Pobrania</div>
                <div style="margin-top:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden;">
                  <div style="height:100%;width:${Math.min(100,(g.download_count||0)/50*100)}%;border-radius:2px;background:linear-gradient(90deg,#7c3aed,#a855f7);transition:width 0.5s;"></div>
                </div>
              </div>
              <div style="flex:1;min-width:140px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--green-400);">${g.play_count||0}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;" data-i18n="plays">Uruchomienia</div>
                <div style="margin-top:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden;">
                  <div style="height:100%;width:${Math.min(100,(g.play_count||0)/20*100)}%;border-radius:2px;background:linear-gradient(90deg,#10b981,#34d399);transition:width 0.5s;"></div>
                </div>
              </div>
              <div style="flex:1;min-width:140px;background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--yellow-400);">${g.rating ? '★ '+g.rating.toFixed(1) : '—'}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;" data-i18n="rating">Ocena</div>
                <div style="margin-top:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden;">
                  <div style="height:100%;width:${(g.rating||0)/5*100}%;border-radius:2px;background:linear-gradient(90deg,#f59e0b,#fbbf24);transition:width 0.5s;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="section" style="margin-top:24px;">
            <div class="section-header"><h2>Opinie (${d.reviews?.length||0})</h2></div>
            <div style="background:var(--glass-bg);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:12px;padding:16px;">
              ${api.isAuthenticated ? `
                <form id="review-form" style="display:flex;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--glass-border);">
                  <div style="flex:1;">
                    <div style="display:flex;gap:4px;margin-bottom:8px;" id="star-rating">
                      ${[1,2,3,4,5].map(s => `<span class="star" data-val="${s}" style="cursor:pointer;font-size:20px;color:rgba(255,255,255,0.1);">★</span>`).join('')}
                    </div>
                    <textarea id="review-content" rows="2" placeholder="Napisz opinię..." style="width:100%;padding:8px 12px;border:1px solid var(--glass-border);border-radius:6px;background:rgba(255,255,255,0.04);color:#fff;font-family:inherit;outline:none;"></textarea>
                  </div>
                  <button class="btn btn-primary" type="submit" style="align-self:flex-end;">Wyślij</button>
                </form>
              ` : ''}
              ${d.reviews?.length ? d.reviews.map(r => `
                <div class="review-item" data-review-id="${r.id}" style="padding:12px 0;border-bottom:1px solid var(--glass-border);">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <strong style="font-size:13px;cursor:pointer;" class="review-username" data-user-id="${r.user_id}">${r.username}</strong>
                    <span style="font-size:13px;color:var(--yellow-400);">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
                  </div>
                  ${r.content ? '<p style="font-size:13px;color:rgba(255,255,255,0.5);">'+r.content+'</p>' : ''}
                  <div class="review-comments" style="margin-top:8px;padding-left:16px;border-left:2px solid var(--glass-border);">
                    <div class="comment-list" style="font-size:12px;"></div>
                    ${api.isAuthenticated ? `
                      <button class="btn btn-ghost btn-sm toggle-comments" style="font-size:11px;padding:2px 8px;margin-top:4px;">Komentuj</button>
                      <div class="comment-form" style="display:none;margin-top:6px;display:flex;gap:6px;">
                        <input type="text" class="comment-input" placeholder="Napisz komentarz..." style="flex:1;padding:4px 8px;border:1px solid var(--glass-border);border-radius:4px;background:rgba(255,255,255,0.04);color:#fff;font-size:12px;font-family:var(--font);outline:none;">
                        <button class="btn btn-sm btn-primary submit-comment" style="padding:4px 10px;font-size:11px;">Wyślij</button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('') : '<p style="color:rgba(255,255,255,0.2);text-align:center;padding:20px;">Brak opinii. Bądź pierwszy!</p>'}
            </div>
          </div>
        </div>
      `;

      document.getElementById('back-to-store')?.addEventListener('click', () => router.navigate('store'));

      let selectedRating = 0;
      document.querySelectorAll('.star').forEach(s => s.addEventListener('click', () => {
        selectedRating = parseInt(s.dataset.val);
        document.querySelectorAll('.star').forEach(st => st.style.color = parseInt(st.dataset.val) <= selectedRating ? 'var(--yellow-400)' : 'rgba(255,255,255,0.1)');
      }));
      document.getElementById('review-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedRating) return showModal('Info', 'Wybierz ocenę!', 'info');
        await api.submitReview(gameId, { rating: selectedRating, content: document.getElementById('review-content').value });
        showModal('Sukces', 'Opinia dodana!', 'success');
        this.render(container, gameId);
      });

      async function loadComments(reviewId, commentListEl) {
        try {
          const data = await api.getReviewComments(reviewId);
          const comments = data.comments || [];
          if (comments.length === 0) { commentListEl.innerHTML = ''; return; }
          commentListEl.innerHTML = comments.map(c => `
            <div style="padding:4px 0;display:flex;gap:6px;align-items:flex-start;">
              <span style="font-weight:600;font-size:11px;cursor:pointer;" class="comment-username" data-user-id="${c.user_id}">${c.username}:</span>
              <span style="color:rgba(255,255,255,0.5);font-size:11px;">${c.content}</span>
            </div>
          `).join('');
        } catch { commentListEl.innerHTML = '<span style="color:#ef4444;font-size:11px;">Błąd</span>'; }
      }
      document.querySelectorAll('.toggle-comments').forEach(btn => {
        btn.addEventListener('click', function() {
          const form = this.parentElement.querySelector('.comment-form');
          const reviewItem = this.closest('.review-item');
          const reviewId = reviewItem.dataset.reviewId;
          const commentList = reviewItem.querySelector('.comment-list');
          if (form.style.display === 'none' || !form.style.display || form.style.display === '') {
            form.style.display = 'flex';
            loadComments(reviewId, commentList);
          } else {
            form.style.display = 'none';
          }
        });
      });
      document.querySelectorAll('.submit-comment').forEach(btn => {
        btn.addEventListener('click', async function() {
          const reviewItem = this.closest('.review-item');
          const reviewId = reviewItem.dataset.reviewId;
          const input = reviewItem.querySelector('.comment-input');
          const content = input.value.trim();
          if (!content) return;
          try {
            await api.addReviewComment(reviewId, content);
            input.value = '';
            const commentList = reviewItem.querySelector('.comment-list');
            loadComments(reviewId, commentList);
          } catch (e) { showModal('Błąd', e.message, 'error'); }
        });
      });
      document.querySelectorAll('.review-username, .comment-username').forEach(el => {
        el.addEventListener('click', function() {
          const uid = parseInt(this.dataset.userId);
          if (uid) router.navigate('user', { id: uid });
        });
      });

      document.getElementById('btn-install')?.addEventListener('click', () => this.downloadAndInstall(container, gameId, g));

      document.getElementById('btn-launch')?.addEventListener('click', async () => {
        const exe = d.installation?.executable_path;
        if (!exe) return showModal('Info', 'Brak ścieżki do pliku wykonywalnego.', 'info');
        addRecentPlay(gameId, g.title, g.thumbnail);
        showLaunchOverlay(g.title);
        const result = await window.VexCenter.game.launch(gameId, exe);
        hideLaunchOverlay();
        if (!result.success) showModal('Błąd', result.error, 'error');
      });

      document.getElementById('btn-set-path')?.addEventListener('click', async () => {
        const exe = await window.VexCenter.game.selectExecutable();
        if (exe.canceled) return;
        await api.registerInstall(gameId, d.installation?.install_path || null, exe.path);
        showModal('Sukces', 'Ścieżka zaktualizowana!', 'success');
        this.render(container, gameId);
      });

      document.getElementById('btn-add-to-library')?.addEventListener('click', async () => {
        try { await api.purchaseGame(gameId); showModal('Sukces', 'Dodano do biblioteki!', 'success'); } catch(e) { showModal('Błąd', e.message, 'error'); }
      });

    } catch { container.innerHTML = '<div class="empty-state"><h3>Błąd ładowania gry</h3></div>'; }
  }

  async downloadAndInstall(container, gameId, game) {
    if (!game.game_file) {
      showModal('Info', 'Brak linku do pobrania dla tej gry.', 'info');
      return;
    }
    if (!window.VexCenter?.game?.download || !window.VexCenter?.game?.extract) {
      showModal('Info', 'Funkcja dostępna tylko w aplikacji desktopowej.', 'info');
      return;
    }

    const installDir = await window.VexCenter.game.selectInstallPath();
    if (installDir.canceled) return;

    downloadManager.show(gameId, game.title);
    downloadManager.updateProgress(0, 'Pobieranie...');

    const progressCb = (p) => downloadManager.updateProgress(p, 'Pobieranie...');

    if (window.VexCenter.onDownloadProgress) {
      window.VexCenter.onDownloadProgress(progressCb);
    }

    const dlResult = await window.VexCenter.game.download(game.game_file, installDir.path);
    if (!dlResult.success) {
      downloadManager.fail(dlResult.error);
      return;
    }

    const downloadedFile = dlResult.path;
    const ext = downloadedFile.split('.').pop().toLowerCase();

    let extractedDir = installDir.path;

    if (['zip', 'rar', '7z'].includes(ext)) {
      downloadManager.updateProgress(0, 'Rozpakowywanie...');
      if (ext === 'zip') {
        const extractResult = await window.VexCenter.game.extract(downloadedFile, installDir.path);
        if (!extractResult.success) {
          downloadManager.fail('Błąd rozpakowywania: ' + extractResult.error);
          return;
        }
      } else {
        downloadManager.updateProgress(0, 'Rozpakuj ręcznie plik ' + downloadedFile);
        showModal('Info', 'Plik ' + ext.toUpperCase() + ' nie może być automatycznie rozpakowany.\nRozpakuj go ręcznie z: ' + downloadedFile, 'info');
      }
    }

    downloadManager.updateProgress(0, 'Wybierz plik wykonywalny...');
    const exeResult = await window.VexCenter.game.selectExecutable();
    if (exeResult.canceled) {
      downloadManager.updateProgress(0, 'Anulowano');
      return;
    }

    await api.registerInstall(gameId, installDir.path, exeResult.path);
    downloadManager.updateProgress(100, 'Zainstalowano!');
    downloadManager.onComplete = (id) => this.render(container, id);
    setTimeout(() => downloadManager.complete(), 800);
  }
}

const gameDetailPage = new GameDetailPage();
