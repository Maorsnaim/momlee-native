> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Architecture & Folders — monorepo layout (native-first)

Monorepo on **Turborepo + pnpm workspaces**. Goal: maximum code sharing, with clear boundaries between packages. **The native Expo app (`apps/native`) is the active target**; the web app is shelved but kept in the layout for when it returns.

```
momlee/
├── apps/
│   ├── native/              # Expo (Expo Router) → iOS / Android / Tablet  ← ACTIVE
│   └── web/                 # Next.js (App Router) → Vercel  ← SHELVED (returns later)
│
├── packages/
│   ├── tokens/              # @momlee/tokens — design tokens (source of truth from Figma)
│   ├── ui/                  # @momlee/ui — cross-platform primitives (NativeWind) + tailwind-preset
│   ├── core/                # @momlee/core — domain logic, hooks, zod schemas, types
│   ├── features/            # @momlee/features — feature modules (meetups, chat, profile, pro-dashboard…)
│   ├── supabase/            # @momlee/supabase — client, generated types, queries, realtime
│   ├── i18n/                # @momlee/i18n — translations + RTL/LTR direction engine
│   └── config/              # @momlee/config — eslint, tsconfig, prettier, tailwind base
│
├── assets/
│   └── fonts/noto-sans-hebrew/   # Noto Sans Hebrew font files (consumed by the apps)
├── supabase/                # migrations, edge functions, seed, RLS policies
└── turbo.json, pnpm-workspace.yaml, package.json
```

## What belongs in each package — and what doesn't

### `apps/native` (Expo) — the app we build now
- **Yes:** screens (Expo Router), navigation, native modules (push, camera for verification), NativeWind layout, role-based navigators (mom / pro).
- **No:** business logic (→ `core`/`features`), raw Supabase calls (→ `supabase`), hardcoded design values (→ `tokens`).

### `apps/web` (Next.js) — shelved
- Same "No" list. When revived: routes (App Router), server components, API routes, shadcn/ui, role-based route groups. Shares everything below the UI.

### `packages/tokens` — `@momlee/tokens`
- Single source of truth for color, spacing, typography, radius, shadows, breakpoints. **Derived from Figma variables.**
- Exports: tailwind-preset, JS/TS constants (and CSS variables for web later).
- **No one** defines a color/spacing outside this package.

### `packages/ui` — `@momlee/ui`
- Primitives we write: Button, Input, Card, Avatar, Sheet, Badge…
- Built on NativeWind. Consumes only `@momlee/tokens` — no hardcoded values.

### `packages/core` — `@momlee/core`
- Pure domain logic: meetup rules (host-defined capacity, min 2, max 100), role permissions (mom/pro), subscription math, provider abstractions (KYC/SMS/billing).
- Shared **Zod schemas** (meetup, profile, message…) and cross-platform non-DOM hooks.
- **No** direct Supabase calls (that's `supabase`'s job), and **no** UI.

### `packages/features` — `@momlee/features`
- Self-contained **feature modules**, each composing `ui` + `core` + `supabase`: `meetups`, `chat`, `profile`, `discovery`, `onboarding`, `verification`, `pro-dashboard`, `subscription`, `notifications`.
- Each module is role-aware (exposes mom-facing and/or pro-facing surfaces). See `modules-roles.md`.
- Apps compose these modules into routes; they don't reimplement feature logic.

### `packages/supabase` — `@momlee/supabase`
- Client init (native auth/storage variants).
- **Generated types** from the schema (`supabase gen types`).
- queries/mutations layer, realtime subscriptions, RLS helpers, RPCs.
- See `data-model.md`.

### `packages/i18n` — `@momlee/i18n`
- Translation dictionaries (he default), `t()` function, `direction` engine (rtl/ltr). RTL-first.

### `packages/config` — `@momlee/config`
- Base tsconfig (strict), eslint, prettier, tailwind base preset. Every app/package inherits — zero config duplication.

## Dependency direction (import rules)
```
apps/native ─┐
apps/web   ──┤→ features → ui → tokens
             │           → core
             │           → supabase → core (types)
             └→ i18n
```
- `tokens` imports nothing.
- `core` does not import `ui`/`supabase`/`features`/`apps`.
- `features` may import `ui`, `core`, `supabase`, `i18n` — never `apps`.
- No reverse imports (a package never imports from an app).
- **Enforcement:** eslint `import/no-restricted-paths`.

## The layered call chain — the Architecture Gate (non-negotiable)

Every piece of remote data or server action flows through **all four layers, in order**:

```
Screen → Hook → Service → Repository → Supabase
```

**Why this is law:** a screen that calls Supabase directly looks harmless on day 1.
Three months later that same call has grown analytics, rate-limit handling, retry,
logging, and error handling — and every screen in the app is 300 lines of
duplicated plumbing. The chain exists so each of those concerns has exactly ONE
home. **A layer may be a thin pass-through today; it may NEVER be skipped.**

| Layer | Lives in | Does | Never does |
|---|---|---|---|
| **Screen** | `apps/*` (Expo Router routes) | Renders UI, binds to a hook | Import `@momlee/supabase` or `@supabase/*`; hold business logic; know Supabase exists |
| **Hook** (`useX`) | `@momlee/features/<module>` | UI-state orchestration: loading/error/disabled, calls the service | Talk to Supabase; hold domain rules |
| **Service** | `@momlee/features/<module>` (pure cross-feature rules → `@momlee/core`) | Business logic: validation (Zod), domain rules, analytics events, retry/rate-limit policy, logging, error mapping | Import the Supabase client; render anything |
| **Repository** | `@momlee/supabase` | The ONLY layer that talks to Supabase (queries/mutations/RPC/realtime, generated types) | Business logic; UI concerns |

> Note the import rules above: `core` never imports `supabase`, so services that
> need data live in the **feature module** and call the repository; `core` holds
> the pure domain rules they apply.

### Forbidden (the day-1 shortcut that becomes the 300-line screen)

```tsx
export function PhoneScreen() {
  const sendOtp = async () => {
    await supabase.auth.signInWithOtp({ phone }); // ❌ screen talks to Supabase
  };
  return <Button onPress={sendOtp} />;
}
```

### Mandatory

```tsx
// Screen — apps/*: UI only; doesn't know Supabase exists
export function PhoneScreen() {
  const { sendOtp } = usePhoneAuth();
  return <Button onPress={sendOtp} />;
}

// Hook — @momlee/features/onboarding/use-phone-auth.ts: UI-state orchestration
export function usePhoneAuth() {
  // loading / error state lives here
  const sendOtp = (phone: string) => authService.sendOtp(phone);
  return { sendOtp };
}

// Service — @momlee/features/onboarding/auth-service.ts: business logic home
export const authService = {
  async sendOtp(phone: string) {
    // validation, analytics, rate-limit policy, retry, logging land HERE
    return authRepository.sendOtp(phone);
  },
};

// Repository — @momlee/supabase: the ONLY file that imports the client
export const authRepository = {
  sendOtp(phone: string) {
    return supabase.auth.signInWithOtp({ phone });
  },
};
```

### Interim note (while the app still lives in `apps/mobile` without all packages)

The **layers** are mandatory from the first line of code; the package homes can
migrate later. Until a feature-module package exists, keep the same four files
per feature inside the app (e.g. `src/features/<module>/use-x.ts`,
`src/features/<module>/x-service.ts`) with the repository in the shared
Supabase layer — never collapse layers "until we have packages".

### Machine enforcement (required, not optional)

- eslint `no-restricted-imports` / `import/no-restricted-paths`:
  - `@supabase/*` and the Supabase client are importable **only** inside the repository layer (`packages/supabase`, or the interim repository folder).
  - `apps/*` may not import `@momlee/supabase` at all — screens reach data only through feature hooks.
- A PR that violates the boundary fails lint — it never reaches review as a judgment call.

## Access from code
Remote/server state goes **through `@momlee/supabase` only** (queries/mutations/RPC + generated types), reached via the chain above. No SQL or direct Supabase calls from `apps/*`.

## Monorepo architecture (Maor's decision, 2026-06-11) — cross-platform design system

```
apps/
  mobile/
    src/app/        # screens (expo-router)
    src/shells/     # page templates: OnboardingPageTemplate (future templates side-by-side)
    src/lib/        # app glue ONLY: analytics, auth, supabase, anon, rtl
packages/
  tokens/   # ❖ Variables (@momlee/tokens) — synced from Figma
  ui/       # THE design system (@momlee/ui) — import { Button } from '@momlee/ui'
    src/primitives/  # AppText, Button, Input, Icon, ProgressBar
    src/forms/       # Forms/*: PhoneField, CountryDropdown, OtpInput, flags
    src/brand/       # BrandMark
    assets/          # icons/ flags/ brand/ (SVGs from Figma)
  core/     # platform-agnostic logic (@momlee/core): i18n, countries, validation — NO react imports
```

Rules:
- **Folder-per-component** (`Button/Button.tsx + index.ts`) — when Web returns, add
  `Button.web.tsx` beside it and nothing moves. The split to `.native.tsx` happens then.
- ui's RN entry is `src/index.native.ts`; the legacy `src/index.ts` (cn/old web tokens)
  keeps serving the shelved Next app until web is rebuilt on this design system.
- A component earns a place in @momlee/ui only if it's part of the design system —
  screen-specific copy blocks (e.g. legal paragraphs) are INLINE in the screen.
- Figma names = component/file names.

Monorepo gotchas (cost us real debugging):
- **Expo Metro consumes tsconfig `paths`** — never alias runtime modules (e.g. 'react')
  to type-only locations; pin divergent @types via package-local devDependencies instead.
- After workspace dep changes, if Metro can't resolve core modules: full clean reinstall
  (`rm -rf node_modules apps/*/node_modules packages/*/node_modules && pnpm install`).

**Icons policy:** icons come ONLY from the Figma Icons library (node 3463:407484),
downloaded as currentColor SVGs into `assets/icons/` and exposed via `base/Icon`
(with SEMANTIC `forward`/`backward`). Never substitute look-alike glyphs from
other icon packs (the early Ionicons stand-ins were replaced).

