#!/usr/bin/env python3
"""Check static HTML metadata and local file references without third-party packages."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlparse


REFERENCE_ATTRIBUTES = {
    "a": "href",
    "link": "href",
    "script": "src",
    "img": "src",
    "iframe": "src",
    "source": "src",
    "video": "src",
    "audio": "src",
    "track": "src",
    "object": "data",
    "image": "href",
}


class DocumentAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang = ""
        self.has_viewport = False
        self.images_without_alt: list[int] = []
        self.references: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        line = self.getpos()[0]

        if tag == "html":
            self.lang = attributes.get("lang") or ""
        elif tag == "meta" and (attributes.get("name") or "").lower() == "viewport":
            self.has_viewport = True
        elif tag == "img" and "alt" not in attributes:
            self.images_without_alt.append(line)

        reference_attribute = REFERENCE_ATTRIBUTES.get(tag)
        if reference_attribute:
            reference = attributes.get(reference_attribute)
            if reference:
                self.references.append((reference, line))
        if tag in ("img", "source"):
            srcset = attributes.get("srcset") or ""
            if not srcset.strip().lower().startswith("data:"):
                for candidate in srcset.split(","):
                    reference = candidate.strip().split(maxsplit=1)[0] if candidate.strip() else ""
                    if reference:
                        self.references.append((reference, line))


CSS_URL = re.compile(r"url\(\s*(?:'([^']*)'|\"([^\"]*)\"|([^)]*?))\s*\)", re.IGNORECASE)


def _resolve_case_sensitive(root: Path, page: Path, url_path: str) -> Path | None:
    if not url_path:
        return page

    current = root if url_path.startswith("/") else page.parent
    for part in PurePosixPath(url_path.lstrip("/")).parts:
        if part in ("", "."):
            continue
        if part == "..":
            if current == root:
                return None
            current = current.parent
            continue
        if not current.is_dir():
            return None
        match = next((child for child in current.iterdir() if child.name == part), None)
        if match is None:
            return None
        current = match
    return current


def _check_reference(root: Path, source_file: Path, reference: str, line: int) -> str | None:
    parsed = urlparse(reference)
    if parsed.scheme or reference.startswith("//"):
        return None

    target = _resolve_case_sensitive(root, source_file, unquote(parsed.path))
    relative_file = source_file.relative_to(root).as_posix()
    if target is None:
        return f"{relative_file}:{line}: local target not found: {reference}"
    if target.is_dir() and _resolve_case_sensitive(root, target / "index.html", "index.html") is None:
        return f"{relative_file}:{line}: directory has no index.html: {reference}"
    if not target.exists():
        return f"{relative_file}:{line}: local target not found: {reference}"
    return None


def _visible_files(root: Path, suffix: str) -> list[Path]:
    return sorted(
        path for path in root.rglob(f"*{suffix}")
        if not any(part.startswith(".") for part in path.relative_to(root).parts)
    )


def check_site(root: Path) -> tuple[list[str], int]:
    root = root.resolve()
    errors: list[str] = []
    pages = _visible_files(root, ".html")

    for page in pages:
        relative_page = page.relative_to(root).as_posix()
        try:
            source = page.read_text(encoding="utf-8")
        except UnicodeDecodeError as error:
            errors.append(f"{relative_page}: HTML is not valid UTF-8 ({error})")
            continue

        audit = DocumentAudit()
        audit.feed(source)

        if not audit.lang.strip():
            errors.append(f"{relative_page}: <html> must have a non-empty lang attribute")
        if not audit.has_viewport and "tests" not in page.relative_to(root).parts:
            errors.append(f"{relative_page}: add a viewport meta tag to this page")
        for line in audit.images_without_alt:
            errors.append(f"{relative_page}:{line}: <img> must have an alt attribute")

        for reference, line in audit.references:
            error = _check_reference(root, page, reference, line)
            if error:
                errors.append(error)

    for stylesheet in _visible_files(root, ".css"):
        relative_stylesheet = stylesheet.relative_to(root).as_posix()
        try:
            source = stylesheet.read_text(encoding="utf-8")
        except UnicodeDecodeError as error:
            errors.append(f"{relative_stylesheet}: CSS is not valid UTF-8 ({error})")
            continue
        for match in CSS_URL.finditer(source):
            reference = next((value for value in match.groups() if value is not None), "").strip()
            if not reference:
                continue
            line = source.count("\n", 0, match.start()) + 1
            error = _check_reference(root, stylesheet, reference, line)
            if error:
                errors.append(error)

    return errors, len(pages)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors, page_count = check_site(root)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        print(f"Site check failed: {len(errors)} issue(s) in {page_count} HTML files.", file=sys.stderr)
        return 1

    print(f"Site check passed: {page_count} HTML files; metadata, image alternatives, and local references are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
