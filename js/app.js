import { CONFIG, createState, hydrateState } from "./state.js";
import { BridgeClient } from "./bridge.js";
import { RendererEngine } from "./renderer.js";
import { TimelineStore } from "./timeline.js";
import { DashboardUI } from "./ui.js";

// Initialisiere dezentralen State, Store und die UI-Bodenstation
const state = hydrateState(createState());
const timeline = new TimelineStore(CONFIG.frameLimit);
const ui = new DashboardUI({ state, timeline });

// Verbindung zur Perchance-Bridge herstellen
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
 * Generiert einen einzelnen Basis-Frame (Studio T2I)
 */
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

/**
 * Setzt den aktuellen Buffer-Frame als initialen Frame 0 fest (Guerilla Cache)
 */
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

/**
 * Der FrameThrower: Schüttelt den Knobelbecher und zündet 16 parallele Kerne
 */
async function launchFrameThrower() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("FrameThrower ignition failed: Input prompt field is empty.", "warn");
    return;
  }

  // Automatischer Tab-Switch zur Cluster-Timeline, um das Grid wachsen zu sehen
  const timelineTabButton = document.querySelector('[data-target="tab-timeline"]');
  if (timelineTabButton) timelineTabButton.click();

  ui.log("💥 BURST COMMENCING: FRAMETHROWER SHAKING THE KNOBELBECHER (16x Cores).", "warn");

  const extendedPayload = {
    ...payload,
    batch: 16,
    init_image: state.frame0Url || null // Wird an das Cluster übergeben
  };

  // Integrierte dezentrale Renderfarm-Prüfung (Knobelbecher-Matrix)
  if (window
