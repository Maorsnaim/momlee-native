---
name: momlee-migration
description: Use BEFORE any MomLee database change — creating/altering/dropping a table, column, index, enum, view, function, or trigger; adding or changing an RLS policy; touching a storage bucket; or writing an Edge Function that changes schema. Enforces the Migration Gate: every DB change ships as a migration file with a rollback plan, declared RLS impact, affected tables, and affected APIs — proven in a printed block before any SQL is written. Trigger on any CREATE/ALTER/DROP, "add a column/table", RLS policy work, or schema-touching request.
---

# MomLee Migration Discipline — the Migration Gate

> MomLee's DB holds identity, phone, location, and children-related data. A
> sloppy migration is not tech debt — it is a **privacy incident**. No schema
> change exists without passing this gate. No exceptions, no "tiny column".

## The Gate — print this block BEFORE writing any SQL

```
MIGRATION GATE: <short name>
- Migration file:   supabase/migrations/<timestamp>_<name>.sql
- Rollback plan:    <inverse SQL / restore steps; data-loss risk: none | possible | DESTRUCTIVE>
- RLS impact:       <per table: policies added/changed/dropped; default-deny preserved?
                     block/report enforcement intact? private PII still unexposed?>
- Affected tables:  <exact DB names per ../../knowledge/data-model.md>
- Affected APIs:    <@momlee/supabase repositories/queries, RPCs, views, Edge Functions,
                     realtime subscriptions, storage policies that read these tables>
- Retention:        <what happens to this data on account deletion (cascade /
                     anonymize / retain-with-basis); soft-delete + purge window —
                     no new data without an exit plan (momlee-privacy)>
```

All six fields are mandatory. "RLS impact: none" must be argued (why none?),
not asserted. No gate block = the change is invalid, even if the SQL is correct.

## Pre-flight (before writing the migration)

1. **Regenerate types against the live DB first** — `packages/supabase/src/database.types.ts`
   has gone stale before; never write a migration against an assumed schema.
2. **Exact DB names only** from `../../knowledge/data-model.md` (section B is
   ground truth). Never rename existing DB objects (`provider`/`parent` naming
   stays — glossary rule). Unknown name = **momlee-prompt-guard**: look it up
   or ask, never guess.

## Rules (each one is a hard stop)

1. **Migration files only.** Schema changes live in `supabase/migrations/` —
   never ad-hoc SQL in the dashboard, never "I'll write the file later".
2. **RLS ships WITH the table.** Every new table gets `enable row level
   security` + default-deny + its explicit policies **in the same migration**.
   A table that exists for even one deploy without RLS is a hole.
3. **Rollback is written before applying, not after breaking.** For
   DESTRUCTIVE changes (DROP, type narrowing, data rewrite): a backup step in
   the plan + **Maor's explicit approval** before anything runs.
4. **The live DB is Maor-coordinated only.** Writing the migration file is the
   task; applying to production happens only with Maor (see
   `../../planning/open-tasks.md` — pending live migrations are tracked there).
5. **Code merge ≠ live protection.** A migration in the repo protects nothing
   until applied; deleted Edge Functions stay callable until undeployed
   (deploy-gating rule, `../../knowledge/security.md`). Keep the deploy
   checklist separate from the merge.

## After the migration (same change, not a follow-up)

- Regenerate `database.types.ts` and commit it.
- Update `../../knowledge/data-model.md` (section B) to match.
- New user-data column/table? A row in the data inventory — **momlee-data-inventory**.
- RLS/permissions semantics changed? Re-check **momlee-security** rules 4-6 and
  **momlee-privacy** (block/report, PII exposure).
- Log it — **momlee-worklog**, `Type: Schema`, include the migration filename.

## Rationalizations — all mean STOP

| Excuse | Reality |
|---|---|
| "It's just one nullable column" | One column of user data without an inventory row and RLS thought = a label mismatch at App Review or a leak. |
| "I'll add RLS in a follow-up" | The follow-up window is the hole. Same migration. |
| "Rollback is obvious, I'll skip writing it" | Obvious rollbacks get written in 1 minute. Non-obvious ones are exactly the ones you'll need. |
| "Dashboard SQL is faster for this" | Untracked schema = the next migration breaks on drift. Files only. |
| "Types regen can wait" | Stale types already caused a real incident here. Regen first and last. |
