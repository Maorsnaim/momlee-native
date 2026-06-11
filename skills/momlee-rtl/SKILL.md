---
name: momlee-rtl
description: Use whenever you write or edit ANY MomLee UI that involves layout, direction, text, spacing edges, icons, or user-facing strings. MomLee is RTL-first (he-IL). Enforces logical properties only (never left/right), a single locale-derived direction engine, derived dir/I18nManager at bootstrap, zero hardcoded strings (all via t()), Intl for numbers/dates/₪, directional-icon mirroring, future LTR as one switch, and the RTL QA checklist. Trigger on any layout, styling-edge, icon, or text decision in MomLee code.
---

# MomLee RTL — RTL-first (he-IL)

> ## 🚨 TOP PRIORITY — RTL must NEVER regress (Maor, explicit)
> An RTL bug is **release-blocking**, not polish. Before declaring ANY screen
> done, run the **RTL verification gate**:
> 1. **Manifest check:** `app.json → expo.extra: { supportsRTL: true, forcesRTL: true }` exists. Runtime `I18nManager.forceRTL` alone does NOTHING in Expo Go.
> 2. **Layout probe:** check where a row's FIRST child lands — it must be on the visual RIGHT. Do not judge by text alignment (Hebrew right-aligns even in LTR).
> 3. **Pixel measurement:** screenshot the simulator and measure a heading's right edge against the container edge (e.g. PIL band-bounds). "Looks right" is not verification.
> 4. **Text primitive:** all text goes through the AppText primitive (textAlign 'auto' — physical 'right' FLIPS to visual left under native RTL).

MomLee is **RTL-first (he-IL)**. LTR (future expansion) must be a **single switch** — never a per-screen rewrite.

## Logical properties ONLY

Use logical Tailwind/NativeWind classes; the same class flips automatically by direction. The forbidden → mandatory table:

| Forbidden | Mandatory |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left` / `right` | `start` / `end` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |
| `border-l-*` / `border-r-*` | `border-s-*` / `border-e-*` |

Also never `marginLeft` / `paddingRight` etc. in style objects.

## Direction engine

- **Single locale → derived direction.** Direction (`rtl`/`ltr`) is derived from the active i18n locale by the `@momlee/i18n` engine — never hardcoded per screen.
- **Web (when it returns):** `<html lang={locale} dir={direction}>` — derived, never a hardcoded `dir="rtl"` literal.
- **Native:** at bootstrap, `I18nManager.allowRTL(true); I18nManager.forceRTL(direction === 'rtl')`.

## Zero hardcoded strings

- Every user-facing string via `t('namespace.key')` from `@momlee/i18n`. **he** is the default and source of truth. No literal Hebrew (or English) text in components.
- Numbers, dates, and currency via `Intl` (₪, he-IL) — never manual formatting.

## Icons & content

- **Directional icons** (back/next arrows, chevrons) mirror by direction (mirrored variant or `scale-x-[-1]`). **Logos and content images do NOT mirror.**

## Future LTR = one switch

Because direction is locale-derived and all edges are logical, enabling LTR is a single locale/direction switch — never a per-screen rewrite.

## RTL QA checklist (before shipping a flow)

- **Navigation** — back/drawers open from the correct side.
- **Forms** — labels, inputs, validation, phone `+972` prefix all align RTL.
- **Chat** — own vs other bubbles on correct sides.
- **Notifications** — text + layout RTL.
- **Mapbox** — controls/popups RTL; map content itself is not mirrored.
- **Emails** — templates `dir="rtl"`.
- **Test every screen in RTL**, plus an LTR smoke test to confirm the switch holds.

Conventions: `../../knowledge/conventions.md`. i18n package: `../../knowledge/architecture.md`.

## ⚠️ Expo Go: runtime forceRTL is NOT enough (learned 2026-06-10)

`I18nManager.allowRTL/forceRTL` **does not flip layout in Expo Go** — the host app sets direction natively before JS runs. The REQUIRED mechanism is the manifest:

```json
// app.json → expo
"extra": { "supportsRTL": true, "forcesRTL": true }
```

Keep the runtime calls as a safety net for dev-client/standalone builds, but never trust them alone. **Symptom of missing manifest flags:** the whole app silently renders LTR (rows mirrored vs Figma) while Hebrew text still right-aligns — verify direction with a layout element (e.g. where a row's first child lands), not with text alignment.

Related bidi rules (same lesson):
- A Hebrew paragraph that STARTS with a Latin word (e.g. "Momlee יוצרת...") needs `style={{ writingDirection: 'rtl' }}` or the first-strong-character heuristic lays it out LTR.
- Digit/phone rows and brand-icon rows that must stay visually LTR get an explicit `style={{ direction: 'ltr' }}` — don't rely on the ambient direction.

## The AppText primitive (mandatory pattern)

RTL is enforced by ONE primitive, not per-screen patches: every user-facing
text goes through **`AppText`** (`apps/mobile/src/components/AppText.tsx` — fix path if moved), which applies `writingDirection:'rtl'` + **`textAlign:'auto'`** by default with an `align` prop (`right`|`center`|`ltr`). Raw `Text` from react-native is allowed only inside AppText/UnderlineField internals; textAlign utility classNames are forbidden.

**Why `auto` and not `right`:** with native RTL active, React Native treats `textAlign 'left'/'right'` LOGICALLY — `'right'` renders at the **visual left**. `'auto'` follows the layout direction (RTL → visual right). This was verified by pixel measurement on the simulator; don't "fix" it back.
