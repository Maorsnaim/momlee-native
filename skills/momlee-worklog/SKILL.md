---
name: momlee-worklog
description: Use AFTER completing any meaningful MomLee dev task — feature, fix, schema change, security work, design implementation, infra, or decision — by Maor or Sivan. Logs the change to the Notion Dev Changelog (Momlee OS → Operations) via the Notion MCP, and handles two-way task flow: Sivan can leave tasks/updates for Maor (Notion task or the git fallback channel). Trigger on "log this", "update the changelog", "תעדכן את הנושן", task completion, or end-of-session wrap-up.
---

# MomLee Worklog — log every meaningful change

Momlee OS habit (set by Maor): **"log every important dev action/decision in the Dev Changelog as it happens."** This skill makes Claude do it automatically — for both Maor and Sivan.

## When to log

After completing a meaningful unit of work: a feature, fix, schema/RLS change, security work, a design-system change, an infra change (build/deploy/tooling), or a decision. Not every tiny edit — one row per meaningful change. If several small edits form one logical change, log them as one row.

## Closing a MILESTONE? /momlee-audit is MANDATORY first

Before logging a **milestone** as Done (a sprint, a complete flow like
onboarding, a release candidate — not an individual task), running
**`/momlee-audit`** is mandatory. The milestone is not "Done" until the audit
ran and its High-priority findings were either fixed (with Maor's approval) or
explicitly accepted by Maor. Log the audit result in the same Changelog row
(`Details`: "audit: N findings, M high — link/summary").

## Where — Notion (primary)

**Momlee OS → Operations → 📝 Dev Changelog**
- Database URL: https://app.notion.com/p/b650e7bd30e440de9b94f933150db3b4
- Data source: `collection://ee6d4bbb-1444-479c-b818-36f7e3951988`

Create one page (row) via the Notion MCP with these properties (use ONLY the allowed select values):

| Property | Type | Value |
|---|---|---|
| `Change` | title | Short, specific summary (e.g. "Downgraded Expo SDK 56→54 for Expo Go compatibility") |
| `Date` | date | Today |
| `Who` | select | `Maor` / `Sivan` / `Claude` (who did the work — ask if unclear) |
| `Type` | select | `Schema` / `Feature` / `Fix` / `Decision` / `Security` / `Design` / `Docs` / `Infra` |
| `Module` | select | `Onboarding` / `Meetups` / `Messaging` / `Verification` / `Organizations` / `Monetization` / `Trust & Safety` / `Discovery` / `Notifications` / `Platform` / `Design System` (omit if none fits) |
| `Status` | select | `Done` / `In progress` / `Planned` |
| `Details` | text | 1-3 sentences: what + why; include commit SHA / branch when relevant |
| `Link` | url | Commit/PR/doc link when available |

Keep entries in **English**, concise, and factual.

## Fallback — no Notion MCP connected

If the Notion MCP is not available in this session:
1. Append the entry to **`../../planning/from-sivan.md`** (the git channel) under "Worklog (pending Notion sync)" with the same fields, commit, and push the plugin repo.
2. Tell the user the entry is queued and will reach Notion when someone with Notion access syncs it.

## Two-way: Sivan → Maor (tasks & updates)

Sivan can (and should) leave tasks/questions/updates for Maor when something needs his side (Mac-only work, production deploys, design decisions, accounts/permissions):

- **Preferred — Notion:** add a row to the **Dev Changelog** with `Status: Planned`, `Who: Maor`-relevant wording in `Change` (e.g. "MAOR: rotate Mapbox tokens in prod"), or a task in **🏃 MVP Sprints** (https://app.notion.com/p/f3f0c45a6c2f4c868e1a64a25ae4b055, data source `collection://f874cbb4-c6a9-4211-a083-63307d0a3261` — fetch its schema before inserting).
- **Fallback — git:** add it to **`../../planning/from-sivan.md`** under "Tasks for Maor", commit, push the plugin repo (Sivan has write access). Maor reads it on his next pull.

Maor's pending actions for Sivan flow the other way in **`../../planning/open-tasks.md`** — check it on every plugin update.

## Prerequisites note

Logging to Notion requires the **Notion MCP connected** AND access to Maor's "Momlee OS" workspace (Maor shares the Operations hub with Sivan's Notion account). Until that's set up, use the git fallback — it works with zero extra access.
