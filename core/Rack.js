export class Rack {
  constructor(container) {
    this.container = container;
    this.modules = [];
    this.frame = { agents: [], style: "", seed: 0, time: 0 };
  }

  addModule(module) {
    this.modules.push(module);
    module.renderUI(this.container);
    this.rewire();
  }

  moveModule(fromIdx, toIdx) {
    const [mod] = this.modules.splice(fromIdx, 1);
    this.modules.splice(toIdx, 0, mod);
    this.rerender();
    this.rewire();
  }

  rewire() {
    for(let i = 0; i < this.modules.length - 1; i++) {
      this.modules[i].connect('out', this.modules[i+1], 'in');
    }
  }

  async process() {
    let frame = structuredClone(this.frame);
    for(const mod of this.modules) {
      frame = await mod.process(frame);
    }
    document.dispatchEvent(new CustomEvent('wazg:frame-ready', { detail: frame }));
  }

  rerender() {
    this.container.innerHTML = '';
    this.modules.forEach(m => m.renderUI(this.container));
  }
}
