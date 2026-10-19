"""Verify the generated search/catalog contract and required reader assets."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml

from check_pages_build import CatalogLinks


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.viewport = False
        self.language = False
        self.main = False
        self.ids = set()
        self.assets = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.language = a.get("lang") == "zh-CN"
        if tag == "meta" and a.get("name") == "viewport":
            self.viewport = "width=device-width" in a.get("content", "")
        if tag == "main":
            self.main = True
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "script" and a.get("src"):
            self.assets.append(a["src"])
        if tag == "link" and a.get("rel") in {"stylesheet", "icon"}:
            self.assets.append(a["href"])


def main():
    config = yaml.safe_load(Path("_config.yml").read_text(encoding="utf-8"))
    output = Path(config.get("destination", "output"))
    root = config.get("root", "").rstrip("/")
    data = json.loads((output / "static/data/search-index.json").read_text())
    assert data["version"] == 1
    indexed = set()
    for item in data["pages"]:
        parts = urlsplit(item["url"])
        assert not parts.scheme and not parts.netloc
        assert parts.path.startswith(root + "/")
        target = output / unquote(parts.path[len(root) + 1:])
        assert target.is_file(), f"Missing indexed page: {target}"
        assert item["title"].strip() and isinstance(item["text"], str)
        assert item["url"] not in indexed, "Duplicate index record"
        indexed.add(item["url"])
        reader = Page()
        reader.feed(target.read_text(encoding="utf-8"))
        assert reader.viewport and reader.language and reader.main, f"Reader shell missing: {target}"
        assert {"content", "title", "article-toc", "search-input", "main"} <= reader.ids
        for asset in reader.assets:
            path = urlsplit(asset).path
            if path.startswith(root + "/"):
                assert (output / path[len(root) + 1:]).is_file(), f"Missing asset: {asset}"
    catalog = CatalogLinks()
    catalog.feed((output / "index.html").read_text(encoding="utf-8"))
    catalog_pages = {unquote(urlsplit(url).path) for url in catalog.urls if url.startswith(root + "/") and urlsplit(url).path.endswith(".html")}
    assert catalog_pages == {unquote(url) for url in indexed}, "Catalog and full-text index differ"
    print(f"Verified {len(indexed)} readers, search records, URLs, responsive metadata and local assets.")


if __name__ == "__main__":
    main()
