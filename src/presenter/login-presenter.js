import ApiService from '../data/api-service';
import AuthRepository from '../data/auth-repository';
import Toast from '../utils/toast';

class LoginPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
  }

  async init() {
    this.view.setOnSubmit(async (formData) => {
      this.view.showLoading(true);
      try {
        const result = await ApiService.login(formData);
        
        // Save auth details
        AuthRepository.saveToken(result.loginResult.token);
        AuthRepository.saveUser({
          name: result.loginResult.name,
          userId: result.loginResult.userId,
        });

        Toast.success(`Selamat datang kembali, ${result.loginResult.name}!`);
        
        // Redirect to Home
        this.router.navigateTo('#/home');
      } catch (error) {
        Toast.error(error.message || 'Login gagal. Cek kembali email dan password Anda.');
      } finally {
        this.view.showLoading(false);
      }
    });
  }

  destroy() {
    // Perform cleanup if needed
  }
}

export default LoginPresenter;
