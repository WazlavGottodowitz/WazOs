import { Module } from '../core/Module.js';

export class AudioModule extends Module {
  constructor(id) {
    super(id, 'AUDIO');
    this.audioCtx = null;
    this.analyser = null;
    this.audioBuffer = null;
    this.audioElement = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.keyframes = [];
    this.waveformData = [];
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.startTime = 0;
    this.pauseOffset = 0;

    this.bands = {
      lo: { min: 20, max: 250, threshold: 0.8 },
      mid: { min: 250, max: 4000, threshold: 0.7 },
      hi: { min: 4000, max: 20000, threshold: 0.6 }
    };

    this.sensitivity = {
      kick: 0.85,
      hat: 0.75,
      snare: 0.8
    };

    this.lastTrigger = { kick: 0, hat: 0, snare: 0 };
    this.energyHistory = { lo: [], mid: [], hi: [] };
    this.historySize = 43;
  }

  async transform(frame) {
    if (this.analyser && this.isPlaying) {
      const freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(freqData);

      const sampleRate = this.audioCtx.sampleRate;
      const nyquist = sampleRate / 2;
      const binSize = nyquist / freqData.length;

      const getBandEnergy = (minFreq, maxFreq) => {
        const startBin = Math.floor(minFreq / binSize);
        const endBin = Math.min(Math.floor(maxFreq / binSize), freqData.length);
        let sum = 0;
        for (let i = startBin; i < endBin; i++) sum += freqData[i];
        return sum / (endBin - startBin) / 255;
      };

      const loEnergy = getBandEnergy(this.bands.lo.min, this.bands.lo.max);
      const midEnergy = getBandEnergy(this.bands.mid.min, this.bands.mid.max);
      const hiEnergy = getBandEnergy(this.bands.hi.min, this.bands.hi.max);

      this.energyHistory.lo.push(loEnergy);
      this.energyHistory.mid.push(midEnergy);
      this.energyHistory.hi.push(hiEnergy);
      if (this.energyHistory.lo.length > this.historySize) {
        this.energyHistory.lo.shift();
        this.energyHistory.mid.shift();
        this.energyHistory.hi.shift();
      }

      const getAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const loAvg = getAvg(this.energyHistory.lo);
      const midAvg = getAvg(this.energyHistory.mid);
      const hiAvg = getAvg(this.energyHistory.hi);

      const now = performance.now();

      if (loEnergy > loAvg * 1.5 && loEnergy > this.sensitivity.kick && now - this.lastTrigger.kick > 100) {
        this.lastTrigger.kick = now;
        document.dispatchEvent(new CustomEvent('wazg:audio-trigger', {
          detail: { type: 'kick', energy: loEnergy, time: this.currentTime }
        }));
        frame.audioTrigger = { type: 'kick', energy: loEnergy };
      }

      if (hiEnergy > hiAvg * 1.3 && hiEnergy > this.sensitivity.hat && now - this.lastTrigger.hat > 50) {
        this.lastTrigger.hat = now;
        document.dispatchEvent(new CustomEvent('wazg:audio-trigger', {
          detail: { type: 'hat', energy: hiEnergy, time: this.currentTime }
        }));
        frame.audioTrigger = { type: 'hat', energy: hiEnergy };
      }

      if (midEnergy > midAvg * 1.4 && midEnergy > this.sensitivity.snare && now - this.lastTrigger.snare > 150) {
        this.lastTrigger.snare = now;
        document.dispatchEvent(new CustomEvent('wazg:audio-trigger', {
          detail: { type: 'snare', energy: midEnergy, time: this.currentTime }
        }));
        frame.audioTrigger = { type: 'snare', energy: midEnergy };
      }

      frame.audio = {
        time: this.currentTime,
        duration: this.duration,
        bands: { lo: loEnergy, mid: midEnergy, hi: hiEnergy },
        bandsAvg: { lo: loAvg, mid: midAvg, hi: hiAvg },
        keyframes: this.keyframes.filter(kf => Math.abs(kf.time - this.currentTime) < 0.05)
      };
    }

    return frame;
  }

  async loadAudio(file) {
    if (!this.audioCtx) {
      this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }

    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    this.duration = this.audioBuffer.duration;
    this.currentTime = 0;
    this.pauseOffset = 0;

    this.generateWaveform();
    this.detectKeyframes();

    if (!this.analyser) {
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
    }

    if (this.ui) {
      this.ui.querySelector('.time-scrub').max = this.duration;
      this.ui.querySelector('.duration-label').textContent = this.formatTime(this.duration);
    }

    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }

  generateWaveform() {
    if (!this.audioBuffer) return;
    const channelData = this.audioBuffer.getChannelData(0);
    const samples = 2000;
    const blockSize = Math.floor(channelData.length / samples);
    this.waveformData = [];

    for (let i = 0; i < samples; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < blockSize; j++) {
        const datum = channelData[i * blockSize + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      this.waveformData.push({ min, max });
    }
    this.drawWaveform();
  }

  detectKeyframes() {
    if (!this.audioBuffer) return;
    this.keyframes = [];
    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.05);
    const hopSize = Math.floor(windowSize / 2);

    let prevLoEnergy = 0;
    let prevHiEnergy = 0;

    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const time = i / sampleRate;

      let loEnergy = 0;
      let hiEnergy = 0;
      for (let j = 0; j < windowSize; j++) {
        const sample = channelData[i + j];
        loEnergy += Math.abs(sample);
        if (j % 4 === 0) {
          hiEnergy += Math.abs(sample - (channelData[i + j + 1] || 0));
        }
      }
      loEnergy /= windowSize;
      hiEnergy /= (windowSize / 4);

      const loDiff = loEnergy - prevLoEnergy;
      const hiDiff = hiEnergy - prevHiEnergy;

      if (loDiff > 0.15 && loEnergy > 0.25) {
        this.keyframes.push({ time, type: 'kick', band: 'lo', energy: loEnergy, confidence: loDiff });
      }

      if (hiDiff > 0.1 && hiEnergy > 0.15) {
        this.keyframes.push({ time, type: 'hat', band: 'hi', energy: hiEnergy, confidence: hiDiff });
      }

      prevLoEnergy = loEnergy * 0.8;
      prevHiEnergy = hiEnergy * 0.8;
    }

    this.keyframes = this.keyframes.filter((kf, idx, arr) => {
      if (idx === 0) return true;
      return kf.time - arr[idx - 1].time > 0.05 || kf.type!== arr[idx - 1].type;
    });

    this.drawWaveform();
  }

  drawWaveform() {
    if (!this.canvas ||!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.strokeStyle = '#0a0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.waveformData.forEach((sample, i) => {
      const x = (i / this.waveformData.length) * w;
      const y1 = (1 - (sample.max + 1) / 2) * h;
      const y2 = (1 - (sample.min + 1) / 2) * h;
      this.ctx.moveTo(x, y1);
      this.ctx.lineTo(x, y2);
    });
    this.ctx.stroke();

    this.keyframes.forEach(kf => {
      const x = (kf.time / this.duration) * w;
      if (kf.type === 'kick') {
        this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
        this.ctx.fillRect(x - 2, 0, 4, h);
      } else if (kf.type === 'hat') {
        this.ctx.fillStyle = 'rgba(255,255,0,0.5)';
        this.ctx.fillRect(x - 1, 0, 2, h * 0.5);
      } else if (kf.type === 'snare') {
        this.ctx.fillStyle = 'rgba(0,255,255,0.5)';
        this.ctx.fillRect(x - 1, h * 0.25, 2, h * 0.5);
      }
    });

    const x = (this.currentTime / this.duration) * w;
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, h);
    this.ctx.stroke();

    if (this.ui) {
      this.ui.querySelector('.time-label').textContent = this.formatTime(this.currentTime);
    }
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  play() {
    if (!this.audioBuffer || this.isPlaying) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    source.start(0, this.pauseOffset);
    this.audioElement = source;
    this.isPlaying = true;
    this.startTime = this.audioCtx.currentTime - this.pauseOffset;

    source.onended = () => {
      if (this.isPlaying) this.stop();
    };

    const updateTime = () => {
      if (!this.isPlaying) return;
      this.currentTime = this.audioCtx.currentTime - this.startTime;
      if (this.currentTime >= this.duration) {
        this.stop();
        return;
      }
      if (this.ui) {
        this.ui.querySelector('.time-scrub').value = this.currentTime;
      }
      this.drawWaveform();
      this.animationFrame = requestAnimationFrame(updateTime);
    };
    updateTime();

    if (this.ui) {
      this.ui.querySelector('.play-btn').textContent = 'PAUSE';
    }
  }

  pause() {
    if (!this.isPlaying) return;
    this.pauseOffset = this.currentTime;
    if (this.audioElement) {
      this.audioElement.stop();
      this.audioElement.disconnect();
      this.audioElement = null;
    }
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ui) {
      this.ui.querySelector('.play-btn').textContent = 'PLAY';
    }
  }

  stop() {
    this.pause();
    this.currentTime = 0;
    this.pauseOffset = 0;
    if (this.ui) {
      this.ui.querySelector('.time-scrub').value = 0;
    }
    this.drawWaveform();
  }

  addKeyframe(time, type) {
    this.keyframes.push({ time, type, band: type === 'kick'? 'lo' : type === 'hat'? 'hi' : 'mid', energy: 1.0, confidence: 1.0, manual: true });
    this.keyframes.sort((a, b) => a.time - b.time);
    this.drawWaveform();
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }

  removeKeyframe(time, type) {
    this.keyframes = this.keyframes.filter(kf =>!(Math.abs(kf.time - time) < 0.1 && kf.type === type));
    this.drawWaveform();
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }

  exportKeyframes() {
    const data = {
      version: "wazos-audio-keyframes-v1",
      duration: this.duration,
      keyframes: this.keyframes,
      bands: this.bands,
      sensitivity: this.sensitivity
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wazos-audio-keyframes.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async importKeyframes(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version === "wazos-audio-keyframes-v1") {
      this.keyframes = data.keyframes || [];
      this.bands = data.bands || this.bands;
      this.sensitivity = data.sensitivity || this.sensitivity;
      this.drawWaveform();
      this.updateUI();
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    }
  }

  updateUI() {
    if (!this.ui) return;
    this.ui.querySelector('.kick-sens').value = this.sensitivity.kick;
    this.ui.querySelector('.hat-sens').value = this.sensitivity.hat;
    this.ui.querySelector('.snare-sens').value = this.sensitivity.snare;
  }

  renderControls(body) {
    body.innerHTML = `
      <label>AUDIO</label>
      <input type="file" class="audio-file" accept="audio/*" style="grid-column:1/3;">
      <button class="play-btn">PLAY</button>
      <button class="stop-btn">STOP</button>
      <label class="time-label">0:00.00</label>
      <label class="duration-label">0:00.00</label>
      <input type="range" class="time-scrub" min="0" max="100" value="0" step="0.01" style="grid-column:1/3;">
      <canvas class="waveform" width="400" height="100" style="grid-column:1/3;border:1px solid #333;cursor:crosshair;background:#000;"></canvas>
      <label>KICK SENS</label>
      <input type="range" class="kick-sens" min="0" max="1" step="0.05" value="0.85">
      <label>HAT SENS</label>
      <input type="range" class="hat-sens" min="0" max="1" step="0.05" value="0.75">
      <label>SNARE SENS</label>
      <input type="range" class="snare-sens" min="0" max="1" step="0.05" value="0.8">
      <button class="add-kick">+ KICK KF</button>
      <button class="add-hat">+ HAT KF</button>
      <button class="add-snare">+ SNARE KF</button>
      <button class="export-kf">EXPORT KF</button>
      <input type="file" class="import-kf" accept=".json" style="display:none;">
      <button onclick="this.previousElementSibling.click()">IMPORT KF</button>
    `;

    this.canvas = body.querySelector('.waveform');
    this.ctx = this.canvas.getContext('2d');

    body.querySelector('.audio-file').onchange = e => {
      if (e.target.files[0]) this.loadAudio(e.target.files[0]);
    };
    body.querySelector('.play-btn').onclick = () => {
      if (this.isPlaying) this.pause();
      else this.play();
    };
    body.querySelector('.stop-btn').onclick = () => this.stop();
    body.querySelector('.time-scrub').oninput = e => {
      this.pauseOffset = parseFloat(e.target.value);
      this.currentTime = this.pauseOffset;
      this.drawWaveform();
    };
    body.querySelector('.kick-sens').oninput = e => {
      this.sensitivity.kick = parseFloat(e.target.value);
    };
    body.querySelector('.hat-sens').oninput = e => {
      this.sensitivity.hat = parseFloat(e.target.value);
    };
    body.querySelector('.snare-sens').oninput = e => {
      this.sensitivity.snare = parseFloat(e.target.value);
    };
    body.querySelector('.add-kick').onclick = () => this.addKeyframe(this.currentTime, 'kick');
    body.querySelector('.add-hat').onclick = () => this.addKeyframe(this.currentTime, 'hat');
    body.querySelector('.add-snare').onclick = () => this.addKeyframe(this.currentTime, 'snare');
    body.querySelector('.export-kf').onclick = () => this.exportKeyframes();
    body.querySelector('.import-kf').onchange = e => {
      if (e.target.files[0]) this.importKeyframes(e.target.files[0]);
    };

    this.canvas.onclick = e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / this.canvas.width) * this.duration;
      this.pauseOffset = time;
      this.currentTime = time;
      body.querySelector('.time-scrub').value = time;
      this.drawWaveform();
    };

    this.canvas.oncontextmenu = e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / this.canvas.width) * this.duration;
      const nearby = this.keyframes.find(kf => Math.abs(kf.time - time) < 0.1);
      if (nearby) this.removeKeyframe(nearby.time, nearby.type);
    };

    this.drawWaveform();
  }
          }
