// =============================================
// src/ui/WazgBipedRig.js - 2.5D Perspective Biped
// =============================================

window.WazgBipedRig = {
  bones: {},
  ikChains: {},
  perspectiveFactor: 1.0, // 1.0 = flat, >1 = perspective depth

  init: function() {
    this.createBipedSkeleton();
    if (window.WazgLogcat) window.WazgLogcat.log("RIG", "2.5D Biomechanical Biped Rig initialized");
  },

  createBipedSkeleton: function() {
    // Root
    this.bones.root = new THREE.Object3D();

    // Spine chain
    this.bones.spine = new THREE.Bone();
    this.bones.chest = new THREE.Bone();
    this.bones.neck = new THREE.Bone();
    this.bones.head = new THREE.Bone();

    // Arms
    this.bones.leftShoulder = new THREE.Bone();
    this.bones.leftElbow = new THREE.Bone();
    this.bones.leftHand = new THREE.Bone();

    this.bones.rightShoulder = new THREE.Bone();
    this.bones.rightElbow = new THREE.Bone();
    this.bones.rightHand = new THREE.Bone();

    // Legs
    this.bones.leftHip = new THREE.Bone();
    this.bones.leftKnee = new THREE.Bone();
    this.bones.leftFoot = new THREE.Bone();

    this.bones.rightHip = new THREE.Bone();
    this.bones.rightKnee = new THREE.Bone();
    this.bones.rightFoot = new THREE.Bone();

    // Build hierarchy
    this.bones.root.add(this.bones.spine);
    this.bones.spine.add(this.bones.chest);
    this.bones.chest.add(this.bones.neck);
    this.bones.neck.add(this.bones.head);

    this.bones.chest.add(this.bones.leftShoulder);
    this.bones.leftShoulder.add(this.bones.leftElbow);
    this.bones.leftElbow.add(this.bones.leftHand);

    this.bones.chest.add(this.bones.rightShoulder);
    this.bones.rightShoulder.add(this.bones.rightElbow);
    this.bones.rightElbow.add(this.bones.rightHand);

    this.bones.root.add(this.bones.leftHip);
    this.bones.leftHip.add(this.bones.leftKnee);
    this.bones.leftKnee.add(this.bones.leftFoot);

    this.bones.root.add(this.bones.rightHip);
    this.bones.rightHip.add(this.bones.rightKnee);
    this.bones.rightKnee.add(this.bones.rightFoot);

    if (window.WazgThree && window.WazgThree.scene) {
      window.WazgThree.scene.add(this.bones.root);
    }
  },

  // Apply perspective-aware scaling
  updatePerspective: function(cameraZ) {
    this.perspectiveFactor = 1 + (cameraZ * 0.008); // subtle depth
    this.bones.root.scale.setScalar(this.perspectiveFactor);
  },

  // Integrate with FABRIK
  setupIK: function() {
    if (window.WazgFABRIK) {
      // Left Arm Chain
      window.WazgFABRIK.createChain([
        this.bones.leftShoulder,
        this.bones.leftElbow,
        this.bones.leftHand
      ], "LeftHand");

      // Right Arm Chain
      window.WazgFABRIK.createChain([
        this.bones.rightShoulder,
        this.bones.rightElbow,
        this.bones.rightHand
      ], "RightHand");
    }
  }
};
