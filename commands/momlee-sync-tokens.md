---
description: "Pull the latest tokens from the MomLee Figma file and update the design-system snapshot for review."
argument-hint: "[optional node-id]"
---

# Sync MomLee design tokens from Figma

Pull the current token variables from the MomLee Figma file and propose an
updated `design-system/tokens.md` snapshot for **Maor's review**. Figma is the
runtime source of truth; `tokens.md` is a maintained snapshot.

This is **Maor-facing maintenance** — do NOT write any files until Maor approves.

## Steps

1. **Read current tokens from Figma via the Figma MCP.** Use `get_design_context`
   on the key onboarding nodes (the Mom onboarding flow node `16819:38317`), or on
   the node in `$ARGUMENTS` if one is provided. The `fileKey` is in
   `design-system/figma.md` (`zDwy1JIV8htDxYluYTPbfq`). The design context output
   contains the token variable references (e.g.
   `--colors/background/bg-brand-solid: #b05f64`).
   > Note: `get_variable_defs` does **NOT** work remotely — it needs Figma Desktop
   > open with a layer selected. **Prefer `get_design_context`.**

2. **Diff** what you find against the current `design-system/tokens.md`.

3. **Propose** an updated `tokens.md` plus a new **dated** `CHANGELOG.md` entry
   describing what changed — additions, renames, and changed values.

4. **Present the diff and WAIT for Maor's approval.** Do not write anything yet.

5. **On approval**, write the updated `design-system/tokens.md` and **append** the
   dated entry to `CHANGELOG.md`. **Do not push** to any remote.
