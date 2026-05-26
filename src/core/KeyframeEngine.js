import { Agent } from './Agent.js';

export class KeyframeEngine {
  constructor() {
    this.keyframes = []; // {agentState, seed, style, pose, anchor}
    this.totalFrames = 24;
  }

  // STOCHASTIC ANCHORING
  setKeyframe(agentState, seed, style, pose, anchor = false) {
    this.keyframes.push({ agentState: structuredClone(agentState), seed, style, pose, anchor });
  }

  // NOISE-SPACE TRAJECTORY + LATENT INTERPOLATION
  getInterpolatedFrame(frameIdx) {
    if(this.keyframes.length === 0) return null;
    if(this.keyframes.length === 1) return {...this.keyframes[0], agent: this.keyframes[0].agentState };

    const t = frameIdx / (this.totalFrames - 1);
    const kfT = t * (this.keyframes.length - 1);
    const i = Math.floor(kfT), f = kfT - i;
    const a = this.keyframes[i], b = this.keyframes[Math.min(i+1, this.keyframes.length-1)];

    // DETERMINISTIC DRIFT: seed morphs through latent space
    const seed = Math.floor(a.seed + (b.seed - a.seed) * f);
    const agent = Agent.interpolate(a.agentState, b.agentState, f, "smoothstep");

    return { agent, seed, style: f < 0.5? a.style : b.style, pose: f < 0.5? a.pose : b.pose };
  }
}
