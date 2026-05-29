// src/ui/WazgGLTFLoader.js (Enhanced Version)
window.WazgGLTFLoader = {
  loader: null,

  init: function() {
    if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
      this.loader = new THREE.GLTFLoader();
    } else {
      this.loadFromCDN();
    }
  },

  loadFromCDN: function() {
    // Load Three.js + GLTFLoader if missing
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    script.onload = () => {
      const gltfScript = document.createElement('script');
      gltfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/examples/js/loaders/GLTFLoader.js';
      gltfScript.onload = () => {
        this.loader = new THREE.GLTFLoader();
        if (window.WazgLogcat) window.WazgLogcat.log("GLTF", "GLTFLoader loaded via CDN");
      };
      document.head.appendChild(gltfScript);
    };
    document.head.appendChild(script);
  },

  load: function(url, onSuccess, onProgress, onError) {
    if (!this.loader) {
      if (onError) onError("Loader not ready");
      return;
    }

    this.loader.load(
      url,
      (gltf) => {
        if (onSuccess) onSuccess(gltf);
      },
      (progress) => {
        if (onProgress) onProgress((progress.loaded / progress.total) * 100);
      },
      (error) => {
        if (onError) onError(error);
        if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "GLTF load failed: " + error);
      }
    );
  }
};
