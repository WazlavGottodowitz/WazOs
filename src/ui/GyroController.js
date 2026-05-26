export class GyroController {
  constructor(state) {
    this.state = state;
    this.enabled = false;
  }

  enable() {
    if (window.DeviceOrientationEvent &&!this.enabled) {
      window.addEventListener('deviceorientation', e => this.onTilt(e));
      this.enabled = true;
    }
  }

  // GYROSCOPIC PRECISION: tilt = Z-depth
  onTilt(e) {
    const agent = this.state.getActiveAgent();
    const tilt = Math.max(-45, Math.min(45, e.beta || 0));
    // Apply to all joints for now, or target selected joint
    agent.joints.forEach(j => { j.z = 30 + tilt; j.r = j.z; });
    document.dispatchEvent(new CustomEvent('wazg:render'));
  }
}
