window.WazgBridge = {
  state: {
    prompt: '',
    style: '',
    negative: '',
    resolution: '768x768',
    batch: 1,
    zoom: 100
  },

  init: function() {
    try {
      if (window.WazgManager && typeof window.WazgManager.init === 'function') {
        window.WazgManager.init();
      }
      if (window.WazgAnatomy && typeof window.WazgAnatomy.init === 'function') {
        window.WazgAnatomy.init();
      }
    } catch (error) {
      console.warn('WazgBridge init warning:', error);
    }
  },

  renderPreview: function(src, state) {
    this.state = Object.assign({}, this.state, state || {});
    const previewIds = ['render-image', 'render-image-control', 'render-image-advanced'];
    previewIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.src = src;
    });
  },

  generate: function(prompt) {
    const payload = Object.assign({}, this.state, {
      prompt: prompt || this.state.prompt || 'A cybernetic skull with neon green tubes, highly detailed, cinematic lighting',
      style: this.state.style || '',
      negative: this.state.negative || 'blurry, low quality, watermark, text',
      resolution: this.state.resolution || '768x768',
      batch: Number(this.state.batch || 1),
      zoom: Number(this.state.zoom || 100)
    });

    const [width, height] = (payload.resolution || '768x768').split('x');
    const encodedPrompt = encodeURIComponent(payload.prompt);
    const previewUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Date.now()}&model=flux&nologo=true`;

    this.renderPreview(previewUrl, payload);

    if (window.WazgManager && typeof window.WazgManager.dispatch === 'function') {
      try {
        window.WazgManager.dispatch('ADD_NODE', { x: Math.random() * 500, y: Math.random() * 300 }, null);
      } catch (error) {
        console.warn('WazgBridge generate dispatch warning:', error);
      }
    }

    return previewUrl;
  }
};
