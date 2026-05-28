import DbService from '../data/db-service';
import ApiService from '../data/api-service';
import Toast from './toast';

export async function syncOfflineStories() {
  if (!navigator.onLine) return;

  let pendingStories;
  try {
    pendingStories = await DbService.getAllPendingStories();
  } catch {
    return;
  }

  if (pendingStories.length === 0) return;

  Toast.info(`Menyinkronkan ${pendingStories.length} cerita offline...`);

  let syncedCount = 0;

  for (const story of pendingStories) {
    try {
      await ApiService.addStory(story.token, {
        description: story.description,
        photoFile: story.photoFile,
        lat: story.lat,
        lon: story.lon,
      });
      await DbService.deletePendingStory(story.id);
      syncedCount++;
    } catch {
      // Story failed to sync — will retry on next online event
    }
  }

  if (syncedCount > 0) {
    Toast.success(`${syncedCount} cerita offline berhasil diunggah!`);
    window.dispatchEvent(new CustomEvent('stories-synced'));
  }
}
