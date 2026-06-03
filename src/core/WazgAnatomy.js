window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    if (window.WazgLogcat) window.WazgLogcat.log("ANATOMY", "Biomechanical Renderer ready");
  }
};
