---
name: momlee-react-native
description: Use whenever you write or edit MomLee native app code (Expo / React Native / NativeWind) — screens, navigation, components, hooks, data access, or package structure. Enforces the Expo + RN + NativeWind architecture, cross-platform code sharing (iOS now → Android → Web), styling via NativeWind + tokens, no direct Supabase calls from UI, no business logic in components, and stack discipline (no unapproved libraries, TS strict). Trigger on any MomLee native code work or architecture/package-boundary decision.
---

# MomLee React Native — architecture & discipline

The active target is the **native Expo app**, shipping **iOS → Android → Web** with maximum reuse and minimum duplication. The web app is shelved (same tokens/logic apply when it returns).

## Stack (no surprises)

- **Native:** React Native + **Expo** (Expo Router). **Styling:** NativeWind + Tailwind tokens. **Sheets/modals:** `@gorhom/bottom-sheet` wrapped in a `@momlee/ui` `Sheet`.
- **Shared:** `@momlee/tokens`, `@momlee/ui` (primitives), `@momlee/core` (domain logic + Zod), `@momlee/features` (feature modules), `@momlee/supabase` (data layer), `@momlee/i18n`, `@momlee/config`.
- Full stack table: `../../knowledge/stack.md`. Integrations (Supabase, Twilio, Mapbox, Resend, Expo Push, Stripe, KYC): `../../knowledge/integrations.md`.

## Cross-platform structure

- **Everything shareable is shared** (`packages/`): tokens, types, Zod schemas, domain logic, the Supabase data layer, i18n. **Only the visual primitives** are written per platform.
- Build iOS first, then Android, then Web — composing the same feature modules. Share logic + primitives; keep platform-specific composition thin. Max reuse, min duplication.
- Dependency direction: `apps → features → ui → tokens` and `features → core, supabase, i18n`. `tokens` imports nothing; `core` never imports `ui`/`supabase`/`features`/`apps`; no app is ever imported by a package. Full rules + folder map: `../../knowledge/architecture.md`.

## Styling

- Style via **NativeWind + tokens** only — no hardcoded values (see **momlee-design-system**).
- Use **logical Tailwind classes** that flip for RTL (`ps/pe`, `ms/me`, `start/end`) — never `left/right`/`pl/pr`/`ml/mr` (see **momlee-rtl**).

## Hard boundaries

- **No direct Supabase calls from UI.** All remote/server state goes through `@momlee/supabase` (queries/mutations/RPC + generated types). No SQL in `apps/*`.
- **No business logic in components.** Domain rules live in `@momlee/core` / `@momlee/features`. A component does one job; if a file grows too large it does too much — split it. Explicit prop types, variants over magic booleans.

## Stack discipline

- Do **not** introduce a library/SDK/service that is not in `../../knowledge/stack.md` without explicit approval. First ask "does the stack already solve this?" (Supabase, Zod, NativeWind…).
- Run `npm audit` / `npx expo-doctor`. Pin versions, commit the lockfile, review new deps.
- TypeScript `strict` everywhere; no `any` (use `unknown` + narrowing) — especially in **auth, roles, payments**, and API responses. Zod is the source of truth for runtime validation (`z.infer` for the type).
- Naming: files `kebab-case`, components `PascalCase`, hooks `useX`, packages `@momlee/<name>`. Full conventions: `../../knowledge/conventions.md`.

## Roles

Two surfaces — **mom** and **pro** (pro also gets a dashboard: stats, payments, create pro-meetups, edit profile). Share logic, separate composition. Role comes from the server, never client input. See `../../knowledge/modules-roles.md`.
