import AuthRepository from '../data/auth-repository';
import Toast from '../utils/toast';

class Router {
  constructor(routes, containerId = 'main-content') {
    this.routes = routes;
    this.container = document.getElementById(containerId);
    this.currentView = null;
    this.currentPresenter = null;

    // Listen to hash change and load
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  getCurrentRoute() {
    return window.location.hash || '#/home';
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  async handleRoute() {
    const hash = this.getCurrentRoute();
    const authenticated = AuthRepository.isAuthenticated();

    // 1. Guard check
    if (!authenticated) {
      if (hash !== '#/login' && hash !== '#/register') {
        this.navigateTo('#/login');
        return;
      }
    } else {
      if (hash === '#/login' || hash === '#/register' || hash === '#/') {
        this.navigateTo('#/home');
        return;
      }
    }

    // Find route handler
    const RouteClass = this.routes[hash];
    if (!RouteClass) {
      // Default fallback
      this.navigateTo('#/home');
      return;
    }

    // Update main navigation view (Header display)
    this.updateNavigation(authenticated);

    // 2. Perform transitions
    if (document.startViewTransition) {
      document.startViewTransition(() => this.renderRoute(RouteClass));
    } else {
      // Fallback
      this.container.classList.add('fade-out');
      setTimeout(() => {
        this.renderRoute(RouteClass);
        this.container.classList.remove('fade-out');
        this.container.classList.add('fade-in');
        setTimeout(() => this.container.classList.remove('fade-in'), 300);
      }, 150);
    }
  }

  updateNavigation(authenticated) {
    const header = document.querySelector('header.app-header');
    if (!header) return;

    if (authenticated) {
      header.style.display = 'block';
      const user = AuthRepository.getUser();
      const userNameEl = header.querySelector('.user-name');
      const avatarEl = header.querySelector('.avatar-placeholder');
      
      if (userNameEl && user) {
        userNameEl.textContent = user.name;
        userNameEl.title = user.name;
      }
      if (avatarEl && user) {
        avatarEl.textContent = user.name.charAt(0).toUpperCase();
      }

      // Sync active states of buttons if needed
      const addStoryBtn = header.querySelector('[href="#/add-story"]');
      const logoLink = header.querySelector('.logo-link');
      
      if (addStoryBtn) {
        if (window.location.hash === '#/add-story') {
          addStoryBtn.classList.add('nav-btn-primary');
          addStoryBtn.classList.remove('nav-btn-secondary');
        } else {
          addStoryBtn.classList.remove('nav-btn-primary');
          addStoryBtn.classList.add('nav-btn-secondary');
        }
      }
    } else {
      header.style.display = 'none';
    }
  }

  async renderRoute(RouteClass) {
    // Clean up previous view and presenter
    if (this.currentPresenter && typeof this.currentPresenter.destroy === 'function') {
      this.currentPresenter.destroy();
    }
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    this.container.innerHTML = '';

    // Create View and Presenter instance
    // Each route configuration should export an object like { View, Presenter }
    const view = new RouteClass.View();
    const presenter = new RouteClass.Presenter(view, this);

    this.currentView = view;
    this.currentPresenter = presenter;

    // Render new content
    view.render(this.container);
    
    // Initialize presenter
    await presenter.init();
    
    // Focus on the skip to content or the main heading for screen readers
    const mainHeading = this.container.querySelector('h1, h2');
    if (mainHeading) {
      mainHeading.setAttribute('tabindex', '-1');
      mainHeading.focus();
    }
  }
}

export default Router;
