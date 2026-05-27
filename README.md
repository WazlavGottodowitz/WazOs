# WazOS // Nocturne UI

A modular darkmode redesign of the WazOS renderer shell.

## Files

- `index.html` — redesigned GUI shell
- `css/theme.css` — visual system and responsive layout
- `js/state.js` — defaults, persistence, helpers
- `js/bridge.js` — formal postMessage bridge client
- `js/renderer.js` — bridge-first, standalone-fallback render engine
- `js/timeline.js` — sequence buffer store
- `js/ui.js` — DOM rendering and interaction layer
- `js/app.js` — app bootstrap and wiring
- `BRIDGE-CONTRACT.md` — explicit parent/child message schema

## Notes

This version is intended to cover the previous 4→3→2→1 priorities:

4. split into modular files
3. formalize bridge contract
2. make it friendlier for the Perchance renderer setup
1. supersede the old raw shell with a more robust UI
