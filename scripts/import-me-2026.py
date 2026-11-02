#!/usr/bin/env python3
"""One-off import of the old site's content (github.com/ninest/me-2026) into the miscfs content root.

Usage: python3 -I scripts/import-me-2026.py <me-2026 checkout> <output dir>

Layout written:
  posts/<year>/<slug>.md, or posts/<year>/<slug>/index.md plus its images
  micro/<year>/<slug>.md (same folder form when it has images)
  collections/<slug>.md, projects/<slug>, work/<slug>, tools/<slug>, categories/<slug>, pages/<slug>
  site.md (links + status, from links.json / status.json)

Internal links to imported pages become [[page/path|label]]; /images/... references become
attachments beside the page. Everything it could not map is printed at the end.
"""
import datetime as dt
import json
import re
import shutil
import sys
import urllib.parse
from pathlib import Path

import yaml

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
C = SRC / "parthkabra-me"
PUBLIC = SRC / "public"

notes: list[str] = []


# ---------- frontmatter ----------

def split(text: str):
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    return yaml.safe_load(m.group(1)) or {}, m.group(2)


DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATETIME = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$")


def normalize_dates(fm: dict) -> dict:
    for k, v in fm.items():
        if isinstance(v, str) and DATE.match(v):
            fm[k] = dt.date.fromisoformat(v)
        elif isinstance(v, str) and DATETIME.match(v):
            fm[k] = dt.datetime.fromisoformat(v)
    return fm


class Dumper(yaml.SafeDumper):
    pass


Dumper.add_representer(dt.date, lambda d, v: d.represent_scalar("tag:yaml.org,2002:timestamp", v.isoformat()))
Dumper.add_representer(dt.datetime, lambda d, v: d.represent_scalar("tag:yaml.org,2002:timestamp", v.isoformat()))


def render(fm: dict, body: str) -> str:
    head = yaml.dump(fm, Dumper=Dumper, sort_keys=False, allow_unicode=True, width=10_000, default_flow_style=False)
    return f"---\n{head}---\n{body if body.startswith(chr(10)) else chr(10) + body}"


def year_of(v) -> int:
    if isinstance(v, (dt.date, dt.datetime)):
        return v.year
    return int(str(v)[:4])


# ---------- collect pages ----------

class Page:
    def __init__(self, src: Path, dest: str, old_urls: list[str], kind: str):
        self.src, self.dest, self.old_urls, self.kind = src, dest, old_urls, kind
        self.fm, self.body = split(src.read_text())
        normalize_dates(self.fm)
        self.attachments: dict[str, Path] = {}  # file name in page folder -> source file


pages: list[Page] = []

for f in sorted((C / "posts").glob("*/*.md")):
    folder_cat, slug = f.parent.name, f.stem
    p = Page(f, "", [f"/{folder_cat}/{slug}"], "post")
    cats = p.fm.get("categories") or []
    if not cats or cats[0] != folder_cat:
        notes.append(f"{f.relative_to(C)}: first category {cats[:1]} != folder {folder_cat}; moved {folder_cat} first to keep its URL")
        p.fm["categories"] = [folder_cat] + [c for c in cats if c != folder_cat]
    p.dest = f"posts/{year_of(p.fm['createdAt'])}/{slug}"
    pages.append(p)

for f in sorted((C / "microblog").glob("*/*.md")):
    p = Page(f, "", [f"/micro/{f.parent.name}/{f.stem}"], "micro")
    p.dest = f"micro/{year_of(p.fm['createdAt'])}/{f.stem}"
    pages.append(p)

for folder, dest, urls in [
    ("projects", "projects", ["/projects/{}", "/project/{}"]),
    ("work-experience", "work", ["/work/{}"]),
    ("tools", "tools", ["/tools/{}"]),
    ("categories", "categories", []),
]:
    for f in sorted((C / folder).glob("*.md")):
        pages.append(Page(f, f"{dest}/{f.stem}", [u.format(f.stem) for u in urls], folder))

for f in sorted((C / "pages").glob("*.md")):
    pages.append(Page(f, f"pages/{f.stem}", [f"/{f.stem}"], "page"))
for f in sorted((C / "pages" / "collection").glob("*.md")):
    pages.append(Page(f, f"collections/{f.stem}", [f"/collection/{f.stem}"], "collection"))

# Post slugs must stay unique across years: the URL is /<first category>/<slug>.
seen: dict[str, str] = {}
for p in pages:
    if p.kind == "post":
        slug = p.dest.rsplit("/", 1)[1]
        assert slug not in seen, f"duplicate post slug {slug}"
        seen[slug] = p.dest

url_to_page: dict[str, str] = {}
for p in pages:
    for u in p.old_urls:
        url_to_page[u] = p.dest
# The old site renamed this post; links to its old slug were left behind.
url_to_page["/blog/better-university-website"] = "posts/2021/husker-0"
by_dest = {p.dest: p for p in pages}
assert "posts/2021/husker-0" in by_dest

# ---------- categories: fold supercats in as `group` ----------

groups = []
for f in sorted((C / "supercats").glob("*.md")):
    fm, _ = split(f.read_text())
    groups.append({"slug": f.stem, "title": fm["title"], "description": fm.get("description", ""), "order": fm.get("order")})
    for cat in fm.get("categories", []):
        target = by_dest.get(f"categories/{cat}")
        if target is None:
            notes.append(f"supercat {f.stem} lists unknown category {cat}")
        else:
            target.fm["group"] = f.stem

used_cats = {c for p in pages for c in (p.fm.get("categories") or [])}
MISSING_CATEGORY_TITLES = {"obsidian": "Obsidian"}
for c in sorted(used_cats - {p.dest.split("/")[1] for p in pages if p.kind == "categories"}):
    title = MISSING_CATEGORY_TITLES.get(c)
    assert title, f"category {c} is used but has no categories/{c}.md"
    notes.append(f"category {c} was used but had no page; created categories/{c}")
    p = Page.__new__(Page)
    p.src, p.dest, p.old_urls, p.kind = None, f"categories/{c}", [], "categories"
    p.fm, p.body, p.attachments = {"title": title, "group": "tech"}, "", {}
    pages.append(p)
    by_dest[p.dest] = p


# ---------- body rewriting (outside fenced code) ----------

FENCE = re.compile(r"^(\s*)(`{3,}|~{3,})")


def map_prose(body: str, fn) -> str:
    """Apply fn to prose lines: outside fences, and inside ```component:alert bodies (which are markdown)."""
    out, stack = [], []  # stack of (fence, is_alert)

    def closes(line, m, fence):
        return m and m.group(2)[0] == fence[0] and len(m.group(2)) >= len(fence) and line.strip() == m.group(2)

    for line in body.split("\n"):
        m = FENCE.match(line)
        if stack and not stack[-1][1]:  # inside code
            if closes(line, m, stack[-1][0]):
                stack.pop()
            out.append(line)
        elif m:
            if stack and closes(line, m, stack[-1][0]):
                stack.pop()
            else:
                stack.append((m.group(2), line[m.end():].strip().startswith("component:alert")))
            out.append(line)
        else:
            out.append(fn(line))
    return "\n".join(out)


IMG = re.compile(r"(!\[[^\]]*\])\((/images/[^)\s]+)((?:\s+\"[^\"]*\")?)\)")
LINK = re.compile(r"(?<!!)\[([^\]]+)\]\((/[^)\s#]*)(#[^)\s]*)?\)")


def attach(p: Page, url: str) -> str | None:
    path = urllib.parse.unquote(url)
    src = PUBLIC / path.lstrip("/")
    if not src.is_file():
        return None
    name = src.name.replace(" ", "-")
    if name in p.attachments and p.attachments[name] != src:
        name = f"{src.parent.name}-{name}"
    p.attachments[name] = src
    return name


def rewrite_line(p: Page, line: str) -> str:
    def img(m):
        name = attach(p, m.group(2))
        if name is None:
            notes.append(f"{p.dest}: image {m.group(2)} not found in public/, left as is")
            return m.group(0)
        return f"{m.group(1)}({name}{m.group(3)})"

    def link(m):
        label, url, anchor = m.group(1), m.group(2), m.group(3) or ""
        target = url_to_page.get(url.rstrip("/") or "/")
        if target is None:
            notes.append(f"{p.dest}: link {url} is not an imported page, left as is")
            return m.group(0)
        if "|" in label or "]" in label:
            notes.append(f"{p.dest}: link label {label!r} can't be a [[link]] label, left as is")
            return m.group(0)
        return f"[[{target}{anchor}|{label}]]"

    # Skip matches that start inside a code span; a code span inside a link label is fine.
    spans = [m.span() for m in re.finditer(r"(`+)(.+?)\1", line)]
    in_code = lambda m: any(a <= m.start() < b for a, b in spans)
    line = IMG.sub(lambda m: m.group(0) if in_code(m) else img(m), line)
    spans = [m.span() for m in re.finditer(r"(`+)(.+?)\1", line)]
    return LINK.sub(lambda m: m.group(0) if in_code(m) else link(m), line)


for p in pages:
    p.body = map_prose(p.body, lambda line, p=p: rewrite_line(p, line))

# Images that sat in a page's old image folder but that no page referenced: keep them with that page.
image_dirs = {
    "posts/blog/creating-a-driving-app-with-appshelf": "posts/2026/creating-a-driving-app-with-appshelf",
    "projects/husker": "projects/husker",
}
referenced = {src for p in pages for src in p.attachments.values()}
for f in sorted((PUBLIC / "images").rglob("*")):
    if f.is_file() and f not in referenced:
        rel = str(f.parent.relative_to(PUBLIC / "images"))
        dest = image_dirs.get(rel)
        if dest is None or dest not in by_dest:
            notes.append(f"unreferenced image {f.relative_to(PUBLIC)} not imported")
            continue
        by_dest[dest].attachments[f.name.replace(" ", "-")] = f
        notes.append(f"unreferenced image {f.relative_to(PUBLIC)} kept as an attachment of {dest}")

# ---------- frontmatter fix-ups ----------

for p in pages:
    fm = p.fm
    if p.kind == "micro":
        for key in ("thread", "inReplyTo"):
            v = fm.get(key)
            if isinstance(v, str) and v.startswith("microblog:"):
                target = f"micro/{v.split(':', 1)[1]}"
                if target not in by_dest:
                    notes.append(f"{p.dest}: {key} {v} has no page")
                else:
                    fm[key] = f"[[{target}]]"
    if isinstance(fm.get("icon"), str) and fm["icon"].startswith("/icons/"):
        src = PUBLIC / fm["icon"].lstrip("/")
        p.attachments[src.name] = src
        fm["icon"] = src.name
        theme_variant = src.with_name(f"{src.stem}-white{src.suffix}")
        if theme_variant.is_file():
            p.attachments[theme_variant.name] = theme_variant

# ---------- write ----------

if OUT.exists():
    shutil.rmtree(OUT)
for p in pages:
    if p.attachments:
        md = OUT / p.dest / "index.md"
    else:
        md = OUT / f"{p.dest}.md"
    md.parent.mkdir(parents=True, exist_ok=True)
    md.write_text(render(p.fm, p.body))
    for name, src in p.attachments.items():
        shutil.copy2(src, md.parent / name)

(OUT / "categories").mkdir(exist_ok=True)
(OUT / "categories" / "index.md").write_text(render(
    {"title": "Categories", "groups": sorted(groups, key=lambda g: g["order"] or 99)},
    "\nEach category page's `group` names one of the groups above.\n"))

links = json.loads((C / "links.json").read_text())
status = json.loads((C / "status.json").read_text())
(OUT / "site.md").write_text(render(
    {"title": "Site", "status": status[0]["status"] if status else "",
     "links": [{"title": l["title"], "url": l["url"]} for l in sorted(links, key=lambda l: l.get("order", 0))]},
    "\nSite-wide settings: the status line and the profile links, in order.\n"))

print(f"wrote {len(pages)} pages, {sum(len(p.attachments) for p in pages)} attachments to {OUT}")
for n in notes:
    print("NOTE", n)
