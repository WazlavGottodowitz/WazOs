import { Agent, AGENT_COUNT } from './Agent.js';
import { KeyframeEngine } from './KeyframeEngine.js';

export class State {
  constructor() {
    this.agents = Array.from({ length: AGENT_COUNT }, (_, i) => new Agent(i));
    this.activeAgent = 0;
    this.keyframeEngine = new KeyframeEngine();
    this.currentFrame = 0;
    this.isPlaying = false;
  }

  init() {
    // Load Perchance lists
    this.styles = window.style || {};
    this.poses = window.poses || {};
  }

  getActiveAgent() { return this.agents[this.activeAgent]; }

  captureKeyframe(style, pose, anchorSeed = null) {
    const seed = anchorSeed || Math.floor(Math.random() * 1e9);
    this.keyframeEngine.setKeyframe(this.agents, seed, style, pose,!!anchorSeed);
  }
}
