export default class KinematicRetargeter {
  constructor() {
    this.metadata = { name: "Anatomy Retargeter Matrix", id: "wazg_retargeter" };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    const body = packet.bodyMatrix || { gait: "static", spineY: 0, twist: 0, globalPhase: 0, amplitude: 0 };
    const uiSubrigs = packet.subRigs || { head: true, hands: true, feet: true, spine: true };

    let configuredLimbs = 5; 
    if (packet.rigProfile === "biped") configuredLimbs = 2;
    if (packet.rigProfile === "arachnid") configuredLimbs = 8;

    const anatomyLayout = {
      profile: packet.rigProfile || "pentapod",
      totalLimbs: configuredLimbs,
      spine: uiSubrigs.spine ? {
        verticalTranslation: body.spineY * 12,
        torsionalRotation: body.twist * 25,
        angularOffset: packet.offsetAngle || 0
      } : null,
      head: uiSubrigs.head ? { ...packet.faceMatrix } : null,
      appendages: []
    };

    for (let i = 0; i < configuredLimbs; i++) {
      const phaseSpread = (i / configuredLimbs) * Math.PI * 2;
      let localStep = 0;
      let localExtension = 0;

      if (body.gait === "alternating") {
        localStep = Math.max(0, Math.sin((body.globalPhase * Math.PI * 8) + phaseSpread)) * body.amplitude * 15;
        localExtension = Math.cos((body.globalPhase * Math.PI * 8) + phaseSpread) * body.amplitude * 10;
      } else if (body.gait === "synchronized") {
        localStep = Math.max(0, Math.sin(body.globalPhase * Math.PI * 8)) * body.amplitude * 22;
        localExtension = Math.sin(body.globalPhase * Math.PI * 8) * body.amplitude * 15;
      } else if (body.gait === "spiral") {
        localStep = Math.sin((body.globalPhase * Math.PI * 4) + phaseSpread) * 8;
        localExtension = body.twist * 20;
      } else {
        localStep = Math.sin(phaseSpread) * body.amplitude * 2;
      }

      anatomyLayout.appendages.push({
        limbIdentifier: `joint_chain_${i}`,
        kinematics: {
          stepHeight: parseFloat(localStep.toFixed(2)),
          extensionDistance: parseFloat(localExtension.toFixed(2))
        },
        manipulators: uiSubrigs.hands ? { gripState: Math.abs(Math.sin(phaseSpread)) } : null,
        groundContact: uiSubrigs.feet ? { anklePitch: 12 } : null
      });
    }

    context.terminal(`RETARGETER: Mapped ${configuredLimbs} appendages via Profile [${packet.rigProfile}]`);
    return anatomyLayout;
  }
}