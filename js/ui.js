import { CONFIG, parseResolution, timeLabel } from "./state.js";

export class DashboardUI {
  constructor({ state, timeline }) {
    this.state = state;
    this.timeline = timeline;
    this.handlers = {};
    this.dom = {};
  }

  bindHandlers(handlers) {
    this.handlers = handlers;
  }

  init() {
    this.cacheDom();
    this.hydrateForm();
    this.bindDomEvents();
    this.renderQueue();
    this.updateModePills();
    this.updateFrameMetrics();
    this.setOverlay("SYSTEM ONLINE", false);
    if (this.state.latestUrl) this.setImage(this.state.latestUrl);
    this.log("WazOS Nocturne Pro-UI initialized successfully.", "success");
  }

  cacheDom() {
    this.dom.tabs = document.querySelectorAll('.tab-btn');
    this.dom.panels = document.querySelectorAll('.tab-panel');
    this.dom.prompt = document.getElementById("prompt-input");
    this.dom.negative = document.getElementById("negative-input");
    this.dom.resolution = document.getElementById("resolution-select");
    this.dom.flags = document.getElementById("flags-input");
    this.dom.seed = document.getElementById("seed-input");
    this.dom.generate = document.getElementById("generate-button");
    this.dom.clearQueue = document.getElementById("clear-queue-button");
    this.dom.queueGrid = document.getElementById("queue-grid");
    this.dom.frameCountReadout = document.getElementById("frame-count-readout");
    this.dom.renderImg = document.getElementById("render-img");
    this.dom.renderOverlay = document.getElementById("render-overlay");
    this.dom.consoleLog = document.getElementById("console-log");
    this.dom.modePill = document.getElementById("mode-pill");
    this.dom.renderPill = document.getElementById("render-pill");
    this.dom.actionFrame0 = document.getElementById("action-frame0");
    this.dom.actionFrameThrower = document.getElementById("action-framethrower");
  }

  hydrateForm() {
    if (this.dom.prompt) this.dom.prompt.value = this.state.prompt || "";
    if (this.dom.negative) this.dom.negative.value = this.state.negative || "";
    if (this.dom.resolution) this.dom.resolution.value = this.state.resolution || "768x768";
    if (this.dom.flags) this.dom.flags.value = this.state.flags || "";
    if (this.dom.seed) this.dom.seed.value = this.state.seed || "";
  }

  getPayload() {
    return {
      prompt: this.dom.prompt?.value.trim() || "",
      negative: this.dom.negative?.value.trim() || "",
      resolution: this.dom.resolution?.value || "768x768",
      flags: this.dom.flags?.value.trim() || "",
      seed: this.dom.seed?.value.trim() || "",
      batch: 1
    };
  }

  bindDomEvents() {
    // 1. Mobile Tab Interface Logic
    this.dom.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        
        this.dom.tabs.forEach(t => t.classList.remove('active'));
        this.dom.panels.forEach(p => p.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        const targetPanel = document.getElementById(target);
        if (targetPanel) targetPanel.classList.add('active');
        
        this.log(`Navigation contextualized to: ${target.replace('tab-', '').toUpperCase()}`, "info");
      });
    });

    // 2. Local State Realtime Binding
    const bindField = (domElement, stateKey) => {
      this.dom[domElement]?.addEventListener("input", (e) => {
        this.state[stateKey] = e.target.value;
      });
    };
    bindField("prompt", "prompt");
    bindField("negative", "negative");
    bindField("flags", "flags");
    bindField("seed", "seed");

    this.dom.resolution?.addEventListener("change", (e) => {
      this.state.resolution = e.target.value;
      this.state.frameSize = parseResolution(e.target.value);
    });

    // 3. Action Click Event Subscriptions
    this.dom.generate?.addEventListener("click", () => {
      if (this.handlers.onGenerate) this.handlers.onGenerate();
    });
    this.dom.clearQueue?.addEventListener("click", () => {
      if (this.handlers.onClearQueue) this.handlers.onClearQueue();
    });
    this.dom.actionFrame0?.addEventListener("click", () => {
      if (this.handlers.onUseAsFrame0) this.handlers.onUseAsFrame0();
    });
    this.dom.actionFrameThrower?.addEventListener("click", () => {
      if (this.handlers.onFrameThrower) this.handlers.onFrameThrower();
    });

    // 4. Native Node Pipeline Hooks
    this.dom.renderImg?.addEventListener("load", () => {
      this.setRenderState("idle");
      this.setOverlay("BUFFER ONLINE", true);
      window.setTimeout(() => this.setOverlay("BUFFER READY", false), 800);
    });
    this.dom.renderImg?.addEventListener("error", () => {
      this.setRenderState("idle");
      this.setOverlay("LOAD ERROR", true);
      this.log("Frame-Buffer failed to pipe remote resource asset.", "danger");
    });
  }

  setImage(url) {
    if (!this.dom.renderImg) return;
    this.dom.renderImg.src = url;
    this.state.latestUrl = url;
  }

  setOverlay(text, flash = false) {
    if (!this.dom.renderOverlay) return;
    this.dom.renderOverlay.textContent = text;
    if (flash) this.dom.renderOverlay.style.color = "var(--accent)";
  }

  setRenderState(status) {
    this.state.renderState = status;
    if (this.dom.renderPill) {
      this.dom.renderPill.textContent = status;
      this.dom.renderPill.className = `status-pill ${status === "rendering" ? "warn" : ""}`;
    }
  }

  updateModePills() {
    if (this.dom.modePill) {
      this.dom.modePill.textContent = this.state.mode || "standalone";
    }
  }

  updateFrameMetrics() {
    if (this.dom.frameCountReadout) {
      this.dom.frameCountReadout.textContent = String(this.timeline.count());
    }
  }

  markFrame0Active(isLocked) {
    if (!this.dom.actionFrame0) return;
    if (isLocked) {
      this.dom.actionFrame0.style.borderColor = "var(--accent)";
      this.dom.actionFrame0.style.color = "var(--accent)";
      this.dom.actionFrame0.innerHTML = `<span class="btn-glyph">📌</span> FRAME 0 LOCKED`;
    } else {
      this.dom.actionFrame0.style.borderColor = "var(--border-color)";
      this.dom.actionFrame0.style.color = "var(--text)";
      this.dom.actionFrame0.innerHTML = `<span class="btn-glyph">📌</span> Use as Frame 0`;
    }
  }

  renderQueue() {
    if (!this.dom.queueGrid) return;
    this.dom.queueGrid.innerHTML = "";
    
    this.timeline.all().forEach((frame, index) => {
      const card = document.createElement("div");
      card.className = "queue-card";

      const img = document.createElement("img");
      img.src = frame.url;
      img.loading = "lazy";

      const footer = document.createElement("div");
      footer.className = "queue-footer";

      const label = document.createElement("span");
      label.textContent = `#${this.timeline.count() - index}`;

      const del = document.createElement("button");
      del.className = "del-btn";
      del.textContent = "×";
      del.type = "button";
      del.addEventListener("click", () => {
        if (this.handlers.onDeleteFrame) this.handlers.onDeleteFrame(index);
      });

      footer.append(label, del);
      card.append(img, footer);
      this.dom.queueGrid.append(card);
    });
    this.updateFrameMetrics();
  }

  log(message, tone = "info") {
    if (!this.dom.consoleLog) return;
    const line = document.createElement("div");
    line.className = "log-line";

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = `[${timeLabel()}]`;

    const text = document.createElement("span");
    text.className = `log-message ${tone}`;
    text.textContent = message;

    line.append(time, text);
    this.dom.consoleLog.prepend(line);
  }
}
