# Design Tokens

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

> **Figma is the runtime source of truth; this file is a maintained snapshot.
> Update on every token change and log it in CHANGELOG.md.**

Harvested 2026-06-10 from the Mom onboarding screens (Welcome, Phone
Empty/Error, BabyType Selected) via the Figma MCP. Code mirror:
**`packages/tokens` (`@momlee/tokens`)** in the app repo — raw tokens + a
Tailwind/NativeWind preset. Items marked *provisional* were not observed yet.

## Colors

| Token (Figma) | Value | Use |
|---|---|---|
| colors/background/bg-primary | `#faf8f6` | App background (warm off-white) |
| colors/background/bg-primary_hover | `#fafafa` | Hover/pressed surface |
| colors/background/bg-quaternary | `#e5e5e5` | Progress track etc. |
| colors/background/bg-brand-solid | `#b05f64` | Primary brand (mauve) — CTA |
| colors/foreground/fg-brand-secondary-(400) | `#c07f83` | Progress fill |
| colors/text/text-primary-(900) | `#171717` | Headings/primary text |
| colors/text/text-secondary-(700) | `#404040` | Secondary text / filled input |
| colors/text/text-tertiary-(600) | `#525252` | Tertiary/legal text, Skip |
| colors/text/text-white | `#ffffff` | Text on brand |
| colors/text/text-error-primary-(500) | `#b54141` | Error text |
| colors/text/input/empty | `#a3a3a3` | Placeholder |
| colors/border/border-primary | `#d4d4d4` | Default borders (Back button) |
| colors/border/input/empty | `#a3a3a3` | Input underline (empty) |
| colors/border/input/focused | `#404040` | Input underline (focused/filled) |
| colors/brand/velvet/100 | `#efdfe0` | Soft brand tint (girl option bg) |
| component-colors/utility/brand/utility-brand-500 | `#b05f64` | Selected option border |
| colors/pastel-blue/100 | `#eef5fb` | Boy option bg |
| colors/effects/shadows/shadow-skeumorphic-inner-border | `rgba(0,0,0,0.18)` | Inner border shadow |

## Spacing (FULL scale — sheet 5245:372829)

`none 0 · xxs 2 · xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20 · 3xl 24 · 4xl 32 · 5xl 40 · 6xl 48 · 7xl 64 · 8xl 80 · 9xl 96 · 10xl 128 · 11xl 160`

## Radius (FULL scale — sheet 5253:372274)

`none 0 · xxs 2 · xs 4 · sm 6 · md 8 · lg 10 · xl 12 · 2xl 16 · 3xl 20 · 4xl 24 · full 9999`

## Typography

Family: **Noto Sans Hebrew** (OFL). Weights in use: 400 / 500 / 600 / 700.
Reference ONLY via the `fontFamily.sans` role token.

FULL scale confirmed from the Typography sheet (node 1023:36715, 2026-06-11):

| Size token | px / line-height |
|---|---|
| text-xs | 12 / 18 |
| text-sm | 14 / 20 |
| text-md | 16 / 24 |
| text-lg | 18 / 28 |
| text-xl | 20 / 30 |
| display-xs | 24 / 32 |
| display-sm | 30 / 38 (OTP digits) |
| display-md | 36 / 44 |
| display-lg | 48 / 60 |
| display-xl | 60 / 72 |
| display-2xl | 72 / 90 |

> Component-level overrides are not scale changes: the Input uses a tighter
> line-height on iOS (INPUT_TEXT_STYLE, owner-approved deviation).

## ⚠️ Gaps found in Figma (for Maor to fix in the file) — consolidated audit 2026-06-11

**Off-scale raw values inside the DS component sets themselves:**
- `Buttons/Button` (all hierarchies): padding `14px/10px` — neither 10 nor 14 exists in the spacing scale (…8, 12, 16…).
- `Buttons/Social button`: raw `gap: 10px` between label and logo.

**RESOLVED (2026-06-12):** Maor fixed the OTP field set — new `xs` variant
(64 box, display-sm digits) matches the screens; component renamed `OTP Field
base`. New tokens: `border-brand_alt` + `text-brand-tertiary_alt` (#b05f64).

**Unresolved variable name:** the FullNameField check icon bakes `#16a34a`
(green-600); the bound Figma variable name could not be resolved — Maor to
confirm the token name (code interim: `utility.success`).

**Per-screen issues:**

- **Stray font:** the phone error text uses `Brown LL Heb: Medium` instead of Noto Sans Hebrew (Phone/UnsupportedCountryError screen).
- **Untokenized literals:** CTA padding `14px`; gaps `10px`/`4px`/`6px`; option-circle padding `10px`; boy-option border `#739fd2` (no token, unlike the girl `utility-brand-500`); `text-black` on option labels; screen 08 background is literal `white` vs `bg-primary` elsewhere; Skip button has raw `14px/20px` instead of text-sm tokens.
- All scales are now CONFIRMED from the documentation sheets — nothing provisional remains.

> Note: `font-family/font-family-body` maps to the `fontFamily.sans` role token — always reference typography via the role token in code, never the raw family name.
