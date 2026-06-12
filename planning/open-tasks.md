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

### ✅ DEPLOYED TO LIVE (2026-06-12, via Maor's token)

The security migration (20260609200000) + onboarding_events (20260610120000)
+ phone-first signup (20260612210000) are APPLIED and VERIFIED on production:
buckets private, users RLS + user_display_info live, events table with RLS,
email/display_name nullable, phone-aware handle_new_user. A real OTP SMS
request returned 200. database.types.ts regenerated from live.

### ⚠️ Still PENDING from the original list

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

## Machine enforcement: full map (2026-06-11, commits ce1147a/940a6eb/921f9b1)

Three layers now run on every push/PR in the app repo: **eslint** (12+ rule
families: architecture, RTL incl. raw-Text ban, tokens-only incl. font-weights
+ fontFamily + arbitrary px, permissions, analytics SDK + PII payloads + event
format, select('*'), dates) and **CI scripts** (deps allowlist, migration
RLS/retention/rollback, RTL manifest flags, naming auto-layer-names +
synonyms, secrets/.env/public-env, figma screen-node refs). All verified
positive + negative.

- [ ] **Backfill Figma node refs** on the 5 grandfathered screens (index,
      welcome, phone, otp, name): add `// figma: <nodeId>` with the REAL node
      ids (don't guess — pull from the Figma map), then empty GRANDFATHERED in
      scripts/momlee/check-figma-refs.mjs.
- [ ] **Consider eslint-plugin-react-native-a11y** (accessibility gate at lint
      level: roles/labels/touchables) — new devDependency, so it needs the
      DEPENDENCY GATE + allowlist + verification it works with the Expo flat
      config. Recommended next mechanical step alongside RLS tests in CI.

## Worklog is now MECHANICALLY enforced (2026-06-11) — hooks in the plugin

The plugin now ships Claude Code **hooks** (`hooks/hooks.json`, Node script):
commit in a MomLee repo → session marked worklog-pending → ending the turn is
blocked once until a Dev-Changelog row is logged (or the git fallback /
explicit "trivial" note). This is harness-level enforcement — independent of
the model's memory.

- [ ] **Sivan: after the next `/plugin install momlee-guide@momlee`, restart
      the session** so the hooks load (Claude Code asks to approve plugin
      hooks on install — approve). Node is required (already in your env).

## Ten resilience & boundary gates (2026-06-11, Maor) — NEW

A second wave of gates is live (plugin 0.13.0):

1. **Module Boundaries** — onboarding ↛ meetups ↛ subscriptions ↛ moms
   directly; cross-module = the other module's PUBLIC service only
   (architecture.md + momlee-react-native).
2. **Error Handling Standard** — every error: specific Hebrew user message +
   dev log (no PII) + taxonomy analytics event when relevant + recovery
   action. Never "Something went wrong" (new skill **momlee-resilience**).
3. **Four states** — Loading/Empty/Error/Success on every data screen, via the
   shared pattern; missing Empty/Error designs in Figma = blocked part.
4. **Device Permission Gate** — location/notifications/camera/photos/contacts
   ONLY via the `@momlee/core/permissions` wrapper; in-context requests;
   denial is a designed state (momlee-privacy).
5. **Feature Flags** — every large/sensitive feature behind `<feature>_enabled`
   (provider_subscriptions_enabled, mom_discovery_enabled,
   identity_verification_enabled); kill = flip flag, never delete code.
6. **Copy source of truth** — new channel `knowledge/copy-guidelines.md`
   (feminine second person, warm+specific, Figma word-for-word, sensitive
   areas need Maor); no invented user-facing text, ever.
7. **Authorization ≠ UI visibility** — hiding a button is not a permission;
   DB/RLS/service enforce even when the screen is hidden (momlee-security #5).
8. **Offline/Network failure** — OTP, meetup, message, upload, location all
   define failure behavior; input never lost; no auto-retry on writes;
   airplane-mode test before done (momlee-resilience).
9. **Upload Gate** — every upload declares size limit, type allowlist, privacy
   class, bucket, access policy, delete policy (+ EXIF/GPS stripping)
   (momlee-privacy).
10. **Deletion/Retention** — no new data model without retention/deletion
    behavior; SOFT delete by default; new mandatory Retention field in the
    Migration Gate (momlee-privacy + momlee-data-inventory + momlee-migration).

Pending decisions/tasks:

- [ ] **Maor: feature-flags kill-switch mechanism** (server-controllable —
      e.g. a Supabase config row vs build-time only).
- [ ] **Maor: account-deletion cascade map** — decide per data type (photos,
      messages, children records, meetups, verification refs): cascade /
      anonymize / retain — fill the retention column in data-inventory.md.
- [ ] **Maor: Figma designs for shared Empty/Error states** (the four-states
      pattern needs designed visuals before the shared component is built).
- [ ] **Sivan: scaffold `@momlee/core/permissions`** (wrapper like analytics)
      when the first permission feature lands.

## Naming Gate + Glossary + milestone audits (2026-06-11) — NEW

- New skill **momlee-naming**: fires before naming ANYTHING new (file, folder,
  component, hook, service, route, table, column, enum, analytics event) and
  before translating Figma layers to code. Glossary terms only, format per
  artifact kind, printed NAMING check for tables/components/events.
- New channel **`knowledge/glossary.md`**: the canonical terms (mom, provider,
  child, meetup, organization, subscription, verification) with the frozen DB
  mappings and FORBIDDEN synonyms. **No synonyms, ever** — a new entity term
  enters only by Maor adding it to the glossary.
- **Figma Layer Naming Guard** (inside momlee-naming): auto-generated layer
  names (`Frame 12`, `Group`, `Rectangle`, `Component 1`) are never copied to
  code — resolve via component set → annotation → parent context → glossary,
  or STOP and ask.
- **`/momlee-audit` is now MANDATORY before closing any milestone** (sprint /
  complete flow / release) — see momlee-worklog. Milestone isn't Done until
  the audit ran and High findings are fixed or explicitly accepted by Maor.
- Drift cleanup: the stale live reference to `UnderlineField` in momlee-rtl
  now reads `Input` (historic note only).

## Bind every session + retro-audit (2026-06-11) — NEW

Two new pieces close the enforcement loop:

- [x] **DONE (2026-06-11, commit `d60a34f` on momlee-native):** the session
      contract was MERGED into the app repo's existing `CLAUDE.md` as a
      "READ FIRST" section (the web-era guide below it was kept; the plugin
      wins on conflicts). Awaiting push by Maor. Every Claude session in the
      repo now reads the contract at session start.
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

- [x] **DONE (2026-06-11, commit `ce1147a` on momlee-native): machine
      enforcement is LIVE in the app repo.** eslint gates (Architecture, RTL
      physical classes/keys, tokens-only hex, Permission wrapper, Analytics
      wrapper, Dates) in `apps/mobile/eslint.config.js` — CI runs lint, so a
      violation fails the build. Plus `scripts/momlee/check-deps.mjs`
      (Dependency Governance vs `stack-allowlist.json` — adding a dep requires
      editing the allowlist = explicit approval) and `check-migrations.mjs`
      (post-2026-06-12 migrations: RLS with CREATE TABLE + `-- retention:`
      declaration), wired as a CI step. Verified: current code passes clean;
      a violating test file trips all five gate families.
- [x] No existing screen calls Supabase directly (verified by the lint run —
      0 errors).

## Dev-environment notes (already in effect)

- The app is pinned to **Expo SDK 54** so the App Store **Expo Go** runs it on a
  real iPhone via QR (SDK 56 was rejected by Expo Go). Don't bump the SDK
  without checking Expo Go support. See `../knowledge/dev-environment.md`.
- pnpm monorepo with `node-linker=hoisted` (required for Metro). After pulling
  dep changes: `pnpm install` from the repo root.

## /momlee-audit round 2 — fixes landed (2026-06-11, commit a5a024a)

DONE (Maor approved "fix everything"): H1 session→expo-secure-store ·
H2 not-configured bypass now __DEV__-only · H3 analytics wrapper in
@momlee/core (typed taxonomy + providers; screens use analytics.track) ·
G1 lint gates now cover packages/ui+core (caught & fixed physical offsets in
OtpInput) · R1 CTA Loading state wired · L2 fontByWeight token · import dups.

STILL OPEN:
- [ ] PostHog: Maor's project key + dependency gate → providers/posthog.provider.ts
- [ ] Taxonomy decision (Maor): adopt `onboarding_step_viewed` or migrate to seed events
- [ ] Component FILE naming: conventions say kebab-case; component files are
      PascalCase (RN standard) — Maor to rule
- [ ] R3 offline handling (with the shared error/empty states work)
- [ ] M4 regenerate database.types.ts after the live migration applies
- [ ] Live security deploy (see the security section above)

## Mechanical-enforcement additions (2026-06-12)

Per Maor ("mechanical checks over memory text"): the asset-color lesson is
now machine-enforced — `check-token-provenance.mjs` in CI (every token value
must cite its Figma variable on the same line; caught touchTarget on run #1)
+ an eslint rule banning hex literals in color-like JSX props. Also live:
the TextInput writingDirection rule in check-rtl.mjs (caught OtpInput run #1).

## Still open after the live deploy (2026-06-12)
- [ ] Delete the 6 legacy Edge Functions from the Supabase dashboard (still deployed)
- [ ] Rotate Mapbox tokens (old exposure) + ROTATE THE TWILIO AUTH TOKEN (pasted in chat)
- [ ] Maor: delete the temporary Supabase access token (used for db push, no longer needed)
- [ ] Configure Test Phone Numbers (972528547424=123456 format) to test without SMS costs

