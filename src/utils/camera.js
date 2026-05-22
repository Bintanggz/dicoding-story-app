class CameraHelper {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera is not supported on this browser or device.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      this.videoElement.style.display = 'block';
      
      // Support iOS/Safari inline playback
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('autoplay', 'true');
      
      await this.videoElement.play();
      return true;
    } catch (error) {
      console.error('Error opening camera:', error);
      let errorMsg = 'Could not access camera.';
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Permission to access camera was denied.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No camera hardware found on this device.';
      }
      throw new Error(errorMsg);
    }
  }

  capture() {
    if (!this.stream || !this.videoElement) {
      throw new Error('Camera stream is not active.');
    }

    const canvas = document.createElement('canvas');
    const width = this.videoElement.videoWidth;
    const height = this.videoElement.videoHeight;
    
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Mirror image for front camera feel
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.videoElement, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          resolve({ file, dataUrl: canvas.toDataURL('image/jpeg') });
        } else {
          reject(new Error('Failed to capture image from canvas.'));
        }
      }, 'image/jpeg', 0.85);
    });
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.style.display = 'none';
    }
  }
}

export default CameraHelper;
