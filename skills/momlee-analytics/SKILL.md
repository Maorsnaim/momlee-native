---
name: momlee-analytics
description: Use whenever you plan, build, or finish ANY MomLee feature, screen, or flow — and whenever wiring a CTA, funnel step, or user action. Enforces the Analytics Gate: before building, every feature answers which events are measured, how we will see it working, and what its success KPI is; before "done", the events are verified to actually land. First-party analytics only (own Supabase events table, no third-party SDK). Trigger on any new feature/screen work, "how do we measure", funnel or KPI questions, or a feature about to ship without instrumentation.
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

1. **First-party only.** Events go to our own Supabase events table(s) — never
   add an analytics SDK (that's a Maor decision + `../../knowledge/data-inventory.md`
   first). Full decision + naming conventions: `../../knowledge/analytics.md`.
2. **Event specs come from official sources** — the Figma annotation `Events`
   section, `../../knowledge/analytics.md`, or Maor. A feature with **no event
   spec**: propose events to Maor in the gate block marked `PROPOSED — needs
   approval`, and ask. Never silently invent, never silently skip
   (**momlee-prompt-guard**).
3. **Naming is binding:** `object_action`, `snake_case`, past tense
   (`meetup_joined`, `otp_requested`); payload keys `snake_case` with
   entity-named ids (`meetup_id`, never `id`).
4. **Payload privacy:** no PII beyond `user_id`/`anon_id`. An event carrying
   user data = a **momlee-data-inventory** row in the same change. Event
   writes flow through the layers like any data (**Architecture Gate** — the
   service layer is where analytics calls live, not the screen).
5. **KPI unknown? Ask.** If you can't name the KPI the feature moves, that's a
   question for Maor — not a blank to leave or a number to invent.

## Before "done" — verify, don't assume

- Run the flow in dev and **query the events table**: every event in the gate
  block actually landed, with the expected payload.
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
| "A quick PostHog/Amplitude would be easier" | First-party only is a locked decision. Maor + data-inventory first. |
