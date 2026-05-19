export default class IPAdapterMatrix {
  constructor() {
    this.metadata = { name: "Asset Style Cloning", id: "wazg_ip_adapter_012" };
  }

  async apply(seed, context) {
    let currentPayload = context.lastOutput;
    
    const ipTokens = [
      "[STYLE INJECTION: IP-Adapter Cross-Attention active]",
      "[VISUAL DNA: Extracting global color palette and stroke weight from Frame 1]",
      "[WEIGHT: Image Prompt Weight 0.85, Text Prompt Weight 0.15]"
    ].join(", ");

    context.terminal(`[isg_012] IP-ADAPTER: Visual DNA Extractor an Asset gekoppelt.`);
    
    return currentPayload + " || " + ipTokens;
  }
}