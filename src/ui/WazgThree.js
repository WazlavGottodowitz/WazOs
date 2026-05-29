// =============================================
// WazgThree.js - Three.js with OrbitControls
// =============================================

window.WazgThree = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  isInitialized: false,
  container: null,

  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return false;

    this.container = document.createElement("div");
    this.container.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none;
    `;
    workspace.appendChild(this.container);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI * 0.95;

    this.isInitialized = true;

    if (window.WazgLogcat) {
      window.WazgLogcat.log("THREE", "Three.js + OrbitControls initialized");
    }

    this.animate();
    return true;
  },

  animate: function() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  show: function() {
    if (this.container) this.container.style.display = "block";
    if (this.controls) this.controls.enabled = true;
  },

  hide: function() {
    if (this.container) this.container.style.display = "none";
    if (this.controls) this.controls.enabled = false;
  },

  addTestObject: function() {
    if (!this.scene) return;
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88, 
      shininess: 30,
      specular: 0x222222 
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    this.scene.add(light);
  }
};
