---
name: momlee-privacy
description: Use whenever you handle MomLee personal data — KYC/identity verification, location/coordinates, PII (phone/email/address/baby_birth_date), children's records, block/report flows, audit logging, or secrets. MomLee is a product for mothers under Israeli privacy law (and GDPR for expansion). Enforces store-result-only KYC, location privacy (no exact coords to others, server-side distance), private PII never in public selects, highest-care children's data, RLS-enforced block/report, PII-free audit logs, and secrets management/rotation. Trigger on any handling of identity, location, PII, or children's data.
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

## The mental model (privacy lens)
> The client only *requests* a privacy-safe view; the server *decides* what (if anything) it may see.

## Full detail
Authoritative implementation guidance: **../../knowledge/privacy.md**. Security rules it expands: `../../knowledge/security.md`. Schema, private fields, and RLS guidelines: `../../knowledge/data-model.md`.
