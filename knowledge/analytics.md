> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Analytics — PostHog behind one wrapper, stable taxonomy forever

## The decision (2026-06-11)

**Tool: PostHog.** Accessed **ONLY** through the internal wrapper
`@momlee/core/analytics`. Product analytics only — no cross-app tracking, no
ad identifiers, no ATT. (Supersedes the 2026-06-10 first-party-only plan; the
`onboarding_events` schema in `integrations.md` stays as reference.)

## One abstraction layer — the wrapper (binding)

> **Never call PostHog, Mixpanel, Firebase, or any analytics SDK directly from
> screens or components. Always use `@momlee/core/analytics`.**

```ts
import { analytics } from '@momlee/core/analytics';

analytics.track('otp_requested', {
  method: 'phone',
  screen: 'onboarding_phone',
});
```

Structure (provider-pluggable — swapping tools = one new provider file,
nothing else changes):

```
packages/core/analytics/
  analytics.ts          # the public API: track / identify / reset
  analytics.types.ts    # typed event names + payload shapes (the taxonomy as types)
  providers/
    posthog.provider.ts # the ONLY file that imports the PostHog SDK
```

- `analytics.types.ts` types the event-name union + per-event payload — a typo
  cannot create a rogue event, and an undeclared property doesn't compile.
- The provider is fail-soft: no env key → console-log events (Expo Go demos
  still run). Client env: `EXPO_PUBLIC_POSTHOG_KEY` (+ host) — the PostHog
  project key is a public write-only key, allowed on the client.
- Analytics calls live in the **service layer** (Architecture Gate) — never in
  screens; the wrapper is what services import.

## Stable Event Taxonomy — the most important thing

**Event names + properties are the durable contract.** If they stay fixed, the
tool can be replaced without breaking historical data. Renaming a shipped
event = Maor's decision (it breaks history); prefer adding properties over
renaming.

Naming: `object_action`, `snake_case`, past-tense verb (`meetup_joined`).
Payload keys `snake_case`, ids entity-named (`meetup_id`, never `id`).

### Seed taxonomy (Maor, 2026-06-11)

| Module | Events |
|---|---|
| Onboarding | `onboarding_started` · `phone_submitted` · `otp_requested` · `otp_verified` · `child_added` · `location_selected` · `interests_selected` · `profile_photo_added` · `onboarding_completed` |
| Meetups | `meetup_viewed` · `meetup_join_clicked` · `meetup_created` |
| Professionals | `provider_profile_viewed` · `provider_contact_clicked` |

New events extend this table (same change that adds them — keep it the live
registry). Per-screen specs also live in the Figma annotation `Events` section.

## PII rule — nothing sensitive, ever

Never send to analytics: **phone, full name, child name, exact birth date,
address, message content** — or any raw PII. Send coarse derivatives instead:

```
baby_age_range: "0-3_months"     ✅
baby_birth_date: "2026-01-14"    ❌
```

Identity in events = `user_id` / `anon_id` only. An event carrying user data =
a `data-inventory.md` check (PostHog is a processor — privacy labels and the
privacy policy must reflect it).

## North Star + KPI tie-in

- **North Star: Weekly Successful Meetup Attendance (WSMA)** — meetups with
  **≥2 participants marked `attended`** (locked decision D5).
- **Until the attendance lifecycle exists**, the explicit **proxy is Weekly
  Meetup Joins** (`meetup_join_clicked` and join rows). Always flag it as a
  proxy — joining ≠ attending.
- Every feature's success KPI should trace to this loop: activation
  (onboard → join → attend), retention (repeat attendance), marketplace and
  revenue (pro meetups that get attended).

## Verification habit

An event that was never seen landing is not instrumented. After wiring events,
run the flow in dev and watch them arrive (PostHog live events, or the
wrapper's console log in fail-soft mode) before declaring the feature done.
