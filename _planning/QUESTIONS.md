# Questions for Radek

Answer inline, in chat, or not at all. Each question has a default in square brackets, and I use the default until you say otherwise. A default never publishes anything the brief marks CONFIRM.

## Blocking the build

1. **Contact.** Which email address should be published? Any other profiles (LinkedIn, ORCID, Google Scholar)? [no email shown; GitHub and SoundCloud only]
2. **Modelling the Other.** Should advisors be credited, and how (name, role)? Should the pilot numbers appear before pre-registration? [no advisor line; show the question, the method, and that a pilot has run, with no numbers]
3. **Science and Technology prompt.** Your submitted PDF's cover says "Should we be polite to ChatGPT?", but the brief says "Should we be *more* polite to ChatGPT?". Which one is the official JLI wording? [quote the cover of the PDF, since that is what the link opens]
4. **VPS Veritas.** What was delivered, and what is VPS happy to have described? [list the internship, dates, format and brief only, with no deliverables, clients or product names]
5. **Music.** Which tracks should be featured, and in what order? What is the title and SoundCloud link of the 49-track piece? What is the title and link of the single-movement symphony? [list both; link only what has a URL]
6. **Hackathon co-lead.** The brief says to credit collaborators. May I name the CS teacher who co-leads, and how should they be named? [write "co-led with the school's computer science teacher", unnamed]

## Shaping the design

7. **Cover art.** Were the *Bliss* and *The Journey* covers made with an image generator? Either way, the *Bliss* cover in particular reads as AI-generated to someone who has seen a lot of such images. For a site whose first rule is "must not look AI-made", I recommend keeping both covers off the homepage. [covers not shown; tracks listed as text with click-to-load players]
8. **A score excerpt.** Could you export one page, or a few bars, from MuseScore as PDF or SVG? A passage from the 49-track score, with its instrument names down the left margin, would be the strongest visual on the whole site: it is real, it is yours, and no generator produces it. [music section is text only]
9. **Photo.** Headshot or no photo? [no photo. If you want one, an unposed photo of you working (at the score, with the ATtiny85 board) is better than a headshot]
10. **Petrona.** Both essays are set in Petrona. Did you choose it? I would like to use it for the site, with a one-line colophon saying it is the face your essays are set in. [use Petrona; the colophon line only if you chose it]
11. **Where content lives.** (a) Entries kept in `_data/*.yml` text files, with the homepage and CV generated from them by the Jekyll build GitHub Pages already runs. No new tooling, and updating the JLEC result is a one-line edit. (b) Plain HTML, with all content in `index.html` and the CV kept in sync by hand. [a]

## Content to confirm (from the brief's CONFIRM list)

12. CIS-MAP status. Note that the live 2D map currently requests `data/baked_paths.json` and gets 404, so it probably fails to load routes. Can that be fixed before the site links to it? [link the repo; link the live map only once it works]
13. Should the WSC club co-leaders be named? [not named]
14. Should the overnight research loop be included? What is the Linguistics Olympiad status? [both left out]
15. Chemistry through VHS Learning: is it completed or in progress? [listed as "in progress"]
16. Grades or scores? [none shown]
17. **gvhackathon.com public details.** Your public site says it is international and online, for ages 14 to 18, in teams of 2 to 4, with Junior and Senior divisions. The brief calls it a "school-hosted AI and CS hackathon". May I use the public details? [use only what the brief says, plus the dates]
18. **Evidence for smaller builds.** The brief says every entry links to its evidence. Do the security node, the synthesiser, the vocabulary app and the Claude skills have repos, photos or videos I can link? [entries without evidence are listed plainly, with no link]

## About the domain (details in SITE_INVENTORY.md)

19. `/Page-2.html`, an old Nicepage copy of the homepage: replace it with a pointer to `/`, or keep it byte-identical? [replace, then remove the Nicepage CSS/JS/vendor files]
20. `/hackathon/`, the outdated wireframe: replace it with a page linking to gvhackathon.com, keep it, or delete it? [replace with a link page]
21. `/IEEEv39.pdf`, the LoRa paper: stays live and unlinked, as the brief says. Should it be on the site after all? [unlinked]
22. `/jlec-form/dash.html` is publicly reachable. Is that intended? [left untouched]
23. Is anything else served from worldwiderad.com that is not in this repo? [assumed no]
24. **Name on the CV page.** Your paper uses "Radoslaw Green". If your applications use Radoslaw, the CV page could say "Radoslaw (Radek) Green" so readers can match it to your file. [Radek Green everywhere, as the brief says]
