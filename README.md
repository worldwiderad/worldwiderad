# worldwiderad.com

Source for [worldwiderad.com](https://worldwiderad.com), my personal site. The homepage is built around *4part*, an orchestral piece I wrote: the score runs across the top, and scrolling walks a playhead through my projects in date order.

Everything is plain HTML, CSS and JavaScript. GitHub Pages runs Jekyll on every push to `master`, and that copies the pages and `static/` through unchanged, so there's no build step: edit, commit, push, and the site updates within a minute or two.

## Layout

| Path | What it is |
|---|---|
| `index.html` | The homepage: styles, content and script in one file |
| `cv/index.html` | The printable CV |
| `blog/index.html` | The blog: a list of posts, newest first |
| `blog/<post>/index.html` | One post each: `p-doom/` ("Where I'm at on AI risk") and `maths-backwards/` ("We teach maths backwards") |
| `p-doom/index.html` | Redirects to `/blog/p-doom/`, where that post now lives, so older links still work |
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

Behind the projects there's a pen-and-ink landscape you fly through as you scroll. `static/ink/stage.js` puts a canvas the size of the screen behind `.journey` and draws the world in perspective: one drawing per section, standing on or lying on open ground, at its point in 4part (its `data-f`, the same position the timeline uses; a section with an empty `data-f` sits 24 seconds after the one before). The drawings are flat sheets, but each can stand facing the camera, turn, lean back or lie on the ground. The camera runs on one straight rail down the middle of the world, at a fixed height and looking straight ahead and a little down, so it never turns or swings: only its distance along the rail changes, and each drawing is placed for the rail to pass through or beside it.

One pen line, the thread, runs along the ground from each drawing to the next and becomes part of each one: it comes up the World Scholar's Cup ribbon and draws the wreath's stems, splits into the stave that 4part's notes sit on, walks the CIS-MAP route from the door to the pin, is the stitching down the spine of the open Locke book, draws both heads of Modelling the Other in a single line, runs along the sea as the tanker's wake and waterline, climbs a root and the trunk of the maths tree, becomes one rail of the railway, then the laptop's power lead and the line on its screen, and ends as the conductor's baton.

The camera reaches each drawing when the section's first line is a quarter of the way down the screen, and it eases towards the scroll position rather than following it exactly, so a flick of the scroll wheel glides to a stop. Then it flies on through or past the drawing: through the wreath, down the stave, over the floor plan, over the book, between the two faces, past the ship, past the tree, across the railway beside the train, through the today gate and through the laptop screen. A section with a side panel (the Locke chart) has no free right-hand column, so on wide screens its drawing is laid on the ground beside the rail, turned and sized so that from the reading position it lies in the space under the text; the camera still goes straight past it. Below 1200 px the text covers the page, so each drawing arrives in the gap above its section and you fly through it behind the text.

The pen draws in order. While you read a section the thread ends in its drawing; as you fly on, the pen carries the thread to the next one, arches strung with small motifs appear over the path (the last project's motif, then the next one's), and the next drawing draws itself. The blue diamond marked "today" stands across the path, and everything past it is drawn in blue. While the recording plays, the music draws the thread on at its own pace with a blue ring at the pen's tip, and the loudness presses the pen harder, so the lines thicken in loud passages.

The script adds `ink-on` to `<html>`, and the CSS for the ink world only applies under it. With reduced motion, or without JavaScript, the page is the plain version.

The drawings are generated. To change one, edit `_tools/ink/world.mjs` and run:

```sh
node _tools/ink/world.mjs
```

That rewrites `static/ink/world.js`. In the world, x runs right, y runs down (the ground is y = 0, so standing things have negative y) and z runs along the journey. Each scene is a list of layers made with `lay()`: the pen centrelines (in the layer's own units, mostly a 240 × 180 box), which way the sheet faces (`UP` standing, `FLAT` on the ground, `LEAN` tipped back, with an optional turn), the world point where one of its own points goes, and a scale. A scene also lists its thread pieces, in the order the pen draws them, and `read`, how far in front of the drawing the camera is while you read the section. The rail is at x = 0, 125 units above the ground. Each item is one of these:

| Kind | Drawn as |
|---|---|
| `k`, `k1`, `k2` | A pen stroke: normal, fine (hatching) and bold |
| `kd` | A dotted pen line |
| `f`, `w` | A solid ink fill, and a paper fill that hides what's behind it |
| `p` | Stippled dots |

The garland motifs are at the end of `world.mjs`, one per section. A section with no scene still gets the thread. Earlier versions are still in the history: the branch `backup/ink-vignettes` has a drawing beside each section, commit `8744016` the first fly-through down a corridor of staves, commit `b8f23cb` the flat version with the thread, and commit `a9934f2` the 3D version whose camera followed the thread.

## The blog

Each post is a self-contained page in its own folder under `blog/`. To add one, copy a post's folder, then change the title, date, description, canonical link and `og:` lines and write the post. Add it at the top of the list in `blog/index.html` (newest first) and add its address to `sitemap.xml`.

## Before pushing

- Open the page at 360 px wide and check there's no sideways scroll.
- Print the CV to PDF and check it's still one or two A4 pages.

## If a deploy doesn't go live

GitHub Pages names each deploy after its commit. If a deploy times out (the "pages build and deployment" run fails at "Deploy to GitHub Pages"), re-running it asks for the same deploy again and stays stuck, because that one was already cancelled. Push a new commit instead, with any real change, and check githubstatus.com for an Actions or Pages incident first.
