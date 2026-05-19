export default class UniversalMotionLibrary {
  constructor() {
    this.metadata = { name: "Universal Motion Matrix", id: "wazg_motion_lib" };
    
    this.expressions = {
      NEUTRAL:       { eyeOpen: 1.0, mouthSize: 0.0, browFurrow: 0.0, jawDrop: 0.0 },
      JOY:           { eyeOpen: 0.9, mouthSize: 0.8, browFurrow: 0.0, jawDrop: 0.2 },
      RAGE:          { eyeOpen: 1.0, mouthSize: 0.9, browFurrow: 1.0, jawDrop: 0.4 },
      ANXIETY:       { eyeOpen: 1.0, mouthSize: 0.3, browFurrow: 0.8, jawDrop: 0.1 },
      CONCENTRATION: { eyeOpen: 0.7, mouthSize: 0.0, browFurrow: 0.6, jawDrop: 0.0 }
    };

    this.motions = {
      IDLE:    { frequency: 1.0, amplitude: 0.2, spineTwist: 0.0, gaitStyle: "static" },
      WALK:    { frequency: 4.0, amplitude: 0.7, spineTwist: 0.2, gaitStyle: "alternating" },
      RUN:     { frequency: 8.0, amplitude: 1.2, spineTwist: 0.5, gaitStyle: "synchronized" },
      VORTEX:  { frequency: 6.0, amplitude: 1.0, spineTwist: 1.0, gaitStyle: "spiral" },
      DEFEND:  { frequency: 0.5, amplitude: 0.1, spineTwist: -0.3, gaitStyle: "crouched" }
    };
  }

  async apply(seed, context) {
    const ui = context.lastOutput || {};
    const frame = ui.activeFrame !== undefined ? ui.activeFrame : 0;
    
    const chosenExpression = ui.expressionPreset || "NEUTRAL";
    const chosenMotion = ui.motionPreset || "IDLE";

    const expressionData = this.expressions[chosenExpression] || this.expressions.NEUTRAL;
    const motionData = this.motions[chosenMotion] || this.motions.IDLE;

    const timePhase = (frame % 720) / 720;
    const wave = Math.sin(timePhase * Math.PI * 2 * motionData.frequency);

    const motionPacket = {
      ...ui,
      libraryMeta: { expression: chosenExpression, motion: chosenMotion },
      faceMatrix: {
        eyes: expressionData.eyeOpen,
        mouth: Math.min(1.0, expressionData.mouthSize + (wave * 0.03)),
        brows: expressionData.browFurrow
      },
      bodyMatrix: {
        gait: motionData.gaitStyle,
        amplitude: motionData.amplitude,
        spineY: wave * motionData.amplitude,
        twist: Math.cos(timePhase * Math.PI * 2) * motionData.spineTwist,
        globalPhase: timePhase
      }
    };

    context.terminal(`LIBRARY: Synced [Motion: ${chosenMotion} | Expression: ${chosenExpression}]`);
    return motionPacket;
  }
}