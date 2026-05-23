export default class AudioQuantizationMatrix {
  constructor() {
    this.metadata = { name: "BPM Grid Quantizer Engine", id: "wazg_quant_019" };
    this.bpm = 148; // Perfektes Psytrance-Tempo
  }

  async apply(seed, context) {
    let currentPayload = context.lastOutput;
    
    // Berechnung der Zeitfenster für ein perfektes 4/4 Raster
    const msPerBeat = (60 / this.bpm) * 1000; // ~405.4ms bei 148 BPM
    const msPerSixteenth = msPerBeat / 4;     // ~101.3ms für schnelle Acid-Slices
    
    const deviceTime = performance.now();
    const currentGridPosition = deviceTime % msPerBeat;
    
    // Magnetischer Snap-Faktor (Wie nah war der Tap am echten Kick-Schlag?)
    const snapOffset = currentGridPosition < msPerBeat / 2 ? currentGridPosition : msPerBeat - currentGridPosition;

    let quantTokens = `[AUDIO SYNC: Master Tempo ${this.bpm} BPM locked]`;
    quantTokens += `, [GRID RESOLUTION: 1/16 Step Array (${msPerSixteenth.toFixed(1)}ms intervals)]`;
    quantTokens += `, [SYNC DEVIATION: Snap Variance ${snapOffset.toFixed(2)}ms]`;

    if (snapOffset < 25) {
      context.terminal(`[isg_019] QUANTIZER: Perfect Grid Snap! Step-Impuls exakt auf Kickdrum eingerastet.`);
      quantTokens += `, [MUTATION STRENGTH: Peak Velocity 1.0 (Quantized)]`;
    } else {
      quantTokens += `, [MUTATION STRENGTH: Micro-Delayed Phase Shift]`;
    }

    return currentPayload + " || " + quantTokens;
  }
}