import { formatDate } from '../utils/helper';

class HomePageView {
  constructor() {
    this.container = null;
    this.onCardClickCallback = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <div class="page-container home-layout">
        <!-- Sidebar containing stories list -->
        <section class="stories-sidebar" aria-label="Daftar Cerita">
          <div class="sidebar-header">
            <h1 class="font-sans" style="font-size: 1.5rem; font-weight: 800;">Dicoding Stories</h1>
            <a href="#/add-story" class="nav-btn nav-btn-primary" aria-label="Tambah cerita baru">
              <span>+ Tambah</span>
            </a>
          </div>
          <div id="stories-list" role="feed" aria-busy="true">
            <!-- Skeleton items initially -->
            ${this._getSkeletonHtml()}
          </div>
        </section>

        <!-- Map area -->
        <section class="map-area" aria-label="Peta Lokasi Cerita">
          <div class="map-container-wrapper">
            <div id="map" aria-label="Peta interaktif Leaflet"></div>
          </div>
        </section>
      </div>
    `;
  }

  _getSkeletonHtml() {
    let html = '';
    for (let i = 0; i < 4; i++) {
      html += `
        <div class="skeleton-card" aria-hidden="true">
          <div class="skeleton-img"></div>
          <div class="skeleton-text-wrapper">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
      `;
    }
    return html;
  }

  showStories(stories) {
    const listContainer = this.container.querySelector('#stories-list');
    if (!listContainer) return;
    
    listContainer.setAttribute('aria-busy', 'false');

    if (stories.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p class="font-sans">Belum ada cerita yang dibagikan.</p>
          <a href="#/add-story" class="nav-btn nav-btn-primary" style="margin-top: 1rem;">Buat Cerita Pertama</a>
        </div>
      `;
      return;
    }

    let html = '';
    stories.forEach(story => {
      const hasLocation = story.lat !== null && story.lon !== null;
      html += `
        <article 
          class="story-card" 
          id="story-${story.id}" 
          data-id="${story.id}" 
          tabindex="0"
          role="article" 
          aria-describedby="desc-${story.id}"
        >
          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita dari ${story.name}" 
            class="story-card-image"
            loading="lazy"
          />
          <div class="story-card-body">
            <h2 class="story-card-user">${this._escapeHtml(story.name)}</h2>
            <p id="desc-${story.id}" class="story-card-desc">${this._escapeHtml(story.description)}</p>
            <div class="story-card-date">
              <time datetime="${story.createdAt}">${formatDate(story.createdAt)}</time>
              ${hasLocation ? '<span style="float: right; color: var(--color-primary);">📍 Ada lokasi</span>' : ''}
            </div>
          </div>
        </article>
      `;
    });

    listContainer.innerHTML = html;
    this._setupCardListeners();
  }

  showError(message) {
    const listContainer = this.container.querySelector('#stories-list');
    if (!listContainer) return;

    listContainer.setAttribute('aria-busy', 'false');
    listContainer.innerHTML = `
      <div class="empty-state" style="border-color: var(--color-error);">
        <div class="empty-state-icon">⚠️</div>
        <p class="font-sans" style="color: var(--color-error);">${this._escapeHtml(message)}</p>
        <button id="btn-retry" class="nav-btn nav-btn-secondary" style="margin-top: 1rem;">Coba Lagi</button>
      </div>
    `;
  }

  setOnRetry(callback) {
    const btn = this.container.querySelector('#btn-retry');
    if (btn) {
      btn.addEventListener('click', callback);
    }
  }

  _setupCardListeners() {
    const cards = this.container.querySelectorAll('.story-card');
    cards.forEach(card => {
      // Mouse Click
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.highlightCard(id);
        if (this.onCardClickCallback) {
          this.onCardClickCallback(id);
        }
      });

      // Keyboard Accessible Enter/Space
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.dataset.id;
          this.highlightCard(id);
          if (this.onCardClickCallback) {
            this.onCardClickCallback(id);
          }
        }
      });
    });
  }

  highlightCard(id) {
    // Remove previous highlights
    const active = this.container.querySelector('.story-card.active-card');
    if (active) {
      active.classList.remove('active-card');
    }

    // Add highlight
    const card = this.container.querySelector(`#story-${id}`);
    if (card) {
      card.classList.add('active-card');
    }
  }

  scrollToCard(id) {
    const card = this.container.querySelector(`#story-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.focus();
    }
  }

  setOnCardClick(callback) {
    this.onCardClickCallback = callback;
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  destroy() {
    this.container = null;
    this.onCardClickCallback = null;
  }
}

export default HomePageView;
