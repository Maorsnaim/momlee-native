---
name: momlee-security
description: Use whenever you wire data or actions into MomLee — auth, roles, subscriptions, API/edge functions, Supabase queries, RLS, secrets/keys, webhooks, storage URLs, free-text input, or error handling. Enforces MomLee's security rules — no client secrets, never service_role on the client, server-side Zod validation, authorization on every action, default-deny RLS, never trust client role, subscriptions only via verified webhooks, rate limits, ownership-verified signed URLs, sanitized free text, deps hygiene, TS strict. Mental model: frontend = convenience, backend = truth. Trigger on any data/action wiring.
---

# MomLee Security — frontend is hostile

> **Frontend = convenience. Backend = truth.** The client only *requests*; the server *decides*. MomLee holds identity, location, phone, and children-related data — every rule here is mandatory; when in doubt, choose the more restrictive option.

## Must-follow enforcement summary

1. **No secrets in the client.** Never ship `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `RESEND_API_KEY`, `TWILIO_AUTH_TOKEN`, `PERSONA_API_KEY`. Client may hold only public keys: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`.
2. **Never `service_role` on the client.** Client uses the `anon` key only; service_role is server-side, least-privilege.
3. **Server-side validation (Zod)** on every API/edge function before acting. Client validation is UX only.
4. **Authorization on every action** — authenticated ≠ authorized. Check the user is actually allowed (e.g. `meetup.host_id === user.id`).
5. **RLS default-deny** on every table, opened explicitly. RLS is the last line of defense; UI hiding is not security.
6. **Never trust a client-sent `role`/status.** Roles and statuses are server-only; `role` columns are never writable from client input.
7. **Subscriptions only via verified Stripe / store-IAP webhooks** — verify the signature. The client never sets subscription status.
8. **No `__DEV__` auth bypass shipping to prod.** Use an explicit `NODE_ENV === "production"` guard; leave no bypasses.
9. **Select only needed fields** — never `select('*')` on tables with mothers/children/location/phone/email.
10. **Generic errors to users, detailed logs internally** — never leak SQL, table names, or logic.
11. **Rate limits** on `login`, `OTP`, `send message`, `create meetup`, `contact professional`, `report` (per-user / per-IP).
12. **Verify storage ownership before signed URLs**; short expiry. Never sign a raw user-supplied path.
13. **Sanitize free text** (bio, descriptions, messages, reviews) with limits. **Never render user-authored HTML.**
14. **Deps hygiene** — `pnpm audit` / `npx expo-doctor`, pin versions, commit the lockfile (`pnpm-lock.yaml`), review new deps.
15. **TypeScript strict** — no `any`, especially in auth/roles/payments/API responses.

Plus MomLee-specific rules 16–23 (KYC minimization, location/PII protection, children's data, least-privilege + signature-verified edge functions, web hardening, block/report as security, secrets management & rotation, audit logging) — see **momlee-privacy** for the data-protection detail.

## Full rules
The complete, authoritative **23 rules** with code examples: **../../knowledge/security.md**. Data model & RLS guidelines: `../../knowledge/data-model.md`. Integrations & key placement: `../../knowledge/integrations.md`.
