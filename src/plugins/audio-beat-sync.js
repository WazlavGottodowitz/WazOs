export default class AudioBeatSyncMatrix {
  constructor() {
    this.metadata = {
      name: "Audio Beat Sync / Loop Engine",
      id: "wazg_audio_beat_sync",
      version: "1.0.0"
    };

    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.audioElement = null;
    this.dataArray = null;
    this.bufferLength = 0;

    this.isPlaying = false;
    this.analysisRunning = false;

    this.loopStart = 0;
    this.loopEnd = 0;

    this.beatTimestamps = [];
    this.lastBeatTime = 0;
    this.lastEnergy = 0;
    this.bpm = 120;
    this.peakThreshold = 0.22;
  }

  async connectAudioElement(audioElement) {
    if (!audioElement) {
      throw new Error("AudioBeatSyncMatrix.connectAudioElement requires an audio element.");
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error("Web Audio API is not supported in this browser.");
    }

    this.audioElement = audioElement;

    if (!this.audioContext) {
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    return this;
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  setLoop(startSeconds, endSeconds) {
    this.loopStart = Math.max(0, Number(startSeconds || 0));
    this.loopEnd = Math.max(this.loopStart + 0.1, Number(endSeconds || this.loopStart + 8));
    return { start: this.loopStart, end: this.loopEnd };
  }

  getCurrentTime() {
    return this.audioElement && this.audioElement.currentTime != null
      ? this.audioElement.currentTime
      : 0;
  }

  getDuration() {
    return this.audioElement && this.audioElement.duration
      ? this.audioElement.duration
      : 0;
  }

  estimateEnergy() {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    let total = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      total += this.dataArray[i];
    }

    const energy = total / this.bufferLength / 255;
    this.lastEnergy = energy;
    return energy;
  }

  detectBeat() {
    if (!this.analyser || !this.dataArray) return null;

    this.analyser.getByteFrequencyData(this.dataArray);

    let lowEnergy = 0;
    const lowBins = Math.min(60, this.bufferLength);
    for (let i = 0; i < lowBins; i++) {
      lowEnergy += this.dataArray[i];
    }

    const energy = lowEnergy / lowBins / 255;
    const now = performance.now();
    const delta = now - this.lastBeatTime;
    const threshold = this.peakThreshold + (this.lastEnergy * 0.18);
    const beatDetected = energy > threshold && delta > 150;

    if (beatDetected) {
      this.lastBeatTime = now;
      const beatTime = this.getCurrentTime();
      this.beatTimestamps.push(beatTime);

      return {
        energy,
        timestamp: beatTime,
        beatIndex: this.beatTimestamps.length - 1
      };
    }

    this.lastEnergy = energy;
    return null;
  }

  estimateBpmFromBeats() {
    if (this.beatTimestamps.length < 3) return this.bpm;

    const sample = this.beatTimestamps.slice(-8);
    let totalDelta = 0;

    for (let i = 1; i < sample.length; i++) {
      totalDelta += sample[i] - sample[i - 1];
    }

    const avgDelta = totalDelta / (sample.length - 1);
    this.bpm = avgDelta > 0 ? Number((60 / avgDelta).toFixed(2)) : this.bpm;
    return this.bpm;
  }

  syncKeyframesToBeat(frameCount = 24) {
    const beatTimes = this.beatTimestamps.length ? this.beatTimestamps : [0];
    const map = [];

    for (let i = 0; i < frameCount; i++) {
      const beatIndex = Math.min(
        beatTimes.length - 1,
        Math.floor((i / frameCount) * beatTimes.length)
      );

      map.push({
        frame: i,
        beatIndex,
        time: beatTimes[beatIndex] ?? 0,
        phase: (i / frameCount) * 100
      });
    }

    return map;
  }

  shuffleBeatFrames(frameCount = 24, shuffleStrength = 0.35) {
    const keyframes = this.syncKeyframesToBeat(frameCount);
    return keyframes.map((frame, index) => {
      const jitter = (Math.random() - 0.5) * shuffleStrength;
      return {
        ...frame,
        frame: index,
        phase: Math.max(0, Math.min(100, frame.phase + jitter * 100))
      };
    });
  }

  startAnalysisLoop() {
    if (this.analysisRunning) return;
    this.analysisRunning = true;

    const tick = () => {
      if (!this.analysisRunning) return;

      const beat = this.detectBeat();
      if (beat) {
        this.estimateBpmFromBeats();
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  stopAnalysisLoop() {
    this.analysisRunning = false;
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};

    if (!this.audioContext || !this.analyser) {
      return {
        ...packet,
        audioStatus: "No audio source connected",
        beatSync: { mode: "idle" }
      };
    }

    const beat = this.detectBeat();
    const bpm = this.estimateBpmFromBeats();
    const frameCount = packet.frameCount || 24;
    const keyframes = this.syncKeyframesToBeat(frameCount);
    const shuffled = this.shuffleBeatFrames(frameCount, 0.35);

    const now = this.getCurrentTime();
    const inLoop = this.loopEnd > this.loopStart && now >= this.loopStart && now <= this.loopEnd;

    const result = {
      audioStatus: this.isPlaying ? "active" : "ready",
      bpm,
      beatDetected: !!beat,
      currentTime: now,
      loop: { start: this.loopStart, end: this.loopEnd },
      loopActive: inLoop,
      beat: beat || null,
      keyframes,
      shuffledKeyframes: shuffled,
      beatCount: this.beatTimestamps.length,
      mode: inLoop ? "loop-locked" : "free-run"
    };

    return {
      ...packet,
      audioStatus: result.audioStatus,
      beatSync: result,
      audioBpm: bpm,
      beatGrid: keyframes,
      loopSelection: { start: this.loopStart, end: this.loopEnd }
    };
  }
}

if (typeof window !== "undefined") {
  window.AudioBeatSyncMatrix = AudioBeatSyncMatrix;
}
