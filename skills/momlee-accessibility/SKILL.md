---
name: momlee-accessibility
description: Use whenever you build or edit ANY MomLee native UI — every screen, control, form, image, or interactive element. Enforces React Native accessibility (accessible/role/label/hint/state), minimum 44x44pt hit targets, WCAG AA contrast against tokens, Dynamic Type / font scaling, logical RTL-aware focus and reading order, Hebrew labels via t(), hidden decorative images, and form label↔input association with error announcement. Self-contained; references the optional /accessibility-review command for a deeper pass. Trigger on any MomLee UI build.
---

# MomLee Accessibility — ship usable for everyone

Accessibility is built in, not bolted on. This skill is self-contained and works without any external command.

## React Native a11y essentials

- Set `accessible`, `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, and `accessibilityState` on interactive elements (buttons, toggles, inputs, links). State (selected/disabled/checked/expanded) must be announced, not just shown visually.
- **Hit targets ≥ 44×44 pt.** Small icons get padding or `hitSlop` to reach the minimum.
- **Contrast: WCAG AA** (4.5:1 body text, 3:1 large text / UI). Verify color pairs against `@momlee/tokens` (see **momlee-design-system**) — a brand color is not exempt.
- **Dynamic Type / font scaling** — respect the OS text size; layouts must reflow without clipping. Don't disable scaling.
- **Logical focus & reading order** — follows the visual order and respects **RTL** (see **momlee-rtl**). Group related elements so VoiceOver/TalkBack reads them coherently.
- **Labels in Hebrew via `t()`** — accessibility labels are user-facing strings; never hardcode them (see **momlee-rtl**).
- **Decorative images hidden** — `accessible={false}` / `importantForAccessibility="no"` / `accessibilityElementsHidden` so screen readers skip them. Meaningful images get a real label.
- **Forms** — each input is associated with its label; errors are announced (live region / `accessibilityLiveRegion` / focus to the error), not only shown in red.

## Pre-ship a11y checklist

- [ ] Every interactive element has a role + label (+ hint where the action isn't obvious).
- [ ] State changes (selected/disabled/loading/error) are announced.
- [ ] All touch targets ≥ 44×44 pt.
- [ ] Text/background contrast meets AA against the tokens used.
- [ ] Screen tested at the largest Dynamic Type setting — no clipping or overlap.
- [ ] VoiceOver (iOS) reading order is logical and correct in RTL.
- [ ] Decorative images are hidden; meaningful ones are labeled.
- [ ] Form errors are announced and inputs are label-associated.
- [ ] All a11y strings come from `t()` (Hebrew).

## Optional deeper pass

For a more thorough audit, run the **/accessibility-review** command. It is optional — this skill's checklist is the minimum bar every screen must clear before ship.

Conventions (a11y line): `../../knowledge/conventions.md`.
