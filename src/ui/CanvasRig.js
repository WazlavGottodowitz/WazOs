import { State } from './State.js';
import { CanvasRig } from '../ui/CanvasRig.js';
import { Timeline } from '../ui/Timeline.js';
import { HUD } from '../ui/HUD.js';
import { XRayAxes } from '../modules/XRayAxes.js';
import { GyroController } from '../modules/GyroController.js';
import { CameraTrace } from '../modules/CameraTrace.js';
import * as bridge from '../plugins/perchance-bridge.js';

export class WazGOS {
  constructor(rootSelector) {
    this.root = document.querySelector(rootSelector);
    this.state = new State();
  }

  async boot() {
    this.state.init();
    this.hud = new HUD(this.root, this.state);
    this.rig = new CanvasRig(this.hud.canvasPanel, this.state);
    this.timeline = new Timeline(this.hud.controlsPanel, this.state);
    this.xray = new XRayAxes(this.rig.canvas, this.state);
    this.gyro = new GyroController(this.state);
    this.trace = new CameraTrace(this.rig.canvas, bridge.imageUpload);

    this.hud.render();
    this.rig.attach();
    this.timeline.attach();
    this.xray.enable();
    this.gyro.enable();
    this.trace.enable();

    this.hud.showToast("WazG-OS v13 ONLINE - 16 AGENTS READY");
  }
}
