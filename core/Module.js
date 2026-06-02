export class Module {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.inputs = { in: null };
    this.outputs = { out: null };
    this.bypass = false;
    this.ui = null;
  }

  async process(inputFrame) {
    if (this.bypass) return inputFrame;
    return await this.transform(inputFrame);
  }

  async transform(frame) { return frame; }

  connect(outputSocket, targetModule, inputSocket) {
    this.outputs[outputSocket] = { target: targetModule, socket: inputSocket };
  }

  renderUI(container) {
    this.ui = document.createElement('div');
    this.ui.className = `rack-unit rack-${this.type.toLowerCase()}`;
    this.ui.innerHTML = `
      <div class="rack-header">
        <span class="rack-led"></span>
        <span class="rack-label">${this.type} ${this.id}</span>
        <button class="rack-bypass">BYP</button>
      </div>
      <div class="rack-body"></div>
      <div class="rack-io">
        <div class="rack-in" data-socket="in">●</div>
        <div class="rack-out" data-socket="out">●</div>
      </div>
    `;
    container.appendChild(this.ui);
    const btn = this.ui.querySelector('.rack-bypass');
    btn.onclick = () => this.toggleBypass();
    this.renderControls(this.ui.querySelector('.rack-body'));
  }

  renderControls(body) { }

  toggleBypass() {
    this.bypass =!this.bypass;
    this.ui.querySelector('.rack-led').style.background = this.bypass? '#300' : '#0f0';
    this.ui.querySelector('.rack-bypass').classList.toggle('active', this.bypass);
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }
}
