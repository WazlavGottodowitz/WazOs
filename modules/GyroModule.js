import { Module } from '../core/Module.js';

export class GyroModule extends Module {
  constructor(id) {
    super(id, 'GYRO');
    this.enabled = false;
    this.calibrated = false;
    this.zeroOffset = { alpha: 0, beta: 0, gamma: 0 };
    this.accelZero = { x: 0, y: 0, z: 0 };

    this.orientation = { alpha: 0, beta: 0, gamma: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.rotationRate = { alpha: 0, beta: 0, gamma: 0 };

    this.mod = {
      roll: 0,
      tilt: 0,
      pan: 0,
      shake: 0,
      spin: 0,
      modWheel: 0
    };

    this.recording = false;
    this.recordedMotion = [];
    this.playbackTime = 0;
    this.playbackActive = false;

    this.wheelValue = 0.5;
    this.wheelVelocity = 0;
    this.wheelDragging = false;
    this.wheelCanvas = null;
    this.wheelCtx = null;
    this.lastWheelX = 0;

    this.smoothing = 0.7;
    this.smoothMod = { roll: 0, tilt: 0, pan: 0, shake: 0, spin: 0 };

    this.bands = {
      lo: { min: 20, max: 250 },
      mid: { min: 250, max: 4000 },
      hi: { min: 4000, max: 20000 }
    };

    this.lastTrigger = { kick: 0, hat: 0, snare: 0 };
    this.energyHistory = { lo: [], mid: [], hi: [] };
    this.historySize = 43;
  }

  async transform(frame) {
    if (this.enabled || this.playbackActive) {
      this.smoothMod.roll = this.smoothMod.roll * this.smoothing + this.mod.roll * (1 - this.smoothing);
      this.smoothMod.tilt = this.smoothMod.tilt * this.smoothing + this.mod.tilt * (1 - this.smoothing);
      this.smoothMod.pan = this.smoothMod.pan * this.smoothing + this.mod.pan * (1 - this.smoothing);
      this.smoothMod.shake = this.smoothMod.shake * this.smoothing + this.mod.shake * (1 - this.smoothing);
      this.smoothMod.spin = this.smoothMod.spin * this.smoothing + this.mod.spin * (1 - this.smoothing);

      if (!this.wheelDragging) {
        this.wheelVelocity *= 0.95;
        this.wheelValue += this.wheelVelocity;
        this.wheelValue = Math.max(0, Math.min(1, this.wheelValue));
        if (Math.abs(this.wheelVelocity) < 0.001) this.wheelVelocity = 0;
      }

      frame.gyro = {
        enabled: true,
        roll: this.smoothMod.roll,
        tilt: this.smoothMod.tilt,
        pan: this.smoothMod.pan,
        shake: this.smoothMod.shake,
        spin: this.smoothMod.spin,
        modWheel: this.wheelValue,
        raw: {
          orientation: this.orientation,
          acceleration: this.acceleration,
          rotationRate: this.rotationRate
        }
      };

      if (!frame.camera) frame.camera = {};
      frame.camera.gyroRoll = this.smoothMod.roll * 45;
      frame.camera.gyroTilt = this.smoothMod.tilt * 30;
      frame.camera.gyroPan = this.smoothMod.pan * 180;

      if (this.recording) {
        this.recordedMotion.push({
          time: performance.now(),
          mod: {
            roll: this.smoothMod.roll,
            tilt: this.smoothMod.tilt,
            pan: this.smoothMod.pan,
            shake: this.smoothMod.shake,
            spin: this.smoothMod.spin,
            modWheel: this.wheelValue
          }
        });
      }

      if (this.playbackActive && this.recordedMotion.length > 0) {
        this.playbackTime += 16.67;
        const frameData = this.getRecordedFrame(this.playbackTime);
        if (frameData) {
          this.mod.roll = frameData.mod.roll;
          this.mod.tilt = frameData.mod.tilt;
          this.mod.pan = frameData.mod.pan;
          this.mod.shake = frameData.mod.shake;
          this.mod.spin = frameData.mod.spin;
          this.wheelValue = frameData.mod.modWheel;
        } else {
          this.playbackActive = false;
          this.playbackTime = 0;
          if (this.ui) {
            this.ui.querySelector('.play-rec-btn').textContent = 'PLAY REC';
          }
        }
      }
    }

    return frame;
  }

  getRecordedFrame(time) {
    if (this.recordedMotion.length === 0) return null;
    const startTime = this.recordedMotion[0].time;
    const targetTime = startTime + time;

    for (let i = 0; i < this.recordedMotion.length - 1; i++) {
      const curr = this.recordedMotion[i];
      const next = this.recordedMotion[i + 1];
      if (targetTime >= curr.time && targetTime <= next.time) {
        const t = (targetTime - curr.time) / (next.time - curr.time);
        return {
          mod: {
            roll: curr.mod.roll + (next.mod.roll - curr.mod.roll) * t,
            tilt: curr.mod.tilt + (next.mod.tilt - curr.mod.tilt) * t,
            pan: curr.mod.pan + (next.mod.pan - curr.mod.pan) * t,
            shake: curr.mod.shake + (next.mod.shake - curr.mod.shake) * t,
            spin: curr.mod.spin + (next.mod.spin - curr.mod.spin) * t,
            modWheel: curr.mod.modWheel + (next.mod.modWheel - curr.mod.modWheel) * t
          }
        };
      }
    }
    return null;
  }

  enableSensors() {
    if (typeof DeviceOrientationEvent!== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
      .then(response => {
          if (response === 'granted') {
            this.startListening();
          } else {
            console.warn('GyroModule: Device orientation permission denied');
          }
        })
      .catch(err => {
          console.error('GyroModule: Permission error', err);
        });
    } else {
      this.startListening();
    }
  }

  startListening() {
    window.addEventListener('deviceorientation', e => this.onOrientation(e));
    window.addEventListener('devicemotion', e => this.onMotion(e));
    this.enabled = true;
    this.calibrate();
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    if (this.ui) {
      this.ui.querySelector('.enable-btn').textContent = 'ACTIVE';
      this.ui.querySelector('.enable-btn').disabled = true;
      this.ui.querySelector('.calibrate-btn').disabled = false;
      this.ui.querySelector('.record-btn').disabled = false;
    }
  }

  onOrientation(e) {
    if (!this.enabled) return;
    this.orientation = {
      alpha: e.alpha || 0,
      beta: e.beta || 0,
      gamma: e.gamma || 0
    };

    const alpha = this.orientation.alpha - this.zeroOffset.alpha;
    const beta = this.orientation.beta - this.zeroOffset.beta;
    const gamma = this.orientation.gamma - this.zeroOffset.gamma;

    this.mod.pan = Math.max(-1, Math.min(1, alpha / 180));
    this.mod.tilt = Math.max(-1, Math.min(1, beta / 90));
    this.mod.roll = Math.max(-1, Math.min(1, gamma / 90));

    this.updateDisplay();
  }

  onMotion(e) {
    if (!this.enabled) return;
    if (e.acceleration) {
      this.acceleration = {
        x: e.acceleration.x || 0,
        y: e.acceleration.y || 0,
        z: e.acceleration.z || 0
      };

      const mag = Math.sqrt(
        Math.pow(this.acceleration.x - this.accelZero.x, 2) +
        Math.pow(this.acceleration.y - this.accelZero.y, 2) +
        Math.pow(this.acceleration.z - this.accelZero.z, 2)
      );
      this.mod.shake = Math.min(1, mag / 20);
    }

    if (e.rotationRate) {
      this.rotationRate = {
        alpha: e.rotationRate.alpha || 0,
        beta: e.rotationRate.beta || 0,
        gamma: e.rotationRate.gamma || 0
      };

      const spinMag = Math.sqrt(
        Math.pow(this.rotationRate.alpha, 2) +
        Math.pow(this.rotationRate.beta, 2) +
        Math.pow(this.rotationRate.gamma, 2)
      );
      this.mod.spin = Math.min(1, spinMag / 360);
    }

    this.updateDisplay();
  }

  calibrate() {
    this.zeroOffset = {...this.orientation };
    this.accelZero = {...this.acceleration };
    this.calibrated = true;
    if (this.ui) {
      const btn = this.ui.querySelector('.calibrate-btn');
      const originalText = btn.textContent;
      btn.textContent = 'CALIBRATED';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1000);
    }
  }

  startRecording() {
    this.recordedMotion = [];
    this.recording = true;
    this.playbackActive = false;
    if (this.ui) {
      const btn = this.ui.querySelector('.record-btn');
      btn.textContent = 'RECORDING...';
      btn.style.background = '#600';
      btn.style.color = '#fff';
    }
  }

  stopRecording() {
    this.recording = false;
    if (this.ui) {
      const btn = this.ui.querySelector('.record-btn');
      btn.textContent = 'RECORD';
      btn.style.background = '#000';
      btn.style.color = '#0f0';
    }
  }

  playRecording() {
    if (this.recordedMotion.length === 0) return;
    this.playbackTime = 0;
    this.playbackActive = true;
    this.recording = false;
    if (this.ui) {
      this.ui.querySelector('.play-rec-btn').textContent = 'PLAYING...';
      this.ui.querySelector('.record-btn').textContent = 'RECORD';
      this.ui.querySelector('.record-btn').style.background = '#000';
      this.ui.querySelector('.record-btn').style.color = '#0f0';
    }
  }

  clearRecording() {
    this.recordedMotion = [];
    this.playbackActive = false;
    this.playbackTime = 0;
    if (this.ui) {
      this.ui.querySelector('.play-rec-btn').textContent = 'PLAY REC';
    }
  }

  drawModWheel() {
    if (!this.wheelCanvas ||!this.wheelCtx) return;
    const ctx = this.wheelCtx;
    const w = this.wheelCanvas.width;
    const h = this.wheelCanvas.height;
    const centerY = h / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, centerY);
    ctx.lineTo(w - 10, centerY);
    ctx.stroke();

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = 10 + (w - 20) * (i / 20);
      const tickH = i % 5 === 0? 10 : 5;
      ctx.beginPath();
      ctx.moveTo(x, centerY - tickH);
      ctx.lineTo(x, centerY + tickH);
      ctx.stroke();

      if (i % 5 === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((i * 5).toString(), x, centerY + 20);
      }
    }

    const posX = 10 + (w - 20) * this.wheelValue;
    ctx.fillStyle = '#ff0';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(posX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText((this.wheelValue * 100).toFixed(0) + '%', posX, centerY - 15);
  }

  setupWheelInteraction() {
    if (!this.wheelCanvas) return;

    const getWheelValue = (clientX) => {
      const rect = this.wheelCanvas.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(1, (x - 10) / (rect.width - 20)));
    };

    const startDrag = (clientX) => {
      this.wheelDragging = true;
      this.lastWheelX = clientX;
      this.wheelValue = getWheelValue(clientX);
      this.wheelVelocity = 0;
      this.wheelCanvas.style.cursor = 'grabbing';
    };

    const drag = (clientX) => {
      if (this.wheelDragging) {
        const newVal = getWheelValue(clientX);
        const delta = clientX - this.lastWheelX;
        this.wheelVelocity = delta * 0.01;
        this.wheelValue = newVal;
        this.lastWheelX = clientX;
        this.drawModWheel();
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      }
    };

    const endDrag = () => {
      this.wheelDragging = false;
      this.wheelCanvas.style.cursor = 'grab';
    };

    this.wheelCanvas.onmousedown = e => startDrag(e.clientX);
    this.wheelCanvas.onmousemove = e => drag(e.clientX);
    this.wheelCanvas.onmouseup = () => endDrag();
    this.wheelCanvas.onmouseleave = () => endDrag();

    this.wheelCanvas.ontouchstart = e => {
      startDrag(e.touches[0].clientX);
      e.preventDefault();
    };
    this.wheelCanvas.ontouchmove = e => {
      drag(e.touches[0].clientX);
      e.preventDefault();
    };
    this.wheelCanvas.ontouchend = () => endDrag();

    const animate = () => {
      this.drawModWheel();
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateDisplay() {
    if (!this.ui) return;
    this.ui.querySelector('.roll-val').textContent = this.smoothMod.roll.toFixed(2);
    this.ui.querySelector('.tilt-val').textContent = this.smoothMod.tilt.toFixed(2);
    this.ui.querySelector('.pan-val').textContent = this.smoothMod.pan.toFixed(2);
    this.ui.querySelector('.shake-val').textContent = this.smoothMod.shake.toFixed(2);
    this.ui.querySelector('.spin-val').textContent = this.smoothMod.spin.toFixed(2);
  }

  exportRecording() {
    if (this.recordedMotion.length === 0) return;
    const data = {
      version: "wazos-gyro-motion-v1",
      duration: this.recordedMotion[this.recordedMotion.length - 1].time - this.recordedMotion[0].time,
      frames: this.recordedMotion.length,
      motion: this.recordedMotion
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wazos-gyro-motion.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async importRecording(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version === "wazos-gyro-motion-v1") {
      this.recordedMotion = data.motion || [];
      if (this.ui) {
        this.ui.querySelector('.play-rec-btn').disabled = this.recordedMotion.length === 0;
      }
    }
  }

  renderControls(body) {
    body.innerHTML = `
      <button class="enable-btn" style="grid-column:1/3;">ENABLE GYRO</button>
      <button class="calibrate-btn" disabled>CALIBRATE</button>
      <button class="record-btn" disabled>RECORD</button>
      <button class="play-rec-btn" disabled>PLAY REC</button>
      <button class="clear-rec-btn">CLEAR</button>
      <label>ROLL</label><span class="roll-val">0.00</span>
      <label>TILT</label><span class="tilt-val">0.00</span>
      <label>PAN</label><span class="pan-val">0.00</span>
      <label>SHAKE</label><span class="shake-val">0.00</span>
      <label>SPIN</label><span class="spin-val">0.00</span>
      <label>MOD WHEEL</label>
      <canvas class="mod-wheel" width="240" height="50" style="grid-column:1/3;border:1px solid #333;cursor:grab;background:#000;"></canvas>
      <label>SMOOTH</label>
      <input type="range" class="smooth-slider" min="0" max="0.95" step="0.05" value="0.7">
      <button class="export-motion">EXPORT</button>
      <input type="file" class="import-motion" accept=".json" style="display:none;">
      <button onclick="this.previousElementSibling.click()">IMPORT</button>
    `;

    this.wheelCanvas = body.querySelector('.mod-wheel');
    this.wheelCtx = this.wheelCanvas.getContext('2d');
    this.setupWheelInteraction();

    body.querySelector('.enable-btn').onclick = () => this.enableSensors();
    body.querySelector('.calibrate-btn').onclick = () => this.calibrate();
    body.querySelector('.record-btn').onclick = () => {
      if (this.recording) this.stopRecording();
      else this.startRecording();
    };
    body.querySelector('.play-rec-btn').onclick = () => this.playRecording();
    body.querySelector('.clear-rec-btn').onclick = () => this.clearRecording();
    body.querySelector('.smooth-slider').oninput = e => {
      this.smoothing = parseFloat(e.target.value);
    };
    body.querySelector('.export-motion').onclick = () => this.exportRecording();
    body.querySelector('.import-motion').onchange = e => {
      if (e.target.files[0]) this.importRecording(e.target.files[0]);
    };

    this.drawModWheel();
    this.updateDisplay();
  }
}
