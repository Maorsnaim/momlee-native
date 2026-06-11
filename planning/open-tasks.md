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

## Analytics Gate (2026-06-11) — NEW, every feature answers 3 questions

New skill **momlee-analytics** + new channel `knowledge/analytics.md`: every
feature, at PLAN time, prints an `ANALYTICS GATE` block — which events
(`object_action`, snake_case, no PII beyond user_id/anon_id), how we verify
(query the events table, see the rows land), and which success KPI it moves
(traced to the North Star: WSMA, proxy weekly joins). First-party only stays
locked. No event spec for a feature = propose + ask Maor, never invent or skip.
Feature isn't "done" until the events are SEEN landing. No action needed beyond
updating the plugin.

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
