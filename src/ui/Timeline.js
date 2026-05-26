export class Timeline {
  constructor(parent, state) {
    this.parent = parent;
    this.state = state;
  }

  attach() {
    this.render();
    document.addEventListener('wazg:tab', e => {
      this.parent.innerHTML = '';
      if (e.detail === 'rig') this.renderRigTab();
      if (e.detail === 'seq') this.renderSeqTab();
      if (e.detail === 'gen') this.renderGenTab();
    });
    this.renderRigTab(); // default
  }

  renderRigTab() {
    this.parent.innerHTML = `
      <div class="card"><label>AGENT 0-F</label><select id="agentSelect"></select></div>
      <div class="card"><label>STYLE</label><select id="styleSelect"></select></div>
      <div class="card"><label>POSE</label><select id="poseSelect"></select></div>
      <div class="card"><button class="btn" id="keyframeBtn">+ KEYFRAME</button></div>
    `;
    const agentSel = this.parent.querySelector('#agentSelect');
    for (let i = 0; i < 16; i++) {
      agentSel.innerHTML += `<option value="${i}">AGENT ${i.toString(16).toUpperCase()}</option>`;
    }
    agentSel.onchange = e => this.state.activeAgent = parseInt(e.target.value);
    this.parent.querySelector('#styleSelect').innerHTML = Object.keys(this.state.styles).map(s => `<option>${s}</option>`).join('');
    this.parent.querySelector('#poseSelect').innerHTML = Object.keys(this.state.poses).map(p => `<option>${p}</option>`).join('');
    this.parent.querySelector('#keyframeBtn').onclick = () => {
      const style = this.parent.querySelector('#styleSelect').value;
      const pose = this.parent.querySelector('#poseSelect').value;
      this.state.captureKeyframe(style, pose);
    };
  }

  renderSeqTab() {
    this.parent.innerHTML = `
      <div class="card" style="grid-column:1/-1;"><label>TIMELINE</label><div id="timeline"></div></div>
      <div class="card"><label>FRAMES</label><input type="number" id="framesInput" value="24"></div>
      <div class="card"><label>ANCHOR SEED</label><input type="number" id="anchorSeed"></div>
      <div class="card"><button class="btn" id="anchorBtn">SET ANCHOR</button></div>
    `;
  }

  renderGenTab() {
    this.parent.innerHTML = `
      <div class="card"><label>BATCH</label><input type="number" id="batchInput" value="1"></div>
      <div class="card"><label>DENOISE</label><input type="range" id="denoise" min="0.3" max="1" step="0.05" value="0.7"></div>
      <div class="card"><button class="btn btn-gen" id="renderBtn">RENDER SEQUENCE</button></div>
      <div class="card" style="grid-column:1/-1;"><label>OUTPUT</label><div id="output"></div></div>
    `;
  }
}
