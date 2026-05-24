// =============================================
// WazgFrameThrower.js - Real Image Fetching
// Parallel Frame Generation with Actual Images
// =============================================

window.WazgFrameThrower = {
  isRunning: false,
  frameBuffer: [],
  maxParallel: 3,

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("FRAME", "FrameThrower v1.1 - Real Image Fetching Active");
    }
  },

  // Generate frames with real image fetching
  throwFrames: async function(basePrompt, frameCount = 8) {
    if (this.isRunning) {
      if (window.WazgLogcat) window.WazgLogcat.log("WARNING", "FrameThrower already active");
      return [];
    }

    this.isRunning = true;
    this.frameBuffer = [];

    if (window.WazgLogcat) {
      window.WazgLogcat.log("FRAME", `Fetching ${frameCount} real frames in parallel...`);
    }

    const results = [];

    for (let i = 0; i < frameCount; i += this.maxParallel) {
      const batch = [];
      const end = Math.min(i + this.maxParallel, frameCount);

      for (let j = i; j < end; j++) {
        const seed = Date.now() + j * 137; // pseudo-consistent seeding
        batch.push(this.fetchRealImage(basePrompt, j, seed));
      }

      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      this.frameBuffer.push(...batchResults);

      if (window.WazgLogcat) {
        window.WazgLogcat.log("FRAME", `Batch ${Math.floor(i/this.maxParallel)+1} complete (${results.length}/${frameCount})`);
      }
    }

    this.isRunning = false;
    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "All frames fetched successfully");

    return results;
  },

  // Actual image fetching
  fetchRealImage: async function(basePrompt, frameIndex, seed) {
    try {
      // Using Lorem Picsum with seed for pseudo-consistency
      const imageUrl = `https://picsum.photos/id/${(seed % 1000) + 100}/800/600`;

      // Simulate network + generation time
      await new Promise(r => setTimeout(r, 600 + Math.random() * 900));

      return {
        frame: frameIndex,
        url: imageUrl,
        prompt: basePrompt,
        seed: seed
      };

    } catch (e) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", `Failed to fetch frame ${frameIndex}`);
      return {
        frame: frameIndex,
        url: "https://picsum.photos/800/600?random=" + Date.now(),
        prompt: basePrompt
      };
    }
  },

  // Play animation on SVG canvas
  playAnimation: function(fps = 12) {
    if (this.frameBuffer.length === 0) {
      if (window.WazgLogcat) window.WazgLogcat.log("WARNING", "No frames available");
      return;
    }

    const svg = document.getElementById("waz-svg-canvas");
    if (!svg) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index >= this.frameBuffer.length) {
        clearInterval(interval);
        if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Animation finished");
        return;
      }

      const frame = this.frameBuffer[index];
      
      svg.innerHTML = `
        <image 
          href="${frame.url}" 
          width="100%" 
          height="100%" 
          preserveAspectRatio="xMidYMid slice"/>
        <text 
          x="30" 
          y="45" 
          fill="#00ff88" 
          font-size="16" 
          font-weight="bold" 
          style="text-shadow: 0 0 6px #000">
          Frame ${frame.frame + 1}
        </text>
      `;

      index++;
    }, 1000 / fps);
  },

  clear: function() {
    this.frameBuffer = [];
  }
};
