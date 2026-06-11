> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Data Model — Supabase schema

> Every table gets **RLS from day one** (see `security.md` / `privacy.md`). Access from app code is **through `@momlee/supabase` only** (queries/mutations/RPC + generated types) — no SQL or direct calls from `apps/*`.
>
> **Any change to this schema goes through the Migration Gate** (`../skills/momlee-migration/SKILL.md`): migration file + rollback plan + RLS impact + affected tables + affected APIs, proven before SQL is written. After every applied migration, section B below is updated and `database.types.ts` is regenerated.
>
> This file has two parts: **(A) the target native-first model** (the design we work toward), and **(B) the actually-implemented tables** in `supabase/migrations/` today (the web-era build, now shelved). They overlap heavily; where they differ, B is the current ground truth and A is the direction.

---

## A. Target model (native-first design)

### `profiles` — extends `auth.users` (Supabase Auth, phone)
- `id` (uuid, FK → auth.users)
- `role` (`mom` | `pro`) — **server-set only, never from client**
- `display_name`, `bio`, `avatar_url`
- `baby_birth_date` (date, null for Pro) — to compute the mom's "stage". **Private** (`privacy.md`).
- `city`, `location` (geography point) — distance-based discovery via PostGIS. Precise `location` is **private**.
- `verification_status` (`pending` | `verified` | `rejected`)
- `created_at`, `updated_at`

> **Exposing display info to other users — use a safe view, not a broad policy.** Never expose the full `profiles` / `auth.users` row to other users (PII: phone, email, `baby_birth_date`, precise `location`). RLS is row-level, so to show only safe columns, expose a dedicated VIEW. The current web build does this with **`public.user_display_info`** (id, display_name, avatar_url ONLY) for meetup attendee lists — never add PII columns to it. Verified **provider** contact info is public by design (D4). See `security.md` §24.

### `pro_profiles` — professional details (1:1 with role=pro)
- `profile_id` (FK), `profession`, `credentials`, `professional_verified` (bool)
- `subscription_status` (`trialing` | `active` | `past_due` | `canceled`), `trial_ends_at`, `current_period_end`

### `meetups`
- `id`, `host_id` (FK → profiles), `type`, `title`, `description`
- `location` (geography point), `address_text`, `starts_at`
- `capacity` (int, **host-defined; CHECK (capacity BETWEEN 2 AND 100)**)
- `status` (`open` | `full` | `completed` | `canceled`), `is_pro` (bool)

### `meetup_participants`
- `meetup_id` (FK), `profile_id` (FK), `status` (`joined` | `left` | `removed`)
- UNIQUE(`meetup_id`, `profile_id`); capacity enforced in the DB (trigger/function): `joined` count ≤ `capacity`.

### `conversations` + `messages`
- `conversations`: `id`, `type` (`meetup` | `direct`), `meetup_id` (nullable)
- `conversation_participants`: `conversation_id`, `profile_id`
- `messages`: `id`, `conversation_id`, `sender_id`, `body`, `created_at`, `read_at` — Realtime subscriptions.

### `verifications`
- `profile_id` (FK), `provider` (`persona` | `stripe_identity`), `provider_ref`, `status`, `verified_at`
- **Result only — never raw documents/selfies** (`privacy.md`).

### `subscriptions` (Pro)
- `profile_id`, `provider` (`stripe` | `apple_iap` | `google_iap`), `provider_ref`, `status`, `trial_ends_at`, `current_period_end`
- Provider webhook updates status — **never the client**.

### To add (critical for a product for mothers)
- **`blocks` / `reports`** — block & report safety flows. A blocked user must not see/contact the blocker — **enforced in RLS** (`privacy.md` §5).

---

## B. Implemented tables (current migrations — ground truth today)

Source: `MomLee/supabase/migrations/`. ~28 tables. The implemented build uses a `public.users` table (FK target for most rows) alongside `profiles`/`provider_profiles`, an `app_role` enum, and decimal lat/lng (not yet PostGIS).

### People & roles
- **`profiles`** — `id` (FK → auth.users), `email`, `display_name`, `avatar_url`, `phone`, timestamps. _(`email`/`phone` are private PII.)_
- **`user_roles`** — `user_id` (FK → auth.users), `role` (`app_role`), UNIQUE(user_id, role). **Roles are server-controlled.**
  - `app_role` enum = `admin` | `moderator` | `user` | `provider`.
- **`admin_profiles`**, **`admin_settings`** — admin surface.
- **`children`** — `parent_id` (FK → users), `name`, `gender` (`female`|`male`), `birth_date`, `is_focus_baby`. **Highest-care data** (`privacy.md` §4).

### Providers (Pro)
- **`providers`** — `name`, `address`, `home_visit`, `services` (text[]), `phone`, `email`, `description`.
- **`provider_professions`** — `provider_id` (FK → users), `profession_id` (FK → professions), `document_url`, `verification_status` (`pending`|`verified`|`rejected`), `verified_by`, `verified_at`, UNIQUE(provider_id, profession_id).
- **`professions`** — master list: `name_he` (unique), `status` (`active`|`pending_approval`|`rejected`), `requested_by_user_id`, review fields.
- **`provider_offerings`** — `provider_id` (FK → provider_profiles), `title`, `description`, `cost_min`/`cost_max` (numeric, CHECK max ≥ min), `duration_minutes`, `is_active`, `display_order`.
- **`provider_services`**, **`provider_gallery`**, **`provider_education_records`**, **`provider_customers`**, **`provider_reminder_templates`**.
- **`certifications`**, **`certification_institutes`**, **`institutes`**, **`license_authorities`** — credential master lists, each with the `name_he` + `status` (`active`|`pending_approval`|`rejected`) + reviewer pattern.
- **`services`**, **`regions`**.

### Meetups & chat
- **`baby_meetups`** — `creator_id`, `title`, `description`, `latitude`/`longitude` (decimal), `location_address`, `meetup_date`, `meetup_time`, `participants` (jsonb), `created_at`.
  - Geo today: a btree index on `(latitude, longitude)` for **viewport-based** queries (`gte/lte` bounds). **Target migrates this to PostGIS** so distance is computed server-side and exact coordinates are never exposed (`privacy.md` §2).
- **`chat_messages`** — `meetup_id` (FK → baby_meetups), `user_id`, `user_name`, `message_text`, `created_at`. Realtime.

### Community & engagement
- **`forum_questions`**, **`forum_answers`** — Q&A forum.
- **`favorites`** — polymorphic: `user_id`, `entity_type` (`provider`|`mother`|`baby_meetup`|`pro_meetup`), `entity_id`, `notes`, `position`, UNIQUE(user_id, entity_type, entity_id).
- **`provider_customers`**, **`reminder_sent`**, **`provider_reminder_templates`** — Pro CRM / reminders (email / whatsapp `reminder_type`).

### Auditing
- **`audit_log`** — `actor_id` (FK → users), `action` (`audit_action` enum), `target_table`, `target_id`, `target_name` (denormalized snapshot, survives deletion), `reason` (admin-supplied), `metadata` (jsonb). **No plaintext PII** (`privacy.md` §6).

### Key relationships (implemented)
- `profiles.id` → `auth.users.id`; `user_roles.user_id` → `auth.users.id`.
- Most provider/credential/children/favorites rows FK to **`public.users`** (the implemented user table); some provider tables FK to **`public.provider_profiles`**.
- `provider_professions` → `professions`; credential tables → their master lists (`certifications`, `institutes`, `license_authorities`).
- `chat_messages` → `baby_meetups`; `forum_answers` → `forum_questions`.

---

## RLS — guidelines (apply to both A and B)
- **profiles**: any verified user reads *public* fields only; updates → owner only. Private PII (`phone`, `email`, precise location, `baby_birth_date`/children) never in public reads.
- **meetups / baby_meetups**: read for verified users; create/edit → host/creator only; joining via an RPC that checks capacity + role.
- **messages / chat_messages**: read/write → conversation/meetup participants only.
- **verifications / subscriptions**: owner read only; writes → service-role (signed webhooks) only.
- **children / favorites**: owner-scoped only.
- **role / verification_status / subscription_status**: never set from client input — server-side only.
- **blocks / reports** (to add): a blocked user cannot see/contact the blocker — enforced in RLS.

## Open for discussion
- "Motherhood stage" model (from `baby_birth_date`) for matching — define with product.
- Reconcile A vs B: migrate `baby_meetups` lat/lng → PostGIS; consolidate `users`/`profiles`/`provider_profiles`; add `blocks`/`reports`.
- Meetup matching/recommendation engine — later stage.
