export class CameraTrace {
  constructor(canvas, imageUpload) {
    this.canvas = canvas;
    this.imageUpload = imageUpload;
  }

  enable() {
    if (!this.imageUpload) return;
    // HARDWARE AUGMENTATION: live trace
    this.imageUpload.onUpload = (url) => {
      this.canvas.style.backgroundImage = `url(${url})`;
      this.canvas.style.backgroundSize = 'contain';
      this.canvas.style.backgroundRepeat = 'no-repeat';
      this.canvas.style.backgroundPosition = 'center';
      this.canvas.style.opacity = '0.5';
    };
  }
}
