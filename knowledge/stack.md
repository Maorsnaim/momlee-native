> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Stack — the technical source of truth (native-first)

**Iron rule:** Do not add a library/service that is not listed here without explicit approval. Before `pnpm add` anything new, first ask: "does the stack already solve this?" (Supabase, Zod, NativeWind…). See `conventions.md` → "Only the stack".

**Current focus is the native app**, shipping iOS → Android → Web. The stack is **Expo / React Native / NativeWind / Tailwind / Supabase**. The web app built earlier is **shelved** (not the active target; we return to it later). Anything below marked _web_ is parked until then.

## Stack table

| Area | Technology | Notes |
|------|-----------|-------|
| **Native (primary)** | React Native + **Expo** (Expo Router) | iOS first, then Android, then tablet. This is the active target. |
| **UI — styling** | **NativeWind** (+ Tailwind CSS) | Tailwind/token syntax in React Native. Same design language as web when it returns. (Tamagui/gluestack rejected — heavy deps, we want full ownership of the code.) |
| **UI — shared primitives** | `@momlee/ui` (NativeWind) | Cross-platform primitives we write: Button, Input, Card, Avatar, Sheet, Badge ("verified")… |
| **UI — bottom sheets** | **@gorhom/bottom-sheet** | The standard for Momlee sheets/modals on iOS/Android. Peer deps: `react-native-reanimated` + `react-native-gesture-handler` (Expo-supported). Wrap in a `@momlee/ui` `Sheet` primitive; verify RTL (handle/close affordances). |
| **Typography** | **Noto Sans Hebrew** (OFL, full Hebrew coverage) | The official Momlee font. Free to embed in a commercial product, no licensing blocker. Never Google Sans. See `conventions.md`. |
| **Design tokens** | `@momlee/tokens` | Single source of truth — color, spacing, typography, radius, shadows. Derived from Figma variables. Nothing defines a color/spacing outside this package. |
| **Language** | TypeScript (strict) | Every package. No `any`. |
| **Validation** | **Zod** | Shared schemas in `@momlee/core`; `z.infer` for the type. |
| **Backend / DB** | **Supabase + PostgreSQL** | RLS on every table from day one. |
| **Auth** | Supabase Auth — Phone Verification | Phone OTP via **Twilio Verify**. Future swap to **Vonage** possible — wrap OTP sending behind a thin abstraction, never call Twilio from the UI. |
| **Storage** | Supabase Storage | Profile images, media. Buckets with RLS; ownership verified before signed URLs. |
| **Realtime / Chat** | Supabase Realtime | Group + 1:1 chat (subscriptions on the messages table). |
| **Maps** | **Mapbox** | Meetup discovery by distance, location picking, map display. Native: `@rnmapbox/maps`. Keys in env. Distance/geo computed server-side (Postgres), not in the client. |
| **Email** | **Resend** | Transactional (welcome, meetup confirmation, subscription notices) via edge function. Templates RTL (`dir="rtl"`). |
| **Push** | **Expo Push Notifications** | Meetup join, new message, meetup reminder. Push tokens stored on the profile; send via edge function. |
| **Identity / KYC** | _Open decision:_ **Persona** (leading) / **Stripe Identity** | ID + selfie verification for all users. Behind a `verificationProvider` abstraction in `@momlee/core`. Store the result only — never raw documents. See `privacy.md`. |
| **Payments** | **Stripe** Atlas (incorporation) + Stripe Payments/Billing | Pro subscription (trial month → monthly). |
| **Payments (stores)** | Apple IAP / Google IAP | "As required" — store rules may force IAP for digital content. Evaluated before store release; plan a `billingProvider` abstraction. |
| **i18n** | `@momlee/i18n` | he-IL default, **RTL-first**, future LTR. |
| **Monorepo** | Turborepo + pnpm workspaces | See `architecture.md`. |
| **Web (shelved)** | Next.js (App Router) → Vercel; shadcn/ui | Parked. SSR/SEO target for later. Same tokens/logic apply when it returns. |

## Guiding architectural principle
- **Everything shareable is shared** (`packages/`): tokens, types, Zod schemas, domain logic, Supabase data layer, i18n.
- **Only the visual primitives** are written per platform, because rendering differs fundamentally. Native is the one we build now.
- Each provider integration (SMS, KYC, billing) is **wrapped in an abstraction** in `@momlee/core`, so swaps (Twilio→Vonage, Persona↔Stripe Identity, Stripe↔IAP) never touch the UI or logic.

## Notes captured during planning
1. **NativeWind** is the React Native styling layer — same Tailwind/token syntax, one design language across platforms.
2. **Persona** is the leading KYC candidate, with Stripe Identity as the alternative; final decision still open.
3. **@gorhom/bottom-sheet** is the native sheets/modals standard (added 2026-06-03), wrapped behind the `@momlee/ui` `Sheet` primitive. Confirm Reanimated/Gesture-Handler config in Expo; verify RTL.
