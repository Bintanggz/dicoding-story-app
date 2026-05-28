import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('favorites')) {
      db.createObjectStore('favorites', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('offline-sync')) {
      db.createObjectStore('offline-sync', { keyPath: 'id', autoIncrement: true });
    }
  },
});

class DbService {
  // Favorites methods
  static async addFavorite(story) {
    const db = await dbPromise;
    return db.put('favorites', story);
  }

  static async getFavorite(id) {
    const db = await dbPromise;
    return db.get('favorites', id);
  }

  static async getAllFavorites() {
    const db = await dbPromise;
    return db.getAll('favorites');
  }

  static async deleteFavorite(id) {
    const db = await dbPromise;
    return db.delete('favorites', id);
  }

  static async searchFavorites(query) {
    const favorites = await this.getAllFavorites();
    if (!query) return favorites;
    const lowerQuery = query.toLowerCase();
    return favorites.filter(
      (story) =>
        (story.name && story.name.toLowerCase().includes(lowerQuery)) ||
        (story.description && story.description.toLowerCase().includes(lowerQuery))
    );
  }

  // Offline Sync methods
  static async addPendingStory(storyData) {
    const db = await dbPromise;
    return db.add('offline-sync', storyData);
  }

  static async getAllPendingStories() {
    const db = await dbPromise;
    return db.getAll('offline-sync');
  }

  static async deletePendingStory(id) {
    const db = await dbPromise;
    return db.delete('offline-sync', id);
  }
}

export default DbService;
