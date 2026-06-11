---
name: momlee-prompt-guard
description: Use the moment ANY information needed for a MomLee task is not found in the official sources — a component missing from the Figma design system, a token that doesn't exist, an unspecified behavior/state/validation/copy, an unknown DB name or flow — and BEFORE filling any gap with a "reasonable" assumption. Official sources are Figma, annotations, design-system/, knowledge/, planning/, and explicit instructions from Maor or Sivan. If it's not there, the answer is STOP and ask — never invent. Trigger on any "not found in Figma / the docs" moment, any urge to scaffold a placeholder, and any guess about design, logic, data, or copy.
---

# AI Prompt Guard — if it's not in a source, it does not exist

> **The Iron Law: information that is not in an official source does not exist
> for you. You never invent — you ask.** Even when the invention seems
> obviously right. "Plausible" is not a source.

## Official sources (the ONLY places truth comes from)

1. **The Figma file** — nodes, components, variants, variables/tokens, annotations (`get_design_context` / `get_metadata`).
2. **`../../design-system/`** — tokens, annotations format + notes, components, figma map, CHANGELOG.
3. **`../../knowledge/`** — stack, architecture, security, privacy, data-model, conventions, integrations, modules-roles, dev-environment, data-inventory.
4. **`../../planning/`** — roadmap, features, open-tasks, from-sivan.
5. **Explicit instructions from Maor or Sivan** in the current conversation.

Nothing else qualifies. Not your training data, not "common patterns", not
another app's UX, not "what most apps do".

## The protocol when something is missing

1. **Search first.** Before declaring a gap, actually look: the Figma node (and
   its annotations), then design-system, knowledge, planning. "I don't know"
   without searching is as forbidden as inventing.
2. **Found? Use it.** Cite where it came from.
3. **Not found? STOP.** Do not build that part. Say, explicitly:
   - what is missing (the exact component / token / rule / copy / data name),
   - where you searched,
   - that **until Maor designs/decides it, this part cannot be developed**.
4. **Build the rest.** Everything that IS specified gets built; the gap becomes
   a clearly-marked blocker, never a guess. Log the blocker for Maor via
   **momlee-worklog** (Notion task or `../../planning/from-sivan.md`).

## The canonical example

You're asked to build a screen. In Figma you find `Input` and `Button` — but
the design needs a time picker and **there is no Time Picker component** in the
design system.

- ❌ Forbidden: inventing `<CustomTimePicker />`, styling a "temporary" one,
  pulling a community picker "for now", or building a placeholder "to unblock".
- ✅ Required: "The design system has no Time Picker component. Until Maor
  designs it, this part can't be developed. I built the rest of the screen;
  the time field is logged as a blocker for Maor."

## This covers EVERYTHING, not just components

| Gap | Forbidden invention |
|---|---|
| Missing component | A made-up component, placeholder, or community stand-in |
| Missing token | A "close enough" hex/px value (also banned by **momlee-design-system**) |
| Unspecified state/validation/edge case | Behavior you find "logical" — annotations are the spec |
| Missing copy / microtext | Text you wrote yourself (he or en) — check `../../knowledge/copy-guidelines.md`, then ask |
| Unknown table/column name | A guessed DB name — use `../../knowledge/data-model.md` only |
| Unspecified flow ("what happens after the CTA?") | An invented navigation target |

## Rationalizations — all of them mean STOP and ask

| Excuse | Reality |
|---|---|
| "It's obviously a standard time picker" | Obvious to you is not designed by Maor. Ask. |
| "I'll build a placeholder and mark TODO" | A placeholder ships. Gaps become blockers, not code. |
| "Figma probably just doesn't show it yet" | Then it doesn't exist yet. Ask. |
| "Asking will slow us down" | A rework after Maor designs the real one is slower. |
| "I'll copy how the web app / another app did it" | Not an official source. |
| "It's just one small value" | One invented value breaks the contract. Tokens only, sources only. |

## Self-check before writing any artifact

Before any component, value, string, rule, or name lands in code, answer:
**"Which official source did this come from?"** If you cannot point at a Figma
node, a plugin doc, or an explicit instruction — you are inventing. STOP.
