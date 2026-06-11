---
name: momlee-naming
description: Use BEFORE naming anything new in MomLee — a file, folder, component, hook, service, route, table, column, enum, or analytics event — and BEFORE translating any Figma layer name into code. Enforces the canonical glossary (one entity one name, no synonyms ever), the format conventions per artifact kind, and the Figma Layer Naming Guard (auto-generated layer names like "Frame 12" / "Group" / "Rectangle" / "Component 1" are never copied into code). Trigger on any naming moment, any new identifier, or any Figma-to-code translation.
---

# MomLee Naming Gate — one entity, one name

> Names are the cheapest thing to get right and the most expensive to fix
> later. Every new identifier passes this gate BEFORE it exists.

## The gate (run before naming anything new)

1. **Entity terms → the glossary.** Every domain word in the name comes from
   `../../knowledge/glossary.md`. **No synonyms, ever** — if the table says
   `meetup`, there is no `event`; if it says `mom`, there is no `mother`.
   A concept missing from the glossary = STOP, Maor names it and adds the row
   first (**momlee-prompt-guard**).
2. **Format → by artifact kind** (full: `../../knowledge/conventions.md`):
   files/folders `kebab-case` · components `PascalCase` = the **Figma
   component name** · hooks `useX` · routes file-based `kebab-case` ·
   tables/columns/enums `snake_case` with exact names from
   `../../knowledge/data-model.md` · analytics events `object_action`
   snake_case past-tense (`../../knowledge/analytics.md`).
3. **For a new table/column/enum, component, or analytics event** — print the
   check before creating it:

```
NAMING: <the new identifier>
- Kind + format: <file/component/hook/route/table/column/enum/event → its convention>
- Glossary terms used: <which canonical terms; zero synonyms>
- Name source: <Figma component set / glossary / data-model / existing convention>
```

Files and hooks don't need the printed block — just comply.

## Figma Layer Naming Guard

**Auto-generated Figma layer names are NEVER copied into code:** `Frame 12`,
`Group 7`, `Rectangle`, `Ellipse`, `Text`, `Component 1`, `Vector`,
`instance` — none of these are names; they are the absence of a name.

When the layer you're implementing has an auto-generated name, resolve the
REAL name in this order:

1. **The component set name** (e.g. the layer is an instance of
   `Buttons/Social button` → the name comes from the set).
2. **The annotation** — the screen/state block usually names the element.
3. **The parent component / frame context** (e.g. an unnamed text inside
   `Forms/PhoneField` is the field's label or value — name it for its role).
4. **The glossary** — the domain term for what it represents.

If none of these yields a meaningful name: **STOP and ask Maor**
(momlee-prompt-guard), and recommend renaming the layer in Figma so the next
pull is unambiguous (an **Architecture Observation**, Low priority).

## Existing bad names

Finding an existing synonym/auto-name in the codebase is a
**momlee-architecture-review** moment: keep using the existing canonical
convention for the task, report the finding, recommend — never silently
rename and never add a third name.

## Rationalizations — all mean STOP

| Excuse | Reality |
|---|---|
| "event is clearer than meetup here" | One entity, one name. Clarity comes from consistency, not local taste. |
| "The Figma layer is literally called Frame 12" | That's a missing name, not a name. Resolve it or ask. |
| "I'll call it baby_x to match baby_meetups" | Legacy `baby_*` is frozen, not a pattern. New identifiers use `child`. |
| "It's just an internal helper, the name doesn't matter" | Internal names leak into PRs, search results, and the next dev's vocabulary. |
