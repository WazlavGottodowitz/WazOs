export class HUD {
  constructor(root, state) {
    this.root = root;
    this.state = state;
    this.currentTab = 'rig';
  }

  render() {
    this.root.innerHTML = `
      <div id="app">
        <div class="header">
          <div class="title">WazG-OS v13</div>
          <div class="tabs">
            <button class="tab-btn active" data-tab="rig">RIG</button>
            <button class="tab-btn" data-tab="seq">SEQ</button>
            <button class="tab-btn" data-tab="gen">GEN</button>
          </div>
        </div>
        <div class="main">
          <div id="canvasPanel"></div>
          <div id="controlsPanel" class="controls"></div>
        </div>
      </div>
      <div id="toast"></div>
    `;
    this.canvasPanel = this.root.querySelector('#canvasPanel');
    this.controlsPanel = this.root.querySelector('#controlsPanel');
    this.attachTabLogic();
    this.injectCSS();
  }

  injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      #app { display: flex; flex-direction: column; height: 100dvh; width: 100vw; }
     .header { padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; background: var(--card); backdrop-filter: var(--blur); border-bottom: 1px solid var(--border); }
     .title { font-weight: 700; color: var(--accent); font-size: 1.1rem; letter-spacing: 2px; }
     .tabs { display: flex; gap: 4px; }
     .tab-btn { background: transparent; border: 1px solid var(--border); color: var(--fg); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; }
     .tab-btn.active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
     .main { flex: 1; display: grid; grid-template-columns: 1fr; grid-template-rows: 1fr auto; overflow: hidden; }
      #canvasPanel { position: relative; overflow: hidden; background: #000; }
     .controls { background: var(--card); backdrop-filter: var(--blur); border-top: 1px solid var(--border); padding: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; max-height: 40vh; overflow-y: auto; }
     .card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px; }
     .card label { font-size: 0.7rem; color: var(--accent); display: block; margin-bottom: 4px; }
     .card input,.card select,.card button { width: 100%; background: #000; border: 1px solid var(--border); color: var(--fg); border-radius: 6px; padding: 6px; font-family: var(--font-mono); font-size: 0.8rem; }
     .btn { background: var(--accent); color: var(--bg); border: none; font-weight: 700; }
     .btn-gen { background: var(--gen); }
      #toast { position: fixed; top: 50px; left: 50%; transform: translateX(-50%); background: var(--accent); color: var(--bg); padding: 8px 16px; border-radius: 8px; z-index: 999; display: none; }
      @media (min-width: 768px) {.main { grid-template-columns: 300px 1fr; grid-template-rows: 1fr; }.controls { max-height: 100%; border-top: none; border-left: 1px solid var(--border); } }
    `;
    document.head.appendChild(style);
  }

  attachTabLogic() {
    this.root.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.root.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        document.dispatchEvent(new CustomEvent('wazg:tab', { detail: this.currentTab }));
      };
    });
  }

  showToast(msg) {
    const t = this.root.querySelector('#toast');
    t.textContent = msg; t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
  }
}
