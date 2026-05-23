window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    if (!this.canvas) return;

    // FIX: Wir setzen den Render-Aufruf direkt als Property,
    // damit der Manager ihn bei notify() ausführen kann.
    window.WazgManager.onUpdate = (state) => this.render(state);

    this.setupDragListeners();
  },
  
  // ... restlicher Code bleibt ...
};
