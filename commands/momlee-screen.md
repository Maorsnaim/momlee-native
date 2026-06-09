---
description: "Build a MomLee native screen from a Figma node, end-to-end via the figma-first workflow."
argument-hint: "[figma-url-or-node-id]"
---

# Build a MomLee screen from Figma

Build the native screen for the Figma node in `$ARGUMENTS`, end-to-end, by running
the **full MomLee figma-first workflow**. Do not skip steps and do not build from
imagination — the Figma file is the source of truth for both visuals AND logic.

Track progress with a **TodoWrite item per step** below.

## Steps

1. **Entry gate — invoke the `momlee-figma-first` skill FIRST.** It is the gate
   for all MomLee UI work. As part of this, confirm the **Figma MCP is connected**
   (`get_design_context` / `get_metadata` need it). If there is **no Figma MCP
   connection**, **STOP** and tell the user: "The Figma MCP server isn't connected
   — please connect it before I build any UI." Do not proceed.

2. **Parse the target node.** Take the Figma URL or node id from `$ARGUMENTS`.
   Figma URLs look like `figma.com/design/:fileKey/...?node-id=:nodeId`; convert
   `-` to `:` in the nodeId (e.g. `16819-38317` → `16819:38317`). If `$ARGUMENTS`
   is **empty**, ask the user which node/screen to build before continuing.

3. **Pull design context.** Run `get_design_context` (plus `get_metadata` and a
   screenshot via `get_screenshot`) on the node. These work remotely with just
   `fileKey` + `nodeId`. Read the **token variable references** the design context
   returns (e.g. `--colors/background/bg-brand-solid: #b05f64`) — that is how you
   read tokens. Understand structure, layout, hierarchy, and states.

4. **Map every value to tokens** per **momlee-design-system**. NEVER hardcode a
   color, spacing, size, radius, or shadow. Typography = **Noto Sans Hebrew via
   the `fontFamily.sans` role token** — never a raw family name, file, or size.
   If a token is missing, add it in Figma first, then mirror it in
   `design-system/tokens.md`.

5. **Read the annotations** — they are the spec. Implement every state,
   visibility rule, validation, role permission (mom-or-pro), and edge case they
   describe. Code that contradicts an annotation is a bug.

6. **Reuse check.** Search `design-system/components.md` (and `@momlee/ui`) for an
   existing component/primitive before creating anything new. Reuse before create.

7. **Build it** with Expo / React Native / NativeWind per **momlee-react-native**,
   **RTL-first** per **momlee-rtl** — logical properties only (no `left`/`right`),
   and all strings via `t()`.

8. **Accessibility pass** per **momlee-accessibility** (roles, labels, hit
   targets, contrast, focus order, Dynamic Type).

9. **Security & privacy.** If any data or actions are wired, apply
   **momlee-security** and **momlee-privacy** rules (auth, roles, validation, RLS,
   secrets, PII, etc.).

10. **Document** per **momlee-docs**: record the screen ↔ Figma node mapping, and
    update `design-system/components.md` if you created a new reusable component.

Per the repo's working rules, present a plan/proposal first and implement on
explicit user approval.
