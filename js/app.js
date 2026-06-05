import { CONFIG, createState, hydrateState } from "./state.js";
import { BridgeClient } from "./bridge.js";
import { RendererEngine } from "./renderer.js";
import { TimelineStore } from "./timeline.js";
import { DashboardUI } from "./ui.js";
import { VideoSynth } from "./synth.js"; 

// Initialisiere Kern-Komponenten
const state = hydrateState(createState());
const timeline = new TimelineStore(CONFIG.frameLimit);
const ui = new DashboardUI({ state, timeline });
const synth = new VideoSynth(timeline); 

// Perchance Bridge
const bridge = new BridgeClient({
  onStatus(mode) {
    if (state.mode !== "standalone") {
      state.mode = mode;
      ui.updateModePills();
    }
  }
});
const renderer = new RendererEngine({ bridge });

/**
 * Base Frame Generation
 */
async function generateRender() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("Prompt engine is dry. Action cancelled.", "warn");
    return;
  }

  ui.setRenderState("rendering");
  ui.setOverlay("GENERATING BASE FRAME", true);

  try {
    const result = await renderer.generate(payload);
    ui.setImage(result.url);
    state.latestRequestId = result.requestId || "—";
    ui.log(`Frame synchronization verified.`, "success");
  } catch (err) {
    ui.log(`Critical pipeline bounce: ${err.message}`, "danger");
  } finally {
    ui.setRenderState("idle");
  }
}

/**
 * Lock as Frame 0
 */
function setFrame0() {
  if (!state.latestUrl || state.latestUrl.includes("placeholder") || state.latestUrl === "") {
    ui.log("Zero frame injection aborted.", "warn");
    return;
  }

  state.frame0Url = state.latestUrl;
  ui.markFrame0Active(true);

  if (timeline.count() === 0) {
    timeline.add({ url: state.latestUrl, createdAt: Date.now(), requestId: `frame-0-core` });
    ui.renderQueue();
  }
  ui.log("Guerilla Cache armed: Base Frame 0 locked.", "success");
}

/**
 * Trigger Cluster (16x Burst)
 */
async function launchFrameThrower() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("FrameThrower ignition failed: Prompt empty.", "warn");
    return;
  }

  const timelineTabButton = document.querySelector('[data-target="tab-timeline"]');
  if (timelineTabButton) timelineTabButton.click();

  ui.log("💥 BURST COMMENCING: FRAMETHROWER ZÜNDET.", "warn");

  const extendedPayload = {
    ...payload,
    batch: 16,
    init_image: state.frame0Url || null
  };

  if (window.wazKnobelbecher) {
    await window.wazKnobelbecher.dispatchParallelSequence(extendedPayload);
    state.frame0Url = null;
    ui.markFrame0Active(false);
  } else {
    ui.log("Knobelbecher Engine missing. Sequentieller Fallback...", "warn");
    ui.setRenderState("rendering");
    for (let i = 0; i < 16; i++) {
      try {
        const framePayload = { ...extendedPayload, prompt: `${extendedPayload.prompt}, frame ${i + 1}`, seed: payload.seed ? `${payload.seed}-${i}` : `${Date.now()}-${i}` };
        const result = await renderer.generate(framePayload);
        timeline.add({ url: result.url, createdAt: Date.now(), requestId: result.requestId });
        ui.renderQueue();
      } catch (e) {
        ui.log(`Frame loss at #${i + 1}: ${e.message}`, "danger");
      }
    }
    ui.setRenderState("idle");
    state.frame0Url = null;
    ui.markFrame0Active(false);
  }
}

function deleteFrame(index) {
  timeline.remove(index);
  ui.renderQueue();
}

function clearQueue() {
  timeline.clear();
  ui.renderQueue();
}

/**
 * System Initialisation & Wiring
 */
function init() {
  try {
    ui.init();
    
    // Bind Main UI Handlers
    ui.bindHandlers({
      onGenerate: generateRender,
      onClearQueue: clearQueue,
      onDeleteFrame: deleteFrame,
      onUseAsFrame0: setFrame0,
      onFrameThrower: launchFrameThrower
    });
    
    // Bind Video Synthesizer Handlers
    document.getElementById('action-synth-play')?.addEventListener('click', () => {
      if (timeline.count() === 0) {
        ui.log("Synth blockiert: Keine Frames vorhanden.", "warn");
        return;
      }
      document.getElementById('synth-status').textContent = "PLAYING (12 FPS)";
      document.getElementById('synth-status').style.color = "var(--accent)";
      synth.play();
    });

    document.getElementById('action-synth-stop')?.addEventListener('click', () => {
      synth.stop();
      document.getElementById('synth-status').textContent = "STANDBY";
      document.getElementById('synth-status').style.color = "var(--text-dim)";
    });

    document.getElementById('action-synth-export')?.addEventListener('click', async () => {
      if (timeline.count() < 2) {
        ui.log("Export fehlgeschlagen: Mindestens 2 Frames benötigt.", "danger");
        return;
      }
      
      ui.log("WazOS Compiler: Rendere WebM-Video im Hintergrund...", "warn");
      document.getElementById('synth-status').textContent = "RENDERING...";
      
      if (synth.audioCtx && synth.audioCtx.state === 'suspended') {
        await synth.audioCtx.resume();
      }
      
      const videoUrl = await synth.exportWebM();
      
      if (videoUrl) {
        ui.log("Export erfolgreich! Video wird heruntergeladen.", "success");
        document.getElementById('synth-status').textContent = "EXPORTED";
        
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `wazos_acid_synth_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });

    ui.updateModePills();
    console.log("✅ WazOS Engine zündbereit!");
  } catch (err) {
    console.error("🚨 Fehler beim Core-Zünden:", err);
  }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  init();
} else {
  window.addEventListener("DOMContentLoaded", init);
}
