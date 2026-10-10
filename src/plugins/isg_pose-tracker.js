/**
 * isg_pose-tracker.js
 * MediaPipe pose integration for WazOs blind continuity tracking.
 *
 * This module tracks live body landmarks and translates them into a continuity-ready
 * payload that can be consumed by the WazOs rigging and motion modules.
 */

export default class PoseTrackerPlugin {
  constructor() {
    this.metadata = {
      name: "Pose Tracker",
      id: "wazg_pose_tracker",
      version: "1.0.0"
    };

    this.poseInstance = null;
    this.lastLandmarks = null;
    this.lastTimestamp = 0;
    this.videoElement = null;
  }

  static async ensurePoseLib() {
    if (typeof window === "undefined") {
      return null;
    }

    if (!window.Pose) {
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-pose-tracker="true"]');
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@latest";
        script.setAttribute("data-pose-tracker", "true");
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return window.Pose;
  }

  async attach(videoElement, options = {}) {
    if (!videoElement) throw new Error("PoseTrackerPlugin.attach requires a video element.");

    const Pose = await PoseTrackerPlugin.ensurePoseLib();
    if (!Pose) throw new Error("MediaPipe Pose library unavailable in this environment.");

    this.videoElement = videoElement;

    if (!this.poseInstance) {
      this.poseInstance = new Pose.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      this.poseInstance.setOptions({
        modelComplexity: options.modelComplexity ?? 1,
        selfieMode: options.selfieMode ?? true,
        enableSegmentation: options.enableSegmentation ?? false,
        smoothLandmarks: options.smoothLandmarks ?? true,
        minDetectionConfidence: options.minDetectionConfidence ?? 0.5,
        minTrackingConfidence: options.minTrackingConfidence ?? 0.5
      });
    }

    this.poseInstance.onResults = (results) => {
      const landmarks = results.poseLandmarks || [];
      const worldLandmarks = results.poseWorldLandmarks || [];

      const tracked = PoseTrackerPlugin.mapPoseToContinuity(landmarks, worldLandmarks, this.lastLandmarks);
      this.lastLandmarks = landmarks;
      this.lastTimestamp = Date.now();

      if (typeof options.onFrame === "function") {
        options.onFrame({
          landmarks,
          worldLandmarks,
          continuity: tracked
        });
      }
    };

    return this.poseInstance;
  }

  async start(videoElement, options = {}) {
    const pose = await this.attach(videoElement, options);
    const stream = options.stream || await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: options.facingMode ?? "user",
        width: options.width ?? 640,
        height: options.height ?? 480
      },
      audio: false
    });

    if (videoElement.srcObject !== stream) {
      videoElement.srcObject = stream;
    }

    await videoElement.play();

    const tick = async () => {
      if (videoElement.readyState >= 2 && pose && pose.send) {
        await pose.send({ image: videoElement });
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return { pose, stream };
  }

  static summarizeKeypoints(landmarks = []) {
    const valid = landmarks.filter((lm) => lm && typeof lm.x === "number");

    if (valid.length === 0) {
      return {
        visibility: 0,
        centerX: 0,
        centerY: 0,
        dominantPoint: null,
        totalLandmarks: 0
      };
    }

    const centerX = valid.reduce((sum, lm) => sum + lm.x, 0) / valid.length;
    const centerY = valid.reduce((sum, lm) => sum + lm.y, 0) / valid.length;
    const averageVisibility = valid.reduce((sum, lm) => sum + (lm.visibility ?? 1), 0) / valid.length;

    const nose = valid[0] || null;

    return {
      visibility: Number(averageVisibility.toFixed(4)),
      centerX: Number(centerX.toFixed(4)),
      centerY: Number(centerY.toFixed(4)),
      dominantPoint: nose,
      totalLandmarks: valid.length
    };
  }

  static mapPoseToContinuity(current = [], world = [], previous = []) {
    const curr = PoseTrackerPlugin.summarizeKeypoints(current);
    const prev = PoseTrackerPlugin.summarizeKeypoints(previous);

    const deltaX = current.length && prev.centerX !== undefined
      ? Number((curr.centerX - prev.centerX).toFixed(4))
      : 0;

    const deltaY = current.length && prev.centerY !== undefined
      ? Number((curr.centerY - prev.centerY).toFixed(4))
      : 0;

    const velocity = Math.hypot(deltaX, deltaY);
    const motionEnergy = Number((velocity * 100).toFixed(4));

    const stability = current.length
      ? Number(Math.max(0, 1 - velocity * 4).toFixed(4))
      : 0;

    return {
      poseSummary: curr,
      deltaX,
      deltaY,
      velocity,
      motionEnergy,
      stability,
      continuityMode: stability > 0.7 ? "stable" : stability > 0.35 ? "adaptive" : "volatile",
      worldLandmarks: world.length,
      landmarkCount: current.length,
      trackedFrame: current.length > 0
    };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    const videoElement = context.videoElement || document.querySelector("video");

    if (!videoElement) {
      return {
        ...packet,
        poseTrackerStatus: "No video target found",
        poseTracking: false,
        continuity: { continuityMode: "offline" }
      };
    }

    try {
      const pose = await this.attach(videoElement, {
        onFrame: ({ continuity }) => {
          context.terminal(`POSE: continuity=${continuity.continuityMode} velocity=${continuity.velocity}`);
        }
      });

      const current = this.lastLandmarks || [];
      const continuity = PoseTrackerPlugin.mapPoseToContinuity(current, [], packet.lastLandmarks || []);

      return {
        ...packet,
        poseTrackerStatus: "Pending live loop",
        poseTracking: true,
        pose: {
          landmarks: current,
          continuity
        },
        continuity
      };
    } catch (error) {
      return {
        ...packet,
        poseTrackerStatus: error.message,
        poseTracking: false,
        continuity: { continuityMode: "error", error: error.message }
      };
    }
  }
}

if (typeof window !== "undefined") {
  window.PoseTrackerPlugin = PoseTrackerPlugin;
}
