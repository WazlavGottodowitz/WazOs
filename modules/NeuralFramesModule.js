import { Module } from '../core/Module.js';

export class NeuralFramesModule extends Module {
  constructor(id) {
    super(id, 'NEURAL');
    this.mode = 'smooth_still';
    this.intensity = 0.5;
    this.speed = 1.0;
    this.centerX = 0.5; this.centerY = 0.5;
    this.rotation = 0;
    this.zoom = 1.0;
    this.phase = 0;
  }

  async transform(frame) {
    switch(this.mode) {
      case 'smooth_still':
        frame.seed = frame.seed + Math.sin(this.phase * 0.1) * this.intensity * 1000;
        frame.denoise = Math.max(0.3, 0.7 + Math.sin(this.phase * 0.05) * 0.2 * this.intensity);
        break;
      case 'trippy_zoom':
        this.zoom = 1.0 + Math.sin(this.phase * 0.02 * this.speed) * this.intensity;
        frame.camera = { zoom: this.zoom, centerX: this.centerX, centerY: this.centerY };
        frame.seed = frame.seed + Math.floor(this.phase * this.intensity);
        break;
      case 'infinite_rotation':
        this.rotation = (this.rotation + this.speed * this.intensity) % 360;
        const pulse = 1.0 + Math.sin(this.phase * 0.03) * 0.2 * this.intensity;
        frame.camera = { rotation: this.rotation, radius: 30 * pulse, orbit: true };
        break;
    }

    if (frame.bpm) {
      this.phase += (frame.bpm / 60) * 0.1 * this.speed;
    } else {
      this.phase += 0.1 * this.speed;
    }

    frame.neuralFx = { mode: this.mode, intensity: this.intensity, phase: this.phase };
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>MODE</label>
      <select class="mode">
        <option value="smooth_still">SMOOTH STILL</option>
        <option value="trippy_zoom">TRIPPY ZOOM</option>
        <option value="infinite_rotation">INFINITE ROTATION</option>
      </select>
      <label>INTENSITY</label>
      <input type="range" class="intensity" min="0" max="1" step="0.05" value="0.5">
      <label>SPEED</label>
      <input type="range" class="speed" min="0.1" max="5" step="0.1" value="1.0">
      <label>CENTER X</label>
      <input type="range" class="cx" min="0" max="1" step="0.01" value="0.5">
      <label>CENTER Y</label>
      <input type="range" class="cy" min="0" max="1" step="0.01" value="0.5">
    `;
    body.querySelector('.mode').onchange = e => {
      this.mode = e.target.value;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.intensity').oninput = e => {
      this.intensity = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.speed').oninput = e => {
      this.speed = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.cx').oninput = e => {
      this.centerX = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.cy').oninput = e => {
      this.centerY = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }
}
