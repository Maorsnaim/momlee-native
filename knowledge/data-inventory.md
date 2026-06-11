> Canonical, Maor-maintained (Sivan updates it too — see skill `momlee-data-inventory`). Flows via git.

# Data Inventory — every piece of user data we collect

**Purpose:** when we submit to the App Store / Google Play, Apple's **App Privacy
"nutrition labels"** and Google's **Data Safety form** must declare exactly what
we collect, why, whether it's linked to identity, and whether it's used for
tracking — and the **privacy policy** must say the same. This registry is
maintained **during development**, so at submission time the labels and the
policy are a fast, accurate distillation of this file instead of an archaeology
project.

**The rule:** any time the app starts collecting / storing / transmitting a NEW
kind of user data (new table/column, new SDK, new permission, new analytics
event), a row is added here **in the same change**. No silent data collection.
A PR that adds collection without updating this file is incomplete.

Columns map to Apple's questionnaire: *Category* (Apple's taxonomy), *Linked to
identity* (associated with the user's account), *Tracking* (cross-app/site
advertising — for us this must stay **No**; anything else needs ATT + Maor's
explicit approval).

## Current inventory (seeded 2026-06-10 from the data model + integrations)

| Data | Apple category | Purpose | Where stored | Linked to identity | Tracking | Shared with | Notes / retention |
|---|---|---|---|---|---|---|---|
| Phone number | Contact Info | Auth (OTP login), account | Supabase `auth.users` + `users.phone` | Yes | No | Twilio (SMS delivery via Supabase Auth) | Private PII — admin-only, never shown to other users |
| Email | Contact Info | Account, transactional email | Supabase `profiles.email` | Yes | No | Resend (sending) | Private PII |
| Name (display name) | Contact Info | Profile display | `profiles.display_name` | Yes | No | Other users (by design, via `user_display_info`) | Public-to-community by design |
| Profile photo | User Content | Profile display | Supabase Storage (private bucket, signed URLs) | Yes | No | Other users (display) | Private bucket; signed URLs only |
| Baby/child info (birth date, focus areas) | Sensitive Info | Personalization (mom's stage, content relevance) | `children`, `baby_birth_date` | Yes | No | — (never other users) | **Highest care** — Israeli privacy law + GDPR; expose derived stage, not raw date |
| Location (city / approx. coordinates for meetups) | Location (coarse) | Meetup discovery by distance | `baby_meetups` lat/lng (decimal) | Yes | No | — | Exact coords never exposed to others; server-side approx distance only |
| Chat messages | User Content | Meetup chat | `chat_messages` | Yes | No | Meetup participants | Sanitized; never rendered as HTML |
| Forum posts (questions/answers) | User Content | Community forum | `forum_questions/answers` | Yes | No | Other users (public in-app) | Sanitized |
| Meetup details (title, description, time, place) | User Content | Meetups | `baby_meetups` | Yes | No | Other users | |
| Favorites | Usage Data | Saved providers/content | `favorites` | Yes | No | — | |
| User ID | Identifiers | Account, all relations | Supabase (uuid) | Yes | No | — | |
| Push token | Identifiers | Push notifications | profile (planned) | Yes | No | Expo Push (delivery) | Delete on logout |
| Identity verification status | Sensitive Info | Trust — all users verified | `verifications` (status + provider ref ONLY) | Yes | No | Persona / Stripe Identity (they hold the raw ID docs/selfie — we never store them) | Owner-read; written by signed webhooks only |
| Subscription status (providers) | Purchases | Provider monetization | provider/subscription columns | Yes | No | Stripe (processing) | Updated only via verified webhooks |
| Analytics events (e.g. `onboarding_started`, `otp_requested`, `meetup_join_clicked`) | Usage Data | Product analytics | **PostHog** via `@momlee/core/analytics` (decided 2026-06-11, supersedes the first-party-only plan) | Yes (user id / anon id only — payloads PII-free, coarse buckets like `baby_age_range`, never `baby_birth_date`) | **No** (product analytics only, no cross-app tracking/ATT) | PostHog (processor) | Stable taxonomy in `analytics.md` + Figma annotations; add a row per event whose payload carries user data; reflect PostHog in privacy labels + privacy policy |
| Crash/diagnostics | Diagnostics | Stability | **Sentry — decided, NOT installed yet** (deferred to the EAS dev-client stage to keep Expo Go working) | Prefer not linked | No | Sentry (when installed) | Update this row + privacy labels when the SDK actually lands |

## Not collected (declare as "not collected")

Browsing history outside the app · contacts · health data · financial account
data (Stripe holds payment details, we never see card numbers) · precise
location shared with other users · advertising identifiers (no ads, no ATT).

## Permissions we request (iOS Info.plist / Android)

| Permission | Why (usage string must say this) | Status |
|---|---|---|
| Notifications | Meetup joins, messages, reminders | Planned |
| Camera / Photo library | Profile photo upload; KYC selfie (via provider SDK) | Planned |
| Location (when-in-use) | Find meetups nearby | Planned — coarse use only |

## At submission time

`momlee-store-release` reads THIS file to fill: Apple App Privacy answers,
Google Data Safety form, and the privacy policy draft. If this file is accurate,
that step takes an hour, not a week.
