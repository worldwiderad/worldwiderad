# worldwiderad.com: site inventory

Taken 24 September 2026, before any change. Branch `claude/relaxed-faraday-621ey6`, at `master` commit `52a093a` (3 June 2026).

This folder is `_planning/`. GitHub Pages runs Jekyll on this repo, and Jekyll never publishes a folder whose name starts with an underscore, so nothing in here can appear on worldwiderad.com, even after a merge.

## 1. How the site is hosted

| Item | Finding | How I know |
|---|---|---|
| Host | GitHub Pages, classic "deploy from a branch" | `server: GitHub.com` on every response; no `.github/workflows/` in the repo |
| Source | branch `master`, repository root | all 21 served files are byte-identical to `master` (table below); every `last-modified` header is 3 June 2026, the date of the last `master` commit |
| Build | Jekyll, which Pages runs by default | there is no `.nojekyll` file. `/README.md` is served raw because Jekyll's optional-front-matter plugin skips files named README |
| Domain | `worldwiderad.com` (apex) via `CNAME` | A records point to GitHub's four Pages addresses, 185.199.108–111.153 |
| HTTPS | enforced | `http://worldwiderad.com/` returns 301 to `https://` |
| `www.worldwiderad.com` | no DNS record, does not resolve | resolver returns "name not known". Not something this job changes |
| `worldwiderad.github.io/worldwiderad/` | 301 to `https://worldwiderad.com/` | |
| 404 page | GitHub's default | `/404.html` returns 404 |
| Other branches | `reorganize-files-8370551243610107617` (PR #1 by the Jules bot, merged March 2026, stale) | `git ls-remote` |
| Git history | 51 commits; the pack is 60 MB because deleted videos and photos from 2020 are still in history | `git count-objects` |

What Jekyll processing means for the rebuild:

- Plain `.html` files without front matter are copied as they are. New pages behave the same way unless they start with a `---` front-matter block.
- A `.md` file at the root without front matter gets published as an HTML page. That is why these notes live in `_planning/`.
- Any new folder that must be published cannot start with `_`.
- Jekyll can already build the site from data files (`_data/*.yml`) with no new tooling, because Pages runs it anyway. Question 11 in section 6 asks whether to use this.

## 2. Every path the domain serves

"Live" means I downloaded the file from worldwiderad.com and compared its SHA-256 hash with the repo copy.

| Path | Size | What it is | Referenced by | Live | Class |
|---|---:|---|---|---|---|
| `/` = `/index.html` | 9.4 KB | Nicepage homepage: music blurb, carousel of two SoundCloud covers. Loads Google Analytics `G-1LZPG74969` and an AdSense script | – | identical | **a** replace |
| `/Page-2.html` | 33.9 KB | Nicepage duplicate of the homepage, titled "Page 2", with `meta generator="Nicepage 6.13.1"`. Contains about 25 KB of style code injected by the Monica browser extension | `sitemap.xml` | identical | **?** see Q2 |
| `/css/style.css` | 1.47 MB | Nicepage stylesheet | `index.html`, `Page-2.html` only | identical | **a** if Page-2 goes |
| `/js/nicepage.js` | 372 KB | Nicepage runtime | `index.html`, `Page-2.html` only | identical | **a** if Page-2 goes |
| `/js/jquery-1.9.1.min.js` | 92.6 KB | jQuery for Nicepage | `index.html`, `Page-2.html` only | identical | **a** if Page-2 goes |
| `/vendor/intlTelInput/*` (3 files) | 613 KB | phone-number widget bundled by Nicepage, unused by any form | `nicepage.js` via a meta tag in the two Nicepage pages | identical | **a** if Page-2 goes |
| `/sitemap.xml` | 378 B | Nicepage sitemap listing only `/Page-2.html` and `/index.html` | – | identical | **a** replace |
| `/images/Thejourneyalbumcover.png` | 2.09 MB | *The Journey* cover, 1400 × 1400 | `index.html`, `Page-2.html` | identical | **b** keep |
| `/images/BLISS1.png` | 7.49 MB | *Bliss* cover, 1920 × 1920 | `index.html`, `Page-2.html` | identical | **b** keep |
| `/images/Untitleddesign4.png` | 2.11 MB | abstract gradient background | `css/style.css` | identical | **b** keep |
| `/images/pexelsphoto3532803.jpg` | 185 KB | stock photo of hands on a keyboard (Pexels) | `css/style.css` | identical | **b** keep |
| `/images/UntitledTrifoldBrochure.svg` | 79 KB | background artwork | `css/style.css` | identical | **b** keep |
| `/images/default-logo.png` | 1.8 KB | Nicepage placeholder logo | nothing | identical | **b** keep |
| `/IEEEv39.pdf` | 3.16 MB | Paper draft: *Empirical Dual-Slope Propagation Modeling of 915 MHz LoRa in Hyper-Dense Urban Canyons*, R. Green and D. Joshi, IEEE IoT Journal format, 9 pages | nothing in the repo; used externally | identical | **b** keep, not linked |
| `/jlec-form/` = `/jlec-form/index.html` | 38.2 KB | The JLEC survey, "AI Response Evaluation Study". Blinded A/B rating of 25 task pairs; posts ratings to a Google Apps Script endpoint | – | identical | **b** keep |
| `/jlec-form/data.csv` | 198 KB | The 25 task pairs (prompts and DeepSeek-R1 responses) the survey loads | `jlec-form/index.html`, by the relative path `data.csv` | identical | **b** keep |
| `/jlec-form/dash.html` | 29.6 KB | Live results dashboard for the survey, reading the same Apps Script endpoint | nothing (unlinked, but public) | identical | **b** keep |
| `/hackathon/` = `/hackathon/index.html` | 1.71 MB | "Hackathon Portal — Wireframe": a self-unpacking bundle with its own assets. Radek says it is outdated; the live platform is gvhackathon.com | nothing | identical | **b** for now, see Q3 |
| `/README.md` | 1 B | a single newline | – | identical | **b** keep |
| `CNAME` | 16 B | `worldwiderad.com` | Pages config (not served: `/CNAME` returns 404, as expected) | n/a | **b** never touch |

Dependencies of the pages that must survive:

- **JLEC survey and dashboard.** They use Google Fonts (Source Serif 4, DM Sans), `marked` 12.0.1 from cdnjs, and the Apps Script URL. They load nothing from `/css/`, `/js/`, `/vendor/` or `/images/`, so removing the Nicepage files cannot affect them. The only relative link is `index.html` → `data.csv`, which stays.
- **Hackathon wireframe.** Fully self-contained.
- **`IEEEv39.pdf`.** A static file.

The Nicepage dependency chain is closed. `css/style.css`, `js/*` and `vendor/intlTelInput/*` are used only by `index.html` and `Page-2.html`. The three background images are used only by `css/style.css`.

## 3. Proposed changes (nothing done yet)

| Action | Paths | Condition |
|---|---|---|
| Replace | `/index.html`, `/sitemap.xml` | on approval of the preview |
| Remove | `/css/style.css`, `/js/nicepage.js`, `/js/jquery-1.9.1.min.js`, `/vendor/intlTelInput/*` | only if `Page-2.html` is removed or replaced (Q2) |
| Keep, byte-identical | `/images/*` (all six), `/IEEEv39.pdf`, `/jlec-form/*`, `/hackathon/*` (pending Q3), `/README.md`, `CNAME` | always |
| Add | new pages and assets under paths that do not exist today. Proposed: `/cv/`, `/assets/` (CSS, fonts, resized images), `/favicon.ico`, `/robots.txt` if wanted. Individual project pages only if the content needs them, under `/work/<slug>/` | none of these paths exist now; all currently return 404 |

About `/images/`: I would keep all six files exactly as they are, including the three that only Nicepage uses. Keeping them costs nothing and removes any risk that something outside this repo links to them. The new site will not load the 7.5 MB originals. It will use resized copies under `/assets/`.

Removing the current homepage also removes Google Analytics and the AdSense script from the domain, because no other page carries them. That matches the brief's "no analytics" rule. If the AdSense account is still used for anything, you should know it will stop seeing this site.

## 4. Other things I noticed

- `/jlec-form/dash.html` is public and unlinked, and it reads live results from the Apps Script endpoint. That may be intended. If the endpoint returns anything beyond aggregates (ages, display names), anyone with the URL can see it. I have not called the endpoint and will not change these files.
- The live CIS-MAP (`worldwiderad.github.io/CIS-MAP-V2/`) requests `data/baked_paths.json`, and that file returns 404, so the 2D map probably shows "Failed to load route data" at the moment. The `/3d/` page returns 200. This is outside this repo, but it matters before the site links to the live map.
- The CIS-MAP floor plan (`assets/img/lvl4map.jpg`) is a photo of the school's posted evacuation map, and it names offices (Head of School, Finance, Principal). I don't plan to republish it on this site. Any map image here would be a crop or a route drawing you approve.
- `index.html` and `Page-2.html` contain `monica-writing-entry-btn-root` spans. These were injected by the Monica AI browser extension when the page was saved. They go away with the homepage.

## 5. Checks to run before and after deploy

`_planning/verify-preserved.sh` downloads every preserved path from the live domain and compares it with the SHA-256 values below. Run it before merging (as a baseline) and again after GitHub Pages finishes deploying. Every line must say `OK`.

```
312f179fb1985b93fee7b4968d889ac8adf915cf72c6381498619b48df676fab  IEEEv39.pdf
01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b  README.md
5b705d5e5c4a0f7ea01f3106499d652bf0548fdd76281447a57c71048096a01e  hackathon/index.html
5add6b397b2dff9bddbab1182f9dea1ec6ab233e12bd1c80f1b4ebaf3e6cf804  images/BLISS1.png
dfdc96bcf5da880bedaef87883cd2179cd4b677cc26644b5a0721d0da1c2c4e3  images/Thejourneyalbumcover.png
d9532d837a1431594053a55799bbe040bf0c27a47c811770da702153f47df126  images/UntitledTrifoldBrochure.svg
5aa79279d4af76b9f87196227a4bb59c64ec3eb488f017c5e515b67260a9ff81  images/Untitleddesign4.png
26cf65fd50a7f8a05154d8e5a6c5cc94302a2bded4fcca8bd4dc331e140c14de  images/default-logo.png
e47ff22a0be41ee8fa603bc9c90873e16638fd1589565aa6cfef9d4efeba65a9  images/pexelsphoto3532803.jpg
aedb51d853a45f383b5f925f8fd700ff08e89c42d4992169b3497e5dc372ec3f  jlec-form/dash.html
9aa28a66fa9842ad1072daf086226c547cd1fd0c76c4eaa8698aa515080cded4  jlec-form/data.csv
0168577a3ebd0bcd5d0282ae824c689b933648d0e547736857ccaeac276f9d73  jlec-form/index.html
```

`Page-2.html` (`56f1a79e…`) and the Nicepage assets join this list if Q2 is answered "keep".

The same script also checks that `/jlec-form/` (with the trailing slash) and `/hackathon/` return 200, and that `/_planning/SITE_INVENTORY.md` returns 404.

## 6. Questions about the repo

These sit alongside the content questions from the brief. My recommendation comes first in each.

1. **Other hosted pages.** Is anything else served from this domain that is not in this repo, such as a Google Form redirect or a link you have shared? Everything the repo contains is listed above. The JLEC survey is `/jlec-form/`.
2. **`/Page-2.html`.** It is a Nicepage copy of the old homepage and appears in the old sitemap. I recommend replacing it with a one-line page that points to `/`, so any old link still lands somewhere, and then removing the Nicepage CSS, JS and vendor files. Alternatively, keep it byte-identical with all its assets.
3. **`/hackathon/`.** You said it is outdated. I recommend replacing it with a short page that links to gvhackathon.com (or a redirect to it). The alternatives are to keep it as it is, or to delete it and let it 404.
4. **`/IEEEv39.pdf`.** It stays live and unlinked, as the brief says. Tell me if the LoRa paper should appear on the site after all.
5. **`/jlec-form/dash.html`.** Is it meant to be public? I won't touch it either way.
6. **Content in one place (question 11 in the list I'll send).** I recommend `_data/*.yml` files plus the Jekyll build that Pages already runs. The homepage and the CV page would then be generated from the same entries, and updating the JLEC result would be a one-line edit in a text file. The alternative is plain HTML with all content in `index.html`, clearly marked, and the CV kept in sync by hand.
