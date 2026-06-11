# Annotations — the behavior spec

> Maor-maintained. Flows to Sivan via git. Clear English (dev docs).

## What annotations are

Figma annotations are the **behavior spec** for each screen and component. They
capture everything the visual frame alone does not:

- **States** — loading / empty / error / full.
- **Visibility conditions** — when an element shows or hides.
- **Validations** — input rules, error messages, allowed values.
- **Role permissions** — what mom vs pro can see or do.
- **Edge cases** — unsupported inputs, partial data, failure paths.

**Code that contradicts an annotation is a bug.** The annotation wins; the code
is corrected to match it.

## Convention — recording notes here

When a behavior is decided but **not yet written into Figma**, Maor records it
here so Sivan still has the spec. Format:

```
### <Flow> → <Screen>
- **State:** <which state>
- **Condition / validation / permission / edge case:** <the rule>
- **Source:** Figma annotation | Maor note (not yet in Figma)
```

Once the note lands in Figma, it is the source of truth and the local note can
be trimmed to a pointer.

## Annotation format (the standard)

Write in **English**. **Bold the section headers**, and wrap every technical identifier in `inline code` (DB columns, function calls, tokens, event names, components, values). Use the real DB names (`../knowledge/data-model.md`), tokens only, RTL-first. Figma Dev Mode renders this Markdown.

Two levels per screen:
- **Screen block** — written once per screen (shared context).
- **State block** — one per state frame (Default/Empty, Valid, Error, Loading, Disabled, Sheet-open…). State blocks reference the screen block's numbered validation rules (`R1`, `R2`…) instead of repeating them.

Do **not** list a screen's components in its annotation — those are read from the Figma tree (see `../skills/momlee-figma-first/SKILL.md` → "Derive from Figma vs annotate").

### Screen block — sections (each header bold)
**Screen:** `Module / Sub / ScreenName` · **Module:** … · **Platform:** Native first; Web + Android share logic · **State:** …
**Purpose** — one sentence.
**Backend** — service + call (`supabase.auth.signInWithOtp`), provider, the abstraction enabling a future swap, where rules are enforced (server / RLS). No secrets on client.
**Data (exact DB names)** — Reads: `table.column` · Writes: `table.column`.
**Fields** — each field + placeholder + which DB value it maps to.
**Validation rules** — numbered `R1`, `R2`… so states reference them.
**Events** — analytics event names with payload.
**RTL / i18n** — logical props only; strings via `t()`; LTR fragments noted.
**A11y / Input** — keyboard type, autofill, sheet component.
**Privacy / Consent** — PII fields, consent copy, exposure rules.
**Tokens** — from `@momlee/tokens` only; no hardcoded values.

### State block — sections (bold, sub-grouped)
**STATE: `<Name>`** — one-line description.
**Display:** what each element shows.
**Behavior:** conditions true in this state.
**Validation:** which rules pass/fail (`R1`…).
**Error:** shown or not + exact message (he-IL via `t()`).
**CTA Behavior:** primary CTA `enabled`/`disabled` + next step.
*Closing sentence: "This state represents …"*

### Worked example — Onboarding / Mom / Phone (OTP request)

**Screen block**

**Screen:** `Onboarding / Mom / Phone Number (OTP request)` · **Module:** onboarding + auth · **Platform:** Native first; Web + Android share logic.
**Purpose** — Collect a valid Israeli mobile number, then send an OTP SMS to verify on the next screen.
**Backend** — `supabase.auth.signInWithOtp({ phone })` to request; `supabase.auth.verifyOtp(...)` on the OTP screen. SMS via `Twilio Verify` (in Supabase); future swap to `Vonage` → keep behind one abstraction in `@momlee/core`; the screen never calls the provider directly. Rate-limit + resend cooldown enforced **server-side**.
**Data (exact DB names)** — Writes: `auth.users.phone` (E.164) mirrored to `users.phone` (`text`). Do NOT persist an unverified number as canonical. Progress: `onboarding_progress` (planned).
**Fields** — (1) Country selector, placeholder `יש לבחור מדינה`; MVP = Israel only (recommend pre-selecting `+972`). (2) Dial prefix `(000)` + number `(000) 0000 000` → one logical phone value.
**Validation rules** — `R1` digits only after normalization · `R2` valid IL mobile via `libphonenumber-js` (region `'IL'`; prefixes `050/051/052/053/054/055/058`) · `R3` normalized to E.164 (`+9725XXXXXXXX`) before send.
**Events** — `onboarding_step_viewed { step: "phone" }` · `otp_requested { channel: "sms" }`.
**RTL / i18n** — RTL, logical props only (`ps/pe`, `ms/me`, `start/end`); strings via `t()` (he-IL); phone digits render LTR.
**A11y / Input** — `keyboardType: phone-pad`, `textContentType: telephoneNumber`; country opens a bottom sheet (`@gorhom/bottom-sheet`).
**Privacy / Consent** — on-screen SMS consent copy required; phone is PII (`users.phone`), admin-only, never shown to other users.
**Tokens** — `field` / `text` / `border` / `radius` from `@momlee/tokens` only.

**State: Default / Empty**
**STATE: `Default / Empty`** — country not chosen, phone empty, before any input.
**Display:** Country shows placeholder `יש לבחור מדינה`; prefix + number show `(000)` / `(000) 0000 000`.
**Behavior:** Inputs enabled. No value entered yet.
**Validation:** Not evaluated yet.
**Error:** No error message is displayed.
**CTA Behavior:** Primary CTA is `disabled`.
*This state represents the initial, untouched Phone field.*

**State: Valid**
**STATE: `Valid`** — a complete, valid IL number is entered.
**Display:** Country shows the selected country (Israel / `+972`); prefix + number show the entered value.
**Behavior:** A complete phone number has been entered. The field remains editable.
**Validation:** Passes `R1`-`R3`.
**Error:** No error message is displayed.
**CTA Behavior:** Primary CTA becomes `enabled`; tapping fires `otp_requested` and proceeds to the OTP screen.
*This state represents a complete and valid Phone field.*

**State: Error**
**STATE: `Error`** — submitted/blurred with an invalid number.
**Display:** Entered value shown; input marked invalid (`error` border token).
**Behavior:** Submit attempted but the number is not a valid IL mobile.
**Validation:** Fails `R2` (and/or `R1`).
**Error:** Inline (he-IL via `t()`): `מספר טלפון ישראלי לא תקין`.
**CTA Behavior:** Primary CTA stays `disabled` until valid.
*This state represents an invalid Phone field after the user attempted to proceed.*

### Rules of thumb
- Screen block once; a State block per state frame.
- Reference validation rules by number (`R1`…) in state blocks — don't repeat them.
- Real DB names, tokens only, RTL logical-only, strings via `t()`.
- For inputs, cover at least Default/Empty, Valid, Error (add Loading/Disabled/Sheet-open when they exist).

---

## Mom onboarding flow (first documented flow)

> Not final yet — screens and behavior may change.

Screen list, in order:

1. **Splash**
2. **Welcome**
3. **Phone** — country dropdown; supported / unsupported country; filled /
   focused states; unsupported-country error.
4. **OTP** — empty / filled.
5. **Name** — first / last focused; filled.
6. **BirthDate** — day / month / year focused; filled.
7. **BabyType** — empty; selected.

Per-screen annotation notes get appended under each screen above as they are
captured.

## Phone screen — R5 (business decision, Maor 2026-06-11)

Unsupported country selected => the inline error shows AND the phone-number
field goes to the Input **Disabled** state (the dial box stays pressable to
reopen the selector). Validation, when enabled, follows the SELECTED
country's format via libphonenumber-js (never IL-hardcoded). Enforced by
screen tests in `apps/mobile/src/app/__tests__/phone.test.tsx`.

## OTP screen — behavior decisions (Maor, 2026-06-12)

1. **Autofocus**: the screen opens with the keyboard up and the first
   (leftmost) cell already active — no extra tap.
2. **Active cell = the REAL Focused state** (2px border-brand-alt, no ring)
   — Maor fixed the set (xs variant, 2026-06-12) and REVERSED the earlier
   'render as Filled' interim call. Focused ≠ Filled: darker border + digit.
3. **Visible last digit**: auto-submit waits ~450ms after the 6th digit so
   the user SEES it land before the screen advances (Maor, 2026-06-12).
4. **Auto-fill & auto-advance**: the moment the 6-digit code completes —
   typed OR SMS-autofilled (`textContentType="oneTimeCode"` iOS QuickType,
   `autoComplete="sms-otp"` Android) — verification runs and the user
   advances automatically. Zero taps after the SMS arrives (iOS QuickType
   requires its one suggestion tap — an OS limit). Verify end-to-end when
   Twilio Verify + Supabase Phone Auth go live.

