import { Module } from '../core/Module.js';

export class FXModule extends Module {
  constructor(id) {
    super(id, 'FX');
    this.bloom = 0;
    this.vignette = 0;
  }

  async transform(frame) {
    if (frame.imageUrl) {
      frame.fx = { bloom: this.bloom, vignette: this.vignette };
    }
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>BLOOM</label>
      <input type="range" class="bloom" min="0" max="1" step="0.1" value="0">
      <label>VIGNETTE</label>
      <input type="range" class="vignette" min="0" max="1" step="0.1" value="0">
    `;
    body.querySelector('.bloom').oninput = e => {
      this.bloom = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.vignette').oninput = e => {
      this.v
