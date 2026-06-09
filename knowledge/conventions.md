> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Conventions — how we work (native-first)

The active target is the **native Expo app** (iOS → Android → Web). The web app is shelved; conventions still apply to it when it returns.

## "Only the stack" — the most important iron rule
- Do not add a library / SDK / service that is not in `stack.md` **without explicit approval**.
- Before `pnpm add` of anything new: check whether the stack already solves it (Supabase, Zod, NativeWind…).
- Need a solution? First ask "does the stack already provide this?" and only then propose an addition — with justification. Do not install unfamiliar packages just because an AI suggested them (see `security.md` → dependencies).

## TypeScript
- `strict: true` everywhere. No `any` (if unavoidable — `unknown` + narrowing). Especially in API responses, auth, roles, payments.
- Shared types in `@momlee/core` / derived from Supabase (`@momlee/supabase`). Don't duplicate types.
- **Zod is the source of truth** for runtime validation, and `z.infer` for the type.

## Naming
- Files/folders: `kebab-case`. React components: `PascalCase`. Hooks: `useX`.
- Packages: `@momlee/<name>`.
- i18n keys: `namespace.context.key`.
- DB tables: `snake_case`, plural (`baby_meetups`, `provider_professions`).

## Components
- A component = one job. A file growing too large ⇒ it does too much → split it.
- **Zero business logic in UI** — it lives in `@momlee/core` / `@momlee/features`.
- Explicit prop types. No "magic" booleans — prefer variants.

## State & Data
- Server/remote state: through `@momlee/supabase` (queries + realtime).
- **No direct Supabase calls from `apps/*`** — always through the data layer.
- Local UI state: hooks. No unnecessary global state.

## Design — Figma-first, tokens only
- **Tokens only.** Figma-first: pull design context, variables, and existing components from the Figma file before writing code. Never hardcode color/spacing/size — use `@momlee/tokens`.
- **RTL-first.** Use logical properties (start/end), never left/right. he-IL is the default direction.
- **Noto Sans Hebrew via tokens** (`fontFamily.sans`). Components never reference a font file path or raw size/weight — only typography tokens. **Never use Google Sans.** The font is OFL-licensed (free to ship); a future family change is a one-line change in `@momlee/tokens`.

## Roles & modules (see `modules-roles.md`)
- Mom and Pro are **distinct surfaces over shared modules**. Keep role-specific UI separated; share the underlying logic.

## Git
- Branches: `feat/`, `fix/`, `chore/`. Small, focused PRs.
- A commit = one coherent unit of work.

## Tests (principle, to be expanded)
- Logic in `@momlee/core` → unit tests (meetup rules, role permissions, subscription).
- Zod schemas tested against valid/invalid inputs.
- Screens → RTL smoke test.

## Accessibility
- Contrast, touch targets ≥44px, screen-reader labels.
- In Hebrew: ensure full RTL readability. (Keyboard navigation applies to web when it returns.)

## Security & privacy (critical — a product for mothers)
- See `security.md` — **the absolute truth** (23 rules) — and `privacy.md`. Highlights: no secrets in the client; RLS on every table as if the frontend is hostile; double validation (client + server); authorization on every API; least data returned.
- Secrets in env only, never in code. service-role key server-side only.
- Identity-verification data — store the minimum on our side; rely on the KYC provider (result only, never raw documents).
