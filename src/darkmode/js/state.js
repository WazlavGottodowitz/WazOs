export const CONFIG = {
  storageKey: "wazos.nocturne.state.v1",
  bridgeTimeoutMs: 4500,
  frameLimit: 32,
  trustedOrigins: ["https://perchance.org", "https://preview.perchance.org"],
  defaults: {
    prompt: "A cybernetic cathedral interior, liquid chrome relics, moody neon haze, cinematic composition",
    negative: "blurry, deformed, low quality, bad anatomy, watermark",
    style: "cinematic cyberpunk, dark neon reflections",
    resolution: "768x768",
    batch: 1,
    seed: "",
    flags: "--stylize 300 --chaos 8",
    zoom: 100
  }
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function parseResolution(input) {
  const [width, height] = String(input || "768x768").split("x").map(Number);
  return {
    width: Number.isFinite(width) ? width : 768,
    height: Number.isFinite(height) ? height : 768
  };
}

export function uid() {
  return `waz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function timeLabel() {
  return new Date().toLocaleTimeString("de-DE", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function safeReferrerOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}

export function createPlaceholderDataUrl(title = "WAZOS NOCTURNE", subtitle = "READY FOR INPUT") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f1220" />
          <stop offset="55%" stop-color="#090b12" />
          <stop offset="100%" stop-color="#14192b" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8f7bff" />
          <stop offset="100%" stop-color="#4ae3ff" />
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="32" /></filter>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)" />
      <circle cx="250" cy="240" r="150" fill="#8f7bff" opacity="0.18" filter="url(#blur)" />
      <circle cx="760" cy="300" r="140" fill="#4ae3ff" opacity="0.18" filter="url(#blur)" />
      <circle cx="580" cy="760" r="190" fill="#ff6d8f" opacity="0.14" filter="url(#blur)" />
      <rect x="86" y="86" width="852" height="852" rx="54" fill="none" stroke="#ffffff22" stroke-width="2" />
      <rect x="138" y="138" width="748" height="748" rx="36" fill="#ffffff06" stroke="#ffffff18" stroke-width="2" />
      <g transform="translate(512 460)">
        <circle r="120" fill="none" stroke="url(#glow)" stroke-width="4" stroke-dasharray="16 12" opacity="0.9" />
        <circle r="62" fill="#ffffff08" stroke="#ffffff35" stroke-width="2" />
        <path d="M-160 0H160M0-160V160" stroke="#ffffff16" stroke-width="2" />
      </g>
      <text x="512" y="640" text-anchor="middle" fill="#eef2ff" font-family="Inter,Arial,sans-serif" font-size="54" font-weight="700" letter-spacing="4">${title}</text>
      <text x="512" y="696" text-anchor="middle" fill="#aeb7d6" font-family="Inter,Arial,sans-serif" font-size="24" letter-spacing="6">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createState() {
  return {
    ...CONFIG.defaults,
    mode: window.parent === window ? "standalone" : "bridge-ready",
    renderState: "idle",
    latestUrl: createPlaceholderDataUrl(),
    latestRequestId: "—",
    latestSource: "boot",
    frameScale: 1,
    frameSize: parseResolution(CONFIG.defaults.resolution)
  };
}

export function hydrateState(state) {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return state;
    const saved = JSON.parse(raw);
    Object.assign(state, {
      prompt: saved.prompt ?? state.prompt,
      negative: saved.negative ?? state.negative,
      style: saved.style ?? state.style,
      resolution: saved.resolution ?? state.resolution,
      batch: saved.batch ?? state.batch,
      seed: saved.seed ?? state.seed,
      flags: saved.flags ?? state.flags,
      zoom: saved.zoom ?? state.zoom
    });
    state.frameSize = parseResolution(state.resolution);
  } catch {
    // ignore invalid local storage
  }
  return state;
}

export function persistState(state) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      prompt: state.prompt,
      negative: state.negative,
      style: state.style,
      resolution: state.resolution,
      batch: state.batch,
      seed: state.seed,
      flags: state.flags,
      zoom: state.zoom
    }));
  } catch {
    // ignore storage failures
  }
}

export function resetPersistedState() {
  try {
    localStorage.removeItem(CONFIG.storageKey);
  } catch {
    // ignore storage failures
  }
}
