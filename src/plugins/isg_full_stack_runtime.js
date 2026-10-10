/**
 * isg_full_stack_runtime.js
 * Unified full-stack WazOs runtime
 *
 * Includes:
 * - pose tracking
 * - pose-to-rig motion mapping
 * - audio beat sync
 * - gait motion
 * - camera motion
 * - lighting
 * - IP style
 * - final compiler output
 *
 * This module acts as a practical orchestrator for the system.
 */

export default class WazOsFullStackRuntime {
  constructor() {
    this.metadata = {
      name: "WazOs Full Stack Runtime",
      id: "wazg_full_stack_runtime",
      version: "1.0.0"
    };

    this.poseTracker = null;
    this.audioEngine = null;
    this.frameIndex = 0;
  }

  static clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  static average(list = []) {
    if (!list.length) return 0;
    return list.reduce((sum, v) => sum + v, 0) / list.length;
  }

  async initPoseTracker(videoEl) {
    if (!window.Pose) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("MediaPipe Pose failed to load"));
        document.head.appendChild(script);
      });
    }

    this.poseTracker = new window.Pose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    this.poseTracker.setOptions({
      modelComplexity: 1,
      selfieMode: true,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 },
      audio: false
    });

    videoEl.srcObject = stream;
    await videoEl.play();

    const camera = new window.Camera(videoEl, {
      onFrame: async () => {
        await this.poseTracker.send({ image: videoEl });
      },
      width: 640,
      height: 480
    });

    camera.start();

    this.poseTracker.onResults((results) => {
      const landmarks = results.poseLandmarks || [];
      if (this.onPoseFrame) {
        this.onPoseFrame(landmarks);
      }
    });

    return this.poseTracker;
  }

  async initAudio(audioEl) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio API unsupported");

    this.audioEngine = {
      ctx: new AudioCtx(),
      analyser: null,
      source: null,
      beatTimes: [],
      lastBeat: 0,
      bpm: 120
    };

    this.audioEngine.analyser = this.audioEngine.ctx.createAnalyser();
    this.audioEngine.analyser.fftSize = 2048;
    this.audioEngine.analyser.smoothingTimeConstant = 0.85;

    this.audioEngine.source = this.audioEngine.ctx.createMediaElementSource(audioEl);
    this.audioEngine.source.connect(this.audioEngine.analyser);
    this.audioEngine.analyser.connect(this.audioEngine.ctx.destination);

    return this.audioEngine;
  }

  detectAudioBeat() {
    if (!this.audioEngine || !this.audioEngine.analyser) return null;

    const data = new Uint8Array(this.audioEngine.analyser.frequencyBinCount);
    this.audioEngine.analyser.getByteFrequencyData(data);

    let energy = 0;
    for (let i = 0; i < 60; i++) energy += data[i];
    const normalized = (energy / 60) / 255;

    const now = performance.now();
    const beatThreshold = 0.22;

    if (normalized > beatThreshold && now - this.audioEngine.lastBeat > 180) {
      this.audioEngine.lastBeat = now;
      const beatTime = this.audioEngine.ctx.currentTime;
      this.audioEngine.beatTimes.push(beatTime);

      const diffs = [];
      for (let i = 1; i < this.audioEngine.beatTimes.length; i++) {
        diffs.push(this.audioEngine.beatTimes[i] - this.audioEngine.beatTimes[i - 1]);
      }

      const avg = diffs.length
        ? diffs.reduce((sum, v) => sum + v, 0) / diffs.length
        : 0.4;

      this.audioEngine.bpm = avg > 0 ? 60 / avg : 120;

      return {
        energy: Number(normalized.toFixed(4)),
        timestamp: beatTime,
        bpm: Number(this.audioEngine.bpm.toFixed(2))
      };
    }

    return null;
  }

  derivePoseRig(landmarks = [], previous = []) {
    if (!landmarks.length) return null;

    const centroid = (points) => {
      const valid = points.filter((p) => p && typeof p.x === "number");
      if (!valid.length) return { x: 0, y: 0, z: 0 };
      return {
        x: valid.reduce((sum, p) => sum + p.x, 0) / valid.length,
        y: valid.reduce((sum, p) => sum + p.y, 0) / valid.length,
        z: valid.reduce((sum, p) => sum + (p.z ?? 0), 0) / valid.length
      };
    };

    const curr = centroid(landmarks);
    const prevC = centroid(previous.length ? previous : landmarks);

    const dx = curr.x - prevC.x;
    const dy = curr.y - prevC.y;
    const dz = curr.z - prevC.z;

    const magnitude = Math.hypot(dx, dy, dz);

    return {
      torsoCenter: curr,
      delta: { x: dx, y: dy, z: dz, magnitude: Number(magnitude.toFixed(4)) },
      continuityMode: magnitude > 0.12 ? "dynamic" : "stable",
      anchorBias: Math.max(0, 1 - magnitude * 2)
    };
  }

  calculateGait(packet = {}) {
    const beatEnergy = packet.beatSync?.beat?.energy ?? 0;
    const impactVelocity = packet.vectorCalculations?.impactVelocity ?? 0;
    const motionScale = packet.poseRig?.delta?.magnitude ?? 0.3;

    const frameIndex = packet.activeFrame ?? 0;
    const phase = (frameIndex % 720) / 720;

    const gait = {
      impactVelocity: Number((Math.sin(phase * Math.PI * 16) * (12 + motionScale * 18)).toFixed(4)),
      torsionWarp: Number((Math.cos(phase * Math.PI * 8) * (1 + beatEnergy * 4)).toFixed(4)),
      cyclePhaseProgress: Number(phase.toFixed(6)),
      velocityBoost: Number((1 + beatEnergy * 0.7 + motionScale).toFixed(4))
    };

    return gait;
  }

  getLightingProfile(packet = {}) {
    const motion = packet.vectorCalculations?.impactVelocity ?? 0;
    const beatEnergy = packet.beatSync?.beat?.energy ?? 0;
    const mood = beatEnergy > 0.3 ? "neon-pulse" : motion > 8 ? "dramatic-rimlight" : "soft-halo";

    const map = {
      "soft-halo": {
        keyLight: "warm overhead key light, diffused",
        rimLight: "faint cyan edge light",
        shadow: "soft shadow falloff",
        colorTemp: "5600K daylight warmth",
        contrast: "balanced cinematic"
      },
      "dramatic-rimlight": {
        keyLight: "low-angle key light, high contrast",
        rimLight: "intense warm rim on silhouette",
        shadow: "hard shadow pockets",
        colorTemp: "4200K amber tungsten",
        contrast: "high dynamic range"
      },
      "neon-pulse": {
        keyLight: "cool cyan to magenta pulse light",
        rimLight: "flickering edge glow with rhythmic strobe",
        shadow: "soft but energized",
        colorTemp: "6500K with magenta bias",
        contrast: "high contrast pulse rhythm"
      }
    };

    const chosen = map[mood] || map["soft-halo"];

    return {
      mood,
      ...chosen,
      intensity: Number((0.55 + beatEnergy * 0.8 + motion / 80).toFixed(4))
    };
  }

  getCameraMotion(packet = {}) {
    const motion = packet.vectorCalculations?.impactVelocity ?? 0;
    const beatEnergy = packet.beatSync?.beat?.energy ?? 0;

    if (beatEnergy > 0.3) {
      return {
        lens: "14mm ultra-wide",
        orbit: "rapid dolly with side push",
        parallax: "deep separation and rhythm",
        motionBias: 1.2
      };
    }
    if (motion > 14) {
      return {
        lens: "14mm ultra-wide",
        orbit: "aggressive orbit with top-down drift",
        parallax: "deep layering and severe contrast",
        motionBias: 1.0
      };
    }
    return {
      lens: "35mm neutral",
      orbit: "slow orbit, subtle dolly in",
      parallax: "gentle separation and atmosphere",
      motionBias: 0.8
    };
  }

  compileFinalPrompt(packet = {}) {
    const beatSync = packet.beatSync || {};
    const poseRig = packet.poseRig || {};
    const gait = packet.gait || {};
    const camera = packet.cameraMotion || {};
    const lighting = packet.lightingProfile || {};
    const style = packet.styleProfile || "visual DNA injection";

    return [
      "MASTER SUBJECT: Dynamic continuity scene",
      `[Structure: mechanical/biological hybrid array]`,
      `[Timeline: Kinematic phase frame ${packet.activeFrame ?? 0}]`,
      `[Camera: ${camera.orbit || "neutral orbit"} | Lens ${camera.lens || "35mm"} | Parallax ${camera.parallax || "moderate"}]`,
      `[Lighting: ${lighting.mood || "soft-halo"} | ${lighting.keyLight || "warm key"}]`,
      `[Motion: impact ${gait.impactVelocity ?? 0} | torsion ${gait.torsionWarp ?? 0}]`,
      `[Audio: BPM ${(packet.audioBpm || 120).toFixed(2)} | Beat ${beatSync.beatDetected ? "detected" : "idle"}]`,
      `[Pose Rig: continuity ${poseRig.continuityMode || "stable"} | anchor ${poseRig.anchorBias ?? 0}]`,
      `[Style: ${style}]`,
      "[Aesthetic: gritty dirty cartoon, severe high-contrast, fully realized physics]"
    ].join("\n");
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    const currentPose = packet.poseLandmarks || [];

    let poseRig = packet.poseRig || null;
    if (currentPose.length) {
      poseRig = this.derivePoseRig(currentPose, packet.previousPoseLandmarks || []);
    }

    const beatSync = packet.beatSync || {};
    let audioBeat = null;
    if (this.audioEngine) {
      audioBeat = this.detectAudioBeat();
    }

    const frameIndex = packet.activeFrame ?? 0;

    const motionPacket = {
      ...packet,
      activeFrame: frameIndex,
      poseRig: poseRig || { continuityMode: "stable", anchorBias: 0.8 },
      beatSync: {
        ...(beatSync || {}),
        beatDetected: !!audioBeat,
        beat: audioBeat || beatSync.beat || null,
        mode: audioBeat ? "loop-locked" : "free-run",
        loopActive: packet.beatSync?.loopActive || false
      },
      vectorCalculations: {
        impactVelocity: packet.vectorCalculations?.impactVelocity ?? 0,
        torsionWarp: packet.vectorCalculations?.torsionWarp ?? 0
      }
    };

    const gait = this.calculateGait(motionPacket);
    const lighting = this.getLightingProfile(motionPacket);
    const cameraMotion = this.getCameraMotion(motionPacket);
    const styleProfile = packet.styleProfile || "IP-Adapter visual DNA extraction";
    
    const finalPacket = {
      ...motionPacket,
      gait,
      lightingProfile: lighting,
      cameraMotion,
      styleProfile,
      audioBpm: motionPacket.beatSync?.beat?.bpm || packet.audioBpm || 120,
      finalPrompt: this.compileFinalPrompt({
        ...motionPacket,
        gait,
        lightingProfile: lighting,
        cameraMotion,
        styleProfile,
        audioBpm: motionPacket.beatSync?.beat?.bpm || packet.audioBpm || 120
      })
    };

    return finalPacket;
  }
}

if (typeof window !== "undefined") {
  window.WazOsFullStackRuntime = WazOsFullStackRuntime;
}
