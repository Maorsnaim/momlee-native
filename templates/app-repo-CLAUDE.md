# MomLee — Claude session contract (copy this file to the app repo root as CLAUDE.md)

> **Read this first. It binds every Claude session in this repository, on any
> Claude model.** This repo is governed by the **momlee-guide** plugin — the
> shared development contract between Maor (rules, design system, knowledge)
> and Sivan (build).

## Step 0 — the plugin MUST be active

If the `momlee-guide` skills (momlee-figma-first, momlee-react-native, …) are
NOT available in this session, STOP and tell the user to install:

```
/plugin marketplace add Maorsnaim/momlee-guide
/plugin install momlee-guide@momlee
```

If installed, refresh once per work session:

```
/plugin marketplace update momlee
/plugin install momlee-guide@momlee
```

Then read the plugin's `planning/open-tasks.md` for pending actions.

## The binding gates (non-negotiable, enforced by the plugin's skills)

- **momlee-figma-first** — the ENTRY GATE for all UI work. Figma is the source
  of truth; no Figma MCP = no UI work. Four iron rules: tokens only, reuse
  before create (proven), annotations = logic, never invent.
- **Architecture Gate** — `Screen → Hook → Service → Repository → Supabase`.
  A screen that imports Supabase is a bug. (momlee-react-native)
- **AI Prompt Guard** — information not in an official source (Figma,
  annotations, design-system/, knowledge/, planning/) does not exist: STOP and
  ask, never invent. (momlee-prompt-guard)
- **Component Reuse Audit** — proof block before creating ANY component.
  (momlee-design-system)
- **State Management Guard** — UI = local, server = TanStack Query, forms =
  RHF+Zod, global = Zustand restricted list only. (momlee-react-native)
- **Dependency Governance** — no new dependency without the gate + Maor's
  explicit approval. (momlee-react-native, knowledge/stack.md)
- **Migration Gate** — no DB change without migration + rollback + RLS impact
  + affected tables/APIs. (momlee-migration)
- **Analytics Gate** — every feature declares events / verification / KPI;
  PostHog only via `@momlee/core/analytics`. (momlee-analytics)
- **RTL is TOP PRIORITY** — an RTL bug is release-blocking. (momlee-rtl)
- **Security & privacy** — frontend is hostile; children-related data gets the
  highest care. (momlee-security, momlee-privacy)
- **Architecture Review Obligation** — surface existing inconsistencies;
  recommend, never auto-refactor. (momlee-architecture-review)

## Hard limits

- Do NOT modify the live database or deploy anything without Maor.
- Do NOT push to remotes without explicit permission.
- Native work happens on the **momlee-native** branch.
- Present a plan and get approval before implementing.

## Periodic compliance

Run `/momlee-audit` (from the plugin) to review the existing codebase against
all gates — report only, no auto-fixes.
