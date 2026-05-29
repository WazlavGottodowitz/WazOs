// =============================================
// WazgSkeletalRig.js - Complete Skeletal Rigging System
// =============================================

window.WazgSkeletalRig = {
  rigs: new Map(),           // rigName → rig object

  createRig: function(name, type = "biped") {
    const rig = {
      name: name,
      type: type,
      bones: {},
      skinMesh: null,
      ikChains: {},
      poseLibrary: {},
      scale: 1.0
    };

    this.rigs.set(name, rig);
    this.setupDefaultBones(rig);
    return rig;
  },

  setupDefaultBones: function(rig) {
    if (rig.type === "biped") {
      rig.bones = {
        root: new THREE.Object3D(),
        spine1: new THREE.Bone(),
        spine2: new THREE.Bone(),
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
      const b = rig.bones;
      b.root.add(b.spine1);
      b.spine1.add(b.spine2);
      b.spine2.add(b.neck);
      b.neck.add(b.head);

      b.spine2.add(b.leftShoulder);
      b.leftShoulder.add(b.leftElbow);
      b.leftElbow.add(b.leftHand);

      b.spine2.add(b.rightShoulder);
      b.rightShoulder.add(b.rightElbow);
      b.rightElbow.add(b.rightHand);

      b.root.add(b.leftHip);
      b.leftHip.add(b.leftKnee);
      b.leftKnee.add(b.leftFoot);

      b.root.add(b.rightHip);
      b.rightHip.add(b.rightKnee);
      b.rightKnee.add(b.rightFoot);
    }
  },

  // Apply pose from library
  applyPose: function(rigName, poseName) {
    const rig = this.rigs.get(rigName);
    if (!rig || !rig.poseLibrary[poseName]) return false;

    const pose = rig.poseLibrary[poseName];
    Object.keys(pose).forEach(boneName => {
      if (rig.bones[boneName]) {
        rig.bones[boneName].quaternion.copy(pose[boneName]);
      }
    });

    if (window.WazgJointLimits) window.WazgJointLimits.applyToRig(rig);
    return true;
  },

  // Global scale for all rigs
  setGlobalScale: function(scale) {
    this.rigs.forEach(rig => {
      if (rig.root) rig.root.scale.setScalar(scale * rig.scale);
    });
  },

  update: function() {
    // Called every frame from main loop
    if (window.WazgFABRIK) window.WazgFABRIK.update();
  }
};
