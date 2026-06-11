---
name: momlee-resilience
description: Use whenever a MomLee screen fetches data, performs an async or critical action (OTP, create meetup, send message, image upload, location), handles ANY failure, or shows a loading/empty/error state — and whenever writing error copy. Enforces the Error Handling Standard (user-facing Hebrew message + developer log + analytics event when relevant + recovery action — never a generic "Something went wrong"), the four mandatory screen states (Loading/Empty/Error/Success via the shared pattern, never invented per screen), and defined offline/network-failure behavior for every critical action. Trigger on any data screen, async flow, try/catch, error message, or flaky-network concern.
---

# MomLee Resilience — errors, states, offline

> A flow is not "working" because the happy path works. It works when failure
> is specific, recoverable, logged, and the user's input survives it.

## 1. Error Handling Standard (every error, no exceptions)

Every error path declares all four — print the block when designing the flow:

```
ERROR STANDARD: <flow/action>
- User message: <Hebrew, specific + actionable, via t() — per copy-guidelines>
- Dev log:      <structured, no PII — what failed, where, context ids>
- Analytics:    <taxonomy event if relevant — or "not relevant because ...">
- Recovery:     <retry / fallback / guidance — or why none exists>
```

- **Never generic.** ❌ `Something went wrong` ✅ `הקוד לא נשלח. נסי שוב בעוד רגע.`
  The message says what happened AND what to do now.
- Copy comes from `../../knowledge/copy-guidelines.md` / Figma — missing error
  copy = ask Maor (**momlee-prompt-guard**), never invent.
- Logs are for developers: structured, searchable, **no PII** (subject ids only
  — see **momlee-privacy** audit-logging rule).
- Analytics error events follow the taxonomy (**momlee-analytics**) — e.g.
  `otp_failed`, not free-form strings. "If relevant" must be argued.
- "Recovery: none" must be argued too — most failures have at least retry.

## 2. The four states — every screen that fetches data

**Loading · Empty · Error · Success.** All four, always — and through the
**existing shared pattern/components**, never a per-screen invention (the
Component Reuse Audit applies; one pattern component in the shared UI layer).

- Empty and Error are DESIGNED states: their visuals come from Figma. If the
  Figma node has no Empty/Error design — that part is **blocked until Maor
  designs it** (**momlee-prompt-guard**): build Loading+Success, flag the gap.
- TanStack Query gives you the three flags (`isPending` / `isError` / data
  emptiness) — derive states from it, don't hand-roll loading booleans.

## 3. Offline / network failure — every critical action

Critical actions — **OTP, create meetup, send message, image upload,
location** (and anything money/identity) — define their failure behavior
BEFORE the feature is "done":

- **What the user sees** — the Error Standard above (offline gets its own
  message: "אין חיבור לאינטרנט..." style, per copy-guidelines).
- **User input is NEVER lost** — a failed submit preserves the typed
  form/message; retry resubmits it.
- **Retry policy:** reads — TanStack Query retry/backoff defaults; writes —
  explicit user-triggered retry only (NO blind auto-retry on mutations: a
  double meetup or double message is worse than a failed one).
- **Consistent state** — a half-failed action never leaves the UI pretending
  it succeeded.
- **Verification:** airplane-mode test on the critical flows before declaring
  them done — toggle mid-action, confirm message + preserved input + retry.

## Rationalizations — all mean STOP

| Excuse | Reality |
|---|---|
| "I'll show a generic error for now" | "For now" ships. Specific + actionable, or ask for the copy. |
| "This screen always has data, no Empty state needed" | New users, filters, and deletions create empty. All four states. |
| "Auto-retry the mutation, it's smoother" | A double-send is a worse bug than a failure. User-triggered retry for writes. |
| "Offline is an edge case" | It's a mobile app for moms on the move. Offline is a state, not an edge. |
| "I'll log to console, that's the dev log" | console.log disappears. Structured log per the standard. |
