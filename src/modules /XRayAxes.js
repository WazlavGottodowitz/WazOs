export class XRayAxes {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
    document.addEventListener('wazg:render', () => this.draw());
  }

  // X-RAY AXES: vanishing points
  draw() {
    if (!this.enabled) return;
    const ctx = this.canvas.getContext('2d');
    const agent = this.state.getActiveAgent();
    ctx.save();
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(255,0,240,0.2)';
    // Draw axes from root to vanishing point
    const root = agent.joints[15]; // root
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.lineTo(root.x, -this.canvas.height); // vertical VP
    ctx.moveTo(root.x, root.y);
    ctx.lineTo(this.canvas.width, root.y); // horizontal VP
    ctx.stroke();
    ctx.restore();
  }
}
