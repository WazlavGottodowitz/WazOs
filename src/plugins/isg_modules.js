/**
 * isg_modules.js
 * Unified Module Analyzer & Blind Continuity Optimizer
 * 
 * Purpose: Analyze WazOs plugin modules, score continuity fitness,
 * and generate optimized blind continuity models with adaptive parameters.
 * 
 * Designed for integration with Perchance generators (waz-2-frames, etc.)
 */

// ============================================================
// GITHUB MODULE LOADER
// ============================================================

async function loadGitHubText(repoPath) {
  const owner = "WazlavGottodowitz";
  const repo = "WazOs";
  const branch = "main";

  const encodedPath = repoPath
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub fetch failed for ${repoPath}: ${res.status}`);
  return await res.text();
}

// ============================================================
// MODULE SCORING ENGINE
// ============================================================

const CONTINUITY_TOKENS = {
  frame: 4,
  anchor: 5,
  weight: 4,
  decay: 3,
  drift: 3,
  neural: 5,
  gait: 5,
  observer: 3,
  compiler: 3,
  continuity: 4,
  image: 3,
  motion: 3,
  profile: 2,
  vector: 2,
  structure: 2,
  temporal: 2,
  kinematic: 2,
  interpolation: 3,
  anchor_status: 4,
  frame_weight_bias: 4
};

function scoreModule(path, text) {
  const s = text.toLowerCase();
  let score = 0;

  Object.entries(CONTINUITY_TOKENS).forEach(([key, value]) => {
    if (s.includes(key)) score += value;
  });

  // Bonus for mathematical implementations
  if (/math\.(max|min|sin|cos|pow)/gi.test(s)) score += 4;
  if (/frameindex/gi.test(s)) score += 3;
  if (/imageweightbias/gi.test(s)) score += 4;
  if (/context\.terminal/gi.test(s)) score += 2;
  if (/async\s+apply/i.test(s)) score += 2;

  return {
    path,
    filename: path.split("/").pop(),
    score,
    category: categorizeModule(path, s)
  };
}

function categorizeModule(path, text) {
  const lower = text.toLowerCase();
  if (lower.includes("gait") || lower.includes("neural")) return "Motion";
  if (lower.includes("observer") || lower.includes("render")) return "Synthesis";
  if (lower.includes("compiler") || lower.includes("master")) return "Orchestration";
  if (lower.includes("retarget")) return "Rigging";
  if (lower.includes("mutation") || lower.includes("fx")) return "Effects";
  if (lower.includes("logger")) return "Debugging";
  return "Utility";
}

// ============================================================
// ADAPTIVE BLIND CONTINUITY MODEL
// ============================================================

class AdaptiveBlindContinuity {
  constructor(packet = {}) {
    this.frameIndex = Number(packet.frameIndex ?? 0);
    this.hasAnchor = Boolean(packet.frame1Image);
    this.motionIntensity = Number(packet.motionIntensity ?? 0.5);
    this.visualNoise = Number(packet.visualNoise ?? 0.2);
    this.anchorStrength = Number(packet.anchorStrength ?? 1.0);
    this.fadeFrames = Number(packet.anchorFadeFrames ?? 45);
    this.easeMode = packet.easeMode || "quadratic";
  }

  compute() {
    const rawDecay = Math.max(0, 1 - (this.frameIndex / this.fadeFrames));
    const easedDecay = this.applyEase(rawDecay);

    const motionBias = 1 + this.motionIntensity * 0.35;
    const noiseBias = 1 + this.visualNoise * 0.25;

    const continuityWeight = this.hasAnchor
      ? Math.max(0, this.anchorStrength * easedDecay * motionBias * noiseBias)
      : 0;

    const anchorConfidence = this.hasAnchor
      ? Math.min(1, 0.7 + continuityWeight * 0.3)
      : 0;

    return {
      frameIndex: this.frameIndex,
      hasAnchor: this.hasAnchor,
      mode: this.hasAnchor ? "adaptive_anchor" : "free_form",
      decayCurve: this.easeMode,
      anchorWeight: Number(continuityWeight.toFixed(4)),
      anchorConfidence: Number(anchorConfidence.toFixed(4)),
      driftSensitivity: Number((this.motionIntensity * 0.6 + this.visualNoise * 0.4).toFixed(4)),
      rawDecay: Number(rawDecay.toFixed(4)),
      easedDecay: Number(easedDecay.toFixed(4)),
      motionBias: Number(motionBias.toFixed(4)),
      noiseBias: Number(noiseBias.toFixed(4))
    };
  }

  applyEase(t) {
    switch (this.easeMode) {
      case "linear":
        return t;
      case "quadratic":
        return 1 - Math.pow(1 - t, 2); // ease-out
      case "cubic":
        return 1 - Math.pow(1 - t, 3);
      case "exponential":
        return t === 0 ? 0 : 1 - Math.pow(2, -10 * t);
      default:
        return t;
    }
  }

  getRecommendations() {
    const recs = [];

    if (this.frameIndex > this.fadeFrames) {
      recs.push("⚠️ Frame exceeds fade window; continuity fully reset");
    }

    if (this.motionIntensity > 0.8) {
      recs.push("🎬 High motion detected; increasing drift sensitivity");
    }

    if (this.visualNoise > 0.6) {
      recs.push("📊 High visual noise; anchor confidence may be reduced");
    }

    if (!this.hasAnchor) {
      recs.push("🔓 No anchor image; using procedural continuity");
    }

    if (this.anchorConfidence > 0.8) {
      recs.push("✅ Strong anchor; structure well-preserved");
    }

    return recs.length > 0 ? recs : ["✓ All parameters nominal"];
  }
}

// ============================================================
// MODULE SELECTOR
// ============================================================

async function selectBestModules(maxCount = 4) {
  const modulePaths = [
    "src/plugins/isg_004b-neural-gait.js",
    "src/plugins/isg_005-observer(The Language Synthesizer).js",
    "src/plugins/isg_099-master-compiler.js",
    "src/plugins/isg_006-fx-mutation.js",
    "src/plugins/isg_002b-retargeter(The Kinematic Retargeter).js",
    "src/plugins/isg_001b-motion-library(The Motion Dictionary).js",
    "src/core/WazgFrameThrower.js",
    "src/core/WazgHistory.js"
  ];

  const loaded = [];

  for (const path of modulePaths) {
    try {
      const text = await loadGitHubText(path);
      loaded.push(scoreModule(path, text));
    } catch (e) {
      // Silently skip missing modules
    }
  }

  return loaded
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

// ============================================================
// PROMPT RENDERING
// ============================================================

function renderMasterPrompt(continuity, bestModules, userPrompt = "") {
  const anchorSection = continuity.hasAnchor
    ? `[ANCHOR STATUS: Locked to frame 1 | Weight: ${continuity.anchorWeight} | Confidence: ${continuity.anchorConfidence}]`
    : `[ANCHOR STATUS: Free-form procedural generation | Drift: ${continuity.driftSensitivity}]`;

  const moduleStack = bestModules
    .slice(0, 3)
    .map(m => `  • ${m.category}: ${m.filename}`)
    .join("\n");

  return [
    `MASTER SUBJECT: ${userPrompt || "Entity"}`,
    `[Structure: mechanical/biological hybrid array]`,
    `[Timeline: Kinematic phase frame ${continuity.frameIndex}]`,
    anchorSection,
    `[Motion complexity: ${continuity.driftSensitivity}]`,
    `[Decay strategy: ${continuity.decayCurve} easing over ${Math.ceil(45)} frames]`,
    `[Module stack:]`,
    moduleStack,
    `[Aesthetic: Gritty dirty cartoon, severe high-contrast, fully realized physics]`
  ].join("\n");
}

// ============================================================
// FULL ANALYSIS ENGINE (for Perchance)
// ============================================================

async function runFullAnalysis(userConfig = {}) {
  const config = {
    frameIndex: userConfig.frameIndex ?? 12,
    frame1Image: userConfig.frame1Image ?? true,
    motionIntensity: userConfig.motionIntensity ?? 0.74,
    visualNoise: userConfig.visualNoise ?? 0.28,
    anchorStrength: userConfig.anchorStrength ?? 1.0,
    anchorFadeFrames: userConfig.anchorFadeFrames ?? 45,
    easeMode: userConfig.easeMode ?? "quadratic",
    userPrompt: userConfig.userPrompt ?? ""
  };

  const continuity = new AdaptiveBlindContinuity(config);
  const model = continuity.compute();
  const recommendations = continuity.getRecommendations();
  const bestModules = await selectBestModules(4);
  const prompt = renderMasterPrompt(model, bestModules, config.userPrompt);

  return {
    config,
    model,
    recommendations,
    bestModules,
    prompt,
    summary: {
      mode: model.mode,
      anchorWeight: model.anchorWeight,
      anchorConfidence: model.anchorConfidence,
      driftSensitivity: model.driftSensitivity,
      recommendations
    }
  };
}

// ============================================================
// EXPORTS (for Node.js / Module Systems)
// ============================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadGitHubText,
    scoreModule,
    AdaptiveBlindContinuity,
    selectBestModules,
    renderMasterPrompt,
    runFullAnalysis
  };
}

// Expose globally for Perchance
if (typeof window !== "undefined") {
  window.WazOsAnalyzer = {
    loadGitHubText,
    scoreModule,
    AdaptiveBlindContinuity,
    selectBestModules,
    renderMasterPrompt,
    runFullAnalysis
  };
}
