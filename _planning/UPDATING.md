# Updating the site

Everything is plain HTML. There is no build step apart from the Jekyll run that GitHub Pages already does on every push to `master`, and that run copies `index.html`, `cv/index.html` and `static/` through unchanged. Edit, commit, push, and the site updates within a minute or two.

## Files

| Path | What it is |
|---|---|
| `index.html` | The homepage: styles, content and script in one file |
| `cv/index.html` | The printable CV |
| `static/fonts/` | Petrona and a Bravura subset (both OFL; licences alongside) |
| `static/score/` | `piece.svg` (the notes), `piece-played.svg` (the same notes in blue), `motif-*.svg` (the motif highlights) |
| `static/audio/` | `4part.m4a` (AAC, for Safari and most browsers) and `4part.webm` (Opus, used when AAC can't play) |
| `static/og.png` | The link preview image (1200 × 630), a screenshot of the first screen |
| `static/favicon.svg` | A notehead |
| `sitemap.xml` | `/` and `/cv/` |

Do not add anything under `/assets/`: the Pages theme writes `/assets/css/style.css` there. Everything else in the repo root (`IEEEv39.pdf`, `jlec-form/`, `images/`, `Page-2.html`, `hackathon/`, the Nicepage `css/`, `js/`, `vendor/`) is kept byte-identical; `_planning/verify-preserved.sh` checks that against the live site.

## Moving "today"

The page is fixed at 24 September 2026. To move it to a new date, change three things in `index.html`:

1. `--now` on the `<html>` tag. It is the date's position on the timeline, which runs from 1 January 2025 to 1 February 2027 (25 months):
   `((year - 2025) * 12 + (month - 1) + (day - 1) / 30) / 25 * 100`, as a percentage.
   Example: 3 October 2026 is `((1*12) + 9 + 2/30) / 25 * 100 = 84.27%`.
2. The `#today` station: its `data-f` (the same number divided by 100, e.g. `0.8427`) and its heading "Today, …". Move the whole `<section>` so it sits between the last past item and the first future one.
3. The footer's "Last updated …". Also update "Last updated" in `cv/index.html`.

## Turning a future item into a past one

Future items are blue (`#2340a8`). When something happens:

- On the timeline, remove `plan` from the item's class (`span plan` becomes `span`, `lab plan` becomes `lab`; `dot open` becomes `dot`). Do it in both copies: the big staff under the score and the small one in the pinned bar (`.pin .mini`). On the phone list (`<ol class="evlist">`), remove `class="plan"` from the `<li>`.
- For a station, remove `ahead` from its class (`station ahead` becomes `station`) and `<span class="plan">` from its date.
- In the CV, remove the `<span class="plan">` wrapper and rewrite the sentence in the past tense.

## The Locke result (3 October 2026)

In `index.html`, the `#locke` station has `<span class="plan">results 3 October</span>` under the date. Replace it with the result in black (for example `<br>` then the result text), change the timeline label `results 3 Oct` (two copies plus the phone list entry) to the result, and remove `plan`/`open` as above. In `cv/index.html`, replace "Results on 3 October 2026." with the result.

## Adding a timeline item

Positions on the timeline use the same formula as `--now`. A single event is a `<span class="dot" style="left:X%">` with a label `<span class="lab" style="left:X+0.6%">`; a period is `<span class="span" style="left:START%;width:LENGTH%">`. Put it in the lane where it has room, copy it into the pinned bar's `.mini`, and add a line to the phone `<ol class="evlist">`. A new station needs `data-f` (its position divided by 100) and must sit in date order among the other stations.

## Checks before pushing

- `python3 _planning/tools/copycheck.py index.html cv/index.html` for banned words and structures.
- Open the page at 360 px wide and check there is no sideways scroll.
- Print the CV to PDF and check it is still one or two A4 pages.
- After deploying, `bash _planning/verify-preserved.sh` to confirm the preserved files are unchanged.
