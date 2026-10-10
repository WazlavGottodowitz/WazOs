/**
 * isg_019_audio_beat_sync.js
 * WazOs audio driver for waz-2-frames.
 *
 * Adds:
 * - Web Audio API analysis
 * - beat detection / BPM estimation
 * - loop start/end selection
 * - beat-keyframe sync and shuffle
 * - integration into WazOs continuity pipeline
 */

export default class AudioBeatSyncMatrix {
  constructor() {
    this.metadata = {
      name: "Audio Beat Sync / Loop Engine",
      id: "wazg_audio_beat_sync_019"
    };

    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.isPlaying = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.beatTimestamps = [];
    this.lastBeatTime = 0;
    this.bpm = 120;
    this.lastEnergy = 0;
    this.peakThreshold = 0.2;
    this.analysisRunning = false;
  }

  async connectAudioElement(audioElement) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio API not supported in this browser.");

    this.audioContext = new AudioCtx();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    return this;
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  setLoop(startSeconds, endSeconds) {
    this.loopStart = Math.max(0, startSeconds || 0);
    this.loopEnd = Math.max(this.loopStart + 0.1, endSeconds || this.loopStart + 8);
    return { start: this.loopStart, end: this.loopEnd };
  }

  analyzeEnergy() {
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
    const lowBins = Math.min(40, this.bufferLength);
    for (let i = 0; i < lowBins; i++) {
      lowEnergy += this.dataArray[i];
    }

    const energy = lowEnergy / lowBins / 255;
    const now = performance.now();
    const delta = now - this.lastBeatTime;

    const threshold = this.peakThreshold + (this.lastEnergy * 0.2);
    const beatDetected = energy > threshold && delta > 150;

    if (beatDetected) {
      this.lastBeatTime = now;
      const beatTime = this.currentTimeInSeconds();
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

  currentTimeInSeconds() {
    return this.audioContext && this.audioContext.currentTime ? this.audioContext.currentTime : 0;
  }

  estimateBpmFromBeats() {
    if (this.beatTimestamps.length < 3) {
      return this.bpm;
    }

    const sampleWindow = this.beatTimestamps.slice(-8);
    let totalDt = 0;
    for (let i = 1; i < sampleWindow.length; i++) {
      totalDt += sampleWindow[i] - sampleWindow[i - 1];
    }

    const avgDt = totalDt / (sampleWindow.length - 1);
    const bpm = avgDt > 0 ? 60 / avgDt : this.bpm;
    this.bpm = Number(bpm.toFixed(2));
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

  shuffleBeatFrames(frameCount = 24, shuffleStrength = 0.5) {
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

    if (!this.audioContext) {
      return {
        ...packet,
        audioStatus: "No audio source connected",
        beatSync: { mode: "idle" }
      };
    }

    const beat = this.detectBeat();
    const bpm = this.estimateBpmFromBeats();
    const keyframes = this.syncKeyframesToBeat(packet.frameCount || 24);
    const shuffled = this.shuffleBeatFrames(packet.frameCount || 24, 0.4);

    const audioResult = {
      audioStatus: this.isPlaying ? "active" : "ready",
      bpm,
      beatDetected: !!beat,
      currentTime: this.currentTimeInSeconds(),
      loop: {
        start: this.loopStart,
        end: this.loopEnd
      },
      beat: beat || null,
      keyframes,
      shuffledKeyframes: shuffled,
      beatCount: this.beatTimestamps.length,
      mode: this.loopEnd > this.loopStart ? "loop-locked" : "free-run"
    };

    return {
      ...packet,
      audioStatus: audioResult.audioStatus,
      beatSync: audioResult,
      audioBpm: bpm,
      appliedBeatGrid: keyframes
    };
  }
}

if (typeof window !== "undefined") {
  window.AudioBeatSyncMatrix = AudioBeatSyncMatrix;
}
