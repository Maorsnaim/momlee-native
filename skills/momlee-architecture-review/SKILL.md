---
name: momlee-architecture-review
description: Use DURING any MomLee task the moment you notice an existing inconsistency — conflicting naming, duplicate concepts, multiple names for one domain entity, inconsistent files/folders/components/routes/analytics/DB terminology, architectural violations, or legacy patterns that contradict current standards — and whenever asked to review the architecture. Also use as a lightweight self-review before finishing structural work. Enforces: never silently ignore drift; continue on the canonical convention; never rename or mass-refactor without approval; document + recommend in the Architecture Observations format.
---

# MomLee Architecture & Naming Review — surface drift, don't ship it

> **Maintaining consistency is not enough.** You are also responsible for
> identifying existing inconsistencies, architectural drift, and naming debt
> that already live in the project. The goal is not only to follow the
> architecture — it is to help improve it over time while preserving stability.

## What counts as a finding

During ANY task, if you discover:

- Conflicting naming conventions · multiple names for the same domain entity
- Duplicate concepts (components → run the **Component Reuse Audit**; this skill covers the rest: hooks, services, types, utils)
- Inconsistent file organization / folder structure
- Inconsistent component, route, or analytics naming
- Inconsistent database terminology
- Architectural violations (e.g. a screen talking to Supabase — **Architecture Gate**)
- Legacy patterns that contradict current standards

**Do not silently ignore them.**

## Required behavior on discovery

1. **Continue the requested task** using the existing canonical convention
   (the glossary in `../../knowledge/conventions.md` + `data-model.md`;
   `provider`/`parent` DB naming stays — never "fix" it inline).
2. **Do NOT perform large-scale refactors automatically.**
3. **Do NOT rename** files, tables, routes, or components without approval.
4. **Document the inconsistency** — the Architecture Observations block below.
5. **Provide a recommendation** — then WAIT for approval.

Durable findings must reach Maor, not die in the chat: log them via
**momlee-worklog** (`Type: Decision`, `Status: Planned`) or
`../../planning/from-sivan.md`.

## Architecture Review Mode (lightweight, when relevant)

Before finishing structural work, ask:

- Does this follow existing project conventions?
- Does this create technical debt?
- Does this introduce a SECOND way of doing the same thing?
- Does this duplicate an existing concept?
- Will this still make sense in 6-12 months?
- Does this conflict with the current architecture?

If concerns are found — surface them.

## Recommendation format (include ONLY when observations exist)

End your response with:

```
Architecture Observations

1.
Issue:
...

Impact:
...

Recommendation:
...

Priority:
Low / Medium / High
```

## Refactoring policy

You MAY recommend: naming improvements, folder structure improvements,
component/hook/service consolidation, analytics cleanup, database cleanup,
design-system cleanup, architecture improvements.

You may NOT execute large refactors without approval. **Recommend first. Wait
for approval.**

## Long-term maintainability rule

**Prefer consistency over perfection.** Match what exists even when you'd
design it differently. However — if a better architectural direction becomes
obvious, do not stay silent. Surface the recommendation clearly, with the
migration cost, and let Maor decide.
