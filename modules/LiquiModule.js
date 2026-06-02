import { Module } from '../core/Module.js';

export class LiquiModule extends Module {
  constructor(id) {
    super(id, 'LIQUI');
    this.flow = 0.5; // liquid flow amount
    this.turbulence = 0.3;
    this.viscosity = 0.7;
    this.scale = 2.0;
    this.speed = 1.0;
    this.time = 0;
    this.canvas = null;
    this.ctx = null;
  }

  // LIQUI EFFECT: WebGL-style displacement on rendered image
  async transform(frame) {
    if (!frame.imageUrl) return frame;

    // If no canvas yet, create it
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }

    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // LIQUI ALGORITHM: Perlin flow field distortion
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const copy = new Uint8ClampedArray(data);

        const t = this.time * 0.01 * this.speed;

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            // Simplified Perlin noise flow field
            const nx = x / img.width * this.scale;
            const ny = y / img.height * this.scale;
            const angle = this.noise(nx + t, ny) * Math.PI * 2 * this.turbulence;
            const dx = Math.cos(angle) * this.flow * 10;
            const dy = Math.sin(angle) * this.flow * 10;

            const sx = Math.min(img.width - 1, Math.max(0, Math.floor(x + dx)));
            const sy = Math.min(img.height - 1, Math.max(0, Math.floor(y + dy)));

            const srcIdx = (sy * img.width + sx) * 4;
            const dstIdx = (y * img.width + x) * 4;

            // Viscosity: blend with original
            const v = this.viscosity;
            data[dstIdx] = copy[srcIdx] * v + copy[dstIdx] * (1 - v);
            data[dstIdx + 1] = copy[srcIdx + 1] * v + copy[dstIdx + 1] * (1 - v);
            data[dstIdx + 2] = copy[srcIdx + 2] * v + copy[dstIdx + 2] * (1 - v);
            data[dstIdx + 3] = copy[srcIdx + 3];
          }
        }

        this.ctx.putImageData(imageData, 0, 0);
        frame.imageUrl = this.canvas.toDataURL();
        this.time++;

        // BPM sync: speed modulation
        if (frame.bpm) this.speed = frame.bpm / 120;

        resolve(frame);
      };
      img.src = frame.imageUrl;
    });
  }

  // Simplified noise function - replace with proper Perlin for production
  noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n));
  }

  renderControls(body) {
    body.innerHTML = `
      <label>FLOW</label>
      <input type="range" class="flow" min="0" max="1" step="0.05" value="0.5">
      <label>TURBULENCE</label>
      <input type="range" class="turbulence" min="0" max="1" step="0.05" value="0.3">
      <label>VISCOSITY</label>
      <input type="range" class="viscosity" min="0" max="1" step="0.05" value="0.7">
      <label>SCALE</label>
      <input type="range" class="scale" min="0.5" max="5" step="0.1" value="2.0">
      <label>SPEED</label>
      <input type="range" class="speed" min="0.1" max="3" step="0.1" value="1.0">
    `;
    ['flow','turbulence','viscosity','scale','speed'].forEach(param => {
      body.querySelector(`.${param}`).oninput = e => {
        this[param] = parseFloat(e.target.value);
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      };
    });
  }
}
