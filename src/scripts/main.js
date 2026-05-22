// Import Styles
import '../styles/main.css';

// Import Router
import Router from '../routes/router';

// Import Auth Repository & Toast
import AuthRepository from '../data/auth-repository';
import Toast from '../utils/toast';

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

// Setup Global Navigation Handlers
const setupGlobalHandlers = () => {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthRepository.clear();
      Toast.success('Anda berhasil keluar dari akun.');
      router.navigateTo('#/login');
    });
  }
};

setupGlobalHandlers();
