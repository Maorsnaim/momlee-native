# Design Tokens

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

> **Figma is the runtime source of truth; this file is a maintained snapshot.
> Update on every token change and log it in CHANGELOG.md. SEED — only
> onboarding tokens extracted so far; partial.**

## Known tokens

| Token | Value | Type |
|-------|-------|------|
| colors/background/bg-brand-solid | #b05f64 | color (primary brand — pink/mauve) |
| colors/text/text-white | white | color |
| font-family/font-family-body | Noto Sans Hebrew (Semibold) | typography |
| font-size/text-md | 16px | typography |
| line-height/text-md | 24px | typography |
| spacing-xxs | 2px | spacing |
| spacing-sm | 6px | spacing |
| spacing-lg | 12px | spacing |
| radius-md | 8px | radius |

## Typography

- **Family:** Noto Sans Hebrew (OFL, full Hebrew coverage).
- Reference the family via the **`fontFamily.sans` ROLE token only** — **never** a
  raw family name, a font file, or a raw size.
- **Sizes and line-heights are tokens**, never hardcoded numbers:
  - `text-md` = 16px / 24px (size / line-height).
