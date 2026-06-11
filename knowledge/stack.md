> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Stack — the technical source of truth (native-first)

**Iron rule:** Do not add a library/service that is not listed here without explicit approval. Before `pnpm add` anything new, first ask: "does the stack already solve this?" (Supabase, Zod, NativeWind…). See `conventions.md` → "Only the stack".

**Current focus is the native app**, shipping iOS → Android → Web. The stack is **Expo / React Native / NativeWind / Tailwind / Supabase**. The web app built earlier is **shelved** (not the active target; we return to it later). Anything below marked _web_ is parked until then.

## Stack table

| Area | Technology | Notes |
|------|-----------|-------|
| **Native (primary)** | React Native + **Expo** (Expo Router) | iOS first, then Android, then tablet. This is the active target. |
| **Routing** | **Expo Router** (`expo-router`) | ALL navigation via Expo Router, file-based routing conventions. React Navigation only as Expo Router's internal dependency — never introduced directly. |
| **UI — styling** | **NativeWind** (+ Tailwind CSS) | Tailwind/token syntax in React Native. Same design language as web when it returns. (Tamagui/gluestack rejected — heavy deps, we want full ownership of the code.) |
| **UI — shared primitives** | `@momlee/ui` (NativeWind) | Cross-platform primitives we write: Button, Input, Card, Avatar, Sheet, Badge ("verified")… |
| **UI — bottom sheets** | **@gorhom/bottom-sheet** | The standard for Momlee sheets/modals on iOS/Android. Peer deps: `react-native-reanimated` + `react-native-gesture-handler` (Expo-supported). Wrap in a `@momlee/ui` `Sheet` primitive; verify RTL (handle/close affordances). |
| **Typography** | **Noto Sans Hebrew** (OFL, full Hebrew coverage) | The official Momlee font. Free to embed in a commercial product, no licensing blocker. Never Google Sans. See `conventions.md`. |
| **Design tokens** | `@momlee/tokens` | Single source of truth — color, spacing, typography, radius, shadows. Derived from Figma variables. Nothing defines a color/spacing outside this package. |
| **Language** | TypeScript (strict) | Every package. No `any`. |
| **Validation** | **Zod** | Shared schemas in `@momlee/core`; `z.infer` for the type. |
| **Server state** | **TanStack Query** (`@tanstack/react-query`) | Decided 2026-06-11. The ONLY home for server state — lives in feature hooks; `queryFn`/`mutationFn` call the service → repository (Architecture Gate). Never duplicate server data into a client store. |
| **Forms** | **React Hook Form** (+ Zod resolver) | Decided 2026-06-11. All form state; validation via the shared Zod schemas from `@momlee/core`. No hand-rolled multi-field state. |
| **Global app state** | **Zustand** (restricted) | Decided 2026-06-11. RESERVED for true global app state only: session state, locale, RTL/LTR direction, feature flags, temporary onboarding progress, global UI state. **NOT a TanStack Query replacement** — never meetups/providers/messages/notifications/search results. |
| **Backend / DB** | **Supabase + PostgreSQL** | RLS on every table from day one. |
| **Auth** | Supabase Auth — Phone Verification | Phone OTP via **Twilio Verify**. Future swap to **Vonage** possible — wrap OTP sending behind a thin abstraction, never call Twilio from the UI. |
| **Storage** | Supabase Storage | Profile images, media. Buckets with RLS; ownership verified before signed URLs. |
| **Secure local storage** | **expo-secure-store** | Decided 2026-06-11. ALL sensitive local data (auth tokens, session) in Secure Store — NEVER in AsyncStorage, never plain text. |
| **Realtime / Chat** | Supabase Realtime | Group + 1:1 chat (subscriptions on the messages table). |
| **Maps** | **Mapbox** | Meetup discovery by distance, location picking, map display. Native: `@rnmapbox/maps`. Keys in env. Distance/geo computed server-side (Postgres), not in the client. |
| **Email** | **Resend** | Transactional (welcome, meetup confirmation, subscription notices) via edge function. Templates RTL (`dir="rtl"`). |
| **Push** | **Expo Push Notifications** | Meetup join, new message, meetup reminder. Push tokens stored on the profile; send via edge function. |
| **Analytics** | **PostHog** via `@momlee/core/analytics` | Decided 2026-06-11. Screens/components NEVER import an analytics SDK — only the wrapper (provider-pluggable: `providers/posthog.provider.ts`). Stable event taxonomy + PII rules: `analytics.md`. Product analytics only — no tracking, no ATT. |
| **Identity / KYC** | _Open decision:_ **Persona** (leading) / **Stripe Identity** | ID + selfie verification for all users. Behind a `verificationProvider` abstraction in `@momlee/core`. Store the result only — never raw documents. See `privacy.md`. |
| **Payments** | **Stripe** Atlas (incorporation) + Stripe Payments/Billing | Pro subscription (trial month → monthly). |
| **Payments (stores)** | Apple IAP / Google IAP | "As required" — store rules may force IAP for digital content. Evaluated before store release; plan a `billingProvider` abstraction. |
| **Animations & gestures** | **react-native-reanimated** + **react-native-gesture-handler** | First-class approved (2026-06-11): all advanced animations via Reanimated, all gesture interactions via Gesture Handler (sheets, swipe actions, card interactions, navigation animations). No custom animation frameworks. |
| **Dates** | **date-fns** | Decided 2026-06-11. All date calculations + formatting (baby age, due dates, meetup dates, relative time). Never Moment.js; no custom date utilities unless unavoidable. |
| **Location** | **expo-location** | Decided 2026-06-11. All device location access (nearby moms/meetups, provider discovery, city detection). Distance/geo math stays server-side (see Maps row + `privacy.md` — never expose another user's raw coordinates). |
| **i18n** | `@momlee/i18n` | he-IL default, **RTL-first**, future LTR. |
| **Monorepo** | Turborepo + pnpm workspaces | See `architecture.md`. |
| **Web (shelved)** | Next.js (App Router) → Vercel; shadcn/ui | Parked. SSR/SEO target for later. Same tokens/logic apply when it returns. |

## Guiding architectural principle
- **Everything shareable is shared** (`packages/`): tokens, types, Zod schemas, domain logic, Supabase data layer, i18n.
- **Only the visual primitives** are written per platform, because rendering differs fundamentally. Native is the one we build now.
- Each provider integration (SMS, KYC, billing, analytics) is **wrapped in an abstraction** in `@momlee/core`, so swaps (Twilio→Vonage, Persona↔Stripe Identity, Stripe↔IAP, PostHog→other) never touch the UI or logic.

## Core Technology Stack — Iron Law (Maor, 2026-06-11)

These libraries are the approved foundation of the Momlee application and are
the **default architecture unless explicitly overridden by Maor**.

### Routing — `expo-router`
- All navigation must use Expo Router, following file-based routing conventions.
- Do not introduce React Navigation directly — only as Expo Router's internal dependency.

### Server state — `@tanstack/react-query`
- ALL data from Supabase/APIs/backend is managed through TanStack Query: meetups, moms, providers, messages, notifications, user profiles.
- No `useEffect + useState` fetching. No server data inside Zustand.
- Query Keys are consistent and **centralized** (one keys module, not ad-hoc strings).

### Forms & validation — `react-hook-form` + `zod`
- EVERY form uses React Hook Form; EVERY form validates with Zod schemas (from `@momlee/core`): onboarding, OTP flow, edit profile, provider onboarding, create meetup, settings.
- No custom validation systems. Validation logic never lives inside UI components.

### Backend access — `@supabase/supabase-js`
- Screens/components NEVER talk to Supabase; UI never contains DB queries. Access only through the approved service architecture:

```
Required:   Screen → Hook → Service → Repository (@momlee/supabase) → Supabase
Minimum:    Screen → Service → Repository → Supabase   (hook omitted only when there is no UI state to orchestrate)
Forbidden:  Screen → Supabase
```

### Analytics — `posthog-react-native`
- PostHog is the approved provider — reached ONLY via the central wrapper: `analytics.track(...)` ✅, `posthog.capture(...)` ❌.
- The wrapper (`@momlee/core/analytics`) must allow migrating to Mixpanel or another provider without changing application code. See `analytics.md`.

### Secure storage — `expo-secure-store`
- Sensitive local data lives in Secure Store. **Never auth tokens in AsyncStorage. Never sensitive data in plain text.**

### Animations & gestures — `react-native-reanimated` + `react-native-gesture-handler`
- All advanced animations via Reanimated; all gesture interactions via Gesture Handler (bottom sheets, swipe actions, card interactions, navigation animations). No custom animation frameworks.

### Bottom sheets — `@gorhom/bottom-sheet`
- The approved bottom-sheet solution (wrapped in the `@momlee/ui` `Sheet`). No custom bottom-sheet implementations without explicit approval. Used for: filters, location selection, actions, reporting, pickers.

### App state — `zustand` (restricted)
- Zustand is reserved for **true global application state only** — it is NOT a TanStack Query replacement.
- ✅ Allowed: session state, locale, RTL/LTR direction, feature flags, temporary onboarding progress, global UI state.
- ❌ Forbidden: meetups, providers, messages, notifications, search results — those belong in TanStack Query.

### Dates — `date-fns`
- All date calculations and formatting (baby age, due dates, meetup dates, relative time). Do not introduce Moment.js; avoid custom date utilities unless absolutely necessary.

### Location — `expo-location`
- Location is a core business requirement. All location access via Expo Location (nearby moms, nearby meetups, provider discovery, distance, city detection). No alternative location libraries without approval.

### Architecture summary

```
Routing         → Expo Router
Forms           → React Hook Form + Zod
Server data     → TanStack Query
Backend         → Supabase via Services (→ Repository)
Analytics       → Analytics Wrapper → PostHog
Global state    → Zustand (restricted list)
Secure storage  → Expo Secure Store
Animations      → Reanimated
Gestures        → Gesture Handler
Bottom sheets   → Gorhom Bottom Sheet
Dates           → date-fns
Location        → Expo Location
```

This stack is the canonical Momlee mobile architecture — the default
implementation path for all future development.

## Dependency Governance — Iron Law (2026-06-11)

**No new dependency may be introduced without explicit approval.** Before adding any package, answer (the `DEPENDENCY GATE` block in **momlee-react-native**):

1. What problem does it solve?
2. Can the same result be achieved with the current stack?
3. Why is an additional dependency justified?
4. What is the long-term maintenance cost?

If approval is not explicitly given: **STOP. Do not install the dependency.**

- **Don't add a dependency if the feature can be built in under 100 LOC** with the existing stack — write the 100 lines instead.
- Every approved dependency gets a row in the table above — in the same change.
- Prefer Expo-supported, JS-only libraries (the Expo Go path is load-bearing — see `dev-environment.md`); any SDK that collects data goes through `data-inventory.md` first.

## Notes captured during planning
1. **NativeWind** is the React Native styling layer — same Tailwind/token syntax, one design language across platforms.
2. **Persona** is the leading KYC candidate, with Stripe Identity as the alternative; final decision still open.
3. **@gorhom/bottom-sheet** is the native sheets/modals standard (added 2026-06-03), wrapped behind the `@momlee/ui` `Sheet` primitive. Confirm Reanimated/Gesture-Handler config in Expo; verify RTL.
