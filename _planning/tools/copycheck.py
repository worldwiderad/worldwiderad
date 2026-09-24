#!/usr/bin/env python3
"""Flag style-guide problems in the text of one or more HTML pages.

Checks visible text, alt text, title, meta description and Open Graph text
against the banned vocabulary and structures in _planning/AI_TELLS.md.

Usage: python3 _planning/tools/copycheck.py page.html [more.html ...]
"""
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

WORDS_FILE = Path(__file__).with_name("banned-words.txt")

STRUCTURES = [
    (r"—", "em dash"),
    (r"\s–\s", "spaced en dash used as a dash (en dash is only for ranges)"),
    (r"\b(?:it|this|that)(?:'s| is| was)(?: not|n't) (?:just |only |merely |about )?[^.;:!?]{1,60}[,;:.] (?:it|this|that)(?:'s| is| was)\b", "contrastive reframe (it's not X, it's Y)"),
    (r"\bnot (?:just|only|merely) [^.;!?]{1,60}\bbut\b", "not just X but Y"),
    (r"\b(?:isn't|aren't|wasn't) (?:just|only|merely|about)\b", "isn't just / isn't about"),
    (r"\bwhether you(?:'re| are)\b", "whether you're X or Y"),
    (r"\bfrom [^.;]{1,40} to [^.;]{1,40}\b(?:and everything|,? and beyond)", "false range"),
    (r"\?\s+[A-Z][^.?!]{0,60}\.", "question followed by an answer (check it is not rhetorical)"),
    (r"\b(?:here's the thing|here's why|let's|let me)\b", "pedagogical or conversational opener"),
    (r"\b(?:in (?:a|today's) world|in an era|in the age of)\b", "era opener"),
    (r"\b(?:passionate about|at the intersection of|lifelong learner|journey)\b", "portfolio cliché"),
    (r"[\U0001F300-\U0001FAFF☀-➿]", "emoji or pictograph"),
    (r"\b(?:in (?:short|summary|conclusion)|to sum up|ultimately|all in all)\b", "summary signpost"),
]


class TextGrabber(HTMLParser):
    SKIP = {"script", "style", "noscript", "template", "svg"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.chunks = []  # (kind, text)
        self.li_first = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.depth += 1
        if tag == "img" and a.get("alt"):
            self.chunks.append(("alt", a["alt"]))
        if tag == "meta" and a.get("content") and (
            a.get("name") in ("description", "twitter:title", "twitter:description")
            or a.get("property", "").startswith("og:")
        ):
            self.chunks.append(("meta", a["content"]))
        if a.get("aria-label"):
            self.chunks.append(("aria", a["aria-label"]))
        if a.get("title"):
            self.chunks.append(("title-attr", a["title"]))
        if tag == "li":
            self.li_first = True
        elif self.li_first and tag in ("strong", "b"):
            self.chunks.append(("structure", "bold-first list item"))
            self.li_first = False

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.depth:
            self.depth -= 1

    def handle_data(self, data):
        if self.depth:
            return
        if data.strip():
            self.li_first = False
            self.chunks.append(("text", data))


def load_words():
    words, allowed = [], []
    if WORDS_FILE.exists():
        for line in WORDS_FILE.read_text().splitlines():
            line = line.split("#", 1)[0].strip()
            if line.startswith("!"):
                allowed.append(line[1:].strip())
            elif line:
                words.append(line)
    return words, allowed


def check(path):
    src = Path(path).read_text(encoding="utf-8")
    g = TextGrabber()
    g.feed(src)
    text = " ".join(t for k, t in g.chunks if k != "structure")
    text = re.sub(r"\s+", " ", html.unescape(text))
    problems = [("structure", s) for k, s in g.chunks if k == "structure"]
    words, allowed = load_words()
    for a in allowed:
        text = re.sub(re.escape(a), "", text, flags=re.I)
    for w in words:
        pat = r"\b" + re.escape(w).replace(r"\ ", r"\s+") + r"\w*"
        for m in re.finditer(pat, text, re.I):
            problems.append(("word", f"{w!r} in: …{text[max(0, m.start()-40):m.end()+40]}…"))
    for pat, label in STRUCTURES:
        for m in re.finditer(pat, text, re.I):
            problems.append(("pattern", f"{label}: …{text[max(0, m.start()-50):m.end()+30]}…"))
    # three-item lists joined by commas and "and", a common rhythm device
    for m in re.finditer(r"\b(\w+(?: \w+)?), (\w+(?: \w+)?),? and (\w+(?: \w+)?)\b", text):
        problems.append(("triad?", f"check three-item list: {m.group(0)}"))
    return problems


if __name__ == "__main__":
    total = 0
    for p in sys.argv[1:]:
        found = check(p)
        total += len(found)
        print(f"== {p}: {len(found)} flag(s)")
        for kind, msg in found:
            print(f"  [{kind}] {msg}")
    sys.exit(1 if total else 0)
