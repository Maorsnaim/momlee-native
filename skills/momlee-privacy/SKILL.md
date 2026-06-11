---
name: momlee-privacy
description: Use whenever you handle MomLee personal data — KYC/identity verification, location/coordinates, PII (phone/email/address/baby_birth_date), children's records, block/report flows, audit logging, or secrets — and whenever requesting ANY device permission (location/notifications/camera/photo library/contacts), uploading ANY file/image, or adding data that needs retention/deletion behavior. Enforces store-result-only KYC, location privacy, private PII never in public selects, highest-care children's data, RLS-enforced block/report, PII-free audit logs, secrets rotation, the unified permission wrapper, the Upload Gate, and retention-by-design. Trigger on any handling of identity, location, PII, children's data, permissions, uploads, or deletion.
---

# MomLee Privacy — collect less, expose less, keep less

> MomLee holds identity, location, phone, and **children-related** data — the most sensitive category under **Israeli privacy law** (and **GDPR** on expansion). Default to the more private option. These rules expand security rules 16–23.

## Must-follow enforcement summary

1. **KYC — store the result only.** Keep status (`pending`/`verified`/`rejected`) + provider name + opaque provider reference. **Never** store raw ID documents, selfies, or biometric artifacts — the provider (Persona / Stripe Identity, behind the `verificationProvider` abstraction) holds those. Verification rows are owner-read only; writes via signed service-role webhooks only.
2. **Location privacy.** A user's precise location is private and **never** returned to other users. Discovery shows approximate/relative distance computed **server-side**. (Note: the implemented build uses decimal lat/lng with viewport bounds; **PostGIS server-side distance is the target** — do not expose another user's raw coordinates in any payload.)
3. **Private PII fields** — `phone`, `email`, exact `address`/precise location, `baby_birth_date` — never in a public `select` or any read visible to others. Public reads return only safe fields (e.g. `id, display_name, avatar_url, city`). Derive the mom's "stage" from `baby_birth_date` server-side; expose the stage, not the date.
4. **Children's data — highest care.** Treat all child-related data (name, gender, birth date, children records) with the highest protection. Collect the minimum; never "just in case". Owner-scoped only — never in any public surface.
5. **Block & report enforced in RLS.** A blocked user must not see or contact the blocker — enforced in **RLS** (and RPC checks), not just UI. Reports are stored for moderation without over-exposing identities.
6. **Audit logging without plaintext PII.** Log auth events, permission denials, payment/subscription changes, reports, admin actions on user data — by subject ID, with minimal denormalized snapshots. Never phone/email/precise location in the clear.
7. **Secrets management & rotation.** Secrets live in the platform secret store (Supabase secrets, EAS secrets, Vercel env later) — never in the repo or committed `.env`. Ship `.env.example` with keys only. Rotate on suspected exposure; keep a documented rotation path.

## Device Permission Gate (Maor, 2026-06-11)

**Everything touching location, notifications, camera, photo library, or
contacts goes through ONE unified permission wrapper** (`@momlee/core/permissions`,
mirroring the analytics-wrapper pattern) — **never the Expo permission APIs
directly from a screen or component.**

- **Request IN CONTEXT** — when the feature is used, never a battery of
  prompts on launch (data-inventory rule 3).
- **Every request has an honest, specific Hebrew purpose string**, written
  when the permission is added (see `../../knowledge/copy-guidelines.md` +
  data-inventory; vague strings = App Store rejection).
- **Denial is a designed state, not a crash:** degraded-but-working
  experience + a clear path to Settings. The app NEVER hard-blocks on a
  denied permission.
- New permission = a `../../knowledge/data-inventory.md` row + store-release
  implications, in the same change.

## Upload Gate — every file/image upload (Maor, 2026-06-11)

Profile photos, documents, certificates, possibly children's photos — every
upload declares ALL six BEFORE implementation; print the block:

```
UPLOAD GATE: <what is uploaded>
- Size limit:     <max size + client-side compression>
- File types:     <explicit allowlist (e.g. jpg/png/webp; pdf for docs)>
- Privacy class:  <public | private | SENSITIVE (children, identity docs)>
- Bucket:         <which storage bucket — private by default>
- Access policy:  <who reads it: RLS + ownership-verified signed URLs, expiry>
- Delete policy:  <soft delete + purge window; covered by account deletion>
```

- **Strip EXIF/GPS metadata before upload** — photos of moms and children
  carry location data; it never reaches storage. (Claude's addition — flag to
  Maor if a use-case ever needs EXIF retained.)
- Public-read buckets are forbidden (the 2026-06 incident); signed URLs only,
  ownership verified (**momlee-security** rule 12).

## Deletion & Retention — no data without an exit plan (Maor, 2026-06-11)

**No new data model without retention/deletion behavior.** Every new
table/column/bucket declares, at creation time (enforced as a field in the
**momlee-migration** gate): what happens on account deletion — cascade /
anonymize / retain-with-legal-basis — and its retention window.

- **Default to SOFT delete** (flagged + hidden + purge window), hard delete
  only with Maor's explicit approval per case.
- Account deletion is MANDATORY (store rule) and must actually cover
  everything: photos, messages, children records, meetups, verification
  references. The cascade map lives in `../../knowledge/data-inventory.md`
  (retention/deletion column) — a row with TBD there is a blocker.

## The mental model (privacy lens)
> The client only *requests* a privacy-safe view; the server *decides* what (if anything) it may see.

## Full detail
Authoritative implementation guidance: **../../knowledge/privacy.md**. Security rules it expands: `../../knowledge/security.md`. Schema, private fields, and RLS guidelines: `../../knowledge/data-model.md`.
