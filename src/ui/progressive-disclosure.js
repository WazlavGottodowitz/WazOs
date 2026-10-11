(function() {
  const demoPrompts = [
    'A cybernetic skull with neon green tubes, highly detailed, cinematic lighting, dark background',
    'A biomechanical fox with glowing joints, futuristic armor, anime style',
    'A steampunk robot mechanic with brass details, intricate design, studio lighting'
  ];

  const state = {
    mode: 'beginner',
    activeTab: 'studio',
    prompt: '',
    style: '',
    resolution: '768x768',
    negative: 'blurry, low quality, watermark, text, distorted',
    batch: 1,
    zoom: 100
  };

  function initModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        renderMode();
      });
    });
  }

  function renderMode() {
    document.querySelectorAll('.mode-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.mode === state.mode);
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.mode);
    });

    const statusPill = document.getElementById('mode-status');
    if (statusPill) {
      statusPill.textContent = state.mode === 'beginner' ? 'simple' : state.mode === 'control' ? 'control' : 'advanced';
    }
  }

  function setPromptValue(value) {
    const fields = [
      document.getElementById('prompt-beginner'),
      document.getElementById('prompt-control'),
      document.getElementById('prompt-advanced')
    ].filter(Boolean);

    fields.forEach(field => {
      field.value = value;
    });

    state.prompt = value;
  }

  function buildPrompt() {
    const base = (state.prompt || '').trim();
    if (!base) return '';

    const styleText = state.style ? `, ${state.style}` : '';
    const negativeText = state.negative ? state.negative : '';
    return {
      prompt: `${base}${styleText}`,
      negative: negativeText,
      resolution: state.resolution
    };
  }

  function refreshRenderOutput() {
    const img = document.getElementById('render-image');
    const { prompt, resolution } = buildPrompt();
    if (!prompt) {
      img.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
      return;
    }

    const encoded = encodeURIComponent(prompt);
    img.src = `https://image.pollinations.ai/prompt/${encoded}?width=${resolution.split('x')[0]}&height=${resolution.split('x')[1]}&seed=${Date.now()}&model=flux&nologo=true`;
  }

  function bindGenerateButtons() {
    document.querySelectorAll('[data-generate]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = (document.getElementById('prompt-beginner') || document.getElementById('prompt-control') || document.getElementById('prompt-advanced') || { value: '' }).value.trim();
        state.prompt = prompt || demoPrompts[0];

        if (state.prompt) {
          setPromptValue(state.prompt);
        }

        const resolved = buildPrompt();
        if (!resolved || !resolved.prompt) {
          setPromptValue(demoPrompts[0]);
        }

        refreshRenderOutput();
        updateStatus('rendering');
        setTimeout(() => updateStatus('ready'), 1000);
      });
    });
  }

  function updateStatus(type) {
    const el = document.getElementById('generation-status');
    if (!el) return;

    if (type === 'rendering') {
      el.textContent = 'Generating…';
      el.className = 'status-text loading';
      return;
    }

    el.textContent = 'Ready to render';
    el.className = 'status-text ready';
  }

  function syncPromptFromControls() {
    const promptField = document.getElementById('prompt-control') || document.getElementById('prompt-beginner') || document.getElementById('prompt-advanced');
    if (promptField) {
      state.prompt = promptField.value;
    }

    const styleField = document.getElementById('style-control');
    if (styleField) state.style = styleField.value;

    const resField = document.getElementById('resolution-control');
    if (resField) state.resolution = resField.value;

    const negField = document.getElementById('negative-control');
    if (negField) state.negative = negField.value;

    const batchField = document.getElementById('batch-control');
    if (batchField) state.batch = Number(batchField.value || 1);

    const zoomField = document.getElementById('zoom-control');
    if (zoomField) state.zoom = Number(zoomField.value || 100);
  }

  function bindAdvancedTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(panel => {
          panel.classList.toggle('active', panel.dataset.tab === state.activeTab);
        });
        document.querySelectorAll('.tab-btn').forEach(tab => {
          tab.classList.toggle('active', tab.dataset.tab === state.activeTab);
        });
      });
    });
  }

  function bindPromptUpdate() {
    const allInputs = document.querySelectorAll('[data-sync-prompt]');
    allInputs.forEach(input => {
      input.addEventListener('input', () => {
        syncPromptFromControls();
      });
    });
  }

  function bindQuickIdeas() {
    document.querySelectorAll('[data-idea]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idea = btn.dataset.idea;
        setPromptValue(idea);
        syncPromptFromControls();
        refreshRenderOutput();
      });
    });
  }

  function bindViewSwitch() {
    const showMore = document.getElementById('show-more-controls');
    if (showMore) {
      showMore.addEventListener('click', () => {
        state.mode = 'control';
        renderMode();
      });
    }
  }

  function initDefaults() {
    setPromptValue(demoPrompts[0]);
    state.style = 'cyberpunk style, neon colors';
    state.resolution = '768x768';
    state.negative = 'blurry, low quality, watermark, text';
    syncPromptFromControls();
    refreshRenderOutput();
    updateStatus('ready');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initModeButtons();
    bindGenerateButtons();
    bindAdvancedTabs();
    bindPromptUpdate();
    bindQuickIdeas();
    bindViewSwitch();
    renderMode();
    initDefaults();
  });
})();
