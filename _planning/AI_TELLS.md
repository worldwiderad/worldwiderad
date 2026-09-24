# AI tells: the audit standard for worldwiderad.com

Researched 24 September 2026 from about 100 sources: three parallel research passes, plus primary sources I read myself. The items below are the standard the site is audited against. Each has an ID so `AUDIT.md` can say exactly what passed or failed.

## How to read it

- **Tells work in clusters.** One tell proves nothing, but several together are what readers notice. Heavy chatbot users are very good at this: five of them, voting together, labelled 299 of 300 articles correctly ([Russell et al. 2025](https://arxiv.org/abs/2501.15654)).
- **Admissions readers punish suspected AI even when they are unsure.** In one master's programme, each AI-written essay lowered the chance of admission by 1.5 points, and readers' detection accuracy was only moderate (AUC about 0.70) ([arXiv 2609.22549](https://arxiv.org/html/2609.22549)). Being suspected is enough to cost something.
- **The look has moved in waves** ([Bakaus/a16z](https://www.a16z.news/p/impeccable-by-design), [Chayka](https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design)):
  - Wave 1 (2023–25): indigo gradients, Inter, three cards, dark mode with glows.
  - Wave 2 (2025–26): cream background, italic serif, terracotta accent. This is Claude's own default and also what "anti-slop" prompts produce.
  - Wave 3: broadsheet layouts with hairline rules, and near-black pages with one acid accent.

  So avoiding purple does not make a site safe. Bakaus: "today's antidote to slop becomes tomorrow's slop the moment everyone reaches for it."
- **This site is being built by Claude.** Claude's documented defaults (the P items below) are therefore the most likely failures, not the least likely. The primary source for them is Anthropic's own [frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (updated 3 September 2026). It lists five clusters of generated design, and every one of them appears below.
- **Tags:** † = only one source supports the item. **B** = banned by the brief whatever the research says. **W** = on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

## P. Claude's own defaults (highest risk for this build)

All from [Anthropic's frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and the [Opus 4.8 prompting docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), which describe Claude's "house style".

- **P1** Warm cream background (near `#F4F1EA` or `#faf9f5`), high-contrast serif display face, terracotta or clay accent (near `#D97757`, `#c96442`, `#D9622B`). The docs say this look "reads well for… portfolio briefs", which makes a portfolio its natural home. **B**
- **P2** Near-black background with a single acid-green or vermilion accent. Also the monospace "terminal" look with a dot grid and zero radius. **B**
- **P3** Broadsheet layout: hairline rules between everything, zero border radius, dense newspaper-like columns.
- **P4** SaaS card kit: identical rounded cards, one radius on everything, the same `rgba(0,0,0,.1)` shadow on each, and gradient washes as decoration.
- **P5** Template chrome:
  - a tracked ALL-CAPS eyebrow label above every heading
  - meta strings joined by middle dots ("A · B · C")
  - labels built as "WORD — fragment"
  - tinted near-black (`#0B0B0B`, `#111`) standing in for black
  - monospace for small data labels
  - "→" appended to links and buttons
- **P6** One word or phrase of a headline set apart in italic, bold or a colour ("a recognizable Claude signature" per [avoid-ai-design](https://github.com/funboy322/avoid-ai-design/blob/main/references/ai-tells-catalog.md)).
- **P7** Typographic labels above content that the content does not need. All caps used for labels.
- **P8** Numbered markers (01 / 02 / 03) on content that is not a sequence.
- **P9** "Tasteful" fonts from the prompts, used as the only design gesture: Instrument Serif, Fraunces, Playfair, Space Grotesk, Syne, Bricolage Grotesque, JetBrains Mono. Also Georgia as the display face ([Krebs](https://www.adriankrebs.ch/blog/design-slop/), [Claude cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)).
- **P10** Remedies from the December 2025 version of the skill, which are now second-order tells: grain or noise overlays, gradient meshes, custom cursors, staggered `animation-delay` reveals ([skill history](https://github.com/anthropics/skills/commits/main/skills/frontend-design/SKILL.md)).
- **P11** A hero that is "a big number with a small label, supporting stats, and a gradient accent" (the skill's own words).
- **P12** Over-correction. Swapping indigo and Inter for cream, a serif and grain just trades one default for another ([avoid-ai-design](https://github.com/funboy322/avoid-ai-design/blob/main/references/ai-tells-catalog.md), [Chayka](https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design)).

## V. Visual

**Colour**
- **V1** Indigo or violet as the main colour; blue→purple or →pink gradients on the hero, buttons or H1. Tailwind `indigo-500/600`, violet `#7c3aed` ([Wathan](https://x.com/adamwathan/status/1953510802159219096), [Krebs](https://www.adriankrebs.ch/blog/design-slop/), [slop-detect](https://github.com/ravidsrk/slop-detect)). **B**
- **V2** Gradient text (`background-clip: text`) ([slop-detect](https://github.com/ravidsrk/slop-detect), [Impeccable](https://impeccable.style/slop/)). **B**
- **V3** Neon on black: several saturated accents, cyan on dark, glowing borders, coloured shadows blurred 24px or more ([Fountain](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui), [slop-detect](https://github.com/ravidsrk/slop-detect)). **B**
- **V4** Tailwind slate or zinc grey ramps left as they come; the shadcn palette of a near-black primary button on white with mid-grey muted text ([designdotmd](https://freedesignmd.com/blog/shadcn-looks-generic), [shadcn docs](https://ui.shadcn.com/docs/theming)).
- **V5** Teal or cyan accent used everywhere ([Impeccable](https://impeccable.style/slop/), [awesome-claude-design](https://github.com/rohitg00/awesome-claude-design)).
- **V6** Dark mode as the only mode, with low-contrast grey text and coloured glows ([Krebs](https://www.adriankrebs.ch/blog/design-slop/), [OpenAI 5.4](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4)).
- **V7** Grey text on coloured backgrounds, or text that barely passes contrast ([Impeccable](https://impeccable.style/slop/)).
- **V8** Choosing pure `#000`/`#fff` or tinted `#111` without a reason. The sources disagree on which is the tell, so the test is whether the choice has a justification written down ([Impeccable](https://impeccable.style/slop/) vs [Anthropic skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)).

**Type**
- **V9** Inter, Geist or another default sans for everything ("the Helvetica of the LLM era", [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)). Also `system-ui` as the only face. **B**
- **V10** Oversized, tightly tracked H1 over small grey subtext; a flat type scale ([slop-detect](https://github.com/ravidsrk/slop-detect)†).
- **V11** Tracked-out small subheads; "zealous highlighting" ([Chayka](https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design)).

**Surfaces**
- **V12** One corner radius everywhere: `rounded-2xl`, pill buttons, shadcn `0.625rem` ([CodeMySpec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same), [shadcn docs](https://ui.shadcn.com/docs/theming)).
- **V13** Soft grey shadow under every surface. Test from [OpenAI](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4): "Would the design still feel premium if all decorative shadows were removed?" **B**
- **V14** Glassmorphism, `backdrop-filter: blur`, frosted sticky navbar ([Krebs](https://www.adriankrebs.ch/blog/design-slop/): 17% of sites). **B**
- **V15** A coloured 3–4px stripe on one edge of a card or callout: "almost as reliable a sign of AI-generated design as em-dashes" ([Krebs](https://www.adriankrebs.ch/blog/design-slop/), [Impeccable](https://impeccable.style/slop/)).
- **V16** Cards inside cards; 1px light-grey border with identical padding on every box ([Bakaus](https://www.linkedin.com/posts/paulbakaus_ai-slop-design-tells-design-anti-patterns-activity-7416272383017164800-10DR), [Fountain](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui)).

**Decoration and imagery**
- **V17** Glowing blobs, orbs, aurora or mesh backgrounds, particle spheres ([slop-detect](https://github.com/ravidsrk/slop-detect), [Creative Boom](https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/)). **B**
- **V18** Lucide or Heroicons in tinted rounded squares; a big rounded icon above headings; the sparkles icon as "AI" ([Bakaus](https://www.linkedin.com/posts/paulbakaus_ai-slop-design-tells-design-anti-patterns-activity-7416272383017164800-10DR), [NN/g](https://www.nngroup.com/articles/ai-sparkles-icon-problem/)).
- **V19** Emoji as icons, bullets or section markers. **B**
- **V20** Dot-grid or graph-paper backgrounds with a radial fade (weak signal; common as a component). **B** (as part of the terminal look)
- **V21** Decorative sparklines or charts that show no real data ([Impeccable](https://impeccable.style/slop/)).
- **V22** Generated images: garbled text on signs, wrong shadows, glossy "plastic" surfaces, psychedelic swirl textures; AI headshots ([Optic Flux](https://www.opticflux.com/how-to-spot-an-ai-generated-image-in-2026-the-tells-that-still-work/79504/), [Creative Boom](https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/)). **Project-specific:** the existing *Bliss* cover in `/images/` reads this way.
- **V23** Stock clichés: people at laptops, abstract 3D blobs, Unsplash desks and open roads ([925 guide](https://www.925studios.co/blog/ai-slop-web-design-guide)). The old homepage's Pexels photo is one of these.
- **V24** Letter-on-gradient avatar circles standing in for a photo ([slop-detect](https://github.com/ravidsrk/slop-detect)).

## L. Layout and structure

- **L1** Centred hero stack: pill, then very large H1, then grey subhead, then two buttons ([Krebs](https://www.adriankrebs.ch/blog/design-slop/), [Impeccable](https://impeccable.style/slop/)).
- **L2** "Hi, I'm Radek 👋" hero; "currently building" pill; availability dot. **B**
- **L3** Portfolio skeleton: Hero → About → Skills → Projects → Experience → Contact ([Jaimin/DEV](https://dev.to/jaimin_umaraniya_c1fa0102/why-your-developer-portfolio-should-work-like-a-product-not-a-resume-4m67)†). Landing skeleton: hero → logo wall → three feature cards → testimonials → pricing → FAQ → CTA ([Shuffle](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/), [Sailop](https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web)).
- **L4** Rows of identical cards with icon, title and one-line description ([Krebs](https://www.adriankrebs.ch/blog/design-slop/), [Impeccable](https://impeccable.style/slop/)). **B**
- **L5** Bento grid ([slop-detect](https://github.com/ravidsrk/slop-detect), [Creative Boom](https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/)). **B**
- **L6** Tech-stack badge walls, skill bars, "40 technologies" ([DEV 2026](https://dev.to/_d7eb1c1703182e3ce1782/best-developer-portfolio-examples-2026-2d8m)). **B**
- **L7** Stat strip ("5+ years · 30+ projects"), animated counters ([Krebs](https://www.adriankrebs.ch/blog/design-slop/): 12%, [OpenAI 5.4](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4)). **B**
- **L8** Cards, pill clusters or icon rows in the hero; inset or floating hero images ([OpenAI 5.4](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4)).
- **L9** Logo marquee, testimonial carousel, FAQ accordion, ticker bar ([Sailop](https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web), [Chayka](https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design)).
- **L10** Everything centred; identical vertical padding (about 128px) on every section, with no rhythm ([Impeccable](https://impeccable.style/slop/), [925 guide](https://www.925studios.co/blog/ai-slop-web-design-guide)).
- **L11** Social-icon row in the footer; experience timeline component (no source calls these AI tells as such; treat as judgement calls).
- **L12** Known templates (the same problem without AI):
  - Brittany Chiang v4: navy and mint, "01. About", "I build things for the web."
  - al-folio: a news table with emoji, and venue badges.
  - AcademicPages: a sidebar author card.
  - Wowchemy: an avatar with "Interests / Education" lists.
  - Jon Barron clones: name and bio, then an "Email / CV / Scholar / Github" slash row, a photo on the right, and paper rows with thumbnails.

  Sources: [Chiang v4](https://v4.brittanychiang.com/), [al-folio](https://alshedivat.github.io/al-folio/), [AcademicPages](https://academicpages.github.io/), [Ballou](https://nickballou.com/blog/custom-wowchemy/), [Barron](https://jonbarron.info/).

## M. Motion and interaction

- **M1** Every section fading or sliding up on scroll (Framer `opacity:0, y:20`, AOS, an IntersectionObserver adding `fade-in-up`). Anthropic's skill says this "read[s] as AI-generated" ([skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), [Bushell](https://dbushell.com/2026/01/09/death-to-scroll-fade/)). **B**
- **M2** Content at `opacity:0` until a script reveals it, so the page is blank without JS ([Impeccable](https://impeccable.style/slop/), [Bushell](https://dbushell.com/2026/01/09/death-to-scroll-fade/)).
- **M3** Hover lift with a shadow on every card; `hover:scale-105`; zooming images; `transition: all 0.3s ease` on everything (29 of 40 generated sites in one spot-check).
- **M4** Cursor-following glow, spotlight, magnetic buttons, custom cursors ([Sailop](https://www.sailop.com/blog/ai-slop-2026-state-of-the-ai-generated-web), [Impeccable](https://impeccable.style/slop/)).
- **M5** Typewriter or rotating-word headlines; blinking decorative cursor. **B**
- **M6** Animated counters. **B**
- **M7** Animated gradient borders, shimmer, infinite glows, pulsing dots or badges ([VibeMole](https://vibemole.com/resources/avoid-vibecoded-app-design)).
- **M8** Scroll progress bar†, parallax (a cliché, though not an AI one), preloaders.
- **M9** shadcn sun/moon theme toggle; Sonner toasts ([shadcn source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/public/r/styles/new-york/mode-toggle.json)).
- **M10** Motion with no reason. Bounce or elastic easing. **B**

The human standard: motion only in answer to what the reader does. Content visible without JS. `prefers-reduced-motion` honoured. None of the 40 generated sites in the spot-check honoured it.

## C. Copy

**Structures**
- **C1** Contrastive reframe, the strongest single tell: "it's not X, it's Y", "not just X, but Y", "not because X, but because Y", "The question isn't X. It's Y.", "Y rather than X", "Less X, more Y". It appears at 3× the human rate ([Pangram](https://www.pangram.com/signs-of-ai-writing)) and was the most-spotted tell on [HN](https://news.ycombinator.com/item?id=47292290). **B** **W**
- **C2** Groups of three used for rhythm: three adjectives, three short clauses, three-item lists (4× the human rate) ([Russell](https://arxiv.org/abs/2501.15654), [Pangram](https://www.pangram.com/signs-of-ai-writing)). **B** **W**
- **C3** Dramatic countdowns ("Not a career. Not a body of work. Just…"). **B** **W**
- **C4** Rhetorical question, then the answer ("The result? …"); colon reveals; "Here's the thing"; "The truth?"; "What most people miss". **B**
- **C5** Pedagogical openers: "Let's break it down", "Let's dive in", "Think of it as…". **B**
- **C6** "-ing" tails that pass judgement: "…, highlighting its importance", "underscoring a commitment to", "fostering a sense of". 2–5× the human rate ([Reinhart, PNAS](https://www.pnas.org/doi/10.1073/pnas.2422455122)). **W**
- **C7** Inflated significance: "stands as a testament", "pivotal moment", "reflects broader trends", "enduring legacy". **W**
- **C8** Avoiding plain "is" and "has": "serves as", "stands as", "boasts", "features", "offers". **W**
- **C9** Summaries restating what was just said; neat upbeat or moral closing lines; "Despite these challenges…". **B** **W**
- **C10** Template openers: "Whether you're X or Y", "In a world where", "Imagine…", "That's where X comes in". **W**
- **C11** False ranges ("from X to Y" where X and Y are not on any scale). **W**
- **C12** Choppy fragments and one-line kicker paragraphs: "And that matters." "Which is exactly the point."
- **C13** Even rhythm: every paragraph about three sentences, every sentence about 15 words ([SlopMonster](https://github.com/DJAscendance/SlopMonster)).
- **C14** Announcing the structure: "There are three key reasons…".
- **C15** Vague attribution ("experts say"); generic claims where a name, number or date belongs. **W**
- **C16** Mannered metaphors, Claude-specific: "a dial worth turning", "earns its keep", "load-bearing", "seam"; metaphor verbs such as earn, anchor, surface, land, carry, hold ([Anthropic docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1), [Abraham](https://github.com/louisabraham/load-bearing), [Workbravely](https://workbravely.substack.com/p/the-ai-idiolect-a-professional-writers)†).

**Formatting**
- **C17** Em dashes. Heavy use now points to Claude specifically; ChatGPT has largely stopped ([Economist 2026](https://www.economist.com/culture/2026/07/30/how-to-spot-ai-writing)). The rule here: none at all. The en dash is only for ranges, unspaced (2025–26). **B**
- **C18** Bold-first bullet points; bold scattered through prose ([Pangram](https://www.pangram.com/signs-of-ai-writing): bold is 43× more common in AI text). **B** **W**
- **C19** Title Case headings; too many headings for the amount of text; headings that contain only other headings; horizontal rules between sections. **W**
- **C20** Emoji in text. Arrows (→) and ≈ used as decoration. Curly and straight quotes mixed in the same text. **W**
- **C21** Chat leftovers: "Certainly!", placeholders such as [Your Name], stray `**` or `#`.

**Portfolio-specific**
- **C22** Hero lines that could belong to anyone: "Building the future of X", "Crafting digital experiences", "I build things for the web".
- **C23** Section titles: "My Journey", "About Me", "What I Do", "Featured Work", "Let's Connect", "Awards and Recognition" (W, for the last). "Get in touch" is only a weak signal.
- **C24** About-me tone: "passionate about", "at the intersection of", "lifelong learner", "driven by curiosity", "making a difference". Mission statements. **B**
- **C25** Self-praise adjectives: innovative, cutting-edge, robust, seamless, meticulous, comprehensive. **B**
- **C26** Personal details inserted like keywords: identity markers attached to sentences that do not need them ([Cornell](https://www.news.cornell.edu/stories/2025/09/ai-can-write-your-college-essay-it-wont-sound-you), [Inside Higher Ed](https://www.insidehighered.com/news/admissions/traditional-age/2026/05/08/study-explores-ai-written-admissions-essays)).
- **C27** Stock growth arc: experience, then realisation, then the lesson applied. Polished, risk-free "vulnerability".
- **C28** Alt text starting "Image of…", or describing the picture without saying why it is on the page ([OSU](https://ets.osu.edu/digital-accessibility/alternative-alt-text-guide)).
- **C29** Meta descriptions opening with Discover, Explore, Dive into, Embark, Experience ([eesel](https://www.eesel.ai/blog/how-do-i-write-seo-meta-descriptions-with-ai)†).
- **C30** Invented proof: user counts, ratings, testimonials. The facts in the brief are the only numbers allowed.

**Vocabulary**
- **C31** Any word on the list at the end of this file. It includes the brief's own bans (delve, robust, leverage, tapestry, nuanced, notably, importantly) and the Wikipedia, Kobak and Pangram lists. Following Wikipedia's advice, read the list literally: a banned word's synonyms are not automatically banned.

## K. Code, markup, metadata, repository

A technical reader may open view-source or the GitHub repo.

- **K1** Generator strings in `<head>`: Lovable, v0, Framer, Replit, Nicepage (`meta generator`), `gptengineer.js`, a generator's `og:image`. Detectors weight these above everything else ([isthatvibecoded](https://isthatvibecoded.com/)).
- **K2** Scaffold defaults: "Vite + React + TS", `/vite.svg`, "My App", no OG image, an empty `<div id="root">`.
- **K3** Tailwind Play CDN in production (39 of 40 spot-check sites); icon libraries from a CDN.
- **K4** Utility-class signatures: `bg-clip-text text-transparent`, `max-w-7xl mx-auto px-4`, `rounded-2xl shadow-lg`, `backdrop-blur`.
- **K5** Token names that copy shadcn (`--background`, `--foreground`, `--primary-foreground`, `--muted-foreground`, `--ring`, `--radius`). The vanilla LLM token block: `--primary-color`, `--accent-color`, `--transition: all 0.3s ease`†.
- **K6** Section-label comments (`<!-- Hero Section -->`, `<!-- Footer -->`: 11 and 15 of 40 sites). Comments that say what the code does rather than why (`// Smooth scroll for anchor links`). Emoji in comments or console output.
- **K7** A JS smooth-scroll or reveal script where CSS or plain HTML would do.
- **K8** `href="#"` dead links, `/api/placeholder/…`, Unsplash or Pravatar hotlinks, TODOs left in, `console.log`.
- **K9** Missing `alt`, `<div onclick>` instead of `<button>`, no focus styles, several `<h1>`s, generic or duplicated titles and descriptions.
- **K10** Agent files in the repo or deploy root: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.bolt/`. Commit trailers such as `Co-Authored-By: Claude` or "Generated with Claude Code". **Project-specific:** this repo is public, and this build's commits carry those trailers by default and live on a `claude/…` branch. Radek decides how to handle this before merge (see `DESIGN_PROPOSAL.md`).
- **K11** One huge "initial commit" followed by "fixes" ([McKelvey](https://justinmckelvey.com/blog/how-to-tell-if-code-was-written-by-ai)).
- **K12** Third-party requests before the reader asks: analytics, AdSense, SoundCloud iframes, Google Fonts. **B**

## H. What reads as made by a person

This is the positive standard. A page can pass every item above and still read as generated if it has none of these.

- **H1** Specific, checkable details: names, numbers with units, dates, places ([Russell](https://arxiv.org/abs/2501.15654), [W](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)).
- **H2** Plain verbs (is, has, wrote, built, used, ran). Committed claims. Ordinary hedges where they are honest ("about ten minutes").
- **H3** Uneven rhythm: short and long paragraphs side by side; lists of two or four, not always three.
- **H4** Admitted limits and unfinished work labelled as unfinished.
- **H5** Short quotations worked into sentences, including from one's own work. Models rarely quote ([Economist via Daring Fireball](https://daringfireball.net/linked/2026/08/11/economist-ai-writing)).
- **H6** Endings that stop rather than summarise.
- **H7** The characteristic material of the subject in place of decoration: real figures, real screenshots, real scores ([Anthropic skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), [925 guide](https://www.925studios.co/blog/ai-slop-web-design-guide)).
- **H8** Structure that carries information. Labels, numbers and rules only where the content needs them.
- **H9** One place where the design is bold, and quiet everywhere else.
- **H10** Visible decisions: what was cut, trade-offs, rough process ([Fountain](https://www.thefountaininstitute.com/blog/senior-product-designers-hired)).
- **H11** Static HTML with real content, readable without JS; sparse comments that explain why; token names in one's own vocabulary; complete hover, focus and active states.

## Banned vocabulary

This list is also `_planning/tools/banned-words.txt`, which `copycheck.py` reads. **B** = the brief's own bans.

additionally (opening a sentence), align with, arguably, at the end of the day, at the intersection of, authored, best-in-class, boasts, bolster, commendable, commitment to, comprehensive, core (as an adjective), craft/crafted/crafting, crucial, cultivate, curated, cutting-edge, deep dive, deeply, delve **B**, despite these challenges, dive into, diverse array, driven by, earns its keep, ecosystem, effortless, elevate, embark, embrace, empower, encompass, enduring, enhance, ensure, ever-evolving, evolving landscape, exemplify, experts say, featured in, feel free to, foster, fundamentally, game-changing, garner, genuinely, groundbreaking, harness, here's the thing, highlight (as a verb), holistic, honest caveat, I hope this helps, imagine, importantly **B**, in conclusion, in summary, in the heart of, in today's world, indelible, innovative, interplay, intricate, it's important to note, it's worth noting, journey, key (as an adjective), landscape (abstract), leverage **B**, lifelong, liminal, load-bearing, meaningful, meticulous, modern, multifaceted, myriad, navigate, nestled, notably **B**, nuanced **B**, paradigm, passionate, paving the way, pivotal, plethora, profound, quietly, realm, remarkable, renowned, resonate, revolutionise, rich (abstract), robust **B**, seamless, seam, serves as, showcase, spearhead, stands as, streamline, supercharge, synergy, tapestry **B**, testament, thrilled, transformative, truly, underscore, unleash, unlock, unparalleled, utilise, valuable insights, vibrant, vital, whether you're, world-class.

## R. Found by fresh reviewers on this site's own mockup

None of these came from the literature. Two rounds of blind reviewers found them on the mockup, and they are part of the standard from here on.

- **R1** Every entry built the same way (context, then a number, then who did what, then status), however unrelated the projects. Both reviewers in round 0a rated this the strongest tell.
- **R2** Entries of near-identical length (four of five within 50–57 words).
- **R3** A hard number in every single entry, which reads as a rule being followed.
- **R4** Credit scoped precisely in every entry ("alone", "on my own", "sole").
- **R5** Clipped declarative beats as openers or closers ("A pilot has run." "It's still a prototype."). Also agentless passives ("is under review").
- **R6** Compressed, writerly syntax such as fronted participles ("Told the name of a peer model, does it…").
- **R7** Captions that pre-empt every objection. Careful self-caveating is read as a Claude habit, even when it is honest.
- **R8** A meta description that sums up the page from outside, in the third person.
- **R9** Symmetric lines are flagged even inside quotations ("can still… / can no longer…").
- **R10** Mixed quote styles (one straight apostrophe among curly ones).
- **R11** Polished prose with no dashes at all can read as deliberate avoidance. The brief's no-em-dash rule stands; the answer is ordinary punctuation used naturally, not a substitute tic.

The positive standard the reviewers agreed on:

- Real URLs and handles, specific numbers, and IB terms used correctly.
- Headings that don't match each other.
- The hollow bar for the task that was set aside.
- Untidy real data.

The unresolved point: both reviewers said the page has facts but no voice. That can only come from Radek.

## Risks specific to this project

These came from the material itself, not from the literature.

- **Quoting Radek's essays can bring in C1 and C2.** Several of the essays' best lines are contrastive or come in threes. Examples: "a ceiling is a constraint, not a metric"; "not to honour the machine, but to keep ourselves honest"; "The institutions would continue, the judges would continue, the sentences would continue". A quotation is visibly his, set as a quotation and linked to the PDF, so it is not site copy in the style guide's sense. But a skimming reader only sees the shape. The site quotes lines without those shapes first. Preferred: "A court that accepts determinism can still decide who to sentence. It can no longer say by how much." and "Irrationality is also a safeguard."
- **Existing cover art (V22).** The *Bliss* cover's swirl texture is a typical image-model look. It is kept off the homepage unless Radek decides otherwise.
- **Petrona plus black on white could drift into P3** if hairline rules, small-caps labels or dense columns creep back in. The design keeps no rules except a data axis, no labels above headings, and one column of text with one figure beside it.
- **The repo (K10).** Planning notes, `claude/` branch names and commit trailers are all visible in a public repository.

## Sources

The three research reports behind this file list every URL with a one-line note. The main ones:

- **Design guidance from Anthropic.** [Anthropic frontend-design skill (Sept 2026)](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and its [history](https://github.com/anthropics/skills/commits/main/skills/frontend-design/SKILL.md) · [Opus 4.8 prompting docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8) · [Claude cookbook: frontend aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) · [Anthropic blog, Nov 2025](https://claude.com/blog/improving-frontend-design-through-skills)
- **Design guidance from OpenAI.** [OpenAI GPT-5.4 frontend guide](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4) · [OpenAI GPT-5 cookbook](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_frontend)
- **Measured studies and detector rulesets.** [Krebs, 1,590 Show HN pages scored in code](https://www.adriankrebs.ch/blog/design-slop/) · [slop-detect ruleset](https://github.com/ravidsrk/slop-detect) · [Impeccable](https://impeccable.style/slop/) · [avoid-ai-design catalog](https://github.com/funboy322/avoid-ai-design/blob/main/references/ai-tells-catalog.md) · [isthatvibecoded](https://isthatvibecoded.com/)
- **Critics and commentary.** [Chayka](https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design) · [Bakaus/a16z](https://www.a16z.news/p/impeccable-by-design) · [Fountain Institute](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui) · [Bushell, Death to Scroll Fade](https://dbushell.com/2026/01/09/death-to-scroll-fade/) · [Creative Boom](https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/)
- **Writing tells.** [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (read in full, 24 Sept 2026) · [Russell, Karpinska & Iyyer 2025](https://arxiv.org/abs/2501.15654) · [Kobak et al. 2025](https://www.science.org/doi/10.1126/sciadv.adt3813) · [Reinhart et al., PNAS](https://www.pnas.org/doi/10.1073/pnas.2422455122) · [Pangram](https://www.pangram.com/signs-of-ai-writing) · [Economist, July 2026](https://www.economist.com/culture/2026/07/30/how-to-spot-ai-writing) · [Washington Post 2025](https://www.washingtonpost.com/technology/interactive/2025/how-detect-chatgpt-em-dash/) · [tropes.fyi](https://tropes.fyi/tropes-md) · [SlopMonster](https://github.com/DJAscendance/SlopMonster)
- **Admissions.** [AI-written admissions essays are widespread but penalized](https://arxiv.org/html/2609.22549) · [Inside Higher Ed 2026](https://www.insidehighered.com/news/admissions/traditional-age/2026/05/08/study-explores-ai-written-admissions-essays) · [Cornell 2025](https://www.news.cornell.edu/stories/2025/09/ai-can-write-your-college-essay-it-wont-sound-you) · [UCAS](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/a-guide-to-using-ai-and-chatgpt-with-your-personal-statement)

Limits of the research:

- **Portfolio-specific claims are thin.** The section order, the "Hi 👋" hero and the availability pill rest on few sources. The general patterns are well supported.
- **Some pages were read second-hand.** The NYT, Economist and Atlantic pieces were read through summaries or other writers.
- **Some items have no source.** Nothing found names `clamp()`-everywhere, CSS resets or class names like `hero-section` as tells, so they are not on the list.
