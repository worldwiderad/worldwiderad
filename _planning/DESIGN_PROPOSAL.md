# Design direction for worldwiderad.com

For Radek to react to before anything is built. The mockup of the first screen is `_planning/mockup/first-screen.html`, with screenshots at 360 px and 1440 px. It uses real content; anything marked CONFIRM in the brief is either left out or given its default.

## The idea in one paragraph

The site should read like one of Radek's essays, not like a portfolio. It is set in the typeface he chose for his essays, black on white, as a single column of plain first-person entries of different lengths, each giving what the work is, the number behind it, where the evidence is, and whether it is finished. Only one element on the page is visually bold. For now that is a figure made from his own data, the per-task results table from *Should we be polite to ChatGPT?*, set beside the essay it comes from. If Radek sends a page of his score, that takes the top of the right-hand column instead. Nothing on the page is there for decoration.

## Where each decision comes from

| Decision | Taken from | Why not the usual choice |
|---|---|---|
| **Petrona** for everything, one family | Both John Locke essays are set in Petrona (I read the PDFs' font tables) | Readers move from the homepage into the PDFs without a change of voice. Petrona is not on any list of AI-default or "tasteful default" faces (Inter, Geist, Space Grotesk, Instrument Serif, Fraunces, Playfair). Running text keeps Petrona's default figures, as the PDFs do; the table uses its tabular figures so the numbers line up |
| **Black `#000` on white `#fff`**, grey `#555` only for the location line and the set-aside row, no accent colour | The essays, the result tables and an orchestral score are all black on white. The page also prints as it looks | Avoids cream/terracotta (P1), near-black with an acid accent (P2), tinted `#111` (P5) and every gradient (V1–V3). Pure black is a stated choice (V8) |
| **One real figure** in place of decoration | Figure 3 of the politeness essay, transcribed exactly: 25 tasks, leads +10 to −8, with the task set aside drawn as a hollow bar. It sits beside the essay entry, not at the top of the page | His data, showing the essay's actual finding (the effect reverses by task type), captioned in the essay's own terms: the groups were assigned after the results. A chart made to decorate would be V21; this one is the evidence itself |
| **Status written into the prose**, only where there is a real state or date ("A pilot has run. The design is now under review", "Results are announced on 3 October", "It's still a prototype") | The essays qualify every claim ("an illustrative pilot, not a confirmatory test") | The brief requires unfinished work to be labelled unfinished. A sentence does it without pills, badges or dots (L2, M7). The first mockup had a grey status line under every entry, and both fresh reviewers named that identical shape as the strongest tell, so entries now vary in shape and length |
| **Evidence linked from the words themselves** ("what would happen to criminal sentencing if judges and legislators accepted determinism (PDF)") | The brief: every entry links to its evidence | No "View project →" buttons, no arrows (P5), no icons. Link text says where it goes |
| **No labels, rules or numbering** | Nothing in the content is a sequence. The field is obvious from each entry | These are exactly the "broadsheet" and "template chrome" defaults (P3, P5, P7, P8) |
| **Asymmetric grid on desktop**: a text column set in from the left, with a narrower column to its right for contact details and for artefacts placed beside the entry they belong to | A figure placed beside the text it refers to, as on an essay page | Not a centred hero (L1), not a centred single column (L10). Below 1080 px it becomes one column and the figure follows the entries |
| **No motion.** Links thicken their underline on hover; visited links get a grey underline | Nothing on a document needs to move | M1–M10 cannot occur. Reduced motion is respected trivially. The visited state helps anyone checking evidence see which PDFs they have already opened |
| **No JavaScript needed to read anything** | – | SoundCloud players load only when the reader clicks. Without JS the same control is a plain link to SoundCloud (K12, M2) |

## The rough homepage structure

```
DESKTOP (≥1080 px)                           PHONE (360 px)

Radek Green                   CV GitHub SoundCloud   Radek Green
I'm an IB Diploma student …                          I'm an IB Diploma student …
                              ┌ score page, if ┐     CV  GitHub  SoundCloud
Modelling the Other           │ Radek sends one│     Modelling the Other
The question, June 2026.      └────────────────┘     … (the longest entry)
Pilot run; blind review of                           Essays for the John Locke …
the design, then TMLR.        ┌ figure: lead  ┐      <- first screen ends
                              │ by task, +10  │      Orchestral music
Essays for the John Locke …   │ … −8          │      gvhackathon.com   <- second screen ends
"irrationality is also a      └───────────────┘      CIS-MAP (the shortest)
safeguard." 43 raters.                               figure
Orchestral music (longer, with instrumentation)
gvhackathon.com
CIS-MAP (two lines)
```

Below the first screen, still on the homepage (depth for anyone who scrolls, and none of it hidden in accordions):

1. **Modelling the Other** in full: the question as first posed in June 2026; the two builds; the review method (rounds of blind adversarial review by up to 21 model instances, every claimed flaw checked by simulation); what is built (collection harness with spend limits, dual-judge labelling, prediction runner, analysis). Status and dates. Pilot numbers only if you approve them.
2. **The two essays.** For each: the prompt as printed on its cover, the argument in a few sentences, and one quoted line. Law: "A court that accepts determinism can still decide who to sentence. It can no longer say by how much." (the first screen quotes "irrationality is also a safeguard" instead, because one reviewer found the symmetry of this line LLM-like even as a quotation). Politeness: the study (25 task pairs, 43 raters aged 15 to 19, 62.2% of non-tie votes, 95% CI 55.5 to 68.9%, the length check), all with the PDF's own numbers. Then the process line about the sixteen reviewers. The slot for the result sits here.
3. **Software.** gvhackathon.com (role, dates, the scheduling negotiation); CIS-MAP (the problem, how the path baker works in two sentences, status); VPS Veritas (only what you confirm); then the smaller builds as a short plain list: the security node, the synthesiser, the vocabulary app, the Claude skills.
4. **Music** as a composer's works list: title, forces, length, year, status, and a listen control for each. The 49-track piece gets its instrumentation written the way a concert programme would give it, if you send me the parts list.
5. **Competitions**: World Scholar's Cup results as a small three-row table (year, round, result); club co-lead and the 2026 delegation; the other contests.
6. **School**: IB subjects (HL and SL), AP CSP, and the VHS course.
7. **Footer**: contact, "Last updated [date]", and a one-line colophon naming the typeface.

Other pages, kept to a minimum:

- `/cv/`, a printable CV on one or two A4 pages, generated from the same entries as the homepage.
- Later, if it earns its place, `/work/modelling-the-other/` once the pre-registration exists.
- Nothing else.

## Which tells this direction was most at risk of, and what I did about each

My first draft (kept in the git history) had a black hairline rule under the header, small-caps field labels (RESEARCH, ESSAYS, …) above each title, the status set in grey italic inside the heading line, and `#171717` as the text colour. Once the research was in, I checked it against Anthropic's own list of what Claude produces by default. Four things in that draft were on the list: the broadsheet cluster (P3), labels above content (P7), one phrase of a headline set in italic (P6), and tinted near-black (P5). All four are gone. The table below covers the remaining risks.

| Tell | Why this design was exposed to it | How it avoids it now |
|---|---|---|
| **P3** broadsheet (hairline rules, zero radius, dense columns) | A serif document on white is one step from a newspaper | No rules except the figure's zero axis, which is data. One text column. Generous spacing between entries |
| **P5 / P7** eyebrow labels, all-caps labels, middle-dot meta strings, "→" | The first draft had field labels | Removed. The links are separated by space, not dots. No arrows anywhere |
| **P6** one phrase of a headline in italic | The status line started out inside the heading | Status is written into the prose, in roman type |
| **"Editorial minimalism" as the next AI default** (raised by both fresh reviewers in round 0a, not yet in the literature) | Restrained serif, monochrome, no personal visual choice | This is the risk still open. What lowers it is real material and Radek's own voice: a score page (Q8), his own sentences (Q31), perhaps a colour he chooses himself (Q30). Decoration would not help. The entries now also differ in shape, which was the reviewers' strongest point |
| **Uniform entry template** (raised by both reviewers) | Five entries of heading, paragraph and grey status line | Entries now vary in length and shape; status appears only where there is a real date |
| **P1 / P12** the Claude look, and over-correcting into the "anti-slop" look | Serif type plus restraint is what anti-slop prompts produce | White, not cream. No accent colour, grain, italic display type or terracotta. The serif is chosen because the essays use it, and the colophon line can say so |
| **V8** pure black and white without a reason | – | The reason is written down: the essays are black on white, and the page should print like them |
| **V21** decorative charts | The figure is the page's one bold element | It is the essay's published table, transcribed exactly, captioned with where it comes from and what it shows, including the task that was set aside |
| **V22** generated imagery | The existing *Bliss* and *The Journey* covers | Not used unless you decide otherwise (question 7) |
| **C1 / C2** contrastive reframes and threes | Your best essay lines use both | Site copy avoids both, and quotations are chosen from lines that do not use them (see `AI_TELLS.md`) |
| **L12** academic templates (the Jon Barron layout, al-folio) | A text-first student research site is their territory | No photo on the right, no slash-separated link row, no thumbnails, no news list with dates |
| **K10** repository fingerprints | Planning notes, the `claude/…` branch name and `Co-Authored-By: Claude` commit trailers are all visible in this public repo | Your decision (below) |

## Two decisions before the build

1. **The repository shows how the site was made.** The repo is public. This branch contains `_planning/` (including `AI_TELLS.md`), its name starts with `claude/`, and its commits end with `Co-Authored-By: Claude` and a session link, which this environment adds by default. None of that reaches worldwiderad.com itself. It is visible to anyone who opens the GitHub repo, though, and the research lists these exact things as what technical readers check. The options:
   - (a) Leave it all visible. This is honest about how the site was made.
   - (b) At deploy time, merge only the site files into `master` as one commit with a plain message, keep `_planning/` off `master`, and delete this branch once you have what you need from it.

   I'll do whichever you say. Until then I keep committing as the environment is set up to.
2. **Content storage.** I recommend `_data/*.yml` plus the Jekyll build that Pages already runs. I tested this locally with the exact `github-pages` gem. With `layout: null` on each page, the output is clean HTML with nothing injected. The alternative is plain HTML with the CV kept in sync by hand.

## What the build will not contain

- No framework, bundler, npm or build step beyond the Jekyll that Pages already runs.
- No analytics, fonts from Google, iframes that load before a click, or icons.
- No dark mode. The page is a document and prints as it looks, and adding a toggle would bring in M9.
- No photo unless you send an unposed one.
