> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.
> Distilled from Maor's full analytics docs (EVENT_TRACKING_PLAN / PRODUCT_ANALYTICS_STRATEGY — Maor-side); ask Maor when a feature has no event spec.

# Analytics — first-party measurement

## The decision (2026-06-10, see `integrations.md`)

**First-party only.** Product events are written to our own Supabase events
table(s) — no third-party analytics SDK, nothing leaves our infrastructure, no
tracking, no ATT. Changing this = Maor's decision + a `data-inventory.md`
update first.

## Naming conventions (binding)

- **Event name:** `object_action`, `snake_case`, **past-tense verb** — object
  first so events group naturally: `meetup_joined`, `otp_requested`,
  `professional_phone_clicked`, `onboarding_step_viewed`.
- **Payload keys:** `snake_case`. IDs always carry their entity name —
  `meetup_id`, `provider_id`, `child_id`. Never a generic `id`.
- **No PII in payloads** beyond `user_id` / `anon_id` (pre-auth funnel uses
  device-generated `anon_id` — see the `onboarding_events` schema in
  `integrations.md`). A payload with user data = a `data-inventory.md` check.

## Where event specs live

Per-screen events are documented in the **Figma annotations** (`Events`
section of the screen block — see `../design-system/annotations.md`). The
master taxonomy is Maor-maintained. **A feature with no event spec gets one
from Maor — never silently invented, never silently skipped** (the Analytics
Gate in `../skills/momlee-analytics/SKILL.md` forces the question).

## North Star + KPI tie-in

- **North Star: Weekly Successful Meetup Attendance (WSMA)** — meetups with
  **≥2 participants marked `attended`** (locked decision D5).
- **Until the attendance lifecycle exists**, the explicit **proxy is Weekly
  Meetup Joins** (derivable from join rows). Always flag it as a proxy —
  joining ≠ attending.
- Every feature's success KPI should trace to this loop: activation
  (onboard → join → attend), retention (repeat attendance), marketplace and
  revenue (pro meetups that get attended).

## Verification habit

An event that was never seen landing is not instrumented. After wiring events,
verify rows actually appear (dev session → query the events table) before
declaring the feature done.
