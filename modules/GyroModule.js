import { Module } from '../core/Module.js';

export class GyroModule extends Module {
  constructor(id) {
    super(id, 'GYRO');
    this.enabled = false;
    this.calibrated = false;
    this.zeroOffset = { alpha: 0, beta: 0, gamma: 0 };
    this.accelZero = { x: 0, y: 0, z: 0 };

    // Raw sensor data
    this.orientation = { alpha: 0, beta: 0, gamma: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.rotationRate = { alpha: 0, beta: 0, gamma: 0 };

    // Processed modulation outputs
    this.mod = {
      roll: 0, // gamma -1 to 1
      tilt: 0, // beta -1 to 1
      pan: 0, // alpha -1 to 1
      shake: 0, // acceleration magnitude 0-1
      spin: 0, // rotation rate 0-1
      modWheel: 0 // manual wheel 0-1
    };

    // Recording
    this.recording = false;
    this.recordedMotion = [];
    this.playbackTime = 0;
    this.playbackActive = false;

    // Mod wheel state
    this.wheelValue = 0.5;
    this.wheelVelocity = 0;
    this.wheelDragging = false;
    this.wheelCanvas = null;
    this.wheelCtx = null;

    // Smoothing
    this.smoothing = 0.7;
    this.smoothMod = { roll: 0, tilt: 0, pan: 0, shake: 0, spin: 0 };
  }

  async transform(frame) {
    if (this.enabled) {
      // Apply smoothing
      this.smoothMod.roll = this.smoothMod.roll * this.smoothing + this.mod.roll * (1 - this.smoothing);
      this.smoothMod.tilt = this.smoothMod.tilt * this.smoothing + this.mod.tilt * (1 - this.smoothing);
      this.smoothMod.pan = this.smoothMod.pan * this.smoothing + this.mod.pan * (1 - this.smoothing);
      this.smoothMod.shake = this.smoothMod.shake * this.smoothing + this.mod.shake * (1 - this.smoothing);
      this.smoothMod.spin = this.smoothMod.spin * this.smoothing + this.mod.spin * (1 - this.smoothing);

      // Mod wheel inertia
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

      // Camera modulation for RenderModule
      if (!frame.camera) frame.camera = {};
      frame.camera.gyroRoll = this.smoothMod.roll * 45; // -45 to +45 degrees
      frame.camera.gyroTilt = this.smoothMod.tilt * 30; // -30 to +30 degrees
      frame.camera.gyroPan = this.smoothMod.pan * 180; // -180 to +180 degrees

      // Record motion if active
      if (this.recording) {
        this.recordedMotion.push({
          time: performance.now(),
          mod: {...this.smoothMod, modWheel: this.wheelValue }
        });
      }

      // Playback recorded motion
      if (this.playbackActive && this.recordedMotion.length > 0) {
        this.playbackTime += 16.67; // ~60fps
        const frame = this.getRecordedFrame(this.playbackTime);
        if (frame) {
          Object.assign(this.smoothMod, frame.mod);
          this.wheelValue = frame.mod.modWheel;
        } else {
          this.playbackActive = false;
          this.playbackTime = 0;
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
          }
        })
       .catch(console.error);
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
        y: e.acceleration
