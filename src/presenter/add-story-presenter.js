import ApiService from '../data/api-service';
import AuthRepository from '../data/auth-repository';
import DbService from '../data/db-service';
import MapHelper from '../utils/map';
import Toast from '../utils/toast';

class AddStoryPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
    this.mapHelper = new MapHelper();
  }

  async init() {
    this.mapHelper.initSelectionMap(
      'selection-map',
      null,
      null,
      ({ lat, lon }) => {
        this.view.updateLocationInputs(lat, lon);
      }
    );

    this.view.setOnSubmit(async (formData) => {
      this.view.showLoading(true);

      const token = AuthRepository.getToken();
      if (!token) {
        this.router.navigateTo('#/login');
        return;
      }

      if (!navigator.onLine) {
        await this.saveStoryLocally(token, formData);
        return;
      }

      try {
        await ApiService.addStory(token, formData);
        Toast.success('Cerita Anda berhasil dibagikan!');
        this.router.navigateTo('#/home');
      } catch (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        const isNetworkError =
          msg.includes('network') ||
          msg.includes('fetch') ||
          msg.includes('failed') ||
          msg.includes('load');

        if (isNetworkError) {
          await this.saveStoryLocally(token, formData);
        } else {
          Toast.error(error.message || 'Gagal menambahkan cerita. Coba lagi nanti.');
          this.view.showLoading(false);
        }
      }
    });
  }

  async saveStoryLocally(token, formData) {
    try {
      await DbService.addPendingStory({
        token,
        description: formData.description,
        photoFile: formData.photoFile,
        lat: formData.lat,
        lon: formData.lon,
      });

      // Register Background Sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.sync.register('sync-new-stories');
        } catch {
          // Background sync not available — client-side sync will handle it
        }
      }

      Toast.warning(
        'Anda sedang offline. Cerita disimpan dan akan diunggah otomatis saat online kembali.'
      );
      this.router.navigateTo('#/home');
    } catch {
      Toast.error('Gagal menyimpan cerita secara lokal.');
    } finally {
      this.view.showLoading(false);
    }
  }

  destroy() {
    this.mapHelper.destroy();
  }
}

export default AddStoryPresenter;
