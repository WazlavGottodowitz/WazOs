import {
  CONFIG,
  clamp,
  createPlaceholderDataUrl,
  parseResolution,
  persistState,
  resetPersistedState,
  timeLabel
} from "./state.js";

export class DashboardUI {
  constructor({ state, timeline }) {
    this.state = state;
    this.timeline = timeline;
    this.handlers = {};
    this.dom = {};
    this.resizeObserver = null;
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
    this.setOverlay("SYSTEM READY", true);
    this.setImage(this.state.latestUrl);
    this.fitFrame();
    this.log("WazOS Nocturne GUI initialized.", "success");
    this.log("Bridge mode armed. Standalone fallback available.", "info");
  }

  cacheDom() {
    const ids = {
      modePill: "mode-pill",
      bridgePill: "bridge-pill",
      renderPill: "render-pill",
      prompt: "prompt-input",
      negative: "negative-input",
      style: "style-select",
      resolution: "resolution-select",
      batch: "batch-input",
      seed: "seed-input",
      flags: "flags-input",
      generate: "generate-button",
      buffer: "buffer-button",
      copyPrompt: "copy-prompt-button",
      openImage: "open-image-button",
      reset: "reset-button",
      clearQueue: "clear-queue-button",
      fit: "fit-button",
      refresh: "refresh-button",
      zoom: "zoom-slider",
      zoomReadout: "zoom-readout",
      resolutionReadout: "resolution-readout",
      frameCountReadout: "frame-count-readout",
      sourceReadout: "source-readout",
      requestReadout: "request-readout",
      bridgeNote: "bridge-note",
      frameShell: "frame-shell",
      stageWrap: "stage-wrap",
      renderImage: "render-image",
      frameOverlay: "frame-overlay",
      queueGrid: "queue-grid",
      consoleLog: "console-log",
      consoleModeBadge: "console-mode-badge"
    };

    Object.entries(ids).forEach(([key, id]) => {
      this.dom[key] = document.getElementById(id);
    });

    this.dom.scrollButtons = [...document.querySelectorAll("[data-scroll-target]")];
  }

  hydrateForm() {
    this.dom.prompt.value = this.state.prompt;
    this.dom.negative.value = this.state.negative;
    this.dom.style.value = this.state.style;
    this.dom.resolution.value = this.state.resolution;
    this.dom.batch.value = String(this.state.batch);
    this.dom.seed.value = this.state.seed;
    this.dom.flags.value = this.state.flags;
    this.dom.zoom.value = String(this.state.zoom);
    this.dom.zoomReadout.textContent = `${this.state.zoom}%`;
    this.state.frameSize = parseResolution(this.state.resolution);
  }

  bindDomEvents() {
    this.dom.generate.addEventListener("click", () => this.handlers.onGenerate?.());
    this.dom.buffer.addEventListener("click", () => this.handlers.onBufferCurrent?.());
    this.dom.copyPrompt.addEventListener("click", () => this.handlers.onCopyPrompt?.());
    this.dom.openImage.addEventListener("click", () => this.handlers.onOpenImage?.());
    this.dom.reset.addEventListener("click", () => this.handlers.onReset?.());
    this.dom.clearQueue.addEventListener("click", () => this.handlers.onClearQueue?.());
    this.dom.fit.addEventListener("click", () => {
      this.state.zoom = 100;
      this.dom.zoom.value = "100";
      this.dom.zoomReadout.textContent = "100%";
      this.persistFormState();
      this.fitFrame();
      this.log("Preview zoom reset to fit.", "info");
    });
    this.dom.refresh.addEventListener("click", () => this.handlers.onGenerate?.());

    this.dom.zoom.addEventListener("input", () => {
      this.state.zoom = clamp(Number(this.dom.zoom.value) || 100, 40, 160);
      this.dom.zoomReadout.textContent = `${this.state.zoom}%`;
      this.persistFormState();
      this.fitFrame();
    });

    [
      this.dom.prompt,
      this.dom.negative,
      this.dom.style,
      this.dom.resolution,
      this.dom.batch,
      this.dom.seed,
      this.dom.flags
    ].forEach(element => {
      element.addEventListener("input", () => this.persistFormState());
      element.addEventListener("change", () => {
        this.persistFormState();
        this.updateFrameMetrics();
      });
    });

    this.dom.renderImage.addEventListener("load", () => {
      this.setRenderState("idle");
      this.setOverlay("BUFFER ONLINE", true);
      window.setTimeout(() => this.setOverlay("", false), 850);
      this.log(`Render synced from ${this.state.latestSource}.`, "success");
    });

    this.dom.renderImage.addEventListener("error", () => {
      this.setRenderState("error");
      this.setOverlay("IMAGE LOAD FAILED", true);
      this.dom.renderImage.src = createPlaceholderDataUrl("LOAD ERROR", "NETWORK OR HOST ISSUE");
      this.log("Render image failed to load. Placeholder restored.", "error");
    });

    this.dom.scrollButtons.forEach(button => {
      button.addEventListener("click", () => {
        this.dom.scrollButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    window.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        this.handlers.onGenerate?.();
      }
      if ((event.shiftKey && event.key === "Enter") || (event.altKey && event.key.toLowerCase() === "b")) {
        event.preventDefault();
        this.handlers.onBufferCurrent?.();
      }
    });

    window.addEventListener("resize", () => this.fitFrame());

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.fitFrame());
      this.resizeObserver.observe(this.dom.stageWrap);
    }
  }

  persistFormState() {
    this.state.prompt = this.dom.prompt.value.trim();
    this.state.negative = this.dom.negative.value.trim();
    this.state.style = this.dom.style.value;
    this.state.resolution = this.dom.resolution.value;
    this.state.batch = clamp(Number(this.dom.batch.value) || 1, 1, 8);
    this.state.seed = this.dom.seed.value.trim();
    this.state.flags = this.dom.flags.value.trim();
    this.state.zoom = clamp(Number(this.dom.zoom.value) || 100, 40, 160);
    this.state.frameSize = parseResolution(this.state.resolution);
    persistState(this.state);
  }

  getPayload() {
    this.persistFormState();
    const prompt = [this.state.prompt, this.state.style].filter(Boolean).join(", ");
    return {
      prompt,
      negative: this.state.negative,
      resolution: this.state.resolution,
      batch: this.state.batch,
      seed: this.state.seed,
      flags: this.state.flags
    };
  }

  fitFrame() {
    const container = this.dom.stageWrap;
    if (!container) return;

    const padding = 40;
    const availableWidth = Math.max(120, container.clientWidth - padding);
    const availableHeight = Math.max(120, container.clientHeight - padding);
    const { width, height } = this.state.frameSize;
    const fitScale = Math.min(1, availableWidth / width, availableHeight / height);
    const zoomScale = this.state.zoom / 100;
    this.state.frameScale = fitScale * zoomScale;

    document.documentElement.style.setProperty("--frame-w", `${width}px`);
    document.documentElement.style.setProperty("--frame-h", `${height}px`);
    document.documentElement.style.setProperty("--frame-scale", String(this.state.frameScale));
  }

  updateFrameMetrics() {
    const { width, height } = parseResolution(this.dom.resolution.value);
    this.state.frameSize = { width, height };
    this.dom.resolutionReadout.textContent = `${width} × ${height}`;
    this.dom.frameCountReadout.textContent = String(this.timeline.count());
    this.fitFrame();
  }

  updateModePills() {
    const modeMap = {
      "standalone": "Mode: Standalone",
      "standalone-fallback": "Mode: Fallback",
      "bridge-ready": "Mode: Bridge ready",
      "bridge-live": "Mode: Bridge live"
    };

    this.dom.modePill.textContent = modeMap[this.state.mode] || "Mode: Boot";
    this.dom.bridgePill.textContent = this.state.mode === "bridge-live"
      ? "Bridge: Active"
      : this.state.mode === "bridge-ready"
        ? "Bridge: Waiting"
        : "Bridge: Local";
    this.dom.sourceReadout.textContent = this.state.latestSource;
    this.dom.requestReadout.textContent = this.state.latestRequestId;

    const noteMap = {
      "bridge-live": "Parent renderer replied successfully through the formal postMessage bridge.",
      "bridge-ready": "Embedded host detected. UI will try the parent bridge first.",
      "standalone": "Direct-open mode detected. Local fallback URL builder is active.",
      "standalone-fallback": "Parent did not answer in time. Local fallback render was used."
    };

    this.dom.bridgeNote.textContent = noteMap[this.state.mode] || "Waiting for initialization.";
    this.dom.consoleModeBadge.textContent = this.state.mode;
  }

  setRenderState(renderState) {
    this.state.renderState = renderState;
    const labels = {
      idle: "Render: Idle",
      rendering: "Render: Working",
      error: "Render: Error"
    };
    this.dom.renderPill.textContent = labels[renderState] || labels.idle;
  }

  setOverlay(message, visible = true) {
    this.dom.frameOverlay.textContent = message;
    this.dom.frameOverlay.classList.toggle("hidden", !visible);
  }

  setImage(url) {
    this.dom.renderImage.src = url;
  }

  setResult(result) {
    this.state.latestUrl = result.url;
    this.state.latestRequestId = result.requestId;
    this.state.latestSource = result.source;
    this.state.mode = result.source === "bridge"
      ? "bridge-live"
      : result.source === "standalone-fallback"
        ? "standalone-fallback"
        : "standalone";
    this.updateModePills();
    this.setImage(result.url);
  }

  renderQueue() {
    this.dom.queueGrid.innerHTML = "";
    if (!this.timeline.count()) {
      const empty = document.createElement("div");
      empty.className = "queue-empty";
      empty.textContent = "No buffered frames yet. Generate a render, then throw it into the queue.";
      this.dom.queueGrid.appendChild(empty);
      this.dom.frameCountReadout.textContent = "0";
      return;
    }

    this.timeline.all().forEach((frame, index) => {
      const card = document.createElement("article");
      card.className = "queue-card";

      const img = document.createElement("img");
      img.src = frame.url;
      img.alt = `Buffered frame ${index + 1}`;
      img.loading = "lazy";

      const footer = document.createElement("div");
      footer.className = "queue-card-footer";

      const label = document.createElement("strong");
      label.textContent = `F_${String(this.timeline.count() - index).padStart(2, "0")}`;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "queue-delete";
      del.textContent = "Delete";
      del.addEventListener("click", () => this.handlers.onDeleteFrame?.(index));

      footer.append(label, del);
      card.append(img, footer);
      this.dom.queueGrid.append(card);
    });

    this.dom.frameCountReadout.textContent = String(this.timeline.count());
  }

  log(message, tone = "info") {
    const line = document.createElement("div");
    line.className = `log-line ${tone}`;

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = `[${timeLabel()}]`;

    const text = document.createElement("span");
    text.className = "log-message";
    text.textContent = message;

    line.append(time, text);
    this.dom.consoleLog.prepend(line);
  }

  async copyPromptToClipboard() {
    try {
      await navigator.clipboard.writeText(this.getPayload().prompt);
      this.log("Prompt copied to clipboard.", "success");
    } catch {
      this.log("Clipboard access denied.", "warn");
    }
  }

  openCurrentImage() {
    if (!this.state.latestUrl) {
      this.log("No current image to open.", "warn");
      return;
    }
    window.open(this.state.latestUrl, "_blank", "noopener,noreferrer");
    this.log("Opened current render in a new tab.", "info");
  }

  resetFormToDefaults() {
    Object.assign(this.state, {
      ...CONFIG.defaults,
      frameSize: parseResolution(CONFIG.defaults.resolution)
    });
    resetPersistedState();
    this.hydrateForm();
    this.updateFrameMetrics();
    this.setImage(createPlaceholderDataUrl("WAZOS NOCTURNE", "RESET COMPLETE"));
    this.log("Form reset to defaults.", "info");
  }
}
