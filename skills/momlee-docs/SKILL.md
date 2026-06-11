---
name: momlee-docs
description: Use whenever you finish building or changing a MomLee feature, screen, or reusable component — to document as you build. Records each feature's purpose, the screen↔Figma node-id mapping, tokens and components used, states/edge cases implemented, and decisions; updates ../../design-system/components.md when a new reusable component is created; keeps ../../design-system/CHANGELOG.md honest; and reflects plan changes in ../../planning/*. Concise over exhaustive. Trigger after completing or modifying any MomLee feature/component.
---

# MomLee Docs — document as you build

Documentation is part of "done", not a later chore. Keep it **concise > exhaustive** — a few accurate lines beat a wall of stale text.

## Per feature/screen, record

- **Purpose** — what the feature/screen does and for which role (mom / pro).
- **Screen ↔ Figma node-id mapping** — which Figma node each screen was built from (so the next person can re-pull). See `../../design-system/figma.md` for the node map and URL parsing.
- **Tokens & components used** — which `@momlee/tokens` and `@momlee/ui` primitives the screen relies on.
- **States & edge cases implemented** — loading/empty/error/full and any annotation-driven conditions (so the build can be checked against `../../design-system/annotations.md`).
- **Decisions** — anything non-obvious chosen during the build (and why), especially deviations or open questions.
- **Events & KPI** — the events the feature emits and the KPI it moves (the Analytics Gate block from **momlee-analytics**, including verification status).

## Update the living docs

- **New reusable component?** Add it to `../../design-system/components.md` (component, where used, reuse status). One Figma component = one code component — record it once.
- **Token added/changed?** Mirror in `../../design-system/tokens.md` and log it in `../../design-system/CHANGELOG.md` (see **momlee-design-system**). Keep the CHANGELOG honest — it's the offline contract with the other maintainer.
- **Plan/scope changed?** Reflect it in `../../planning/*` (features, roadmap) so the plan stays true to what's actually being built.

## Principle
Write what the next maintainer needs to continue without you. No more, no less.
