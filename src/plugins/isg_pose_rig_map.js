// isg_pose_rig_map.js
// Converts MediaPipe pose landmarks into WazOs-compatible rig motion payloads

class PoseRigMapper {
  static landmark(landmarks, index, fallback = null) {
    return landmarks && landmarks[index] ? landmarks[index] : fallback;
  }

  static centroid(landmarks = []) {
    const valid = landmarks.filter((p) => p && typeof p.x === "number");
    if (!valid.length) return { x: 0, y: 0, z: 0 };

    return {
      x: valid.reduce((sum, p) => sum + p.x, 0) / valid.length,
      y: valid.reduce((sum, p) => sum + p.y, 0) / valid.length,
      z: valid.reduce((sum, p) => sum + (p.z ?? 0), 0) / valid.length
    };
  }

  static motionFromLandmarks(current = [], previous = []) {
    const currC = PoseRigMapper.centroid(current);
    const prevC = PoseRigMapper.centroid(previous.length ? previous : current);

    const dx = currC.x - prevC.x;
    const dy = currC.y - prevC.y;
    const dz = currC.z - prevC.z;

    return {
      dx: Number(dx.toFixed(4)),
      dy: Number(dy.toFixed(4)),
      dz: Number(dz.toFixed(4)),
      magnitude: Number(Math.hypot(dx, dy, dz).toFixed(4))
    };
  }

  static mapPoseToRigPacket(currentLandmarks = [], previousLandmarks = []) {
    if (!currentLandmarks.length) return null;

    const hips = PoseRigMapper.landmark(currentLandmarks, 11, PoseRigMapper.landmark(currentLandmarks, 12, PoseRigMapper.centroid(currentLandmarks)));
    const head = PoseRigMapper.landmark(currentLandmarks, 0, PoseRigMapper.centroid(currentLandmarks));
    const leftShoulder = PoseRigMapper.landmark(currentLandmarks, 11, hips);
    const rightShoulder = PoseRigMapper.landmark(currentLandmarks, 12, hips);
    const leftHand = PoseRigMapper.landmark(currentLandmarks, 15, leftShoulder);
    const rightHand = PoseRigMapper.landmark(currentLandmarks, 16, rightShoulder);
    const leftKnee = PoseRigMapper.landmark(currentLandmarks, 25, hips);
    const rightKnee = PoseRigMapper.landmark(currentLandmarks, 26, hips);

    const motion = PoseRigMapper.motionFromLandmarks(currentLandmarks, previousLandmarks);

    return {
      rigProfile: "pose-driven",
      poseAnchors: {
        head,
        torsoCenter: hips,
        leftShoulder,
        rightShoulder,
        leftHand,
        rightHand,
        leftKnee,
        rightKnee
      },
      poseDelta: {
        x: motion.dx,
        y: motion.dy,
        z: motion.dz,
        motionMagnitude: motion.magnitude
      },
      poseContinuity: {
        anchorBias: Math.max(0, 1 - motion.magnitude * 2),
        rigStability: Number(Math.max(0, 1 - motion.magnitude * 2.4).toFixed(4)),
        continuityMode: motion.magnitude > 0.12 ? "dynamic" : "stable"
      },
      headCenter: {
        x: head.x,
        y: head.y,
        z: head.z ?? 0
      }
    };
  }
}
