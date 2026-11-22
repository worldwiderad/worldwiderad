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
| `static/ink/` | `stage.js` draws the ink world behind the projects; `world.js` holds its drawings and is generated |
| `_tools/ink/` | `world.mjs` generates `static/ink/world.js` (the drawings and garland motifs), and `lib.mjs` has its pen helpers |
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

## The ink world

Behind the projects there's a pen-and-ink world you fly through as you scroll. `static/ink/stage.js` puts a canvas the size of the screen behind `.journey`, with one drawing per section placed at its point in 4part (its `data-f`, the same position the timeline uses; a section with an empty `data-f` sits 24 seconds after the one before). A single pen line, the thread, runs from each drawing to the next, and in several drawings it becomes part of the drawing: the training-loss curve under 4part, the walking route on the CIS-MAP floor plan, the line of sight between the two heads, the sea under the tanker, a root that climbs the maths tree, the railway, and at the end the conductor's baton.

Every drawing has an opening, and the camera follows the thread through it, so the drawing flies past at the edges of the screen: through the laurel wreath, between the stave and the loss curve, through a room of the floor plan, between the two essays, between the two faces, over the ship, up over the tree, through the viaduct's middle arch, through the laptop screen. The camera reaches each drawing when the section's first line is a quarter of the way down the screen, and it eases towards the scroll position rather than following it exactly, so a flick of the scroll wheel glides to a stop. It also banks a little as it swings sideways. Below 1200 px the text covers the page, so there each drawing arrives in the gap above its section and you fly through it behind the text.

The pen draws in order. While you read a section the thread ends in its drawing; as you fly through it, the pen carries the thread on to the next one, mirrored garlands of small motifs appear along it (the last project's motif handing over to the next one's), and then the next drawing draws itself. The blue diamond marked "today" is a gate the camera flies through, and everything past it is drawn in blue. Before the last section a black accent mark (a marcato) is outlined, floods with ink and the camera flies into it, so the page is dark from there on. While the recording plays, the music draws the thread on at its own pace, a blue ring rides the thread at the playhead, and the loudness presses the pen harder, so the lines thicken in loud passages.

The script adds `ink-on` to `<html>`, and the CSS for the ink world only applies under it. With reduced motion, or without JavaScript, the page is the plain version.

The drawings are generated. To change one, edit `_tools/ink/world.mjs` and run:

```sh
node _tools/ink/world.mjs
```

That rewrites `static/ink/world.js`. Each scene has a size (`S`), the point the camera faces while you read (`look`), the point it flies through (`gap`, which needs a clear space around it), and where the thread arrives and leaves (`tin`, `tout`). Its layers each sit at a depth (`dz`, in units behind the drawing, so negative is nearer the camera) with their own offset and scale, and the pen centrelines are drawn in a 240 × 180 box. Each item is one of these:

| Kind | Drawn as |
|---|---|
| `k`, `k1`, `k2` | A pen stroke: normal, fine (hatching) and bold |
| `kd` | A dotted pen line |
| `f`, `w` | A solid ink fill, and a paper fill that hides what's behind it |
| `p` | Stippled dots |

The garland motifs are at the end of `world.mjs`, one per section. A section with no scene still gets the thread. Earlier versions are still in the history: the branch `backup/ink-vignettes` has a drawing beside each section, and commit `4127312` has the first fly-through, down a corridor of staves.

## Before pushing

- Open the page at 360 px wide and check there's no sideways scroll.
- Print the CV to PDF and check it's still one or two A4 pages.

## If a deploy doesn't go live

GitHub Pages names each deploy after its commit. If a deploy times out (the "pages build and deployment" run fails at "Deploy to GitHub Pages"), re-running it asks for the same deploy again and stays stuck, because that one was already cancelled. Push a new commit instead, with any real change, and check githubstatus.com for an Actions or Pages incident first.
