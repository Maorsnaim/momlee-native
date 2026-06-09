# Annotations — the behavior spec

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

## What annotations are

Figma annotations are the **behavior spec** for each screen and component. They
capture everything the visual frame alone does not:

- **States** — loading / empty / error / full.
- **Visibility conditions** — when an element shows or hides.
- **Validations** — input rules, error messages, allowed values.
- **Role permissions** — what mom vs pro can see or do.
- **Edge cases** — unsupported inputs, partial data, failure paths.

**Code that contradicts an annotation is a bug.** The annotation wins; the code
is corrected to match it.

## Convention — recording notes here

When a behavior is decided but **not yet written into Figma**, Maor records it
here so Sivan still has the spec. Format:

```
### <Flow> → <Screen>
- **State:** <which state>
- **Condition / validation / permission / edge case:** <the rule>
- **Source:** Figma annotation | Maor note (not yet in Figma)
```

Once the note lands in Figma, it is the source of truth and the local note can
be trimmed to a pointer.

## Mom onboarding flow (first documented flow)

> Not final yet — screens and behavior may change.

Screen list, in order:

1. **Splash**
2. **Welcome**
3. **Phone** — country dropdown; supported / unsupported country; filled /
   focused states; unsupported-country error.
4. **OTP** — empty / filled.
5. **Name** — first / last focused; filled.
6. **BirthDate** — day / month / year focused; filled.
7. **BabyType** — empty; selected.

Per-screen annotation notes get appended under each screen above as they are
captured.
