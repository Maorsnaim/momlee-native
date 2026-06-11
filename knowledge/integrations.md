> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Integrations — external services (native-first)

For each service: its role, where it lives in code, and decision status. **Every key/secret lives in env only** (see `security.md`). The native app is the active target; web specifics are parked.

**Shared principle:** every external provider (SMS, KYC, billing) is **wrapped in an abstraction in `@momlee/core`**. This is what makes the planned swaps (Twilio→Vonage, Persona↔Stripe Identity, Stripe↔IAP) possible without touching the UI or logic. The UI never calls a provider SDK directly.

## Auth — Supabase Auth (Phone) + Twilio Verify
- Phone verification (SMS OTP). SMS provider: **Twilio Verify**.
- Future swap to **Vonage** possible — wrap OTP sending behind a thin abstraction; never call Twilio from the UI.
- Lives in `@momlee/supabase` (auth client) + provider config in the Supabase dashboard.

## Identity / KYC — open decision
ID / selfie verification for all users (moms + Pros). Two candidates:

| | **Persona** (leading) | **Stripe Identity** |
|---|---|---|
| IL fit | Good, flexible document types | Depends on IL coverage |
| Unify with payments | Separate | Under Stripe (already in use) |
| Flow flexibility | High | Medium |
| Recommendation | Leading candidate (client request) | Alternative |

- **Decision pending.** Implemented behind a `verificationProvider` abstraction in `@momlee/core`, so swapping providers = swapping one implementation.
- Store the verification **result only** (status + provider reference) — never raw ID documents or selfies. See `privacy.md`.

## Analytics & Crash reporting — UPDATED 2026-06-11

- **Analytics: PostHog** (Maor's decision 2026-06-11; supersedes the
  first-party-only decision of 2026-06-10) — accessed **ONLY through the
  internal wrapper `@momlee/core/analytics`** (provider-pluggable). No screen,
  component, hook, or service outside the wrapper ever imports an analytics
  SDK. **Product analytics only:** no cross-app tracking, no ad identifiers,
  no ATT. Payloads stay PII-free (coarse buckets, never raw values — full
  rules + the stable event taxonomy: `analytics.md`).
- **The taxonomy outlives the tool.** Event names and properties are the
  durable contract — swapping PostHog for another provider must require a new
  `providers/*.provider.ts` file and nothing else.
- **Crash reporting: Sentry — but NOT installed yet.** The Sentry SDK needs native code, which would break the Expo Go test path (see `dev-environment.md`). Install it **at the EAS dev-client stage**, not before. Until then: Expo error overlay in dev; EAS build logs.
- Both decisions are reflected in `data-inventory.md` (Usage Data / Diagnostics rows). Changing either = Maor's decision + a data-inventory update first.

## Onboarding funnel analytics — planned schema (pre-PostHog; kept as reference)

> Superseded as the PRIMARY sink by the PostHog decision above — the funnel
> events now flow through `@momlee/core/analytics` → PostHog (same event
> names). The schema below stays as reference in case Maor revives a
> first-party mirror.

Goal: know where users ABANDON onboarding (per-step funnel dashboard; push
re-engagement for abandoners).

- Table `onboarding_events`: `id uuid pk` · `anon_id uuid` (device-generated
  before auth, stored in AsyncStorage) · `user_id uuid null` (linked after
  auth) · `event text` (`onboarding_step_viewed` / `otp_requested` / …) ·
  `step text` · `payload jsonb` · `created_at timestamptz`. Index `(event, step, created_at)`.
- Client: `logEvent()` writes here (anon insert policy, INSERT-only; payloads
  carry NO PII beyond ids — see data-inventory).
- Abandonment = latest step per anon/user with no later step within X hours →
  feeds a funnel dashboard and a push re-engagement job (push token only
  exists after permission + auth).
- Status: `logEvent` is currently a console stub — the table + wiring are the
  next backend step alongside OTP.

## Phone Auth implementation patterns (in code, 2026-06-10)

- `apps/mobile/src/lib/supabase.ts` — **lazy, fail-soft client**: returns null
  without env keys so the app still runs (Expo Go demos/tests); auth/analytics
  degrade to console warnings. Session in AsyncStorage, autoRefresh+persist.
  ⚠️ **MIGRATE:** per the secure-storage Iron Law (2026-06-11, `stack.md`),
  the session/auth tokens must move to an **expo-secure-store** adapter —
  AsyncStorage is forbidden for tokens. Tracked in `../planning/open-tasks.md`.
- `lib/auth.ts` — `requestOtp(e164)` / `verifyOtp(e164, code)` wrap Supabase
  Phone Auth (Twilio Verify configured server-side only). UI resend cooldown
  is UX; the real rate limit is server-side.
- `lib/anon.ts` — device `anon_id` (AsyncStorage + expo-crypto) created BEFORE
  auth; every funnel event carries it; `user_id` joins after verification.
- OTP input: hidden TextInput with `textContentType="oneTimeCode"` +
  `autoComplete="sms-otp"` → iOS offers the SMS code above the keyboard.
- To go live E2E: Twilio Verify keys in Supabase Dashboard → Auth → Providers
  → Phone; mobile `.env`; apply migration `20260610120000` (onboarding_events
  + verified-phone mirror); regenerate `@momlee/supabase` types and drop the
  temporary cast in `lib/analytics.ts`.

## Maps — Mapbox
- Meetup discovery by distance, location picking on creation, map display.
- Native: `@rnmapbox/maps`. Public token in env (`EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`).
- **Distance/geo computed server-side** (Postgres), never in the client. Exact coordinates of a user are never exposed to others — only approximate/relative distance. See `privacy.md`.
- (Web later: Mapbox GL JS.)

## Storage — Supabase Storage
- Profile images, meetup media. Buckets with RLS.
- Ownership is verified before generating a signed URL; signed URLs get short expiry.

## Realtime / Chat — Supabase Realtime
- Subscriptions on the messages table (group + 1:1). Lives in `@momlee/supabase`. See `data-model.md`.

## Email — Resend
- Transactional: welcome, meetup confirmation, subscription notices.
- Templates + send via an edge function. Templates must be RTL (`dir="rtl"`).

## Push — Expo Push Notifications
- Notifications: meetup join, new message, meetup reminder.
- Store push tokens on the profile. Send via an edge function.

## Payments — Stripe (+ store IAP as required)
- **Stripe Atlas** — incorporation. **Stripe Payments / Billing** — Pro subscription (trial month → monthly).
- **Apple IAP / Google IAP** — "as required": store rules may require IAP for digital content in-app. Evaluated before store release; plan a `billingProvider` abstraction to support both.
- **Webhooks → update subscription status.** The client never updates subscription status directly. Verify the webhook signature. See `security.md`.

## Where keys go (summary)
- Client may hold only **public** keys: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`.
- Secret keys (Stripe secret, service-role, Resend, Twilio, Persona) live server-side only (Supabase secrets / EAS secrets), used inside edge functions. Full list and rules in `security.md`.
