window.WazgFrameThrower = {
  isRunning: false,
  frameBuffer: [],

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "FrameThrower ready");
  },

  throwFrames: async function(basePrompt, frameCount = 8) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.frameBuffer = [];

    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", `Generating ${frameCount} frames...`);

    for (let i = 0; i < frameCount; i++) {
      const url = `https://picsum.photos/id/${(Date.now() + i) % 900 + 100}/800/600`;
      this.frameBuffer.push({ frame: i, url: url });
      await new Promise(r => setTimeout(r, 300));
    }

    this.isRunning = false;
    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Generation complete");
  },

  playAnimation: function(fps = 10) {
    if (this.frameBuffer.length === 0) return;
    const svg = document.getElementById("waz-svg-canvas");
    let i = 0;
    setInterval(() => {
      if (i >= this.frameBuffer.length) return;
      svg.innerHTML = `<image href="${this.frameBuffer[i].url}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>`;
      i++;
    }, 1000 / fps);
  }
};
