---
name: momlee-data-inventory
description: Use whenever MomLee code starts collecting, storing, or transmitting a NEW kind of user data — a new table/column with user data, a new third-party SDK, a new device permission, a new analytics event, or a new data flow to a vendor. Also use when asked about privacy policy, App Privacy labels, or "what do we collect". Enforces Apple-approvable data practices and keeps the living data inventory (knowledge/data-inventory.md) accurate so the privacy policy and store privacy labels can be distilled quickly at submission time.
---

# MomLee Data Inventory — document collection AS you build it

Apple requires declaring **every** data type collected (App Privacy labels), and
Google requires the same (Data Safety). A mismatch between the labels, the
privacy policy, and what the app actually does = **rejection or worse**. The
cheap way to get this right is to record every data point **in the same change
that introduces it** — that is this skill's job.

## The rule (non-negotiable)

A change that adds **any** new collection/storage/transmission of user data is
**incomplete** until `../../knowledge/data-inventory.md` has a matching row.
This includes:

- a new **table or column** holding user data (incl. derived/computed data),
- a new **third-party SDK or vendor** receiving any user data (analytics,
  crash reporting, maps, payments, KYC, push),
- a new **device permission** (camera, photos, location, notifications, mic),
- a new **analytics event** whose payload contains user data,
- a new **server log** retaining user data beyond transient processing.

For each, record: data point · Apple category · purpose · where stored · linked
to identity? · tracking? (must be **No**) · shared with · retention/deletion.

## Build in a way Apple will approve (design-time rules)

1. **Minimum collection.** If a feature works without a data point — don't
   collect it. If a coarse version suffices (city vs precise location, derived
   stage vs raw birth date) — collect the coarse one. Apple reviewers and the
   labels both reward this.
2. **No tracking. Ever (without Maor).** Nothing crosses apps/sites for
   advertising; no advertising identifiers; no fingerprinting. If a vendor SDK
   does tracking by default — disable it or don't add the SDK. Anything that
   would require the ATT prompt needs Maor's explicit approval first.
3. **Every permission has an honest, specific usage string** (Hebrew + English)
   describing the real reason, written when the permission is added — not at
   submission. Request permissions **in context** (when the feature is used),
   never all at once on launch.
4. **Vendors hold their own sensitive data.** KYC documents stay with
   Persona/Stripe Identity; card data stays with Stripe. We store results and
   references, never the raw sensitive artifacts.
5. **Children-related data is the most sensitive thing we hold.** Any new use
   of it gets a row here AND a check against `../../knowledge/privacy.md`.
6. **Deletable by design.** Every collected data point must be erasable by the
   mandatory account-deletion flow. If you add data, ask: "does deletion cover
   this?" If not, fix that in the same change.
7. **New SDK = privacy review.** Before adding any SDK, check what it collects
   (its privacy manifest / docs), add its rows to the inventory, and confirm it
   doesn't violate rules 1-2. Apple now requires third-party SDK privacy
   manifests — prefer SDKs that ship one.

## Where things live

- **The registry:** `../../knowledge/data-inventory.md` — table format mapping
  1:1 to Apple's questionnaire. Update it via the plugin repo (commit + push).
- **Notion mirror (optional):** Momlee OS → Trust & Safety → **Data Inventory**
  database — keep in sync when the Notion MCP is available (see
  `momlee-worklog` for the sync pattern).
- **At submission:** `momlee-store-release` distills this file into the App
  Privacy answers, the Data Safety form, and the privacy-policy draft.

## When asked to draft the privacy policy

Generate it FROM the inventory: what we collect (by category), why, who we
share with (Twilio, Resend, Expo Push, Mapbox, Stripe, Persona/Stripe
Identity, Supabase as processor), retention, deletion (in-app account
deletion), children-data handling, contact. Hebrew primary, English secondary.
Flag any inventory row marked TBD as a blocker for finalizing the policy.
