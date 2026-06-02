import { Module } from '../core/Module.js';

export class StyleModule extends Module {
  constructor(id) {
    super(id, 'STYLE');
    this.style = window.style? Object.keys(window.style)[0] : "cyberpunk neon";
  }

  async transform(frame) {
    frame.style = this.style;
    return frame;
  }

  renderControls(body) {
    const styles = window.style? Object.keys(window.style) : ['cyberpunk neon','dark fantasy','charcoal sketch'];
    body.innerHTML = `
      <label>STYLE</label>
      <select class="style-select">${styles.map(s=>`<option>${s}</option>`).join('')}</select>
    `;
    body.querySelector('.style-select').onchange = e => {
      this.style = e.target.value;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }
}
