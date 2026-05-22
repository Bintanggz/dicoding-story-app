import ApiService from '../data/api-service';
import AuthRepository from '../data/auth-repository';
import MapHelper from '../utils/map';
import Toast from '../utils/toast';

class HomePresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
    this.mapHelper = new MapHelper();
    this.stories = [];
  }

  async init() {
    await this.fetchStories();

    // Event Syncing: Card Click -> Focus Marker
    this.view.setOnCardClick((storyId) => {
      this.mapHelper.focusMarker(storyId);
    });
  }

  async fetchStories() {
    const token = AuthRepository.getToken();
    if (!token) {
      this.router.navigateTo('#/login');
      return;
    }

    try {
      const response = await ApiService.getStories(token, { location: 1 });
      this.stories = response.listStory || [];
      
      this.view.showStories(this.stories);

      // Render map with markers (location=1 matches only stories containing locations, but let's filter just in case)
      const storiesWithLocation = this.stories.filter(
        story => story.lat !== null && story.lon !== null
      );

      this.mapHelper.initHomeMap('map', storiesWithLocation, (storyId) => {
        // Marker Click Sync -> Highlight card and scroll to it
        this.view.highlightCard(storyId);
        this.view.scrollToCard(storyId);
      });
    } catch (error) {
      console.error(error);
      this.view.showError(error.message || 'Gagal memuat cerita. Periksa koneksi internet Anda.');
      this.view.setOnRetry(() => this.fetchStories());
      Toast.error('Gagal mengambil data cerita.');
    }
  }

  destroy() {
    this.mapHelper.destroy();
  }
}

export default HomePresenter;
