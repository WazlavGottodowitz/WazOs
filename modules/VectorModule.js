import { Module } from '../core/Module.js';

export class VectorModule extends Module {
  constructor(id) {
    super(id, 'VECTOR');
    this.pathsA = [];
    this.pathsB = [];
    this.morphAmount = 0;
    this.svgInputA = null;
    this.svgInputB = null;
  }

  async parseSVG(file) {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const paths = [...doc.querySelectorAll('path')].map(p => p.getAttribute('d'));
    return paths.filter(d => d);
  }

  morphPaths(pathA, pathB, t) {
    const ptsA = this.pathToPoints(pathA);
    const ptsB = this.pathToPoints(pathB);
    const len = Math.max(ptsA.length, ptsB.length);
    const result = [];
    for (let i = 0; i < len; i++) {
      const a = ptsA[i % ptsA.length] || ptsA[0];
      const b = ptsB[i % ptsB.length] || ptsB[0];
      result.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      });
    }
    return this.pointsToPath(result);
  }

  pathToPoints(d) {
    const pts = [];
    const cmds = d.match(/[ML][^ML]*/g) || [];
    cmds.forEach(cmd => {
      const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
      for (let i = 0; i < coords.length; i += 2) {
        if (!isNaN(coords[i]) &&!isNaN(coords[i+1])) {
          pts.push({ x: coords[i], y: coords[i+1] });
        }
      }
    });
    return pts;
  }

  pointsToPath(pts) {
    if (pts.length === 0) return '';
    return 'M' + pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L');
  }

  async transform(frame) {
    if (frame.audioSync && frame.beatPhase!== undefined) {
      this.morphAmount = frame.beatPhase;
      if (this.ui) this.ui.querySelector('.morph').value = this.morphAmount;
    }

    if (this.pathsA.length && this.pathsB.length) {
      frame.vectorMorph = {
        paths: this.pathsA.map((p, i) =>
          this.morphPaths(p, this.pathsB[i % this.pathsB.length], this.morphAmount)
        ),
        amount: this.morphAmount
      };
    }
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>SVG A</label>
      <input type="file" class="svg-a" accept=".svg,.ai,.eps,.pdf">
      <label>SVG B</label>
      <input type="file" class="svg-b" accept=".svg,.ai,.eps,.pdf">
      <label>MORPH</label>
      <input type="range" class="morph" min="0" max="1" step="0.01" value="0">
      <div class="vector-preview" style="width:100%;height:60px;border:1px solid #333;">
        <svg width="100%" height="100%" viewBox="0 0 100 100"></svg>
      </div>
    `;
    body.querySelector('.svg-a').onchange = async e => {
      if (e.target.files[0]) {
        this.pathsA = await this.parseSVG(e.target.files[0]);
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      }
    };
    body.querySelector('.svg-b').onchange = async e => {
      if (e.target.files[0]) {
        this.pathsB = await this.parseSVG(e.target.files[0]);
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      }
    };
    body.querySelector('.morph').oninput = e => {
      this.morphAmount = parseFloat(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
  }
}
