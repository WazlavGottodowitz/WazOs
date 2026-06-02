import { Module } from '../core/Module.js';
import * as bridge from '../plugins/perchance-bridge.js';

export class SourceModule extends Module {
  constructor(id) {
    super(id, 'SOURCE');
    this.mode = 'blank';
    this.imageUrl = null;
    this.analysis = null;
  }

  async transform(frame) {
    frame.source = {
      mode: this.mode,
      imageUrl: this.imageUrl,
      refOverlay: this.imageUrl,
      analysis: this.analysis
    };
    return frame;
  }

  enableUpload() {
    if (!bridge.imageUpload) {
      console.warn("SourceModule: imageUpload plugin not found");
      return;
    }
    this.mode = 'upload';
    bridge.imageUpload.onUpload = async (url) => {
      this.imageUrl = url;
      this.ui.querySelector('.preview').src = url;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }

  renderControls(body) {
    body.innerHTML = `
      <label>SOURCE</label>
      <select class="mode-select">
        <option value="blank">BLANK</option>
        <option value="upload">UPLOAD</option>
        <option value="camera">CAMERA</option>
      </select>
      <button class="upload-btn">UPLOAD REF</button>
      <img class="preview" style="width:100%;height:60px;object-fit:cover;border:1px solid #333;">
    `;
    body.querySelector('.mode-select').onchange = e => {
      this.mode = e.target.value;
      if (this.mode === 'upload') this.enableUpload();
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.upload-btn').onclick = () => {
      if (bridge.imageUpload) bridge.imageUpload();
    };
  }
}
