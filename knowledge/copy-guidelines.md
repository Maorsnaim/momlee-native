> Canonical, Maor-maintained. Edit here; the skills reference this. Flows to Sivan via git.

# Copy & Microcopy — source of truth

**The law: you do not invent user-facing text.** Especially in Hebrew, RTL,
and the sensitive areas — moms, children, privacy, permissions, OTP, payments.
**No new user-facing copy without checking the existing conventions below;**
missing copy = ask Maor (**momlee-prompt-guard**), never improvise.

## Source order

1. **Figma** — the screen's text is copied word-for-word (fidelity rule).
2. **Existing i18n keys** — reuse the established phrasing for the same concept.
3. **This file's conventions** — for copy that must be written (e.g. error
   messages for states that have no Figma design yet) → draft per the rules
   below and mark `PROPOSED — needs Maor's approval`.

## Conventions

- **Hebrew (he) primary**, RTL; English secondary later. All copy via
  `t('namespace.context.key')` — never a literal in a component (**momlee-rtl**).
- **Feminine second person.** The product speaks to moms: "נסי שוב", "בחרי",
  "הוסיפי" — never masculine or neutral-awkward phrasing.
- **Warm, concise, no blame, no jargon.** ❌ "שגיאה 500" / "Something went
  wrong" ✅ "הקוד לא נשלח. נסי שוב בעוד רגע."
- **Errors = what happened + what to do now** (the Error Standard in
  **momlee-resilience**). Every error message is specific and actionable.
- **Terms from the glossary's product column** (`glossary.md`): אמא, מפגש,
  בעל/ת מקצוע — a mom never sees code terms like "parent" or "provider".
- **Numbers, dates, currency** via `Intl` (he-IL, ₪) — never hand-formatted.
- **Sensitive areas need Maor's explicit approval** before shipping: anything
  about children, privacy/consent, permissions purpose strings, identity
  verification, payments, account deletion.

## Permission purpose strings

Every device-permission request ships with an honest, specific Hebrew string
written when the permission is added (see momlee-privacy / data-inventory) —
e.g. location: why discovery needs it, in one warm sentence. Generic strings
get App Store rejections AND erode moms' trust.

## This file grows

As copy decisions are made, they land here (tone examples, glossary of
recurring phrases, OTP/auth flows wording). Conflict order: Figma wins → this
file → ask Maor.
