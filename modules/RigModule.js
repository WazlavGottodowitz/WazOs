import { Module } from '../core/Module.js';
import { Agent, AGENT_COUNT } from '../core/Agent.js';

export class RigModule extends Module {
  constructor(id) {
    super(id, 'RIG');
    this.agents = Array.from({length: AGENT_COUNT}, (_,i) => new Agent(i));
    this.activeAgent = 0;
  }

  async transform(frame) {
    frame.agents = this.agents.map(a => a.clone());
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>AGENT</label>
      <select class="agent-select"></select>
      <label>X</label><input type="range" class="x-slider" min="-200" max="200" value="0">
      <label>Y</label><input type="range" class="y-slider" min="-200" max="200" value="0">
      <label>Z</label><input type="range" class="z-slider" min="10" max="100" value="30">
    `;
    const sel = body.querySelector('.agent-select');
    for(let i=0;i<AGENT_COUNT;i++) sel.innerHTML += `<option value="${i}">${i.toString(16).toUpperCase()}</option>`;
    sel.onchange = e => this.activeAgent = parseInt(e.target.value);

    const updateJoint = (axis, val) => {
      this.agents[this.activeAgent].joints[0][axis] = parseFloat(val);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.x-slider').oninput = e => updateJoint('x', e.target.value);
    body.querySelector('.y-slider').oninput = e => updateJoint('y', e.target.value);
    body.querySelector('.z-slider').oninput = e => {
      this.agents[this.activeAgent].joints.forEach(j => j.z = parseFloat(e.target.value));
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }
}
