import ApiService from '../data/api-service';
import AuthRepository from '../data/auth-repository';
import MapHelper from '../utils/map';
import Toast from '../utils/toast';

class AddStoryPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
    this.mapHelper = new MapHelper();
  }

  async init() {
    // 1. Initialize selection map
    this.mapHelper.initSelectionMap('selection-map', null, null, ({ lat, lon }) => {
      this.view.updateLocationInputs(lat, lon);
    });

    // 2. Set submit listener
    this.view.setOnSubmit(async (formData) => {
      this.view.showLoading(true);
      
      const token = AuthRepository.getToken();
      if (!token) {
        this.router.navigateTo('#/login');
        return;
      }

      try {
        await ApiService.addStory(token, formData);
        Toast.success('Cerita Anda berhasil dibagikan!');
        this.router.navigateTo('#/home');
      } catch (error) {
        console.error(error);
        Toast.error(error.message || 'Gagal menambahkan cerita. Coba lagi nanti.');
      } finally {
        this.view.showLoading(false);
      }
    });
  }

  destroy() {
    this.mapHelper.destroy();
  }
}

export default AddStoryPresenter;
