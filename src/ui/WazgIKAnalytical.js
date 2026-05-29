// src/ui/WazgIKAnalytical.js
window.WazgIKAnalytical = {
  solveTwoBone: function(shoulder, elbow, hand, target) {
    const upperLen = shoulder.position.distanceTo(elbow.position);
    const lowerLen = elbow.position.distanceTo(hand.position);
    const totalLen = upperLen + lowerLen;

    const toTarget = new THREE.Vector3().subVectors(target, shoulder.position);
    const dist = toTarget.length();

    // Law of Cosines
    let angle1 = Math.acos((upperLen * upperLen + dist * dist - lowerLen * lowerLen) / (2 * upperLen * dist));
    let angle2 = Math.acos((upperLen * upperLen + lowerLen * lowerLen - dist * dist) / (2 * upperLen * lowerLen));

    // Apply to bones
    const dir = toTarget.normalize();
    shoulder.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
    elbow.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -angle2);
  }
};
