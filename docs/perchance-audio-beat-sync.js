<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WazOs Audio Beat Sync UI</title>
  <style>
    :root {
      --bg: #0c1014;
      --panel: #121a1f;
      --panel-alt: #172028;
      --line: rgba(255,255,255,0.08);
      --accent: #72f7c6;
      --accent-2: #92c7ff;
      --text: #eef7f2;
      --muted: #aebec3;
      --warning: #ffbf75;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Segoe UI", sans-serif;
    }

    .layout {
      max-width: 1280px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 18px;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.24);
    }

    .audio-host {
      position: relative;
      overflow: hidden;
      background: #020508;
      border: 1px solid var(--line);
      border-radius: 12px;
      min-height: 260px;
    }

    audio {
      width: 100%;
      display: block;
      background: #000;
      border-radius: 12px;
    }

    .controls { display: grid; gap: 12px; }
    label {
      display: grid;
      gap: 6px;
      text-transform: uppercase;
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.08em;
    }

    input[type="file"], input[type="range"], input[type="number"], select {
      width: 100%;
      border: 1px solid var(--line);
      background: var(--panel-alt);
      color: var(--text);
      border-radius: 10px;
      padding: 10px 12px;
    }

    input[type="range"] {
      accent-color: var(--accent);
      padding: 0;
      height: 26px;
    }

    .button-row {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }

    button {
      flex: 1;
      border: none;
      border-radius: 10px;
      padding: 12px 14px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), #4fd6a0);
      color: #03170f;
      cursor: pointer;
    }

    button.secondary {
      background: linear-gradient(135deg, var(--accent-2), #77c2ff);
      color: #041b2d;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .metric {
      background: var(--panel-alt);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
    }

    .metric .label {
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .metric .value {
      margin-top: 6px;
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
    }

    .prompt {
      margin-top: 18px;
      min-height: 240px;
      background: #0a1015;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      color: var(--accent);
      white-space: pre-wrap;
      line-height: 1.7;
      font-size: 12px;
    }

    .beat-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .beat-chip {
      background: rgba(114, 247, 198, 0.12);
      color: var(--accent);
      border: 1px solid rgba(114, 247, 198, 0.3);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="layout">
    <section class="panel">
      <div class="audio-host">
        <audio id="audio" controls></audio>
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="label">BPM</div>
          <div class="value" id="bpmValue">0.00</div>
        </div>
        <div class="metric">
          <div class="label">Beat Count</div>
          <div class="value" id="beatCountValue">0</div>
        </div>
        <div class="metric">
          <div class="label">Loop Start</div>
          <div class="value" id="loopStartValue">0.00s</div>
        </div>
        <div class="metric">
          <div class="label">Loop End</div>
          <div class="value" id="loopEndValue">0.00s</div>
        </div>
      </div>

      <div class="beat-list" id="beatList"></div>
    </*

