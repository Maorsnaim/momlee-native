> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Security — the absolute truth

> This document is **non-negotiable**. Momlee is a product for mothers — it holds identity, location, phone, and children-related data. Treat the frontend (React Native / Expo) as **hostile**. Every rule here is mandatory; no feature ships that violates it. When in doubt, choose the more restrictive option. The MomLee-specific privacy rules (16–23) are expanded in `privacy.md`.

---

## 1. No secrets in the frontend
Anything shipped to the client is **exposed**. The following must **never** appear in client code or `EXPO_PUBLIC_*` / `NEXT_PUBLIC_*` vars:

```
STRIPE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
RESEND_API_KEY=
TWILIO_AUTH_TOKEN=
PERSONA_API_KEY=
```

The client may only hold **public** keys:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN=
```

Every operation involving a secret goes through a **Backend / Edge Function**.

## 2. Never use the Service Role on the client
Forbidden:
```
createClient(url, serviceRoleKey)
```
The client uses only the `anon` key. The `service_role` key is server-side only, and even there used with care (least privilege, scoped functions).

## 3. Double validation: Client + Server
The client validates for UX. The server validates for **security**. Never trust client validation.

```ts
const schema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  role: z.enum(["mom", "pro"]),
});
```

Every API / Edge Function must validate input with Zod (or equivalent) before acting.

## 4. Authorization on every API
Being authenticated is not enough. Check that the user is actually **allowed** to perform the action:

```ts
if (meetup.host_id !== user.id) {
  throw new Error("Forbidden");
}
```

```
Authenticated ≠ Authorized
```

## 5. Use RLS as if the frontend is hostile
Even if there's a bug in the frontend, RLS must stop it. Default-deny on every table, then open explicitly:

```sql
create policy "Users can update their own profile"
on profiles
for update
using (auth.uid() = id);
```

RLS is the last line of defense, not the first — but it must always hold.

## 6. Never trust a role coming from the client
The app must never send:
```json
{ "role": "admin" }
```
and have it persisted. Roles are determined **server-side only**. `role` columns are never writable from client input.

## 7. Subscriptions via Stripe webhooks only
Forbidden from the app:
```
updateUser({ subscription_status: "active" })
```
Subscription status updates **only** from a verified Stripe (or store IAP) webhook. Verify the webhook signature.

## 8. Separate code by environment — no leftover bypasses
A common Expo mistake:
```ts
if (__DEV__) {
  // bypass auth
}
```
…that somehow survives into production. Use an explicit guard and never leave auth bypasses:
```ts
const isProd = process.env.NODE_ENV === "production";
```

## 9. Return no more data than necessary
Instead of:
```ts
select("*")
```
do:
```ts
select("id, display_name, avatar_url, city")
```
Especially for tables involving mothers, children, location, phone, email. Minimize exposure.

## 10. Proper error handling — don't leak internals
Never return raw errors to the user:
```ts
throw error;          // ❌
return error.message; // ❌  may expose SQL, table names, logic
```
Return a generic message, log the detail internally:
```ts
return { error: "Something went wrong" };
```

## 11. Rate limiting in code
Especially for:
```
login
OTP
send message
create meetup
contact professional
report
```
Even if Supabase handles some of it, add your own limits (per-user / per-IP) on these endpoints.

## 12. Storage: verify ownership before signing URLs
Don't generate a signed URL based only on a path the user sent:
```ts
createSignedUrl(userInputPath) // ❌
```
First verify the file actually belongs to the user (or they're allowed to view it). Set short expiry on signed URLs.

## 13. Sanitize free-text content
Every user-written field:
```
bio
meetup description
professional description
message
review
```
needs cleaning/limits. Never render user-authored HTML. If rich text is needed — whitelist only.

## 14. Dependencies
Run:
```
pnpm audit
npx expo-doctor
```
Don't install unfamiliar packages just because an AI suggested them. Pin versions, commit the lockfile, and review new dependencies. See `conventions.md` → "Only the stack".

## 15. TypeScript strict
No `any`, especially in API responses, auth, roles, payments.
```json
{ "compilerOptions": { "strict": true } }
```

---

## Additional mandatory rules (Momlee-specific)
Expanded with implementation guidance in `privacy.md`.

### 16. Minimize and protect identity (KYC) data
- Store the **result** of verification (status + provider reference) — never raw ID documents or selfies. Let Persona/Stripe Identity hold the sensitive artifacts.
- The verifications data is owner-read only; writes via service-role webhooks only.

### 17. Protect location & PII
- Never expose exact coordinates of a user to others. Show approximate/relative distance, computed server-side (PostGIS is the target; the current build uses decimal lat/lng + viewport bounds — see `data-model.md`). Precise location is private.
- Phone, email, exact address, and `baby_birth_date` are private fields — never in public `select`s.

### 18. Children-related data is sensitive
- Treat any child-related data with the highest care. Collect the minimum required. This affects Israeli privacy law and (for expansion) GDPR.

### 19. Edge Functions: least privilege & signature verification
- Each Edge Function does one thing with the narrowest permissions. Verify provider signatures (Stripe, Persona webhooks) before trusting payloads.

### 20. Web hardening
- Security headers / CSP, HTTPS only, secure cookies, CSRF protection for state-changing web routes. _(Applies when the shelved web app returns.)_
- Mapbox/Resend/Stripe keys: public tokens client-side, secret keys server-side only.

### 21. Safety features are security features
- Block & report flows (see `data-model.md`) are first-class. A blocked user must not be able to see/contact the blocker — enforced in RLS, not just UI.

### 22. Secrets management & rotation
- Secrets live in the platform's secret store (Supabase secrets, EAS secrets, Vercel env for web) — never in the repo or in committed `.env` files. Provide `.env.example` with keys only, no values.
- Rotate keys on suspected exposure; have a documented rotation path.

### 23. Audit logging
- Log security-relevant events (auth, role/permission denials, payment/subscription changes, reports) to an internal log — without storing PII in plaintext where avoidable.

---

## The mental model
> **Frontend = convenience. Backend = truth.** Any rule, permission, price, role, or status that matters is enforced on the server (Edge Function + RLS). The client only ever *requests*; the server *decides*.
