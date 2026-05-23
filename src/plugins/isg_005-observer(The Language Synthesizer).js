export default class AdvancedRenderObserver {
  constructor() {
    this.metadata = { name: "Semantic Prompt Compiler", id: "wazg_obs_v5" };
  }

  async apply(seed, context) {
    const anatomy = context.lastOutput || {};
    
    if (!anatomy.appendages) {
      context.terminal("OBSERVER WARN: Input pipeline empty. Falling back.");
      return "[Structure: Baseline Entity Configuration]";
    }

    const headData = anatomy.head ? `[Face Expression Vector: eyes=${anatomy.head.eyes}, mouth=${anatomy.head.mouth.toFixed(2)}]` : "[Face: Obscured/None]";
    const spineData = anatomy.spine ? `[Spine Flexion: ${anatomy.spine.verticalTranslation.toFixed(1)} units, rotation: ${anatomy.spine.torsionalRotation.toFixed(1)}deg]` : "[Spine: Rigid Structural Axis]";
    
    const limbMetrics = anatomy.appendages.map(l => {
      return `${l.limbIdentifier}(Step:${l.kinematics.stepHeight}, Ext:${l.kinematics.extensionDistance})`;
    }).join(', ');

    const combinedOutputString = `Anatomy Blueprint: Profile=[${anatomy.profile.toUpperCase()}], ${spineData}, ${headData}, Appendage Matrix=[${limbMetrics}]`;

    context.terminal(`OBSERVER: Compiled string generation array.`);
    return combinedOutputString;
  }
}