import { Module } from '../core/Module.js';
import * as bridge from '../plugins/perchance-bridge.js';

export class ArtStyleInjector extends Module {
  constructor(id) {
    super(id, 'STYLELIB');
    this.styleLibrary = this.getDefaultStyles();
    this.effectLibrary = this.getDefaultEffects();
    this.activeStyle = 'cinematic-anime';
    this.activeEffects = [];
    this.mixingMode = 'blend';
  }

  getDefaultStyles() {
    return {
      "cinematic-anime": {
        name: "Cinematic Anime",
        prompt: "anime style, cinematic lighting, film grain, 8k, dramatic composition, Makoto Shinkai",
        negative: "3d, photorealistic, western cartoon",
        denoise: 0.65,
        cfg: 7.5,
        tags: ["anime", "cinematic"]
      },
      "cartoons": {
        name: "90s Cartoon",
        prompt: "1990s cartoon network style, flat colors, bold outlines, cel animation",
        negative: "realistic, 3d, photorealistic, noise",
        denoise: 0.7,
        cfg: 8,
        tags: ["cartoon", "retro"]
      },
      "popart": {
        name: "Pop Art",
        prompt: "pop art style, Andy Warhol, Roy Lichtenstein, ben-day dots, high contrast, screen print",
        negative: "photorealistic, subtle, muted",
        denoise: 0.6,
        cfg: 9,
        tags: ["popart", "bold"]
      },
      "escher": {
        name: "M.C. Escher",
        prompt: "M.C. Escher style, impossible geometry, tessellation, optical illusion, black and white lithograph",
        negative: "color, organic, chaotic",
        denoise: 0.55,
        cfg: 8.5,
        tags: ["escher", "geometric"]
      },
      "dali": {
        name: "Salvador Dali",
        prompt: "Salvador Dali surrealism, melting clocks, dreamlike, precise oil painting, barren landscape",
        negative: "abstract, modern, digital",
        denoise: 0.6,
        cfg: 7,
        tags: ["dali", "surreal"]
      },
      "lichtenstein": {
        name: "Roy Lichtenstein",
        prompt: "Roy Lichtenstein comic book style, ben-day dots, bold primary colors, halftone, speech bubbles",
        negative: "photorealistic, subtle gradients",
        denoise: 0.65,
        cfg: 9,
        tags: ["comic", "popart"]
      },
      "vermeer": {
        name: "Vermeer",
        prompt: "Johannes Vermeer style, Dutch Golden Age, soft window light, oil on canvas, intimate interior",
        negative: "harsh light, modern, digital",
        denoise: 0.7,
        cfg: 6.5,
        tags: ["classical", "painting"]
      },
      "loomit": {
        name: "Loomit Graffiti",
        prompt: "Loomit graffiti style, wildstyle lettering, 3d blocks, chrome effects, spray paint, train yard",
        negative: "clean, minimalist, vector",
        denoise: 0.6,
        cfg: 8,
        tags: ["graffiti", "street"]
      },
      "moebius": {
        name: "Moebius",
        prompt: "Jean Giraud Moebius style, clean line art, vast desert landscapes, sci-fi, light colors",
        negative: "messy, dark, grunge",
        denoise: 0.7,
        cfg: 7,
        tags: ["scifi", "lineart"]
      },
      "ghibli": {
        name: "Studio Ghibli",
        prompt: "Studio Ghibli style, Hayao Miyazaki, hand-painted backgrounds, soft watercolor, nostalgic",
        negative: "3d, cgi, harsh",
        denoise: 0.75,
        cfg: 7,
        tags: ["anime", "watercolor"]
      }
    };
  }

  getDefaultEffects() {
    return {
      "glitch": {
        name: "Datamosh Glitch",
        prompt: "datamosh, pixel sorting, compression artifacts, chromatic aberration",
        weight: 0.3
      },
      "film-grain": {
        name: "35mm Film Grain",
        prompt: "35mm film grain, analog photography, kodak portra 400",
        weight: 0.2
      },
      "vhs": {
        name: "VHS Tracking",
        prompt: "VHS tape, tracking errors, scanlines, color bleed",
        weight: 0.4
      },
      "double-exposure": {
        name: "Double Exposure",
        prompt: "double exposure, layered imagery, transparent overlay",
        weight: 0.5
      },
      "light-leak": {
        name: "Light Leak",
        prompt: "light leak, orange lens flare, analog camera defect",
        weight: 0.3
      }
    };
  }

  async transform(frame) {
    const style = this.styleLibrary[this.activeStyle];
    const effects = this.activeEffects.map(id => this.effectLibrary[id]);

    let stylePrompt = style.prompt;
    if (this.mixingMode === 'stack' && effects.length > 0) {
      stylePrompt += ', ' + effects.map(e => e.prompt).join(', ');
    } else if (this.mixingMode === 'blend' && effects.length > 0) {
      const weights = effects.map(e => `(${e.prompt}:${e.weight})`).join(', ');
      stylePrompt += ', ' + weights;
    }

    frame.style = stylePrompt;
    frame.negative = style.negative;
    frame.denoise = style.denoise;
    frame.cfg = style.cfg;
    frame.styleMeta = {
      name: style.name,
      effects: effects.map(e => e.name)
    };

    if (bridge.storage) {
      await bridge.storage.set('wazos:lastStyle', this.activeStyle);
      await bridge.storage.set('wazos:lastEffects', this.activeEffects);
    }

    return frame;
  }

  exportLibrary() {
    const data = {
      styles: this.styleLibrary,
      effects: this.effectLibrary,
      version: "wazos-stylelib-v1"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wazos-style-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async importLibrary(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version === "wazos-stylelib-v1") {
      this.styleLibrary = {...this.styleLibrary,...data.styles };
      this.effectLibrary = {...this.effectLibrary,...data.effects };
      this.updateUI();
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    }
  }

  updateUI() {
    if (!this.ui) return;
    const styleSelect = this.ui.querySelector('.style-select');
    styleSelect.innerHTML = Object.entries(this.styleLibrary).map(([id, s]) =>
      `<option value="${id}" ${id === this.activeStyle? 'selected' : ''}>${s.name}</option>`
    ).join('');

    const effectsList = this.ui.querySelector('.effects-list');
    effectsList.innerHTML = Object.entries(this.effectLibrary).map(([id, e]) =>
      `<label><input type="checkbox" value="${id}" ${this.activeEffects.includes(id)? 'checked' : ''}> ${e.name}</label>`
    ).join('');
  }

  renderControls(body) {
    body.innerHTML = `
      <label>STYLE</label>
      <select class="style-select" style="grid-column:1/3;"></select>
      <label>MIX MODE</label>
      <select class="mix-mode">
        <option value="blend">BLEND</option>
        <option value="override">OVERRIDE</option>
        <option value="stack">STACK</option>
      </select>
      <label>EFFECTS</label>
      <div class="effects-list" style="grid-column:1/3;max-height:80px;overflow-y:auto;border:1px solid #333;padding:4px;"></div>
      <button class="export-btn">EXPORT LIB</button>
      <input type="file" class="import-btn" accept=".json" style="display:none;">
      <button onclick="this.previousElementSibling.click()">IMPORT LIB</button>
    `;

    this.updateUI();

    body.querySelector('.style-select').onchange = e => {
      this.activeStyle = e.target.value;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.mix-mode').onchange = e => {
      this.mixingMode = e.target.value;
      document.dispatchEvent(new CustomEvent('wazg:rack-update'));
    };
    body.querySelector('.effects-list').onchange = e => {
      if (e.target.type === 'checkbox') {
        const id = e.target.value;
        if (e.target.checked) {
          this.activeEffects.push(id);
        } else {
          this.activeEffects = this.activeEffects.filter(x => x!== id);
        }
        document.dispatchEvent(new CustomEvent('wazg:rack-update'));
      }
    };
    body.querySelector('.export-btn').onclick = () => this.exportLibrary();
    body.querySelector('.import-btn').onchange = e => {
      if (e.target.files[0]) this.importLibrary(e.target.files[0]);
    };
  }
}
