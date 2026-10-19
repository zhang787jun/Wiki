"""Build a same-origin full-text index from the actual public catalog.

No private repository, unpublished source, or third-party service is queried.
The JSON is fetched only when the reader opens search.
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

import yaml

from check_pages_build import CatalogLinks


class ArticleText(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__()
        self.stack = []
        self.title = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag not in self.VOID:
            self.stack.append((tag, attrs.get("id", "")))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if any(tag in {"script", "style"} for tag, _ in self.stack):
            return
        if any(id_ == "title" for _, id_ in self.stack):
            self.title.append(data)
        if any(id_ == "content" for _, id_ in self.stack):
            self.text.append(data)


def build():
    config = yaml.safe_load(Path("_config.yml").read_text(encoding="utf-8"))
    output = Path(config.get("destination", "output"))
    root = config.get("root", "").rstrip("/")
    catalog = CatalogLinks()
    catalog.feed((output / "index.html").read_text(encoding="utf-8"))
    pages = []
    seen = set()
    for url in sorted(catalog.urls):
        parts = urlsplit(url)
        if parts.scheme or parts.netloc:
            continue
        path = unquote(parts.path)
        if not path.startswith(root + "/") or not path.endswith(".html"):
            continue
        relative = path[len(root) + 1:]
        if relative in seen or relative == "index.html":
            continue
        seen.add(relative)
        target = output / relative
        if not target.resolve().is_relative_to(output.resolve()):
            raise SystemExit("Catalog path escapes output directory")
        article = ArticleText()
        article.feed(target.read_text(encoding="utf-8"))
        title = "".join(article.title).strip()
        if not title:
            raise SystemExit(f"Missing article title: {relative}")
        pages.append({"title": title, "url": root + "/" + quote(relative, safe="/"),
                      "category": str(Path(relative).parent),
                      "text": re.sub(r"\s+", " ", " ".join(article.text)).strip()})
    if not pages:
        raise SystemExit("Refusing to publish an empty search index")
    destination = output / "static/data/search-index.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps({"version": 1, "pages": pages}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Indexed {len(pages)} public articles ({destination.stat().st_size:,} bytes).")


if __name__ == "__main__":
    build()
