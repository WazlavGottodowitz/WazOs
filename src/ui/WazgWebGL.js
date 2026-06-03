window.WazgWebGL = {
  canvas: null,
  gl: null,

  init: function() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "none";
    document.getElementById("waz-workspace").appendChild(this.canvas);

    this.gl = this.canvas.getContext("webgl");
    if (window.WazgLogcat) window.WazgLogcat.log("WEBGL", "WebGL context ready");
  },

  show: function() { this.canvas.style.display = "block"; },
  hide: function() { this.canvas.style.display = "none"; }
};
