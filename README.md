# worldwiderad.com

Source for [worldwiderad.com](https://worldwiderad.com), my personal site. The homepage is built around *4part*, an orchestral piece I wrote: the score runs across the top, and scrolling walks a playhead through my projects in date order.

Everything is plain HTML, CSS and JavaScript. GitHub Pages runs Jekyll on every push to `master`, and that copies the pages and `static/` through unchanged, so there's no build step: edit, commit, push, and the site updates within a minute or two.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The homepage: styles, content and script in one file |
| `cv/index.html` | The printable CV |
| `p-doom/index.html` | "Where I'm at on AI risk" |
| `train-pointillism/watch/index.html` | The Train Pointillism video player (HLS, from `static/train-pointillism/`) |
| `train-pointillism/index.html` | Redirects to the homepage entry (`/#train`) so older links still work |
| `static/fonts/` | Petrona and a Bravura subset (both OFL; licences alongside) |
| `static/score/` | `piece.svg` (the notes), `piece-played.svg` (the same notes in blue), `motif-*.svg` (motif highlights) |
| `static/audio/` | `4part.m4a` (AAC) and `4part.webm` (Opus, used when AAC can't play) |
| `static/og.png`, `static/favicon.svg` | Link preview image and favicon |
| `_tools/timeline.py` | Gives the timeline position of a date (Jekyll doesn't publish `_` folders) |
| `_tools/ink/` | The pen-and-ink drawings beside each project: `build.mjs` draws them, `lib.mjs` has the pen helpers |
| `jlec-form/`, `hackathon/`, `Page-2.html`, `css/`, `js/`, `vendor/`, `images/` | Older pages, kept as they are |

Don't put anything under `/assets/`: the Pages theme writes `/assets/css/style.css` there.

## Dates and the timeline

"Today" updates itself. A script at the end of `index.html` puts the reader's date in the `#today` heading and moves the blue today line (`--now`) along the timeline. Without JavaScript the page shows the date written in the HTML, so when editing, update that date and the "Last updated" lines in the footer and in `cv/index.html`.

The timeline under the score is stretched, not to scale. Each section is pinned to its own stretch of the music (its `data-f`), and dates in between are spaced evenly. To find where a date sits:

```sh
python3 _tools/timeline.py 2026-10-03
```

The anchor list in `_tools/timeline.py` has to match the one in the script at the end of `index.html`.

A section can leave `data-f` empty (`data-f=""`). It then shares the music of the section before it, so it can sit in date order without re-spacing the score or the timeline.

### Adding a timeline item

A single event is a `<span class="dot" style="left:X%">` with a label `<span class="lab" style="left:X+0.6%">`; a period is `<span class="span" style="left:START%;width:LENGTH%">`. Put it in a lane with room, copy it into the pinned bar's `.mini`, and add a line to the phone list (`<ol class="evlist">`). A new station needs `data-f` (its position divided by 100) and has to sit in date order among the others.

### When a future item happens

Future items are blue (`#2340a8`) and carry `data-due="YYYY-MM-DD"`; once that date passes, the script appends ", to be added" (or the text in `data-note`). When the real outcome is in:

- On the timeline, drop `plan` from the class (`span plan` → `span`, `lab plan` → `lab`, `dot open` → `dot`), in both the big staff and the pinned bar's `.mini`. In the phone list, remove `class="plan"` from the `<li>`.
- Remove `data-due` and `data-note` everywhere they appear.
- For a station, drop `ahead` from its class and the `<span class="plan">` from its date.
- In the CV, remove the `<span class="plan">` wrapper and put the sentence in the past tense.

## Ink drawings

Each project section has a pen-and-ink drawing in its right-hand column (`<div class="art">`, on a section with the class `has-art`). In the HTML a drawing is an SVG of pen centrelines, grouped into layers (`.lay`) that each have a `data-depth` (how far the layer drifts as you scroll) and a `data-seq` (the order the layers are drawn). Inside a layer:

| Class | Drawn as |
|---|---|
| `k`, `k1`, `k2` | A pen stroke: normal, fine (hatching) and bold |
| `kd` | A dotted pen line |
| `f`, `w` | A solid ink fill, and a paper fill that hides what's behind it |
| `p p1`/`p2`/`p3` | Stippled dots in three sizes, uncovered by a sweep (`data-dir="l"` or `"r"`) |

The second script at the end of `index.html` turns each centreline into a tapered brush stroke and draws the strokes in order when the drawing scrolls into view. The layers then drift a little as you scroll, easing out over about a second. While the recording plays, its loudness presses the pen harder, so the lines thicken in loud passages. Future projects (`station ahead`) draw in blue. When the last section scrolls up the screen, it is brushed over in ink and turns white on ink, timed to land on the full orchestra at 8:46 if the recording is playing. Its drawing then draws on top.

With reduced motion the drawings appear finished and nothing moves. Without JavaScript they show as plain pen lines.

To change a drawing, edit it in `_tools/ink/build.mjs` and run:

```sh
node _tools/ink/build.mjs --apply
```

That rewrites each `svg#ink-<id>` in `index.html`. For a new section, add `has-art` to its class and an empty `<div class="art"><svg class="ink" id="ink-<id>"></svg></div>` after its text, then add the drawing to `build.mjs` (coordinates are in a 240 × 180 box).

## Before pushing

- Open the page at 360 px wide and check there's no sideways scroll.
- Print the CV to PDF and check it's still one or two A4 pages.

## If a deploy doesn't go live

GitHub Pages names each deploy after its commit. If a deploy times out (the "pages build and deployment" run fails at "Deploy to GitHub Pages"), re-running it asks for the same deploy again and stays stuck, because that one was already cancelled. Push a new commit instead, with any real change, and check githubstatus.com for an Actions or Pages incident first.
