---
name: momlee-react-native
description: Use whenever you write or edit MomLee native app code (Expo / React Native / NativeWind) — screens, navigation, components, hooks, data access, or package structure. Enforces the Expo + RN + NativeWind architecture, cross-platform code sharing (iOS now → Android → Web), styling via NativeWind + tokens, the layered call chain (Screen → Hook → Service → Repository → Supabase — the Architecture Gate), no business logic in components, and stack discipline (no unapproved libraries, TS strict). Trigger on any MomLee native code work, any Supabase/data wiring, or any architecture/package-boundary decision.
---

# MomLee React Native — architecture & discipline

The active target is the **native Expo app**, shipping **iOS → Android → Web** with maximum reuse and minimum duplication. The web app is shelved (same tokens/logic apply when it returns).

## Dev environment (no Mac)

Sivan builds **without a Mac**, so the iOS path stays in the cloud. **Stay in the Expo managed workflow + config plugins — do NOT run `expo prebuild` / go bare**, and don't add Mac-only steps. Test via **Expo Go** (web + Android emulator + real iPhone QR); when a custom native module / config plugin makes Expo Go insufficient, use an **EAS-built dev client** (still cloud, still no Mac). iOS builds/submits run via **EAS cloud** (`eas build/submit -p ios`). **Deep native iOS debugging, iOS Simulator, and Xcode work are Maor's.** Full detail: `../../knowledge/dev-environment.md`. Native work is on the **`momlee-native`** branch.

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

## The Architecture Gate — Screen → Hook → Service → Repository (HARD STOP)

Every remote read/write flows through **all four layers, in order** — no skipping:

```
Screen → Hook → Service → Repository → Supabase
```

- **Screen** renders UI and binds to a hook. It does not know Supabase exists. A screen that imports `@momlee/supabase` or `@supabase/*` is a **bug** — even one line, even "just this once".
- **Hook** (`useX`, in the feature module) holds UI-state orchestration only (loading/error/disabled) and calls the service.
- **Service** (feature module; pure domain rules in `@momlee/core`) is the ONLY home for business logic: validation (Zod), analytics, retry/rate-limit policy, logging, error mapping.
- **Repository** (`@momlee/supabase`) is the ONLY layer that imports the Supabase client.

**"This screen is simple" is not an exception — it's how every 300-line screen
was born.** A layer may be a thin pass-through today; it may never be skipped.
The boundary is also lint-enforced (`no-restricted-imports`) so violations fail
CI, not code review. Full layer table, code example, interim folder layout, and
lint config: `../../knowledge/architecture.md` → "The layered call chain".

- **No business logic in components.** A component does one job; if a file grows too large it does too much — split it. Explicit prop types, variants over magic booleans.

## Stack discipline

- Do **not** introduce a library/SDK/service that is not in `../../knowledge/stack.md` without explicit approval. First ask "does the stack already solve this?" (Supabase, Zod, NativeWind…).
- Run `pnpm audit` / `npx expo-doctor`. Pin versions, commit the lockfile (`pnpm-lock.yaml`), review new deps.
- TypeScript `strict` everywhere; no `any` (use `unknown` + narrowing) — especially in **auth, roles, payments**, and API responses. Zod is the source of truth for runtime validation (`z.infer` for the type).
- Naming: files `kebab-case`, components `PascalCase`, hooks `useX`, packages `@momlee/<name>`. Full conventions: `../../knowledge/conventions.md`.

## Roles

Two surfaces — **mom** and **pro** (pro also gets a dashboard: stats, payments, create pro-meetups, edit profile). Share logic, separate composition. Role comes from the server, never client input. See `../../knowledge/modules-roles.md`.

## Onboarding page container — the verified keyboard model (2026-06-10)

Per the Figma "iOS Onboarding Page Template" (and owner decision): logomark,
heading, content and the CTA live in **ONE container** whose height is the
screen **minus the keyboard** (KeyboardAvoidingView `padding`). Rules:
- CTA pinned to the container bottom via a **collapsible spacer** (`flexGrow:1, flexShrink:1, flexBasis:0`).
- Content keeps natural height (RN default `flexShrink:0`) — it must NEVER compress or be overlapped.
- Container is `overflow-hidden`: when content is taller than the container (keyboard + open dropdown), the CTA **clips out of view** — it must NOT float above fields. When there's room (phone field focused) it shows above the keyboard.
- Tap anywhere outside an input dismisses the keyboard (`Pressable accessible={false}` wrapper).
- iOS TextInput metrics: shared INPUT_TEXT_STYLE (tight lineHeight, zero intrinsic padding, underline on the wrapper); icon/flag alignment = padding on the ROW, not the text.
Implementation reference: `apps/mobile/src/components/PageTemplate.tsx`.
