import { Module } from '../core/Module.js';

export class TextModule extends Module {
  constructor(id) {
    super(id, 'TEXT');
    this.text = "WazOS";
    this.font = "Orbitron";
    this.size = 48;
    this.x = 0; this.y = 0;
    this.scaleX = 1; this.scaleY = 1;
    this.rotation = 0;
    this.skewX = 0; this.skewY = 0;
    this.lastTouchDist = 0;
    this.lastTouchAngle = 0;
  }

  getTransform() {
    return `translate(${this.x}px,${this.y}px) rotate(${this.rotation}deg) scale(${this.scaleX},${this.scaleY}) skew(${this.skewX}deg,${this.skewY}deg)`;
  }

  async transform(frame) {
    frame.textOverlay = {
      text: this.text,
      font: this.font,
      size: this.size,
      transform: this.getTransform()
    };
    return frame;
  }

  setupTouch(el) {
    el.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        this.lastTouchDist = this.getTouchDist(e.touches);
        this.lastTouchAngle = this.getTouchAngle(e.touches);
      }
    });
    el.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const dist = this.getTouchDist(e.touches);
        const angle = this.getTouchAngle(e.touches);
        const scale = dist / this.lastTouchDist;
        this.scaleX *= scale;
        this.scaleY *= scale;
        this.rotation += (angle - this.lastTouchAngle) * 180 / Math.PI;
        this.lastTouchDist = dist;
        this.lastTouchAngle = angle;
        this.updatePreview();
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      } else if (e.touches.length === 1) {
        const rect = el.getBoundingClientRect();
        this.x = e.touches[0].clientX - rect.left - rect.width/2;
        this.y = e.touches[0].clientY - rect.top - rect.height/2;
        this.updatePreview();
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      }
    });
  }

  getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  getTouchAngle(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx);
  }

  updatePreview() {
    if (this.ui) {
      const preview = this.ui.querySelector('.text-preview span');
      preview.style.transform = this.getTransform();
      preview.style.fontSize = this.size + 'px';
      preview.textContent = this.text;
    }
  }

  renderControls(body) {
    body.innerHTML = `
      <label>TEXT</label>
      <input type="text" class="text" value="WazOS">
      <label>SIZE</label>
      <input type="range" class="size" min="8" max="200" value="48">
      <label>ROTATE</label>
      <input type="range" class="rotate" min="0" max="360" value="0">
      <label>SKEW X</label>
      <input type="range" class="skewx" min="-45" max="45" value="0">
      <label>SCALE X</label>
      <input type="range" class="scalex" min="0.1" max="5" step="0.1" value="1">
      <div class="text-preview" style="width:100%;height:60px;border:1px solid #333;display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none;touch-action:none;">
        <span style="transform:${this.getTransform()};font-size:${this.size}px;">${this.text}</span>
      </div>
    `;
    const update = () => {
      this.text = body.querySelector('.text').value;
      this.size = parseInt(body.querySelector('.size').value);
      this.rotation = parseInt(body.querySelector('.rotate').value);
      this.skewX = parseInt(body.querySelector('.skewx').value);
      this.scaleX = parseFloat(body.querySelector('.scalex').value);
      this.scaleY = this.scaleX;
      this.updatePreview();
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelectorAll('input').forEach(inp => inp.oninput = update);
    this.setupTouch(body.querySelector('.text-preview'));
  }
}
