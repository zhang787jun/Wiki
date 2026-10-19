"""Fail a Pages build if the catalog or its local links/assets are missing."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml


class CatalogLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.urls.add(value)


def main():
    config = yaml.safe_load(Path("_config.yml").read_text(encoding="utf-8"))
    output = Path(config.get("destination", "output"))
    root = config.get("root", "").rstrip("/")
    index = output / "index.html"
    if not index.is_file() or not index.stat().st_size:
        raise SystemExit("Missing or empty generated index.html")
    parser = CatalogLinks()
    parser.feed(index.read_text(encoding="utf-8"))
    missing = []
    pages = set()
    for url in parser.urls:
        parts = urlsplit(url)
        if parts.scheme or parts.netloc or not parts.path:
            continue
        path = unquote(parts.path)
        if path.startswith("/"):
            if root and not (path == root or path.startswith(root + "/")):
                missing.append(f"URL outside configured Pages root: {url}")
                continue
            path = path[len(root):].lstrip("/")
        target = output / path
        if not target.exists():
            missing.append(url)
        elif target.is_file() and target.suffix == ".html":
            pages.add(target)
    if not pages:
        missing.append("Catalog contains no generated page links")
    if not (output / ".nojekyll").is_file():
        missing.append("Missing .nojekyll marker")
    if missing:
        raise SystemExit("Invalid Pages artifact:\n" + "\n".join(sorted(missing)))
    print(f"Validated catalog, {len(pages)} page links, and local catalog assets.")


if __name__ == "__main__":
    main()
