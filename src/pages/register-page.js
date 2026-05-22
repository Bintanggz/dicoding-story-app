class RegisterView {
  constructor() {
    this.container = null;
    this.onSubmitCallback = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <section class="page-container" aria-labelledby="register-title">
        <div class="form-container">
          <h1 id="register-title" class="form-title">Daftar Akun</h1>
          <p class="form-subtitle font-sans">Buat akun untuk bergabung dengan Dicoding Story</p>
          
          <form id="register-form" novalidate>
            <div class="form-group" id="name-group">
              <label for="name" class="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                class="form-input" 
                placeholder="Nama Anda" 
                required 
                autocomplete="name"
                aria-required="true"
                aria-describedby="name-error"
              />
              <span id="name-error" class="form-error-msg" role="alert">Nama tidak boleh kosong</span>
            </div>

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
                autocomplete="new-password"
                aria-required="true"
                aria-describedby="password-error"
              />
              <span id="password-error" class="form-error-msg" role="alert">Password minimal 8 karakter</span>
            </div>

            <button type="submit" id="btn-submit" class="form-btn">
              Daftar
            </button>
          </form>

          <div class="form-footer">
            Sudah punya akun? <a href="#/login">Masuk di sini</a>
          </div>
        </div>
      </section>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const form = this.container.querySelector('#register-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });

    const nameInput = this.container.querySelector('#name');
    const emailInput = this.container.querySelector('#email');
    const passwordInput = this.container.querySelector('#password');

    nameInput.addEventListener('input', () => this._validateName(nameInput));
    emailInput.addEventListener('input', () => this._validateEmail(emailInput));
    passwordInput.addEventListener('input', () => this._validatePassword(passwordInput));
  }

  _validateName(input) {
    const group = this.container.querySelector('#name-group');
    const isValid = input.value.trim() !== '';

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
    const nameInput = this.container.querySelector('#name');
    const emailInput = this.container.querySelector('#email');
    const passwordInput = this.container.querySelector('#password');

    const isNameValid = this._validateName(nameInput) && nameInput.value.trim() !== '';
    const isEmailValid = this._validateEmail(emailInput) && emailInput.value.trim() !== '';
    const isPasswordValid = this._validatePassword(passwordInput) && passwordInput.value !== '';

    if (!nameInput.value.trim()) {
      this.container.querySelector('#name-group').classList.add('has-error');
    }
    if (!emailInput.value.trim()) {
      this.container.querySelector('#email-group').classList.add('has-error');
    }
    if (!passwordInput.value) {
      this.container.querySelector('#password-group').classList.add('has-error');
    }

    if (isNameValid && isEmailValid && isPasswordValid) {
      if (this.onSubmitCallback) {
        this.onSubmitCallback({
          name: nameInput.value.trim(),
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
      btn.textContent = 'Mendaftar...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Daftar';
    }
  }

  destroy() {
    this.container = null;
    this.onSubmitCallback = null;
  }
}

export default RegisterView;
