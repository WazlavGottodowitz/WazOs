// isg_pose_tracker.js
// Browser-only MediaPipe Pose tracker for WazOs

class PoseTracker {
  constructor(options = {}) {
    this.options = {
      modelComplexity: 1,
      selfieMode: true,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      facingMode: "user",
      width: 640,
      height: 480,
      ...options
    };

    this.pose = null;
    this.camera = null;
    this.video = null;
    this.lastLandmarks = [];
    this.frameCounter = 0;
  }

  async ensureMediaPipe() {
    if (window.Pose) return true;

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("MediaPipe Pose failed to load"));
      document.head.appendChild(script);
    });

    return !!window.Pose;
  }

  async start(videoElement) {
    if (!videoElement) {
      throw new Error("A video element is required.");
    }

    this.video = videoElement;

    await this.ensureMediaPipe();

    this.pose = new window.Pose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    this.pose.setOptions({
      modelComplexity: this.options.modelComplexity,
      selfieMode: this.options.selfieMode,
      smoothLandmarks: this.options.smoothLandmarks,
      minDetectionConfidence: this.options.minDetectionConfidence,
      minTrackingConfidence: this.options.minTrackingConfidence
    });

    this.pose.onResults((results) => {
      const landmarks = results.poseLandmarks || [];
      this.lastLandmarks = landmarks;
      this.frameCounter += 1;

      const summary = this.summarize(landmarks);

      if (this.onFrame) {
        this.onFrame({
          landmarks,
          summary,
          frameIndex: this.frameCounter
        });
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: this.options.facingMode,
        width: this.options.width,
        height: this.options.height
      },
      audio: false
    });

    this.video.srcObject = stream;
    await this.video.play();

    this.camera = new window.Camera(this.video, {
      onFrame: async () => {
        await this.pose.send({ image: this.video });
      },
      width: this.options.width,
      height: this.options.height
    });

    this.camera.start();
    return this;
  }

  summarize(landmarks = []) {
    if (!landmarks.length) {
      return {
        visibility: 0,
        motion: 0,
        centerX: 0,
        centerY: 0,
        keypoints: 0
      };
    }

    const valid = landmarks.filter((p) => p && typeof p.x === "number");
    const centerX = valid.reduce((sum, p) => sum + p.x, 0) / valid.length;
    const centerY = valid.reduce((sum, p) => sum + p.y, 0) / valid.length;
    const visibility = valid.reduce((sum, p) => sum + (p.visibility ?? 1), 0) / valid.length;

    return {
      visibility: Number(visibility.toFixed(4)),
      centerX: Number(centerX.toFixed(4)),
      centerY: Number(centerY.toFixed(4)),
      keypoints: valid.length
    };
  }

  getLatestLandmarks() {
    return this.lastLandmarks;
  }

  stop() {
    if (this.camera) this.camera.stop();
    if (this.video?.srcObject) {
      this.video.srcObject.getTracks().forEach((track) => track.stop());
    }
  }
        }
