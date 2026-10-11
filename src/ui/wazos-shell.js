const WazOSShell = (() => {
  const defaultState = {
    mode: 'beginner',
    activeTab: 'studio',
    prompt: 'A cybernetic skull with neon green tubes, highly detailed, cinematic lighting',
    style: 'cyberpunk style, neon colors',
    negative: 'blurry, low quality, watermark, text, distorted',
    resolution: '768x768',
    batch: 1,
    zoom: 100
  };

  const demoPrompts = [
    'A cybernetic skull with neon green tubes, highly detailed, cinematic lighting',
    'A biomechanical fox with glowing joints, anime style, heroic pose',
    'A steampunk robot mechanic with brass gears, intricate details, dark studio lighting'
  ];

  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('wazos-shell-state') || '{}');
      return { ...defaultState, ...saved };
    } catch (error) {
      return { ...defaultState };
    }
  };

  const state = loadState();

  const persist = () => {
    localStorage.setItem('wazos-shell-state', JSON.stringify(state));
  };

  const syncAllFields = () => {
    document.querySelectorAll('[data-sync-prompt]').forEach((input) => {
      const id = input.id;
      if (id === 'prompt-beginner') input.value = state.prompt;
      if (id === 'prompt-control') input.value = state.prompt;
      if (id === 'prompt-advanced') input.value = state.prompt;
      if (id === 'style-control' || id === 'style-advanced') input.value = state.style || '';
      if (id === 'resolution-control' || id === 'resolution-advanced') input.value = state.resolution;
      if (id === 'negative-control' || id === 'negative-advanced') input.value = state.negative;
      if (id === 'batch-control' || id === 'batch-advanced') input.value = String(state.batch || 1);
      if (id === 'zoom-control') input.value = String(state.zoom || 100);
    });
  };

  const getPromptText = () => (state.prompt || '').trim() || demoPrompts[0];

  const renderPreview = () => {
    const prompt = encodeURIComponent(getPromptText());
    const [w, h] = (state.resolution || '768x768').split('x');
    const src = `https://image.pollinations.ai/prompt/${prompt}?width=${w}&height=${h}&seed=${Date.now()}&model=flux&nologo=true`;

    ['render-image', 'render-image-control', 'render-image-advanced'].forEach((id) => {
      const img = document.getElementById(id);
      if (img) img.src = src;
    });

    const renderMeta = document.getElementById('render-meta');
    if (renderMeta) renderMeta.textContent = `@ ${state.resolution}`;
  };

  const updateStatus = (label, kind = 'ready') => {
    const statusEls = [
      document.getElementById('generation-status'),
      document.getElementById('control-status'),
      document.getElementById('advanced-status')
    ].filter(Boolean);

    statusEls.forEach((el) => {
      el.textContent = label;
      el.classList.remove('ready', 'loading');
      el.classList.add(kind === 'loading' ? 'loading' : 'ready');
    });
  };

  const readInputs = () => {
    const prompt = document.getElementById('prompt-beginner') || document.getElementById('prompt-control') || document.getElementById('prompt-advanced');
    if (prompt) state.prompt = (prompt.value || '').trim() || demoPrompts[0];

    const style = document.getElementById('style-control') || document.getElementById('style-advanced');
    state.style = style ? style.value : '';

    const resolution = document.getElementById('resolution-control') || document.getElementById('resolution-advanced');
    state.resolution = resolution ? resolution.value : '768x768';

    const negative = document.getElementById('negative-control') || document.getElementById('negative-advanced');
    state.negative = negative ? negative.value : 'blurry, low quality';

    const batch = document.getElementById('batch-control') || document.getElementById('batch-advanced');
    state.batch = batch ? Number(batch.value || 1) : 1;

    const zoom = document.getElementById('zoom-control');
    state.zoom = zoom ? Number(zoom.value || 100) : 100;

    persist();
  };

  const setMode = (mode) => {
    state.mode = mode;
    persist();

    document.querySelectorAll('.mode-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.mode === state.mode);
    });

    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === state.mode);
    });

    const modeStatus = document.getElementById('mode-status');
    if (modeStatus) modeStatus.textContent = state.mode;
  };

  const setPrompt = (value) => {
    state.prompt = value;
    syncAllFields();
    persist();
    renderPreview();
  };

  const bindPromptSync = () => {
    document.querySelectorAll('[data-sync-prompt]').forEach((input) => {
      input.addEventListener('input', () => {
        readInputs();
        renderPreview();
      });
    });
  };

  const bindGenerateButtons = () => {
    document.querySelectorAll('[data-generate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        readInputs();
        state.prompt = getPromptText();
        syncAllFields();
        updateStatus('Generating…', 'loading');
        renderPreview();
        setTimeout(() => updateStatus('Ready', 'ready'), 1100);
        persist();
      });
    });
  };

  const bindTabs = () => {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((tab) => {
          tab.classList.toggle('active', tab.dataset.tab === state.activeTab);
        });
        document.querySelectorAll('.tab-content').forEach((panel) => {
          panel.classList.toggle('active', panel.dataset.tab === state.activeTab);
        });
        persist();
      });
    });
  };

  const bindIdeas = () => {
    document.querySelectorAll('.idea-chip').forEach((chip) => {
      chip.addEventListener('click', () => setPrompt(chip.dataset.idea));
    });
  };

  const bindModeButtons = () => {
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    const openAdvanced = document.querySelectorAll('[data-mode="advanced"]').length ? document.querySelectorAll('[data-mode="advanced"]') : [];
    openAdvanced.forEach((el) => {
      el.addEventListener('click', () => setMode('advanced'));
    });

    const showMoreControls = document.getElementById('show-more-controls');
    if (showMoreControls) {
      showMoreControls.addEventListener('click', () => setMode('control'));
    }
  };

  const init = () => {
    syncAllFields();
    setMode(state.mode);
    bindModeButtons();
    bindGenerateButtons();
    bindPromptSync();
    bindTabs();
    bindIdeas();
    renderPreview();
    updateStatus('Ready', 'ready');
  };

  return { init, state, setMode, setPrompt, renderPreview, syncAllFields };
})();

document.addEventListener('DOMContentLoaded', () => {
  WazOSShell.init();
});
