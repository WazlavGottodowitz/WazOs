// =============================================
// WazgIKSystem.js - Full Integrated IK + Pose Library
// Multiple Rigs • Conflict-Free • Global Scale
// =============================================

window.WazgIKSystem = {
  rigs: new Map(),           // rigName → rig data
  activeRigs: new Set(),
  globalScale: 1.0,

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("IK", "Full IK System + Pose Library loaded");
  },

  // Create a new rig
  createRig: function(name, rootBone) {
    const rig = {
      name: name,
      root: rootBone,
      bones: {},
      ikChains: {},
      poseLibrary: {},
      scale: 1.0
    };
    this.rigs.set(name, rig);
    return rig;
  },

  // Add standard biped rig
  createBipedRig: function(name, scale = 1.0) {
    const rig = this.createRig(name, new THREE.Object3D());
    rig.scale = scale;

    // Define bones
    const bones = {
      root: rig.root,
      spine: new THREE.Bone(),
      chest: new THREE.Bone(),
      neck: new THREE.Bone(),
      head: new THREE.Bone(),
      leftShoulder: new THREE.Bone(),
      leftElbow: new THREE.Bone(),
      leftHand: new THREE.Bone(),
      rightShoulder: new THREE.Bone(),
      rightElbow: new THREE.Bone(),
      rightHand: new THREE.Bone(),
      leftHip: new THREE.Bone(),
      leftKnee: new THREE.Bone(),
      leftFoot: new THREE.Bone(),
      rightHip: new THREE.Bone(),
      rightKnee: new THREE.Bone(),
      rightFoot: new THREE.Bone()
    };

    // Build hierarchy
    rig.root.add(bones.spine);
    bones.spine.add(bones.chest);
    bones.chest.add(bones.neck);
    bones.neck.add(bones.head);

    bones.chest.add(bones.leftShoulder);
    bones.leftShoulder.add(bones.leftElbow);
    bones.leftElbow.add(bones.leftHand);

    bones.chest.add(bones.rightShoulder);
    bones.rightShoulder.add(bones.rightElbow);
    bones.rightElbow.add(bones.rightHand);

    rig.root.add(bones.leftHip);
    bones.leftHip.add(bones.leftKnee);
    bones.leftKnee.add(bones.leftFoot);

    rig.root.add(bones.rightHip);
    bones.rightHip.add(bones.rightKnee);
    bones.rightKnee.add(bones.rightFoot);

    rig.bones = bones;

    // Create IK chains
    if (window.WazgFABRIK) {
      window.WazgFABRIK.createChain([bones.leftShoulder, bones.leftElbow, bones.leftHand], "LeftHand");
      window.WazgFABRIK.createChain([bones.rightShoulder, bones.rightElbow, bones.rightHand], "RightHand");
    }

    return rig;
  },

  // Pose Library
  addPose: function(rigName, poseName, boneRotations) {
    const rig = this.rigs.get(rigName);
    if (!rig) return;
    rig.poseLibrary[poseName] = boneRotations;
  },

  applyPose: function(rigName, poseName) {
    const rig = this.rigs.get(rigName);
    if (!rig || !rig.poseLibrary[poseName]) return;

    const pose = rig.poseLibrary[poseName];
    Object.keys(pose).forEach(boneName => {
      const bone = rig.bones[boneName];
      if (bone) bone.quaternion.copy(pose[boneName]);
    });

    if (window.WazgJointLimits) window.WazgJointLimits.applyToRig(rig);
  },

  // Global scale for all rigs
  setGlobalScale: function(scale) {
    this.globalScale = scale;
    this.rigs.forEach(rig => {
      if (rig.root) rig.root.scale.setScalar(scale * rig.scale);
    });
  },

  update: function() {
    // Update all active rigs
    this.activeRigs.forEach(name => {
      const rig = this.rigs.get(name);
      if (rig && window.WazgFABRIK) {
        window.WazgFABRIK.update();
      }
    });
  }
};
