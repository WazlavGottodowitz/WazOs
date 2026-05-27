# WazOs analysis and improvement notes

## What I analyzed

1. Raw child renderer source:
   - `https://raw.githubusercontent.com/wazlavgottodowitz/WazOs/refactor/modular-architecture/index.html`
2. Live host page / actual renderer wrapper:
   - `https://perchance.org/wazos-mobile-architecture-v2`

## Key architectural finding

The raw HTML is the **child renderer UI**, but the live Perchance version is the **hosted execution environment** that appears to supply the real image-generation bridge.

The source code sends:

- outbound: `WAZ_GENERATE`
- inbound success: `WAZ_RENDER_DONE`
- inbound error: `WAZ_RENDER_ERROR`

So the raw page alone is not fully functional unless a parent frame responds.

## Problems in the original raw HTML

### Functional
- `GENERATE` depends entirely on `window.parent.postMessage(...)`.
- No standalone fallback when the page is opened directly.
- `batch` and `flags` fields are mostly cosmetic in the child renderer.
- Resolution changes resize the frame UI, but there is no responsive fit logic for small screens.

### Mobile / UX
- Fixed large preview sizes overflow on smaller devices.
- Hidden tab-only structure makes the raw page less aligned with the Perchance mobile renderer, where all major sections are effectively accessible in one flow.
- Global `user-select: none` hurts prompt editing and text interaction.
- Terminal uses `innerHTML` appends instead of safe node-based logging.

### Security / robustness
- `postMessage` target origin is `"*"`.
- Incoming messages are not correlated with a request ID.
- Incoming `error` text is injected into the log through HTML strings.
- Timeline uses string-built `innerHTML` instead of DOM creation.

### Maintainability
- One large script block with tightly coupled DOM logic.
- Several comments claim behavior that was only partially implemented.
- No persistence of prompt/settings across reloads.

## Improvements implemented in `wazos-improved.html`

### Reliability
- Added **standalone fallback renderer** for when no parent host answers.
- Added **bridge timeout handling**.
- Added **requestId correlation** for render responses.
- Added safer origin checks based on referrer / trusted origins.

### UX / mobile
- Added **responsive frame fitting** so large buffers remain usable on smaller screens.
- Kept desktop tab behavior, but on mobile the panels can stack naturally.
- Added prompt copy, open-image, reset, clear-buffer, and sync-current actions.
- Added local persistence for prompt, negative, style, resolution, flags, batch, zoom, and active tab.

### Code quality
- Reworked the logic into modules:
  - `Utils`
  - `Storage`
  - `Logger`
  - `UI`
  - `Bridge`
  - `Renderer`
  - `Actions`
- Replaced HTML-string logging with safe DOM node appends.
- Replaced timeline HTML string assembly with DOM creation.

### Visual / product alignment
- Preserved the original WazOs green-on-black terminal identity.
- Added explicit bridge contract display in the CORE panel.
- Added better mode badges:
  - standalone
  - bridge-ready
  - bridge-live

## Output files

- Improved renderer: `wazos-improved.html`
- This analysis: `wazos-analysis.md`

## Suggested next step

If you want, the next iteration should be:

1. extract the JS into separate modules/files,
2. formalize the parent/child bridge schema,
3. add batch thumbnail generation,
4. add export/import of frame sequences,
5. mirror the Perchance host behavior more exactly.
