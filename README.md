# momlee-guide — MomLee development plugin

## What it is

`momlee-guide` is a **shared Claude Code plugin** that acts as the development
"contract" and communication layer between two people:

- **Maor** — defines the rules, the design system, the project knowledge, and
  the roadmap.
- **Sivan** — builds the app against that contract.

The **current focus is the native app**, shipping in this order: **iOS first,
then Android, then Web**. The stack is **Expo / React Native / NativeWind /
Tailwind / Supabase**. The web app that was built earlier is **shelved** — it is
not the active target.

## Critical: this is a separate repo

This plugin lives in a **separate repo from the live MomLee code repo.** It
**never auto-writes into the code repo.** Everything here flows to Sivan as
**context** — skills, knowledge, design-system snapshots, and planning — and it
moves **via git only.** No assistant, on either side, pushes anything
automatically. Maor commits and pushes deliberately; Sivan pulls deliberately.

## Prerequisites (Sivan)

Before this plugin is useful, Sivan needs:

- **Figma MCP connected**, with the **Figma skills available** (e.g.
  `figma-use`).
- An **Expo / React Native** project to build into. Native work happens on the
  **`momlee-native`** branch of the app repo.
- Accounts: an **Apple Developer account**, an **Expo (EAS) account**, and a
  **Google Play Developer account**.

> **Sivan develops without a Mac** — iOS builds/submits run in the Expo EAS
> cloud (`eas build/submit -p ios`); test via Expo Go (web + Android emulator +
> real iPhone). Stay in the managed workflow (no `expo prebuild`). See
> `knowledge/dev-environment.md`.

## Install (Sivan, once)

```
/plugin marketplace add Maorsnaim/momlee-guide
/plugin install momlee-guide@momlee
```

(`momlee-guide` is the plugin name; `momlee` is the marketplace name.)

## Update flow

1. **Maor** edits this repo (skills / knowledge / design-system / planning).
2. **Maor** commits & pushes.
3. **Sivan** runs:
   ```
   /plugin marketplace update momlee
   /plugin install momlee-guide@momlee
   ```

Nothing is pushed automatically by anyone's assistant — every step is a
deliberate human action.

## Layout index

Directories:

- **`skills/`** — 14 skills. The enforcement / trigger layer (incl.
  `momlee-worklog` — logs completed work to the Notion Dev Changelog and
  carries Sivan→Maor tasks — and `momlee-prompt-guard` — never invent what
  isn't in an official source; missing component/token/spec = STOP and ask).
- **`commands/`** — `momlee-screen`, `momlee-sync-tokens`.
- **`design-system/`** — live snapshot: `tokens`, `annotations`, `components`,
  `figma`, `CHANGELOG`.
- **`knowledge/`** — canonical project facts Maor maintains: `stack`,
  `architecture`, `integrations`, `security`, `privacy`, `conventions`,
  `data-model`, `modules-roles`, `dev-environment`, `data-inventory` (living
  registry of every data point we collect — feeds the privacy policy + store
  privacy labels).
- **`planning/`** — `roadmap`, `features`, `open-tasks` (live status + pending
  actions — **read it on every plugin update**), `from-sivan` (Sivan→Maor
  tasks/updates channel).

## How the channels work

**`design-system/` + `knowledge/` + `planning/`** are the **Maor-maintained
context** that flows to Sivan — the living design system snapshot, the canonical
project facts, and the roadmap. **`skills/`** are the **thin enforcement layer**:
they enforce that context and reference it by **relative path**, so the rules and
the knowledge stay in one place and the skills just point at them.
