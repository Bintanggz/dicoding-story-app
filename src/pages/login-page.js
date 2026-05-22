class LoginView {
  constructor() {
    this.container = null;
    this.onSubmitCallback = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <section class="page-container" aria-labelledby="login-title">
        <div class="form-container">
          <h1 id="login-title" class="form-title">Dicoding Story</h1>
          <p class="form-subtitle font-sans">Masuk untuk melihat dan berbagi cerita menarik</p>
          
          <form id="login-form" novalidate>
            <div class="form-group" id="email-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input" 
                placeholder="nama@email.com" 
                required 
                autocomplete="email"
                aria-required="true"
                aria-describedby="email-error"
              />
              <span id="email-error" class="form-error-msg" role="alert">Format email tidak valid</span>
            </div>

            <div class="form-group" id="password-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                class="form-input" 
                placeholder="Min. 8 karakter" 
                required 
                autocomplete="current-password"
                aria-required="true"
                aria-describedby="password-error"
              />
              <span id="password-error" class="form-error-msg" role="alert">Password minimal 8 karakter</span>
            </div>

            <button type="submit" id="btn-submit" class="form-btn">
              Masuk
            </button>
          </form>

          <div class="form-footer">
            Belum punya akun? <a href="#/register">Daftar sekarang</a>
          </div>
        </div>
      </section>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const form = this.container.querySelector('#login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });

    // Realtime validation feedback on input blur/input
    const emailInput = this.container.querySelector('#email');
    const passwordInput = this.container.querySelector('#password');

    emailInput.addEventListener('input', () => this._validateEmail(emailInput));
    passwordInput.addEventListener('input', () => this._validatePassword(passwordInput));
  }

  _validateEmail(input) {
    const group = this.container.querySelector('#email-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value.trim());

    if (!isValid && input.value.trim() !== '') {
      group.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      return false;
    } else {
      group.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      return true;
    }
  }

  _validatePassword(input) {
    const group = this.container.querySelector('#password-group');
    const isValid = input.value.length >= 8;

    if (!isValid && input.value !== '') {
      group.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      return false;
    } else {
      group.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      return true;
    }
  }

  _handleSubmit() {
    const emailInput = this.container.querySelector('#email');
    const passwordInput = this.container.querySelector('#password');

    const isEmailValid = this._validateEmail(emailInput) && emailInput.value.trim() !== '';
    const isPasswordValid = this._validatePassword(passwordInput) && passwordInput.value !== '';

    if (!emailInput.value.trim()) {
      this.container.querySelector('#email-group').classList.add('has-error');
    }
    if (!passwordInput.value) {
      this.container.querySelector('#password-group').classList.add('has-error');
    }

    if (isEmailValid && isPasswordValid) {
      if (this.onSubmitCallback) {
        this.onSubmitCallback({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        });
      }
    }
  }

  setOnSubmit(callback) {
    this.onSubmitCallback = callback;
  }

  showLoading(isLoading) {
    const btn = this.container.querySelector('#btn-submit');
    if (!btn) return;
    
    if (isLoading) {
      btn.disabled = true;
      btn.textContent = 'Memproses...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  }

  destroy() {
    this.container = null;
    this.onSubmitCallback = null;
  }
}

export default LoginView;
