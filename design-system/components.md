# Components

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

## Principle

**One Figma component = one code component in the shared UI layer.** Reuse
before create. A design change happens in **one place** — the shared component —
and propagates everywhere it is used. Never fork a component to tweak it locally.

## Observed components (seed)

From the Mom onboarding Figma. **All are "planned" — not built yet.**

| Component | Where seen | Reuse status |
|-----------|------------|--------------|
| Status bar (iPhone) | Onboarding screens | planned |
| Create Account / primary CTA button | Welcome, onboarding | planned |
| Sign In button | Welcome | planned |
| Social buttons | Welcome | planned |
| Skip button | Onboarding | planned |
| Back button | Onboarding | planned |
| Page heading (text) | Onboarding screens | planned |
| Hint text | Onboarding screens | planned |
| Text input | Phone, Name, OTP, BirthDate | planned |

## Built in code (apps/mobile/src/components) — status 2026-06-11

| Component | Purpose | Notes |
|---|---|---|
| AppText | THE text primitive — RTL base, align (right/center/ltr), weight (Noto per-family) | every user-facing text |
| PageTemplate | onboarding chrome: heart, heading, content, CTA; keyboard container model; optional BackButton | single-container keyboard rules |
| Button | full-width primary/secondary, h-touch (48) | |
| IconCta | 48×48 forward CTA, SEMANTIC forward icon | |
| BackButton | top-nav back, semantic backward icon, start side | product decision 2026-06-11: shown on phone step even though the Figma variant hides it (escape to Welcome); pending a Figma variant |
| SocialButton + GoogleIcon | 48×48 social, official multicolor G / Facebook | |
| UnderlineField (+INPUT_TEXT_STYLE) | underline input, iOS-safe metrics | shared metrics with dial prefix |
| PhoneField | LTR digits row: pressable dial box + number | dial press reopens country selector |
| CountryDropdown (+flags.ts, 48 Figma flag SVGs) | inline type-to-search dropdown, Israel default | per screen-04 annotation |
| OtpInput | 6 boxes, brand filled state, oneTimeCode autofill | |
| Logo / Logomark | wordmark / heart variants | variants matter |
| LegalText | SMS consent copy | exact Figma copy |

Libs: i18n (typed t, directionFor), icons (FORWARD/BACKWARD), phone (R1-R4), countries (+search), analytics (first-party, anon_id), auth (requestOtp/verifyOtp), supabase (lazy fail-soft), rtl.

