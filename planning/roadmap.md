# Roadmap

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

> **Living planning channel. Maor edits → push → Sivan pulls. Context only —
> never auto-written into the code repo.**

## Direction: NATIVE-FIRST

We ship **native first**: **iOS now → Android → Web**. The previously-built web
app is **shelved** — it is not the active target. The stack is **Expo / React
Native** with design tokens, an RTL engine, and a shared UI layer, against
Supabase.

The guiding principle holds: we don't enter the next phase before the previous
one **works in RTL, leans on Figma + tokens, and meets the security baseline**.
Quality before speed.

## Phases

### Phase 0 — App foundation (current)
- Stand up the Expo / RN app (iOS target first).
- `@momlee/tokens` — derived from Figma variables + Noto Sans Hebrew typography
  tokens, exposed via the `fontFamily.sans` role token.
- RTL / i18n engine + `he` dictionary.
- Shared UI layer (one Figma component = one code component).
- Supabase wiring + security baseline (env split, no client secrets, RLS
  default-deny).
- `figma-first` workflow active.

### Phase 1 — Auth & Mom onboarding
- Phone auth (Supabase + Twilio Verify), OTP.
- Role selection (mom / pro).
- **Implement the Mom onboarding flow from Figma** (Splash → Welcome → Phone →
  OTP → Name → BirthDate → BabyType).
- Identity verification (after KYC provider decision).
- Profile build.

### Phase 2 — Meetups (the core)
- Create meetup (host capacity 2–100, type, Mapbox location, time).
- Discovery / feed by distance.
- Join / leave + DB-enforced capacity.

### Phase 3 — Chat
- Group chat per meetup + 1:1, realtime.
- Expo push on messages and joins.

### Phase 4 — Pro & Payments
- Pro registration + professional verification.
- Pro dashboard (stats, payments, create Pro meetups, edit profile).
- Subscription: trial → monthly billing.

### Phase 5 — Safety & Polish
- Blocks / reports, moderation.
- Email, accessibility, RTL polish.

### Phase 6 — Platform & i18n expansion
- **Android**, then **Web** (un-shelve after native is solid).
- Enable LTR + a second language (a switch — infrastructure already exists).

## What's next

**Stand up the Expo / RN app foundation** — design tokens, RTL engine, shared UI
layer — **and implement the Mom onboarding flow from Figma.** This is the active
work item. Everything downstream waits on a working, RTL-correct, token-driven
foundation on iOS.

> **Native work happens on the `momlee-native` branch.** Sivan builds without a
> Mac, so the build/release path is **EAS cloud** (`eas build/submit -p ios`,
> `eas build -p android`); test via Expo Go / EAS dev client. Stay in the Expo
> managed workflow (no `expo prebuild`). See `../knowledge/dev-environment.md`.

## Open decisions

| # | Decision | Status |
|---|----------|--------|
| 1 | KYC provider: Persona vs Stripe Identity (Persona leading) | Open |
| 2 | Apple/Google IAP vs Stripe for in-app payment | Open |
| 3 | Matching / "motherhood stage" model | Open |
| 4 | Final domain / branding | Open |
| 5 | Official font: **Noto Sans Hebrew (OFL)** — free for commercial use | Resolved |
