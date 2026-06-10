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

## Analytics & Crash reporting — DECIDED 2026-06-10

- **Analytics: first-party only.** Product events (e.g. `onboarding_step_viewed`, `otp_requested`) are written to our own Supabase events table — **no third-party analytics SDK**, nothing leaves our infrastructure, no tracking, no ATT. Event names/payloads are documented per screen in the Figma annotations; payloads must not contain PII beyond the user id.
- **Crash reporting: Sentry — but NOT installed yet.** The Sentry SDK needs native code, which would break the Expo Go test path (see `dev-environment.md`). Install it **at the EAS dev-client stage**, not before. Until then: Expo error overlay in dev; EAS build logs.
- Both decisions are reflected in `data-inventory.md` (Usage Data / Diagnostics rows). Changing either = Maor's decision + a data-inventory update first.

## Onboarding funnel analytics (first-party) — planned schema

Goal: know where users ABANDON onboarding (per-step funnel dashboard; push
re-engagement for abandoners). First-party only (see Analytics decision above).

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
