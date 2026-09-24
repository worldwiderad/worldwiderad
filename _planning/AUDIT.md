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

A new pair of fresh reviewers looked at the revised mockup (`review1/`: the same four kinds of file, the same instructions).

- Reviewer B (Sonnet, admissions reader): **about 10%** (down from 60% in round 0a).
  - Human signals it named:
    - the plain-table chart with its one encoded exception;
    - the admitted after-the-fact grouping in the caption;
    - headings that don't match each other (a literary title, a dated event, a bare domain, an acronym);
    - "US$", the specific numbers and the real URLs;
    - no framework and no scaffolding.
  - What it still flagged:
    - the meta description, the one line written *about* the page rather than *by* its author (weak);
    - the page has no photo or first-hand visual, only a clean chart (weak);
    - every paragraph is declarative and polished, with no hedge or aside (weak).
  - Actions:
    - Meta description rewritten in the first person: "I’m Radek Green, an IB Diploma student in Singapore. This page lists what I’m working on and links to each piece of work."
    - The first-hand visual depends on Radek (the score page, Q8).
    - I have not added invented hedges or "rough edges". Deliberately planting imperfection would be a fabrication of its own, and the honest source of unevenness is Radek's own sentences (Q31).
- Reviewer A (Opus, informed reader): **45%** (down from 55%).
  - About 70% would suspect AI *edited* the copy; under 10% would take the page for a template or site-builder output. "The visuals hardly contribute."
  - What it flagged, and what I did:

| Finding | Strength | Action |
|---|---|---|
| Every blurb follows one arc (context, then a number, then who did what, then status) and four are 50–57 words long | strong | Lengths now run from 37 to 90 words. The credit is stated once. Only two entries end on a status. Music is longer and looser (it now gives the instrumentation from the brief), and CIS-MAP is short |
| An adult editor's voice with no opinion or admission | strong | Needs Radek's own words (Q31). Not faked |
| Clipped beats ("A pilot has run."); vague passive ("The design is now under review") | moderate | "I've run a pilot. Before pre-registering, I'm putting the design through rounds of blind review by up to 21 model instances…" (the method from the brief, in the active voice) |
| Fronted participle ("Told the name of a peer model, does it…") | moderate | Rewritten as a plain question |
| The quoted law line's "can still… / can no longer…" symmetry is what readers now associate with LLM prose, even as a quotation | moderate | The first screen now quotes "irrationality is also a safeguard." The "by how much" line moves to the essay section lower down |
| "sometimes with synths and never with lyrics"; "took some negotiating…" | moderate | Rewritten plainly |
| Caption over-caveats (the after-the-fact grouping plus the set-aside note) | moderate | Cut to two sentences: what a bar is, and what the hollow bar is. The grouping note belongs to the essay section |
| A location line that looks like a template field | weak–moderate | Removed from the header. It will go with the contact details lower down |
| Straight apostrophe in "Child's explanation" among curly ones | weak–moderate | Fixed |
| Header links 27px out of line with the figure column; empty block at top right | weak | Header now uses the same column grid. The top-right block is left for the score page (Q8) |
| A data figure on a homepage reads as a designed flourish; the task labels sound like LLM-generated prompts | moderate | The figure stays, beside its essay. Reviewer B scored the same figure as a *strong human* signal. Labels are the study's own |

The two reviewers disagree most about the figure and about typographic care. The informed reader reads them as signs of a model; the admissions reader reads them as signs of a careful person. Both agree on the copy. The remaining risk is the voice, and only Radek can supply that.

No round 0c was run. This is a direction mockup; the full audit loop runs on the built preview, with Radek's own sentences in place.

## Round 1: the journey page (`_planning/mockup/journey.html`), 24 September 2026

This round covered the full interactive page: the score engraved on load, the pinned score, scroll-driven stations, and the 49th staff. Two fresh reviewers saw only `review2/`: README, three screenshots per width (first screen, scrolled with the pinned bar, full page), the page text and the HTML.

| Reviewer | Framing | Probability |
|---|---|---|
| A (Opus) | informed reader | 60% |
| B (Sonnet) | admissions reader | 55% |

Both said the facts, the music and the data are clearly the owner's. B called the 49th staff "a genuinely original idea… I have not seen this move in any template portfolio". The suspicion was about packaging.

| Finding | Raised by | Action |
|---|---|---|
| Literary, first-person code comments ("The forty-ninth staff: my own two years…") | both, strong | All comments removed |
| The page explains its own design: caption how-to-read text, the Today paragraph, "The page ends where the piece does", the typeface colophon, a layout-describing meta description | A strong, B weak–moderate | All cut. The caption is now facts only; Today is a barline with a date; the meta description says who and what |
| Four parallel "The call is… The trials are…" sentences | both | Replaced by one sentence and one concrete example (Part III) |
| Stock phrasing: "the pattern that matters", "helps us, not the machine" | A, strong | Rewritten |
| The quote repeated by the sentence before it | A | Paraphrase removed; the quote stands alone |
| The header's run of short sentences ending in a verb list | B | Identity line only |
| Colons everywhere, no dashes ("scrubbed" punctuation) | A | Numeric ranges now use en dashes (15–19, 55.5–68.9%) |
| Generic `<details>` labels | both | Renamed to what they contain |
| A rigid three-column grid with an empty third column, and 55vh of dead space per station | both | Two columns unless a figure exists; min-height removed; hairlines between stations removed |
| Key signatures floating with no staff (notation vocabulary used as decoration) | A | Drawn on a real five-line staff with a Bravura treble clef; accidentals and time signatures sit on their lines |
| Part names overlapping on the phone | both | Only the numerals show on the phone |
| Playhead drawn through the caption; the tie through a label; the month ruler overprinting the years; "today" colliding | A | Caption sits above the playhead; staff labels moved above the marks; the phone ruler shows years only; the today label is hidden on the phone |
| Dead and duplicate CSS, a hard-coded position repeated, a curly apostrophe in a JS string | A | Stylesheet rewritten; `--now` set once; straight quotes in code |
| "Precious" clock wording | A | "May 2026, 6:43" |

Disputed or left as is:

- **The feature stack** (engrave-in animation, pinned score, sound on scroll, motif playback). Radek asked for this directly.
- **The polish of the visual system.** Both reviewers read the restrained serif-and-one-accent look as a 2026 AI default, while also calling the concept itself original. The part that reads as most human is the part that is Radek's own: the music, the data, the dates.

## Round 2: journey page after the round 1 fixes

| Reviewer | Framing | Probability |
|---|---|---|
| A (Opus) | informed reader | 60% (unchanged) |
| B (Sonnet) | admissions reader | 8% (from 55%) |

B: "one of the least AI-generated-looking student sites I've seen in 2026". Its remaining flags were the symmetry of the essay blockquote (Radek's own line), the meta description, and pending items that could be read as finished.

B also suggested adding a note saying the site was "built by hand". **Rejected**, because it would be false.

A's remaining case falls into three groups.

1. **Fixed now:**
   - Seven colon "reveals" rewritten.
   - Two rhythmic lists of three rewritten.
   - The caption made plainer.
   - A curly/straight apostrophe inconsistency fixed.
   - On the phone, the staff labels no longer float away from their dots. The phone now shows a dated list under the staff, with past items in grey and future ones in blue, so nothing pending looks finished.
   - The phone group labels no longer sit on white patches.
2. **Radek's decision, not fixed:**
   - "Keep one metaphor, not four": the ML part names, the life-as-a-staff with noteheads and ties, the "May 2026, 6:43" clock and the engrave-on-load animation. Radek asked for the interactivity and the ML tie-in directly.
   - Replace the drawn piano roll with a real page of engraving, plus screenshots of CIS-MAP and the survey app.
3. **Only Radek can fix this:** the voice. A: "no joke, no aside, no enthusiasm, no failure, no sentence that sounds sixteen". Inventing opinions for him would be fabrication.

A also read the seven-sharps-then-one-flat key signatures as "MIDI noise". The MIDI does change from C# to F at 8:08, so the marking is correct.

## Round 3: production pages (`/index.html` and `/cv/`), 24 September 2026

This round ran on the built site (a local GitHub Pages build served over HTTP) with two fresh reviewers. Reviewer A saw only the review pack: screenshots, text and HTML for both pages, plus the CV printed to A4. The question was the usual one. Reviewer B was a pre-launch QA check against the brief's hard requirements (accessibility, 360 px, no JS, no third-party requests, print, privacy, facts), and could drive the local site in Playwright.

| Reviewer | Framing | Result |
|---|---|---|
| A (Opus) | informed reader | 55% |
| B (Opus) | pre-launch QA | 7 should-fix, 9 nits |

Self-checks before the round: the copy check leaves only accepted flags; axe finds 0 violations on both pages at 360 and 1440; no horizontal scroll; the preserved-path script passes against the local build.

Fixed:

| Finding | Raised by | Change |
|---|---|---|
| The Locke and Modelling the Other links in the pinned bar overlap, so Locke can't be clicked | A, B | Each link covers its own lane of the mini timeline and is 16 px wide. VPS starts at its bar |
| Hidden pinned bar is still in the tab order, focused off-screen | B | `visibility: hidden` while it is out of view |
| A motif highlight can't be turned off | B | A second click turns it off and fades the clip. The highlight clears on pause. `aria-pressed` added |
| A jump from the pinned bar hides the heading under the bar | B | `scroll-margin-top` on stations |
| Labels overlap between 901 and ~1150 px | B | Phone layout up to 1150 px |
| Essay PDFs hosted in a third-party storage bucket | B | Copied byte for byte to `/static/essays/` (checked: the covers carry only the prompt) |
| Motif and "Hear the ending" buttons do nothing without JS | B | `hidden` in the HTML, shown by the script |
| Fade could pause a new playback; sound-on-scroll cut a full listen to 8 s; unhandled `play()` promise | B | Fade cleared on Listen; sound-on-scroll leaves a playing track alone; `.catch` added |
| The two Listen buttons disagreed after a pause; the error message only on one | A, B | Both say "Resume"; both show the error |
| `<img>` elements without `src` | B | Score overlays created by the script |
| Stray `.score.on` and `.station.now` code; two phone media blocks | A | Removed; one media block |
| The last station ("Next") could not reach the trigger line | found while fixing | Reaching the bottom of the page selects it |
| "from late last year to this spring" will go stale | A | Cut; the dates are in the margin |
| Blue never explained | A | The caption says blue is what hasn't happened yet |
| "its own" four times | A | Two removed |
| "writing 4part" label before its bar | A | Above it |
| CV: "2026 to 2028" beside 2025 school results; hackathon under "Software"; "15 to 19" vs "15–19"; repo and SoundCloud URLs lost in print; no OG tags | A, B | "class of 2028"; "Projects"; en dash; URLs printed; OG tags |
| Footnote 10 of the politeness essay says the medical task was left out of the 62.2%, but the figures only add up with it counted | A, B | This is in the published essay, so the numbers stay as printed. Radek asked for a short note owning it, in the Results section |

Left as is:

- **The pull quote's antithesis.** It is Radek's sentence from the essay (kept in round 2 for the same reason).
- **The even register of the prose, and the notation conceit carried through every element.** Reviewer A's 55% rests mostly on these. The voice is Radek's next step. The conceit is what he asked for.
- **Scrolling while paused moves the playhead.** Scroll drives the playhead whenever the piece isn't playing; that is the design.
- **The fixed "today".** `_planning/UPDATING.md` covers how to move it.
- **"working remotely from Toronto".** A city, not a neighbourhood, so it is within the brief. Flagged to Radek.
