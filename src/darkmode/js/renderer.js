import { parseResolution, uid } from "./state.js";

export class RendererEngine {
  constructor({ bridge }) {
    this.bridge = bridge;
  }

  buildStandaloneUrl(payload) {
    const { width, height } = parseResolution(payload.resolution);
    const seedValue = payload.seed || Date.now();
    const promptParts = [payload.prompt, payload.flags].filter(Boolean);
    const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(promptParts.join(", "))}`);
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));
    url.searchParams.set("nologo", "true");
    url.searchParams.set("seed", String(seedValue));
    if (payload.negative) url.searchParams.set("negative", payload.negative);
    return url.toString();
  }

  async generate(payload) {
    if (this.bridge.hasParent()) {
      try {
        return await this.bridge.requestRender(payload);
      } catch (error) {
        return {
          requestId: uid(),
          url: this.buildStandaloneUrl(payload),
          source: "standalone-fallback",
          warning: error.message
        };
      }
    }

    return {
      requestId: uid(),
      url: this.buildStandaloneUrl(payload),
      source: "standalone"
    };
  }
}
