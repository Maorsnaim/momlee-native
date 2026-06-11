---
description: "Full compliance audit of the existing MomLee codebase against every momlee-guide gate. Report only — no refactors, no renames."
argument-hint: "[optional focus: architecture|tokens|rtl|state|analytics|security|deps|components|all]"
---

# MomLee Compliance Audit — review everything built so far

Audit the existing app codebase (the **momlee-native** branch working tree)
against ALL momlee-guide rules. `$ARGUMENTS` may narrow the focus; default is
`all`. **This is a REVIEW: do not fix, rename, or refactor anything** — the
output is a findings report (per **momlee-architecture-review**: recommend
first, wait for approval). Track progress with one TodoWrite item per area.

First invoke **momlee-architecture-review** (the protocol + report format),
then load the relevant skill for each area as you audit it.

## Areas & what to scan

1. **Architecture Gate** (momlee-react-native) — grep `apps/` screens and
   components for direct Supabase imports/calls (`@supabase/`, `supabase.`,
   `from '../lib/supabase'`), business logic in components, missing
   service/repository layering. Flow must be Screen → Hook → Service →
   Repository → Supabase (minimum: Screen → Service → Repository).
2. **Tokens-only** (momlee-design-system) — raw hex colors, raw px sizes,
   raw `fontFamily` strings, `font-medium/semibold/bold` classNames, values
   that bypass `@momlee/tokens`. Compare against `design-system/tokens.md`.
3. **RTL** (momlee-rtl) — forbidden physical classes (`ml-/mr-/pl-/pr-/
   text-left/text-right/rounded-l/border-l`…), `marginLeft`/`paddingRight`
   style keys, `textAlign: 'left'|'right'`, raw `Text` outside the approved
   internals, `app.json` `extra.supportsRTL/forcesRTL` flags present.
4. **State Management Guard** — `useEffect`+`useState` server fetching,
   server data mirrored into stores, Zustand usage outside the approved list,
   forms not on RHF+Zod.
5. **Analytics Gate** (momlee-analytics) — direct `posthog.capture`/SDK
   imports outside the wrapper, event names off-taxonomy or wrong format
   (must be `object_action` snake_case past-tense), PII in payloads (phone,
   full name, child name, exact birth date, address, message content).
6. **Security & storage** (momlee-security, momlee-privacy) — tokens/session
   in AsyncStorage (must be expo-secure-store pattern), secrets in client
   code or committed `.env`, `select('*')` on PII tables, `__DEV__` bypasses,
   non-public keys in `EXPO_PUBLIC_*`.
7. **Dependencies** (stack.md Dependency Governance) — diff `package.json`
   against the approved stack table; flag anything not listed (each needs a
   retroactive DEPENDENCY GATE or removal).
8. **Components & naming** (momlee-design-system, conventions) — components
   in code missing from `design-system/components.md`, duplicates/synonyms
   of existing primitives, names that diverge from Figma component names,
   files not `kebab-case` / components not `PascalCase`.
9. **Migrations** (momlee-migration) — migrations without RLS in the same
   file for new tables; `database.types.ts` staleness vs migrations.

## Method

- Evidence first: grep → then READ each hit to confirm (no false positives in
  the report). Cite `file:line` for every finding.
- Use the plugin's canonical docs as the rulebook (`knowledge/*`,
  `design-system/*`) — not memory.
- If information needed to judge a finding is missing from official sources,
  that's a **momlee-prompt-guard** moment: mark it OPEN QUESTION, don't guess.

## Output (the only deliverable)

1. **Summary table** — area · findings count · worst priority.
2. **Architecture Observations** block (the momlee-architecture-review
   format): Issue / Impact / Recommendation / Priority per finding, grouped
   by area, ordered High → Low.
3. **Remediation checklist** — proposed fix order (quick wins first, then
   structural), each item sized (S/M/L). DO NOT execute any of it without
   Maor's approval.
4. Offer to log the High-priority items via **momlee-worklog** and to append
   the checklist to the plugin's `planning/open-tasks.md`.
