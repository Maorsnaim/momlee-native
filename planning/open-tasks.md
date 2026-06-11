# Open tasks — read me on every pull

> Maor-maintained. Flows to Sivan via git. This is the live "what's pending /
> what changed" channel between us. Check it whenever you update the plugin.

## 🔐 Security audit (2026-06-09) — STATUS

**Maor ran a security audit and FIXED the holes in code** (app repo, commit
`c432dad` on `momlee-native`, report: `docs/audit/SECURITY_FIXES_2026-06-09.md`
in the app repo). What was fixed:

1. Public storage buckets → **private + signed URLs**.
2. **CRITICAL:** a broad `users` RLS policy exposed every mom's email+phone →
   removed; safe view **`public.user_display_info`** (id, display_name,
   avatar_url ONLY) is now the only way to show users to other users.
   (Pattern codified in `../knowledge/security.md` §24.)
3. `.env` was tracked in git → untracked + `.gitignore` fixed.
4. 16 hardcoded Mapbox tokens → moved to env.
5. 6 legacy Edge Functions (service-role + open CORS) → **deleted from the repo**.
6. `/api/geocode` had no auth/rate-limit → now authenticated + 30 req/min.

### ⚠️ Still PENDING — the live environment is NOT yet protected

The code is fixed, but the fixes are not live until these run against
**production Supabase** (coordinate with Maor before touching live):

- [ ] Apply migration `20260609200000` to the **live** database
      (buckets + `users` RLS + `user_display_info` view).
- [ ] **Delete the 6 legacy Edge Functions from the Supabase dashboard**
      (they're gone from the repo, but still deployed and callable).
- [ ] **Rotate the exposed tokens** (Mapbox; any key that lived in the
      committed `.env`), update env/secret stores accordingly.

**Until then:** treat the live DB as if the holes are still open — don't build
anything that depends on the old public buckets or on querying `users` directly.
New code MUST follow the fixed patterns (signed URLs, `user_display_info`,
env tokens) so it's correct the moment the deployment lands.

## Bind every session + retro-audit (2026-06-11) — NEW

Two new pieces close the enforcement loop:

- [ ] **Copy `templates/app-repo-CLAUDE.md` → app repo root as `CLAUDE.md`**
      (momlee-native branch, commit it). From then on EVERY Claude session in
      the repo — any model, any machine — reads the contract at session start,
      checks the plugin is installed, and is bound to the gates.
- [ ] **Run `/momlee-audit` once** in an app-repo session (after updating the
      plugin) — full compliance review of everything built so far against all
      the new gates. Report only; fixes get approved by Maor first.

## Architecture & Naming Review Obligation (2026-06-11) — NEW skill

New skill **momlee-architecture-review**: during ANY task, existing
inconsistencies (naming conflicts, duplicate concepts, drift, legacy patterns,
architectural violations) must be surfaced — never silently ignored. Protocol:
continue on the canonical convention, no automatic refactors, no renames
without approval, document + recommend in the "Architecture Observations"
format (Issue / Impact / Recommendation / Priority), and log durable findings
to the worklog so Maor sees them. Consistency over perfection — but obvious
better directions get surfaced, not buried. No action needed beyond updating
the plugin.

## Core Technology Stack — Iron Law (2026-06-11, Maor) — READ stack.md

`knowledge/stack.md` now carries the full canonical stack rules: Expo Router
(file-based, never React Navigation directly), TanStack Query (centralized
query keys), RHF+Zod for every form, the backend flow (minimum acceptable:
Screen → Service → Repository; Screen → Supabase forbidden), the PostHog
wrapper (`analytics.track` ✅ / `posthog.capture` ❌), **expo-secure-store**,
Reanimated + Gesture Handler, Gorhom sheets, **Zustand (restricted list:
session/locale/direction/feature-flags/temp-onboarding/global-UI — never
server data)**, **date-fns**, **expo-location**, and the Dependency
Governance 4 questions (no approval = STOP).

- [ ] **Sivan: migrate the Supabase session storage to expo-secure-store.**
      The current client (`apps/mobile/src/lib/supabase.ts`) persists the
      session in AsyncStorage — now forbidden for tokens. Use a SecureStore
      storage adapter for the Supabase client. (Note: SecureStore values are
      capped at 2KB each — Supabase sessions can exceed it; the standard
      pattern is an AES-key-in-SecureStore + encrypted-payload-in-AsyncStorage
      adapter, e.g. Supabase's documented Expo recipe. Pick with Maor if
      unsure.)
- [ ] **Sivan: add `expo-secure-store`, `date-fns`, `expo-location`, `zustand`**
      as each becomes needed (all stack-approved now; Expo modules are Expo
      Go safe).

## State Management Guard + Dependency Budget (2026-06-11) — NEW, in momlee-react-native

**State has ONE home** (Maor's decision; TanStack Query + React Hook Form are
now stack-approved): UI state = local `useState`; server state = **TanStack
Query** in feature hooks (queryFn → service → repository); form state =
**React Hook Form** + Zod resolver; global client state = ONLY if nothing else
fits, per-store Maor approval (no Zustand-by-default). Never copy server data
into a client store.

**Dependency Budget:** don't add a dependency if the feature can be built in
under 100 LOC with the existing stack; every dependency prints a
`DEPENDENCY GATE` block (under-100-LOC test, justification, cost) and needs
Maor's approval + a `stack.md` row in the same change.

- [ ] **Sivan: add `@tanstack/react-query` + `react-hook-form` (+ Zod resolver)**
      when the first data-fetching/form screen needs them — both JS-only,
      Expo Go safe. Until then nothing to install.

## Analytics: PostHog via wrapper (2026-06-11, Maor's decision) + Analytics Gate

**Tool decided: PostHog** (supersedes the first-party-only plan from
2026-06-10). Everything goes through ONE abstraction —
`@momlee/core/analytics` (`analytics.track('otp_requested', {...})`) — with
`providers/posthog.provider.ts` as the only file importing the SDK. **Never
call PostHog (or any analytics SDK) directly from screens/components.** The
event taxonomy is STABLE (seed list in `knowledge/analytics.md`); payloads are
PII-free (`baby_age_range` ✅, `baby_birth_date` ❌).

Also live: skill **momlee-analytics** — every feature prints an
`ANALYTICS GATE` block at plan time (events / verification / success KPI
traced to WSMA) and isn't "done" until events are SEEN landing.

- [ ] **Sivan: scaffold the wrapper** — `packages/core/analytics/`
      (`analytics.ts`, `analytics.types.ts` typed taxonomy,
      `providers/posthog.provider.ts`), fail-soft without env key; migrate the
      existing `logEvent` console stub into it (same event names).
- [ ] **Sivan: add `posthog-react-native`** (now stack-approved — verify Expo
      Go compatibility on install; if it needs native code, defer the SDK to
      the EAS dev-client stage and keep the fail-soft console provider until then).
- [ ] **Maor: provide the PostHog project key + host** (`EXPO_PUBLIC_POSTHOG_KEY`,
      EU/US cloud choice) and update the privacy policy / store labels to name
      PostHog as a processor (data-inventory row already updated).

## Migration Gate (2026-06-11) — NEW, hard gate before any DB change

New skill **momlee-migration**: every database change (table/column, RLS
policy, enum, view, bucket, schema-touching Edge Function) must print a
`MIGRATION GATE` block BEFORE any SQL: migration file + rollback plan + RLS
impact + affected tables + affected APIs. New tables ship RLS in the same
migration; destructive changes need a backup step + Maor's approval; the live
DB stays Maor-coordinated; `database.types.ts` is regenerated before and after.
No action needed beyond updating the plugin.

## Component Reuse Audit (2026-06-11) — NEW, hard gate before any new component

"Reuse before create" is now a **proven audit**, not a guideline (upgraded in
**momlee-design-system**; figma-first rule #2 and /momlee-screen step 6 point at
it). Before creating ANY component, Claude must search `components.md` (both
tables) + the Figma inventory + the code, by name AND synonyms
(Sheet/Modal/Drawer, Badge/Chip/Tag…), print a `REUSE AUDIT` proof block, and
verdict REUSE → EXTEND → CREATE. Base primitives (Button, Input, Card, Avatar,
Badge, Sheet) are presumed to exist — a second one is a duplicate. A CREATE
verdict requires the component in Figma first + a row in `components.md` in the
same change. No action needed beyond updating the plugin.

## AI Prompt Guard (2026-06-11) — NEW, applies to everything

New skill **momlee-prompt-guard**: if information is not in an official source
(Figma, annotations, design-system/, knowledge/, planning/, or an explicit
instruction), it does not exist — STOP and ask; never invent. A missing
component (e.g. no Time Picker in the design system) means that part is
**blocked until Maor designs it** — build the rest, log the blocker. This is
also iron rule #4 in **momlee-figma-first**. No action needed beyond updating
the plugin — just know the rule is now binding for every Claude session.

## Architecture Gate (2026-06-11) — NEW, applies to all data wiring

The layered call chain **Screen → Hook → Service → Repository → Supabase** is now
a hard rule (see `../knowledge/architecture.md` → "The layered call chain" and the
updated **momlee-react-native** skill). Screens never import Supabase; business
logic lives only in services; only the repository layer touches the client.

- [ ] **Wire the lint enforcement** in the app repo: eslint `no-restricted-imports`
      so `@supabase/*` / the Supabase client import only inside the repository
      layer, and `apps/*` cannot import `@momlee/supabase`. Config sketch is in
      `architecture.md`. Until the lint rule lands, the rule is still binding —
      review for it manually.
- [ ] If any existing screen already calls Supabase directly, refactor it into the
      chain before building on top of it.

## Dev-environment notes (already in effect)

- The app is pinned to **Expo SDK 54** so the App Store **Expo Go** runs it on a
  real iPhone via QR (SDK 56 was rejected by Expo Go). Don't bump the SDK
  without checking Expo Go support. See `../knowledge/dev-environment.md`.
- pnpm monorepo with `node-linker=hoisted` (required for Metro). After pulling
  dep changes: `pnpm install` from the repo root.
