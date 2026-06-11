---
name: momlee-figma-first
description: Use BEFORE building or editing ANY MomLee native UI (Expo / React Native) — screen, component, or visual element — and whenever a Figma URL appears. This is the ENTRY GATE for all MomLee UI work. Enforces the Figma-first workflow (pull design context, tokens, and annotations from the MomLee Figma file before writing a line of code), tokens-only styling, reuse-before-create, RTL-first, and routes you to the right companion skill (design-system, react-native, rtl, accessibility, security, privacy, store-release, docs). Trigger whenever implementing a MomLee screen/component, translating a design to code, or when a figma.com URL is involved.
---

# MomLee Figma-First — the entry gate

The Figma file is the **source of truth** for both visuals AND logic. Annotations in Figma define behavior. You build UI **from** Figma, never from imagination. This skill is the gate that opens every MomLee UI task and routes to the depth.

> Shared, living plugin. Canonical depth lives in `../../knowledge/*.md` and `../../design-system/*.md`. If a rule here is stale, fix it in the canonical doc — don't work around it.

## PREREQUISITES — check first, STOP if not met

**Stay in sync with Maor (once per work session):** at the start of a session — or if it's been a few days — remind the user (Sivan) to pull Maor's latest rules/knowledge/design-system updates:

```
/plugin marketplace update momlee
/plugin install momlee-guide@momlee
```

(Both lines — the update alone refreshes the marketplace, the install pulls the new plugin version into the cache.)

Then check `../../planning/open-tasks.md` for new status or pending actions. Maor pushes updates (tokens, rules, security notes, roadmap) through this plugin — working against a stale copy means building against stale rules. This is a reminder, not a blocker: suggest it once, don't nag every message.

Before anything else, confirm the **Figma MCP is connected**. The primary tools (`get_design_context`, `get_metadata`) need it. If the Figma MCP is not connected / not responding, **STOP** and tell the user: "The Figma MCP server isn't connected — please connect it before I build any UI." Do not build from imagination.

## The Iron Law

> **Annotations are part of the pull — never skip them.** If a node's design
> context is too large to read inline, EXTRACT the `data-development-annotations`
> / `data-behavior-annotations` attributes from the saved output anyway (grep
> the file). Skipping them cost us a full rework once (bottom sheet instead of
> the annotated type-to-search dropdown, missing Israel default).

Before writing a single line of UI code, you MUST pull context from Figma. No exceptions, no "this is simple enough."

## The MomLee Figma file

- **File:** Momlee Design System — https://www.figma.com/design/zDwy1JIV8htDxYluYTPbfq/Momlee-Design-System
- **fileKey:** `zDwy1JIV8htDxYluYTPbfq`
- Node `16819:38317` = **Flows/Screens** — the Mom onboarding flow (~30 iPhone screens @ 402px). Only this flow is designed so far, and it is **not final**. No Pro surface yet.
- Full node map + URL parsing: **../../design-system/figma.md**.
- Parse any Figma URL `figma.com/design/:fileKey/...?node-id=:nodeId` — convert `-` to `:` in the nodeId (`16819-38317` → `16819:38317`).

### Figma MCP nuance (important)
- `get_design_context` and `get_metadata` work **remotely** with just `fileKey` + `nodeId` — these are your primary tools. `get_design_context` output contains the token variable references (e.g. `--colors/background/bg-brand-solid: #b05f64`), so it is how you read tokens without the desktop app.
- `get_variable_defs` does **NOT** work remotely — it errors `"nothing selected"` unless Figma Desktop is open with a layer selected. Prefer `get_design_context`.

### MANDATORY companion skills (load before the MCP write/diagram tools)
- Before `use_figma` → load **figma-use** (mandatory).
- Before `create_new_file` → load **figma-create-new-file** (mandatory).
- Before `generate_diagram` → load **figma-generate-diagram** (mandatory).

## Mandatory per-screen workflow (one TodoWrite item per step)

1. **Locate the node** — get the Figma URL / node-id for what you're building. If unknown, ask. (URL parsing above.)
2. **Pull design context** — `get_design_context` (+ `get_metadata`, screenshot) on the node. Understand structure, layout, hierarchy, states.
3. **Map values → tokens** — read the variables from the design context; map every value to the token system. NEVER copy a raw hex/px into code. Missing token → add it in Figma first, then mirror in `../../design-system/tokens.md`.
4. **Read annotations** — they are the spec (states, visibility, validations, role permissions, edge cases). Code that contradicts an annotation is a bug. See `../../design-system/annotations.md`.
5. **Component Reuse Audit** — before building ANY new component, run the mandatory audit from **momlee-design-system**: search `../../design-system/components.md`, the Figma component inventory, and the code (name + synonyms), and print the `REUSE AUDIT` proof block with a REUSE / EXTEND / CREATE verdict. No audit block = no new component.
6. **Build it** — following the four iron rules, RTL-first, with the security/privacy gates wired in.

## Four iron rules

1. **Tokens only.** Zero hardcoded color/spacing/typography/radius/shadow. Typography is Noto Sans Hebrew via the `fontFamily.sans` role token — never a raw family name, file, or size.
2. **Reuse before create — proven, not assumed.** Before ANY new component, run the **Component Reuse Audit** and print its proof block (search `components.md` + the Figma inventory + the code, by name AND synonyms; verdict REUSE → EXTEND → CREATE). See **momlee-design-system**. A design change happens in one place.
3. **Annotations = logic.** Implement every state and edge case the annotations describe.
4. **Never invent.** Anything not found in an official source (Figma, annotations, design-system, knowledge, planning, an explicit instruction) does not exist — STOP, report the gap, ask. A missing component means "blocked until Maor designs it", never a made-up `<CustomX />`. Full protocol: **momlee-prompt-guard**.

## Derive from Figma vs annotate (do NOT duplicate)

The Figma node already encodes most of the screen. **Read it from the file; never require a per-screen list of components in annotations.**

**Derived automatically from the node (NOT written in annotations):**
- **Screen name + state** — from the frame name, format `NN_Module/Sub/Screen/State` (e.g. `03_Onboarding/Mom/Phone/Empty`). The trailing segment is the state.
- **Component instances + variants** — from layer/component names (e.g. `Forms/PhoneField`, `Forms/CountryDropdown/iOS/Unselected/HE`, `CTA Next button`).
- **Layout, hierarchy, spacing, sizes, text content.**
- **Tokens/variables by name** (e.g. `colors/text/input/empty`, `spacing-xl`, `radius-md`).
- **Code-Connected components** → use the mapped `@momlee/ui` component directly. The frame's `data-development-annotations` attribute carries the logic annotation — read it.

**Annotations carry ONLY the logic layer** (full format: `../../design-system/annotations.md`): Purpose · Backend (calls/provider/abstraction) · Data (exact DB names) · Validation rules (`R1…`) · Events · Edge cases · Permissions · Privacy/Consent · what each CTA does next.

**Rule:** an annotation is *logic, not inventory*. Name components once in the library; read instances from the tree.

### Naming conventions
- **Anything NEW gets named through the momlee-naming gate** — glossary terms only (`../../knowledge/glossary.md`), and NEVER copy auto-generated layer names (`Frame 12`, `Group`, `Rectangle`, `Component 1`) into code.
- **Screen frames:** `NN_Module/Sub/Screen/State` — e.g. `03_Onboarding/Mom/Phone/Empty`, `08_Onboarding/Mom/Phone/UnsupportedCountryError`.
- **Components:** `Domain/Component/Platform/Variant/Locale` — e.g. `Forms/CountryDropdown/iOS/Unselected/HE`, `Forms/PhoneField`.
- Map each component to `@momlee/ui` via **Code Connect** (figma-code-connect) so every instance resolves to real code automatically — then component reuse needs no annotation at all.

## ROUTING — which companion skill applies

| When you are… | Use skill |
|---|---|
| Styling: choosing colors/spacing/type/radius/shadow, reading or adding tokens | **momlee-design-system** |
| Writing Expo/RN structure, NativeWind, data access (Screen → Hook → Service → Repository), state/forms decisions, adding a dependency, package boundaries | **momlee-react-native** |
| Anything directional: layout, logical props, i18n strings, `dir`/`I18nManager`, RTL QA | **momlee-rtl** |
| Accessibility: roles, labels, hit targets, contrast, focus order, Dynamic Type | **momlee-accessibility** |
| Wiring data/actions, auth, roles, validation, RLS, secrets, webhooks | **momlee-security** |
| ANY database change: table/column, RLS policy, enum, view, bucket (Migration Gate) | **momlee-migration** |
| Planning or finishing ANY feature: which events, how we verify, what KPI (Analytics Gate) | **momlee-analytics** |
| Handling KYC, location, PII, children's data, block/report, audit logging; ANY device permission, upload, or deletion/retention question | **momlee-privacy** |
| Data screens, async/critical actions (OTP, meetup, message, upload, location), error copy, loading/empty/error states, offline behavior | **momlee-resilience** |
| Preparing an App Store / Play submission | **momlee-store-release** |
| Recording what you built (purpose, node mapping, tokens/components, decisions) | **momlee-docs** |
| Finished a meaningful task → log it to the Notion Dev Changelog; leaving a task/update for Maor | **momlee-worklog** |
| Adding ANY new data collection: table/column, SDK, permission, analytics event | **momlee-data-inventory** |
| Something is MISSING from Figma/the docs (component, token, rule, copy, name) or you're about to assume | **momlee-prompt-guard** |
| NAMING anything new (file/component/hook/route/table/column/enum/event); translating a Figma layer name to code | **momlee-naming** |
| Spotted an EXISTING inconsistency (naming, duplicates, drift, legacy patterns); finishing structural work; asked to review architecture | **momlee-architecture-review** |

## Working preference
Per the repo's working rules: **do not execute code changes without explicit user approval** — present a plan/proposal first, then implement on approval. Full conventions: `../../knowledge/conventions.md`.

## The decision ladder — and when to STOP and ask (Maor, explicit, 2026-06-11)

For ANY visual/behavioral decision, the order of truth is:
1. The screen frame's **INSTANCE properties** (which variant the designer placed)
2. The **component set** (the variant's canonical styling)
3. **Annotations** on the frame

If after all three something is still unknown or ambiguous (a variant whose
meaning isn't clear, a missing state, a product behavior), **STOP and ask Maor
a focused question. Never ship a plausible guess.** Real cost of guessing:
social buttons shipped lg/20 when the screen instance was md/16; wide buttons
shipped 48 when the instance was 44 — every guess = a correction round.

### Case file: the improvised Top Nav (2026-06-11)

Adding a back button the screen frame didn't show (a product decision), the
assistant invented a shared row (back + heart) instead of opening the TEMPLATE
component — whose structure is explicit: `Top Nav Container` (back/skip) is
its OWN row ABOVE `Page Head`, and the heart NEVER leaves the Page Head start
side. Rule: when adding an element beyond the frame, the template/set defines
its placement — open it; if it's hidden/absent there too, ASK Maor.

