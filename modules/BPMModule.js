import { Module } from '../core/Module.js';

export class BPMModule extends Module {
  constructor(id) {
    super(id, 'BPM');
    this.bpm = 120;
    this.taps = [];
    this.audioCtx = null;
    this.analyser = null;
    this.beatPhase = 0;
    this.audioSync = false;
    this.lastBeatTime = 0;
  }

  async initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const src = this.audioCtx.createMediaStreamSource(stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        src.connect(this.analyser);
        this.audioSync = true;
        this.detectBeat();
        this.ui.querySelector('.audio-btn').textContent = 'SYNC ON';
      } catch(e) {
        console.warn('BPMModule: Mic access denied', e);
      }
    }
  }

  detectBeat() {
    if (!this.audioSync) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const bass = data.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
    const now = performance.now();
    if (bass > 200 && now - this.lastBeatTime > 200) {
      this.lastBeatTime = now;
      document.dispatchEvent(new CustomEvent('wazg:beat', { detail: { phase: 0 } }));
    }
    requestAnimationFrame(() => this.detectBeat());
  }

  tap() {
    const now = performance.now();
    this.taps.push(now);
    if (this.taps.length > 4) this.taps.shift();
    if (this.taps.length === 4) {
      const intervals = [];
      for (let i = 1; i < 4; i++) intervals.push(this.taps[i] - this.taps[i-1]);
      const avgMs = intervals.reduce((a, b) => a + b, 0) / 3;
      this.bpm = Math.round(60000 / avgMs);
      this.ui.querySelector('.bpm').value = this.bpm;
      document.dispatchEvent(new CustomEvent('wazg:bpm-change', { detail: { bpm: this.bpm } }));
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    }
  }

  async transform(frame) {
    const beatMs = 60000 / this.bpm;
    this.beatPhase = (performance.now() % beatMs) / beatMs;
    frame.bpm = this.bpm;
    frame.beatPhase = this.beatPhase;
    frame.audioSync = this.audioSync;
    return frame;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>BPM</label>
      <input type="number" class="bpm" value="120" min="40" max="300">
      <button class="tap-btn">TAP</button>
      <button class="audio-btn">AUDIO SYNC</button>
      <div class="beat-indicator" style="width:100%;height:4px;background:#300;">
        <div class="beat-led" style="width:10%;height:100%;background:#f00;transition:none;"></div>
      </div>
    `;
    body.querySelector('.bpm').onchange = e => {
      this.bpm = parseInt(e.target.value);
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.tap-btn').onclick = () => this.tap();
    body.querySelector('.audio-btn').onclick = () => this.initAudio();

    setInterval(() => {
      const led = body.querySelector('.beat-led');
      if (led) led.style.marginLeft = (this.beatPhase * 90) + '%';
    }, 16);
  }
}
