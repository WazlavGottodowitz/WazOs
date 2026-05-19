========================================================================
WAZGOS MATRIX PLUGIN PACK (v6.1.5) - REPO INTEGRATIONEN
========================================================================

Dieses Paket enthält die aus aktuellen Open-Source-KI-Forschungen destillierten 
WazgOS-Inferenzmodule im geforderten "isg_###.function.js.txt" Format.

MODUL-ÜBERSICHT:

1. isg_009.applyTemporalDiffusionMatrix.js.txt
   - Basis: Awesome-Video-Diffusion (AnimateDiff)
   - Funktion: Erzwingt strikte zeitliche Konsistenz über die 720 Frames. 
     Verhindert das "Flimmern" oder Zusammenfallen der Charakter-Strukturen 
     (z. B. Hans Wurst) im latenten Raum von Frame zu Frame.

2. isg_010.applyCameraTrajectoryMatrix.js.txt
   - Basis: MotionCtrl / CameraCtrl
   - Funktion: Injiziert mathematische Vektoren für präzise 3D-Kamerafahrten 
     (Dolly-Zoom, Z-Achsen-Push, 14mm Weitwinkel-Verzerrung), anstatt die 
     Bewegung dem Zufall der Video-KI zu überlassen.

3. isg_011.applyStreamDiffusionMatrix.js.txt
   - Basis: StreamDiffusion Pipeline
   - Funktion: Aktiviert Echtzeit-Inferenz-Protokolle (Sub-10ms Target) durch 
     Residual Classifier-Free Guidance (RCFG). Optimiert für die direkte 
     Verarbeitung von mobilen Gyro-Sensor-Daten ohne Latenz.

4. isg_012.applyIPAdapterMatrix.js.txt
   - Basis: Tencent AI Lab IP-Adapter
   - Funktion: Extrahiert die visuelle "Stil-DNA" (Farbpalette, Konturen, Strichstärke) 
     aus dem ersten Frame/Asset und fixiert diesen Vibe über die gesamte Pipeline.

5. isg_013.applyDeforumAudioMatrix.js.txt
   - Basis: Deforum Stable Diffusion
   - Funktion: Kinetische Audio-Reaktivität für den Synth-Tab. Mapped Sidechain-Daten 
     instrumentaler Frequenzen (Acid Basslines, Hard Kicks) direkt auf Zoom und 
     Rotation. Enthält ein hard-coded Gatter, das alle Vocals/menschlichen Stimmen 
     isoliert und eliminiert.

========================================================================
INSTALLATIONSHINWEIS FÜR MOBILE BROWSER (PERCHANCE):
- Kopiere die .txt Dateien über deinen mobilen Dateimanager in den lokalen 
  Speicher deines Geräts.
- Lade sie im Core-Tab über den "→ Load External Module ←" Button direkt hoch.
========================================================================
