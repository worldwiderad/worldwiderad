# Audit log

Each round gives fresh reviewers the screenshots (360 px and 1440 px), the page text and the HTML. The reviewers have not seen the brief, the research or the build. They are not told who or what made the page, and they may open only the files provided. The question is always the brief's: "Does this look or read as AI-generated? Point to every specific element that suggests it."

Before each round the page must also pass these self-checks:

- `python3 _planning/tools/copycheck.py <page>`, for banned words and structures;
- axe-core against WCAG 2.1 AA at both widths;
- no horizontal scroll at 360 px;
- a read-through against `AI_TELLS.md`.

## Round 0: first-screen mockup, 24 September 2026

This round covers the direction mockup only (`_planning/mockup/first-screen.html`), before the build.

Self-checks: the copy check leaves one flag, the research question in the first entry. That is the paper's actual question, and nothing on the page answers it, so it stays. axe: 0 violations at 360 and 1440. Horizontal scroll: none.

Changes made after the research, before any reviewer saw the page:

| Found in the first draft | Tell | Change |
|---|---|---|
| 1px black rule under the header | P3 broadsheet | removed |
| RESEARCH / ESSAYS / MUSIC small-caps labels above each title | P5, P7 | removed |
| Grey italic status inside the heading line | P6 | moved to its own line, in roman |
| Text colour `#171717` | P5 tinted near-black | `#000`, justified by the essays |
| "Two divisions, several judging rounds, US$3,000 in prizes" | C2 three for rhythm | "It has two divisions and US$3,000 in prizes." |
| Meta description listing four fields | C2 | rewritten |
| Figure outside `<main>`; empty table header | a11y | fixed |

### Round 0a reviewers

Two fresh reviewers (one Opus, one Sonnet) looked at the page with the rule, labels and italic status already removed.

- Reviewer A (framed as an informed reader): **55%** chance an informed 2026 reader would think the page was AI-generated.
- Reviewer B (framed as an admissions reader): **60%**.

Both said the content itself reads as real (under 5% and 25–30% chance respectively that it is invented). The suspicion was about how it was shaped.

Findings, and what I did about each. "Both" means both reviewers raised it independently, which is the strongest signal.

| Finding | Raised by | Strength | Action |
|---|---|---|---|
| All five entries have exactly the same shape: heading, paragraph, grey status fragment | both | strong | Entries now differ in shape and length. The grey status line is gone; status is written into the prose in full sentences, and only where there is a real date or state |
| Meta description reads as an LLM summary ("X is a Y. List, list, list, and list"; "with the PDFs") | both | strong (B), moderate (A) | Rewritten, shorter and plain |
| "Restrained serif editorial minimalism" is itself becoming a recognisable AI default; no personal choice in the visual identity | both | strong (B), weak–moderate (A) | Partly open. The fix that is real rather than cosmetic is a first-hand artefact in the first screen: a page of Radek's score (Q8). Asked Radek whether there is a colour he would choose himself (Q30). I did not add an accent colour on his behalf, since an invented "personal" colour is exactly what a generator would do |
| No voice: no reason for caring, no aside, an even adult register | A | moderate–strong | Added real details from the brief that carry some personality: "never with lyrics", the negotiation over the hackathon's week, why CIS-MAP exists (English-only signs), and when the question started (June 2026). The honest fix is Radek's own words (Q31), because I can't invent his motives |
| Figure caption not supported by the data: "won on interpersonal, lost on structured" (Angry Customer is −4, Diet Plan +9) | A | moderate–strong | Rewritten to follow the essay: the groups were assigned after the results, with one named example each |
| Figure took the hero position over the main research; no title | A | moderate | Figure moved beside the essay entry it belongs to, with a plain title |
| Task labels in Title Case read like an LLM's list of test tasks | A | strong | Set in sentence case. The names themselves are the study's own and stay |
| Repeated formulas: "sole author" and "sole developer"; "One asks… The other asks…"; matching "Code on GitHub." / "Recordings on SoundCloud." endings | A | moderate | All rewritten |
| ", and" joining unrelated facts ("class of 2028, and I spend summers in Toronto") | A | moderate | Toronto moved to the contact block as a location line |
| Too-perfect code: subgrid, globally old-style figures, weight 650, bar positions baked from a formula, gradient trick for the axis | both | moderate | Simplified: flex header, no subgrid, weight 600, Petrona's default figures (which match the PDFs), bars sized by one CSS custom property per row, axis as a plain border. Accessibility and semantics stay complete, because the brief requires them |
| `<ol>` with its numbering hidden; figure outside `<main>` | A | weak | Entries are now `<section>`s; the figure is inside `<main>` |
| Straight apostrophes next to typographic minus signs | A | weak | Curly apostrophes and quotes throughout, as in the essays |
| Subject matter: three of five entries about AI | A | weak | Music moved to third place, between the essays and the software |

What both reviewers named as clearly human:

- the raw Supabase essay URLs;
- the specific numbers and IB terms;
- the hollow bar for the task that was set aside;
- the untidy real data;
- the handles and repository names.

### Round 0b reviewers

(pending)
