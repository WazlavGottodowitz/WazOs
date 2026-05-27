
    const WazOsApp = (() => {
      const CONFIG = {
        tabs: ["tab-studio", "tab-maschinenraum", "tab-timeline"],
        storageKey: "wazos.improved.state.v1",
        frameCap: 24,
        renderTimeoutMs: 3500,
        trustedFallbackOrigins: ["https://perchance.org", "https://preview.perchance.org"],
        defaultState: {
          prompt: "A cybernetic skull with neon green tubes, highly detailed, matrix style",
          negative: "blurry, low quality, distortion",
          style: "cyberpunk style, neon colors",
          resolution: "768x768",
          flags: "--v 5.2 --ar 1:1",
          batch: 1,
          zoom: 100,
          activeTab: "tab-studio"
        }
      };

      const state = {
        activeTab: CONFIG.defaultState.activeTab,
        frameSize: { width: 768, height: 768 },
        frames: [],
        zoom: CONFIG.defaultState.zoom,
        fitScale: 1,
        isRendering: false,
        rendererMode: window.top === window.self ? "standalone" : "bridge-ready",
        pendingRequest: null,
        latestUrl: "",
        pointerSwipeStart: null
      };

      const dom = {};

      const Utils = {
        now() {
          return new Date().toLocaleTimeString("de-DE", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });
        },
        uid() {
          return `waz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        },
        parseResolution(value) {
          const [width, height] = String(value).split("x").map(Number);
          return {
            width: Number.isFinite(width) ? width : 768,
            height: Number.isFinite(height) ? height : 768
          };
        },
        clamp(value, min, max) {
          return Math.min(max, Math.max(min, value));
        },
        isMobileLayout() {
          return window.matchMedia("(max-width: 920px)").matches;
        },
        safeOriginFromReferrer() {
          try {
            return document.referrer ? new URL(document.referrer).origin : null;
          } catch {
            return null;
          }
        }
      };

      const Storage = {
        load() {
          try {
            const raw = localStorage.getItem(CONFIG.storageKey);
            if (!raw) return null;
            return JSON.parse(raw);
          } catch {
            return null;
          }
        },
        save() {
          try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
              prompt: dom.prompt.value,
              negative: dom.negative.value,
              style: dom.style.value,
              resolution: dom.resolution.value,
              flags: dom.flags.value,
              batch: dom.batch.value,
              zoom: dom.zoom.value,
              activeTab: state.activeTab
            }));
          } catch {
            // ignore storage failures
          }
        },
        reset() {
          try {
            localStorage.removeItem(CONFIG.storageKey);
          } catch {
            // ignore storage failures
          }
        }
      };

      const Logger = {
        write(message, tone = "info") {
          const line = document.createElement("div");
          line.className = `log-line ${tone}`;

          const time = document.createElement("span");
          time.className = "log-time";
          time.textContent = `[${Utils.now()}]`;

          const body = document.createElement("span");
          body.className = "log-body";
          body.textContent = message;

          line.append(time, body);
          dom.termLog.appendChild(line);
          dom.termLog.scrollTop = dom.termLog.scrollHeight;
        },
        info(message) { this.write(message, "info"); },
        success(message) { this.write(message, "success"); },
        warn(message) { this.write(message, "warn"); },
        error(message) { this.write(message, "error"); },
        muted(message) { this.write(message, "muted"); }
      };

      const UI = {
        cache() {
          dom.workspace = document.getElementById("workspace-container");
          dom.tabs = [...document.querySelectorAll(".tab-btn")];
          dom.panels = [...document.querySelectorAll(".panel")];
          dom.modePill = document.getElementById("renderer-mode-pill");
          dom.bridgeStatusPill = document.getElementById("bridge-status-pill");
          dom.nanoTicker = document.getElementById("nano-ticker");
          dom.controlsPanel = document.getElementById("controls-panel");
          dom.resizer = document.getElementById("panel-resizer");
          dom.prompt = document.getElementById("t2i-prompt");
          dom.negative = document.getElementById("t2i-negative");
          dom.style = document.getElementById("t2i-style");
          dom.resolution = document.getElementById("t2i-res-preset");
          dom.flags = document.getElementById("t2i-flags");
          dom.batch = document.getElementById("t2i-batch");
          dom.generateBtn = document.getElementById("generate-btn");
          dom.throwFrameBtn = document.getElementById("throw-frame-btn");
          dom.copyPromptBtn = document.getElementById("copy-prompt-btn");
          dom.openRenderBtn = document.getElementById("open-render-btn");
          dom.resetFormBtn = document.getElementById("reset-form-btn");
          dom.previewStage = document.getElementById("preview-stage");
          dom.canvasFrame = document.getElementById("canvas-frame-wrapper");
          dom.renderImg = document.getElementById("render-img");
          dom.renderOverlay = document.getElementById("render-overlay");
          dom.frameDisplay = document.getElementById("frame-dimensions-display");
          dom.previewMeta = document.getElementById("preview-meta");
          dom.rendererNote = document.getElementById("renderer-note");
          dom.zoom = document.getElementById("preview-zoom");
          dom.zoomValue = document.getElementById("zoom-value");
          dom.timelineView = document.getElementById("timeline-buffer-view");
          dom.frameCounter = document.getElementById("frame-counter");
          dom.syncCurrentBtn = document.getElementById("sync-current-btn");
          dom.clearBufferBtn = document.getElementById("clear-buffer-btn");
          dom.termLog = document.getElementById("term-log");
          dom.logStatus = document.getElementById("log-status");
          dom.pluginImagegen = document.getElementById("plugin-imagegen");
        },

        hydrateFromStorage() {
          const saved = Storage.load();
          const source = { ...CONFIG.defaultState, ...(saved || {}) };
          dom.prompt.value = source.prompt;
          dom.negative.value = source.negative;
          dom.style.value = source.style;
          dom.resolution.value = source.resolution;
          dom.flags.value = source.flags;
          dom.batch.value = source.batch;
          dom.zoom.value = source.zoom;
          state.zoom = Number(source.zoom) || CONFIG.defaultState.zoom;
          state.activeTab = CONFIG.tabs.includes(source.activeTab) ? source.activeTab : CONFIG.defaultState.activeTab;
          this.switchTab(state.activeTab, { silent: true, scroll: false });
          this.applyResolution(dom.resolution.value, { silent: true });
          this.updateZoomLabel();
        },

        switchTab(targetId, options = {}) {
          const { silent = false, scroll = true } = options;
          if (!CONFIG.tabs.includes(targetId)) return;
          state.activeTab = targetId;

          dom.panels.forEach(panel => {
            panel.classList.toggle("active", panel.id === targetId);
          });

          dom.tabs.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.target === targetId);
          });

          if (Utils.isMobileLayout() && scroll) {
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          this.updateTicker();
          Storage.save();

          if (!silent) {
            Logger.info(`Switched workspace to ${targetId}`);
          }
        },

        applyResolution(value, options = {}) {
          const { silent = false } = options;
          state.frameSize = Utils.parseResolution(value);
          dom.canvasFrame.style.width = `${state.frameSize.width}px`;
          dom.canvasFrame.style.height = `${state.frameSize.height}px`;
          dom.frameDisplay.textContent = `${state.frameSize.width} x ${state.frameSize.height} px`;
          this.fitFrame();
          this.updateTicker();
          Storage.save();

          if (!silent) {
            Logger.info(`Frame-Buffer reconfigured: ${state.frameSize.width}x${state.frameSize.height}px`);
          }
        },

        fitFrame() {
          const padding = 24;
          const stageWidth = Math.max(1, dom.previewStage.clientWidth - padding);
          const stageHeight = Math.max(1, dom.previewStage.clientHeight - padding);
          const fitScale = Math.min(1, stageWidth / state.frameSize.width, stageHeight / state.frameSize.height);
          state.fitScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
          const zoomScale = state.zoom / 100;
          dom.canvasFrame.style.transform = `scale(${state.fitScale * zoomScale})`;
        },

        updateZoomLabel() {
          state.zoom = Number(dom.zoom.value) || 100;
          dom.zoomValue.textContent = `${state.zoom}%`;
          this.fitFrame();
          Storage.save();
        },

        setOverlay(message, visible = true) {
          dom.renderOverlay.textContent = message;
          dom.renderOverlay.classList.toggle("hidden", !visible);
        },

        setRendering(isRendering, modeLabel = "") {
          state.isRendering = isRendering;
          dom.generateBtn.disabled = isRendering;
          dom.generateBtn.textContent = isRendering ? "GENERATING..." : "GENERATE";
          dom.renderImg.style.opacity = isRendering ? "0.35" : "1";
          if (isRendering) {
            this.setOverlay(modeLabel || "PIPELINE REQUEST", true);
          } else {
            this.setOverlay("BUFFER READY", false);
          }
        },

        updateModeIndicators() {
          const modeMap = {
            "standalone": { label: "MODE: STANDALONE", live: false, warn: true },
            "bridge-ready": { label: "MODE: BRIDGE READY", live: false, warn: false },
            "bridge-live": { label: "MODE: BRIDGE LIVE", live: true, warn: false }
          };

          const mode = modeMap[state.rendererMode] || modeMap.standalone;
          dom.modePill.textContent = mode.label;
          dom.modePill.classList.toggle("live", mode.live);
          dom.modePill.classList.toggle("warn", mode.warn);

          const bridgeText = state.rendererMode === "standalone"
            ? "BRIDGE: FALLBACK"
            : state.rendererMode === "bridge-live"
              ? "BRIDGE: ACTIVE"
              : "BRIDGE: WAITING";

          dom.bridgeStatusPill.textContent = bridgeText;
          dom.bridgeStatusPill.classList.toggle("live", state.rendererMode === "bridge-live");
          dom.bridgeStatusPill.classList.toggle("warn", state.rendererMode === "standalone");

          dom.pluginImagegen.textContent = state.rendererMode === "standalone" ? "FALLBACK" : "READY";
          dom.pluginImagegen.classList.toggle("warn", state.rendererMode === "standalone");

          dom.previewMeta.textContent = state.rendererMode === "standalone"
            ? "Standalone fallback active: image URL is built locally and loaded directly."
            : "Bridge contract: WAZ_GENERATE → WAZ_RENDER_DONE / WAZ_RENDER_ERROR";

          dom.rendererNote.textContent = state.rendererMode === "standalone"
            ? "Raw GitHack use-case detected. Generate requests will fall back to a direct image URL if the Perchance parent host is unavailable."
            : "Embedded host detected. The child renderer will first try the original postMessage bridge, then fall back locally if the host does not answer.";
        },

        updateTicker() {
          const mode = state.rendererMode === "bridge-live"
            ? "BRIDGE"
            : state.rendererMode === "bridge-ready"
              ? "EMBED"
              : "LOCAL";
          dom.nanoTicker.textContent = `[ ${mode} | BUFFER:${state.frameSize.width}x${state.frameSize.height} | FRAMES:${state.frames.length} ]`;
        },

        renderTimeline() {
          dom.timelineView.innerHTML = "";

          if (!state.frames.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "No frames buffered. Fire the FrameThrower!";
            dom.timelineView.appendChild(empty);
          } else {
            state.frames.forEach((frame, index) => {
              const card = document.createElement("div");
              card.className = "frame-card";

              const img = document.createElement("img");
              img.src = frame.url;
              img.alt = `Buffered frame ${index + 1}`;
              img.loading = "lazy";

              const meta = document.createElement("div");
              meta.className = "frame-meta";

              const label = document.createElement("span");
              label.textContent = `F_${index + 1} · ${frame.resolution}`;

              const remove = document.createElement("button");
              remove.type = "button";
              remove.className = "frame-remove";
              remove.textContent = "DEL";
              remove.addEventListener("click", () => Actions.removeFrame(index));

              meta.append(label, remove);
              card.append(img, meta);
              dom.timelineView.appendChild(card);
            });
          }

          dom.frameCounter.textContent = `${state.frames.length} frame${state.frames.length === 1 ? "" : "s"} buffered`;
          this.updateTicker();
        }
      };

      const Bridge = (() => {
        const referrerOrigin = Utils.safeOriginFromReferrer();

        function getTargetOrigin() {
          return referrerOrigin || "*";
        }

        function eventIsTrusted(event) {
          if (event.source !== window.parent) return false;
          if (referrerOrigin) return event.origin === referrerOrigin;
          if (CONFIG.trustedFallbackOrigins.includes(event.origin)) return true;
          return window.parent !== window;
        }

        window.addEventListener("message", (event) => {
          if (!event?.data || !eventIsTrusted(event)) return;
          const data = event.data;
          if (!state.pendingRequest) return;
          const requestIdMatches = !data.requestId || data.requestId === state.pendingRequest.id;
          if (!requestIdMatches) return;

          if (data.type === "WAZ_RENDER_DONE") {
            const pending = state.pendingRequest;
            cleanupPending();
            pending.resolve(data);
          }

          if (data.type === "WAZ_RENDER_ERROR") {
            const pending = state.pendingRequest;
            cleanupPending();
            pending.reject(new Error(data.error || "Unknown renderer error"));
          }
        });

        function cleanupPending() {
          if (!state.pendingRequest) return;
          clearTimeout(state.pendingRequest.timeoutId);
          state.pendingRequest = null;
        }

        function request(payload) {
          if (window.parent === window) {
            return Promise.reject(new Error("No parent frame detected"));
          }

          if (state.pendingRequest) {
            return Promise.reject(new Error("Render already in flight"));
          }

          return new Promise((resolve, reject) => {
            const id = Utils.uid();
            const timeoutId = window.setTimeout(() => {
              cleanupPending();
              reject(new Error("Bridge timeout"));
            }, CONFIG.renderTimeoutMs);

            state.pendingRequest = { id, resolve, reject, timeoutId };
            window.parent.postMessage({ type: "WAZ_GENERATE", requestId: id, ...payload }, getTargetOrigin());
          });
        }

        return { request };
      })();

      const Renderer = {
        buildPayload() {
          const rawPrompt = dom.prompt.value.trim();
          const style = dom.style.value.trim();
          const finalPrompt = style ? `${rawPrompt}, ${style}` : rawPrompt;

          return {
            prompt: finalPrompt,
            negative: dom.negative.value.trim(),
            resolution: dom.resolution.value,
            flags: dom.flags.value.trim(),
            batch: Utils.clamp(Number(dom.batch.value) || 1, 1, 8)
          };
        },

        buildStandaloneUrl(payload) {
          const { width, height } = Utils.parseResolution(payload.resolution);
          const seed = Date.now();
          const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(payload.prompt)}`);
          url.searchParams.set("width", width);
          url.searchParams.set("height", height);
          url.searchParams.set("nologo", "true");
          url.searchParams.set("seed", String(seed));
          return url.toString();
        },

        async generate() {
          const payload = this.buildPayload();
          if (!payload.prompt) {
            Logger.warn("Prompt is empty. Generation skipped.");
            return;
          }

          UI.setRendering(true, "PIPELINE REQUEST");
          Storage.save();
          Logger.info(`Requesting plugin pipeline for [${payload.resolution}]...`);

          if (payload.batch > 1) {
            Logger.muted(`Batch=${payload.batch}. Current preview shows the latest active render.`);
          }

          if (window.parent !== window) {
            try {
              const response = await Bridge.request(payload);
              state.rendererMode = "bridge-live";
              UI.updateModeIndicators();
              this.applyRender(response.url, "Bridge output synced.");
              Logger.success("Bridge renderer replied with WAZ_RENDER_DONE.");
              return;
            } catch (error) {
              Logger.warn(`Bridge unavailable: ${error.message}. Falling back locally.`);
            }
          }

          state.rendererMode = "standalone";
          UI.updateModeIndicators();
          const fallbackUrl = this.buildStandaloneUrl(payload);
          this.applyRender(fallbackUrl, "STANDALONE FALLBACK");
          Logger.success("Standalone fallback render requested.");
        },

        applyRender(url, overlayMessage) {
          if (!url) {
            UI.setRendering(false);
            Logger.error("Renderer returned an empty URL.");
            return;
          }

          state.latestUrl = url;
          UI.setOverlay(overlayMessage || "BUFFER SYNC", true);
          dom.renderImg.src = url;
        }
      };

      const Actions = {
        throwFrame() {
          if (state.isRendering || !state.latestUrl) {
            Logger.error("ERROR: Pipeline empty or rendering.");
            return;
          }

          state.frames.push({
            url: state.latestUrl,
            resolution: `${state.frameSize.width}x${state.frameSize.height}`,
            timestamp: Date.now()
          });

          if (state.frames.length > CONFIG.frameCap) {
            state.frames.shift();
            Logger.warn(`Frame buffer capped at ${CONFIG.frameCap}. Oldest frame dropped.`);
          }

          UI.renderTimeline();
          Logger.success(`FRAME THROWN to SEQ (Slot #${state.frames.length})`);
        },

        removeFrame(index) {
          state.frames.splice(index, 1);
          UI.renderTimeline();
          Logger.muted(`Removed frame slot #${index + 1}.`);
        },

        clearFrames() {
          state.frames = [];
          UI.renderTimeline();
          Logger.muted("Sequence buffer cleared.");
        },

        async copyPrompt() {
          try {
            await navigator.clipboard.writeText(Renderer.buildPayload().prompt);
            Logger.success("Prompt copied to clipboard.");
          } catch {
            Logger.warn("Clipboard access failed.");
          }
        },

        openRender() {
          if (!state.latestUrl) {
            Logger.warn("No render available to open.");
            return;
          }
          window.open(state.latestUrl, "_blank", "noopener,noreferrer");
          Logger.muted("Opened current render in a new tab.");
        },

        resetForm() {
          Storage.reset();
          dom.prompt.value = CONFIG.defaultState.prompt;
          dom.negative.value = CONFIG.defaultState.negative;
          dom.style.value = CONFIG.defaultState.style;
          dom.resolution.value = CONFIG.defaultState.resolution;
          dom.flags.value = CONFIG.defaultState.flags;
          dom.batch.value = CONFIG.defaultState.batch;
          dom.zoom.value = CONFIG.defaultState.zoom;
          state.zoom = CONFIG.defaultState.zoom;
          UI.applyResolution(dom.resolution.value, { silent: true });
          UI.updateZoomLabel();
          Storage.save();
          Logger.muted("Form reset to defaults.");
        }
      };

      function setupResizer() {
        let resizing = false;

        const onPointerMove = (event) => {
          if (!resizing || Utils.isMobileLayout()) return;
          const newWidth = event.clientX - dom.controlsPanel.getBoundingClientRect().left;
          const safeWidth = Utils.clamp(newWidth, 220, 520);
          dom.controlsPanel.style.width = `${safeWidth}px`;
          UI.fitFrame();
        };

        const stop = () => {
          if (!resizing) return;
          resizing = false;
          dom.resizer.classList.remove("active");
          document.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerup", stop);
        };

        dom.resizer.addEventListener("pointerdown", (event) => {
          if (Utils.isMobileLayout()) return;
          resizing = true;
          dom.resizer.classList.add("active");
          dom.resizer.setPointerCapture?.(event.pointerId);
          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", stop);
        });
      }

      function setupSwipeNavigation() {
        dom.workspace.addEventListener("pointerdown", (event) => {
          const tag = event.target?.tagName;
          if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag)) return;
          state.pointerSwipeStart = { x: event.clientX, y: event.clientY };
        });

        dom.workspace.addEventListener("pointerup", (event) => {
          if (!state.pointerSwipeStart || Utils.isMobileLayout()) {
            state.pointerSwipeStart = null;
            return;
          }

          const dx = event.clientX - state.pointerSwipeStart.x;
          const dy = event.clientY - state.pointerSwipeStart.y;
          state.pointerSwipeStart = null;

          if (Math.abs(dx) < 80 || Math.abs(dy) > 50) return;

          const currentIndex = CONFIG.tabs.indexOf(state.activeTab);
          if (dx < 0 && currentIndex < CONFIG.tabs.length - 1) {
            UI.switchTab(CONFIG.tabs[currentIndex + 1]);
          } else if (dx > 0 && currentIndex > 0) {
            UI.switchTab(CONFIG.tabs[currentIndex - 1]);
          }
        });
      }

      function bindEvents() {
        dom.tabs.forEach(btn => {
          btn.addEventListener("click", () => UI.switchTab(btn.dataset.target));
        });

        dom.resolution.addEventListener("change", () => UI.applyResolution(dom.resolution.value));
        dom.zoom.addEventListener("input", () => UI.updateZoomLabel());
        dom.generateBtn.addEventListener("click", () => Renderer.generate());
        dom.throwFrameBtn.addEventListener("click", () => Actions.throwFrame());
        dom.syncCurrentBtn.addEventListener("click", () => Actions.throwFrame());
        dom.clearBufferBtn.addEventListener("click", () => Actions.clearFrames());
        dom.copyPromptBtn.addEventListener("click", () => Actions.copyPrompt());
        dom.openRenderBtn.addEventListener("click", () => Actions.openRender());
        dom.resetFormBtn.addEventListener("click", () => Actions.resetForm());

        [dom.prompt, dom.negative, dom.style, dom.resolution, dom.flags, dom.batch, dom.zoom].forEach(element => {
          element.addEventListener("change", () => Storage.save());
          element.addEventListener("input", () => Storage.save());
        });

        dom.renderImg.addEventListener("load", () => {
          UI.setRendering(false);
          UI.setOverlay("BUFFER ONLINE", true);
          window.setTimeout(() => UI.setOverlay("BUFFER READY", false), 900);
          Logger.success("Buffer synced. Plugin output online.");
        });

        dom.renderImg.addEventListener("error", () => {
          UI.setRendering(false);
          UI.setOverlay("LOAD ERROR", true);
          Logger.error("Render image failed to load.");
        });

        window.addEventListener("resize", () => UI.fitFrame());

        if (window.ResizeObserver) {
          const observer = new ResizeObserver(() => UI.fitFrame());
          observer.observe(dom.previewStage);
        }

        setupResizer();
        setupSwipeNavigation();
      }

      function init() {
        UI.cache();
        UI.hydrateFromStorage();
        UI.updateModeIndicators();
        UI.renderTimeline();
        bindEvents();
        state.latestUrl = dom.renderImg.src;
        dom.logStatus.textContent = Utils.isMobileLayout() ? "AUTO / STACK" : "AUTO / TABS";

        Logger.success("WazOs Architecture Engine Active.");
        Logger.success("Frame-Buffer bound to Plugin Channel.");
        Logger.muted("Improvements loaded: standalone fallback, safer bridge, responsive preview, local persistence.");
        UI.updateTicker();
      }

      return { init };
    })();

    window.addEventListener("DOMContentLoaded", WazOsApp.init);
  