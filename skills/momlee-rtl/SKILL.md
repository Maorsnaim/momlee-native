---
name: momlee-rtl
description: Use whenever you write or edit ANY MomLee UI that involves layout, direction, text, spacing edges, icons, or user-facing strings. MomLee is RTL-first (he-IL). Enforces logical properties only (never left/right), a single locale-derived direction engine, derived dir/I18nManager at bootstrap, zero hardcoded strings (all via t()), Intl for numbers/dates/₪, directional-icon mirroring, future LTR as one switch, and the RTL QA checklist. Trigger on any layout, styling-edge, icon, or text decision in MomLee code.
---

# MomLee RTL — RTL-first (he-IL)

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
