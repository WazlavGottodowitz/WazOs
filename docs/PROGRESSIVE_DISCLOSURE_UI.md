# 🎨 WazOs Progressive Disclosure UI Pattern

**Progressive Disclosure for Intuitive, Non-Intimidating User Experience**

This document outlines a **layered, beginner-friendly UI** for WazOs that reveals complexity only when needed, following the "progressive disclosure" UX pattern.

---

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [UI Layer Strategy](#ui-layer-strategy)
3. [Beginner Mode (Default)](#beginner-mode-default)
4. [Intermediate Mode (Opt-In)](#intermediate-mode-opt-in)
5. [Advanced Mode (Power Users)](#advanced-mode-power-users)
6. [Micro-Interactions & Guidance](#micro-interactions--guidance)
7. [Implementation Architecture](#implementation-architecture)

---

## Design Philosophy

### The Problem
Current WazOs UI shows:
- 10+ input fields at once
- 3 tabs (T2I, CORE, SEQ)
- Plugin chain details
- Terminal logs
- Resolution presets
- Flags/parameters

**Result:** Cognitive overload for newcomers. New users don't know where to start.

### The Solution: Progressive Disclosure

Show **only essentials first**:
1. **Beginner**: Big prompt box + Generate button
2. **Intermediate**: Add style selector + resolution picker
3. **Advanced**: Unlock batch, negative prompt, flags, plugin chain

---

## UI Layer Strategy

### Three Experience Modes

```
┌─────────────────────────────────────────────────────┐
│  🎯 BEGINNER (Default)                              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐               │
│  │ Your creative vision here...     │               │
│  │ (Large, friendly prompt box)     │               │
│  └──────────────────────────────────┘               │
│                                                      │
│  [✨ GENERATE]                                      │
│                                                      │
│  💡 Tip: Try "neon robot" or "anime girl"          │
│  🔧 Need more control? [Switch to Intermediate]    │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│  🎯 INTERMEDIATE (Opt-In)                           │
├─────────────────────────────────────────────────────┤
│  Prompt: [Your idea...]                             │
│  Style:  [Cyberpunk ▼]                              │
│  Size:   [768x768 ▼]                                │
│  [✨ GENERATE]                                      │
│                                                      │
│  [Show More Options ▼]                              │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│  🎯 ADVANCED (Power Users)                          │
├─────────────────────────────────────────────────────┤
│  Prompt: [...]  | Negative: [...] | Flags: [...]   │
│  Style:  [...]  | Batch: [1-4]   | Zoom: [...]     │
│  [T2I] [CORE] [SEQ] | Terminal logs | Status       │
│  [Generate] [Batch] [Export] [History]             │
└─────────────────────────────────────────────────────┘
```

---

## Beginner Mode (Default)

### Visual Design

**Hero section** (takes 70% of viewport):

```html
<div id="wazos-beginner-hero">
  <div class="hero-title">
    ✨ What do you want to create?
  </div>
  
  <textarea id="prompt-main" 
    placeholder="E.g., 'A robot with glowing eyes' or 'An anime character with wings'"
    rows="6"></textarea>
  
  <div class="action-row">
    <button id="btn-generate-primary" class="btn-hero">
      ✨ GENERATE
    </button>
    <span class="hint-text">
      Takes ~10-30 seconds
    </span>
  </div>
  
  <div class="beginner-tips">
    <strong>💡 Tips for best results:</strong>
    <ul>
      <li>Be specific: "red cyberpunk robot" works better than "robot"</li>
      <li>Add a style: "anime", "photorealistic", "steampunk"</li>
      <li>Add detail: "intricate", "detailed", "highly detailed"</li>
    </ul>
  </div>
  
  <div class="mode-switcher">
    <a href="#" id="switch-intermediate" class="link-subtle">
      🔧 I want more control →
    </a>
  </div>
</div>
```

### Features
- ✅ Single large text input (focus)
- ✅ One big green button
- ✅ Helpful tips inline
- ✅ Estimated time (10-30s)
- ✅ Easy escape hatch ("want more control?")
- ❌ NO resolution selector
- ❌ NO negative prompt
- ❌ NO tabs or advanced settings
- ❌ NO terminal logs visible

### Default Behavior
- Resolution: Auto-set to **768x768** (best quality-to-speed ratio)
- Style: Auto-apply **"highly detailed, octane render"**
- Negative: Auto-apply sensible defaults
- Batch: **1 frame** (fast feedback)

### Visual Style
- **Dark theme** (WazOs identity preserved)
- **Large, friendly fonts**
- **Emoji icons** for personality
- **Lots of whitespace** (not cramped)
- **Rounded corners** (approachable, not "technical")

---

## Intermediate Mode (Opt-In)

### Trigger
User clicks: **"🔧 I want more control"** or **Settings → Switch Mode**

### Visual Design

```html
<div id="wazos-intermediate-panel">
  
  <div class="panel-header">
    <h2>⚡ Intermediate Mode</h2>
    <a href="#" id="back-to-beginner">← Back to Simple</a>
  </div>
  
  <div class="form-group">
    <label>Your Idea</label>
    <textarea id="prompt-intermediate" rows="4"></textarea>
  </div>
  
  <div class="form-row">
    <div class="form-group" style="flex: 2;">
      <label>Style</label>
      <select id="style-selector">
        <option value="">None (Raw)</option>
        <option value="cyberpunk style, neon">🔮 Cyberpunk</option>
        <option value="anime style, studio ghibli">🎨 Anime</option>
        <option value="photorealistic, 8k">📷 Photorealistic</option>
        <option value="steampunk, brass, gears">⚙️ Steampunk</option>
        <option value="biomechanical, giger">🤖 Biomechanical</option>
      </select>
    </div>
    
    <div class="form-group" style="flex: 1;">
      <label>Size</label>
      <select id="resolution-intermediate">
        <option value="512x512">512 x 512 (fast)</option>
        <option value="768x768" selected>768 x 768 (balanced)</option>
        <option value="1024x1024">1024 x 1024 (detailed)</option>
      </select>
    </div>
  </div>
  
  <div class="action-row">
    <button id="btn-generate-intermediate" class="btn-primary">
      ✨ GENERATE
    </button>
    <a href="#" id="show-advanced-opts" class="link-subtle">
      Show advanced options ▼
    </a>
  </div>
  
  <!-- Hidden by default, revealed on click -->
  <div id="advanced-opts-hidden" style="display: none;">
    <hr>
    <div class="form-group">
      <label>What to avoid (optional)</label>
      <input type="text" id="negative-intermediate" 
        placeholder="E.g., 'blurry, low quality, watermark'">
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Variations</label>
        <select id="batch-intermediate">
          <option value="1" selected>1 (just one)</option>
          <option value="2">2 (compare options)</option>
          <option value="3">3 (pick the best)</option>
          <option value="4">4 (explore most)</option>
        </select>
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Preview Zoom</label>
        <input type="range" id="zoom-intermediate" min="50" max="200" value="100">
      </div>
    </div>
  </div>
  
</div>
```

### Features
- ✅ Prompt + Style + Size (the essentials)
- ✅ Optional "Show advanced options" collapse
- ✅ Easy toggle back to Beginner
- ✅ Reasonable defaults for new fields
- ❌ NO terminal logs yet
- ❌ NO plugin chain editor
- ❌ NO timeline/SEQ tab

### Behavior
- **One-click back to Beginner** (no loss of state)
- **Collapsible advanced section** that doesn't overwhelm
- **Visual hints** (emoji icons on presets)
- **Sane defaults** for every control

---

## Advanced Mode (Power Users)

### Trigger
User clicks: **"🔧 Advanced Mode"** or hits **keyboard shortcut: `A`**

### Visual Design

```html
<div id="wazos-advanced-full">
  
  <div class="advanced-header">
    <div class="header-tabs">
      <button class="tab-btn active" data-tab="t2i">T2I</button>
      <button class="tab-btn" data-tab="core">CORE</button>
      <button class="tab-btn" data-tab="seq">SEQ</button>
      <button class="tab-btn" data-tab="settings">⚙️ Settings</button>
    </div>
    <div class="header-status">
      <span class="badge" id="mode-badge">bridge-live</span>
      <span class="badge" id="frame-badge">Frames: 0</span>
    </div>
  </div>
  
  <div id="tab-t2i" class="advanced-tab active">
    <!-- T2I Studio Layout (resizable panels) -->
    <div class="studio-layout">
      <div class="controls-panel">
        <div class="form-group">
          <label>Prompt (required)</label>
          <textarea id="prompt-advanced"></textarea>
        </div>
        <div class="form-group">
          <label>Negative Prompt</label>
          <input type="text" id="negative-advanced">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Style</label>
            <select id="style-advanced"></select>
          </div>
          <div class="form-group">
            <label>Resolution</label>
            <select id="resolution-advanced"></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Batch</label>
            <input type="number" id="batch-advanced" min="1" max="4" value="1">
          </div>
          <div class="form-group">
            <label>Flags</label>
            <input type="text" id="flags-advanced" placeholder="--v 5.2 --ar 1:1">
          </div>
        </div>
        <button id="btn-generate-advanced" class="btn-primary btn-large">
          ✨ GENERATE
        </button>
        <button id="btn-throw-frame" class="btn-secondary">
          🚀 FRAME THROW
        </button>
      </div>
      
      <div class="resize-handle"></div>
      
      <div class="preview-panel">
        <div class="preview-header">
          <span id="buffer-info">BUFFER: 768x768</span>
          <input type="range" id="preview-zoom-adv" min="20" max="200" value="100">
        </div>
        <div class="preview-canvas">
          <img id="render-preview" src="" alt="Generated image">
        </div>
      </div>
    </div>
  </div>
  
  <div id="tab-core" class="advanced-tab">
    <!-- Plugin Chain, System Status -->
    <div class="core-panel">
      <h3>Plugin Chain</h3>
      <div id="plugin-list"></div>
      <h3>System Status</h3>
      <div id="system-stats"></div>
    </div>
  </div>
  
  <div id="tab-seq" class="advanced-tab">
    <!-- Frame Sequence Editor -->
    <div class="seq-panel">
      <h3>Frame Buffer</h3>
      <div id="timeline-view"></div>
      <button id="btn-export-sequence">📥 Export Sequence</button>
    </div>
  </div>
  
  <div id="tab-settings" class="advanced-tab">
    <!-- Advanced Settings -->
    <div class="settings-panel">
      <h3>UI Mode</h3>
      <button id="switch-beginner-from-adv">← Back to Beginner</button>
      <button id="switch-intermediate-from-adv">← Back to Intermediate</button>
    </div>
  </div>
  
  <!-- Nano Terminal (always visible at bottom) -->
  <div id="nano-terminal">
    <div class="terminal-header">>_ SYSTEM.LOG</div>
    <div id="terminal-log"></div>
  </div>
  
</div>
```

### Features
- ✅ All controls (prompt, negative, style, resolution, batch, flags)
- ✅ Resizable panels (Studio layout)
- ✅ Multiple tabs (T2I, CORE, SEQ)
- ✅ Terminal logs visible
- ✅ Plugin chain inspector
- ✅ Frame timeline
- ✅ Export functionality
- ✅ Easy back-navigation to simpler modes

---

## Micro-Interactions & Guidance

### Context-Sensitive Help

```html
<!-- Appears when hovering on label -->
<div class="tooltip" data-for="style-selector">
  💡 <strong>Style:</strong> Choose a visual theme (cyberpunk, anime, etc.)
  This prepends keywords to your prompt for better results.
</div>

<div class="tooltip" data-for="batch-advanced">
  💡 <strong>Batch:</strong> Generate multiple variations at once.
  More batches = slower but more options to choose from.
</div>
```

### Smart Hints

```javascript
// Show contextual tips based on user action
if (promptLength < 10) {
  showHint("💡 Pro tip: More specific prompts = better results");
}

if (selectedStyle === "photorealistic" && !negative.includes("anime")) {
  showHint("💡 Tip: This style works best with negative prompt 'anime, cartoon'");
}
```

### Loading States & Feedback

```html
<!-- While generating -->
<div class="generating-state">
  <div class="spinner"></div>
  <p>Creating your vision...</p>
  <p class="secondary">Step 2/4: Rendering details</p>
  <p class="eta">~5 seconds remaining</p>
</div>
```

### Success Celebration

```javascript
// When generation completes
showNotification({
  type: 'success',
  message: '✨ Your image is ready!',
  action: 'Frame Throw',
  duration: 5000
});
```

---

## Implementation Architecture

### Component Structure

```
WazOs UI System
├── Layer Controller (manages mode switching)
├── Beginner Mode
│   ├── Hero Section
│   ├── Prompt Input
│   ├── Generate Button
│   └── Tips Panel
├── Intermediate Mode
│   ├── Form Layout
│   ├── Collapsible Advanced Opts
│   └── Style/Resolution Pickers
├── Advanced Mode
│   ├── Tab System
│   ├── Studio Layout
│   ├── Plugin Chain
│   ├── Timeline
│   └── Terminal
└── Shared Components
    ├── Preview Canvas
    ├── Logger
    ├── Tooltips
    └── Notifications
```

### State Management

```javascript
// Global UI state
window.WazOSUI = {
  mode: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  currentTab: 'tab-studio',
  isGenerating: false,
  lastPrompt: '',
  frameBuffer: [],
  
  switchMode(newMode) {
    this.mode = newMode;
    this.render();
    localStorage.setItem('wazos_ui_mode', newMode);
  },
  
  render() {
    // Hide all modes
    document.getElementById('wazos-beginner-hero').style.display = 'none';
    document.getElementById('wazos-intermediate-panel').style.display = 'none';
    document.getElementById('wazos-advanced-full').style.display = 'none';
    
    // Show current mode
    document.getElementById(`wazos-${this.mode}-${this.mode === 'beginner' ? 'hero' : this.mode === 'intermediate' ? 'panel' : 'full'}`).style.display = 'block';
  }
};
```

### CSS Architecture

```css
/* Beginner: Hero, spacious */
#wazos-beginner-hero {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

#prompt-main {
  font-size: 16px;
  padding: 20px;
  line-height: 1.6;
  border-radius: 12px;
  border: 2px solid var(--accent);
}

.btn-hero {
  font-size: 20px;
  padding: 20px 40px;
  border-radius: 12px;
  min-width: 200px;
}

/* Intermediate: Form-based */
#wazos-intermediate-panel {
  max-width: 800px;
  padding: 30px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

/* Advanced: Full-featured */
#wazos-advanced-full {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.advanced-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.studio-layout {
  display: flex;
  flex: 1;
  gap: 6px;
}

.controls-panel {
  width: 280px;
  overflow-y: auto;
  border-right: var(--border);
  padding: 10px;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

### Responsive Behavior

```css
/* Tablet (< 1024px) */
@media (max-width: 1024px) {
  .studio-layout {
    flex-direction: column;
  }
  
  .controls-panel {
    width: 100%;
    border-right: none;
    border-bottom: var(--border);
    max-height: 300px;
  }
  
  .preview-panel {
    flex: 1;
  }
}

/* Mobile (< 640px) */
@media (max-width: 640px) {
  /* Force Beginner or Intermediate mode only */
  #wazos-advanced-full {
    display: none !important;
  }
  
  #wazos-intermediate-panel {
    padding: 15px;
  }
  
  .form-row {
    flex-direction: column;
  }
}
```

---

## Onboarding Flow

### First-Time User Journey

```
1. User lands on waz-o-stack
   ↓
2. Beginner mode loads (friendly, simple)
   ↓
3. Large prompt box with emoji examples
   ↓
4. User types: "neon robot"
   ↓
5. Click [✨ GENERATE]
   ↓
6. Loading animation: "Creating your vision..."
   ↓
7. Image appears in preview
   ↓
8. Success! "✨ Your image is ready!"
   ↓
9. Option to: [🚀 FRAME THROW] [🔧 Refine] [← Back]
   ↓
10. If user clicks "Refine" → Switch to Intermediate
    (Their prompt is preserved!)
```

### Keyboard Shortcuts (Advanced Users)

```javascript
// Global keyboard handler
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '1') window.WazOSUI.switchMode('beginner');
    if (e.key === '2') window.WazOSUI.switchMode('intermediate');
    if (e.key === '3') window.WazOSUI.switchMode('advanced');
    if (e.key === 'Enter') document.getElementById('btn-generate-' + window.WazOSUI.mode).click();
  }
});
```

---

## Benefits of This Approach

✅ **Beginner-friendly**: New users see only what they need  
✅ **Non-intimidating**: No cognitive overload  
✅ **Progressive**: Learn at your own pace  
✅ **No feature loss**: All functionality available if needed  
✅ **Smooth upgrade path**: Seamless transition between modes  
✅ **Persistent state**: Prompt/settings preserved when switching  
✅ **Mobile-ready**: Adapts to smaller screens gracefully  
✅ **Accessible**: Clear hierarchy, good contrast, large touch targets  
✅ **Guidance built-in**: Contextual tips, helpful tooltips  
✅ **Emoji personality**: Approachable, not "technical"  

---

## Migration Plan

### Step 1: Implement Beginner Mode (Week 1)
- Build hero layout
- Wire generate button
- Add tips panel
- Test with 5 users

### Step 2: Implement Intermediate Mode (Week 2)
- Build form layout
- Collapsible advanced opts
- Mode switching
- Test with 10 users

### Step 3: Refactor Advanced Mode (Week 3)
- Reorganize existing UI
- Integrate all 3 modes
- Add animations
- Polish & deploy

### Step 4: Gather Feedback (Ongoing)
- Analytics on mode usage
- User interviews
- Iterate based on data

---

**Last Updated:** 2026-10-11  
**Status:** Recommended UX Pattern  
**Difficulty:** Medium (refactor, not rebuild)  
**User Impact:** ⭐⭐⭐⭐⭐ (High improvement in onboarding)
