import { CONFIG, createState, hydrateState } from "./state.js";
import { BridgeClient } from "./bridge.js";
import { RendererEngine } from "./renderer.js";
import { TimelineStore } from "./timeline.js";
import { DashboardUI } from "./ui.js";

const state = hydrateState(createState());
const timeline = new TimelineStore(CONFIG.frameLimit);
const ui = new DashboardUI({ state, timeline });

const bridge = new BridgeClient({
  onStatus(mode) {
    if (state.mode !== "standalone") {
      state.mode = mode;
      ui.updateModePills();
    }
  }
});
const renderer = new RendererEngine({ bridge });

async function generateRender() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("Prompt engine is dry. Action cancelled.", "warn");
    return;
  }

  ui.setRenderState("rendering");
  ui.setOverlay("GENERATING BASE FRAME", true);
  ui.log(`Dispatching base token frame request...`, "info");

  try {
    const result = await renderer.generate(payload);
    ui.setImage(result.url);
    state.latestRequestId = result.requestId || "—";
    
    if (result.warning) {
      ui.log(`Bridge Warning fallback active: ${result.warning}`, "warn");
    } else {
      ui.log(`Frame synchronization verified via context: ${result.source}.`, "success");
    }
  } catch (err) {
    ui.log(`Critical pipeline bounce: ${err.message}`, "danger");
  } finally {
    ui.setRenderState("idle");
  }
}

function setFrame0() {
  if (!state.latestUrl || state.latestUrl.includes("placeholder") || state.latestUrl === "") {
    ui.log("Zero frame injection aborted: No fresh render buffer data available.", "warn");
    return;
  }

  state.frame0Url = state.latestUrl;
  ui.markFrame0Active(true);

  // Pushe Frame 0 direkt in die Timeline, falls diese noch komplett blank ist
  if (timeline.count() === 0) {
    timeline.add({
      url: state.latestUrl,
      createdAt: Date.now(),
      requestId: `frame-0-core`
    });
    ui.renderQueue();
  }
  ui.log("Guerilla Cache armed: Base Frame 0 locked as init_image template.", "success");
}

async function launchFrameThrower() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("FrameThrower ignition failed: Input prompt field is empty.", "warn");
    return;
  }

  // Automatischer Tab-Switch zur Live-Zelle, um das Grid wachsen zu sehen
  const timelineTabButton = document.querySelector('[data-target="tab-timeline"]');
  if (timelineTabButton) timelineTabButton.click();

  ui.log("💥 BURST COMMENCING: FRAMETHROWER SPAMMING PARALLEL CORE SANDBOXES (16x).", "warn");

  const extendedPayload = {
    ...payload,
    batch: 16,
    init_image: state.frame0Url || null // Wird an das Cluster übergeben
  };

  // Integrierte dezentrale Renderfarm-Prüfung
  if (window.perchanceHub) {
    await window.perchanceHub.dispatchParallelSequence(extendedPayload);
    state.frame0Url = null;
    ui.markFrame0Active(false);
  } else {
    // Lokaler sequentieller Fallback-Loop, falls die Anwendung im Standalone-Modus läuft
    ui.log("Perchance Hub Cluster inactive. Falling back to clean sequential execution matrix...", "warn");
    ui.setRenderState("rendering");
    
    for (let i = 0; i < 16; i++) {
      const framePayload = { 
        ...extendedPayload, 
        prompt: `${extendedPayload.prompt}, frame ${i + 1}`,
        seed: payload.seed ? `${payload.seed}-${i}` : `${Date.now()}-${i}` 
      };
      
      try {
        const result = await renderer.generate(framePayload);
        timeline.add({
          url: result.url,
          createdAt: Date.now(),
          requestId: result.requestId
        });
        ui.renderQueue();
      } catch (e) {
        ui.log(`Frame loss at sequence component #${i + 1}: ${e.message}`, "danger");
      }
    }
    
    ui.setRenderState("idle");
    state.frame0Url = null;
    ui.markFrame0Active(false);
    ui.log("Standalone sequence burst completed.", "success");
  }
}

function deleteFrame(index) {
  timeline.remove(index);
  ui.renderQueue();
  ui.log(`Purged asset matrix frame at index pointer #${index + 1}.`, "info");
}

function clearQueue() {
  timeline.clear();
  ui.renderQueue();
  ui.log("Timeline sequence buffer reset to zero storage.", "info");
}

function wireHandlers() {
  ui.bindHandlers({
    onGenerate: generateRender,
    onClearQueue: clearQueue,
    onDeleteFrame: deleteFrame,
    onUseAsFrame0: setFrame0,
    onFrameThrower: launchFrameThrower
  });
}

function init() {
  ui.init();
  wireHandlers();
  ui.updateModePills();
}

window.addEventListener("DOMContentLoaded", init);
