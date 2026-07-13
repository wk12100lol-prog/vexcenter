class AuthPage {
  constructor() {
    this.isLogin = true;
  }

  render(container) {
    this.container = container;
    this.renderForm();
  }

  renderForm() {
    this.container.innerHTML = `
      <div class="page auth-page">
        <div class="auth-container">
          <div class="auth-box">
            <div class="accent-bar"></div>
            <div class="auth-logo-mark" style="position:relative;display:flex;justify-content:center;margin-bottom:20px;">
              <div class="hex-lg"></div>
              <div class="hex-lg-inner"></div>
            </div>
            <h2>${this.isLogin ? 'Witaj z powrotem' : 'Dołącz do VexCenter'}</h2>
            <p class="auth-subtitle">${this.isLogin ? 'Zaloguj się, aby kontynuować' : 'Stwórz konto i zacznij grać'}</p>
            <form id="auth-form">
              ${this.isLogin ? '' : `
                <div class="form-group">
                  <label for="auth-username">Nazwa użytkownika</label>
                  <input type="text" id="auth-username" placeholder="Twoja nazwa" required autocomplete="username" />
                </div>
              `}
              <div class="form-group">
                <label for="auth-email">Adres e-mail</label>
                <input type="email" id="auth-email" placeholder="twoj@email.pl" required autocomplete="email" />
              </div>
              <div class="form-group">
                <label for="auth-password">Hasło</label>
                <input type="password" id="auth-password" placeholder="••••••••" required minlength="6" autocomplete="${this.isLogin ? 'current-password' : 'new-password'}" />
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg">
                ${this.isLogin ? 'Zaloguj się' : 'Utwórz konto'}
              </button>
            </form>
            <div class="auth-links">
              ${this.isLogin
                ? `Nie masz konta? <a id="auth-toggle">Zarejestruj się</a>`
                : `Masz już konto? <a id="auth-toggle">Zaloguj się</a>`}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    document.getElementById('auth-toggle').addEventListener('click', () => {
      this.isLogin = !this.isLogin;
      this.renderForm();
    });
  }

  async handleSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username')?.value;

    const btn = document.querySelector('#auth-form .btn');
    btn.disabled = true;
    btn.textContent = 'Przetwarzanie...';

    try {
      let result;
      if (this.isLogin) {
        result = await api.login(email, password);
      } else {
        result = await api.register(username, email, password);
      }

      const data = result.data || result;
      if (data.token) {
        api.setToken(data.token);
        api.setUser(data.user);
        headerComponent.updateUser(data.user);
        router.navigate('store');
      }
    } catch (err) {
      alert(`Błąd: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = this.isLogin ? 'Zaloguj się' : 'Utwórz konto';
    }
  }
}

const authPage = new AuthPage();
