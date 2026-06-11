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

## Access from code
Remote/server state goes **through `@momlee/supabase` only** (queries/mutations/RPC + generated types). No SQL or direct Supabase calls from `apps/*`.

## Mobile component taxonomy (mirrors the Figma design system)

```
apps/mobile/src/components/
├── base/        # ❖ Base Components (Figma base sets): AppText, Button, Input,
│                #   Icon, BrandMark, ProgressBar
├── app/
│   ├── forms/   # Forms/* compositions: PhoneField, CountryDropdown, OtpInput, flags
│   ├── templates/  # one file per Figma template: OnboardingPageTemplate
│   │               # (post-onboarding flows get their OWN template files here)
│   └── LegalText.tsx  # app-specific blocks
```
Variables live in `packages/tokens` (@momlee/tokens). Figma names = file/component names.

**Icons policy:** icons come ONLY from the Figma Icons library (node 3463:407484),
downloaded as currentColor SVGs into `assets/icons/` and exposed via `base/Icon`
(with SEMANTIC `forward`/`backward`). Never substitute look-alike glyphs from
other icon packs (the early Ionicons stand-ins were replaced).

