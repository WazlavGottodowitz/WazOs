// =====================================================================
// WazOS // CANVAS VIDEO SYNTHESIZER & AUDIO INJECTOR (inkl. Onion Skin)
// =====================================================================

export class VideoSynth {
  constructor(timelineStore) {
    this.timeline = timelineStore;
    this.fps = 12; 
    this.isPlaying = false;
    this.playbackInterval = null;
    this.currentIndex = 0;
    
    this.canvas = document.getElementById('synth-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.audioToggle = document.getElementById('synth-audio-toggle');
    this.onionToggle = document.getElementById('synth-onion-toggle');
    this.bpmSlider = document.getElementById('synth-bpm-slider');
    this.bpmReadout = document.getElementById('synth-bpm-readout');

    if (this.bpmSlider) {
      this.bpmSlider.addEventListener('input', (e) => {
        if (this.bpmReadout) this.bpmReadout.textContent = e.target.value;
      });
    }

    this.audioCtx = null;
    this.audioDestination = null;
  }

  initAudioEngine() {
    if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioDestination = this.audioCtx.createMediaStreamDestination();
    return this.audioDestination;
  }

  createAcidKick(time) {
    if (!this.audioCtx) return;
    
    // Acid Kick
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioDestination);
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);

    // TB-303 Style Bass
    const bassOsc = this.audioCtx.createOscillator();
    const bassGain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();
    bassOsc.type = 'sawtooth';
    bassOsc.connect(filter);
    filter.connect(bassGain);
    bassGain.connect(this.audioDestination);

    const freqs = [55, 55, 65, 55]; 
    const step = Math.floor(time * 4) % 4;
    bassOsc.frequency.setValueAtTime(freqs[step], time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.random() * 2000 + 400, time); 
    filter.Q.value = 10; 
    bassGain.gain.setValueAtTime(0.3, time);
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    bassOsc.start(time);
    bassOsc.stop(time + 0.2);
  }

  async cacheFrames() {
    const frames = this.timeline.all();
    if (frames.length === 0) return [];
    
    const imagePromises = frames.map(frame => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.onload = () => resolve(img);
        img.src = frame.url;
      });
    });
    return Promise.all(imagePromises);
  }

  drawFrameWithOnion(images, index) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const useOnion = this.onionToggle ? this.onionToggle.checked : false;

    // Previous Frame (Ghost)
    if (useOnion && index > 0) {
      this.ctx.globalAlpha = 0.35;
      this.ctx.drawImage(images[index - 1], 0, 0, this.canvas.width, this.canvas.height);
    }

    // Current Frame (Solid)
    this.ctx.globalAlpha = 1.0;
    this.ctx.drawImage(images[index], 0, 0, this.canvas.width, this.canvas.height);

    // Next Frame (Ghost)
    if (useOnion && index < images.length - 1) {
      this.ctx.globalAlpha = 0.35;
      this.ctx.drawImage(images[index + 1], 0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.globalAlpha = 1.0; 
  }

  async play() {
    if (this.isPlaying || !this.ctx) return;
    const images = await this.cacheFrames();
    if (images.length === 0) return;

    this.canvas.width = images[0].width;
    this.canvas.height = images[0].height;
    this.isPlaying = true;
    this.currentIndex = 0;

    this.playbackInterval = setInterval(() => {
      this.drawFrameWithOnion(images, this.currentIndex);
      this.currentIndex++;
      if (this.currentIndex >= images.length) this.currentIndex = 0;
    }, 1000 / this.fps);
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.playbackInterval);
  }

  async exportWebM() {
    const images = await this.cacheFrames();
    if (images.length < 2) return null;

    return new Promise((resolve) => {
      this.canvas.width = images[0].width;
      this.canvas.height = images[0].height;

      const canvasStream = this.canvas.captureStream(this.fps);
      const tracks = [canvasStream.getVideoTracks()[0]];

      const injectAudio = this.audioToggle ? this.audioToggle.checked : false;
      let bpmInterval = null;

      if (injectAudio) {
        const dest = this.initAudioEngine();
        tracks.push(dest.stream.getAudioTracks()[0]);
        const bpm = this.bpmSlider ? parseInt(this.bpmSlider.value) : 140;
        bpmInterval = setInterval(() => this.createAcidKick(this.audioCtx.currentTime), (60 / bpm) * 1000);
      }

      const combinedStream = new MediaStream(tracks);
      const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9' });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        if (bpmInterval) clearInterval(bpmInterval); 
        resolve(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })));
      };

      recorder.start();
      let renderIndex = 0;
      
      const renderInterval = setInterval(() => {
        this.drawFrameWithOnion(images, renderIndex); 
        renderIndex++;
        if (renderIndex >= images.length) {
          clearInterval(renderInterval);
          setTimeout(() => recorder.stop(), 500); 
        }
      }, 1000 / this.fps); 
    });
  }
}
