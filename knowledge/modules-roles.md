> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Modules & Roles — separation by usage type (native-first)

> A core requirement: **a clear separation between the "usage type" (Mom vs Pro) and the app's feature modules.** Mom and Pro are two distinct surfaces over a set of shared modules. This keeps each experience focused while reusing all underlying logic. The active app is the **native Expo app**; the web composition is shelved (mirrors the same structure when it returns).

## The two axes

**Axis 1 — Usage type (role):** `mom` | `pro` (plus `admin` — see below). Determines which surfaces, navigation, and screens a user sees. Role comes from the **server** (never client input).

**Axis 2 — Feature modules** (`packages/features/*`): self-contained capabilities. A module can expose a mom-facing surface, a pro-facing surface, or both — over shared logic/data.

Keeping these axes separate means: add a role-specific screen without touching shared logic, and change shared logic once for all roles.

## Role surfaces

### Mom surface
- Onboarding + verification
- Discovery / feed (nearby moms & meetups)
- Create / join / manage meetups
- Chat (group + 1:1)
- Profile (own + viewing others)
- Notifications

### Pro surface (everything Mom can do, **plus** a dedicated dashboard)
A Pro is also a participant in the community, but additionally gets the **Pro Dashboard**:
- **Statistics** — meetups created, attendance, reach, engagement.
- **Payments** — subscription status, invoices, billing history (data via Stripe webhooks; never client-set — see `security.md`).
- **Create Pro meetups** — professional meetups/workshops (capacity up to 100).
- **Edit professional profile** — credentials, profession, offerings, bio, availability.
- **Subscription management** — trial status, renew, cancel.
- **Pro CRM** (implemented today) — customers and reminder templates (email / whatsapp).

### Admin / moderator surface
The implemented `app_role` enum includes `admin` and `moderator` (alongside `user`/`provider`). Admin is a **new surface over the same modules**, not a rewrite:
- Review/approve provider professions, certifications, license authorities (master-list `pending_approval` → `active`/`rejected`).
- Verify provider credentials; moderate forum and reports.
- All admin actions are recorded in `audit_log` (see `data-model.md` / `privacy.md` §6).

## Feature modules (`packages/features/*`)

| Module | Mom surface | Pro surface | Shared core |
|--------|-------------|-------------|-------------|
| `onboarding` | role selection, profile build | + professional details | auth flow, zod schemas |
| `verification` | ID + selfie | ID + selfie + professional credentials | KYC abstraction, status |
| `discovery` | nearby feed | nearby feed | PostGIS / geo queries |
| `meetups` | create/join/manage | + create Pro meetups | capacity rules, status machine |
| `chat` | group + 1:1 | group + 1:1 | realtime, message schema |
| `profile` | view/edit own | + professional fields, offerings | profile schema |
| `subscription` | — | trial → monthly, billing | Stripe/IAP abstraction |
| `pro-dashboard` | — | stats, payments, CRM, management | analytics queries |
| `notifications` | push + in-app | push + in-app | Expo push, preferences |

Rule: **shared logic lives in `core`/`supabase`; only the role-specific composition lives in the module's surface.** A module never branches deep on role in ad-hoc ways — it exposes clear mom/pro entry points.

## How apps compose roles

### Native (Expo Router) — active
Role-based navigators resolved after auth:
```
app/
├── (auth)/            # login, OTP, role selection, verification
├── (mom)/             # mom tab navigator
│   ├── discovery
│   ├── meetups
│   ├── chat
│   └── profile
├── (pro)/             # pro tab navigator
│   ├── dashboard      # stats, payments, CRM, manage
│   ├── meetups        # + create Pro meetups
│   ├── chat
│   └── profile
└── (admin)/           # admin/moderator review surface (guarded + RLS)
```

### Web (Next.js App Router) — shelved
Role-based route groups mirror the native structure: `(auth)`, `(mom)/...`, `(pro)/dashboard, ...`, `(admin)/...`. Revived later.

## Role resolution & guarding
- A user's `role` comes from the **server** (`user_roles` / `profiles.role`), never from client input (`security.md` §6).
- Route guards (native navigators / web middleware) redirect to the correct surface by role.
- Pro-only and admin-only routes are guarded **and** enforced by RLS — UI guarding is convenience; the server is truth.

## Why this separation matters
- **Focused UX:** moms get a simple social app; pros get social + business tools, not a cluttered single screen.
- **Maintainability:** a change to meetup logic happens once in `features/meetups` and serves both roles.
- **Future roles:** a new role (e.g. admin/moderator — already in the enum) is a new surface over the same modules, not a rewrite.
