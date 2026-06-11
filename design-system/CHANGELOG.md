# Design System Changelog

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

## 2026-06-09

- Initial snapshot seeded from the Mom onboarding flow. Font set to Noto Sans
  Hebrew (replaced Google Sans).

## 2026-06-10
- Full token harvest from onboarding screens (Welcome, Phone Empty/Error, BabyType Selected): 18 colors, full spacing scale (none-5xl), radii (md/xl/full), typography scale (xs-xl + display-xs line-height). Mirrored into `@momlee/tokens` in the app repo.
- Logged Figma gaps: stray `Brown LL Heb` font on error text, untokenized literals (CTA 14px padding, `#739fd2` boy border, `text-black`, screen-08 white bg), missing `spacing-2xl`/`radius-sm`.

## 2026-06-11
- Full type scale confirmed from the Typography sheet (11 steps; fixed text-lg 18/28, display-lg 48/60; added display-md/xl/2xl; display-xs confirmed 24/32). OTP digits = display-sm.
- Buttons/Button full API adopted in code: Hierarchy (incl. tertiary + link-color #6a393c text-brand-secondary-(700) + link-gray), Size xs-xl, Loading state.
- New tokens: text-brand-secondary-(700), input/disabled pair (#d4d4d4); Input base renamed/aligned to the Figma component (5 states + slots).
- Complete Variables sync: FULL spacing (none-11xl) + radius (none-4xl, sm fixed 4→6) scales from the documentation sheets; icons now from the Figma Icons library via base/Icon (Ionicons stand-ins removed); ProgressBar built; component folders reorganized to base/ + app/forms/ + app/templates/ per the design-system taxonomy.

