import { Agent } from './Agent.js';

export class KeyframeEngine {
  constructor() {
    this.keyframes = [];
    this.totalFrames = 24;
  }

  setKeyframe(agentStates, seed, style, anchor = false) {
    this.keyframes.push({
      agentStates: agentStates.map(a => a.clone()),
      seed, style, anchor
    });
  }

  getInterpolatedFrame(frameIdx) {
    if (this.keyframes.length === 0) return null;
    if (this.keyframes.length === 1) return this.keyframes[0];
    const t = frameIdx / (this.totalFrames - 1);
    const kfT = t * (this.keyframes.length - 1);
    const i = Math.floor(kfT), f = kfT - i;
    const a = this.keyframes[i], b = this.keyframes[Math.min(i+1, this.keyframes.length-1)];
    const seed = Math.floor(a.seed + (b.seed - a.seed) * f);
    const agentStates = a.agentStates.map((ag, idx) =>
      Agent.interpolate(ag, b.agentStates[idx], f, "smoothstep")
    );
    return { agentStates, seed, style: f < 0.5? a.style : b.style };
  }

  clear() { this.keyframes = []; }
}
