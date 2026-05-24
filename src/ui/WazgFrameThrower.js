// =============================================
// WazgFrameThrower.js - With Interpolation Slider Support
// =============================================

window.WazgFrameThrower = {
  isRunning: false,
  frameBuffer: [],
  maxParallel: 3,
  animationInterval: null,
  fadeDuration: 280,        // Default interpolation strength (ms)

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("FRAME", "FrameThrower with adjustable interpolation loaded");
    }
  },

  throwFrames: async function(basePrompt, frameCount = 8) {
    if (this.isRunning) return [];
    this.isRunning = true;
    this.frameBuffer = [];

    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", `Generating ${frameCount} frames...`);

    const results = [];
    for (let i = 0; i < frameCount; i += this.maxParallel) {
      const batch = [];
      const end = Math.min(i + this.maxParallel, frameCount);
      for (let j = i; j < end; j++) {
        batch.push(this.fetchImage(basePrompt, j));
      }
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      this.frameBuffer.push(...batchResults);
    }

    this.isRunning = false;
    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Generation complete");
    return results;
  },

  fetchImage: async function(basePrompt, index) {
    try {
      const seed = Date.now() + index * 73;
      const url = `https://picsum.photos/id/${(seed % 900) + 100}/800/600`;
      await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
      return { frame: index, url: url, prompt: basePrompt };
    } catch (e) {
      return { frame: index, url: `https://picsum.photos/800/600?random=${Date.now()}`, prompt: basePrompt };
    }
  },

  playAnimation: function(fps = 10) {
    this.stopAnimation();
    if (this.frameBuffer.length < 2) return;

    const svg = document.getElementById("waz-svg-canvas");
    if (!svg) return;

    let index = 0;
    const intervalTime = 1000 / fps;

    this.animationInterval = setInterval(() => {
      const current = this.frameBuffer[index % this.frameBuffer.length];
      const next = this.frameBuffer[(index + 1) % this.frameBuffer.length];

      svg.innerHTML = `
        <image href="${current.url}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" 
               style="opacity:1; transform:scale(1); transition: all ${this.fadeDuration}ms ease-out;"/>
        <image href="${next.url}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" 
               style="opacity:0; transform:scale(1.08); transition: all ${this.fadeDuration}ms ease-out;"/>
        <text x="25" y="45" fill="#00ff88" font-size="16" font-weight="bold">Keyframe ${current.frame + 1}</text>
      `;

      setTimeout(() => {
        const images = svg.querySelectorAll('image');
        if (images.length === 2) {
          images[0].style.opacity = '0';
          images[0].style.transform = 'scale(0.94)';
          images[1].style.opacity = '1';
          images[1].style.transform = 'scale(1)';
        }
      }, 50);

      index++;
    }, intervalTime);
  },

  stopAnimation: function() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  },

  clear: function() {
    this.stopAnimation();
    this.frameBuffer = [];
  },

  // Public method for slider control
  setInterpolationStrength: function(ms) {
    this.fadeDuration = Math.max(80, Math.min(ms, 800)); // limit between 80ms and 800ms
    if (window.WazgLogcat) {
      window.WazgLogcat.log("FRAME", `Interpolation strength set to ${this.fadeDuration}ms`);
    }
  }
};
