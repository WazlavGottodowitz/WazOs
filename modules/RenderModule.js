import { Module } from '../core/Module.js';
import * as bridge from '../plugins/perchance-bridge.js';

export class RenderModule extends Module {
  constructor(id) {
    super(id, 'RENDER');
    this.resolution = "512x512";
    this.denoise = 0.7;
  }

  async transform(frame) {
    if (!bridge.generateImage) {
      console.warn("RenderModule: generateImage plugin not found");
      return frame;
    }
    if (!frame.agents || frame.agents.length === 0) return frame;

    const rigData = frame.agents[0].joints.map(j=>`${j.x.toFixed(0)},${j.y.toFixed(0)},${j.z.toFixed(0)}`).join('|');
    const cameraData = frame.camera? `cam_zoom:${frame.camera.zoom||1},cam_rot:${frame.camera.rotation||0}` : '';
    const vectorData = frame.vectorMorph? `vector:${frame.vectorMorph.paths[0]?.substring(0,50)}` : '';
    const textData = frame.textOverlay? `text:"${frame.textOverlay.text}"` : '';
    const prompt = `${frame.style}, 2.5d_rig:${rigData}, ${cameraData}, ${vectorData}, ${textData}, seed:${frame.seed}, denoise:${this.denoise}, blind_continuity:true, zero_frame_ref:true`;

    try {
      const url = await bridge.generateImage(prompt, { resolution: this.resolution, seed: frame.seed });
      frame.imageUrl = url;
      frame.prompt = prompt;
    } catch(e) {
      console.error("RenderModule error:", e);
    }
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>RES</label>
      <select class="res">
        <option value="512x512">512²</option>
        <option value="768x512">768x512</option>
        <option value="512x768">512x768</option>
      </select>
      <label>DENOISE</label>
      <input type="range" class="denoise" min="0.3" max="1" step="0.05" value="0.7">
    `;
    body.querySelector('.res').onchange = e => {
      this.resolution = e.target.value;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.denoise').oninput = e => {
      this.denoise = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }
}
