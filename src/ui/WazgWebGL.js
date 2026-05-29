// =============================================
// WazgWebGL.js - Dynamic Anisotropy Slider Support
// =============================================

window.WazgWebGL = {
  canvas: null,
  gl: null,
  program: null,
  texture: null,
  isInitialized: false,
  currentAnisotropy: 8,        // Default level
  maxAnisotropy: 16,
  anisotropyExt: null,

  init: function() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "waz-webgl-canvas";
    this.canvas.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; display:none;`;

    const workspace = document.getElementById("waz-workspace");
    if (workspace) workspace.appendChild(this.canvas);

    this.gl = this.canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!this.gl) {
      if (window.WazgLogcat) window.WazgLogcat.log("WEBGL", "WebGL not supported");
      return false;
    }

    // Enable Anisotropic Filtering Extension
    this.anisotropyExt = this.gl.getExtension("EXT_texture_filter_anisotropic") ||
                         this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
                         this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

    if (this.anisotropyExt) {
      this.maxAnisotropy = this.gl.getParameter(this.anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      if (window.WazgLogcat) window.WazgLogcat.log("WEBGL", `Anisotropic filtering max: ${this.maxAnisotropy}x`);
    }

    this.setupShaders();
    this.isInitialized = true;
    return true;
  },

  setupShaders: function() { /* same as before */ },

  renderImage: function(imageUrl) {
    if (!this.gl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const gl = this.gl;
      if (this.texture) gl.deleteTexture(this.texture);

      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      this.applyAnisotropy(this.currentAnisotropy);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.draw();
      this.show();
    };
    img.src = imageUrl;
  },

  applyAnisotropy: function(level) {
    this.currentAnisotropy = Math.min(Math.max(1, level), this.maxAnisotropy);
    const gl = this.gl;

    if (this.anisotropyExt) {
      gl.texParameterf(gl.TEXTURE_2D, this.anisotropyExt.TEXTURE_MAX_ANISOTROPY_EXT, this.currentAnisotropy);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (window.WazgLogcat) {
      window.WazgLogcat.log("WEBGL", `Anisotropy set to ${this.currentAnisotropy}x`);
    }
  },

  draw: function() {
    if (!this.gl || !this.texture) return;
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  show: function() { if (this.canvas) this.canvas.style.display = "block"; },
  hide: function() { if (this.canvas) this.canvas.style.display = "none"; }
};
