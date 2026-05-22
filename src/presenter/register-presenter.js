import ApiService from '../data/api-service';
import Toast from '../utils/toast';

class RegisterPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
  }

  async init() {
    this.view.setOnSubmit(async (formData) => {
      this.view.showLoading(true);
      try {
        await ApiService.register(formData);
        Toast.success('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
        this.router.navigateTo('#/login');
      } catch (error) {
        Toast.error(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
      } finally {
        this.view.showLoading(false);
      }
    });
  }

  destroy() {
    // Perform cleanup if needed
  }
}

export default RegisterPresenter;
