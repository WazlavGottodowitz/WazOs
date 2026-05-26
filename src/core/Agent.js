export const AGENT_COUNT = 16;
export const JOINTS = ["head","neck","l_shoulder","r_shoulder","l_elbow","r_elbow","l_wrist","r_wrist","pelvis","l_hip","r_hip","l_knee","r_knee","l_ankle","r_ankle","root"];
export const BONES = [[0,1],[1,2],[1,3],[2,4],[3,5],[4,6],[5,7],[1,8],[8,9],[8,10],[9,11],[10,12],[11,13],[12,14],[8,15]];

export class Agent {
  constructor(id) {
    this.id = id;
    this.joints = JOINTS.map(name => ({ name, x: 0, y: 0, z: 30, r: 30 }));
    this.seed = Math.floor(Math.random() * 1e9);
    this.style = "";
    this.pose = "";
  }

  // STRUCTURAL DOMINANCE: joints are invariant motion vectors
  getJoint3D(idx) {
    const j = this.joints[idx];
    return { x: j.x, y: j.y, z: j.z }; // z from radius for 2.5D
  }

  // S-CURVE MORPHING: LERP + SMOOTHSTEP
  static interpolate(a, b, t, fn = "smoothstep") {
    const smoothstep = x => x * x * (3 - 2 * x);
    const u = fn === "smoothstep"? smoothstep(t) : t;
    const res = new Agent(-1);
    res.joints = a.joints.map((aj, i) => ({
      name: aj.name,
      x: aj.x + (b.joints[i].x - aj.x) * u,
      y: aj.y + (b.joints[i].y - aj.y) * u,
      z: aj.z + (b.joints[i].z - aj.z) * u,
      r: aj.r + (b.joints[i].r - aj.r) * u
    }));
    return res;
  }

  clone() {
    return structuredClone(this);
  }
}
