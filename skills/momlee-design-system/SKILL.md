---
name: momlee-design-system
description: Use whenever you style ANY MomLee UI — choosing or applying colors, spacing, typography, radius, or shadows; reading design tokens; when a token is missing; and BEFORE creating any component (Button, Input, Card, Avatar, Badge, Sheet, or anything else). Enforces tokens-only (zero hardcoded values), Noto Sans Hebrew via the fontFamily.sans role token, the mandatory Component Reuse Audit (prove you searched components.md + Figma inventory + code before creating), annotations-as-logic, and the token update flow between Maor's Figma snapshot and Sivan's build. Trigger on any color/spacing/typography/radius/shadow decision or any new-component moment in MomLee code.
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

## Component Reuse Audit — PROVE the search before creating (hard gate)

**One Figma component = one code component.** Never fork a component to tweak it locally. But "reuse before create" is not a vibe — it is an **audit you must run and SHOW** before creating ANY new component. A new component without the audit block is invalid, full stop.

**The three searches (all mandatory, in order):**
1. **`../../design-system/components.md`** — both tables (observed + built in code).
2. **The Figma component inventory** — component sets in the design file (the node map in `../../design-system/figma.md`; `get_metadata` / design context on the libraries).
3. **The codebase** — grep `@momlee/ui` and `apps/*/src/components/` for the name AND its synonyms.

**Search by function, not just name.** Before a "BottomSheet" search Sheet/Modal/Drawer/Popup; before a "Badge" search Chip/Tag/Pill; before an "Input" search Field/TextField; before a "Card" search Tile/ListItem; before an "Avatar" search ProfileImage. A duplicate under a different name is still a duplicate.

**Print this block in your response before writing the component:**

```
REUSE AUDIT: <ComponentName>
- components.md: searched <terms> -> <hit / no hit>
- Figma inventory: <where looked> -> <hit / no hit>
- Code (@momlee/ui + apps): grep <terms> -> <hit / no hit>
Verdict: REUSE <X> | EXTEND <X> (new variant/prop) | CREATE (no match anywhere)
```

**Verdict order is binding:** REUSE as-is → EXTEND the existing component with a variant/prop (per the Variants ↔ props rule below) → only if neither is possible, CREATE. Creating when EXTEND was possible is a bug.

**Base primitives are presumed to EXIST** — `Button`, `Input`, `Card`, `Avatar`, `Badge`, `Sheet` (wrapping `@gorhom/bottom-sheet`), `AppText`, `Icon`, `BrandMark`. A second one of these is almost always a duplicate; treat "I need a slightly different Button" as EXTEND, never CREATE.

**If the verdict is CREATE:** the component must exist in Figma first with Maor's name (**momlee-prompt-guard** — a component not in Figma is blocked, not invented), and the same change registers it in `components.md` (**momlee-docs**).

## Annotations are logic

Figma annotations are the behavior spec — states (loading/empty/error/full), visibility conditions, validations, role permissions, edge cases. Code that contradicts an annotation is a bug. See `../../design-system/annotations.md`.

## Missing token? Add in Figma first

If a value you need has no token: **add it in Figma first**, then mirror it in `../../design-system/tokens.md` and log it in `../../design-system/CHANGELOG.md`. Never invent a raw value in code as a stopgap.

## Token update flow (Maor → Sivan)

1. Maor edits the token in Figma, updates the `../../design-system/tokens.md` snapshot, and logs the change in `../../design-system/CHANGELOG.md`.
2. Maor pushes; Sivan pulls.
3. `/momlee-sync-tokens` can draft the snapshot/CHANGELOG update from the live Figma values for review.

Keep the snapshot and CHANGELOG honest — they are the offline contract between the two maintainers.

## Fonts on native — loading is NOT optional (learned 2026-06-10)

Declaring `fontFamily: 'Noto Sans Hebrew'` in tokens does NOTHING by itself on
native — RN silently falls back to the system font. Requirements:
1. Load the font in `_layout` via `@expo-google-fonts/noto-sans-hebrew` + `useFonts`, holding the splash until loaded.
2. **iOS does not map `fontWeight` onto custom fonts** — each weight is its own family (`NotoSansHebrew_500Medium`…). Weight selection lives in the `AppText` `weight` prop; `font-medium/semibold/bold` classNames are forbidden.
3. Verify by LOOKING at the rendered letterforms vs Figma — system-font fallback is silent.

## Fidelity rule — never invent styling

If it's not in the Figma node, it doesn't go in the code: no added corner
radii, shadows, colors or sizes "that look nice" (real case: rounded corners
were added to country flags — Figma has none). Component VARIANTS matter (the
heart logomark is not the full wordmark). Copy is diffed word-for-word against
the Figma text. Assets come from Figma (SVGs — sanitize `var(--fill-N, #hex)`
to literal colors; react-native-svg can't parse CSS vars).

## Figma Variants ↔ React props (one component per Figma component set)

A Figma component with Variables/variants maps to **ONE React component whose
props mirror those variables** — NOT to sibling components per variant (real
case: Button/IconCta/BackButton/SocialButton were wrongly four components;
consolidated into one `Button` with `kind: 'text' | 'icon' | 'social'`).
When variant prop-contracts diverge (label vs icon vs provider), use a
**discriminated union** so invalid combinations don't type-check. Internal
glyphs/assets (e.g. the Google "G") are implementation details, not inventory
components. Same for brand assets: one `BrandMark` with `variant:
'wordmark' | 'heart'`, not Logo + Logomark.

## Component hierarchy mirrors Figma EXACTLY (names included)

Figma's structure IS the code structure: base components (e.g. `Input`,
17297:8153, with State variants Empty/Focused/Filled/Error/Disabled and
ExtrasBefore/After slots) → field compositions (`Forms/PhoneField`,
`Forms/FullNameField`, `Forms/DateOfBirthField`, `Forms/CountryDropdown`)
compose the base. Use **Maor's component NAMES** — don't invent local names
(real case: the Input base was wrongly named `UnderlineField`; renamed).
Before building any field, pull its Figma component and its base.
