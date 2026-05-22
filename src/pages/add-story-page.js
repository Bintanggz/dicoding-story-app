import CameraHelper from '../utils/camera';
import Toast from '../utils/toast';

class AddStoryPageView {
  constructor() {
    this.container = null;
    this.onSubmitCallback = null;
    this.cameraHelper = null;
    this.selectedFile = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <section class="page-container add-story-container" aria-labelledby="add-story-title">
        <h1 id="add-story-title" class="font-sans" style="font-size: 1.75rem; font-weight: 800; text-align: center;">Tambah Cerita Baru</h1>
        <p class="font-sans" style="color: var(--text-secondary); text-align: center; font-size: 0.95rem; margin-top: 0.25rem;">
          Bagikan momen berharga Anda ke Dicoding Story
        </p>

        <form id="add-story-form" class="add-story-grid" novalidate>
          
          <!-- Left Panel: Media (File Upload & Camera) -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- File Drag & Drop Dropzone -->
            <div class="form-group">
              <span class="form-label">Foto Cerita</span>
              <div id="dropzone" class="upload-preview-container">
                <input 
                  type="file" 
                  id="photo-file" 
                  class="file-input" 
                  accept="image/*" 
                  aria-label="Pilih foto dari berkas"
                />
                <div id="upload-placeholder" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  <div class="upload-placeholder-icon">📸</div>
                  <div class="upload-placeholder-text">
                    Klik atau Seret foto ke sini untuk mengunggah
                  </div>
                </div>
                <img id="img-preview" class="image-preview" alt="Pratinjau foto cerita" />
              </div>
              <span id="photo-error" class="form-error-msg" role="alert" style="margin-top: 0.5rem;">Foto wajib dipilih</span>
            </div>

            <!-- Live Camera Feature -->
            <div class="camera-feature">
              <span class="form-label">Ambil Foto Langsung</span>
              <div class="camera-preview-container">
                <video id="camera-video" class="camera-video" autoplay playsinline muted></video>
                <div id="camera-placeholder" class="camera-placeholder">
                  Kamera tidak aktif. Klik "Buka Kamera" untuk mengambil foto langsung.
                </div>
              </div>
              <div class="camera-controls">
                <button type="button" id="btn-camera-start" class="camera-btn camera-btn-start">
                  📷 Buka Kamera
                </button>
                <button type="button" id="btn-camera-capture" class="camera-btn camera-btn-capture">
                  ⚡ Ambil Gambar
                </button>
                <button type="button" id="btn-camera-stop" class="camera-btn camera-btn-stop">
                  🛑 Tutup Kamera
                </button>
              </div>
            </div>

          </div>

          <!-- Right Panel: Info & Location -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Description -->
            <div class="form-group" id="description-group">
              <label for="description" class="form-label">Deskripsi Cerita</label>
              <textarea 
                id="description" 
                class="form-input" 
                rows="4" 
                placeholder="Tulis cerita seru Anda di sini..." 
                required
                aria-required="true"
                aria-describedby="description-error"
                style="resize: vertical; min-height: 100px;"
              ></textarea>
              <span id="description-error" class="form-error-msg" role="alert">Deskripsi tidak boleh kosong</span>
            </div>

            <!-- Location Picker Map -->
            <div class="map-selection-container">
              <label class="form-label" id="map-label">Lokasi Cerita (Opsional)</label>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                Klik pada peta di bawah ini untuk menandai lokasi momen Anda.
              </p>
              <div id="selection-map" class="small-map" aria-labelledby="map-label"></div>
              
              <div class="coordinates-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="latitude" class="form-label" style="font-size: 0.75rem;">Latitude</label>
                  <input type="text" id="latitude" class="form-input" readonly placeholder="Klik di peta" style="font-size: 0.85rem; padding: 0.6rem 0.75rem;" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="longitude" class="form-label" style="font-size: 0.75rem;">Longitude</label>
                  <input type="text" id="longitude" class="form-input" readonly placeholder="Klik di peta" style="font-size: 0.85rem; padding: 0.6rem 0.75rem;" />
                </div>
              </div>
            </div>

            <!-- Submit buttons -->
            <div style="display: flex; gap: 1rem; margin-top: auto; padding-top: 1rem;">
              <a href="#/home" class="nav-btn nav-btn-secondary" style="flex: 1; justify-content: center; padding: 0.85rem;">
                Batal
              </a>
              <button type="submit" id="btn-submit-story" class="form-btn" style="flex: 2;">
                Bagikan Cerita
              </button>
            </div>

          </div>

        </form>
      </section>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const form = this.container.querySelector('#add-story-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });

    const fileInput = this.container.querySelector('#photo-file');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this._setFile(e.target.files[0]);
      }
    });

    // Drag and Drop
    const dropzone = this.container.querySelector('#dropzone');
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files[0]) {
        this._setFile(files[0]);
      }
    });

    // Camera Handlers
    const video = this.container.querySelector('#camera-video');
    this.cameraHelper = new CameraHelper(video);

    const btnStart = this.container.querySelector('#btn-camera-start');
    const btnCapture = this.container.querySelector('#btn-camera-capture');
    const btnStop = this.container.querySelector('#btn-camera-stop');
    const cameraPlaceholder = this.container.querySelector('#camera-placeholder');

    btnStart.addEventListener('click', async () => {
      try {
        await this.cameraHelper.start();
        cameraPlaceholder.style.display = 'none';
        btnStart.style.display = 'none';
        btnCapture.style.display = 'block';
        btnStop.style.display = 'block';
      } catch (error) {
        Toast.error(error.message);
      }
    });

    btnStop.addEventListener('click', () => {
      this._stopCamera();
    });

    btnCapture.addEventListener('click', async () => {
      try {
        const { file, dataUrl } = await this.cameraHelper.capture();
        this._setFile(file, dataUrl);
        this._stopCamera();
        Toast.success('Foto berhasil diambil dari kamera!');
      } catch (error) {
        Toast.error(error.message);
      }
    });

    // Input Description validation
    const descriptionText = this.container.querySelector('#description');
    descriptionText.addEventListener('input', () => {
      const group = this.container.querySelector('#description-group');
      if (descriptionText.value.trim() !== '') {
        group.classList.remove('has-error');
        descriptionText.removeAttribute('aria-invalid');
      }
    });
  }

  _setFile(file, customDataUrl = null) {
    if (!file.type.startsWith('image/')) {
      Toast.error('Format file harus berupa gambar!');
      return;
    }

    this.selectedFile = file;
    this.container.querySelector('#photo-error').style.display = 'none';

    const imgPreview = this.container.querySelector('#img-preview');
    const uploadPlaceholder = this.container.querySelector('#upload-placeholder');

    if (customDataUrl) {
      imgPreview.src = customDataUrl;
      imgPreview.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  }

  _stopCamera() {
    if (this.cameraHelper) {
      this.cameraHelper.stop();
    }
    const btnStart = this.container.querySelector('#btn-camera-start');
    const btnCapture = this.container.querySelector('#btn-camera-capture');
    const btnStop = this.container.querySelector('#btn-camera-stop');
    const cameraPlaceholder = this.container.querySelector('#camera-placeholder');

    if (cameraPlaceholder) cameraPlaceholder.style.display = 'block';
    if (btnStart) btnStart.style.display = 'block';
    if (btnCapture) btnCapture.style.display = 'none';
    if (btnStop) btnStop.style.display = 'none';
  }

  updateLocationInputs(lat, lon) {
    const latInput = this.container.querySelector('#latitude');
    const lonInput = this.container.querySelector('#longitude');
    if (latInput && lonInput) {
      latInput.value = lat;
      lonInput.value = lon;
    }
  }

  _handleSubmit() {
    const descText = this.container.querySelector('#description');
    const latInput = this.container.querySelector('#latitude');
    const lonInput = this.container.querySelector('#longitude');
    
    let isValid = true;

    // Validate Desc
    if (!descText.value.trim()) {
      this.container.querySelector('#description-group').classList.add('has-error');
      descText.setAttribute('aria-invalid', 'true');
      isValid = false;
    }

    // Validate Image
    if (!this.selectedFile) {
      this.container.querySelector('#photo-error').style.display = 'block';
      isValid = false;
    }

    if (isValid && this.onSubmitCallback) {
      this.onSubmitCallback({
        description: descText.value.trim(),
        photoFile: this.selectedFile,
        lat: latInput.value || null,
        lon: lonInput.value || null
      });
    }
  }

  setOnSubmit(callback) {
    this.onSubmitCallback = callback;
  }

  showLoading(isLoading) {
    const btn = this.container.querySelector('#btn-submit-story');
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      btn.textContent = 'Mengirim...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Bagikan Cerita';
    }
  }

  destroy() {
    this._stopCamera();
    this.container = null;
    this.onSubmitCallback = null;
  }
}

export default AddStoryPageView;
