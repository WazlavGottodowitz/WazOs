# WazOS Nocturne Bridge Contract

This redesign formalizes the renderer bridge between the **child UI** and the **parent host**.

## Outbound event

```json
{
  "type": "WAZ_GENERATE",
  "requestId": "string",
  "prompt": "string",
  "negative": "string",
  "resolution": "768x768",
  "flags": "string",
  "batch": 1,
  "seed": "optional string"
}
```

## Inbound success

```json
{
  "type": "WAZ_RENDER_DONE",
  "requestId": "string",
  "url": "https://...",
  "meta": {
    "provider": "optional",
    "model": "optional"
  }
}
```

## Inbound error

```json
{
  "type": "WAZ_RENDER_ERROR",
  "requestId": "string",
  "error": "human readable error"
}
```

## Behavior

1. Child UI sends `WAZ_GENERATE`.
2. Parent renderer performs generation.
3. Parent returns `WAZ_RENDER_DONE` or `WAZ_RENDER_ERROR` with the same `requestId`.
4. If the parent does not answer before timeout, the child falls back to a standalone image URL builder.

## Perchance optimization notes

- Prefer `document.referrer` origin for the `postMessage` target when embedded.
- Accept only responses from the parent frame and trusted origins.
- Correlate all replies by `requestId`.
- Keep a direct-open fallback so the raw file still works outside Perchance.
