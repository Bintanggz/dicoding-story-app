import { formatDate } from '../utils/helper';

class HomePageView {
  constructor() {
    this.container = null;
    this.onCardClickCallback = null;
    this.onSearchCallback = null;
    this.onTabChangeCallback = null;
    this.onFavoriteToggleCallback = null;
    this._modalKeyDownHandler = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <div class="page-container home-layout">
        <section class="stories-sidebar" aria-label="Daftar Cerita">
          <div class="sidebar-header" style="flex-direction: column; align-items: stretch; gap: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <h1 style="font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Dicoding Stories</h1>
              <a href="#/add-story" class="nav-btn nav-btn-primary" aria-label="Tambah cerita baru">
                <span>+ Tambah</span>
              </a>
            </div>
            
            <div class="sidebar-controls">
              <div class="search-wrapper">
                <label for="search-story" class="sr-only">Cari cerita</label>
                <input 
                  type="search" 
                  id="search-story" 
                  class="search-input" 
                  placeholder="Cari cerita..." 
                  aria-label="Cari cerita berdasarkan nama atau deskripsi"
                />
                <span class="search-icon-btn" aria-hidden="true">🔍</span>
              </div>

              <div class="filter-tabs" role="tablist" aria-label="Filter Cerita">
                <button id="tab-all" class="tab-btn active" role="tab" aria-selected="true" aria-controls="stories-list">Semua</button>
                <button id="tab-favorites" class="tab-btn" role="tab" aria-selected="false" aria-controls="stories-list">⭐ Favorit</button>
              </div>
            </div>
          </div>

          <div id="stories-list" role="feed" aria-busy="true" aria-label="Daftar cerita">
            ${this._getSkeletonHtml()}
          </div>
        </section>

        <section class="map-area" aria-label="Peta Lokasi Cerita">
          <div class="map-container-wrapper">
            <div id="map" role="application" aria-label="Peta interaktif lokasi cerita"></div>
          </div>
        </section>
      </div>
    `;

    this._setupControls();
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

  _setupControls() {
    const searchInput = this.container.querySelector('#search-story');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (this.onSearchCallback) {
          this.onSearchCallback(e.target.value.trim());
        }
      });
    }

    const tabAll = this.container.querySelector('#tab-all');
    const tabFav = this.container.querySelector('#tab-favorites');

    if (tabAll && tabFav) {
      tabAll.addEventListener('click', () => {
        tabAll.classList.add('active');
        tabAll.setAttribute('aria-selected', 'true');
        tabFav.classList.remove('active');
        tabFav.setAttribute('aria-selected', 'false');
        if (this.onTabChangeCallback) this.onTabChangeCallback('all');
      });

      tabFav.addEventListener('click', () => {
        tabFav.classList.add('active');
        tabFav.setAttribute('aria-selected', 'true');
        tabAll.classList.remove('active');
        tabAll.setAttribute('aria-selected', 'false');
        if (this.onTabChangeCallback) this.onTabChangeCallback('favorites');
      });
    }
  }

  showStories(stories, favoriteIds = new Set()) {
    const listContainer = this.container.querySelector('#stories-list');
    if (!listContainer) return;

    listContainer.setAttribute('aria-busy', 'false');

    if (stories.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>Tidak ada cerita ditemukan.</p>
        </div>
      `;
      return;
    }

    let html = '';
    stories.forEach((story) => {
      const isFav = favoriteIds.has(story.id);
      const hasLocation =
        story.lat !== null &&
        story.lat !== undefined &&
        story.lon !== null &&
        story.lon !== undefined;

      html += `
        <article 
          class="story-card" 
          id="story-${story.id}" 
          data-id="${story.id}" 
          tabindex="0"
          role="article" 
          aria-describedby="desc-${story.id}"
        >
          <button 
            class="fav-btn ${isFav ? 'active' : ''}" 
            data-id="${story.id}" 
            aria-label="${isFav ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}"
            title="${isFav ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}"
          >${isFav ? '❤️' : '🤍'}</button>

          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita dari ${this._escapeHtml(story.name)}" 
            class="story-card-image"
            loading="lazy"
          />
          <div class="story-card-body">
            <h2 class="story-card-user">${this._escapeHtml(story.name)}</h2>
            <p id="desc-${story.id}" class="story-card-desc">${this._escapeHtml(story.description)}</p>
            <div class="story-card-date">
              <time datetime="${story.createdAt}">${formatDate(story.createdAt)}</time>
              ${hasLocation ? '<span class="location-badge">📍 Lokasi tersedia</span>' : ''}
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
      <div class="empty-state error-state" role="alert">
        <div class="empty-state-icon">⚠️</div>
        <p>${this._escapeHtml(message)}</p>
        <button id="btn-retry" class="nav-btn nav-btn-secondary" style="margin-top: 1rem;">Coba Lagi</button>
      </div>
    `;
  }

  setOnRetry(callback) {
    const btn = this.container ? this.container.querySelector('#btn-retry') : null;
    if (btn) btn.addEventListener('click', callback);
  }

  _setupCardListeners() {
    const cards = this.container.querySelectorAll('.story-card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const favBtnEl = e.target.closest('.fav-btn');
        if (favBtnEl) {
          e.stopPropagation();
          if (this.onFavoriteToggleCallback) {
            this.onFavoriteToggleCallback(favBtnEl.dataset.id);
          }
          return;
        }
        const id = card.dataset.id;
        this.highlightCard(id);
        if (this.onCardClickCallback) this.onCardClickCallback(id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.fav-btn')) return;
          e.preventDefault();
          const id = card.dataset.id;
          this.highlightCard(id);
          if (this.onCardClickCallback) this.onCardClickCallback(id);
        }
      });
    });
  }

  highlightCard(id) {
    const active = this.container.querySelector('.story-card.active-card');
    if (active) active.classList.remove('active-card');

    const card = this.container.querySelector(`#story-${id}`);
    if (card) card.classList.add('active-card');
  }

  scrollToCard(id) {
    const card = this.container.querySelector(`#story-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.focus();
    }
  }

  showDetailModal(story, isFav, onFavToggle, onFocusMap) {
    const modal = document.getElementById('story-detail-modal');
    if (!modal) return;

    const img = modal.querySelector('#modal-img');
    const avatar = modal.querySelector('#modal-avatar');
    const author = modal.querySelector('#modal-author-name');
    const date = modal.querySelector('#modal-date');
    const desc = modal.querySelector('#modal-desc');
    const locContainer = modal.querySelector('#modal-location-container');
    const latSpan = modal.querySelector('#modal-lat');
    const lonSpan = modal.querySelector('#modal-lon');
    const mapBtn = modal.querySelector('#modal-btn-map');
    const favBtn = modal.querySelector('#modal-btn-fav');

    img.src = story.photoUrl;
    img.alt = `Foto cerita dari ${this._escapeHtml(story.name)}`;
    avatar.textContent = story.name.charAt(0).toUpperCase();
    author.textContent = story.name;
    date.textContent = formatDate(story.createdAt);
    date.setAttribute('datetime', story.createdAt);
    desc.textContent = story.description;

    const hasLocation =
      story.lat !== null &&
      story.lat !== undefined &&
      story.lon !== null &&
      story.lon !== undefined;

    if (hasLocation) {
      locContainer.style.display = 'flex';
      latSpan.textContent = parseFloat(story.lat).toFixed(6);
      lonSpan.textContent = parseFloat(story.lon).toFixed(6);

      const newMapBtn = mapBtn.cloneNode(true);
      mapBtn.replaceWith(newMapBtn);
      newMapBtn.addEventListener('click', () => {
        this.closeDetailModal();
        if (onFocusMap) onFocusMap(story.id);
      });
    } else {
      locContainer.style.display = 'none';
    }

    // Fix: declare newFavBtn BEFORE updateFavBtnState uses it
    const newFavBtn = favBtn.cloneNode(true);
    favBtn.replaceWith(newFavBtn);

    const updateFavBtnState = (active) => {
      if (active) {
        newFavBtn.classList.add('active');
        newFavBtn.innerHTML = '❤️ <span>Hapus Favorit</span>';
        newFavBtn.setAttribute('aria-label', 'Hapus dari favorit');
      } else {
        newFavBtn.classList.remove('active');
        newFavBtn.innerHTML = '🤍 <span>Favoritkan</span>';
        newFavBtn.setAttribute('aria-label', 'Tambahkan ke favorit');
      }
    };

    updateFavBtnState(isFav);

    newFavBtn.addEventListener('click', () => {
      const nowActive = newFavBtn.classList.contains('active');
      updateFavBtnState(!nowActive);
      if (onFavToggle) onFavToggle(story.id);
    });

    const closeBtn = modal.querySelector('#modal-close');
    const closeHandler = () => this.closeDetailModal();
    closeBtn.onclick = closeHandler;
    modal.onclick = (e) => {
      if (e.target === modal) closeHandler();
    };

    if (this._modalKeyDownHandler) {
      window.removeEventListener('keydown', this._modalKeyDownHandler);
    }
    this._modalKeyDownHandler = (e) => {
      if (e.key === 'Escape') closeHandler();
    };
    window.addEventListener('keydown', this._modalKeyDownHandler);

    modal.classList.add('show');
    closeBtn.focus();
  }

  closeDetailModal() {
    const modal = document.getElementById('story-detail-modal');
    if (!modal) return;
    modal.classList.remove('show');
    if (this._modalKeyDownHandler) {
      window.removeEventListener('keydown', this._modalKeyDownHandler);
      this._modalKeyDownHandler = null;
    }
  }

  setOnCardClick(callback) { this.onCardClickCallback = callback; }
  setOnSearch(callback) { this.onSearchCallback = callback; }
  setOnTabChange(callback) { this.onTabChangeCallback = callback; }
  setOnFavoriteToggle(callback) { this.onFavoriteToggleCallback = callback; }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  destroy() {
    this.closeDetailModal();
    this.container = null;
    this.onCardClickCallback = null;
    this.onSearchCallback = null;
    this.onTabChangeCallback = null;
    this.onFavoriteToggleCallback = null;
  }
}

export default HomePageView;
