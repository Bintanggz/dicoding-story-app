import ApiService from '../data/api-service';
import AuthRepository from '../data/auth-repository';
import DbService from '../data/db-service';
import MapHelper from '../utils/map';
import Toast from '../utils/toast';

class HomePresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
    this.mapHelper = new MapHelper();

    this.stories = [];
    this.favoriteStories = [];
    this.favoriteIdsSet = new Set();

    this.activeTab = 'all';
    this.searchQuery = '';

    this._onSyncComplete = () => {
      this.fetchStories();
    };
  }

  async init() {
    await this.loadFavorites();
    await this.fetchStories();

    this.view.setOnCardClick((storyId) => {
      this.mapHelper.focusMarker(storyId);
      const story =
        this.stories.find((s) => s.id === storyId) ||
        this.favoriteStories.find((s) => s.id === storyId);
      if (story) {
        this.showStoryDetail(story);
      }
    });

    this.view.setOnSearch((query) => {
      this.searchQuery = query;
      this.applyFilters();
    });

    this.view.setOnTabChange((tab) => {
      this.activeTab = tab;
      this.applyFilters();
    });

    this.view.setOnFavoriteToggle(async (storyId) => {
      await this.toggleFavorite(storyId);
    });

    window.addEventListener('stories-synced', this._onSyncComplete);
  }

  async loadFavorites() {
    try {
      this.favoriteStories = await DbService.getAllFavorites();
      this.favoriteIdsSet = new Set(this.favoriteStories.map((s) => s.id));
    } catch {
      // IndexedDB unavailable — continue without favorites
    }
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
      this.applyFilters();
    } catch (error) {
      if (!navigator.onLine) {
        Toast.warning('Koneksi offline. Menampilkan data lokal.');
      } else {
        Toast.error('Gagal mengambil data cerita.');
      }
      this.view.showError(
        error.message || 'Gagal memuat cerita. Silakan coba lagi.'
      );
      this.view.setOnRetry(() => this.fetchStories());
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered =
      this.activeTab === 'all' ? this.stories : this.favoriteStories;

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (story) =>
          (story.name && story.name.toLowerCase().includes(q)) ||
          (story.description && story.description.toLowerCase().includes(q))
      );
    }

    this.view.showStories(filtered, this.favoriteIdsSet);

    const storiesWithLocation = filtered.filter(
      (story) =>
        story.lat !== null &&
        story.lat !== undefined &&
        story.lon !== null &&
        story.lon !== undefined
    );

    this.mapHelper.initHomeMap('map', storiesWithLocation, (storyId) => {
      this.view.highlightCard(storyId);
      this.view.scrollToCard(storyId);
      const story =
        this.stories.find((s) => s.id === storyId) ||
        this.favoriteStories.find((s) => s.id === storyId);
      if (story) {
        this.showStoryDetail(story);
      }
    });
  }

  async toggleFavorite(storyId) {
    if (this.favoriteIdsSet.has(storyId)) {
      try {
        await DbService.deleteFavorite(storyId);
        this.favoriteIdsSet.delete(storyId);
        this.favoriteStories = this.favoriteStories.filter(
          (s) => s.id !== storyId
        );
        Toast.success('Dihapus dari daftar favorit');
        this.applyFilters();
      } catch {
        Toast.error('Gagal menghapus dari favorit.');
      }
    } else {
      const story =
        this.stories.find((s) => s.id === storyId) ||
        this.favoriteStories.find((s) => s.id === storyId);
      if (!story) return;

      try {
        await DbService.addFavorite(story);
        this.favoriteIdsSet.add(storyId);
        this.favoriteStories.push(story);
        Toast.success('Ditambahkan ke daftar favorit');
        this.applyFilters();
      } catch {
        Toast.error('Gagal menambahkan ke favorit.');
      }
    }
  }

  showStoryDetail(story) {
    const isFav = this.favoriteIdsSet.has(story.id);
    this.view.showDetailModal(
      story,
      isFav,
      async (id) => {
        await this.toggleFavorite(id);
      },
      (id) => {
        this.mapHelper.focusMarker(id);
      }
    );
  }

  destroy() {
    window.removeEventListener('stories-synced', this._onSyncComplete);
    this.mapHelper.destroy();
    this.view.destroy();
  }
}

export default HomePresenter;
