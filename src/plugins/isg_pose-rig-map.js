/**
 * isg_pose-rig-map.js
 * Converts pose landmarks into WazOs-compatible motion packets for continuity/rig alignment.
 */

export default class PoseRigMapper {
  constructor() {
    this.metadata = {
      name: "Pose-to-Rig Mapper",
      id: "wazg_pose_rig_mapper",
      version: "1.0.0"
    };
  }

  static getLandmark(landmarks, idx) {
    return landmarks && landmarks[idx] ? landmarks[idx] : null;
  }

  static calculateCentroid(landmarks = []) {
    const valid = landmarks.filter((lm) => lm && typeof lm.x === "number");
    if (!valid.length) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: valid.reduce((sum, lm) => sum + lm.x, 0) / valid.length,
      y: valid.reduce((sum, lm) => sum + lm.y, 0) / valid.length,
      z: valid.reduce((sum, lm) => sum + (lm.z ?? 0), 0) / valid.length
    };
  }

  static deltas(a = [], b = []) {
    const pa = a.length ? a : b;
    const pb = b.length ? b : a;

    return {
      x: Number(((pa[0]?.x ?? 0) - (pb[0]?.x ?? 0)).toFixed(4)),
      y: Number(((pa[0]?.y ?? 0) - (pb[0]?.y ?? 0)).toFixed(4)),
      z: Number(((pa[0]?.z ?? 0) - (pb[0]?.z ?? 0)).toFixed(4))
    };
  }

  static mapPoseToRigPacket(currentLandmarks = [], previousLandmarks = []) {
    if (!currentLandmarks.length) {
      return null;
    }

    const hips = PoseRigMapper.getLandmark(currentLandmarks, 11) || PoseRigMapper.getLandmark(currentLandmarks, 12) || PoseRigMapper.calculateCentroid(currentLandmarks);
    const head = PoseRigMapper.getLandmark(currentLandmarks, 0) || PoseRigMapper.calculateCentroid(currentLandmarks);
    const leftShoulder = PoseRigMapper.getLandmark(currentLandmarks, 11) || hips;
    const rightShoulder = PoseRigMapper.getLandmark(currentLandmarks, 12) || hips;
    const leftHand = PoseRigMapper.getLandmark(currentLandmarks, 15) || leftShoulder;
    const rightHand = PoseRigMapper.getLandmark(currentLandmarks, 16) || rightShoulder;
    const leftKnee = PoseRigMapper.getLandmark(currentLandmarks, 25) || hips;
    const rightKnee = PoseRigMapper.getLandmark(currentLandmarks, 26) || hips;

    const prev = previousLandmarks.length ? previousLandmarks : currentLandmarks;
    const delta = PoseRigMapper.deltas(currentLandmarks, prev);
    const motionMagnitude = Math.hypot(delta.x, delta.y);

    const torsoCenter = {
      x: hips.x,
      y: hips.y,
      z: hips.z ?? 0
    };

    const packet = {
      rigProfile: "pose-driven",
      poseAnchors: {
        head,
        torsoCenter,
        leftShoulder,
        rightShoulder,
        leftHand,
        rightHand,
        leftKnee,
        rightKnee
      },
      poseDelta: {
        x: delta.x,
        y: delta.y,
        z: delta.z,
        motionMagnitude: Number(motionMagnitude.toFixed(4))
      },
      poseContinuity: {
        anchorBias: Math.max(0, 1 - motionMagnitude * 2),
        rigStability: Number(Math.max(0, 1 - motionMagnitude * 2.4).toFixed(4)),
        continuityMode: motionMagnitude > 0.12 ? "dynamic" : "stable"
      },
      headCenter: { x: head.x, y: head.y, z: head.z ?? 0 }
    };

    return packet;
  }

  async apply(seed, context) {
    const incoming = context.lastOutput || {};
    const posePayload = incoming.pose || {};
    const current = posePayload.landmarks || [];
    const previous = incoming.lastPoseLandmarks || [];

    const mapped = PoseRigMapper.mapPoseToRigPacket(current, previous);

    return {
      ...incoming,
      lastPoseLandmarks: current,
      poseRigMapping: mapped,
      motionIntensity: mapped?.poseDelta?.motionMagnitude ?? 0,
      anchorStrength: mapped?.poseContinuity?.anchorBias ?? 0.5
    };
  }
}

if (typeof window !== "undefined") {
  window.PoseRigMapper = PoseRigMapper;
}
