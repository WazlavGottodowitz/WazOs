import { CONFIG, safeReferrerOrigin, uid } from "./state.js";

export class BridgeClient {
  constructor({ onStatus = () => {} } = {}) {
    this.onStatus = onStatus;
    this.referrerOrigin = safeReferrerOrigin();
    this.pending = new Map();
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessage);
  }

  hasParent() {
    return window.parent !== window;
  }

  getTargetOrigin() {
    return this.referrerOrigin || "*";
  }

  isTrustedEvent(event) {
    if (!this.hasParent()) return false;
    if (event.source !== window.parent) return false;
    if (this.referrerOrigin) return event.origin === this.referrerOrigin;
    return CONFIG.trustedOrigins.includes(event.origin);
  }

  handleMessage(event) {
    if (!event?.data || !this.isTrustedEvent(event)) return;
    const { type, requestId, url, error, meta } = event.data;
    if (!requestId || !this.pending.has(requestId)) return;

    const pending = this.pending.get(requestId);
    window.clearTimeout(pending.timeoutId);
    this.pending.delete(requestId);

    if (type === "WAZ_RENDER_DONE" && typeof url === "string") {
      this.onStatus("bridge-live");
      pending.resolve({ requestId, url, source: "bridge", meta: meta || null });
      return;
    }

    if (type === "WAZ_RENDER_ERROR") {
      pending.reject(new Error(typeof error === "string" ? error : "Unknown bridge error"));
    }
  }

  requestRender(payload) {
    if (!this.hasParent()) {
      return Promise.reject(new Error("No parent frame available"));
    }

    const requestId = uid();
    const message = {
      type: "WAZ_GENERATE",
      requestId,
      prompt: payload.prompt,
      negative: payload.negative,
      resolution: payload.resolution,
      flags: payload.flags,
      batch: payload.batch,
      seed: payload.seed
    };

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error("Bridge timeout"));
      }, CONFIG.bridgeTimeoutMs);

      this.pending.set(requestId, { resolve, reject, timeoutId });
      this.onStatus("bridge-ready");
      window.parent.postMessage(message, this.getTargetOrigin());
    });
  }
}
