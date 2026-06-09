# Figma — Momlee Design System

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

This file is the map to the Momlee Figma design file: where it lives, how to
read its structure, and how to access it through the Figma MCP.

## The file

- **Figma file:** Momlee Design System
- **URL:** https://www.figma.com/design/zDwy1JIV8htDxYluYTPbfq/Momlee-Design-System
- **fileKey:** `zDwy1JIV8htDxYluYTPbfq`

## Node map

| nodeId | Page | Contents |
|--------|------|----------|
| `16819:38317` | Flows/Screens | The **Mom onboarding flow** — ~30 iPhone screens at 402px width. |

> **Only the Mom onboarding flow has been designed so far, and it is NOT final
> yet.** No Pro surface, no other flows exist in Figma at this point. Treat
> everything as a moving target until Maor marks it final.

## URL → nodeId parsing

Figma URLs follow this shape:

```
figma.com/design/:fileKey/...?node-id=:nodeId
```

To turn a URL's `node-id` into the nodeId the MCP expects, **convert `-` to `:`**.

Example: `node-id=16819-38317` → nodeId `16819:38317`.

## MCP access notes (IMPORTANT)

- `get_design_context` and `get_metadata` work **REMOTELY** with just the
  **fileKey + nodeId** — no Figma Desktop app required.
- `get_design_context` output **contains the token variable references**, e.g.
  `--colors/background/bg-brand-solid: #b05f64`. This is how you read tokens
  without the desktop app.
- `get_variable_defs` does **NOT** work remotely — it errors with **"nothing
  selected"** unless the Figma Desktop app is open with a layer selected.
- **So: prefer `get_design_context` to read tokens.**
