---
name: momlee-design-system
description: Use whenever you style ANY MomLee UI — choosing or applying colors, spacing, typography, radius, or shadows; reading design tokens; deciding whether to build a new component; or when a token is missing. Enforces tokens-only (zero hardcoded values), Noto Sans Hebrew via the fontFamily.sans role token, reuse-before-create, annotations-as-logic, and the token update flow between Maor's Figma snapshot and Sivan's build. Trigger on any color/spacing/typography/radius/shadow decision in MomLee code.
---

# MomLee Design System — tokens-only

The design system is the law for every visual value. Figma is the runtime source of truth; `../../design-system/tokens.md` is the maintained snapshot.

## Tokens-only (non-negotiable)

- **Zero hardcoded** color, spacing, typography, radius, or shadow. Every value comes from `@momlee/tokens`. No raw hex, no raw px, no inline numbers.
- Read tokens **live from Figma** via `get_design_context` — its output contains the variable references, e.g. `--colors/background/bg-brand-solid: #b05f64`, `--spacing-lg: 12px`, `--radius-md: 8px`. These are mirrored in `../../design-system/tokens.md`.
- Known seed tokens (partial — onboarding only): `bg-brand-solid #b05f64`, `text-white`, `spacing-xxs/sm/lg = 2/6/12px`, `radius-md 8px`, `text-md = 16px/24px`. Full table: `../../design-system/tokens.md`.

## Typography — Noto Sans Hebrew

- The official font is **Noto Sans Hebrew** (OFL, full Hebrew coverage — free to ship). Never Google Sans.
- Reference the family **only through the `fontFamily.sans` role token**. NEVER a raw family name, a font file path, or a raw size/weight.
- Sizes and line-heights are tokens too (e.g. `text-md` = 16/24), never hardcoded numbers.

## Reuse before create

**One Figma component = one code component** in the shared `@momlee/ui` layer. Reuse before create; a design change happens in one place and propagates. Never fork a component to tweak it locally. Check `../../design-system/components.md` before building any new primitive.

## Annotations are logic

Figma annotations are the behavior spec — states (loading/empty/error/full), visibility conditions, validations, role permissions, edge cases. Code that contradicts an annotation is a bug. See `../../design-system/annotations.md`.

## Missing token? Add in Figma first

If a value you need has no token: **add it in Figma first**, then mirror it in `../../design-system/tokens.md` and log it in `../../design-system/CHANGELOG.md`. Never invent a raw value in code as a stopgap.

## Token update flow (Maor → Sivan)

1. Maor edits the token in Figma, updates the `../../design-system/tokens.md` snapshot, and logs the change in `../../design-system/CHANGELOG.md`.
2. Maor pushes; Sivan pulls.
3. `/momlee-sync-tokens` can draft the snapshot/CHANGELOG update from the live Figma values for review.

Keep the snapshot and CHANGELOG honest — they are the offline contract between the two maintainers.
