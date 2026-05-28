// Import Styles
import '../styles/main.css';

// Import Router
import Router from '../routes/router';

// Import Auth Repository & Toast
import AuthRepository from '../data/auth-repository';
import Toast from '../utils/toast';

// Import Offline Sync Helper
import { syncOfflineStories } from '../utils/sync-helper';

// Import Pages (Views) and Presenters
import LoginView from '../pages/login-page';
import LoginPresenter from '../presenter/login-presenter';

import RegisterView from '../pages/register-page';
import RegisterPresenter from '../presenter/register-presenter';

import HomePageView from '../pages/home-page';
import HomePresenter from '../presenter/home-presenter';

import AddStoryPageView from '../pages/add-story-page';
import AddStoryPresenter from '../presenter/add-story-presenter';

// Define Route-Handler Mapping
const routes = {
  '#/login': { View: LoginView, Presenter: LoginPresenter },
  '#/register': { View: RegisterView, Presenter: RegisterPresenter },
  '#/home': { View: HomePageView, Presenter: HomePresenter },
  '#/add-story': { View: AddStoryPageView, Presenter: AddStoryPresenter },
};

// Initialize App Router
const router = new Router(routes, 'main-content');

// ── Push Notification Helpers ──────────────────────────────────────────────

const VAPID_PUBLIC_KEY =
  'BEl625uRD2ICgl71SGQAOCUNpWjhIPjo5gqa63KyRySyT33aNfDxjB_Jp5p2kGclXwd2oYt85C1b5F1965A20-0';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPush(reg, pushSwitch) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      Toast.error('Izin notifikasi ditolak.');
      pushSwitch.checked = false;
      return;
    }

    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    Toast.success('Berhasil berlangganan notifikasi push!');
    await reg.showNotification('Notifikasi Aktif! 🔔', {
      body: 'Terima kasih telah mengaktifkan notifikasi Dicoding Story App.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  } catch {
    Toast.error('Gagal berlangganan notifikasi push.');
    pushSwitch.checked = false;

    // Fallback: show local notification if permission already granted
    if (Notification.permission === 'granted') {
      reg.showNotification('Notifikasi Lokal Aktif 🔔', {
        body: 'Notifikasi push lokal aktif sebagai fallback.',
        icon: '/icon-192.png',
      });
    }
  }
}

async function unsubscribeFromPush(reg, pushSwitch) {
  try {
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
    Toast.success('Berhasil berhenti berlangganan notifikasi.');
  } catch {
    Toast.error('Gagal menonaktifkan notifikasi.');
    pushSwitch.checked = true;
  }
}

async function setupPushNotificationSwitch() {
  const pushSwitch = document.getElementById('push-switch');
  if (!pushSwitch) return;

  if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
    const container = document.querySelector('.push-toggle-container');
    if (container) container.style.display = 'none';
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    pushSwitch.checked = !!subscription;

    pushSwitch.onchange = async () => {
      if (pushSwitch.checked) {
        await subscribeToPush(reg, pushSwitch);
      } else {
        await unsubscribeFromPush(reg, pushSwitch);
      }
    };
  } catch {
    // Push API not available — hide the toggle
    const container = document.querySelector('.push-toggle-container');
    if (container) container.style.display = 'none';
  }
}

// ── PWA Install Prompt ─────────────────────────────────────────────────────

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('btn-install');
  if (installBtn) installBtn.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
  const installBtn = document.getElementById('btn-install');
  if (installBtn) installBtn.style.display = 'none';
  deferredPrompt = null;
  Toast.success('Aplikasi Dicoding Story berhasil diinstal!');
});

function setupInstallButton() {
  const installBtn = document.getElementById('btn-install');
  if (!installBtn) return;
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// ── Offline Banner ─────────────────────────────────────────────────────────

function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.style.display = navigator.onLine ? 'none' : 'flex';
  }
}

window.addEventListener('online', () => {
  updateOnlineStatus();
  syncOfflineStories();
});
window.addEventListener('offline', updateOnlineStatus);

// ── Global Navigation Handlers ─────────────────────────────────────────────

function setupGlobalHandlers() {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthRepository.clear();
      Toast.success('Anda berhasil keluar dari akun.');
      router.navigateTo('#/login');
    });
  }

  setupInstallButton();
  updateOnlineStatus();
  setupPushNotificationSwitch();

  if (navigator.onLine) {
    syncOfflineStories();
  }
}

setupGlobalHandlers();

// ── Service Worker Registration ────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {
        // SW registration failed — app continues without offline support
      });
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      Toast.success(event.data.message);
      window.dispatchEvent(new CustomEvent('stories-synced'));
    }
  });
}
