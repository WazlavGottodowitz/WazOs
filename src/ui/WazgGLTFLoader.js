window.WazgGLTFLoader = {
  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("GLTF", "GLTF Loader ready (Three.js mode)");
  },

  loadModel: function(url) {
    if (window.WazgLogcat) window.WazgLogcat.log("GLTF", `Loading model: ${url}`);
  }
};
