> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Privacy — MomLee-specific data protection

> Momlee is a product for **mothers** — it holds identity, location, phone, and **children-related** data. This is the most sensitive category of personal data under **Israeli privacy law** and, for any expansion, **GDPR**. These rules expand security rules 16–23 (`security.md`) into concrete implementation guidance. When in doubt, choose the more private option. Default principle: **collect the minimum, expose the minimum, retain the minimum.**

---

## 1. Identity / KYC — store the result, never the raw documents
- Verification (ID + selfie) is performed by the KYC provider (**Persona** leading / Stripe Identity alternative). **We store only the result**: status (`pending` | `verified` | `rejected`), the provider name, and an opaque provider reference.
- **Never store raw ID documents, selfies, or any biometric artifact on our side.** The provider holds the sensitive artifacts; we hold a pointer.
- Verification rows are **owner-read only**; writes happen **only via service-role webhooks** (signed and verified — see rule 19 / §6 below). The client can never write a verification status.
- The verification provider is wrapped behind a `verificationProvider` abstraction in `@momlee/core`, so the minimization rule holds regardless of which provider is chosen.

## 2. Location privacy — never expose exact coordinates
- A user's precise location is **private**. It is **never** returned to other users.
- Discovery shows **approximate / relative distance only**, computed **server-side via PostGIS** — the raw coordinates never leave the server in a user-visible payload.
- Implementation note: distance/geo math runs in Postgres (PostGIS), not in the client. The client receives a distance bucket or approximate value, not lat/lng of another user. (Mapbox renders the map; it is not the source of another user's coordinates.)
- Meetup locations may show an address/area for the event, but a *person's* home/precise location is never broadcast.

## 3. Private PII fields — keep them out of public reads
These fields are **private** and must never appear in a public `select` or be returned to anyone but the owner (and admins where strictly required):
- `phone`
- `email`
- exact `address` / precise `location`
- `baby_birth_date` (used to compute the mom's "stage" — derive server-side, expose the derived stage, not the raw date)

Public profile reads return only safe fields (e.g. `id, display_name, avatar_url, city`). Enforce this in RLS column/row policies and in the data layer's explicit column lists (security rule 9 — minimize returned data).

## 4. Children's data — highest care
- Treat **any** child-related data (name, gender, birth date, anything in the children records) with the **highest** level of protection.
- Collect the **minimum** required for the feature; do not collect children's data "just in case".
- This data is subject to Israeli privacy law and (on expansion) GDPR rules for minors. It is owner-scoped only — a parent sees their own children's data; it is never part of any public surface.

## 5. Block & report — privacy enforced in RLS, not just UI
- Block and report flows are **first-class safety/privacy features**.
- A **blocked user must not be able to see or contact the blocker** — this is enforced in **RLS** (and RPC checks), not merely hidden in the UI. UI hiding is convenience; the server is truth.
- Reports are stored for moderation; the reported party is not exposed to the reporter's identity beyond what's necessary.

## 6. Audit logging without plaintext PII
- Log security- and privacy-relevant events: auth events, role/permission denials, payment/subscription changes, reports, and admin actions on user data.
- **Do not store PII in plaintext** in audit logs where avoidable. Reference subjects by ID; keep denormalized snapshots minimal (e.g. a name for an entity that may be deleted), never phone/email/precise location in the clear.
- Audit entries record *who did what to which target and why* — enough to investigate, not enough to leak a user's private data.

## 7. Edge Functions — least privilege & signature verification
- Each Edge Function does **one thing** with the **narrowest** permissions.
- **Verify provider signatures** (Stripe webhooks, Persona/KYC webhooks) **before trusting any payload.** An unsigned or invalid webhook is rejected — it must never be able to flip a verification or subscription status.

## 8. Secrets management & rotation
- All secrets live in the platform's secret store: **Supabase secrets**, **EAS secrets** (native), Vercel env (web, when it returns) — **never** in the repo or in committed `.env` files.
- Ship a `.env.example` with **keys only, no values**.
- **Rotate keys on any suspected exposure**, and keep a documented rotation path. Secret keys (Stripe secret, service-role, Resend, Twilio, Persona) are server-side only and used only inside edge functions.

---

## The mental model (privacy lens)
> **Collect less, expose less, keep less.** Anything that identifies a mother, locates her, or relates to her child is private by default and enforced on the server. The client only ever *requests* a privacy-safe view; the server *decides* what (if anything) it may see.
