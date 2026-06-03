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

      if (!
