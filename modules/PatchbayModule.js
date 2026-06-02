import { Module } from '../core/Module.js';

export class PatchBayModule extends Module {
  constructor(id) {
    super(id, 'PATCH');
    this.patches = []; // {from:{modId,socket}, to:{modId,socket}}
    this.canvas = null;
    this.ctx = null;
    this.dragging = null;
    this.mousePos = { x: 0, y: 0 };
  }

  async transform(frame) {
    // PATCHBAY: Routes data between non-adjacent modules
    frame.patchbay = {
      patches: this.patches,
      route: (fromMod, fromSocket, toMod, toSocket, data) => {
        // CV-style: any module can write to patchbay, others read
        if (!frame.cv) frame.cv = {};
        const key = `${toMod}:${toSocket}`;
        if (!frame.cv[key]) frame.cv[key] = [];
        frame.cv[key].push(data);
      }
    };
    return frame;
  }

  addPatch(fromModId, fromSocket, toModId, toSocket) {
    this.patches.push({
      from: { modId: fromModId, socket: fromSocket },
      to: { modId: toModId, socket: toSocket }
    });
    this.renderCables();
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }

  removePatch(idx) {
    this.patches.splice(idx, 1);
    this.renderCables();
    document.dispatchEvent(new CustomEvent('wazg:rack-update'));
  }

  renderCables() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = '#ff0';
    this.ctx.lineWidth = 2;

    this.patches.forEach(p => {
      const fromEl = document.querySelector(`[data-mod="${p.from.modId}"] [data-socket="${p.from.socket}"]`);
      const toEl = document.querySelector(`[data-mod="${p.to.modId}"] [data-socket="${p.to.socket}"]`);
      if (fromEl && toEl) {
        const r1 = fromEl.getBoundingClientRect();
        const r2 = toEl.getBoundingClientRect();
        const rc = this.canvas.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(r1.left - rc.left + r1.width/2, r1.top - rc.top + r1.height/2);
        this.ctx.bezierCurveTo(
          r1.left - rc.left + 100, r1.top - rc.top,
          r2.left - rc.left - 100, r2.top - rc.top,
          r2.left - rc.left + r2.width/2, r2.top - rc.top + r2.height/2
        );
        this.ctx.stroke();
      }
    });

    // Draw dragging cable
    if (this.dragging) {
      const el = document.querySelector(`[data-mod="${this.dragging.modId}"] [data-socket="${this.dragging.socket}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        const rc = this.canvas.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(r.left - rc.left + r.width/2, r.top - rc.top + r.height/2);
        this.ctx.lineTo(this.mousePos.x - rc.left, this.mousePos.y - rc.top);
        this.ctx.stroke();
      }
    }
  }

  renderControls(body) {
    body.innerHTML = `
      <label>PATCH BAY</label>
      <div class="patch-list" style="grid-column:1/3;max-height:100px;overflow-y:auto;border:1px solid #333;padding:4px;"></div>
      <button class="clear-patches" style="grid-column:1/3;">CLEAR ALL</button>
      <canvas class="cable-canvas" style="position:fixed;top:0;left:0;pointer-events:none;z-index:9999;"></canvas>
    `;
    this.canvas = body.querySelector('.cable-canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    this.updatePatchList();
    body.querySelector('.clear-patches').onclick = () => {
      this.patches = [];
      this.renderCables();
      this.updatePatchList();
    };

    // Make all rack IO sockets clickable for patching
    document.addEventListener('click', e => {
      if (e.target.classList.contains('rack-in') || e.target.classList.contains('rack-out')) {
        const modEl = e.target.closest('.rack-unit');
        const modId = modEl.classList[1].replace('rack-', '');
        const socket = e.target.dataset.socket;
        const type = e.target.classList.contains('rack-in')? 'in' : 'out';

        if (!this.dragging && type === 'out') {
          this.dragging = { modId, socket, type };
        } else if (this.dragging && type === 'in') {
          this.addPatch(this.dragging.modId, this.dragging.socket, modId, socket);
          this.dragging = null;
        }
      }
    });

    document.addEventListener('mousemove', e => {
      this.mousePos = { x: e.clientX, y: e.clientY };
      if (this.dragging) this.renderCables();
    });

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.renderCables();
    });
  }

  updatePatchList() {
    const list = this.ui.querySelector('.patch-list');
    list.innerHTML = this.patches.map((p, i) =>
      `<div>${p.from.modId}:${p.from.socket} → ${p.to.modId}:${p.to.socket} <button data-idx="${i}">X</button></div>`
    ).join('');
    list.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => this.removePatch(parseInt(btn.dataset.idx));
    });
  }
}
