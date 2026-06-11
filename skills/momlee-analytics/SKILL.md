---
name: momlee-analytics
description: Use whenever you plan, build, or finish ANY MomLee feature, screen, or flow — and whenever wiring a CTA, funnel step, user action, or anything analytics/PostHog related. Enforces the Analytics Gate: before building, every feature answers which events are measured, how we will see it working, and what its success KPI is; before "done", the events are verified to actually land. Analytics go ONLY through the @momlee/core/analytics wrapper (PostHog behind it) — never an SDK import in a screen/component — with a stable event taxonomy and PII-free payloads. Trigger on any new feature/screen work, "how do we measure", funnel or KPI questions, or a feature about to ship without instrumentation.
---

# MomLee Analytics Discipline — the Analytics Gate

> **A feature you can't measure is a feature you can't manage.** Every feature
> answers three questions BEFORE it's built, and proves one thing before it's
> "done". Shipping unmeasured is shipping blind — it's a gate, not a nice-to-have.

## The Gate — print this block when PLANNING the feature

```
ANALYTICS GATE: <feature/screen>
- Events:       <object_action names + trigger moment + payload keys
                 (snake_case, past-tense, entity_id keys, no PII beyond user_id/anon_id)>
- Verification: <how we will SEE it working — which table the rows land in,
                 the query/funnel that proves the flow end-to-end>
- Success KPI:  <the metric this feature moves + how it traces to the
                 North Star (WSMA — meetups with >=2 attended; proxy: weekly joins)>
```

All three fields are mandatory at plan time. "No events needed" must be argued
(why is this feature exempt from measurement?), not asserted.

## Rules

1. **One abstraction layer — the wrapper.** Every event goes through
   `analytics.track(...)` from **`@momlee/core/analytics`** (PostHog behind it,
   `providers/posthog.provider.ts` is the ONLY file importing the SDK).
   **Never call PostHog, Mixpanel, Firebase, or any analytics SDK directly
   from screens or components** — or from hooks/services. Adding/changing a
   provider = Maor's decision + `../../knowledge/data-inventory.md` first.
   Full decision + wrapper structure: `../../knowledge/analytics.md`.
2. **The taxonomy is stable — it outlives the tool.** Event names + properties
   are the durable contract; keep them fixed and the tool can be swapped
   without breaking historical data. Use the seed taxonomy in
   `../../knowledge/analytics.md` (`onboarding_started` … `provider_contact_clicked`);
   renaming a shipped event = Maor's decision. New events extend the taxonomy
   table in the same change.
3. **Event specs come from official sources** — the taxonomy in
   `../../knowledge/analytics.md`, the Figma annotation `Events` section, or
   Maor. A feature with **no event spec**: propose events in the gate block
   marked `PROPOSED — needs approval`, and ask. Never silently invent, never
   silently skip (**momlee-prompt-guard**).
4. **Naming is binding:** `object_action`, `snake_case`, past tense
   (`meetup_joined`, `otp_requested`); payload keys `snake_case` with
   entity-named ids (`meetup_id`, never `id`). Type them in
   `analytics.types.ts` so a typo can't create a rogue event.
5. **Payload privacy — nothing sensitive, ever:** no phone, full name, child
   name, exact birth date, address, or message content. Coarse buckets only:
   `baby_age_range: "0-3_months"` ✅, `baby_birth_date: "2026-01-14"` ❌.
   Identity = `user_id`/`anon_id` only. An event carrying user data = a
   **momlee-data-inventory** row in the same change. Analytics calls live in
   the **service layer** (**Architecture Gate**), not the screen.
6. **KPI unknown? Ask.** If you can't name the KPI the feature moves, that's a
   question for Maor — not a blank to leave or a number to invent.

## Before "done" — verify, don't assume

- Run the flow in dev and **watch the events land** (PostHog live events, or
  the wrapper's console log in fail-soft mode): every event in the gate block
  arrived, with the expected payload.
- The verification query/funnel from the gate block runs and shows the flow.
- An event that was never seen landing is not instrumented — the feature is
  not done.

## Rationalizations — all mean the gate is not passed

| Excuse | Reality |
|---|---|
| "It's a small UI feature, nothing to measure" | Argue the exemption in the gate block. Most "nothing to measure" features have at least a viewed/completed pair. |
| "I'll add events after it ships" | Post-hoc events miss the launch baseline — the one measurement you can never recover. |
| "I logged it, it probably works" | Probably = blind. Query the table. |
| "I'll pick a reasonable KPI myself" | KPIs are product decisions. Ask Maor. |
| "Calling posthog.capture() directly is faster" | The wrapper IS the contract. Direct SDK calls = vendor lock-in in every screen. |
| "I'll rename this event to something nicer" | Renames break historical data. The taxonomy is stable; ask Maor. |
