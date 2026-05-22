class Toast {
  static _getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      // Screen reader support
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  static show({ message, type = 'info', duration = 3000 }) {
    const container = this._getContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    // Select color icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div style="font-size: 1.2rem; display: flex; align-items: center;">${icon}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    const closeToast = () => {
      if (toast.classList.contains('hiding')) return;
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    };

    // Close button event
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', closeToast);

    // Auto close
    const timeoutId = setTimeout(closeToast, duration);

    // Clear timeout on manually closed
    closeBtn.addEventListener('click', () => clearTimeout(timeoutId));
  }

  static success(message, duration) {
    this.show({ message, type: 'success', duration });
  }

  static error(message, duration) {
    this.show({ message, type: 'error', duration });
  }

  static warning(message, duration) {
    this.show({ message, type: 'warning', duration });
  }

  static info(message, duration) {
    this.show({ message, type: 'info', duration });
  }
}

export default Toast;
