import { CONFIG, createState, createPlaceholderDataUrl, hydrateState } from "./state.js";
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

function bootPlaceholder() {
  state.latestUrl = createPlaceholderDataUrl("WAZOS NOCTURNE", state.mode === "bridge-ready" ? "BRIDGE ARMED" : "LOCAL FALLBACK READY");
}

async function generateRender() {
  const payload = ui.getPayload();
  if (!payload.prompt) {
    ui.log("Prompt is empty. Generation skipped.", "warn");
    return;
  }

  ui.setRenderState("rendering");
  ui.setOverlay("GENERATING RENDER", true);
  ui.log(`Dispatching render request for ${payload.resolution}.`, "info");

  const result = await renderer.generate(payload);
  ui.setResult(result);

  if (result.warning) {
    ui.log(`Bridge fallback engaged: ${result.warning}.`, "warn");
  } else if (result.source === "bridge") {
    ui.log("Parent renderer responded through WAZ_RENDER_DONE.", "success");
  } else {
    ui.log("Standalone renderer URL generated locally.", "success");
  }
}

function bufferCurrentFrame() {
  if (!state.latestUrl) {
    ui.log("No render available to buffer.", "warn");
    return;
  }

  timeline.add({
    url: state.latestUrl,
    createdAt: Date.now(),
    requestId: state.latestRequestId
  });
  ui.renderQueue();
  ui.updateFrameMetrics();
  ui.log(`Frame buffered. Queue size is now ${timeline.count()}.`, "success");
}

function deleteFrame(index) {
  timeline.remove(index);
  ui.renderQueue();
  ui.updateFrameMetrics();
  ui.log(`Removed frame ${index + 1} from the queue.`, "info");
}

function clearQueue() {
  timeline.clear();
  ui.renderQueue();
  ui.updateFrameMetrics();
  ui.log("Queue cleared.", "info");
}

function wireHandlers() {
  ui.bindHandlers({
    onGenerate: generateRender,
    onBufferCurrent: bufferCurrentFrame,
    onDeleteFrame: deleteFrame,
    onClearQueue: clearQueue,
    onCopyPrompt: () => ui.copyPromptToClipboard(),
    onOpenImage: () => ui.openCurrentImage(),
    onReset: () => {
      ui.resetFormToDefaults();
      bootPlaceholder();
      state.latestRequestId = "—";
      state.latestSource = "boot";
      ui.updateModePills();
      ui.setImage(state.latestUrl);
      ui.setOverlay("RESET COMPLETE", true);
      window.setTimeout(() => ui.setOverlay("", false), 900);
    }
  });
}

bootPlaceholder();
wireHandlers();
ui.init();
